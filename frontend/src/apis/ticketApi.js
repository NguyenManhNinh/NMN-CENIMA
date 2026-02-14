import axiosInstance from './axiosInstance';

/**
 * Lấy danh sách vé của user hiện tại
 * @returns {Promise<{tickets: Array}>}
 */
export const getMyTicketsAPI = async () => {
  const response = await axiosInstance.get('/tickets/me');
  return response.data;
};

/**
 * Lấy chi tiết 1 vé
 * @param {string} ticketId - ID vé
 * @returns {Promise<{ticket: Object}>}
 */
export const getTicketByIdAPI = async (ticketId) => {
  const response = await axiosInstance.get(`/tickets/${ticketId}`);
  return response.data;
};

export default {
  getMyTicketsAPI,
  getTicketByIdAPI
};
