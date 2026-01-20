const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Genre Model - Thể loại phim / Bài viết review
 */
const genreSchema = new mongoose.Schema(
  {
    // LOG DEBUG
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
    // Hỗ trợ nhiều thể loại cho 1 phim
    category: [{
      type: String,
      trim: true
    }],
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
    },

    // ========== CÁC TRƯỜNG MỚI ĐỂ GIỐNG MOVIE UI ==========

    // Thời lượng (phút)
    duration: {
      type: Number,
      default: null
    },
    // Ngày phát hành / Ngày công chiếu
    releaseDate: {
      type: Date,
      default: null
    },
    // Phân loại độ tuổi: P, C13, C16, C18
    ageRating: {
      type: String,
      enum: ['P', 'C13', 'C16', 'C18', 'K'],
      default: 'P'
    },
    // Điểm đánh giá trung bình (0-10)
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    // Số lượt đánh giá
    ratingCount: {
      type: Number,
      default: 0
    },
    // Danh sách user đã đánh giá (để check trùng)
    ratedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 10
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Nhà sản xuất / Studio
    studio: {
      type: String,
      trim: true,
      default: null
    },
    // Đạo diễn (có thể là tên hoặc ObjectId ref Director)
    director: {
      type: String,
      trim: true,
      default: null
    },
    // Diễn viên (danh sách tên hoặc object chứa name, photoUrl)
    actors: [{
      name: {
        type: String,
        trim: true
      },
      photoUrl: {
        type: String,
        default: null
      }
    }],
    // Link Trailer (Youtube)
    trailerUrl: {
      type: String,
      default: null
    },
    // Hình ảnh trong bài viết (stills/gallery)
    stills: [{
      type: String
    }]
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
