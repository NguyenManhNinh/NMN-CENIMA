const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/ticketController');
const authMiddleware = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Quản lý vé điện tử
 */

// Tất cả routes đều yêu cầu đăng nhập
router.use(authMiddleware.protect);

/**
 * @swagger
 * /tickets/me:
 *   get:
 *     summary: Lấy danh sách vé của user đang đăng nhập
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách vé
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
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ticketCode:
 *                             type: string
 *                           seatCode:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [VALID, USED, VOID]
 *                           qrChecksum:
 *                             type: string
 */
router.get('/me', ticketController.getMyTickets);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Lấy chi tiết 1 vé
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID vé
 *     responses:
 *       200:
 *         description: Chi tiết vé với thông tin phim, suất chiếu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticket:
 *                       type: object
 *       403:
 *         description: Không có quyền xem vé này
 *       404:
 *         description: Không tìm thấy vé
 */
router.get('/:id', ticketController.getTicket);

module.exports = router;
