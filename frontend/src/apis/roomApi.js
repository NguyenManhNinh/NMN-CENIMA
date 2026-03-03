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
/**
 * Cập nhật phòng (bao gồm seatMap)
 * @param {string} roomId - ID phòng
 * @param {object} data - Dữ liệu cập nhật
 */
export const updateRoomAPI = async (roomId, data) => {
  const response = await axiosInstance.patch(`/rooms/${roomId}`, data);
  return response.data;
};
/**
 * Tạo phòng mới
 * @param {object} data - { cinemaId, name, type, totalSeats, seatMap, status }
 */
export const createRoomAPI = async (data) => {
  const response = await axiosInstance.post('/rooms', data);
  return response.data;
};
/**
 * Xoá phòng
 * @param {string} roomId - ID phòng
 */
export const deleteRoomAPI = async (roomId) => {
  const response = await axiosInstance.delete(`/rooms/${roomId}`);
  return response.data;
};

export default axiosInstance;
