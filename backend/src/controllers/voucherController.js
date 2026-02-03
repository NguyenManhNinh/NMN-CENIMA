const Voucher = require('../models/Voucher');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

// --- PUBLIC: Get available vouchers for payment page ---
// Logic mới: Trả về voucher trong ví của user (đã được cấp) với số lượt còn lại
exports.getAvailableVouchers = catchAsync(async (req, res, next) => {
  const now = new Date();
  const userId = req.user?.id;

  // Nếu chưa đăng nhập, trả về rỗng
  if (!userId) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: { vouchers: [] }
    });
  }

  // Lấy UserVoucher của user (còn lượt dùng, còn ACTIVE)
  const UserVoucher = require('../models/UserVoucher');
  const userVouchers = await UserVoucher.find({
    userId: userId,
    status: 'ACTIVE'
  }).populate({
    path: 'voucherId',
    select: 'code type value maxDiscount validFrom validTo status'
  });

  // Lọc voucher còn hiệu lực
  const validVouchers = userVouchers
    .filter(uv => {
      const voucher = uv.voucherId;
      if (!voucher || voucher.status !== 'ACTIVE') return false;
      if (now < voucher.validFrom || now > voucher.validTo) return false;
      if (uv.usedCount >= uv.quantity) return false;
      if (uv.expiresAt && now > uv.expiresAt) return false;
      return true;
    })
    .map(uv => ({
      _id: uv.voucherId._id,
      code: uv.voucherId.code,
      type: uv.voucherId.type,
      value: uv.voucherId.value,
      maxDiscount: uv.voucherId.maxDiscount,
      validTo: uv.voucherId.validTo,
      quantity: uv.quantity,
      usedCount: uv.usedCount,
      remainingUses: uv.quantity - uv.usedCount
    }));

  res.status(200).json({
    status: 'success',
    results: validVouchers.length,
    data: { vouchers: validVouchers }
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
// Logic: Cho phép user nhập mã voucher trực tiếp (copy từ promotion content)
// Không yêu cầu claim trước - kiểm tra trực tiếp trong Voucher collection
exports.applyVoucher = catchAsync(async (req, res, next) => {
  const { code, totalAmount } = req.body;
  const userId = req.user?.id;

  if (!code || !totalAmount) {
    return next(new AppError('Vui lòng cung cấp mã giảm giá và tổng tiền', 400));
  }

  if (!userId) {
    return next(new AppError('Vui lòng đăng nhập để sử dụng mã giảm giá', 401));
  }

  // 1. Tìm voucher theo code
  const voucher = await Voucher.findOne({ code: code.toUpperCase() });

  if (!voucher) {
    return next(new AppError('Mã giảm giá không tồn tại!', 404));
  }

  // 2. Check voucher status
  if (voucher.status !== 'ACTIVE') {
    return next(new AppError('Mã giảm giá không khả dụng!', 400));
  }

  // 3. Check thời hạn
  const now = new Date();
  if (now < voucher.validFrom || now > voucher.validTo) {
    return next(new AppError('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực!', 400));
  }

  // 4. Check usage limit (global)
  if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
    return next(new AppError('Mã giảm giá đã hết lượt sử dụng!', 400));
  }

  // 5. Check if user already used this voucher (PAID orders only)
  const Order = require('../models/Order');
  const usedOrder = await Order.findOne({
    userId: userId,
    voucherId: voucher._id,
    status: 'PAID'
  });

  if (usedOrder) {
    return next(new AppError('Bạn đã sử dụng mã giảm giá này rồi!', 400));
  }

  // 5. Tính số tiền giảm
  let discountAmount = 0;
  if (voucher.type === 'FIXED') {
    discountAmount = voucher.value;
  } else if (voucher.type === 'PERCENT') {
    discountAmount = (totalAmount * voucher.value) / 100;
    if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
      discountAmount = voucher.maxDiscount;
    }
  }

  // Không giảm quá tổng tiền
  if (discountAmount > totalAmount) discountAmount = totalAmount;

  // 6. Trả kết quả (chưa trừ lượt - chỉ trừ khi thanh toán thành công)
  res.status(200).json({
    status: 'success',
    data: {
      code: voucher.code,
      discountAmount,
      finalAmount: totalAmount - discountAmount,
      type: voucher.type,
      value: voucher.value,
      maxDiscount: voucher.maxDiscount,
      remainingUses: voucher.usageLimit ? voucher.usageLimit - voucher.usageCount : null
    }
  });
});

// --- ADMIN: Assign Voucher to User ---
exports.assignVoucherToUser = catchAsync(async (req, res, next) => {
  const { userId, voucherId, quantity, expiresAt } = req.body;

  if (!userId || !voucherId) {
    return next(new AppError('Vui lòng cung cấp userId và voucherId', 400));
  }

  // Kiểm tra voucher tồn tại
  const voucher = await Voucher.findById(voucherId);
  if (!voucher) {
    return next(new AppError('Voucher không tồn tại', 404));
  }

  // Kiểm tra user tồn tại
  const User = require('../models/User');
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User không tồn tại', 404));
  }

  // Tạo hoặc cập nhật UserVoucher
  const UserVoucher = require('../models/UserVoucher');

  // Tìm xem đã có chưa
  let userVoucher = await UserVoucher.findOne({
    userId: userId,
    voucherId: voucherId,
    status: 'ACTIVE'
  });

  if (userVoucher) {
    // Đã có → cộng thêm quantity
    userVoucher.quantity += quantity || 1;
    if (expiresAt) userVoucher.expiresAt = expiresAt;
    await userVoucher.save();
  } else {
    // Chưa có → tạo mới
    userVoucher = await UserVoucher.create({
      userId,
      voucherId,
      quantity: quantity || 1,
      usedCount: 0,
      expiresAt: expiresAt || null
    });
  }

  res.status(201).json({
    status: 'success',
    message: `Đã cấp ${quantity || 1} lượt voucher cho user`,
    data: { userVoucher }
  });
});

