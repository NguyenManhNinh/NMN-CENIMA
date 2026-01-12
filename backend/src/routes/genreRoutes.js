const express = require('express');
const router = express.Router();
const {
  getGenres,
  getGenreBySlug,
  getMoviesByGenre,
  createGenre,
  updateGenre,
  deleteGenre,
  getCategories,
  getCountries,
  getYears,
  toggleLike,
  getLikeStatus,
  rateGenre,
  incrementView
} = require('../controllers/genreController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Import genreReviewRoutes để nested mount
const genreReviewRoutes = require('./V1/genreReviewRoutes');

// Mount genre review routes: /genres/:genreId/reviews
router.use('/:genreId/reviews', genreReviewRoutes);
/**
 * @swagger
 * /api/v1/genres:
 *   get:
 *     summary: Lấy danh sách tất cả thể loại phim
 *     tags: [Genres]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: Lọc theo trạng thái active
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', getGenres);

// Routes lấy danh sách duy nhất cho dropdown (phải đặt trước /:slug)
router.get('/categories', getCategories);
router.get('/countries', getCountries);
router.get('/years', getYears);

// Routes like/unlike (phải đặt trước /:slug)
router.post('/:id/like', protect, toggleLike);
router.get('/:id/like-status', protect, getLikeStatus);

// Routes rate và view (phải đặt trước /:slug)
router.post('/:id/rate', protect, rateGenre);
router.post('/:id/view', incrementView);

/**
 * @swagger
 * /api/v1/genres/{slug}:
 *   get:
 *     summary: Lấy chi tiết thể loại theo slug
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:slug', getGenreBySlug);

/**
 * @swagger
 * /api/v1/genres/{slug}/movies:
 *   get:
 *     summary: Lấy danh sách phim theo thể loại
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NOW, COMING, STOP]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/:slug/movies', getMoviesByGenre);

/**
 * @swagger
 * /api/v1/genres:
 *   post:
 *     summary: Tạo thể loại mới (Admin)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               nameEn:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', protect, restrictTo('admin'), createGenre);

/**
 * @swagger
 * /api/v1/genres/{id}:
 *   put:
 *     summary: Cập nhật thể loại (Admin)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', protect, restrictTo('admin'), updateGenre);

/**
 * @swagger
 * /api/v1/genres/{id}:
 *   delete:
 *     summary: Xóa thể loại (Admin)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', protect, restrictTo('admin'), deleteGenre);

module.exports = router;
