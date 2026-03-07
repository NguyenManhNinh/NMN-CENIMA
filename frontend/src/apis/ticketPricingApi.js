/**
 * API Service: Ticket Pricing (Bảng giá vé)
 *
 * Mô tả: Gọi API backend để lấy dữ liệu bảng giá vé hiển thị trên trang /gia-ve
 * Base URL: /api/v1/ticket-pricing
 *
 * Sử dụng: TicketPricingPage.jsx
 */

import axios from 'axios';

// Base URL từ biến môi trường hoặc mặc định localhost
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Tạo axios instance riêng cho Ticket Pricing
const api = axios.create({
  baseURL: `${API_URL}/ticket-pricing`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Xử lý lỗi response
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

/**
 * Lấy bảng giá vé đang active (Public - không cần đăng nhập)
 *
 * @route   GET /api/v1/ticket-pricing
 * @returns {Object} { success: true, data: { title, tabs[], notes, status } }
 * @throws  404 nếu chưa có bảng giá nào active
 * @throws  500 nếu lỗi server
 *
 * Ví dụ response thành công:
 * {
 *   "success": true,
 *   "data": {
 *     "title": "Giá Vé rạp NMN Cinema - Hà Nội",
 *     "tabs": [
 *       { "name": "GIÁ VÉ 2D", "slug": "2D-price", "imageUrl": "...", "sortOrder": 1 },
 *       { "name": "GIÁ VÉ 3D", "slug": "3D-price", "imageUrl": "...", "sortOrder": 2 }
 *     ],
 *     "notes": "<p>Ghi chú...</p>"
 *   }
 * }
 */
export const getTicketPricingAPI = async () => {
  const response = await api.get('/');
  return response.data;
};

// ═══ ADMIN APIs ═══

/**
 * [ADMIN] Lấy tất cả bảng giá (bao gồm draft)
 * @route   GET /api/v1/ticket-pricing/admin/all
 */
export const getAllTicketPricingAdminAPI = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await api.get('/admin/all', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * [ADMIN] Cập nhật hoặc tạo mới bảng giá vé
 * @route   PUT /api/v1/ticket-pricing
 * @body    { title, tabs[], notes, status }
 */
export const updateTicketPricingAdminAPI = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await api.put('/', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export default api;
