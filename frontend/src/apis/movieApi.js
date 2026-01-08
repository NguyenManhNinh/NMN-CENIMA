import axios from 'axios';

// Base URL từ environment variable hoặc mặc định localhost
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Tạo axios instance cho Movie API
const api = axios.create({
  baseURL: `${API_URL}/movies`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor - Tự động thêm access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor - Xử lý refresh token khi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
          withCredentials: true
        });
        const { token } = response.data;

        localStorage.setItem('accessToken', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Lấy danh sách tất cả phim với filters
 * @param {Object} params - { status, genre, page, limit }
 */
export const getAllMoviesAPI = async (params = {}) => {
  const response = await api.get('/', { params });
  return response.data;
};

/**
 * Lấy danh sách phim đang chiếu
 * @param {number} limit - Số lượng phim (default: 8)
 */
export const getNowShowingMoviesAPI = async (limit = 8) => {
  const response = await api.get('/', {
    params: { status: 'NOW', limit }
  });
  return response.data;
};

/**
 * Lấy danh sách phim sắp chiếu
 * @param {number} limit - Số lượng phim (default: 8)
 */
export const getComingSoonMoviesAPI = async (limit = 8) => {
  const response = await api.get('/', {
    params: { status: 'COMING', limit }
  });
  return response.data;
};

/**
 * Lấy chi tiết phim theo ID hoặc slug
 * @param {string} id - Movie ID hoặc slug
 */
export const getMovieAPI = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

/**
 * Lấy danh sách phim theo thể loại
 * @param {string} genreId - ID thể loại
 * @param {number} limit - Số lượng phim (default: 8)
 */
export const getMoviesByGenreAPI = async (genreId, limit = 8) => {
  const response = await api.get('/', {
    params: { genre: genreId, limit }
  });
  return response.data;
};

/**
 * Lấy danh sách quốc gia unique từ database
 */
export const getCountriesAPI = async () => {
  const response = await api.get('/countries');
  return response.data;
};

/**
 * Lấy danh sách năm phát hành unique từ database
 */
export const getYearsAPI = async () => {
  const response = await api.get('/years');
  return response.data;
};
/**
 * Đánh giá phim
 * @param {string} movieId - ID phim cần đánh giá
 * @param {number} rating - Điểm đánh giá (1-10)
 */
export const rateMovieAPI = async (movieId, rating) => {
  const response = await api.post(`/${movieId}/rate`, { rating });
  return response.data;
};

/**
 * Tăng lượt xem phim
 * @param {string} movieId - ID phim
 */
export const incrementViewAPI = async (movieId) => {
  const response = await api.post(`/${movieId}/view`);
  return response.data;
};

/**
 * Toggle like phim (like/unlike)
 * @param {string} movieId - ID phim
 */
export const toggleLikeAPI = async (movieId) => {
  const response = await api.post(`/${movieId}/like`);
  return response.data;
};

/**
 * Kiểm tra trạng thái like của user hiện tại
 * @param {string} movieId - ID phim
 */
export const getLikeStatusAPI = async (movieId) => {
  const response = await api.get(`/${movieId}/like`);
  return response.data;
};

export default api;
