import axiosInstance from './axiosInstance';

const API_BASE = '/promotions';

/**
 * Helper: Unwrap response để component không cần biết structure
 * Backend có thể trả { data: {...} } hoặc { success, ...payload }
 * P0-1 Fix: Check hasOwnProperty để handle null/array/string data
 */
const unwrap = (response) => {
  const res = response?.data;
  // Pattern 1: { data: ... } - unwrap nếu có key 'data'
  if (res && Object.prototype.hasOwnProperty.call(res, 'data')) {
    return res.data;
  }
  // Pattern 2: { success, ...payload } - return as-is
  return res;
};

/**
 * Helper: Validate input không rỗng
 */
const guardSlug = (slug) => {
  if (!slug || typeof slug !== 'string' || !slug.trim()) {
    throw new Error('Invalid promotion slug');
  }
  return encodeURIComponent(slug.trim());
};

const guardId = (id) => {
  if (!id || typeof id !== 'string' || !id.trim()) {
    throw new Error('Invalid promotion ID');
  }
  return id.trim();
};

// ============ PUBLIC APIs ============

/**
 * Lấy danh sách promotions (public)
 * @returns Promise<{ promotions: [], pagination: {} }>
 */
export const getPromotionsAPI = async (params = {}) => {
  const response = await axiosInstance.get(API_BASE, { params });
  return unwrap(response);
};

/**
 * Lấy trang ưu đãi tổng hợp: promotions LIST + banners BOTTOM_BANNER
 * @returns Promise<{ promotions: [], banners: [], pagination?: {} }>
 */
export const getPromotionsHomeAPI = async (params = {}) => {
  const response = await axiosInstance.get(`${API_BASE}/home`, { params });
  const res = response?.data;
  // Unwrap data nhưng giữ pagination
  if (res && Object.prototype.hasOwnProperty.call(res, 'data')) {
    return { ...res.data, pagination: res.pagination };
  }
  return res;
};

/**
 * Lấy chi tiết promotion theo slug (public)
 * @returns Promise<Promotion & { claimState, canClaim, remainingRedeems, ... }>
 */
export const getPromotionBySlugAPI = async (slug) => {
  const safeSlug = guardSlug(slug);
  const response = await axiosInstance.get(`${API_BASE}/${safeSlug}`);
  return unwrap(response);
};

/**
 * Nhận voucher từ promotion (ONLINE_VOUCHER)
 * @returns Promise<{ success, alreadyClaimed, userVoucher, message }>
 */
export const claimPromotionAPI = async (promotionId) => {
  const safeId = guardId(promotionId);
  const response = await axiosInstance.post(`${API_BASE}/${safeId}/claim`);
  return response.data; // Direct response, no wrapper
};

/**
 * Lấy mã offline QR (OFFLINE_ONLY + QR_REDEEM)
 * @returns Promise<{ success, alreadyClaimed, redeem: { token, qrData, expiresAt }, message }>
 */
export const offlineClaimPromotionAPI = async (promotionId) => {
  const safeId = guardId(promotionId);
  const response = await axiosInstance.post(`${API_BASE}/${safeId}/offline-claim`);
  return response.data; // Direct response, no wrapper
};

/**
 * Toggle like/unlike cho promotion
 * @returns Promise<{ success, liked, likeCount, message }>
 */
export const toggleLikeAPI = async (promotionId) => {
  const safeId = guardId(promotionId);
  const response = await axiosInstance.post(`${API_BASE}/${safeId}/like`);
  return response.data;
};

/**
 * Kiểm tra trạng thái like của user
 * @returns Promise<{ success, liked, likeCount }>
 */
export const getLikeStatusAPI = async (promotionId) => {
  const safeId = guardId(promotionId);
  const response = await axiosInstance.get(`${API_BASE}/${safeId}/like-status`);
  return response.data;
};

// ============ STAFF APIs ============

/**
 * Staff redeem token tại quầy
 * @returns Promise<{ success, message, redeem }>
 */
export const staffRedeemPromotionAPI = async (token) => {
  if (!token || typeof token !== 'string' || !token.trim()) {
    throw new Error('Invalid token');
  }
  const response = await axiosInstance.post(`${API_BASE}/staff/redeem`, {
    token: token.trim().toUpperCase()
  });
  return response.data;
};

// ============ ADMIN APIs ============

export const getAllPromotionsAdminAPI = async (params = {}) => {
  const response = await axiosInstance.get(`${API_BASE}/admin/all`, { params });
  return unwrap(response);
};

export const createPromotionAPI = async (data) => {
  const response = await axiosInstance.post(`${API_BASE}/admin`, data);
  return unwrap(response);
};

export const updatePromotionAPI = async (id, data) => {
  const safeId = guardId(id);
  const response = await axiosInstance.patch(`${API_BASE}/admin/${safeId}`, data);
  return unwrap(response);
};

export const deletePromotionAPI = async (id) => {
  const safeId = guardId(id);
  const response = await axiosInstance.delete(`${API_BASE}/admin/${safeId}`);
  return unwrap(response);
};
