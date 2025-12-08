const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['PERCENT', 'FIXED'],
    default: 'PERCENT'
  },
  value: {
    type: Number,
    required: true
  },
  maxDiscount: {
    type: Number, // Tối đa giảm bao nhiêu (cho loại PERCENT)
    default: 0
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  usageLimit: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'DISABLED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

const Voucher = mongoose.model('Voucher', voucherSchema);
module.exports = Voucher;
