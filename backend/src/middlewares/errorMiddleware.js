const AppError = require('../utils/AppError');

// Xử lý lỗi CastError (ví dụ: ID không hợp lệ)
const handleCastErrorDB = err => {
  const message = `Dữ liệu không hợp lệ: ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Xử lý lỗi trùng lặp (Duplicate Fields)
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Giá trị trùng lặp: ${value}. Vui lòng sử dụng giá trị khác!`;
  return new AppError(message, 400);
};

// Xử lý lỗi Validation
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Dữ liệu đầu vào không hợp lệ. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Xử lý lỗi JWT
const handleJWTError = () =>
  new AppError('Token không hợp lệ. Vui lòng đăng nhập lại!', 401);

const handleJWTExpiredError = () =>
  new AppError('Token đã hết hạn. Vui lòng đăng nhập lại!', 401);

// Gửi lỗi trong môi trường Development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Gửi lỗi trong môi trường Production
const sendErrorProd = (err, res) => {
  // Lỗi Operational: Lỗi đã biết, gửi thông báo cho client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Lỗi Programming hoặc lỗi lạ: Không rò rỉ chi tiết lỗi cho client
    console.error('ERROR 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Đã có lỗi xảy ra, vui lòng thử lại sau!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
