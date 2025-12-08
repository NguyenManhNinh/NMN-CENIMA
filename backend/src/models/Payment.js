const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  gateway: {
    type: String,
    enum: ['VNPAY'],
    default: 'VNPAY',
    index: true
  },
  txnRef: {
    type: String,
    required: true,
    unique: true // Mã tham chiếu gửi sang VNPay (thường là orderNo)
  },
  bankTranNo: {
    type: String,
    index: true // Mã giao dịch của ngân hàng trả về
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'VND'
  },
  bankCode: {
    type: String
  },
  payDate: {
    type: Date
  },
  responseCode: {
    type: String
  },
  state: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAIL'],
    default: 'PENDING',
    index: true
  },
  // Lưu toàn bộ phản hồi từ IPN để đối soát/debug
  rawPayload: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
