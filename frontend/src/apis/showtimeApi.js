import axiosInstance from './axiosInstance';

// SHOWTIME API

/**
 * Get all showtimes with filters
 * @param {Object} params - { movieId, cinemaId, date }
 */
export const getAllShowtimesAPI = async (params = {}) => {
  const response = await axiosInstance.get('/showtimes', { params });
  return response.data;
};

/**
 * Get showtimes by movie, cinema and date
 * @param {string} movieId - Movie ID
 * @param {string} cinemaId - Cinema ID
 * @param {string} date - Date (YYYY-MM-DD)
 */
export const getShowtimesByFilterAPI = async (movieId, cinemaId, date) => {
  const response = await axiosInstance.get('/showtimes', {
    params: { movieId, cinemaId, date }
  });
  return response.data;
};

/**
 * Get available dates for a movie at a cinema
 * @param {string} movieId - Movie ID
 * @param {string} cinemaId - Cinema ID
 */
export const getAvailableDatesAPI = async (movieId, cinemaId) => {
  const response = await axiosInstance.get('/showtimes', {
    params: { movieId, cinemaId }
  });

  // Extract unique dates from showtimes
  const showtimes = response.data?.data?.showtimes || [];
  const dates = [...new Set(showtimes.map(s => {
    const date = new Date(s.startAt);
    return date.toISOString().split('T')[0];
  }))].sort();

  return { dates };
};

/**
 * Get showtime by ID (includes movie, cinema, room details)
 * @param {string} showtimeId - Showtime ID
 * @returns {Promise<{showtime: Object}>}
 */
export const getShowtimeByIdAPI = async (showtimeId) => {
  const response = await axiosInstance.get(`/showtimes/${showtimeId}`);
  return response.data;
};

export default axiosInstance;
