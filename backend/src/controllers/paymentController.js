const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Voucher = require('../models/Voucher');
const UserVoucher = require('../models/UserVoucher');
const Promotion = require('../models/Promotion');
const ticketController = require('./ticketController');
const catchAsync = require('../utils/catchAsync');
const {
  POINTS_PER_VND,
  VIP_THRESHOLD,
  VVIP_THRESHOLD
} = require('../config/constants');

/**
 * Phase 3: Reserve promotion quota khi order vào PROCESSING (idempotent)
 * P0-1 Fix: Dùng state machine để track đúng trạng thái reserve
 */
async function reservePromotionQuota(orderId) {
  // 1) Lock order - chỉ process nếu NONE (chưa reserve)
  const order = await Order.findOne({
    _id: orderId,
    promotionId: { $ne: null },
    promotionReserveState: 'NONE'
  });

  if (!order) return; // Đã reserve hoặc không có promotion

  try {
    // 2) Atomic quota increment với limit check
    const updated = await Promotion.findOneAndUpdate(
      {
        _id: order.promotionId,
        $or: [
          { totalRedeemsLimit: null },
          { totalRedeemsLimit: { $exists: false } },
          { $expr: { $lt: ['$redeemCount', '$totalRedeemsLimit'] } }
        ]
      },
      { $inc: { redeemCount: 1 } },
      { new: true }
    );

    if (updated) {
      // 3a) Reserve thành công - set RESERVED
      await Order.findByIdAndUpdate(orderId, { promotionReserveState: 'RESERVED' });
      console.log(`[Promotion Quota] Reserved for order ${orderId}, promotion ${order.promotionId}`);
    } else {
      // 3b) Quota hết - set EXCEEDED (soft cap, order vẫn có discount)
      await Order.findByIdAndUpdate(orderId, { promotionReserveState: 'EXCEEDED' });
      console.warn(`[Promotion Quota] Exceeded for promotion ${order.promotionId}, order ${orderId}`);
    }
  } catch (err) {
    console.error('[Promotion Quota] Error:', err.message);
    // Set FAILED để có thể retry sau
    await Order.findByIdAndUpdate(orderId, { promotionReserveState: 'FAILED' });
  }
}

/**
 * Helper consume voucher sau khi thanh toán thành công (idempotent)
 * Chỉ trừ lượt voucher khi VNPay SUCCESS, không trừ ở createOrder
 */
async function consumeVoucherAfterPaid(orderId) {
  // 1) Lock order để chống consume trùng (Return + IPN + retry)
  const lockedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      voucherCode: { $ne: null },
      voucherConsumed: { $ne: true },
      voucherConsumeState: { $in: [null, undefined, 'NONE', 'FAILED'] }
    },
    {
      $set: { voucherConsumeState: 'LOCKED' }
    },
    { new: true }
  );

  if (!lockedOrder) return; // đã consume hoặc không có voucher

  // 2) Validate data liên kết
  if (!lockedOrder.voucherId || !lockedOrder.userVoucherId) {
    await Order.findByIdAndUpdate(orderId, { $set: { voucherConsumeState: 'FAILED' } });
    return;
  }

  try {
    const uv = await UserVoucher.findById(lockedOrder.userVoucherId);

    if (!uv) throw new Error('UserVoucher not found');

    // check ownership
    if (uv.userId.toString() !== lockedOrder.userId.toString()) throw new Error('UserVoucher user mismatch');
    if (uv.voucherId.toString() !== lockedOrder.voucherId.toString()) throw new Error('UserVoucher voucher mismatch');

    // check still usable
    if (uv.status !== 'ACTIVE') throw new Error('UserVoucher not ACTIVE');
    if (uv.usedCount >= uv.quantity) throw new Error('UserVoucher exhausted');
    if (uv.expiresAt && new Date() > uv.expiresAt) throw new Error('UserVoucher expired');

    // 3) Atomic +1 usedCount (CAS theo usedCount hiện tại để chống race nhiều order cùng lúc)
    let updated = await UserVoucher.findOneAndUpdate(
      { _id: uv._id, status: 'ACTIVE', usedCount: uv.usedCount },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    // retry 1 lần nếu có race
    if (!updated) {
      const fresh = await UserVoucher.findById(uv._id);
      if (!fresh || fresh.status !== 'ACTIVE' || fresh.usedCount >= fresh.quantity) {
        throw new Error('UserVoucher exhausted after race');
      }
      updated = await UserVoucher.findOneAndUpdate(
        { _id: fresh._id, status: 'ACTIVE', usedCount: fresh.usedCount },
        { $inc: { usedCount: 1 } },
        { new: true }
      );
      if (!updated) throw new Error('CAS update failed');
    }

    // nếu hết lượt thì set EXHAUSTED
    if (updated.usedCount >= updated.quantity && updated.status !== 'EXHAUSTED') {
      updated.status = 'EXHAUSTED';
      await updated.save();
    }

    // 4) Tăng usageCount voucher global (P0-C Fix: enforce usageLimit)
    const voucherUpdated = await Voucher.findOneAndUpdate(
      {
        _id: lockedOrder.voucherId,
        status: 'ACTIVE',
        $expr: { $lt: ['$usageCount', '$usageLimit'] }
      },
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!voucherUpdated) {
      console.warn('[Voucher Consume] Voucher usageLimit exceeded, skipping global count');
    }

    // 5) Mark order consumed DONE
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        voucherConsumed: true,
        voucherConsumeState: 'DONE',
        voucherConsumedAt: new Date()
      }
    });

    console.log('[Voucher Consume] SUCCESS for order:', orderId);

  } catch (err) {
    console.error('[Voucher Consume] FAILED:', err.message);
    await Order.findByIdAndUpdate(orderId, { $set: { voucherConsumeState: 'FAILED' } });
  }
}

