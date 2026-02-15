import axiosInstance from './axiosInstance';

/**
 * Cập nhật thông tin cá nhân
 * @param {Object} data - { name, phone, avatar, gender, birthday, address }
 */
export const updateMeAPI = async (data) => {
  const response = await axiosInstance.patch('/users/updateMe', data);
  return response.data;
};

/**
 * Đổi mật khẩu
 * @param {Object} data - { passwordCurrent, password, passwordConfirm }
 */
export const updatePasswordAPI = async (data) => {
  const response = await axiosInstance.patch('/users/updateMyPassword', data);
  return response.data;
};

/**
 * Xóa tài khoản (Ly khai)
 * @param {Object} data - { password }
 */
export const deleteMeAPI = async (data) => {
  const response = await axiosInstance.delete('/users/deleteMe', { data });
  return response.data;
};
