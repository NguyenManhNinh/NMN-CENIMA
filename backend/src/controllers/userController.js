const User = require('../models/User');
const Role = require('../models/Role');
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

/**
 * Admin: Danh sách user với pagination, search, filter
 * GET /api/v1/users/admin/list?role=user&search=abc&page=1&limit=20&isActive=true
 */
exports.adminGetUserList = catchAsync(async (req, res, next) => {
  const { role, search, page = 1, limit = 20, isActive } = req.query;

  // Build query filter
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('+isActive')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: users
  });
});

/**
 * Admin: Bật/Tắt tình trạng hoạt động user (toggle isActive)
 * PATCH /api/v1/users/admin/:id/toggle-active
 */
exports.toggleUserActive = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('+isActive');
  if (!user) {
    return next(new AppError('Không tìm thấy người dùng!', 404));
  }

  // Không cho tắt chính mình
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError('Không thể tắt tài khoản của chính bạn!', 400));
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: user
  });
});

/**
 * Admin: Tạo tài khoản mới (đã kích hoạt sẵn)
 * POST /api/v1/users/admin/create
 */
exports.adminCreateUser = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, role, gender, birthday, address, city, district } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Vui lòng nhập tên, email và mật khẩu!', 400));
  }

  // Kiểm tra email trùng
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return next(new AppError('Email này đã được sử dụng!', 400));
  }

  // Validate role tồn tại trong Role collection
  if (role && role !== 'user') {
    const roleExists = await Role.findOne({ name: role, isActive: true });
    if (!roleExists) {
      return next(new AppError(`Chức vụ '${role}' không tồn tại hoặc đã bị tắt!`, 400));
    }
  }

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone: phone || '',
    role: role || 'user',
    gender,
    birthday,
    address,
    city,
    district,
    isActive: true,
    authType: 'local'
  });

  // Ẩn password
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    data: newUser
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

/**
 * Admin: Đổi role user (thăng chức / hạ chức)
 * PATCH /api/v1/users/admin/:id/change-role
 */
exports.changeUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;

  if (!role) {
    return next(new AppError('Vui lòng chọn chức vụ!', 400));
  }

  // Validate role tồn tại trong Role collection
  const roleExists = await Role.findOne({ name: role, isActive: true });
  if (!roleExists) {
    return next(new AppError(`Chức vụ '${role}' không tồn tại hoặc đã bị tắt!`, 400));
  }

  // Không cho tự đổi role chính mình
  if (req.params.id === req.user.id) {
    return next(new AppError('Không thể thay đổi chức vụ của chính mình!', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('Không tìm thấy người dùng!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

/**
 * Admin: Tìm user theo email (dùng cho thăng chức)
 * GET /api/v1/users/admin/search-email?email=xxx
 */
exports.searchUserByEmail = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  if (!email) {
    return next(new AppError('Vui lòng nhập email!', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+isActive');
  if (!user) {
    return next(new AppError('Không tìm thấy tài khoản với email này!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt
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
  const filteredBody = filterObj(req.body, 'name', 'email', 'phone', 'address', 'city', 'district', 'gender', 'birthday', 'avatar');

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
  // 1) Yêu cầu xác nhận mật khẩu
  const { password } = req.body;
  if (!password) {
    return next(new AppError('Vui lòng nhập mật khẩu để xác nhận xóa tài khoản!', 400));
  }

  // 2) Kiểm tra mật khẩu
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Mật khẩu không chính xác!', 401));
  }

  // 3) Soft delete
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
    'rank',
    'gender',
    'birthday',
    'address',
    'city',
    'district'
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
