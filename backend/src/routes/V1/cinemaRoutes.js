const express = require('express');
const cinemaController = require('../../controllers/cinemaController');
const authMiddleware = require('../../middlewares/authMiddleware');
const roomRouter = require('./roomRoutes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cinemas
 *   description: Quản lý rạp chiếu phim
 */

// Nested route: /cinemas/:cinemaId/rooms
router.use('/:cinemaId/rooms', roomRouter);

/**
 * @swagger
 * /cinemas:
 *   get:
 *     summary: Lấy danh sách rạp
 *     tags: [Cinemas]
 *     responses:
 *       200:
 *         description: Danh sách rạp
 *   post:
 *     summary: Tạo rạp mới (Admin)
 *     tags: [Cinemas]
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
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo rạp thành công
 */
router
  .route('/')
  .get(cinemaController.getAllCinemas)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    cinemaController.createCinema
  );

/**
 * @swagger
 * /cinemas/{id}:
 *   get:
 *     summary: Lấy chi tiết rạp
 *     tags: [Cinemas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết rạp
 *   patch:
 *     summary: Cập nhật rạp (Admin)
 *     tags: [Cinemas]
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
 *     summary: Xóa rạp (Admin)
 *     tags: [Cinemas]
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
  .get(cinemaController.getCinema)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    cinemaController.updateCinema
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    cinemaController.deleteCinema
  );

module.exports = router;

