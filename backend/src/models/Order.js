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
  discount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
    index: true
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
