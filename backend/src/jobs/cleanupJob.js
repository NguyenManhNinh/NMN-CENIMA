/**
 * Cleanup Job - Dọn dẹp dữ liệu cũ
 *
 * Chức năng:
 * 1. Xóa SeatHold đã hết hạn
 * 2. Xóa Showtime đã qua > 7 ngày
 * 3. Đánh dấu Order PENDING quá 30 phút là EXPIRED
 *
 * Schedule: Chạy mỗi ngày lúc 3:00 AM
 */
const cron = require('node-cron');
const SeatHold = require('../models/SeatHold');
const Showtime = require('../models/Showtime');
const Order = require('../models/Order');
const logger = require('../utils/logger');

// Cleanup SeatHold đã hết hạn
const cleanupExpiredHolds = async () => {
  try {
    const result = await SeatHold.deleteMany({
      expiredAt: { $lt: new Date() }
    });
    if (result.deletedCount > 0) {
      logger.info(`[Cleanup] Deleted ${result.deletedCount} expired SeatHolds`);
    }
    return result.deletedCount;
  } catch (err) {
    logger.error('[Cleanup] Error cleaning SeatHolds:', err);
    return 0;
  }
};

// Cleanup Showtime đã qua > 7 ngày
const cleanupOldShowtimes = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await Showtime.deleteMany({
      startAt: { $lt: sevenDaysAgo }
    });

    if (result.deletedCount > 0) {
      logger.info(`[Cleanup] Deleted ${result.deletedCount} old showtimes (> 7 days)`);
    }
    return result.deletedCount;
  } catch (err) {
    logger.error('[Cleanup] Error cleaning old showtimes:', err);
    return 0;
  }
};

// Mark Order PENDING quá 30 phút là EXPIRED
const cleanupPendingOrders = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const result = await Order.updateMany(
      {
        status: 'PENDING',
        createdAt: { $lt: thirtyMinutesAgo }
      },
      {
        $set: { status: 'EXPIRED' }
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`[Cleanup] Marked ${result.modifiedCount} pending orders as EXPIRED`);
    }
    return result.modifiedCount;
  } catch (err) {
    logger.error('[Cleanup] Error cleaning pending orders:', err);
    return 0;
  }
};

// Main cleanup function
const runCleanup = async () => {
  logger.info('[Cleanup] Starting cleanup job...');

  const holds = await cleanupExpiredHolds();
  const showtimes = await cleanupOldShowtimes();
  const orders = await cleanupPendingOrders();

  logger.info(`[Cleanup] Completed: ${holds} holds, ${showtimes} showtimes, ${orders} orders cleaned`);
};

// Schedule job: Chạy mỗi ngày lúc 3:00 AM
const startCleanupJob = () => {
  // Cron format: minute hour day-of-month month day-of-week
  cron.schedule('0 3 * * *', () => {
    runCleanup();
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  logger.info('[Cleanup] Cleanup job scheduled: 3:00 AM daily');

  // Chạy ngay lần đầu khi khởi động (optional)
  // runCleanup();
};

module.exports = {
  startCleanupJob,
  runCleanup, // Export để test thủ công
  cleanupExpiredHolds,
  cleanupOldShowtimes,
  cleanupPendingOrders
};
