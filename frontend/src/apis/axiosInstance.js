import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Tạo axios instance chung
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // GỬI COOKIE cho refresh token
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag để tránh refresh nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue = [];

// Xử lý queue các request đang chờ token mới
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// REQUEST INTERCEPTOR: Thêm Access Token vào headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Tự động refresh token khi 401
axiosInstance.interceptors.response.use(
  // Success: Trả về response bình thường
  (response) => response,

  // Error: Xử lý 401 để refresh token
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Kiểm tra nếu là lỗi authentication (401) hoặc lỗi liên quan token
    const isAuthError = status === 401 ||
      (status === 500 && error.response?.data?.message?.includes('jwt'));

    // Nếu là auth error và chưa retry
    if (isAuthError && !originalRequest._retry) {
      // Nếu đang trong quá trình refresh, đưa request vào queue chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token (cookie tự động được gửi do withCredentials: true)
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { token } = response.data;

        // Lưu access token mới
        localStorage.setItem('accessToken', token);

        // Cập nhật user data nếu có
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        // Xử lý queue các request đang chờ
        processQueue(null, token);

        // Retry request gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // Refresh token thất bại → Đăng xuất
        processQueue(refreshError, null);

        // Xóa dữ liệu local
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        // Redirect về trang chủ hoặc login
        // Dùng custom event để AuthContext có thể bắt và xử lý
        window.dispatchEvent(new CustomEvent('auth:logout', {
          detail: { reason: 'refresh_token_expired' }
        }));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
