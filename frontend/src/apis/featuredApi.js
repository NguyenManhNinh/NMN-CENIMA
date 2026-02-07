import axios from 'axios';

// Base URL từ environment variable hoặc mặc định localhost
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Tạo axios instance cho Featured API
const api = axios.create({
  baseURL: `${API_URL}/featured`,
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
 * Lấy danh sách bài viết Phim Hay (có phân trang)
 * @param {Object} params - { page, limit, sort }
 */
export const getFeaturedArticlesAPI = async (params = {}) => {
  const response = await api.get('/', { params });
  return response.data;
};

/**
 * Lấy chi tiết bài viết theo slug
 * @param {string} slug - Slug của bài viết
 */
export const getFeaturedArticleBySlugAPI = async (slug) => {
  const response = await api.get(`/${slug}`);
  return response.data;
};

/**
 * Tăng lượt xem bài viết
 * @param {string} id - ID bài viết
 */
export const incrementFeaturedViewAPI = async (id) => {
  const response = await api.post(`/${id}/view`);
  return response.data;
};

/**
 * Toggle like bài viết (yêu cầu đăng nhập)
 * @param {string} id - ID bài viết
 */
export const toggleFeaturedLikeAPI = async (id) => {
  const response = await api.post(`/${id}/like`);
  return response.data;
};

export default api;
