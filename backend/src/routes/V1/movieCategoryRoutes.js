const express = require('express');
const router = express.Router();
const {
  getAllMovieCategories,
  createMovieCategory,
  updateMovieCategory,
  deleteMovieCategory,
  getMoviesByCategory
} = require('../../controllers/movieCategoryController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');
const { requirePermission } = require('../../middlewares/permissionMiddleware');

// Lấy tất cả thể loại phim (Public)
router.get('/', getAllMovieCategories);

// Lấy danh sách phim thuộc 1 thể loại
router.get('/:id/movies', getMoviesByCategory);

// Thêm thể loại phim mới (Admin only)
router.post('/', protect, restrictTo('admin'), requirePermission('the-loai-phim.them'), createMovieCategory);

router.put('/:id', protect, restrictTo('admin'), requirePermission('the-loai-phim.sua'), updateMovieCategory);

router.delete('/:id', protect, restrictTo('admin'), requirePermission('the-loai-phim.xoa'), deleteMovieCategory);

module.exports = router;
