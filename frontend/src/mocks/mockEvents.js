export const mockEvents = [
  // Group 1 (index 0-3)
  {
    _id: 'thu-4-combo-day',
    title: 'THỨ 4 COMBO DAY',
    description: 'Mua combo bắp nước tặng ngay 1 Pepsi miễn phí',
    bannerUrl: 'https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/khuyenmai/Comboday.png',
    startAt: '2024-12-01T00:00:00.000Z',
    endAt: '2024-12-31T23:59:59.000Z',
    status: 'ONGOING'
  },
  {
    _id: 'uu-dai-ve-hssv',
    title: 'ƯU ĐÃI VÉ DÀNH CHO HỌC SINH SINH VIÊN',
    description: 'Săn vé IMAX giảm giá đến 50%',
    bannerUrl: 'https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/khuyenmai/u22%20web.jpg',
    startAt: '2024-12-10T00:00:00.000Z',
    endAt: '2025-01-10T23:59:59.000Z',
    status: 'ONGOING'
  },
  {
    _id: 'chuc-mung-sinh-nhat-nmn-cinema-vincom',
    title: 'HAPPY BIRTHDAY',
    description: 'Giảm 30% vé xem phim nhân dịp khai trương',
    bannerUrl: 'https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/khuyenmai/happy%20day%20web.jpg',
    startAt: '2024-12-15T00:00:00.000Z',
    endAt: '2025-01-15T23:59:59.000Z',
    status: 'ONGOING'
  },
  {
    _id: 'uu-dai-ve-45k',
    title: 'ƯU ĐÃI VÉ SAU 10H GIÁ 45K',
    description: 'Áp dụng cho tất cả suất chiếu 2D',
    bannerUrl: 'https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/khuyenmai/S%C3%81NG%20T%E1%BB%90I%20WEB.jpg',
    startAt: '2024-12-01T00:00:00.000Z',
    endAt: '2025-02-28T23:59:59.000Z',
    status: 'ONGOING'
  },
  // Loạt ảnh thứ 2
  {
    _id: 'thu-4-combo-day',
    title: 'THỨ 4 COMBO DAY',
    description: 'Mua combo bắp nước tặng ngay 1 Pepsi miễn phí',
    bannerUrl: 'https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/khuyenmai/Comboday.png',
    startAt: '2024-12-01T00:00:00.000Z',
    endAt: '2024-12-31T23:59:59.000Z',
    status: 'ONGOING'
  },
  {
    _id: 'uu-dai-ve-hssv',
    title: 'ƯU ĐÃI VÉ DÀNH CHO HỌC SINH SINH VIÊN',
    description: 'Săn vé IMAX giảm giá đến 50%',
    bannerUrl: 'https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/khuyenmai/u22%20web.jpg',
    startAt: '2024-12-10T00:00:00.000Z',
    endAt: '2025-01-10T23:59:59.000Z',
    status: 'ONGOING'
  },
  {
    _id: 'chuc-mung-sinh-nhat-nmn-cinema-vincom',
    title: 'HAPPY BIRTHDAY',
    description: 'Giảm 30% vé xem phim nhân dịp khai trương',
    bannerUrl: 'https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/khuyenmai/happy%20day%20web.jpg',
    startAt: '2024-12-15T00:00:00.000Z',
    endAt: '2025-01-15T23:59:59.000Z',
    status: 'ONGOING'
  },
  {
    _id: 'uu-dai-ve-45k',
    title: 'ƯU ĐÃI VÉ SAU 10H GIÁ 45K',
    description: 'Áp dụng cho tất cả suất chiếu 2D',
    bannerUrl: 'https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/khuyenmai/S%C3%81NG%20T%E1%BB%90I%20WEB.jpg',
    startAt: '2024-12-01T00:00:00.000Z',
    endAt: '2025-02-28T23:59:59.000Z',
    status: 'ONGOING'
  },

];

// Lấy danh sách events đang diễn ra
export const getOngoingEvents = () => {
  return mockEvents.filter(event => event.status === 'ONGOING');
};

// Lấy danh sách events sắp tới
export const getUpcomingEvents = () => {
  return mockEvents.filter(event => event.status === 'UPCOMING');
};

export default mockEvents;

