const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên chức vụ!'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isMaster: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Danh sách chức năng được phép truy cập (VD: ['Dashboard', 'Phim', 'Combo'])
  permissions: {
    type: [String],
    default: []
  }
  // Số lượng user đang giữ chức vụ này (virtual hoặc tính khi query)
}, {
  timestamps: true
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
