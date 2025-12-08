const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;
  user.otpCode = undefined;
  user.otpExpires = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Không tìm thấy người dùng với ID này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Không cho phép cập nhật password ở đây
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Tuyến đường này không dành cho việc cập nhật mật khẩu. Vui lòng sử dụng /updateMyPassword.',
        400
      )
    );
  }

  // 2) Lọc các trường cho phép cập nhật
  const filteredBody = filterObj(req.body, 'name', 'email', 'phone', 'address', 'gender', 'birthday', 'avatar');

  // 3) Cập nhật user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Lấy user hiện tại
  const user = await User.findById(req.user.id).select('+password');

  // 2) Kiểm tra mật khẩu cũ
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Mật khẩu hiện tại không chính xác!', 401));
  }

  // 3) Cập nhật mật khẩu mới
  user.password = req.body.password;
  await user.save();

  // 4) Gửi token mới
  createSendToken(user, 200, res);
});
