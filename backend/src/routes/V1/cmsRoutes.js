const express = require('express');
const cmsController = require('../../controllers/cmsController');
const authMiddleware = require('../../middlewares/authMiddleware');
const { requirePermission } = require('../../middlewares/permissionMiddleware');

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/banners', cmsController.getAllBanners);
router.get('/articles', cmsController.getAllArticles);
router.get('/articles/:slug', cmsController.getArticle);


// --- PROTECTED ROUTES (Admin/Manager) ---
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin', 'manager'));

// Banners (Slide)
router.post('/banners', requirePermission('slide.them'), cmsController.createBanner);
router.patch('/banners/:id', requirePermission('slide.sua'), cmsController.updateBanner);
router.delete('/banners/:id', requirePermission('slide.xoa'), cmsController.deleteBanner);

// Articles (Phim hay tháng)
router.post('/articles', requirePermission('phim-hay.them'), cmsController.createArticle);
router.patch('/articles/:id', requirePermission('phim-hay.sua'), cmsController.updateArticle);
router.delete('/articles/:id', requirePermission('phim-hay.xoa'), cmsController.deleteArticle);



module.exports = router;
