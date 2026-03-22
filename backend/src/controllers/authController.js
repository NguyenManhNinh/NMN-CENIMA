const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const RefreshToken = require('../models/RefreshToken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../services/emailService');

// Hàm tạo Access Token — chứa id, role, tokenType để phân biệt và debug
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, tokenType: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Tạo token và gửi response
// options.portal = 'admin' → dùng cookie riêng 'adminRefreshToken' (tránh đè session user)
const createSendToken = async (user, statusCode, res, options = {}) => {
  const accessToken = signToken(user);

  // Tạo Refresh Token (7 ngày)
  const refreshToken = new RefreshToken({
    user: user._id,
    token: crypto.randomBytes(40).toString('hex'),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: res.req.ip
  });
  await refreshToken.save();

  // Cookie name tách biệt: admin dùng 'adminRefreshToken', user dùng 'refreshToken'
  const cookieName = options.portal === 'admin' ? 'adminRefreshToken' : 'refreshToken';

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,      // Chống XSS
    sameSite: 'lax',     // Chống CSRF
    secure: process.env.NODE_ENV === 'production'
  };
  res.cookie(cookieName, refreshToken.token, cookieOptions);

  // Ẩn mật khẩu và OTP khỏi output
  user.password = undefined;
  user.otpCode = undefined;
  user.otpExpires = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    data: {
      user
    }
  });
};

// Hàm sinh mã OTP ngẫu nhiên 4 số
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Đăng ký tài khoản mới
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Kiểm tra xem email đã tồn tại chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email này đã được sử dụng!', 400));
  }

  // Sinh mã OTP
  const otp = generateOTP();
  // Thời gian hết hạn OTP
  const otpExpires = Date.now() + 5 * 60 * 1000;

  // Tạo user mới với isActive: false
  const newUser = await User.create({
    name,
    email,
    password,
    phone,
    isActive: false,
    otpCode: otp,
    otpExpires: otpExpires
  });

  // Gửi email chứa OTP
  try {
    await sendEmail.sendOTP(newUser.email, otp);

    res.status(201).json({
      status: 'success',
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP kích hoạt tài khoản.',
      data: {
        email: newUser.email
      }
    });
  } catch (err) {
    // Nếu gửi email lỗi, có thể xóa user hoặc giữ lại để user yêu cầu gửi lại OTP
    // Ở đây ta tạm thời báo lỗi nhưng vẫn giữ user (để user có thể resend OTP sau này)
    return next(new AppError('Đã có lỗi khi gửi email! Vui lòng thử lại sau.', 500));
  }
});

// Xác thực tài khoản bằng OTP
exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError('Vui lòng cung cấp email và mã OTP!', 400));
  }

  // Tìm user với email và otp khớp, đồng thời otp chưa hết hạn
  const user = await User.findOne({
    email,
    otpCode: otp,
    otpExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Mã OTP không chính xác hoặc đã hết hạn!', 400));
  }

  // Kích hoạt tài khoản và xóa OTP
  user.isActive = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Gửi email chào mừng
  try {
    await sendEmail.sendWelcome(user.email, user.name);
  } catch (e) {
    console.error('Send Welcome Email Failed:', e);
  }

  // Khóa bước phát hành token nếu role đang bị tắt
  const userRole = await Role.findOne({ name: user.role });
  if (userRole && !userRole.isActive) {
    return next(new AppError(`Tài khoản đã được xác thực, nhưng chức vụ "${user.role}" hiện đang bị tắt. Vui lòng liên hệ quản trị viên để đăng nhập.`, 403));
  }

  // Đăng nhập luôn cho user (gửi token)
  await createSendToken(user, 200, res);
});

