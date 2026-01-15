const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Person Model - Diễn viên / Đạo diễn
 * Based on Galaxy Cinema template
 */
const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên!'],
      trim: true
    },
    slug: {
      type: String,
      unique: true
    },
    nameEn: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['actor', 'director', 'both'],
      required: [true, 'Vui lòng chọn vai trò (diễn viên/đạo diễn)!']
    },
    photoUrl: {
      type: String,
      default: null
    },
    // Gallery ảnh (nhiều ảnh)
    gallery: [{
      url: String,
      caption: String
    }],
    // Thông tin cá nhân
    birthDate: {
      type: Date,
      default: null
    },
    birthPlace: {
      type: String,
      trim: true
    },
    nationality: {
      type: String,
      trim: true
    },
    // Mô tả ngắn (hiển thị ở list page)
    shortBio: {
      type: String,
      trim: true,
      maxlength: 300
    },
    // Tiểu sử đầy đủ (hiển thị ở detail page)
    fullBio: {
      type: String,
      trim: true
    },
    // Các thể loại phim thường tham gia (tags)
    genres: [{
      type: String,
      trim: true
    }],
    // Giải thưởng
    awards: [{
      name: String,
      year: Number,
      movie: String, // Tên phim nhận giải
      category: String // Hạng mục
    }],
    // Social links
    socialLinks: {
      website: String,
      instagram: String,
      twitter: String,
      facebook: String,
      imdb: String
    },
    // SEO
    metaTitle: String,
    metaDescription: String,
    // Status
    isActive: {
      type: Boolean,
      default: true
    },
    // View count (để sort theo độ phổ biến)
    viewCount: {
      type: Number,
      default: 0
    },
    // Like count (số lượt thích)
    likeCount: {
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

// Virtual: Lấy danh sách phim tham gia (cho Actor)
personSchema.virtual('moviesAsActor', {
  ref: 'Movie',
  localField: 'name',
  foreignField: 'actors'
});

// Virtual: Lấy danh sách phim đạo diễn (cho Director)
personSchema.virtual('moviesAsDirector', {
  ref: 'Movie',
  localField: 'name',
  foreignField: 'director'
});

// Virtual: Tính tuổi
personSchema.virtual('age').get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  const birth = new Date(this.birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

// Middleware: Tự động tạo slug từ name trước khi lưu
personSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();

  this.slug = slugify(this.name, { lower: true, locale: 'vi' });
  next();
});

// Index cho search và sort
personSchema.index({ name: 'text', nameEn: 'text' });
personSchema.index({ slug: 1 });
personSchema.index({ role: 1 });
personSchema.index({ viewCount: -1 });
personSchema.index({ isActive: 1 });

const Person = mongoose.model('Person', personSchema);

module.exports = Person;
