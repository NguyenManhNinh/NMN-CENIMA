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

export default {
  getAllCombosAPI,
  getComboByIdAPI
};
