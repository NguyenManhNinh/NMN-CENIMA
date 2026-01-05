const express = require('express');
const voucherController = require('../../controllers/voucherController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

// --- PUBLIC ROUTES (optionalAuth để lấy userId nếu đăng nhập) ---
// Lấy danh sách voucher có sẵn (cho user xem trên trang thanh toán)
// Nếu user đăng nhập, sẽ lọc bỏ voucher đã dùng
router.get('/available', authMiddleware.optionalAuth, voucherController.getAvailableVouchers);

// --- USER ROUTES (Cần đăng nhập) ---
router.post('/apply', authMiddleware.protect, voucherController.applyVoucher);

// --- ADMIN ROUTES ---
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin', 'manager'));

router.route('/')
  .get(voucherController.getAllVouchers)
  .post(voucherController.createVoucher);

router.route('/:id')
  .patch(voucherController.updateVoucher)
  .delete(voucherController.deleteVoucher);

module.exports = router;
