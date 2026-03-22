const Role = require('../models/Role');
const AppError = require('../utils/AppError');

/**
 * Middleware kiểm tra permission cụ thể
 * Sử dụng: requirePermission('phim.them')
 * - isMaster → pass
 * - permissions chứa key → pass
 * - Không có → 403
 */
const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const userRole = await Role.findOne({ name: req.user.role });

      // Role master (admin) → toàn quyền
      if (userRole && userRole.isMaster) {
        return next();
      }

      // Kiểm tra permission cụ thể
      if (userRole && userRole.permissions && userRole.permissions.includes(permissionKey)) {
        return next();
      }

      return next(
        new AppError(`Bạn không có quyền thực hiện chức năng này! (Yêu cầu: ${permissionKey})`, 403)
      );
    } catch (err) {
      return next(new AppError('Lỗi kiểm tra quyền!', 500));
    }
  };
};

module.exports = { requirePermission };
