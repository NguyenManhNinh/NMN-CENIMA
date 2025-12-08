const express = require('express');
const router = express.Router();
const loyaltyController = require('../../controllers/loyaltyController');
const authMiddleware = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Loyalty
 *   description: Chương trình thành viên thân thiết
 */

// Tất cả routes yêu cầu đăng nhập
router.use(authMiddleware.protect);

/**
 * @swagger
 * /loyalty/me:
 *   get:
 *     summary: Lấy thông tin điểm và hạng thành viên
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin loyalty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: integer
 *                 rank:
 *                   type: string
 *                   enum: [MEMBER, VIP, VVIP]
 *                 nextRankPoints:
 *                   type: integer
 */
router.get('/me', loyaltyController.getMyLoyalty);

/**
 * @swagger
 * /loyalty/history:
 *   get:
 *     summary: Lấy lịch sử tích điểm
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lịch sử giao dịch điểm
 */
router.get('/history', loyaltyController.getPointsHistory);

module.exports = router;

