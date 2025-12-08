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

module.exports = router;

