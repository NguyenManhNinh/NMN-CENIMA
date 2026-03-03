import axiosInstance from './axiosInstance';

/** Doanh thu theo ngày + tổng hợp + % so sánh kỳ trước + trạng thái đơn */
export const getRevenueTrendAPI = async (params = {}) => {
  const response = await axiosInstance.get('/reports/statistics/revenue-trend', { params });
  return response.data;
};

/** Phân bổ theo ngân hàng (bankCode) */
export const getPaymentMethodsAPI = async (params = {}) => {
  const response = await axiosInstance.get('/reports/statistics/payment-methods', { params });
  return response.data;
};

/** Top phim doanh thu cao nhất */
export const getTopMoviesStatsAPI = async (params = {}) => {
  const response = await axiosInstance.get('/reports/statistics/top-movies', { params });
  return response.data;
};

/** Bảng chi tiết đơn hàng (phân trang) */
export const getOrdersTableAPI = async (params = {}) => {
  const response = await axiosInstance.get('/reports/statistics/orders-table', { params });
  return response.data;
};

/** Giờ cao điểm — phân bổ đơn hàng theo giờ */
export const getPeakHoursAPI = async (params = {}) => {
  const response = await axiosInstance.get('/reports/statistics/peak-hours', { params });
  return response.data;
};

/** Thống kê voucher/KM đã sử dụng */
export const getVoucherStatsAPI = async (params = {}) => {
  const response = await axiosInstance.get('/reports/statistics/voucher-stats', { params });
  return response.data;
};

/** Combo bán chạy (có lọc thời gian) */
export const getTopCombosStatsAPI = async (params = {}) => {
  const response = await axiosInstance.get('/reports/statistics/top-combos', { params });
  return response.data;
};
