const express = require('express');
const paymentController = require('../../controllers/paymentController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Xử lý thanh toán VNPay
 */

/**
 * @swagger
 * /payments/vnpay_ipn:
 *   get:
 *     summary: VNPay IPN Callback (Nguồn chân lý)
 *     description: >
 *       Endpoint nhận thông báo thanh toán từ VNPay.
 *       Đây là nguồn chân lý (source of truth) để cập nhật trạng thái đơn hàng.
 *       Route này KHÔNG CẦN xác thực vì VNPay gọi trực tiếp.
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         description: Mã đơn hàng
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         description: Mã kết quả thanh toán (00=success)
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *         description: Chữ ký xác thực
 *     responses:
 *       200:
 *         description: Phản hồi cho VNPay
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 RspCode:
 *                   type: string
 *                   example: "00"
 *                 Message:
 *                   type: string
 *                   example: Success
 */
router.get('/vnpay_ipn', paymentController.vnpayIpn);

/**
 * @swagger
 * /payments/vnpay_return:
 *   get:
 *     summary: VNPay Return URL (Redirect user về)
 *     description: >
 *       Endpoint user được redirect về sau khi thanh toán.
 *       Chỉ dùng để hiển thị kết quả, KHÔNG phải nguồn chân lý.
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trang kết quả thanh toán (HTML)
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;
