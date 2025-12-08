const express = require('express');
const roomController = require('../../controllers/roomController');
const authMiddleware = require('../../middlewares/authMiddleware');

// mergeParams: true để nhận được cinemaId từ nested route
const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Quản lý phòng chiếu
 */

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Lấy danh sách phòng
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Danh sách phòng
 *   post:
 *     summary: Tạo phòng mới (Admin)
 *     tags: [Rooms]
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
 *               - cinemaId
 *             properties:
 *               name:
 *                 type: string
 *               cinemaId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [2D, 3D, IMAX]
 *               totalSeats:
 *                 type: integer
 *               seatMap:
 *                 type: object
 *     responses:
 *       201:
 *         description: Tạo phòng thành công
 */
router
  .route('/')
  .get(roomController.getAllRooms)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    roomController.createRoom
  );

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Lấy chi tiết phòng
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết phòng
 *   patch:
 *     summary: Cập nhật phòng (Admin)
 *     tags: [Rooms]
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
 *     summary: Xóa phòng (Admin)
 *     tags: [Rooms]
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
  .get(roomController.getRoom)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    roomController.updateRoom
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    roomController.deleteRoom
  );

module.exports = router;

