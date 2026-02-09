const express = require('express');
const router = express.Router();
const {
  getTicketPricing,
  updateTicketPricing,
  getAllTicketPricing
} = require('../../controllers/ticketPricingController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');

/**
 * Routes: Ticket Pricing (Bảng giá vé)
 * Base: /api/v1/ticket-pricing
 */

// ============ PUBLIC ROUTES ============
// GET /api/v1/ticket-pricing - Lấy bảng giá vé active
router.get('/', getTicketPricing);

// ============ ADMIN ROUTES ============
// GET /api/v1/ticket-pricing/admin/all - Lấy tất cả bảng giá
router.get('/admin/all', protect, restrictTo('admin'), getAllTicketPricing);

// PUT /api/v1/ticket-pricing - Cập nhật bảng giá
router.put('/', protect, restrictTo('admin'), updateTicketPricing);

module.exports = router;
