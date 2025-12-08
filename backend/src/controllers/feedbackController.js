const Feedback = require('../models/Feedback');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @desc    Tạo feedback mới (Public - không cần đăng nhập)
 * @route   POST /api/v1/feedbacks
 * @access  Public
 */
exports.createFeedback = catchAsync(async (req, res, next) => {
  const { name, email, phone, topic, content, rating } = req.body;

  const feedback = await Feedback.create({
    name,
    email,
    phone,
    topic,
    content,
    rating
  });

  res.status(201).json({
    status: 'success',
    message: 'Cảm ơn bạn đã gửi góp ý. Chúng tôi sẽ phản hồi sớm nhất!',
    data: { feedback }
  });
});

/**
 * @desc    Lấy tất cả feedback (Admin/Manager)
 * @route   GET /api/v1/feedbacks
 * @access  Private (Admin, Manager)
 */
exports.getAllFeedbacks = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Feedback.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const feedbacks = await features.query;
  const total = await Feedback.countDocuments();

  res.status(200).json({
    status: 'success',
    results: feedbacks.length,
    total,
    data: { feedbacks }
  });
});

/**
 * @desc    Lấy chi tiết feedback
 * @route   GET /api/v1/feedbacks/:id
 * @access  Private (Admin, Manager)
 */
exports.getFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(new AppError('Không tìm thấy feedback này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { feedback }
  });
});

/**
 * @desc    Cập nhật trạng thái feedback
 * @route   PATCH /api/v1/feedbacks/:id
 * @access  Private (Admin, Manager)
 */
exports.updateFeedback = catchAsync(async (req, res, next) => {
  const { status, adminNote } = req.body;

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    {
      status,
      adminNote,
      processedBy: req.user._id,
      processedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  if (!feedback) {
    return next(new AppError('Không tìm thấy feedback này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { feedback }
  });
});

/**
 * @desc    Xóa feedback
 * @route   DELETE /api/v1/feedbacks/:id
 * @access  Private (Admin)
 */
exports.deleteFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);

  if (!feedback) {
    return next(new AppError('Không tìm thấy feedback này', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
