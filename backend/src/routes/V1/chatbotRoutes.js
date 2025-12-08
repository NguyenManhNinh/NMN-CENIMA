const express = require('express');
const router = express.Router();
const chatbotController = require('../../controllers/chatbotController');
const authMiddleware = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Trợ lý ảo AI Chatbot
 */

/**
 * @swagger
 * /chatbot/message:
 *   post:
 *     summary: Gửi tin nhắn đến chatbot
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phản hồi từ chatbot
 */
router.post('/message', authMiddleware.optionalAuth, chatbotController.sendMessage);

/**
 * @swagger
 * /chatbot/session:
 *   post:
 *     summary: Tạo session chat mới
 *     tags: [Chatbot]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel:
 *                 type: string
 *                 enum: [WEB, MOBILE]
 *     responses:
 *       201:
 *         description: Session được tạo
 */
router.post('/session', authMiddleware.optionalAuth, chatbotController.createSession);

/**
 * @swagger
 * /chatbot/history/{sessionId}:
 *   get:
 *     summary: Lấy lịch sử chat
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lịch sử tin nhắn
 */
router.get('/history/:sessionId', chatbotController.getHistory);

/**
 * @swagger
 * /chatbot/quick-replies:
 *   get:
 *     summary: Lấy các câu hỏi nhanh
 *     tags: [Chatbot]
 *     responses:
 *       200:
 *         description: Danh sách quick replies
 */
router.get('/quick-replies', chatbotController.getQuickReplies);

module.exports = router;

