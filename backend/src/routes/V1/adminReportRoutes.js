const express = require('express');
const router = express.Router();

const {
  getReports,
  handleReportAction
} = require('../../controllers/reviewReportController');

const { protect, restrictTo } = require('../../middlewares/authMiddleware');

// =============================================
// ADMIN ROUTES (mounted at /admin/reports)
// =============================================

// GET /admin/reports?status=pending&page=1&limit=20
// Lấy danh sách reports
router.get('/', protect, restrictTo('admin'), getReports);

// PATCH /admin/reports/:reportId/action
// Xử lý report (dismiss/hide/delete/ban)
router.patch('/:reportId/action', protect, restrictTo('admin'), handleReportAction);

module.exports = router;
