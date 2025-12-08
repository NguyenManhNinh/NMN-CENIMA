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

module.exports = router;

