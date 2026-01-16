const AppError = require('../utils/AppError');

// Xử lý lỗi CastError (ví dụ: ID không hợp lệ)
const handleCastErrorDB = err => {
  const message = `Dữ liệu không hợp lệ: ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Xử lý lỗi trùng lặp (Duplicate Fields) - dùng keyValue thay vì errmsg
const handleDuplicateFieldsDB = err => {
  // MongoDB 4.x+ dùng keyValue thay vì errmsg
  const keyValue = err.keyValue || {};
  const field = Object.keys(keyValue)[0] || 'field';
  const value = keyValue[field] || 'unknown';
  const message = `Giá trị trùng lặp cho ${field}: "${value}". Vui lòng sử dụng giá trị khác!`;
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
    console.error('ERROR', err);

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
    // Clone Error đúng cách - spread operator không copy non-enumerable props
    let error = Object.create(err);
    error.message = err.message;
    error.name = err.name;
    error.code = err.code;
    error.keyValue = err.keyValue;
    error.errors = err.errors;
    error.statusCode = err.statusCode;
    error.status = err.status;
    error.isOperational = err.isOperational;

    // Xử lý các loại lỗi DB và chuyển thành AppError (400)
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
