import axiosInstance from './axiosInstance';

/**
 * Lấy danh sách combo đang hoạt động
 * @returns {Promise<{combos: Array<{_id, name, description, items, price, status}>}>}
 */
export const getAllCombosAPI = async () => {
  const response = await axiosInstance.get('/combos');
  return response.data;
};

/**
 * Lấy combo theo ID
 * @param {string} comboId - ID combo
 */
export const getComboByIdAPI = async (comboId) => {
  const response = await axiosInstance.get(`/combos/${comboId}`);
  return response.data;
};

/**
 * Tạo combo mới (Admin)
 * @param {Object} data
 */
export const createComboAPI = async (data) => {
  const response = await axiosInstance.post('/combos', data);
  return response.data;
};

/**
 * Cập nhật combo (Admin)
 * @param {string} comboId
 * @param {Object} data
 */
export const updateComboAPI = async (comboId, data) => {
  const response = await axiosInstance.patch(`/combos/${comboId}`, data);
  return response.data;
};

/**
 * Xóa combo (Admin)
 * @param {string} comboId
 */
export const deleteComboAPI = async (comboId) => {
  const response = await axiosInstance.delete(`/combos/${comboId}`);
  return response.data;
};

export default {
  getAllCombosAPI,
  getComboByIdAPI,
  createComboAPI,
  updateComboAPI,
  deleteComboAPI
};
