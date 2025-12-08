const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  target: {
    type: {
      type: String, // 'Order', 'Movie', 'User'...
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  meta: {
    type: mongoose.Schema.Types.Mixed // Lưu chi tiết thay đổi (oldValue, newValue)
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Chỉ cần createdAt
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
