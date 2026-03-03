const Role = require('../models/Role');
const User = require('../models/User');

// Lấy tất cả chức vụ (kèm số user + danh sách user)
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ isMaster: -1, createdAt: 1 }).lean();

    // Lấy tất cả user (chỉ cần name, email, avatar, role)
    const allUsers = await User.find({}, 'name email avatar role createdAt').lean();

    // Nhóm user theo role
    const usersByRole = {};
    allUsers.forEach(u => {
      if (!usersByRole[u.role]) usersByRole[u.role] = [];
      usersByRole[u.role].push({
        _id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        createdAt: u.createdAt
      });
    });

    const result = roles.map(r => ({
      ...r,
      userCount: usersByRole[r.name]?.length || 0,
      users: usersByRole[r.name] || []
    }));

    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Tạo chức vụ mới
exports.createRole = async (req, res) => {
  try {
    const { name, description, isMaster } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ status: 'error', message: 'Vui lòng nhập tên chức vụ!' });
    }

    // Kiểm tra trùng
    const existing = await Role.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Chức vụ này đã tồn tại!' });
    }

    const role = await Role.create({
      name: name.trim(),
      description: description?.trim() || '',
      isMaster: isMaster || false
    });

    res.status(201).json({ status: 'success', data: role });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Cập nhật chức vụ
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isMaster, isActive } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy chức vụ!' });
    }

    // Kiểm tra trùng tên (nếu đổi tên)
    if (name && name.trim() !== role.name) {
      const existing = await Role.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ status: 'error', message: 'Tên chức vụ đã tồn tại!' });
      }
    }

    // Lưu tên cũ để cập nhật User
    const oldName = role.name;

    if (name !== undefined) role.name = name.trim();
    if (description !== undefined) role.description = description.trim();
    if (isMaster !== undefined) role.isMaster = isMaster;
    if (isActive !== undefined) {
      // Không cho tắt role Master — tránh admin tự khóa chính mình
      if (!isActive && role.isMaster) {
        return res.status(400).json({ status: 'error', message: 'Không thể tắt chức vụ Master! Điều này sẽ khóa toàn bộ quản trị viên.' });
      }
      role.isActive = isActive;
    }

    await role.save();

    // Nếu đổi tên role → cập nhật User.role tương ứng
    if (name && name.trim() !== oldName) {
      await User.updateMany({ role: oldName }, { role: name.trim() });
    }

    res.status(200).json({ status: 'success', data: role });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Xóa chức vụ
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy chức vụ!' });
    }

    // Không cho xóa role master
    if (role.isMaster) {
      return res.status(400).json({ status: 'error', message: 'Không thể xóa chức vụ Master!' });
    }

    // Kiểm tra có user nào đang dùng role này không
    const userCount = await User.countDocuments({ role: role.name });
    if (userCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Không thể xóa! Có ${userCount} người dùng đang giữ chức vụ này.`
      });
    }

    await Role.findByIdAndDelete(id);
    res.status(200).json({ status: 'success', message: 'Đã xóa chức vụ thành công!' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
