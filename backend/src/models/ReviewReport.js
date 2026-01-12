const mongoose = require('mongoose');

/**
 * ReviewReport Model - Báo cáo bình luận vi phạm
 * User report → Admin review → Action (dismiss/hide/delete/ban)
 */
const reviewReportSchema = new mongoose.Schema(
  {
    // Review bị report
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: [true, 'Cần có ID bình luận bị báo cáo'],
      index: true
    },
    // Movie chứa review (để query nhanh)
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      index: true
    },
    // Genre chứa review (nếu là genre review)
    genreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genre',
      index: true
    },
    // User gửi report
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cần có ID người báo cáo'],
      index: true
    },
    // Lý do báo cáo
    reason: {
      type: String,
      enum: {
        values: ['toxic', 'spam', 'hate', 'harassment', 'sexual', 'spoiler', 'other'],
        message: 'Lý do không hợp lệ'
      },
      required: [true, 'Vui lòng chọn lý do báo cáo']
    },
    // Ghi chú thêm từ user
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Ghi chú không quá 500 ký tự'],
      default: ''
    },
    // Trạng thái xử lý
    status: {
      type: String,
      enum: ['pending', 'dismissed', 'reviewed'],
      default: 'pending',
      index: true
    },
    // Admin xử lý
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // Hành động admin thực hiện
    adminAction: {
      type: String,
      enum: ['none', 'hide_review', 'delete_review', 'ban_user'],
      default: 'none'
    },
    // Số phút ban (nếu action = ban_user)
    banMinutes: {
      type: Number,
      default: null
    },
    // Lý do ẩn/xóa (admin ghi)
    adminNote: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// UNIQUE: Mỗi user chỉ report 1 review 1 lần
reviewReportSchema.index({ reviewId: 1, reporterId: 1 }, { unique: true });

// Index cho admin query
reviewReportSchema.index({ status: 1, createdAt: -1 });

// Reason labels (tiếng Việt)
reviewReportSchema.statics.REASON_LABELS = {
  toxic: 'Nội dung độc hại',
  spam: 'Spam / Quảng cáo',
  hate: 'Kích động thù địch',
  harassment: 'Quấy rối',
  sexual: 'Nội dung người lớn',
  spoiler: 'Tiết lộ nội dung phim',
  other: 'Lý do khác'
};

const ReviewReport = mongoose.model('ReviewReport', reviewReportSchema);

module.exports = ReviewReport;
