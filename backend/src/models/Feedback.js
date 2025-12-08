const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên của bạn']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    lowercase: true
  },
  phone: {
    type: String
  },
  topic: {
    type: String,
    enum: ['GENERAL', 'COMPLAINT', 'SERVICE', 'FACILITIES', 'BOOKING', 'PAYMENT'],
    default: 'GENERAL'
  },
  content: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung góp ý'],
    minlength: [10, 'Nội dung phải có ít nhất 10 ký tự']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED'],
    default: 'PENDING'
  },
  adminNote: {
    type: String
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for admin dashboard
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ email: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
