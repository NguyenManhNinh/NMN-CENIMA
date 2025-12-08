const mongoose = require('mongoose');
const slugify = require('slugify');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tên phim!'],
      trim: true,
      unique: true
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả phim!'],
      trim: true
    },
    director: {
      type: String,
      required: [true, 'Vui lòng nhập tên đạo diễn!'],
      trim: true
    },
    actors: [String], // Mảng tên diễn viên
    duration: {
      type: Number,
      required: [true, 'Vui lòng nhập thời lượng phim (phút)!']
    },
    ageRating: {
      type: String,
      enum: ['P', 'C13', 'C16', 'C18'],
      default: 'P'
    },
    genres: [String], // Mảng thể loại (Hành động, Tình cảm...)
    posterUrl: {
      type: String,
      required: [true, 'Vui lòng upload poster phim!']
    },
    bannerUrl: String,
    trailerUrl: {
      type: String,
      required: [true, 'Vui lòng nhập link trailer!']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Vui lòng nhập ngày khởi chiếu!']
    },
    status: {
      type: String,
      enum: ['NOW', 'COMING', 'STOP'], // Đang chiếu, Sắp chiếu, Ngưng chiếu
      default: 'COMING'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Middleware: Tự động tạo slug từ title trước khi lưu
movieSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();

  this.slug = slugify(this.title, { lower: true, locale: 'vi' });
  next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
