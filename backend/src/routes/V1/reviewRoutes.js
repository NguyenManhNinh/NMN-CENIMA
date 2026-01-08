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
 *         description: ID của phim
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, helpful, high, low]
 *         description: Sắp xếp (mặc định newest)
 *       - in: query
 *         name: verified
 *         schema:
 *           type: string
 *           enum: ['1']
 *         description: Chỉ lấy reviews đã xác thực
 *       - in: query
 *         name: noSpoiler
 *         schema:
 *           type: string
 *           enum: ['1']
 *         description: Không lấy reviews có spoiler
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
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
 *               - content
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Số sao (1-5)
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 description: Tiêu đề ngắn (tuỳ chọn)
 *               content:
 *                 type: string
 *                 minLength: 20
 *                 description: Nội dung bình luận (tối thiểu 20 ký tự)
 *               hasSpoiler:
 *                 type: boolean
 *                 description: Có tiết lộ nội dung không
 *     responses:
 *       201:
 *         description: Tạo đánh giá thành công
 *       400:
 *         description: Bạn đã đánh giá phim này rồi
 */
router.route('/')
  .get(reviewController.getReviewsByMovie)
  .post(authMiddleware.protect, reviewController.createReview);

/**
 * @swagger
 * /movies/{movieId}/reviews/summary:
 *   get:
 *     summary: Lấy tóm tắt đánh giá (điểm trung bình + phân bố sao)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tóm tắt đánh giá
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avgRating:
 *                   type: number
 *                   example: 4.2
 *                 total:
 *                   type: integer
 *                   example: 128
 *                 distribution:
 *                   type: object
 *                   properties:
 *                     1:
 *                       type: integer
 *                     2:
 *                       type: integer
 *                     3:
 *                       type: integer
 *                     4:
 *                       type: integer
 *                     5:
 *                       type: integer
 */
router.get('/summary', reviewController.getReviewsSummary);

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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               hasSpoiler:
 *                 type: boolean
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

/**
 * @swagger
 * /reviews/{id}/like:
 *   post:
 *     summary: Toggle like review (Yêu cầu đăng nhập)
 *     tags: [Reviews]
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
 *         description: Toggle thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likesCount:
 *                   type: integer
 *                 liked:
 *                   type: boolean
 */
router.post('/:id/like', authMiddleware.protect, reviewController.likeReview);

/**
 * @swagger
 * /movies/{movieId}/reviews/{id}/replies:
 *   get:
 *     summary: Lấy danh sách replies của một comment
 *     tags: [Reviews]
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
 *         description: Danh sách replies
 */
router.get('/:id/replies', reviewController.getReplies);

module.exports = router;
