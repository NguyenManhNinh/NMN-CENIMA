import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance with credentials
const api = axios.create({
  baseURL: `${API_URL}/auth`,
  withCredentials: true, // Important for cookies (refresh token)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.post('/refresh-token');
        const { token } = response.data;

        localStorage.setItem('accessToken', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

/**
 * Register new user
 * @param {Object} data - { name, email, password, phone?, gender?, birthday? }
 */
export const registerAPI = async (data) => {
  const response = await api.post('/register', data);
  return response.data;
};

/**
 * Verify account with OTP
 * @param {Object} data - { email, otp }
 */
export const verifyAccountAPI = async (data) => {
  const response = await api.post('/verify', data);
  return response.data;
};

/**
 * Login with email and password
 * @param {Object} data - { email, password }
 */
export const loginAPI = async (data) => {
  const response = await api.post('/login', data);
  return response.data;
};

/**
 * Logout - revoke refresh token
 */
export const logoutAPI = async () => {
  const response = await api.post('/logout');
  return response.data;
};

/**
 * Forgot password - send OTP to email
 * @param {Object} data - { email }
 */
export const forgotPasswordAPI = async (data) => {
  const response = await api.post('/forgot-password', data);
  return response.data;
};

/**
 * Reset password with OTP
 * @param {Object} data - { email, otp, password }
 */
export const resetPasswordAPI = async (data) => {
  const response = await api.post('/reset-password', data);
  return response.data;
};

/**
 * Get current user info
 */
export const getMeAPI = async () => {
  const response = await api.get('/me');
  return response.data;
};

/**
 * Get Google OAuth URL
 */
export const getGoogleAuthURL = () => {
  return `${API_URL}/auth/google`;
};

/**
 * Get Facebook OAuth URL
 */
export const getFacebookAuthURL = () => {
  return `${API_URL}/auth/facebook`;
};

export default api;
