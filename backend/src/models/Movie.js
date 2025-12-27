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
    // Đạo diễn - Reference đến Person
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'Vui lòng chọn đạo diễn!']
    },
    // Nhà sản xuất
    studio: {
      type: String,
      trim: true
    },
    // Quốc gia
    country: {
      type: String,
      trim: true,
      default: 'Việt Nam'
    },
    // Diễn viên - Reference đến Person
    actors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person'
    }],
    duration: {
      type: Number,
      required: [true, 'Vui lòng nhập thời lượng phim (phút)!']
    },
    ageRating: {
      type: String,
      enum: ['P', 'C13', 'C16', 'C18'],
      default: 'P'
    },
    // Thể loại - Reference đến Genre
    genres: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genre'
    }],
    posterUrl: {
      type: String,
      required: [true, 'Vui lòng upload poster phim!']
    },
    bannerUrl: String,
    trailerUrl: {
      type: String,
      required: [true, 'Vui lòng nhập link trailer!']
    },
    // Gallery hình trong phim (movie stills)
    stills: [{
      url: String,
      caption: String
    }],
    releaseDate: {
      type: Date,
      required: [true, 'Vui lòng nhập ngày khởi chiếu!']
    },
    endDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['NOW', 'COMING', 'STOP'], // Đang chiếu, Sắp chiếu, Ngưng chiếu
      default: 'COMING'
    },
    // Đánh giá
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    // View count
    viewCount: {
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

// Middleware: Tự động tạo slug từ title trước khi lưu
movieSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();

  this.slug = slugify(this.title, { lower: true, locale: 'vi' });
  next();
});

// Middleware: Populate khi find (tùy chọn, cân nhắc performance)
movieSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'genres',
    select: 'name slug'
  }).populate({
    path: 'director',
    select: 'name slug'
  }).populate({
    path: 'actors',
    select: 'name slug'
  });
  next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
