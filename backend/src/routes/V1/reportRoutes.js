const express = require('express');
const reportController = require('../../controllers/reportController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Báo cáo và thống kê (Admin/Manager)
 */

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin', 'manager'));

/**
 * @swagger
 * /reports/revenue:
 *   get:
 *     summary: Báo cáo doanh thu
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Chu kỳ báo cáo
 *     responses:
 *       200:
 *         description: Dữ liệu doanh thu
 */
router.get('/revenue', reportController.getRevenueStats);

/**
 * @swagger
 * /reports/top-movies:
 *   get:
 *     summary: Top phim bán chạy
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sách top phim
 */
router.get('/top-movies', reportController.getTopMovies);

/**
 * @swagger
 * /reports/occupancy:
 *   get:
 *     summary: Tỷ lệ lấp đầy phòng
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tỷ lệ occupancy
 */
router.get('/occupancy', reportController.getOccupancyRate);

// ========== DASHBOARD ENDPOINTS ==========

/** GET /reports/dashboard/stats — 4 thẻ thống kê */
router.get('/dashboard/stats', reportController.getDashboardStats);

/** GET /reports/dashboard/revenue-7d — Doanh thu 7 ngày (BarChart) */
router.get('/dashboard/revenue-7d', reportController.getRevenue7Days);

/** GET /reports/dashboard/revenue-30d — Xu hướng 30 ngày (LineChart) */
router.get('/dashboard/revenue-30d', reportController.getRevenue30Days);

/** GET /reports/dashboard/genre-stats — Thể loại phim (PieChart) */
router.get('/dashboard/genre-stats', reportController.getGenreStats);

/** GET /reports/dashboard/today-showtimes — Suất chiếu hôm nay */
router.get('/dashboard/today-showtimes', reportController.getTodayShowtimes);

/** GET /reports/dashboard/recent-orders — Đơn hàng gần đây */
router.get('/dashboard/recent-orders', reportController.getRecentOrders);

/** GET /reports/dashboard/top-combos — Top combo bán chạy */
router.get('/dashboard/top-combos', reportController.getTopCombos);

/** GET /reports/dashboard/membership — Phân bổ thành viên */
router.get('/dashboard/membership', reportController.getMembershipStats);

/** GET /reports/dashboard/promotions — Khuyến mãi đang hoạt động */
router.get('/dashboard/promotions', reportController.getActivePromotions);

/** GET /reports/dashboard/today-summary — Tổng quan nhanh hôm nay */
router.get('/dashboard/today-summary', reportController.getTodaySummary);

module.exports = router;
