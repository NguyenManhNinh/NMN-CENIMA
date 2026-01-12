/**
 * Middleware: Check user có bị ban chat không
 * Áp dụng cho: create review, reply, like
 * KHÔNG áp dụng cho: report (user bị ban vẫn có thể report)
 */
const AppError = require('../utils/AppError');

const requireNotChatBanned = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new AppError('Vui lòng đăng nhập', 401));
  }

  const chatBanUntil = user.chatBanUntil;

  if (chatBanUntil && Date.now() < new Date(chatBanUntil).getTime()) {
    const banDate = new Date(chatBanUntil);
    const banEndTime = banDate.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
    return next(
      new AppError(`Bạn bị hạn chế bình luận đến ${banEndTime}`, 403)
    );
  }

  next();
};

module.exports = requireNotChatBanned;
