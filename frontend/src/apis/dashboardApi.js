import axiosInstance from './axiosInstance';

// ========== DASHBOARD API ==========

/** 4 thẻ thống kê */
export const getDashboardStatsAPI = async () => {
  const res = await axiosInstance.get('/reports/dashboard/stats');
  return res.data;
};

/** Doanh thu 7 ngày (BarChart) */
export const getRevenue7DaysAPI = async () => {
  const res = await axiosInstance.get('/reports/dashboard/revenue-7d');
  return res.data;
};

/** Xu hướng doanh thu 30 ngày (LineChart) */
export const getRevenue30DaysAPI = async () => {
  const res = await axiosInstance.get('/reports/dashboard/revenue-30d');
  return res.data;
};

/** Thể loại phim phổ biến (PieChart) */
export const getGenreStatsAPI = async () => {
  const res = await axiosInstance.get('/reports/dashboard/genre-stats');
  return res.data;
};

/** Top 5 phim bán chạy */
export const getTopMoviesAPI = async () => {
  const res = await axiosInstance.get('/reports/top-movies');
  return res.data;
};

/** Suất chiếu hôm nay */
export const getTodayShowtimesAPI = async () => {
  const res = await axiosInstance.get('/reports/dashboard/today-showtimes');
  return res.data;
};

/** Đơn hàng gần đây */
export const getRecentOrdersAPI = async () => {
  const res = await axiosInstance.get('/reports/dashboard/recent-orders');
  return res.data;
};

/** Tỷ lệ lấp đầy ghế */
export const getOccupancyRateAPI = async () => {
  const res = await axiosInstance.get('/reports/occupancy');
  return res.data;
};

/** Top combo bán chạy */
export const getTopCombosAPI = async () => {
  const res = await axiosInstance.get('/reports/dashboard/top-combos');
  return res.data;
};

/** Phân bổ thành viên (PieChart) */
export const getMembershipStatsAPI = async () => {
  const res = await axiosInstance.get('/reports/dashboard/membership');
  return res.data;
};

/** Khuyến mãi đang hoạt động */
export const getActivePromotionsAPI = async () => {
  const res = await axiosInstance.get('/reports/dashboard/promotions');
  return res.data;
};

/** Tổng quan nhanh hôm nay */
export const getTodaySummaryAPI = async () => {
  const res = await axiosInstance.get('/reports/dashboard/today-summary');
  return res.data;
};
