// Hàm bao bọc để bắt lỗi trong các hàm async (thay thế cho try/catch lặp lại)
module.exports = fn => {
  return (req, res, next) => {
    // Nếu hàm fn trả về promise bị reject, lỗi sẽ được chuyển đến middleware xử lý lỗi (next)
    fn(req, res, next).catch(next);
  };
};
