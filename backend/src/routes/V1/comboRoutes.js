const express = require('express');
const comboController = require('../../controllers/comboController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Combos
 *   description: Quản lý combo bắp nước
 */

/**
 * @swagger
 * /combos:
 *   get:
 *     summary: Lấy danh sách combo
 *     tags: [Combos]
 *     responses:
 *       200:
 *         description: Danh sách combo
 */
router.get('/', comboController.getAllCombos);

// Protected: Admin/Manager only
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin', 'manager'));

/**
 * @swagger
 * /combos:
 *   post:
 *     summary: Tạo combo mới (Admin/Manager)
 *     tags: [Combos]
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
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Tạo combo thành công
 */
router.post('/', comboController.createCombo);

/**
 * @swagger
 * /combos/{id}:
 *   patch:
 *     summary: Cập nhật combo (Admin/Manager)
 *     tags: [Combos]
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
 *     summary: Xóa combo (Admin/Manager)
 *     tags: [Combos]
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
router.route('/:id')
  .patch(comboController.updateCombo)
  .delete(comboController.deleteCombo);

module.exports = router;

