import axiosClient from './axiosClient';

const personApi = {
  // Lấy danh sách tất cả (diễn viên + đạo diễn)
  getAll: (params) => {
    const url = '/persons';
    return axiosClient.get(url, { params });
  },

  // Lấy danh sách diễn viên
  getActors: (params) => {
    const url = '/persons/actors';
    return axiosClient.get(url, { params });
  },

  // Lấy danh sách đạo diễn
  getDirectors: (params) => {
    const url = '/persons/directors';
    return axiosClient.get(url, { params });
  },

  // Lấy chi tiết theo slug
  getBySlug: (slug) => {
    const url = `/persons/${slug}`;
    return axiosClient.get(url);
  }
};

export default personApi;
