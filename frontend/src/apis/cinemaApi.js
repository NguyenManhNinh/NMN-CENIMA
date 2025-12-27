import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/cinemas`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== CINEMA API ====================

/**
 * Get all cinemas
 */
export const getAllCinemasAPI = async () => {
  const response = await api.get('/');
  return response.data;
};

/**
 * Get cinema by ID
 * @param {string} id - Cinema ID
 */
export const getCinemaAPI = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

/**
 * Get cinemas that have showtimes for a specific movie
 * @param {string} movieId - Movie ID
 */
export const getCinemasByMovieAPI = async (movieId) => {
  // Gọi API showtimes và lọc ra các rạp có chiếu phim này
  const response = await axios.get(`${API_URL}/showtimes`, {
    params: { movieId }
  });

  // Lấy danh sách unique cinemas từ showtimes
  const showtimes = response.data?.data?.showtimes || [];
  const cinemaIds = [...new Set(showtimes.map(s => s.roomId?.cinemaId?._id || s.roomId?.cinemaId))];

  // Nếu không có showtime, trả về tất cả cinemas
  if (cinemaIds.length === 0) {
    return getAllCinemasAPI();
  }

  return response.data;
};

/**
 * Get list of cities that have cinemas
 */
export const getCitiesAPI = async () => {
  const response = await api.get('/cities');
  return response.data;
};

export default api;
