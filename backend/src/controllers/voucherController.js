const Voucher = require('../models/Voucher');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllVouchers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Voucher.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const vouchers = await features.query;

  res.status(200).json({
    status: 'success',
    results: vouchers.length,
    data: { vouchers }
  });
});

exports.createVoucher = catchAsync(async (req, res, next) => {
  const voucher = await Voucher.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { voucher }
  });
});

exports.updateVoucher = catchAsync(async (req, res, next) => {
  const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!voucher) return next(new AppError('No voucher found with that ID', 404));
  res.status(200).json({
    status: 'success',
    data: { voucher }
  });
});

exports.deleteVoucher = catchAsync(async (req, res, next) => {
  const voucher = await Voucher.findByIdAndDelete(req.params.id);
  if (!voucher) return next(new AppError('No voucher found with that ID', 404));
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// --- USER: Apply Voucher ---
exports.applyVoucher = catchAsync(async (req, res, next) => {
  const { code, totalAmount } = req.body;

  if (!code || !totalAmount) {
    return next(new AppError('Please provide voucher code and total amount', 400));
  }

  const voucher = await Voucher.findOne({ code: code.toUpperCase() });

  if (!voucher) {
    return next(new AppError('Mã giảm giá không tồn tại!', 404));
  }

  // 1. Check status
  if (voucher.status !== 'ACTIVE') {
    return next(new AppError('Mã giảm giá không khả dụng!', 400));
  }

  // 2. Check date
  const now = new Date();
  if (now < voucher.validFrom || now > voucher.validTo) {
    return next(new AppError('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực!', 400));
  }

  // 3. Check usage limit
  if (voucher.usageCount >= voucher.usageLimit) {
    return next(new AppError('Mã giảm giá đã hết lượt sử dụng!', 400));
  }

  // 4. Calculate discount
  let discountAmount = 0;
  if (voucher.type === 'FIXED') {
    discountAmount = voucher.value;
  } else if (voucher.type === 'PERCENT') {
    discountAmount = (totalAmount * voucher.value) / 100;
    if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
      discountAmount = voucher.maxDiscount;
    }
  }

  // Ensure discount doesn't exceed total
  if (discountAmount > totalAmount) discountAmount = totalAmount;

  res.status(200).json({
    status: 'success',
    data: {
      code: voucher.code,
      discountAmount,
      finalAmount: totalAmount - discountAmount,
      type: voucher.type,
      value: voucher.value
    }
  });
});
