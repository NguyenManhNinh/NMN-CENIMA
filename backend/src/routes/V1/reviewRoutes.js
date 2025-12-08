const express = require('express');
const reviewController = require('../../controllers/reviewController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true }); // Để nhận movieId từ nested route

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Đánh giá và bình luận phim
 */

/**
 * @swagger
 * /movies/{movieId}/reviews:
 *   get:
 *     summary: Lấy danh sách đánh giá của phim
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách đánh giá
 *   post:
 *     summary: Tạo đánh giá mới (Yêu cầu đăng nhập)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo đánh giá thành công
 */
router.route('/')
  .get(reviewController.getAllReviews)
  .post(authMiddleware.protect, reviewController.createReview);

/**
 * @swagger
 * /movies/{movieId}/reviews/{id}:
 *   patch:
 *     summary: Cập nhật đánh giá (Chủ sở hữu)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa đánh giá (Chủ sở hữu hoặc Admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Xóa thành công
 */
router.route('/:id')
  .patch(authMiddleware.protect, reviewController.updateReview)
  .delete(authMiddleware.protect, reviewController.deleteReview);

module.exports = router;

