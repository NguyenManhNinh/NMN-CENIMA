const FAQ = require('../models/FAQ');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @desc    Lấy danh sách FAQ (Public)
 * @route   GET /api/v1/faqs
 * @access  Public
 */
exports.getAllFAQs = catchAsync(async (req, res, next) => {
  // Chỉ lấy FAQs active
  const query = FAQ.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

  // Nếu có category filter
  if (req.query.category) {
    query.where('category').equals(req.query.category);
  }

  const faqs = await query;

  res.status(200).json({
    status: 'success',
    results: faqs.length,
    data: { faqs }
  });
});

/**
 * @desc    Lấy chi tiết FAQ và tăng view count
 * @route   GET /api/v1/faqs/:id
 * @access  Public
 */
exports.getFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!faq) {
    return next(new AppError('Không tìm thấy câu hỏi này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { faq }
  });
});

/**
 * @desc    Tạo FAQ mới
 * @route   POST /api/v1/faqs
 * @access  Private (Admin, Manager)
 */
exports.createFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { faq }
  });
});

/**
 * @desc    Cập nhật FAQ
 * @route   PATCH /api/v1/faqs/:id
 * @access  Private (Admin, Manager)
 */
exports.updateFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!faq) {
    return next(new AppError('Không tìm thấy câu hỏi này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { faq }
  });
});

/**
 * @desc    Xóa FAQ
 * @route   DELETE /api/v1/faqs/:id
 * @access  Private (Admin)
 */
exports.deleteFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);

  if (!faq) {
    return next(new AppError('Không tìm thấy câu hỏi này', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * @desc    Lấy danh sách FAQ cho Admin (bao gồm inactive)
 * @route   GET /api/v1/faqs/admin/all
 * @access  Private (Admin, Manager)
 */
exports.getAdminFAQs = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(FAQ.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const faqs = await features.query;
  const total = await FAQ.countDocuments();

  res.status(200).json({
    status: 'success',
    results: faqs.length,
    total,
    data: { faqs }
  });
});
