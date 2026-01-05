import axiosInstance from './axiosInstance';

/**
 * Lấy danh sách ghế đang được giữ của một suất chiếu
 * @param {string} showtimeId - ID suất chiếu
 * @returns {Promise<{holds: Array<{seatCode, userId, expiredAt}>}>}
 */
export const getHoldsByShowtimeAPI = async (showtimeId) => {
  const response = await axiosInstance.get(`/holds/showtime/${showtimeId}`);
  return response.data;
};

/**
 * Giữ ghế (Hold) - Cần đăng nhập
 * @param {string} showtimeId - ID suất chiếu
 * @param {string} seatCode - Mã ghế (VD: A1, B2)
 * @param {string} groupId - ID nhóm (optional)
 */
export const createHoldAPI = async (showtimeId, seatCode, groupId = null) => {
  // Chỉ gửi groupId nếu có giá trị (tránh Zod validation error với null)
  const body = { showtimeId, seatCode };
  if (groupId) body.groupId = groupId;

  const response = await axiosInstance.post('/holds', body);
  return response.data;
};

/**
 * Nhả ghế (Release) - Cần đăng nhập
 * @param {string} showtimeId - ID suất chiếu
 * @param {string} seatCode - Mã ghế
 */
export const releaseHoldAPI = async (showtimeId, seatCode) => {
  const response = await axiosInstance.post('/holds/release', { showtimeId, seatCode });
  return response.data;
};

/**
 * Verify hold còn hiệu lực và lấy thời gian còn lại
 * @param {string} showtimeId - ID suất chiếu
 * @returns {Promise<{valid: boolean, remainingSeconds: number, holds: string[]}>}
 */
export const verifyHoldAPI = async (showtimeId) => {
  const response = await axiosInstance.get(`/holds/verify/${showtimeId}`);
  return response.data;
};

export default axiosInstance;
