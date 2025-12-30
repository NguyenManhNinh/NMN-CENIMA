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

export default api;
