const mongoose = require('mongoose');
const crypto = require('crypto');

const promotionRedeemSchema = new mongoose.Schema({
  //LIÊN KẾT
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  //TOKEN/QR
  token: {
    type: String,
    required: true,
    unique: true
  },
  qrData: {
    type: String // JSON string cho QR code
  },

  //TRẠNG THÁI
  status: {
    type: String,
    enum: ['ISSUED', 'REDEEMED', 'EXPIRED', 'CANCELLED'],
    default: 'ISSUED',
    index: true
  },

  //THỜI GIAN
  issuedAt: {
    type: Date,
    default: Date.now
  },
  redeemedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true
  },

  //STAFF REDEEM
  redeemedByStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

//INDEXES
// Đảm bảo mỗi user chỉ có 1 token ISSUED cho 1 promotion
promotionRedeemSchema.index(
  { promotionId: 1, userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'ISSUED' } }
);
promotionRedeemSchema.index({ token: 1 }, { unique: true });

//STATIC METHOD: Generate unique token
promotionRedeemSchema.statics.generateToken = function () {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
};

//STATIC METHOD: Generate QR data
promotionRedeemSchema.statics.generateQRData = function (token, promotionId) {
  return JSON.stringify({
    type: 'PROMOTION_REDEEM',
    token,
    promotionId: promotionId.toString(),
    timestamp: Date.now()
  });
};

//INSTANCE METHOD: Check if expired
promotionRedeemSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

//INSTANCE METHOD: Can be redeemed
promotionRedeemSchema.methods.canRedeem = function () {
  return this.status === 'ISSUED' && !this.isExpired();
};

const PromotionRedeem = mongoose.model('PromotionRedeem', promotionRedeemSchema);
module.exports = PromotionRedeem;
