const express = require('express');
const movieController = require('../../controllers/movieController');
const authMiddleware = require('../../middlewares/authMiddleware');
const upload = require('../../middlewares/uploadMiddleware');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Quản lý phim
 */

router.use('/:movieId/reviews', reviewRouter);

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Lấy danh sách phim
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NOW, COMING, STOP]
 *         description: Trạng thái phim
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Thể loại phim
 *     responses:
 *       200:
 *         description: Danh sách phim
 *   post:
 *     summary: Tạo phim mới (Admin)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: integer
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *               ageRating:
 *                 type: string
 *               poster:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo phim thành công
 */
router
  .route('/')
  .get(movieController.getAllMovies)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    upload.single('poster'),
    movieController.createMovie
  );

/**
 * @swagger
 * /movies/countries:
 *   get:
 *     summary: Lấy danh sách quốc gia unique
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Danh sách quốc gia
 */
router.get('/countries', movieController.getCountries);

/**
 * @swagger
 * /movies/years:
 *   get:
 *     summary: Lấy danh sách năm phát hành unique
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Danh sách năm
 */
router.get('/years', movieController.getYears);

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Lấy chi tiết phim
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết phim
 *   patch:
 *     summary: Cập nhật phim (Admin)
 *     tags: [Movies]
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
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa phim (Admin)
 *     tags: [Movies]
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
router
  .route('/:id')
  .get(movieController.getMovie)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    upload.single('poster'),
    movieController.updateMovie
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    movieController.deleteMovie
  );
/**
 * @swagger
 * /movies/{id}/rate:
 *   post:
 *     summary: Đánh giá phim
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       200:
 *         description: Đánh giá thành công
 */
router.post(
  '/:id/rate',
  authMiddleware.protect,
  movieController.rateMovie
);

/**
 * @swagger
 * /movies/{id}/view:
 *   post:
 *     summary: Tăng lượt xem phim
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tăng lượt xem thành công
 */
router.post('/:id/view', movieController.incrementViewCount);

/**
 * @swagger
 * /movies/{id}/like:
 *   post:
 *     summary: Toggle like phim (like/unlike)
 *     tags: [Movies]
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
 *         description: Toggle like thành công
 *   get:
 *     summary: Kiểm tra trạng thái like của user hiện tại
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trạng thái like
 */
router.post('/:id/like', authMiddleware.protect, movieController.toggleLike);
router.get('/:id/like', authMiddleware.optionalAuth, movieController.getLikeStatus);

module.exports = router;

