const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    index: true
    // Không required - có thể là review cho genre
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre',
    index: true
    // Review cho bài viết genre
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Parent comment ID for replies (null = top-level comment)
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    default: null,
    index: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null // Optional for replies
  },
  title: {
    type: String,
    maxLength: 100,
    default: ''
  },
  content: {
    type: String,
    required: true,
    minLength: 1, // Giảm để cho phép replies ngắn với @mention
    trim: true
  },
  hasSpoiler: {
    type: Boolean,
    default: false
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'],
      default: 'LIKE'
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'APPROVED'
  },
  // === MODERATION FIELDS ===
  // Bình luận bị ẩn bởi admin
  isHidden: {
    type: Boolean,
    default: false
  },
  // Lý do ẩn
  hiddenReason: {
    type: String,
    trim: true,
    default: null
  },
  // Soft delete timestamp
  deletedAt: {
    type: Date,
    default: null
  },
  // Số lượng report
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index cho sort theo thời gian (movie reviews)
reviewSchema.index({ movie: 1, createdAt: -1 });

// Index cho genre reviews
reviewSchema.index({ genre: 1, createdAt: -1 });

// Index cho replies
reviewSchema.index({ parentId: 1, createdAt: 1 });

// Custom validation: phải có movie HOẶC genre (một trong hai)
reviewSchema.pre('validate', function (next) {
  if (!this.movie && !this.genre && !this.parentId) {
    return next(new Error('Review must be associated with either a movie or a genre'));
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

