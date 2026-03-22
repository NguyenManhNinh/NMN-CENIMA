const express = require('express');
const router = express.Router();
const {
  getTicketPricing,
  updateTicketPricing,
  getAllTicketPricing
} = require('../../controllers/ticketPricingController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');
const { requirePermission } = require('../../middlewares/permissionMiddleware');
//PUBLIC ROUTES

// Lấy bảng giá vé đang active (hiển thị trên trang /gia-ve)
router.get('/', getTicketPricing);

//ADMIN ROUTES

// Lấy tất cả bảng giá (bao gồm draft) - dành cho trang quản trị
router.get('/admin/all', protect, restrictTo('admin'), requirePermission('gia-ve.xem'), getAllTicketPricing);

router.put('/', protect, restrictTo('admin'), requirePermission('gia-ve.sua'), updateTicketPricing);

module.exports = router;