// 1. HÀM SẮP XẾP & MÃ HÓA
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

/**
 * Tạo URL thanh toán VNPay
 * @route POST /api/v1/payments/create_payment_url
 * @desc Tạo đường dẫn thanh toán để redirect người dùng sang VNPay
 */
exports.createPaymentUrl = (req, order) => {
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5000/api/v1/payments/vnpay_return';

  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');

  const ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = String(order.orderNo);
  vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang ${order.orderNo}`;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = Math.floor(order.totalAmount * 100);
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = '113.160.92.202'; // Hardcode IP public để tránh lỗi Sandbox
  vnp_Params['vnp_CreateDate'] = createDate;

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  vnp_Params['vnp_SecureHash'] = signed;

  let paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });
  return paymentUrl;
};

/**
 * Xử lý IPN (Instant Payment Notification) từ VNPay
 * @route GET /api/v1/payments/vnpay_ipn
 * @desc Nhận thông báo kết quả thanh toán từ VNPay, kiểm tra chữ ký và cập nhật trạng thái đơn hàng
 */
exports.vnpayIpn = catchAsync(async (req, res, next) => {
  let vnp_Params = req.query;
  let secureHash = vnp_Params['vnp_SecureHash'];

  let orderId = vnp_Params['vnp_TxnRef'];
  let rspCode = vnp_Params['vnp_ResponseCode'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  const secretKey = process.env.VNP_HASH_SECRET;

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  if (secureHash === signed) {
    const originalOrderNo = req.query.vnp_TxnRef;
    const amount = parseInt(req.query.vnp_Amount) / 100;

    //Lock giống Return để tránh double finalize
    const order = await Order.findOneAndUpdate(
      {
        orderNo: originalOrderNo,
        status: { $in: ['PENDING', 'PROCESSING'] }
      },
      {
        $set: {
          status: 'PROCESSING',
          processedAt: new Date()
        }
      },
      { new: false }
    );

    if (!order) {
      // Check xem order có tồn tại và đã PAID chưa
      const existingOrder = await Order.findOne({ orderNo: originalOrderNo });
      if (!existingOrder) {
        return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
      }
      if (existingOrder.status === 'PAID') {
        return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
      }
      return res.status(200).json({ RspCode: '02', Message: 'Order already processed' });
    }

    if (order.totalAmount !== amount) {
      return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
    }

    if (rspCode === '00') {
      // Phase 3: Reserve promotion quota ngay khi PROCESSING
      await reservePromotionQuota(order._id);

      await ticketController.finalizeTransaction(order);

      //consume voucher sau khi PAID (idempotent)
      await consumeVoucherAfterPaid(order._id);

      // P0-3 Fix: Upsert để tránh duplicate khi IPN + Return đều fire
      await Payment.findOneAndUpdate(
        { txnRef: originalOrderNo },
        {
          $setOnInsert: {
            orderId: order._id,
            gateway: 'VNPAY',
            txnRef: originalOrderNo,
            amount: amount
          },
          $set: {
            bankTranNo: req.query.vnp_BankTranNo,
            state: 'SUCCESS',
            rawPayload: req.query
          }
        },
        { upsert: true, new: true }
      );

      // LOYALTY LOGIC
      try {
        const User = require('../models/User');
        const user = await User.findById(order.userId);
        if (user) {
          // Tính điểm thưởng dựa trên số tiền thanh toán
          const pointsEarned = Math.floor(amount / POINTS_PER_VND);
          user.points += pointsEarned;

          // Rank Upgrade Logic
          if (user.points >= VVIP_THRESHOLD) user.rank = 'VVIP';
          else if (user.points >= VIP_THRESHOLD) user.rank = 'VIP';
          else user.rank = 'MEMBER';

          await user.save();
        }
      } catch (err) {
        console.error('Loyalty Error:', err);
      }

      return res.status(200).json({ RspCode: '00', Message: 'Success' });
    } else {
      // FAILED: Dùng CAS để tránh set FAILED khi đã PAID
      await Order.findOneAndUpdate(
        {
          orderNo: originalOrderNo,
          status: { $in: ['PENDING', 'PROCESSING'] }
        },
        { $set: { status: 'FAILED' } }
      );
      // P0-3 Fix: Upsert
      await Payment.findOneAndUpdate(
        { txnRef: originalOrderNo },
        {
          $setOnInsert: {
            orderId: order._id,
            gateway: 'VNPAY',
            txnRef: originalOrderNo,
            amount: amount
          },
          $set: {
            state: 'FAIL',
            rawPayload: req.query
          }
        },
        { upsert: true }
      );
      return res.status(200).json({ RspCode: '00', Message: 'Success' });
    }
  } else {
    return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
  }
});

/**
 * Xử lý Return URL từ VNPay
 * @route GET /api/v1/payments/vnpay_return
 * @desc Xử lý kết quả thanh toán và redirect về frontend
 *
 * LƯU Ý: Trong môi trường localhost, IPN không hoạt động được (VNPay không thể reach localhost)
 * Nên ta xử lý payment ngay tại đây. Production nên dùng IPN làm source of truth.
 */
exports.vnpayReturn = catchAsync(async (req, res, next) => {
  const secretKey = process.env.VNP_HASH_SECRET;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  let vnp_Params = { ...req.query }; // Clone để tránh mutate original
  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  const orderNo = req.query.vnp_TxnRef;
  const responseCode = req.query.vnp_ResponseCode;
  const amount = parseInt(req.query.vnp_Amount) / 100; // VNPay gửi số tiền * 100

  if (secureHash === signed) {
    if (responseCode === '00') {
      // ========== THANH TOÁN THÀNH CÔNG ==========
      try {
        // ATOMIC UPDATE: Dùng findOneAndUpdate với điều kiện status='PENDING'
        // Nếu không tìm thấy = đã được xử lý bởi request khác
        const order = await Order.findOneAndUpdate(
          {
            orderNo: orderNo,
            status: 'PENDING' // Chỉ update nếu đang PENDING
          },
          {
            $set: {
              status: 'PROCESSING', // Đánh dấu đang xử lý
              processedAt: new Date()
            }
          },
          { new: false } // Trả về document TRƯỚC khi update
        );

        // Nếu không tìm thấy order với status PENDING
        if (!order) {
          // Kiểm tra xem order có tồn tại không
          const existingOrder = await Order.findOne({ orderNo });

          if (!existingOrder) {
            console.error('[VNPay Return] Order not found:', orderNo);
            return res.redirect(`${frontendUrl}/ket-qua-thanh-toan?status=error&message=order_not_found`);
          }

          // Order đã được xử lý (PROCESSING, PAID, hoặc FAILED)
          console.log('[VNPay Return] Order already processed:', orderNo, 'Status:', existingOrder.status);
          if (existingOrder.status === 'PAID' || existingOrder.status === 'PROCESSING') {
            return res.redirect(`${frontendUrl}/ket-qua-thanh-toan?status=success&orderNo=${orderNo}`);
          }
          return res.redirect(`${frontendUrl}/ket-qua-thanh-toan?status=error&message=order_already_processed`);
        }

        // Kiểm tra số tiền
        if (order.totalAmount !== amount) {
          console.error('[VNPay Return] Amount mismatch:', { expected: order.totalAmount, received: amount });
          // Rollback status
          await Order.findByIdAndUpdate(order._id, { status: 'PENDING', processedAt: null });
          return res.redirect(`${frontendUrl}/ket-qua-thanh-toan?status=error&message=amount_mismatch`);
        }

        // Phase 3: Reserve promotion quota ngay khi PROCESSING
        await reservePromotionQuota(order._id);

        // Xử lý đơn hàng: Tạo Ticket, cập nhật Order status thành PAID
        await ticketController.finalizeTransaction(order);

        // ✅ NEW: consume voucher sau khi PAID (idempotent)
        await consumeVoucherAfterPaid(order._id);

        // P0-3 Fix: Upsert Payment record
        await Payment.findOneAndUpdate(
          { txnRef: orderNo },
          {
            $setOnInsert: {
              orderId: order._id,
              gateway: 'VNPAY',
              txnRef: orderNo,
              amount: amount
            },
            $set: {
              bankTranNo: req.query.vnp_BankTranNo || '',
              state: 'SUCCESS',
              rawPayload: req.query
            }
          },
          { upsert: true, new: true }
        );

        // LOYALTY LOGIC - Cộng điểm thưởng (non-blocking)
        try {
          const User = require('../models/User');
          const user = await User.findById(order.userId);
          if (user) {
            const pointsEarned = Math.floor(amount / POINTS_PER_VND);
            user.points += pointsEarned;

            // Rank Upgrade
            if (user.points >= VVIP_THRESHOLD) user.rank = 'VVIP';
            else if (user.points >= VIP_THRESHOLD) user.rank = 'VIP';
            else user.rank = 'MEMBER';

            await user.save();
            console.log(`[Loyalty] User ${user.email} earned ${pointsEarned} points`);
          }
        } catch (loyaltyErr) {
          console.error('[Loyalty] Error:', loyaltyErr);
        }

        // Khi tạo Order, UserVoucher.usedCount đã được tăng lên
        // Không cần tạo VoucherUsage nữa

        console.log('[VNPay Return] Payment SUCCESS:', orderNo);
        return res.redirect(`${frontendUrl}/ket-qua-thanh-toan?status=success&orderNo=${orderNo}`);

      } catch (err) {
        // Xử lý trường hợp duplicate key (E11000) - ticket đã tồn tại
        if (err.code === 11000) {
          console.log('[VNPay Return] Duplicate ticket detected, treating as success:', orderNo);
          // Đảm bảo order status = PAID
          const existingOrder = await Order.findOneAndUpdate({ orderNo }, { status: 'PAID' }, { new: true });
          if (existingOrder) {
            // P1 Fix: Reserve quota nếu chưa
            await reservePromotionQuota(existingOrder._id);
            // P0-B Fix: Consume voucher nếu chưa consume
            await consumeVoucherAfterPaid(existingOrder._id);
          }
          return res.redirect(`${frontendUrl}/ket-qua-thanh-toan?status=success&orderNo=${orderNo}`);
        }
        console.error('[VNPay Return] Processing error:', err);
        // Rollback status nếu có lỗi
        await Order.findOneAndUpdate({ orderNo }, { status: 'PENDING', processedAt: null });
        return res.redirect(`${frontendUrl}/ket-qua-thanh-toan?status=error&message=processing_error`);
      }

    } else {
      // ========== THANH TOÁN THẤT BẠI/HỦY ==========
      console.log('[VNPay Return] Payment FAILED:', orderNo, 'Code:', responseCode);

      // P0-7 FIX: KHÔNG set order thành FAILED ngay
      // Giữ PENDING để user có thể retry trong 15 phút
      // Chỉ tạo Payment record với state=FAIL để tracking
      try {
        const order = await Order.findOne({ orderNo });
        if (order && order.status === 'PENDING') {
          // KHÔNG thay đổi order.status - giữ PENDING cho phép retry
          console.log('[VNPay Return] Keeping order PENDING for retry:', orderNo);

          // P0-3 Fix: Upsert Payment record - chỉ payment là FAIL
          await Payment.findOneAndUpdate(
            { txnRef: orderNo },
            {
              $setOnInsert: {
                orderId: order._id,
                gateway: 'VNPAY',
                txnRef: orderNo,
                amount: amount
              },
              $set: {
                state: 'FAIL',
                rawPayload: req.query
              }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.error('[VNPay Return] Failed order update error:', err);
      }

      return res.redirect(`${frontendUrl}/ket-qua-thanh-toan?status=failed&orderNo=${orderNo}&code=${responseCode}`);
    }
  } else {
    // Sai chữ ký
    console.error('[VNPay Return] Invalid signature');
    return res.redirect(`${frontendUrl}/ket-qua-thanh-toan?status=error&message=invalid_signature`);
  }
});


