const express = require('express');
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng
 */

// Tất cả các route bên dưới đều yêu cầu đăng nhập
router.use(authMiddleware.protect);

/**
 * @swagger
 * /users/updateMyPassword:
 *   patch:
 *     summary: Đổi mật khẩu
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordCurrent
 *               - password
 *               - passwordConfirm
 *             properties:
 *               passwordCurrent:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */
router.patch('/updateMyPassword', userController.updatePassword);

/**
 * @swagger
 * /users/updateMe:
 *   patch:
 *     summary: Cập nhật thông tin cá nhân
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch('/updateMe', userController.updateMe);

/**
 * @swagger
 * /users/deleteMe:
 *   delete:
 *     summary: Vô hiệu hóa tài khoản
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Xóa thành công
 */
router.delete('/deleteMe', userController.deleteMe);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lấy danh sách users (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách users
 */
router.route('/').get(userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Lấy thông tin user theo ID
 *     tags: [Users]
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
 *         description: Thông tin user
 *       404:
 *         description: User không tồn tại
 *   patch:
 *     summary: Cập nhật user (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, staff, user]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa user (Admin)
 *     tags: [Users]
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
// Admin only routes
router.use(authMiddleware.restrictTo('admin'));

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

