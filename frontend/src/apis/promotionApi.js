import axiosInstance from './axiosInstance';

const API_BASE = '/promotions';

// Lấy danh sách promotions (public)
export const getPromotionsAPI = (params = {}) => {
  return axiosInstance.get(API_BASE, { params });
};

// Lấy trang ưu đãi tổng hợp: promotions LIST + banners BOTTOM_BANNER
// Response: { data: { promotions: [], banners: [] }, pagination: {...} }
export const getPromotionsHomeAPI = (params = {}) => {
  return axiosInstance.get(`${API_BASE}/home`, { params });
};

// Lấy chi tiết promotion theo slug (public, có thể kèm token)
export const getPromotionBySlugAPI = (slug) => {
  return axiosInstance.get(`${API_BASE}/${slug}`);
};

// Nhận voucher từ promotion (ONLINE_VOUCHER)
export const claimPromotionAPI = (promotionId) => {
  return axiosInstance.post(`${API_BASE}/${promotionId}/claim`);
};

// Lấy mã offline (OFFLINE_ONLY)
export const offlineClaimPromotionAPI = (promotionId) => {
  return axiosInstance.post(`${API_BASE}/${promotionId}/offline-claim`);
};

// Staff redeem token
export const staffRedeemPromotionAPI = (token) => {
  return axiosInstance.post(`${API_BASE}/staff/redeem`, { token });
};

// Admin APIs
export const getAllPromotionsAdminAPI = (params = {}) => {
  return axiosInstance.get(`${API_BASE}/admin/all`, { params });
};

export const createPromotionAPI = (data) => {
  return axiosInstance.post(`${API_BASE}/admin`, data);
};

export const updatePromotionAPI = (id, data) => {
  return axiosInstance.patch(`${API_BASE}/admin/${id}`, data);
};

export const deletePromotionAPI = (id) => {
  return axiosInstance.delete(`${API_BASE}/admin/${id}`);
};
