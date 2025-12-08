const express = require('express');
const voucherController = require('../../controllers/voucherController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

// --- PUBLIC/USER ROUTES ---
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
