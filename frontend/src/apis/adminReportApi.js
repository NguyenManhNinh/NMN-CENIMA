import axiosInstance from './axiosInstance';

/**
 * Lấy danh sách báo cáo (Admin Only)
 * @param {object} params - { status: 'pending'|'dismissed'|'reviewed', page, limit }
 */
export const getAdminReportsAPI = async (params = {}) => {
  const response = await axiosInstance.get('/admin/reports', { params });
  return response.data;
};

/**
 * Xử lý báo cáo (Admin Only)
 * @param {string} reportId - ID báo cáo
 * @param {object} data - { action, banMinutes, hiddenReason }
 * - action: 'dismiss', 'hide_review', 'delete_review', 'ban_user'
 */
export const handleReportActionAPI = async (reportId, data) => {
  const response = await axiosInstance.patch(`/admin/reports/${reportId}/action`, data);
  return response.data;
};
