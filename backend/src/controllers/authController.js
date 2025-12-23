const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../services/emailService');

// Hàm tạo và gửi Token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m' // Access Token ngắn hạn (15 phút)
  });
};

const createSendToken = async (user, statusCode, res) => {
  const accessToken = signToken(user._id);

  // Tạo Refresh Token (7 ngày)
  const refreshToken = new RefreshToken({
    user: user._id,
    token: crypto.randomBytes(40).toString('hex'),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdByIp: res.req.ip
  });
  await refreshToken.save();

  // Gửi Refresh Token qua Cookie (httpOnly)
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true, // Chống XSS
    secure: process.env.NODE_ENV === 'production' // Chỉ gửi qua HTTPS ở production
  };
  res.cookie('refreshToken', refreshToken.token, cookieOptions);

  // Ẩn mật khẩu và OTP khỏi output
  user.password = undefined;
  user.otpCode = undefined;
  user.otpExpires = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: accessToken, // Client lưu Access Token vào Memory/Local Storage
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

  // 3) Kiểm tra user tồn tại và mật khẩu đúng
  if (!user || !(await user.correctPassword(password, user.password))) {
    // Tăng số lần đăng nhập sai nếu user tồn tại
    if (user) {
      await user.incLoginAttempts();

      // Kiểm tra nếu vừa bị khóa
      const updatedUser = await User.findById(user._id).select('+loginAttempts +lockUntil');
      if (updatedUser.lockUntil && updatedUser.lockUntil > Date.now()) {
        return next(new AppError('Tài khoản đã bị khóa do đăng nhập sai quá 5 lần. Vui lòng thử lại sau 30 phút.', 423));
      }
    }
    return next(new AppError('Email hoặc mật khẩu không chính xác!', 401));
  }

  // 4) Kiểm tra tài khoản đã kích hoạt chưa
  if (!user.isActive) {
    return next(new AppError('Tài khoản chưa được kích hoạt! Vui lòng kiểm tra email để xác thực.', 401));
  }

  // 5) Reset số lần đăng nhập sai khi login thành công
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // 6) Gửi token cho client
  await createSendToken(user, 200, res);
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

// Logout (Revoke Token)
exports.logout = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await RefreshToken.findOneAndUpdate(
      { token },
      { revoked: Date.now(), revokedByIp: req.ip }
    );
  }

  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
});

// Quên mật khẩu: Gửi OTP
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Vui lòng cung cấp email!', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Không tìm thấy người dùng với email này!', 404));
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
      message: 'Mã OTP đã được gửi đến email của bạn!'
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

// ===================== GOOGLE OAUTH =====================
const googleAuthService = require('../services/googleAuthService');

// Redirect đến Google Login
exports.googleAuth = catchAsync(async (req, res, next) => {
  const authUrl = googleAuthService.getAuthUrl();
  res.redirect(authUrl);
});

// Xử lý callback từ Google
exports.googleCallback = catchAsync(async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(new AppError('Authorization code is required!', 400));
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

    // Tạo và gửi token
    await createSendToken(user, 200, res);
  } catch (err) {
    console.error('Google OAuth Error:', err);
    return next(new AppError('Failed to authenticate with Google', 500));
  }
});

// ===================== FACEBOOK OAUTH =====================
const facebookAuthService = require('../services/facebookAuthService');

// Redirect đến Facebook Login
exports.facebookAuth = catchAsync(async (req, res, next) => {
  const authUrl = facebookAuthService.getAuthUrl();
  res.redirect(authUrl);
});

// Xử lý callback từ Facebook
exports.facebookCallback = catchAsync(async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(new AppError('Authorization code is required!', 400));
  }

  try {
    // Lấy thông tin user từ Facebook
    const fbUser = await facebookAuthService.getUserInfo(code);

    if (!fbUser.email) {
      return next(new AppError('Không thể lấy email từ Facebook. Vui lòng cấp quyền email!', 400));
    }

    // Tìm hoặc tạo user
    let user = await User.findOne({
      $or: [
        { authId: fbUser.facebookId, authType: 'facebook' },
        { email: fbUser.email }
      ]
    });

    if (user) {
      // Nếu user tồn tại, cập nhật Facebook ID nếu chưa có
      if (!user.authId || user.authType !== 'facebook') {
        user.authId = fbUser.facebookId;
        user.authType = 'facebook';
        if (fbUser.avatar) user.avatar = fbUser.avatar;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Tạo user mới
      user = await User.create({
        name: fbUser.name,
        email: fbUser.email,
        authType: 'facebook',
        authId: fbUser.facebookId,
        avatar: fbUser.avatar,
        isActive: true // Facebook email đã xác thực
      });
    }

    // Tạo và gửi token
    await createSendToken(user, 200, res);
  } catch (err) {
    console.error('Facebook OAuth Error:', err);
    return next(new AppError('Failed to authenticate with Facebook', 500));
  }
});
