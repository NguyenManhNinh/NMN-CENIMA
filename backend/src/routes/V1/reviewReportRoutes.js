const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  createReport,
  checkReportStatus
} = require('../../controllers/reviewReportController');

const { protect, restrictTo } = require('../../middlewares/authMiddleware');

// =============================================
// USER ROUTES (nested under /movies/:movieId/reviews/:reviewId)
// =============================================

// POST /movies/:movieId/reviews/:reviewId/report
// Report một bình luận
router.post('/', protect, createReport);

// GET /movies/:movieId/reviews/:reviewId/report/status
// Kiểm tra user đã report review này chưa
router.get('/status', protect, checkReportStatus);

module.exports = router;
