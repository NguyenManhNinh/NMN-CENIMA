import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Tạo axios instance cho MovieCategory API
const api = axios.create({
  baseURL: `${API_URL}/movie-categories`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Request Interceptor - Tự động thêm access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
        const res = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        const { token } = res.data;
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
 * Lấy tất cả thể loại phim
 */
export const getAllMovieCategoriesAPI = async () => {
  const response = await api.get('/');
  return response.data;
};

/**
 * Tạo thể loại phim mới + gán cho phim
 * @param {Object} data - { name, movieIds: [] }
 */
export const createMovieCategoryAPI = async (data) => {
  const response = await api.post('/', data);
  return response.data;
};

/**
 * Cập nhật thể loại phim + cập nhật phim liên quan
 * @param {string} categoryId - ID thể loại
 * @param {Object} data - { name, movieIds: [] }
 */
export const updateMovieCategoryAPI = async (categoryId, data) => {
  const response = await api.put(`/${categoryId}`, data);
  return response.data;
};

/**
 * Xóa thể loại phim (xóa khỏi tất cả phim)
 * @param {string} categoryId - ID thể loại
 */
export const deleteMovieCategoryAPI = async (categoryId) => {
  const response = await api.delete(`/${categoryId}`);
  return response.data;
};

/**
 * Lấy danh sách phim thuộc 1 thể loại
 * @param {string} categoryId - ID thể loại
 */
export const getMoviesByCategoryAPI = async (categoryId) => {
  const response = await api.get(`/${categoryId}/movies`);
  return response.data;
};

export default api;
