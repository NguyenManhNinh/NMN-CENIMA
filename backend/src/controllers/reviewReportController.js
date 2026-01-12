const ReviewReport = require('../models/ReviewReport');
const Review = require('../models/Review');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// ===========================================
// USER: Report một review
// POST /movies/:movieId/reviews/:reviewId/report
// ===========================================
exports.createReport = catchAsync(async (req, res, next) => {
  const { movieId, reviewId } = req.params;
  const { reason, note } = req.body;
  const reporterId = req.user._id;

  // Validate reason
  const validReasons = ['toxic', 'spam', 'hate', 'harassment', 'sexual', 'spoiler', 'other'];
  if (!reason || !validReasons.includes(reason)) {
    return next(new AppError('Vui lòng chọn lý do báo cáo hợp lệ', 400));
  }

  // Check review exists
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError('Không tìm thấy bình luận', 404));
  }

  // Check không tự report chính mình
  if (review.user.toString() === reporterId.toString()) {
    return next(new AppError('Bạn không thể báo cáo bình luận của chính mình', 400));
  }

  try {
    // Create report (unique index sẽ throw error nếu đã report)
    const report = await ReviewReport.create({
      reviewId,
      movieId: review.movie || null,
      genreId: review.genre || null,
      reporterId,
      reason,
      note: note || ''
    });

    // Tăng reportCount của review
    await Review.findByIdAndUpdate(reviewId, { $inc: { reportCount: 1 } });

    res.status(201).json({
      status: 'success',
      message: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét trong thời gian sớm nhất.',
      data: { reportId: report._id }
    });
  } catch (error) {
    // Handle duplicate key error (user đã report review này)
    if (error.code === 11000) {
      return next(new AppError('Bạn đã báo cáo bình luận này rồi', 400));
    }
    throw error;
  }
});

// ===========================================
// ADMIN: Lấy danh sách reports
// GET /admin/reports?status=pending&page=1&limit=20
// ===========================================
exports.getReports = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;

  // Build query
  const query = {};
  if (status && ['pending', 'dismissed', 'reviewed'].includes(status)) {
    query.status = status;
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const [reports, total] = await Promise.all([
    ReviewReport.find(query)
      .populate('reviewId', 'content title rating hasSpoiler user createdAt isHidden')
      .populate({
        path: 'reviewId',
        populate: {
          path: 'user',
          select: 'name email avatar'
        }
      })
      .populate('reporterId', 'name email avatar')
      .populate('adminId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ReviewReport.countDocuments(query)
  ]);

  res.status(200).json({
    status: 'success',
    results: reports.length,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    data: { reports }
  });
});

// ===========================================
// ADMIN: Xử lý report
// PATCH /admin/reports/:reportId/action
// Body: { action, banMinutes?, hiddenReason? }
// ===========================================
exports.handleReportAction = catchAsync(async (req, res, next) => {
  const { reportId } = req.params;
  const { action, banMinutes, hiddenReason } = req.body;
  const adminId = req.user._id;

  // Validate action
  const validActions = ['dismiss', 'hide_review', 'delete_review', 'ban_user'];
  if (!action || !validActions.includes(action)) {
    return next(new AppError('Hành động không hợp lệ', 400));
  }

  // Find report
  const report = await ReviewReport.findById(reportId).populate('reviewId');
  if (!report) {
    return next(new AppError('Không tìm thấy báo cáo', 404));
  }

  // Check report chưa được xử lý
  if (report.status !== 'pending') {
    return next(new AppError('Báo cáo này đã được xử lý', 400));
  }

  const review = report.reviewId;
  let actionMessage = '';

  switch (action) {
    case 'dismiss':
      // Bỏ qua report
      report.status = 'dismissed';
      report.adminAction = 'none';
      actionMessage = 'Đã bỏ qua báo cáo';
      break;

    case 'hide_review':
      // Ẩn bình luận
      if (review) {
        review.isHidden = true;
        review.hiddenReason = hiddenReason || 'Vi phạm quy định cộng đồng';
        await review.save();
      }
      report.status = 'reviewed';
      report.adminAction = 'hide_review';
      actionMessage = 'Đã ẩn bình luận';
      break;

    case 'delete_review':
      // Soft delete bình luận
      if (review) {
        review.deletedAt = new Date();
        review.isHidden = true;
        review.hiddenReason = hiddenReason || 'Bị xóa do vi phạm';
        await review.save();
      }
      report.status = 'reviewed';
      report.adminAction = 'delete_review';
      actionMessage = 'Đã xóa bình luận';
      break;

    case 'ban_user':
      // Ban user chat
      if (!banMinutes || banMinutes < 1) {
        return next(new AppError('Vui lòng nhập số phút ban (tối thiểu 1 phút)', 400));
      }

      if (review && review.user) {
        const banUntil = new Date(Date.now() + banMinutes * 60 * 1000);
        await User.findByIdAndUpdate(review.user, { chatBanUntil: banUntil });

        // Cũng ẩn bình luận
        review.isHidden = true;
        review.hiddenReason = hiddenReason || 'User bị ban do vi phạm';
        await review.save();
      }
      report.status = 'reviewed';
      report.adminAction = 'ban_user';
      report.banMinutes = banMinutes;
      actionMessage = `Đã ban user ${banMinutes} phút và ẩn bình luận`;
      break;
  }

  // Save report với admin info
  report.adminId = adminId;
  report.adminNote = hiddenReason || '';
  await report.save();

  res.status(200).json({
    status: 'success',
    message: actionMessage,
    data: { report }
  });
});

// ===========================================
// USER: Kiểm tra đã report review chưa
// GET /movies/:movieId/reviews/:reviewId/report/status
// ===========================================
exports.checkReportStatus = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const existingReport = await ReviewReport.findOne({
    reviewId,
    reporterId: userId
  });

  res.status(200).json({
    status: 'success',
    data: {
      hasReported: !!existingReport
    }
  });
});
