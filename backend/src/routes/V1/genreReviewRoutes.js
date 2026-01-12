const express = require('express');
const reviewController = require('../../controllers/reviewController');
const authMiddleware = require('../../middlewares/authMiddleware');
const requireNotChatBanned = require('../../middlewares/chatBanMiddleware');

const router = express.Router({ mergeParams: true }); // Để nhận genreId từ nested route

/**
 * Genre Reviews - Sử dụng lại logic từ reviewController
 * Các routes này được mount vào /genres/:genreId/reviews
 */

// GET /genres/:genreId/reviews - Lấy danh sách reviews
// POST /genres/:genreId/reviews - Tạo review mới
router.route('/')
  .get(reviewController.getReviewsByGenre)
  .post(authMiddleware.protect, requireNotChatBanned, reviewController.createGenreReview);

// GET /genres/:genreId/reviews/summary - Lấy tóm tắt
router.get('/summary', reviewController.getGenreReviewsSummary);

// POST /genres/:genreId/reviews/:id/like - React
router.post('/:id/like', authMiddleware.protect, requireNotChatBanned, reviewController.likeReview);

// GET /genres/:genreId/reviews/:id/replies - Lấy replies
router.get('/:id/replies', reviewController.getReplies);

// PATCH/DELETE /genres/:genreId/reviews/:id - Update/Delete
router.route('/:id')
  .patch(authMiddleware.protect, reviewController.updateReview)
  .delete(authMiddleware.protect, reviewController.deleteReview);

module.exports = router;
