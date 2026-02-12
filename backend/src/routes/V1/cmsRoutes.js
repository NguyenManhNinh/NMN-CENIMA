const express = require('express');
const cmsController = require('../../controllers/cmsController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/banners', cmsController.getAllBanners);
router.get('/articles', cmsController.getAllArticles);
router.get('/articles/:slug', cmsController.getArticle);


// --- PROTECTED ROUTES (Admin/Manager) ---
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin', 'manager'));

// Banners
router.post('/banners', cmsController.createBanner);
router.patch('/banners/:id', cmsController.updateBanner);
router.delete('/banners/:id', cmsController.deleteBanner);

// Articles
router.post('/articles', cmsController.createArticle);
router.patch('/articles/:id', cmsController.updateArticle);
router.delete('/articles/:id', cmsController.deleteArticle);



module.exports = router;
