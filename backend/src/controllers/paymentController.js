const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const ticketController = require('./ticketController');
const catchAsync = require('../utils/catchAsync');
const {
  POINTS_PER_VND,
  VIP_THRESHOLD,
  VVIP_THRESHOLD
} = require('../config/constants');

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

    const order = await Order.findOne({ orderNo: originalOrderNo });
    if (!order) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    if (order.totalAmount !== amount) {
      return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
    }

    if (order.status === 'PAID') {
      return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    if (rspCode === '00') {
      await ticketController.finalizeTransaction(order);
      await Payment.create({
        orderId: order._id,
        gateway: 'VNPAY',
        txnRef: originalOrderNo,
        bankTranNo: req.query.vnp_BankTranNo,
        amount: amount,
        state: 'SUCCESS',
        rawPayload: req.query
      });

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
      order.status = 'FAILED';
      await order.save();
      await Payment.create({
        orderId: order._id,
        gateway: 'VNPAY',
        txnRef: originalOrderNo,
        amount: amount,
        state: 'FAIL',
        rawPayload: req.query
      });
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

        // Xử lý đơn hàng: Tạo Ticket, cập nhật Order status thành PAID
        await ticketController.finalizeTransaction(order);

        // Tạo Payment record
        await Payment.create({
          orderId: order._id,
          gateway: 'VNPAY',
          txnRef: orderNo,
          bankTranNo: req.query.vnp_BankTranNo || '',
          amount: amount,
          state: 'SUCCESS',
          rawPayload: req.query
        });

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

        // VOUCHER USAGE - Ghi nhận user đã dùng voucher
        if (order.voucherCode) {
          try {
            const Voucher = require('../models/Voucher');
            const VoucherUsage = require('../models/VoucherUsage');
            const voucher = await Voucher.findOne({ code: order.voucherCode });
            if (voucher) {
              await VoucherUsage.create({
                voucherId: voucher._id,
                userId: order.userId,
                orderId: order._id
              });
              // Tăng usageCount của voucher
              voucher.usageCount += 1;
              await voucher.save();
              console.log(`[Voucher] Recorded usage: ${order.voucherCode} by user ${order.userId}`);
            }
          } catch (voucherErr) {
            // Ignore duplicate error (user đã dùng)
            if (voucherErr.code !== 11000) {
              console.error('[Voucher] Error recording usage:', voucherErr);
            }
          }
        }

        console.log('[VNPay Return] Payment SUCCESS:', orderNo);
        return res.redirect(`${frontendUrl}/ket-qua-thanh-toan?status=success&orderNo=${orderNo}`);

      } catch (err) {
        // Xử lý trường hợp duplicate key (E11000) - ticket đã tồn tại
        if (err.code === 11000) {
          console.log('[VNPay Return] Duplicate ticket detected, treating as success:', orderNo);
          // Đảm bảo order status = PAID
          await Order.findOneAndUpdate({ orderNo }, { status: 'PAID' });
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

      // Cập nhật Order status thành FAILED
      try {
        const order = await Order.findOne({ orderNo });
        if (order && order.status === 'PENDING') {
          order.status = 'FAILED';
          await order.save();

          // Tạo Payment record với state FAIL
          await Payment.create({
            orderId: order._id,
            gateway: 'VNPAY',
            txnRef: orderNo,
            amount: amount,
            state: 'FAIL',
            rawPayload: req.query
          });
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


