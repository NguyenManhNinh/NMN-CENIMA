const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNo: {
    type: String,
    required: true,
    unique: true,
    index: true // Idempotency Key
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true,
    index: true
  },
  // Snapshot dữ liệu ghế tại thời điểm đặt (để lưu giá vé lúc đó)
  seats: [{
    seatCode: String,
    price: Number,
    isVip: Boolean
  }],
  // Snapshot dữ liệu combo
  combos: [{
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  subTotal: {
    type: Number,
    required: true
  },
  voucherCode: {
    type: String,
    default: null
  },
  //liên kết voucher thật để consume đúng ở payment success
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    default: null,
    index: true
  },
  userVoucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserVoucher',
    default: null,
    index: true
  },
  discount: {
    type: Number,
    default: 0
  },
  // idempotent consume voucher
  voucherConsumed: {
    type: Boolean,
    default: false
  },
  voucherConsumeState: {
    type: String,
    enum: ['NONE', 'LOCKED', 'DONE', 'FAILED'],
    default: 'NONE'
  },
  voucherConsumedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING',
    index: true
  },
  processedAt: {
    type: Date,
    default: null // Timestamp khi bắt đầu xử lý payment
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Để job dọn dẹp đơn treo quét
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
