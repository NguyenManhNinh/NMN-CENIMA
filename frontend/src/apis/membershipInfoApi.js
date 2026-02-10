/**
 * API Service: Membership Info (Thông tin thành viên)
 *
 * Mô tả: Gọi API backend để lấy dữ liệu trang thành viên hiển thị trên /thanh-vien
 * Base URL: /api/v1/membership-info
 *
 * Sử dụng: MembershipPage.jsx
 */

import axios from 'axios';

// Base URL từ biến môi trường hoặc mặc định localhost
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Tạo axios instance riêng cho Membership Info
const api = axios.create({
  baseURL: `${API_URL}/membership-info`,
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
 * Lấy thông tin thành viên đang active (Public - không cần đăng nhập)
 *
 * @route   GET /api/v1/membership-info
 * @returns {Object} { success: true, data: { title, sections[], status } }
 * @throws  404 nếu chưa có thông tin nào active
 * @throws  500 nếu lỗi server
 */
export const getMembershipInfoAPI = async () => {
  const response = await api.get('/');
  return response.data;
};

export default api;
