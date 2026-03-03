const express = require('express');
const roleController = require('../../controllers/roleController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');

const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập + quyền admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', roleController.getAllRoles);
router.post('/', roleController.createRole);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

module.exports = router;
