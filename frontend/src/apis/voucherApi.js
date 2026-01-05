import axiosInstance from './axiosInstance';

/**
 * Lấy danh sách voucher có sẵn (public)
 * @returns {Promise} - Danh sách voucher active, trong thời hạn
 */
export const getAvailableVouchersAPI = async () => {
  const response = await axiosInstance.get('/vouchers/available');
  return response.data;
};

/**
 * Áp dụng mã giảm giá
 * @param {string} code - Mã voucher
 * @param {number} totalAmount - Tổng tiền trước giảm
 * @returns {Promise} - { discountAmount, finalAmount, ... }
 */
export const applyVoucherAPI = async (code, totalAmount) => {
  const response = await axiosInstance.post('/vouchers/apply', {
    code,
    totalAmount
  });
  return response.data;
};
