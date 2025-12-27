import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/movies`,
  withCredentials: true, // Important for cookies (refresh token)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
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
        // Don't redirect, let the calling code handle this
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== MOVIE API ====================

/**
 * Get all movies with filters
 * @param {Object} params - { status, genre, page, limit }
 */
export const getAllMoviesAPI = async (params = {}) => {
  const response = await api.get('/', { params });
  return response.data;
};

/**
 * Get movies currently showing
 */
export const getNowShowingMoviesAPI = async (limit = 8) => {
  const response = await api.get('/', {
    params: { status: 'NOW', limit }
  });
  return response.data;
};

/**
 * Get coming soon movies
 */
export const getComingSoonMoviesAPI = async (limit = 8) => {
  const response = await api.get('/', {
    params: { status: 'COMING', limit }
  });
  return response.data;
};

/**
 * Get movie by ID or slug
 * @param {string} id - Movie ID or slug
 */
export const getMovieAPI = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

/**
 * Get movies by genre
 * @param {string} genreId - Genre ID
 */
export const getMoviesByGenreAPI = async (genreId, limit = 8) => {
  const response = await api.get('/', {
    params: { genre: genreId, limit }
  });
  return response.data;
};

/**
 * Rate a movie
 * @param {string} movieId - Movie ID
 * @param {number} rating - Rating value (1-10)
 */
export const rateMovieAPI = async (movieId, rating) => {
  // Token is automatically added by interceptor
  const response = await api.post(`/${movieId}/rate`, { rating });
  return response.data;
};

export default api;
