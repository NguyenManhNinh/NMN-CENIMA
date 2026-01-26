const mongoose = require('mongoose');
const slugify = require('slugify');

const promotionSchema = new mongoose.Schema({
  //THÔNG TIN CƠ BẢN
  title: {
    type: String,
    required: [true, 'Tiêu đề ưu đãi là bắt buộc'],
    trim: true,
    maxLength: [200, 'Tiêu đề không quá 200 ký tự']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxLength: [500, 'Mô tả ngắn không quá 500 ký tự']
  },
  content: {
    type: String, // HTML content
    required: [true, 'Nội dung chi tiết là bắt buộc']
  },

  //HÌNH ẢNH
  thumbnailUrl: {
    type: String,
    default: ''
  },
  coverUrl: {
    type: String,
    default: ''
  },

  //TRẠNG THÁI & LOẠI
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED'],
    default: 'DRAFT',
    index: true
  },
  type: {
    type: String,
    enum: ['PROMOTION', 'EVENT'],
    default: 'PROMOTION'
  },

  //HIỂN THỊ
  isFeatured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },

  //THỜI GIAN
  publishAt: {
    type: Date,
    default: Date.now
  },
  startAt: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },
  endAt: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc']
  },

  //LOẠI ƯU ĐÃI (QUAN TRỌNG)
  applyMode: {
    type: String,
    enum: ['ONLINE_VOUCHER', 'OFFLINE_ONLY', 'PAYMENT_METHOD_ONLY'],
    default: 'ONLINE_VOUCHER',
    index: true
  },

  //LIÊN KẾT VOUCHER (nếu ONLINE_VOUCHER)
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    default: null
  },
  claimPolicy: {
    type: String,
    enum: ['ONCE_PER_USER', 'LIMITED_N_TIMES'],
    default: 'ONCE_PER_USER'
  },
  quantityPerUser: {
    type: Number,
    default: 1,
    min: 1
  },

  //OFFLINE REDEEM (nếu OFFLINE_ONLY)
  redeemPolicy: {
    type: String,
    enum: ['ONCE_PER_USER', 'MULTI'],
    default: 'ONCE_PER_USER'
  },

  //RÀNG BUỘC (MỞ RỘNG)
  allowedCinemaIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cinema'
  }],
  allowedUserRanks: [{
    type: String,
    enum: ['MEMBER', 'VIP', 'VVIP']
  }],
  requiredGateway: {
    type: String,
    enum: ['VNPAY', 'MOMO', 'SHOPEEPAY', null],
    default: null
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },

  //THỐNG KÊ
  viewCount: {
    type: Number,
    default: 0
  },
  claimCount: {
    type: Number,
    default: 0
  },

  //SEO
  metaTitle: String,
  metaDescription: String
}, {
  timestamps: true
});

//INDEXES
promotionSchema.index({ status: 1, startAt: 1, endAt: 1 });
promotionSchema.index({ isFeatured: -1, priority: -1 });

//AUTO GENERATE SLUG
promotionSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      locale: 'vi'
    }) + '-' + Date.now().toString(36);
  }
  next();
});

//VIRTUAL: isActive
promotionSchema.virtual('isActive').get(function () {
  const now = new Date();
  return this.status === 'ACTIVE' &&
    this.startAt <= now &&
    this.endAt >= now;
});

// Ensure virtuals are included in JSON
promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

const Promotion = mongoose.model('Promotion', promotionSchema);
module.exports = Promotion;
