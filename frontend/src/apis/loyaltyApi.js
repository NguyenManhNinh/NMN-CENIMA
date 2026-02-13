import axiosInstance from './axiosInstance';

/**
 * Lấy thông tin điểm và hạng thành viên
 * @returns {Promise<{points, rank, nextRank, pointsToNextRank, benefits}>}
 */
export const getMyLoyaltyAPI = async () => {
  const response = await axiosInstance.get('/loyalty/me');
  return response.data;
};

/**
 * Lấy lịch sử tích/tiêu điểm
 * @returns {Promise<{history: Array}>}
 */
export const getPointsHistoryAPI = async () => {
  const response = await axiosInstance.get('/loyalty/history');
  return response.data;
};