// Đăng nhập
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Tìm user và lấy các trường cần thiết cho bảo mật
  const user = await User.findOne({ email }).select('+password +isActive +loginAttempts +lockUntil');

  // 2) Kiểm tra tài khoản có bị khóa không
  if (user && user.lockUntil && user.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    return next(new AppError(`Tài khoản đã bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau ${remainingTime} phút.`, 423));
  }

  // 3) Kiểm tra user tồn tại
  if (!user) {
    return next(new AppError('Email hoặc mật khẩu không chính xác!', 401));
  }

  // Nếu user đăng ký qua OAuth (Google) → chưa có password
  // → Tự động lưu password mà user vừa nhập, rồi đăng nhập luôn
  if (!user.password) {
    user.password = password;
    await user.save(); // pre-save middleware sẽ hash password
    // Reload để lấy hashed password cho bước compare bên dưới
    const reloaded = await User.findById(user._id).select('+password +isActive +loginAttempts +lockUntil');
    user.password = reloaded.password;
  }

  // Kiểm tra mật khẩu đúng
  if (!(await user.correctPassword(password, user.password))) {
    await user.incLoginAttempts();
    const updatedUser = await User.findById(user._id).select('+loginAttempts +lockUntil');
    if (updatedUser.lockUntil && updatedUser.lockUntil > Date.now()) {
      return next(new AppError('Tài khoản đã bị khóa do đăng nhập sai quá 5 lần. Vui lòng thử lại sau 30 phút.', 423));
    }
    return next(new AppError('Email hoặc mật khẩu không chính xác!', 401));
  }

  // 4) Kiểm tra tài khoản đã kích hoạt chưa
  if (!user.isActive) {
    return next(new AppError('Tài khoản chưa được kích hoạt! Vui lòng kiểm tra email để xác thực.', 401));
  }

  // 5) Kiểm tra chức vụ có đang hoạt động không
  const userRole = await Role.findOne({ name: user.role });
  if (userRole && !userRole.isActive) {
    return next(new AppError(`Chức vụ "${user.role}" hiện đang bị tắt. Vui lòng liên hệ quản trị viên.`, 403));
  }

  // 6) Reset số lần đăng nhập sai khi login thành công
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // 7) Gửi token cho client
  await createSendToken(user, 200, res);
});

// Đăng nhập dành riêng cho Admin Portal
// Chỉ cho phép role: admin, manager — từ chối mọi role khác TRƯỚC khi cấp token
exports.adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Tìm user và lấy các trường cần thiết cho bảo mật
  const user = await User.findOne({ email }).select('+password +isActive +loginAttempts +lockUntil');

  // 2) Kiểm tra tài khoản có bị khóa không
  if (user && user.lockUntil && user.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    return next(new AppError(`Tài khoản đã bị khóa. Vui lòng thử lại sau ${remainingTime} phút.`, 423));
  }

  // 3) Kiểm tra user tồn tại và mật khẩu đúng
  // Nếu user đăng ký qua OAuth (Google) → không có password → báo lỗi rõ ràng
  if (!user) {
    return next(new AppError('Email hoặc mật khẩu không chính xác!', 401));
  }

  // Nếu user OAuth chưa có password → tự động lưu password vừa nhập
  if (!user.password) {
    user.password = password;
    await user.save();
    // Reload user with hashed password
    const reloadedUser = await User.findById(user._id).select('+password +isActive +loginAttempts +lockUntil');
    user.password = reloadedUser.password;
  }

  if (!(await user.correctPassword(password, user.password))) {
    await user.incLoginAttempts();
    const updatedUser = await User.findById(user._id).select('+loginAttempts +lockUntil');
    if (updatedUser.lockUntil && updatedUser.lockUntil > Date.now()) {
      return next(new AppError('Tài khoản đã bị khóa do đăng nhập sai quá 5 lần. Vui lòng thử lại sau 30 phút.', 423));
    }
    return next(new AppError('Email hoặc mật khẩu không chính xác!', 401));
  }

  // 4) Kiểm tra tài khoản đã kích hoạt chưa
  if (!user.isActive) {
    return next(new AppError('Tài khoản chưa được kích hoạt!', 401));
  }

  // 5) Kiểm tra chức vụ có đang hoạt động không
  const userRole = await Role.findOne({ name: user.role });
  if (userRole && !userRole.isActive) {
    return next(new AppError(`Chức vụ "${user.role}" hiện đang bị tắt. Không thể đăng nhập.`, 403));
  }

  // 6) KIỂM TRA QUYỀN ADMIN — Chặn trước khi cấp token
  // Role "user" (khách hàng) luôn bị chặn
  if (user.role === 'user') {
    return next(new AppError('Tài khoản không có quyền truy cập trang quản trị!', 403));
  }

  // Kiểm tra role có quyền truy cập admin không (isMaster hoặc có permissions)
  if (userRole && !userRole.isMaster) {
    if (!userRole.permissions || userRole.permissions.length === 0) {
      return next(new AppError('Chức vụ của bạn chưa được phân quyền! Liên hệ quản trị viên.', 403));
    }
  } else if (!userRole && !user.isMaster) {
    // Không có roles collection và user không có isMaster
    // Cho phép nếu role không phải 'user' (đã chặn ở trên)
  }

  // 7) Reset số lần đăng nhập sai
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // 8) Gắn permissions vào user object để frontend lưu
  if (userRole) {
    user._doc.permissions = userRole.isMaster ? ['*'] : (userRole.permissions || []);
    user._doc.isMaster = userRole.isMaster || false;
  } else if (user.isMaster) {
    // Fallback: nếu không có roles collection, check isMaster trên user document
    user._doc.permissions = ['*'];
    user._doc.isMaster = true;
  }

  // 9) Cấp token với cookie riêng cho admin portal
  await createSendToken(user, 200, res, { portal: 'admin' });
});

