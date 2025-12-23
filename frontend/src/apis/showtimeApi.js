import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/showtimes`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== SHOWTIME API ====================

/**
 * Get all showtimes with filters
 * @param {Object} params - { movieId, cinemaId, date }
 */
export const getAllShowtimesAPI = async (params = {}) => {
  const response = await api.get('/', { params });
  return response.data;
};

/**
 * Get showtimes by movie, cinema and date
 * @param {string} movieId - Movie ID
 * @param {string} cinemaId - Cinema ID
 * @param {string} date - Date (YYYY-MM-DD)
 */
export const getShowtimesByFilterAPI = async (movieId, cinemaId, date) => {
  const response = await api.get('/', {
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
  const response = await api.get('/', {
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

export default api;
