import axiosInstance from './axiosInstance';

/**
 * Lấy danh sách tất cả phòng
 * @param {string} cinemaId - (Optional) Lọc theo rạp
 */
export const getAllRoomsAPI = async (cinemaId = null) => {
  const params = cinemaId ? { cinemaId } : {};
  const response = await axiosInstance.get('/rooms', { params });
  return response.data;
};

/**
 * Lấy chi tiết phòng (bao gồm seatMap)
 * @param {string} roomId - ID phòng
 * @returns {Promise<{room: {name, type, totalSeats, seatMap}}>}
 */
export const getRoomByIdAPI = async (roomId) => {
  const response = await axiosInstance.get(`/rooms/${roomId}`);
  return response.data;
};

export default axiosInstance;
