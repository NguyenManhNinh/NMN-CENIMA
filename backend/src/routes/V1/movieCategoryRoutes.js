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

// Lấy tất cả thể loại phim (Public)
router.get('/', getAllMovieCategories);

// Lấy danh sách phim thuộc 1 thể loại
router.get('/:id/movies', getMoviesByCategory);

// Thêm thể loại phim mới (Admin only)
router.post('/', protect, restrictTo('admin'), createMovieCategory);

// Cập nhật thể loại phim (Admin only)
router.put('/:id', protect, restrictTo('admin'), updateMovieCategory);

// Xóa thể loại phim (Admin only)
router.delete('/:id', protect, restrictTo('admin'), deleteMovieCategory);

module.exports = router;
