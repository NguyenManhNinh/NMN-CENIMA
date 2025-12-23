const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Genre Model - Thể loại phim
 */
const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên thể loại!'],
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
    imageUrl: {
      type: String,
      default: null
    },
    iconUrl: {
      type: String,
      default: null
    },
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
