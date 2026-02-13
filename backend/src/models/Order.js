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
  // Cinema Coin - Dùng điểm trừ tiền
  usedPoints: {
    type: Number,
    default: 0
  },
  pointDiscount: {
    type: Number,
    default: 0 // = usedPoints * POINT_VALUE_VND
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
  // Phase 3: Promotion quota tracking
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    default: null,
    index: true // Để query orders by promotion
  },
  // P0-1 Fix: State machine thay vì boolean để track đúng
  promotionReserveState: {
    type: String,
    enum: ['NONE', 'RESERVED', 'EXCEEDED', 'FAILED'],
    default: 'NONE'
  }
  // P0 Fix: Removed manual createdAt - timestamps:true already creates it
}, {
  timestamps: true
});

// Index on createdAt for cleanup job (timestamps:true tự tạo createdAt)
orderSchema.index({ createdAt: 1 });
// P1: Additional indexes for common query patterns
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
