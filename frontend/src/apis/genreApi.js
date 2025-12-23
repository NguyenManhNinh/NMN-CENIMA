import axiosClient from './axiosClient';

const genreApi = {
  // Lấy danh sách thể loại
  getAll: (params) => {
    const url = '/genres';
    return axiosClient.get(url, { params });
  },

  // Lấy chi tiết thể loại theo slug
  getBySlug: (slug) => {
    const url = `/genres/${slug}`;
    return axiosClient.get(url);
  },

  // Lấy phim theo thể loại
  getMoviesByGenre: (slug, params) => {
    const url = `/genres/${slug}/movies`;
    return axiosClient.get(url, { params });
  }
};

export default genreApi;
