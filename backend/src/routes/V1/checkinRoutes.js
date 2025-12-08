const express = require('express');
const checkinController = require('../../controllers/checkinController');
const authMiddleware = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validateMiddleware');
const { scanTicketSchema } = require('../../validations/checkinValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Check-in
 *   description: Quét vé và check-in tại rạp
 */

// Bảo vệ tất cả các route: Phải đăng nhập
router.use(authMiddleware.protect);

// Chỉ Staff, Manager, Admin mới được quét vé
router.use(authMiddleware.restrictTo('staff', 'manager', 'admin'));

/**
 * @swagger
 * /checkin/scan:
 *   post:
 *     summary: Quét vé check-in (Staff/Manager/Admin)
 *     tags: [Check-in]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketCode:
 *                 type: string
 *                 description: Mã vé (VD TKT-xxx)
 *               qrChecksum:
 *                 type: string
 *                 description: Mã checksum từ QR Code
 *             description: Cần ít nhất 1 trong 2 trường
 *     responses:
 *       200:
 *         description: Check-in thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Check-in thành công! ✅
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticketCode:
 *                       type: string
 *                     seatCode:
 *                       type: string
 *                     movie:
 *                       type: string
 *                     room:
 *                       type: string
 *                     showtime:
 *                       type: string
 *                     customer:
 *                       type: string
 *       400:
 *         description: Vé đã bị hủy hoặc thiếu thông tin
 *       404:
 *         description: Vé không tồn tại
 */
router.post('/scan', validate(scanTicketSchema), checkinController.scanTicket);

module.exports = router;