// Refresh Token (Rotation)
exports.refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  const ipAddress = req.ip;

  if (!token) {
    return next(new AppError('Refresh Token is required!', 400));
  }

  // Tìm Refresh Token trong DB
  const refreshToken = await RefreshToken.findOne({ token }).populate('user');

  // 1. Nếu không tìm thấy token -> Có thể token đã bị xóa hoặc giả mạo
  if (!refreshToken) {
    return next(new AppError('Invalid Refresh Token', 400));
  }

  // 2. Nếu token đã bị Revoked -> Cảnh báo bảo mật (Token Reuse)
  if (refreshToken.revoked) {
    // Xóa tất cả Refresh Token của user này để bảo vệ tài khoản
    await RefreshToken.updateMany({ user: refreshToken.user._id }, { revoked: Date.now(), revokedByIp: ipAddress });
    return next(new AppError('Security Alert: Token Reuse Detected! Please login again.', 403));
  }

  // 3. Nếu token đã hết hạn
  if (refreshToken.isExpired) {
    return next(new AppError('Refresh Token Expired', 403));
  }

  // 4. Rotation: Revoke token cũ và cấp token mới
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = crypto.randomBytes(40).toString('hex'); // Placeholder, thực tế sẽ tạo mới bên dưới
  await refreshToken.save();

  // Tạo cặp token mới
  const newAccessToken = signToken(refreshToken.user._id);
  const newRefreshToken = new RefreshToken({
    user: refreshToken.user._id,
    token: crypto.randomBytes(40).toString('hex'),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress
  });
  await newRefreshToken.save();

  // Cập nhật link replacement
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();

  // Gửi Cookie mới
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };
  res.cookie('refreshToken', newRefreshToken.token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token: newAccessToken,
    data: {
      user: refreshToken.user
    }
  });
});

// Logout (Revoke Token) — xử lý cả cookie user và admin
exports.logout = catchAsync(async (req, res, next) => {
  // Revoke cả 2 cookie (user + admin) nếu có
  const userToken = req.cookies.refreshToken;
  const adminToken = req.cookies.adminRefreshToken;

  if (userToken) {
    await RefreshToken.findOneAndUpdate(
      { token: userToken },
      { revoked: Date.now(), revokedByIp: req.ip }
    );
  }
  if (adminToken) {
    await RefreshToken.findOneAndUpdate(
      { token: adminToken },
      { revoked: Date.now(), revokedByIp: req.ip }
    );
  }

  // Xóa cả 2 cookie
  const clearOptions = { expires: new Date(Date.now() + 10 * 1000), httpOnly: true };
  res.cookie('refreshToken', 'loggedout', clearOptions);
  res.cookie('adminRefreshToken', 'loggedout', clearOptions);

  res.status(200).json({ status: 'success' });
});

