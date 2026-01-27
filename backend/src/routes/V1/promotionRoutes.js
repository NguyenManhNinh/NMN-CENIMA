const express = require('express');
const router = express.Router();
const promotionController = require('../../controllers/promotionController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');

// ============================================
// ADMIN ROUTES (CMS) - ĐẶT TRƯỚC để tránh conflict với /:slug
// ============================================

/**
 * GET /api/v1/promotions/admin/all
 * Lấy tất cả promotions (bao gồm DRAFT, INACTIVE)
 */
router.get('/admin/all',
  protect,
  restrictTo('manager', 'admin'),
  promotionController.getAllPromotionsAdmin
);

/**
 * POST /api/v1/promotions/admin
 * Tạo promotion mới
 */
router.post('/admin',
  protect,
  restrictTo('manager', 'admin'),
  promotionController.createPromotion
);

/**
 * PATCH /api/v1/promotions/admin/:id
 * Cập nhật promotion
 */
router.patch('/admin/:id',
  protect,
  restrictTo('manager', 'admin'),
  promotionController.updatePromotion
);

/**
 * DELETE /api/v1/promotions/admin/:id
 * Xóa promotion (soft delete)
 */
router.delete('/admin/:id',
  protect,
  restrictTo('manager', 'admin'),
  promotionController.deletePromotion
);

// ============================================
// STAFF ROUTES - ĐẶT TRƯỚC /:slug
// ============================================

/**
 * POST /api/v1/promotions/staff/redeem
 * Staff quét token để redeem
 */
router.post('/staff/redeem',
  protect,
  restrictTo('staff', 'manager', 'admin'),
  promotionController.staffRedeemPromotion
);
//PUBLIC ROUTES
/**
 * GET /api/v1/promotions/home
 * Endpoint tổng hợp: trả cả LIST + BOTTOM_BANNER trong 1 request
 * Response: { data: { promotions: [], banners: [] }, pagination: {...} }
 */
router.get('/home', promotionController.getPromotionsHome);

/**
 * GET /api/v1/promotions
 * Lấy danh sách ưu đãi đang active
 * Query: page, limit, keyword, applyMode, type, sort, displayPosition
 */
router.get('/', promotionController.getPromotions);

/**
 * GET /api/v1/promotions/:slug
 * Lấy chi tiết ưu đãi + claimState
 */
router.get('/:slug',
  (req, res, next) => {
    // Optional auth - để biết user đã claim chưa
    const authHeader = req.headers.authorization;
    if (authHeader) {
      return protect(req, res, next);
    }
    next();
  },
  promotionController.getPromotionBySlug
);

//USER ROUTES (yêu cầu đăng nhập)
/**
 * POST /api/v1/promotions/:id/claim
 * Nhận voucher (ONLINE_VOUCHER)
 */
router.post('/:id/claim',
  protect,
  promotionController.claimPromotion
);

/**
 * POST /api/v1/promotions/:id/offline-claim
 * Lấy token/QR để dùng tại quầy (OFFLINE_ONLY)
 */
router.post('/:id/offline-claim',
  protect,
  promotionController.offlineClaimPromotion
);

module.exports = router;

