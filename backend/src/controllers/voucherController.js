const Voucher = require('../models/Voucher');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

// --- PUBLIC: Get available vouchers for payment page ---
// Nếu user đăng nhập, lọc bỏ voucher đã dùng
exports.getAvailableVouchers = catchAsync(async (req, res, next) => {
  const now = new Date();
  const userId = req.user?.id; // Có thể null nếu chưa đăng nhập

  // Lấy voucher: ACTIVE, trong thời hạn
  const allVouchers = await Voucher.find({
    status: 'ACTIVE',
    validFrom: { $lte: now },
    validTo: { $gte: now }
  }).select('code type value maxDiscount validTo usageCount usageLimit').sort({ value: -1 });

  // Filter: chưa hết lượt dùng
  let vouchers = allVouchers.filter(v => v.usageCount < v.usageLimit);

  // Nếu user đăng nhập, lọc bỏ voucher đã dùng
  if (userId) {
    const VoucherUsage = require('../models/VoucherUsage');
    const usedVouchers = await VoucherUsage.find({ userId }).select('voucherId');
    const usedVoucherIds = usedVouchers.map(u => u.voucherId.toString());

    vouchers = vouchers.filter(v => !usedVoucherIds.includes(v._id.toString()));
  }

  res.status(200).json({
    status: 'success',
    results: vouchers.length,
    data: { vouchers }
  });
});

// --- ADMIN: Get all vouchers ---
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
  const userId = req.user?.id; // Cần đăng nhập

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

  // 3. Check usage limit (tổng số lần dùng)
  if (voucher.usageCount >= voucher.usageLimit) {
    return next(new AppError('Mã giảm giá đã hết lượt sử dụng!', 400));
  }

  // 4. Check user đã dùng voucher này chưa (mỗi user 1 lần)
  if (userId) {
    const VoucherUsage = require('../models/VoucherUsage');
    const existingUsage = await VoucherUsage.findOne({
      voucherId: voucher._id,
      userId: userId
    });
    if (existingUsage) {
      return next(new AppError('Bạn đã sử dụng mã giảm giá này rồi!', 400));
    }
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
