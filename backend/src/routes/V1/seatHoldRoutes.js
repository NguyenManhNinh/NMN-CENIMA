const express = require('express');
const seatHoldController = require('../../controllers/seatHoldController');
const authMiddleware = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validateMiddleware');
const {
  createHoldSchema,
  releaseHoldSchema
} = require('../../validations/seatHoldValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SeatHolds
 *   description: Quản lý giữ ghế real-time
 */

/**
 * @swagger
 * /holds/showtime/{showtimeId}:
 *   get:
 *     summary: Lấy danh sách ghế đang được giữ của một suất chiếu
 *     tags: [SeatHolds]
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID suất chiếu
 *     responses:
 *       200:
 *         description: Danh sách ghế đang được giữ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     holds:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           seatCode:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           expiredAt:
 *                             type: string
 *                             format: date-time
 */
router.get('/showtime/:showtimeId', seatHoldController.getHoldsByShowtime);

// Protected routes: Cần đăng nhập để giữ/nhả ghế
router.use(authMiddleware.protect);

/**
 * @swagger
 * /holds:
 *   post:
 *     summary: Giữ ghế (Hold) - Real-time via Socket.io
 *     tags: [SeatHolds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - showtimeId
 *               - seatCode
 *             properties:
 *               showtimeId:
 *                 type: string
 *                 description: ID suất chiếu
 *               seatCode:
 *                 type: string
 *                 description: Mã ghế (VD A1, B2)
 *               groupId:
 *                 type: string
 *                 description: ID nhóm (khi giữ nhiều ghế cùng lúc)
 *     responses:
 *       201:
 *         description: Giữ ghế thành công
 *       409:
 *         description: Ghế đã có người giữ
 */
router.post('/', validate(createHoldSchema), seatHoldController.createHold);

/**
 * @swagger
 * /holds/release:
 *   post:
 *     summary: Nhả ghế (Release) - Real-time via Socket.io
 *     tags: [SeatHolds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - showtimeId
 *               - seatCode
 *             properties:
 *               showtimeId:
 *                 type: string
 *               seatCode:
 *                 type: string
 *     responses:
 *       204:
 *         description: Nhả ghế thành công
 *       404:
 *         description: Không tìm thấy thông tin giữ ghế
 */
router.post('/release', validate(releaseHoldSchema), seatHoldController.releaseHold);

module.exports = router;
