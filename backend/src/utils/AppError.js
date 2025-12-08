// Class xử lý lỗi tùy chỉnh, kế thừa từ Error mặc định của JS
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Nếu statusCode bắt đầu bằng 4 (4xx) thì là lỗi fail, ngược lại là error (5xx)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Đánh dấu lỗi này là lỗi hoạt động (operational) để phân biệt với lỗi lập trình
    this.isOperational = true;

    // Ghi lại stack trace nhưng không bao gồm constructor này
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
