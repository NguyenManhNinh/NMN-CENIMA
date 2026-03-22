import axiosInstance from './axiosInstance';

/**
 * Quét vé check-in (Staff/Manager/Admin)
 * @param {Object} data - { ticketCode?, qrChecksum? } — cần ít nhất 1
 */
export const scanTicketAPI = async (data) => {
  const response = await axiosInstance.post('/checkin/scan', data);
  return response.data;
};
