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
  // Vị trí hiển thị: LIST = danh sách thường, BOTTOM_BANNER = banner lớn dưới grid
  displayPosition: {
    type: String,
    enum: ['LIST', 'BOTTOM_BANNER'],
    default: 'LIST',
    index: true
  },
  // Thứ tự hiển thị banner (1, 2, ...)
  bannerOrder: {
    type: Number,
    default: 0,
    index: true
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
  quantityPerUser: {
    type: Number,
    default: 1,
    min: 1
  },

  //RÀNG BUỘC
  allowedUserRanks: [{
    type: String,
    enum: ['MEMBER', 'VIP', 'DIAMOND']
  }],

  //THỐNG KÊ
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likedByIPs: [{
    type: String  // For anonymous likes (IP tracking)
  }],
  claimCount: {
    type: Number,
    default: 0
  },

  //QUOTA MANAGEMENT
  totalRedeemsLimit: {
    type: Number,
    default: null,  // null = không giới hạn
    min: 0
  },
  redeemCount: {
    type: Number,
    default: 0,
    min: 0
  },

  //OFFLINE MODE (chỉ dùng khi applyMode = OFFLINE_ONLY)
  offlineMode: {
    type: String,
    enum: ['INFO_ONLY', 'QR_REDEEM'],
    default: 'QR_REDEEM'
  },

  //LƯU Ý (hiển thị trên FE)
  notes: {
    type: String,
    trim: true
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

//VIRTUAL: remainingRedeems (còn lại bao nhiêu lượt)
promotionSchema.virtual('remainingRedeems').get(function () {
  if (typeof this.totalRedeemsLimit !== 'number') return null;
  return Math.max(0, this.totalRedeemsLimit - (this.redeemCount || 0));
});

// Ensure virtuals are included in JSON
promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

const Promotion = mongoose.model('Promotion', promotionSchema);
module.exports = Promotion;
