const express = require('express');
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');
const authMiddleware = require('../../middlewares/authMiddleware');
const { requirePermission } = require('../../middlewares/permissionMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng
 */

// PUBLIC: Hủy đăng ký nhận email (từ link trong email)
router.get('/unsubscribe', userController.unsubscribeNewsletter);

// PUBLIC: Ping — cập nhật lastActiveAt cho user đang online (dùng optionalAuth)
router.post('/ping', authMiddleware.optionalAuth, (req, res) => {
  res.status(200).json({ status: 'ok', online: !!req.user });
});

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
 * /users/me/newsletter:
 *   patch:
 *     summary: Bật/tắt nhận email thông báo ưu đãi
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
 *               - subscribed
 *             properties:
 *               subscribed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch('/me/newsletter', userController.updateNewsletterSubscription);

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

// Admin: Danh sách user (pagination, filter, search)
router.get('/admin/list', userController.adminGetUserList);

// Admin: Tạo tài khoản mới
router.post('/admin/create', requirePermission('nhan-vien.them'), userController.adminCreateUser);

// Admin: Bật/Tắt tình trạng hoạt động
router.patch('/admin/:id/toggle-active', userController.toggleUserActive);

// Admin: Đổi chức vụ (role)
router.patch('/admin/:id/change-role', requirePermission('nhan-vien.sua'), userController.changeUserRole);

// Admin: Tìm user theo email
router.get('/admin/search-email', userController.searchUserByEmail);

// Admin: Đặt mật khẩu cho user (dùng cho tài khoản OAuth không có password)
router.patch('/admin/:id/set-password', requirePermission('nhan-vien.sua'), userController.adminSetPassword);

router.route('/:id')
  .get(userController.getUser)
  .patch(requirePermission('khach-hang.sua'), userController.updateUser)
  .delete(requirePermission('khach-hang.xoa'), userController.deleteUser);

module.exports = router;

