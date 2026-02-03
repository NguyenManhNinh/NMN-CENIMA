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

/**
 * Admin: Cập nhật thông tin user
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  // Không cho phép cập nhật password qua route này
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('Không thể cập nhật mật khẩu qua route này!', 400)
    );
  }

  // Lọc các trường cho phép cập nhật
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'phone',
    'role',
    'isActive',
    'avatar',
    'rank'
  );

  const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });

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

/**
 * Admin: Xóa user (hard delete hoặc soft delete)
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('Không tìm thấy người dùng với ID này', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * GET /api/v1/users/unsubscribe
 * Hủy đăng ký nhận email thông báo (public - từ link trong email)
 */
exports.unsubscribeNewsletter = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send(`
      <html>
        <head><title>Lỗi</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2>❌ Thiếu thông tin email</h2>
          <p>Link không hợp lệ.</p>
        </body>
      </html>
    `);
  }

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { newsletterSubscribed: false }
  );

  if (!user) {
    return res.status(404).send(`
      <html>
        <head><title>Không tìm thấy</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2>❌ Email không tồn tại trong hệ thống</h2>
        </body>
      </html>
    `);
  }

  res.send(`
    <html>
      <head>
        <title>Hủy đăng ký thành công</title>
        <style>
          body { font-family: 'Segoe UI', Arial; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h2 { color: #1a3a5c; }
          p { color: #666; }
          .success { color: #28a745; font-size: 48px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h2>Hủy đăng ký thành công!</h2>
          <p>Bạn sẽ không nhận được email thông báo ưu đãi từ NMN Cinema nữa.</p>
          <p style="margin-top: 20px; font-size: 14px; color: #999;">
            Nếu thay đổi ý, bạn có thể bật lại trong phần Cài đặt tài khoản.
          </p>
        </div>
      </body>
    </html>
  `);
});

/**
 * PATCH /api/v1/users/me/newsletter
 * Cập nhật cài đặt newsletter (authenticated user)
 */
exports.updateNewsletterSubscription = catchAsync(async (req, res, next) => {
  const { subscribed } = req.body;

  if (typeof subscribed !== 'boolean') {
    return next(new AppError('Vui lòng cung cấp giá trị subscribed (true/false)', 400));
  }

  await User.findByIdAndUpdate(req.user.id, {
    newsletterSubscribed: subscribed
  });

  res.status(200).json({
    status: 'success',
    message: subscribed ? 'Đã bật nhận thông báo email' : 'Đã tắt nhận thông báo email',
    data: { newsletterSubscribed: subscribed }
  });
});
