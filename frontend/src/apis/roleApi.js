import axiosInstance from './axiosInstance';

export const getAllRolesAPI = () => axiosInstance.get('/roles');
export const createRoleAPI = (data) => axiosInstance.post('/roles', data);
export const updateRoleAPI = (id, data) => axiosInstance.put(`/roles/${id}`, data);
export const deleteRoleAPI = (id) => axiosInstance.delete(`/roles/${id}`);
export const updateRolePermissionsAPI = (id, permissions) => axiosInstance.put(`/roles/${id}/permissions`, { permissions });
