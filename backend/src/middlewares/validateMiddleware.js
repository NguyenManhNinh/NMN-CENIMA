const AppError = require('../utils/AppError');

const validate = schema => (req, res, next) => {
  try {
    // Parse body với schema của Zod
    schema.parse(req.body);
    next();
  } catch (err) {
    // Nếu có lỗi validation, trả về lỗi 400
    // Lấy message lỗi đầu tiên từ Zod error
    const message = err.errors[0].message;
    next(new AppError(message, 400));
  }
};

module.exports = validate;
