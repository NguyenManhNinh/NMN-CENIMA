import axiosInstance from './axiosInstance';

// Wrapper để thêm prefix /persons
const api = {
  get: (url, config) => axiosInstance.get(`/persons${url}`, config),
  post: (url, data, config) => axiosInstance.post(`/persons${url}`, data, config),
  put: (url, data, config) => axiosInstance.put(`/persons${url}`, data, config),
  delete: (url, config) => axiosInstance.delete(`/persons${url}`, config)
};

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
  const response = await api.post(`/${personId}/like`, {});
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

// ============== ADMIN CRUD ==============

/**
 * Create new person (Admin)
 * @param {Object} data - Person data
 */
export const createPersonAPI = async (data) => {
  const response = await api.post('/', data);
  return response.data;
};

/**
 * Update person (Admin)
 * @param {string} id - Person ID
 * @param {Object} data - Person data
 */
export const updatePersonAPI = async (id, data) => {
  const response = await api.put(`/${id}`, data);
  return response.data;
};

/**
 * Delete person (Admin)
 * @param {string} id - Person ID
 */
export const deletePersonAPI = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

export default api;
