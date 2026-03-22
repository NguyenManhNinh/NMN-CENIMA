const express = require('express');
const roleController = require('../../controllers/roleController');
const { protect, restrictTo } = require('../../middlewares/authMiddleware');
const { requirePermission } = require('../../middlewares/permissionMiddleware');

const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập + quyền admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', roleController.getAllRoles);
router.post('/', requirePermission('chuc-vu.them'), roleController.createRole);
router.put('/:id', requirePermission('chuc-vu.sua'), roleController.updateRole);
router.delete('/:id', requirePermission('chuc-vu.xoa'), roleController.deleteRole);
router.put('/:id/permissions', requirePermission('phan-quyen.sua'), roleController.updateRolePermissions);

module.exports = router;
