const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
    index: true
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
    minLength: 10, // Reduced for replies
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
  }
}, {
  timestamps: true
});

// Index cho sort theo thời gian (không còn unique constraint)
reviewSchema.index({ movie: 1, createdAt: -1 });

// Index cho replies
reviewSchema.index({ parentId: 1, createdAt: 1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

