const express = require('express');
const faqController = require('../controllers/faqController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: Câu hỏi thường gặp
 */

/**
 * @swagger
 * /faqs:
 *   get:
 *     summary: Lấy danh sách FAQ (Public)
 *     tags: [FAQs]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [BOOKING, PAYMENT, ACCOUNT, MEMBERSHIP, CINEMA, TECHNICAL, GENERAL]
 *     responses:
 *       200:
 *         description: Danh sách FAQ
 */
router.get('/', faqController.getAllFAQs);

/**
 * @swagger
 * /faqs/admin/all:
 *   get:
 *     summary: Lấy tất cả FAQ cho Admin (bao gồm inactive)
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách FAQ đầy đủ
 */
router.get('/admin/all', protect, restrictTo('admin', 'manager'), faqController.getAdminFAQs);

/**
 * @swagger
 * /faqs/{id}:
 *   get:
 *     summary: Lấy chi tiết FAQ
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết FAQ
 */
router.get('/:id', faqController.getFAQ);

/**
 * @swagger
 * /faqs:
 *   post:
 *     summary: Tạo FAQ mới
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [BOOKING, PAYMENT, ACCOUNT, MEMBERSHIP, CINEMA, TECHNICAL, GENERAL]
 *               order:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               isPopular:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Tạo FAQ thành công
 */
router.post('/', protect, restrictTo('admin', 'manager'), faqController.createFAQ);

/**
 * @swagger
 * /faqs/{id}:
 *   patch:
 *     summary: Cập nhật FAQ
 *     tags: [FAQs]
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
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               category:
 *                 type: string
 *               order:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch('/:id', protect, restrictTo('admin', 'manager'), faqController.updateFAQ);

/**
 * @swagger
 * /faqs/{id}:
 *   delete:
 *     summary: Xóa FAQ
 *     tags: [FAQs]
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
router.delete('/:id', protect, restrictTo('admin'), faqController.deleteFAQ);

module.exports = router;
