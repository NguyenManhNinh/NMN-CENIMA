import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/genres`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// GENRE API

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

export default api;

