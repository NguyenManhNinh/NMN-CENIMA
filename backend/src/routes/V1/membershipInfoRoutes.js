const express = require('express');
const router = express.Router();
const {
  getMembershipInfo,
  updateMembershipInfo,
  getAllMembershipInfo
} = require('../../controllers/membershipInfoController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');

// PUBLIC ROUTES

// Lấy thông tin thành viên đang active (hiển thị trên trang /thanh-vien)
router.get('/', getMembershipInfo);

// ADMIN ROUTES

// Lấy tất cả trang thành viên (bao gồm draft) - dành cho trang quản trị
router.get('/admin/all', protect, restrictTo('admin'), getAllMembershipInfo);

// Cập nhật hoặc tạo mới trang thành viên
router.put('/', protect, restrictTo('admin'), updateMembershipInfo);

module.exports = router;
