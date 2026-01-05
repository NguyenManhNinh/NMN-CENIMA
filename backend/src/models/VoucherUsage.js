/**
 * VoucherUsage Model - Theo dõi lịch sử sử dụng voucher
 *
 * Mỗi khi user dùng voucher thành công (thanh toán xong),
 * tạo 1 record để đánh dấu user đã dùng voucher này.
 *
 * Trước khi apply voucher, check xem user đã dùng chưa.
 */
const mongoose = require('mongoose');

const voucherUsageSchema = new mongoose.Schema({
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index: Mỗi user chỉ dùng mỗi voucher 1 lần
voucherUsageSchema.index({ voucherId: 1, userId: 1 }, { unique: true });

const VoucherUsage = mongoose.model('VoucherUsage', voucherUsageSchema);
module.exports = VoucherUsage;
