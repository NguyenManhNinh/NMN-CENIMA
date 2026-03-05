const express = require('express');
const router = express.Router();

const {
  getReports,
  handleReportAction,
  adminChatBan
} = require('../../controllers/reviewReportController');

const { protect, restrictTo } = require('../../middlewares/authMiddleware');

// =============================================
// ADMIN ROUTES (mounted at /admin/reports)
// =============================================

// GET /admin/reports?status=pending&page=1&limit=20
// Lấy danh sách reports
router.get('/', protect, restrictTo('admin'), getReports);

// PATCH /admin/reports/users/:userId/chat-ban
// Ban/Unban user chat trực tiếp (phải đặt TRƯỚC /:reportId/action)
router.patch('/users/:userId/chat-ban', protect, restrictTo('admin'), adminChatBan);

// PATCH /admin/reports/:reportId/action
// Xử lý report (dismiss/hide/delete/ban)
router.patch('/:reportId/action', protect, restrictTo('admin'), handleReportAction);

module.exports = router;
