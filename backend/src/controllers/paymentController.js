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

// --- 1. HÀM SẮP XẾP & MÃ HÓA ---
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

      // --- LOYALTY LOGIC ---
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
      // ---------------------

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
 * @desc Hiển thị kết quả giao dịch cho người dùng
 */
exports.vnpayReturn = catchAsync(async (req, res, next) => {
  const secretKey = process.env.VNP_HASH_SECRET;
  let vnp_Params = req.query;
  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  if (secureHash === signed) {
    if (req.query.vnp_ResponseCode === '00') {
      res.send('<h1>Giao dịch thành công! ✅</h1><p>Bạn có thể đóng tab này và kiểm tra email.</p>');
    } else {
      res.send('<h1>Giao dịch thất bại! ❌</h1><p>Mã lỗi: ' + req.query.vnp_ResponseCode + '</p>');
    }
  } else {
    res.send('<h1>Sai chữ ký! ⚠️</h1>');
  }
});
