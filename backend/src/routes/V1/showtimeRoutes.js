const express = require('express');
const showtimeController = require('../../controllers/showtimeController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Showtimes
 *   description: Quản lý lịch chiếu
 */

/**
 * @swagger
 * /showtimes:
 *   get:
 *     summary: Lấy danh sách lịch chiếu
 *     tags: [Showtimes]
 *     parameters:
 *       - in: query
 *         name: movieId
 *         schema:
 *           type: string
 *         description: Lọc theo phim
 *       - in: query
 *         name: cinemaId
 *         schema:
 *           type: string
 *         description: Lọc theo rạp
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc theo ngày (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Danh sách lịch chiếu
 *   post:
 *     summary: Tạo lịch chiếu (Admin)
 *     tags: [Showtimes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - roomId
 *               - startAt
 *               - basePrice
 *             properties:
 *               movieId:
 *                 type: string
 *               roomId:
 *                 type: string
 *               startAt:
 *                 type: string
 *                 format: date-time
 *               basePrice:
 *                 type: number
 *               format:
 *                 type: string
 *                 enum: [2D, 3D, IMAX]
 *     responses:
 *       201:
 *         description: Tạo lịch chiếu thành công
 *       400:
 *         description: Xung đột lịch chiếu
 */
router
  .route('/')
  .get(showtimeController.getAllShowtimes)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    showtimeController.createShowtime
  );

/**
 * @swagger
 * /showtimes/{id}:
 *   delete:
 *     summary: Xóa lịch chiếu (Admin)
 *     tags: [Showtimes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Xóa thành công
 */
router
  .route('/:id')
  .get(showtimeController.getShowtimeById)
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    showtimeController.deleteShowtime
  );

module.exports = router;

