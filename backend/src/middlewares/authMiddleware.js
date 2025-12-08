const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Middleware bảo vệ route: Yêu cầu đăng nhập
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Lấy token và kiểm tra xem nó có tồn tại không
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Bạn chưa đăng nhập! Vui lòng đăng nhập để truy cập.', 401)
    );
  }

  // 2) Xác thực token (Verification)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Kiểm tra xem user có còn tồn tại không
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'Người dùng sở hữu token này không còn tồn tại.',
        401
      )
    );
  }

  // 4) Kiểm tra xem user có đổi mật khẩu sau khi token được cấp không
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Người dùng gần đây đã đổi mật khẩu! Vui lòng đăng nhập lại.',
        401
      )
    );
  }

  // Cấp quyền truy cập cho route
  req.user = currentUser;
  next();
});

// Middleware phân quyền: Chỉ cho phép các role nhất định
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'manager']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Bạn không có quyền thực hiện hành động này!', 403)
      );
    }

    next();
  };
};

// Middleware tùy chọn: Không bắt buộc đăng nhập, nhưng nếu có token thì xác thực
exports.optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // Không có token -> tiếp tục mà không có user
    return next();
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && !currentUser.changedPasswordAfter(decoded.iat)) {
      req.user = currentUser;
    }
  } catch (err) {
    // Token không hợp lệ -> bỏ qua, tiếp tục như guest
  }

  next();
});
