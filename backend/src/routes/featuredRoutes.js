const express = require('express');
const router = express.Router();
const {
  getFeaturedArticles,
  getFeaturedArticleBySlug,
  incrementView,
  toggleLike,
  createFeaturedArticle,
  updateFeaturedArticle,
  deleteFeaturedArticle,
  getAllFeaturedArticlesAdmin
} = require('../controllers/featuredController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

/**
 * Routes: Featured Articles (Phim Hay Tháng)
 * Base: /api/v1/featured
 */

// ============ PUBLIC ROUTES ============
// GET /api/v1/featured - Lấy danh sách bài viết (có phân trang)
router.get('/', getFeaturedArticles);

// GET /api/v1/featured/:slug - Lấy chi tiết bài viết theo slug
router.get('/:slug', getFeaturedArticleBySlug);

// POST /api/v1/featured/:id/view - Tăng lượt xem
router.post('/:id/view', incrementView);

// ============ PROTECTED ROUTES (Yêu cầu đăng nhập) ============
// POST /api/v1/featured/:id/like - Toggle like
router.post('/:id/like', protect, toggleLike);

// ============ ADMIN ROUTES ============
// GET /api/v1/featured/admin/all - Lấy tất cả bài viết (bao gồm draft)
router.get('/admin/all', protect, restrictTo('admin'), getAllFeaturedArticlesAdmin);

// POST /api/v1/featured - Tạo bài viết mới
router.post('/', protect, restrictTo('admin'), createFeaturedArticle);

// PUT /api/v1/featured/:id - Cập nhật bài viết
router.put('/:id', protect, restrictTo('admin'), updateFeaturedArticle);

// DELETE /api/v1/featured/:id - Xóa bài viết
router.delete('/:id', protect, restrictTo('admin'), deleteFeaturedArticle);

module.exports = router;
