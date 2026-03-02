import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Tạo axios instance cho Genre API
const api = axios.create({
  baseURL: `${API_URL}/genres`,
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
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
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

// === API GENRE ===

/**
 * Get all genres
 * @param {Object} params - { isActive }
 */
export const getAllGenresAPI = async (params = {}) => {
  const response = await api.get('/', { params });
  return response.data;
};

/**
 * Get genre by slug
 * @param {string} slug - Genre slug
 */
export const getGenreBySlugAPI = async (slug) => {
  const response = await api.get(`/${slug}`);
  return response.data;
};

/**
 * Get movies by genre slug
 * @param {string} slug - Genre slug
 * @param {Object} params - { page, limit, status }
 */
export const getMoviesByGenreAPI = async (slug, params = {}) => {
  const response = await api.get(`/${slug}/movies`, { params });
  return response.data;
};

/**
 * Get unique categories for dropdown filter
 */
export const getCategoriesAPI = async () => {
  const response = await api.get('/categories');
  return response.data;
};

/**
 * Get unique countries for dropdown filter
 */
export const getCountriesAPI = async () => {
  const response = await api.get('/countries');
  return response.data;
};

/**
 * Get unique years for dropdown filter
 */
export const getYearsAPI = async () => {
  const response = await api.get('/years');
  return response.data;
};

/**
 * Toggle like/unlike cho genre
 * @param {string} genreId - Genre ID
 */
export const toggleGenreLikeAPI = async (genreId) => {
  const token = localStorage.getItem('accessToken');
  const response = await api.post(`/${genreId}/like`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Lấy trạng thái like của user cho genre
 * @param {string} genreId - Genre ID
 */
export const getGenreLikeStatusAPI = async (genreId) => {
  const token = localStorage.getItem('accessToken');
  const response = await api.get(`/${genreId}/like-status`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Rate genre (đánh giá bài viết)
 * @param {string} genreId - Genre ID
 * @param {number} rating - Rating value (1-10)
 */
export const rateGenreAPI = async (genreId, rating) => {
  const token = localStorage.getItem('accessToken');
  const response = await api.post(`/${genreId}/rate`, { rating }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Increment view count cho genre
 * @param {string} genreId - Genre ID
 */
export const incrementGenreViewAPI = async (genreId) => {
  const response = await api.post(`/${genreId}/view`);
  return response.data;
};

/**
 * Tạo thể loại mới (Admin only)
 * @param {Object} data - { name, nameEn, description, category, ... }
 */
export const createGenreAPI = async (data) => {
  const response = await api.post('/', data);
  return response.data;
};

/**
 * Cập nhật thể loại (Admin only)
 * @param {string} genreId - ID thể loại
 * @param {Object} data - Dữ liệu cập nhật
 */
export const updateGenreAPI = async (genreId, data) => {
  const response = await api.put(`/${genreId}`, data);
  return response.data;
};

/**
 * Xóa thể loại (Admin only)
 * @param {string} genreId - ID thể loại
 */
export const deleteGenreAPI = async (genreId) => {
  const response = await api.delete(`/${genreId}`);
  return response.data;
};

export default api;
