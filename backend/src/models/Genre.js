const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Genre Model - Thể loại phim / Bài viết review
 */
const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên!'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      unique: true
    },
    nameEn: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    // Ảnh đại diện (thumbnail)
    imageUrl: {
      type: String,
      default: null
    },
    // Ảnh banner lớn
    bannerUrl: {
      type: String,
      default: null
    },
    iconUrl: {
      type: String,
      default: null
    },
    // Phân loại/Thể loại: Hành động, Viễn tưởng, Kinh dị, Hài, Khoa học, etc.
    category: {
      type: String,
      trim: true,
      required: [true, 'Vui lòng chọn thể loại!']
    },
    // Quốc gia (cho filter)
    country: {
      type: String,
      trim: true,
      default: 'Việt Nam'
    },
    // Năm (cho filter)
    year: {
      type: Number,
      default: new Date().getFullYear()
    },
    // Trạng thái: NOW (hiện tại), COMING (sắp tới)
    status: {
      type: String,
      enum: ['NOW', 'COMING', 'ARCHIVE'],
      default: 'NOW'
    },
    // Thống kê
    viewCount: {
      type: Number,
      default: 0
    },
    likeCount: {
      type: Number,
      default: 0
    },
    // Danh sách user đã like
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: Đếm số phim thuộc thể loại này
genreSchema.virtual('movieCount', {
  ref: 'Movie',
  localField: 'name',
  foreignField: 'genres',
  count: true
});

// Middleware: Tự động tạo slug từ name trước khi lưu
genreSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();

  this.slug = slugify(this.name, { lower: true, locale: 'vi' });
  next();
});

// Index cho search và sort
genreSchema.index({ name: 1 });
genreSchema.index({ slug: 1 });
genreSchema.index({ order: 1 });

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
