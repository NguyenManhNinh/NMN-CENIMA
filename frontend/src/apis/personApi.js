import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/persons`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// PERSON API

/**
 * Get all persons (actors + directors)
 * @param {Object} params - { page, limit, role, search, sort }
 */
export const getAllPersonsAPI = async (params = {}) => {
  const response = await api.get('/', { params });
  return response.data;
};

/**
 * Get actors only
 * @param {Object} params - { page, limit, search }
 */
export const getActorsAPI = async (params = {}) => {
  const response = await api.get('/actors', { params });
  return response.data;
};

/**
 * Get directors only
 * @param {Object} params - { page, limit, search }
 */
export const getDirectorsAPI = async (params = {}) => {
  const response = await api.get('/directors', { params });
  return response.data;
};

/**
 * Get person by slug
 * @param {string} slug - Person slug
 */
export const getPersonBySlugAPI = async (slug) => {
  const response = await api.get(`/${slug}`);
  return response.data;
};

/**
 * Get list of unique nationalities
 * @param {Object} params - { role: 'actor' | 'director' } (optional)
 */
export const getNationalitiesAPI = async (params = {}) => {
  const response = await api.get('/nationalities', { params });
  return response.data;
};

/**
 * Toggle like for a person (yêu cầu đăng nhập)
 * @param {string} personId - Person ID
 */
export const togglePersonLikeAPI = async (personId) => {
  const token = localStorage.getItem('accessToken');
  const response = await api.post(`/${personId}/like`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Increment view count for a person
 * @param {string} personId - Person ID
 */
export const incrementPersonViewAPI = async (personId) => {
  const response = await api.post(`/${personId}/view`);
  return response.data;
};

export default api;
