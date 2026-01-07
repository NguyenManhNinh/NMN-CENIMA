import axiosInstance from './axiosInstance';

/**
 * Lấy danh sách reviews của phim
 * @param {string} movieId - ID phim
 * @param {object} params - Query params: sort, verified, noSpoiler, page, limit
 */
export const getReviewsByMovieAPI = async (movieId, params = {}) => {
  const response = await axiosInstance.get(`/movies/${movieId}/reviews`, { params });
  return response.data;
};

/**
 * Lấy tóm tắt reviews (điểm trung bình + phân bố sao)
 * @param {string} movieId - ID phim
 */
export const getReviewSummaryAPI = async (movieId) => {
  const response = await axiosInstance.get(`/movies/${movieId}/reviews/summary`);
  return response.data;
};

/**
 * Tạo review mới
 * @param {string} movieId - ID phim
 * @param {object} data - { rating, title?, content, hasSpoiler? }
 */
export const createReviewAPI = async (movieId, data) => {
  const response = await axiosInstance.post(`/movies/${movieId}/reviews`, data);
  return response.data;
};

/**
 * Cập nhật review
 * @param {string} movieId - ID phim
 * @param {string} reviewId - ID review
 * @param {object} data - { rating?, title?, content?, hasSpoiler? }
 */
export const updateReviewAPI = async (movieId, reviewId, data) => {
  const response = await axiosInstance.patch(`/movies/${movieId}/reviews/${reviewId}`, data);
  return response.data;
};

/**
 * Xóa review
 * @param {string} movieId - ID phim
 * @param {string} reviewId - ID review
 */
export const deleteReviewAPI = async (movieId, reviewId) => {
  const response = await axiosInstance.delete(`/movies/${movieId}/reviews/${reviewId}`);
  return response.data;
};

/**
 * Toggle like review
 * @param {string} movieId - ID phim
 * @param {string} reviewId - ID review
 */
export const likeReviewAPI = async (movieId, reviewId) => {
  const response = await axiosInstance.post(`/movies/${movieId}/reviews/${reviewId}/like`);
  return response.data;
};
