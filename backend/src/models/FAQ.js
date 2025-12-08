const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Vui lòng nhập câu trả lời']
  },
  category: {
    type: String,
    enum: ['BOOKING', 'PAYMENT', 'ACCOUNT', 'MEMBERSHIP', 'CINEMA', 'TECHNICAL', 'GENERAL'],
    default: 'GENERAL'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  isPopular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for sorting and filtering
faqSchema.index({ category: 1, order: 1 });
faqSchema.index({ isActive: 1, isPopular: -1 });

module.exports = mongoose.model('FAQ', faqSchema);
