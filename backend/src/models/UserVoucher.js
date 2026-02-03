const mongoose = require('mongoose');

const userVoucherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    required: true,
    index: true
  },
  // Số lần user được phép dùng voucher này
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  // Số lần đã dùng
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Ngày cấp phát
  assignedAt: {
    type: Date,
    default: Date.now
  },
  // Ngày hết hạn (có thể khác với voucher gốc)
  expiresAt: {
    type: Date,
    default: null // null = dùng expiresAt của Voucher gốc
  },
  // Trạng thái
  status: {
    type: String,
    enum: ['ACTIVE', 'EXHAUSTED', 'EXPIRED'],
    default: 'ACTIVE'
  },
  // Nguồn gốc voucher (để biết từ đâu)
  source: {
    type: String,
    enum: ['ADMIN', 'PROMOTION', 'SYSTEM', 'LOYALTY'],
    default: 'ADMIN'
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // ID của Promotion nếu source = PROMOTION
  }
}, {
  timestamps: true
});

// P0 Fix: Unique partial index để chống race claim - chỉ 1 ACTIVE per user+voucher
// (Thay thế index cũ { userId:1, voucherId:1 } - đã đủ cho query và chống race)
userVoucherSchema.index(
  { userId: 1, voucherId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE' } }
);

// Virtual: Còn lại bao nhiêu lượt
userVoucherSchema.virtual('remainingUses').get(function () {
  return Math.max(0, this.quantity - this.usedCount);
});

// Method: Kiểm tra còn dùng được không
userVoucherSchema.methods.canUse = function () {
  if (this.status !== 'ACTIVE') return false;
  if (this.usedCount >= this.quantity) return false;
  return true;
};

// Method: Dùng 1 lượt
userVoucherSchema.methods.use = async function () {
  this.usedCount += 1;
  if (this.usedCount >= this.quantity) {
    this.status = 'EXHAUSTED';
  }
  await this.save();
};

const UserVoucher = mongoose.model('UserVoucher', userVoucherSchema);
module.exports = UserVoucher;
