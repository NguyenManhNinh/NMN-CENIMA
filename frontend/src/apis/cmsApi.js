import axiosInstance from './axiosInstance';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Public axios (no auth)
const publicApi = axios.create({
  baseURL: `${API_URL}/cms`,
  headers: { 'Content-Type': 'application/json' }
});

// ========== BANNER API ==========

/** Get all banners (qua axiosInstance để admin thấy cả INACTIVE) */
export const getAllBannersAPI = async () => {
  const response = await axiosInstance.get('/cms/banners');
  return response.data;
};

/** Create banner (Admin) */
export const createBannerAPI = async (data) => {
  const response = await axiosInstance.post('/cms/banners', data);
  return response.data;
};

/** Update banner (Admin) */
export const updateBannerAPI = async (id, data) => {
  const response = await axiosInstance.patch(`/cms/banners/${id}`, data);
  return response.data;
};

/** Delete banner (Admin) */
export const deleteBannerAPI = async (id) => {
  const response = await axiosInstance.delete(`/cms/banners/${id}`);
  return response.data;
};

// ========== ARTICLE API ==========

export const getAllArticlesAPI = async (params = {}) => {
  const response = await publicApi.get('/articles', { params });
  return response.data;
};

export const getArticleAPI = async (slug) => {
  const response = await publicApi.get(`/articles/${slug}`);
  return response.data;
};

export default publicApi;
