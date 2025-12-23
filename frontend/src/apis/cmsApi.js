import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/cms`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== BANNER API ====================

/**
 * Get all banners
 */
export const getAllBannersAPI = async () => {
  const response = await api.get('/banners');
  return response.data;
};

// ==================== ARTICLE API ====================

/**
 * Get all articles
 * @param {Object} params - { category, limit, page }
 */
export const getAllArticlesAPI = async (params = {}) => {
  const response = await api.get('/articles', { params });
  return response.data;
};

/**
 * Get article by slug
 * @param {string} slug - Article slug
 */
export const getArticleAPI = async (slug) => {
  const response = await api.get(`/articles/${slug}`);
  return response.data;
};

// ==================== EVENT API ====================

/**
 * Get all events (promotions)
 * @param {Object} params - { limit, page }
 */
export const getAllEventsAPI = async (params = {}) => {
  const response = await api.get('/events', { params });
  return response.data;
};

export default api;
