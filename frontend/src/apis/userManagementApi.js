import axiosInstance from './axiosInstance';

// Lấy danh sách user (admin) với pagination, filter, search
export const getAdminUserListAPI = async (params) => {
  const response = await axiosInstance.get('/users/admin/list', { params });
  return response.data;
};

// Tạo tài khoản mới (admin)
export const adminCreateUserAPI = async (data) => {
  const response = await axiosInstance.post('/users/admin/create', data);
  return response.data;
};

// Cập nhật thông tin user (admin)
export const adminUpdateUserAPI = async (id, data) => {
  const response = await axiosInstance.patch(`/users/${id}`, data);
  return response.data;
};

// Bật/Tắt tình trạng hoạt động user
export const toggleUserActiveAPI = async (id) => {
  const response = await axiosInstance.patch(`/users/admin/${id}/toggle-active`);
  return response.data;
};

// Xóa user (admin)
export const adminDeleteUserAPI = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

// Tìm user theo email (dùng cho thăng chức)
export const searchUserByEmailAPI = async (email) => {
  const response = await axiosInstance.get('/users/admin/search-email', { params: { email } });
  return response.data;
};

// Đổi chức vụ user
export const changeUserRoleAPI = async (id, role) => {
  const response = await axiosInstance.patch(`/users/admin/${id}/change-role`, { role });
  return response.data;
};
