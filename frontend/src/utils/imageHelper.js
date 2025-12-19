/**
 * IMAGE HELPER - Xử lý ảnh an toàn
 * Dùng cho Dashboard và các component hiển thị ảnh
 */

// Base URL cho ảnh từ server (cấu hình trong .env)
const IMAGE_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Ảnh mặc định khi lỗi
const DEFAULT_IMAGES = {
  banner: '/images/default-banner.jpg',
  poster: '/images/default-poster.jpg',
  avatar: '/images/default-avatar.png',
  event: '/images/default-event.jpg'
};

/**
 * Lấy URL ảnh an toàn
 * @param {string} url - URL ảnh gốc (có thể là path hoặc full URL)
 * @param {string} type - Loại ảnh: 'banner' | 'poster' | 'avatar' | 'event'
 * @returns {string} - URL ảnh an toàn
 */
export const getImageUrl = (url, type = 'banner') => {
  // Nếu không có URL, trả về ảnh mặc định
  if (!url) {
    return DEFAULT_IMAGES[type] || DEFAULT_IMAGES.banner;
  }

  // Nếu là full URL (http/https), giữ nguyên
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Nếu là data:image (base64), giữ nguyên
  if (url.startsWith('data:image')) {
    return url;
  }

  // Nếu là path từ server, thêm base URL
  return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * Xử lý lỗi khi ảnh không load được
 * @param {Event} event - Event từ img onError
 * @param {string} type - Loại ảnh để lấy ảnh mặc định
 */
export const handleImageError = (event, type = 'banner') => {
  event.target.onerror = null; // Tránh loop vô hạn
  event.target.src = DEFAULT_IMAGES[type] || DEFAULT_IMAGES.banner;
};

/**
 * Validate URL ảnh có hợp lệ không
 * @param {string} url - URL cần kiểm tra
 * @returns {boolean}
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;

  // Kiểm tra định dạng URL cơ bản
  const validPatterns = [
    /^https?:\/\//i,        // http:// hoặc https://
    /^data:image\//i,       // base64
    /^\//                   // path từ root
  ];

  return validPatterns.some(pattern => pattern.test(url));
};

/**
 * Kiểm tra file upload có phải ảnh không
 * @param {File} file - File được upload
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Kích thước ảnh tối đa 5MB' };
  }

  return { valid: true };
};

export default {
  getImageUrl,
  handleImageError,
  isValidImageUrl,
  validateImageFile,
  DEFAULT_IMAGES
};