// Quên mật khẩu: Gửi OTP
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Vui lòng cung cấp email!', 400));
  }

  const user = await User.findOne({ email });

  // Chống email enumeration: luôn trả 200 dù email có tồn tại hay không
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'Nếu email tồn tại, mã OTP đã được gửi!'
    });
  }

  // Sinh OTP mới
  const otp = generateOTP();
  user.otpCode = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // Gửi email
  try {
    await sendEmail.sendOTP(user.email, otp);

    res.status(200).json({
      status: 'success',
      message: 'Nếu email tồn tại, mã OTP đã được gửi!'
    });
  } catch (err) {
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Đã có lỗi khi gửi email! Vui lòng thử lại sau.', 500));
  }
});

// Đặt lại mật khẩu với OTP
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return next(new AppError('Vui lòng cung cấp đầy đủ thông tin!', 400));
  }

  const user = await User.findOne({
    email,
    otpCode: otp,
    otpExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Mã OTP không chính xác hoặc đã hết hạn!', 400));
  }

  // Cập nhật mật khẩu mới
  user.password = password;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save(); // Middleware pre-save sẽ hash password

  await createSendToken(user, 200, res);
});

// Lấy thông tin user hiện tại
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

//  GOOGLE OAUTH
const googleAuthService = require('../services/googleAuthService');

// Redirect đến Google Login
exports.googleAuth = catchAsync(async (req, res, next) => {
  const authUrl = googleAuthService.getAuthUrl();
  res.redirect(authUrl);
});

// Xử lý callback từ Google
exports.googleCallback = catchAsync(async (req, res, next) => {
  const { code } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (!code) {
    return res.redirect(`${FRONTEND_URL}?error=no_code`);
  }

  try {
    // Lấy thông tin user từ Google
    const googleUser = await googleAuthService.getUserInfo(code);

    // Tìm hoặc tạo user
    let user = await User.findOne({
      $or: [
        { authId: googleUser.googleId, authType: 'google' },
        { email: googleUser.email }
      ]
    });

    if (user) {
      // Nếu user tồn tại, cập nhật Google ID nếu chưa có
      if (!user.authId) {
        user.authId = googleUser.googleId;
        user.authType = 'google';
        if (googleUser.avatar) user.avatar = googleUser.avatar;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Tạo user mới
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        authType: 'google',
        authId: googleUser.googleId,
        avatar: googleUser.avatar,
        isActive: true // Google email đã xác thực
      });
    }

    // Khóa bước phát hành token nếu role đang bị tắt
    const userRole = await Role.findOne({ name: user.role });
    if (userRole && !userRole.isActive) {
      return res.redirect(`${FRONTEND_URL}?error=role_inactive&role=${user.role}`);
    }

    // Tạo Access Token
    const accessToken = signToken(user._id);

    // Tạo Refresh Token
    const refreshToken = new RefreshToken({
      user: user._id,
      token: crypto.randomBytes(40).toString('hex'),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdByIp: req.ip
    });
    await refreshToken.save();

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken.token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    // Ẩn fields nhạy cảm
    user.password = undefined;
    user.otpCode = undefined;
    user.otpExpires = undefined;

    // Lấy permissions từ role hoặc user document
    const userRole = await Role.findOne({ name: user.role });
    let userPermissions = [];
    let isUserMaster = false;
    if (userRole) {
      isUserMaster = userRole.isMaster || false;
      userPermissions = userRole.isMaster ? ['*'] : (userRole.permissions || []);
    } else if (user.isMaster) {
      isUserMaster = true;
      userPermissions = ['*'];
    }

    // Encode user data để truyền qua URL
    const userData = encodeURIComponent(JSON.stringify({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isMaster: isUserMaster,
      permissions: userPermissions
    }));

    // Redirect về frontend với token
    res.redirect(`${FRONTEND_URL}/oauth-callback?token=${accessToken}&user=${userData}`);
  } catch (err) {
    console.error('Google OAuth Error:', err);
    res.redirect(`${FRONTEND_URL}?error=google_auth_failed`);
  }
});
