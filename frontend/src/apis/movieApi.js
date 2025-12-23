import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/movies`,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export default api;
