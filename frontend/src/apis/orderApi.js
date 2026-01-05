import axiosInstance from './axiosInstance';

/**
 * Tạo đơn hàng mới và lấy URL thanh toán VNPay
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @param {string} orderData.showtimeId - ID suất chiếu
 * @param {string[]} orderData.seats - Danh sách mã ghế ['A1', 'B2']
 * @param {Array} orderData.combos - Danh sách combo [{id, quantity}]
 * @param {string} orderData.voucherCode - Mã giảm giá (optional)
 * @returns {Promise<{order: Object, paymentUrl: string}>}
 */
export const createOrderAPI = async (orderData) => {
  const response = await axiosInstance.post('/orders', orderData);
  return response.data;
};

/**
 * Lấy lịch sử đơn hàng của user hiện tại
 * @returns {Promise<{orders: Array}>}
 */
export const getMyOrdersAPI = async () => {
  const response = await axiosInstance.get('/orders/me');
  return response.data;
};

/**
 * Lấy chi tiết đơn hàng theo ID
 * @param {string} orderId - ID đơn hàng
 * @returns {Promise<{order: Object}>}
 */
export const getOrderByIdAPI = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}`);
  return response.data;
};

export default {
  createOrderAPI,
  getMyOrdersAPI,
  getOrderByIdAPI
};
