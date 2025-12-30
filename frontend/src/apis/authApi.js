import axiosInstance from './axiosInstance';

// AUTH API

/**
 * Register new user
 * @param {Object} data - { name, email, password, phone?, gender?, birthday? }
 */
export const registerAPI = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

/**
 * Verify account with OTP
 * @param {Object} data - { email, otp }
 */
export const verifyAccountAPI = async (data) => {
  const response = await axiosInstance.post('/auth/verify', data);
  return response.data;
};

/**
 * Login with email and password
 * @param {Object} data - { email, password }
 */
export const loginAPI = async (data) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data;
};

/**
 * Logout - revoke refresh token
 */
export const logoutAPI = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

/**
 * Forgot password - send OTP to email
 * @param {Object} data - { email }
 */
export const forgotPasswordAPI = async (data) => {
  const response = await axiosInstance.post('/auth/forgot-password', data);
  return response.data;
};

/**
 * Reset password with OTP
 * @param {Object} data - { email, otp, password }
 */
export const resetPasswordAPI = async (data) => {
  const response = await axiosInstance.post('/auth/reset-password', data);
  return response.data;
};

/**
 * Get current user info
 */
export const getMeAPI = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

/**
 * Refresh access token manually (usually auto-handled by interceptor)
 */
export const refreshTokenAPI = async () => {
  const response = await axiosInstance.post('/auth/refresh-token');
  return response.data;
};

/**
 * Get Google OAuth URL
 */
export const getGoogleAuthURL = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  return `${API_URL}/auth/google`;
};

export default axiosInstance;
