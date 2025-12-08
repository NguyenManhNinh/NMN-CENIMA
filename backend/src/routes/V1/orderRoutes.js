const express = require('express');
const orderController = require('../../controllers/orderController');
const authMiddleware = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validateMiddleware');
const { createOrderSchema } = require('../../validations/orderValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý đơn hàng đặt vé
 */

// Bảo vệ tất cả các route bên dưới
router.use(authMiddleware.protect);

/**
 * @swagger
 * /orders/me:
 *   get:
 *     summary: Lấy lịch sử đơn hàng của user hiện tại
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
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
 *                     orders:
 *                       type: array
 */
router.get('/me', orderController.getMyOrders);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Tạo đơn hàng mới (đặt vé)
 *     tags: [Orders]
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
 *               - seats
 *             properties:
 *               showtimeId:
 *                 type: string
 *                 description: ID suất chiếu
 *               seats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách mã ghế (VD A1, B2)
 *               combos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               voucherCode:
 *                 type: string
 *                 description: Mã giảm giá (nếu có)
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công, trả về URL thanh toán VNPay
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc ghế đã hết hạn giữ
 */
router.post('/', validate(createOrderSchema), orderController.createOrder);

// Route CRUD (Admin/Manager)
router.use(authMiddleware.restrictTo('admin', 'manager'));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lấy tất cả đơn hàng (Admin/Manager)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tất cả đơn hàng
 */
router.route('/')
  .get(orderController.getAllOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng theo ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.route('/:id')
  .get(orderController.getOrder);

module.exports = router;
