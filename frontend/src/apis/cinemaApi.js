import axios from 'axios';

// Base URL từ environment variable hoặc mặc định localhost
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Tạo axios instance cho Cinema API
const api = axios.create({
  baseURL: `${API_URL}/cinemas`,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Lấy danh sách tất cả rạp chiếu phim
 */
export const getAllCinemasAPI = async () => {
  const response = await api.get('/');
  return response.data;
};

/**
 * Lấy chi tiết rạp theo ID
 * @param {string} id - Cinema ID
 */
export const getCinemaAPI = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

/**
 * Lấy danh sách rạp có lịch chiếu cho phim cụ thể
 * @param {string} movieId - ID phim cần tìm
 */
export const getCinemasByMovieAPI = async (movieId) => {
  const response = await axios.get(`${API_URL}/showtimes`, {
    params: { movieId }
  });

  const showtimes = response.data?.data?.showtimes || [];
  const cinemaIds = [...new Set(
    showtimes.map(s => s.roomId?.cinemaId?._id || s.roomId?.cinemaId)
  )];

  if (cinemaIds.length === 0) {
    return getAllCinemasAPI();
  }

  return response.data;
};

/**
 * Lấy danh sách thành phố có rạp chiếu phim
 */
export const getCitiesAPI = async () => {
  const response = await api.get('/cities');
  return response.data;
};

export default api;
