const AuditLog = require('../models/AuditLog');

exports.createLog = async (actorId, action, targetType, targetId, meta = {}) => {
  try {
    await AuditLog.create({
      actorId,
      action,
      target: {
        type: targetType,
        id: targetId
      },
      meta
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
    // Không throw error để tránh ảnh hưởng luồng chính
  }
};
