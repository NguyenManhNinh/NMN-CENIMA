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
 * Toggle like/reaction review
 * @param {string} movieId - ID phim
 * @param {string} reviewId - ID review
 * @param {string} type - Reaction type (LIKE, LOVE, HAHA, WOW, SAD, ANGRY)
 */
export const likeReviewAPI = async (movieId, reviewId, type = 'LIKE') => {
  const response = await axiosInstance.post(`/movies/${movieId}/reviews/${reviewId}/like`, { type });
  return response.data;
};

/**
 * Lấy danh sách replies của một comment
 * @param {string} movieId - ID phim
 * @param {string} reviewId - ID comment gốc
 */
export const getRepliesAPI = async (movieId, reviewId) => {
  const response = await axiosInstance.get(`/movies/${movieId}/reviews/${reviewId}/replies`);
  return response.data;
};

/**
 * Reply to a comment (trả lời bình luận)
 * @param {string} movieId - ID phim
 * @param {object} data - { content, parentId }
 */
export const replyToReviewAPI = async (movieId, data) => {
  const response = await axiosInstance.post(`/movies/${movieId}/reviews`, data);
  return response.data;
};

// ============== GENRE REVIEW APIs ==============

/**
 * Lấy danh sách reviews của bài viết (genre)
 * @param {string} genreId - ID genre
 * @param {object} params - Query params: sort, verified, noSpoiler, page, limit
 */
export const getReviewsByGenreAPI = async (genreId, params = {}) => {
  const response = await axiosInstance.get(`/genres/${genreId}/reviews`, { params });
  return response.data;
};

/**
 * Lấy tóm tắt reviews cho genre (điểm trung bình + phân bố sao)
 * @param {string} genreId - ID genre
 */
export const getGenreReviewSummaryAPI = async (genreId) => {
  const response = await axiosInstance.get(`/genres/${genreId}/reviews/summary`);
  return response.data;
};

/**
 * Tạo review mới cho genre
 * @param {string} genreId - ID genre
 * @param {object} data - { rating, title?, content, hasSpoiler? }
 */
export const createGenreReviewAPI = async (genreId, data) => {
  const response = await axiosInstance.post(`/genres/${genreId}/reviews`, data);
  return response.data;
};

/**
 * Toggle like/reaction review cho genre
 * @param {string} genreId - ID genre
 * @param {string} reviewId - ID review
 * @param {string} type - Reaction type
 */
export const likeGenreReviewAPI = async (genreId, reviewId, type = 'LIKE') => {
  const response = await axiosInstance.post(`/genres/${genreId}/reviews/${reviewId}/like`, { type });
  return response.data;
};

/**
 * Lấy danh sách replies của một comment trong genre
 * @param {string} genreId - ID genre
 * @param {string} reviewId - ID comment gốc
 */
export const getGenreRepliesAPI = async (genreId, reviewId) => {
  const response = await axiosInstance.get(`/genres/${genreId}/reviews/${reviewId}/replies`);
  return response.data;
};

/**
 * Reply to a comment trong genre
 * @param {string} genreId - ID genre
 * @param {object} data - { content, parentId }
 */
export const replyToGenreReviewAPI = async (genreId, data) => {
  const response = await axiosInstance.post(`/genres/${genreId}/reviews`, data);
  return response.data;
};

// ============== REPORT APIs ==============

/**
 * Báo cáo một review vi phạm
 * @param {string} movieId - ID phim
 * @param {string} reviewId - ID review
 * @param {object} data - { reason, note? }
 */
export const reportReviewAPI = async (movieId, reviewId, data) => {
  const response = await axiosInstance.post(`/movies/${movieId}/reviews/${reviewId}/report`, data);
  return response.data;
};

/**
 * Kiểm tra user đã report review này chưa
 * @param {string} movieId - ID phim
 * @param {string} reviewId - ID review
 */
export const checkReportStatusAPI = async (movieId, reviewId) => {
  const response = await axiosInstance.get(`/movies/${movieId}/reviews/${reviewId}/report/status`);
  return response.data;
};

