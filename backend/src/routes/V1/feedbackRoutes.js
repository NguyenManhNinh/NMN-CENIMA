const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Feedbacks
 *   description: Quản lý góp ý khách hàng
 */

/**
 * @swagger
 * /feedbacks:
 *   post:
 *     summary: Gửi góp ý (Public)
 *     tags: [Feedbacks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - topic
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               topic:
 *                 type: string
 *                 enum: [GENERAL, COMPLAINT, SERVICE, FACILITIES, BOOKING, PAYMENT]
 *               content:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Gửi góp ý thành công
 */
router.post('/', feedbackController.createFeedback);

/**
 * @swagger
 * /feedbacks:
 *   get:
 *     summary: Lấy tất cả feedback (Admin/Manager)
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, RESOLVED, REJECTED]
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách feedback
 */
router.get('/', protect, restrictTo('admin', 'manager'), feedbackController.getAllFeedbacks);

/**
 * @swagger
 * /feedbacks/{id}:
 *   get:
 *     summary: Lấy chi tiết feedback
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết feedback
 */
router.get('/:id', protect, restrictTo('admin', 'manager'), feedbackController.getFeedback);

/**
 * @swagger
 * /feedbacks/{id}:
 *   patch:
 *     summary: Cập nhật trạng thái feedback
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, RESOLVED, REJECTED]
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch('/:id', protect, restrictTo('admin', 'manager'), feedbackController.updateFeedback);

/**
 * @swagger
 * /feedbacks/{id}:
 *   delete:
 *     summary: Xóa feedback
 *     tags: [Feedbacks]
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
router.delete('/:id', protect, restrictTo('admin'), feedbackController.deleteFeedback);

module.exports = router;
