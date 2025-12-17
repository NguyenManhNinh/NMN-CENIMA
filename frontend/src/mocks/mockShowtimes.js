// Mock Showtimes Data - Dữ liệu suất chiếu mẫu
import { mockMovies } from './mockMovies';

// Tạo ngày trong 7 ngày tới
const getNextDays = (count) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
};

const dates = getNextDays(7);

export const mockShowtimes = [
  // Avengers - Cinema 01
  {
    _id: 'st1',
    movieId: 'movie1',
    cinemaId: 'cinema1',
    roomId: 'room1',
    roomName: 'Cinema 01',
    startAt: `${dates[0]}T10:00:00`,
    endAt: `${dates[0]}T13:01:00`,
    format: '2D',
    language: 'Phụ đề',
    basePrice: 90000,
    status: 'OPEN'
  },
  {
    _id: 'st2',
    movieId: 'movie1',
    cinemaId: 'cinema1',
    roomId: 'room1',
    roomName: 'Cinema 01',
    startAt: `${dates[0]}T14:30:00`,
    endAt: `${dates[0]}T17:31:00`,
    format: '2D',
    language: 'Phụ đề',
    basePrice: 90000,
    status: 'OPEN'
  },
  {
    _id: 'st3',
    movieId: 'movie1',
    cinemaId: 'cinema1',
    roomId: 'room2',
    roomName: 'Cinema 02',
    startAt: `${dates[0]}T19:00:00`,
    endAt: `${dates[0]}T22:01:00`,
    format: '3D',
    language: 'Lồng tiếng',
    basePrice: 120000,
    status: 'OPEN'
  },
  {
    _id: 'st4',
    movieId: 'movie1',
    cinemaId: 'cinema1',
    roomId: 'room3',
    roomName: 'Cinema VIP',
    startAt: `${dates[0]}T21:30:00`,
    endAt: `${dates[1]}T00:31:00`,
    format: 'IMAX',
    language: 'Phụ đề',
    basePrice: 180000,
    status: 'OPEN'
  },

  // Đất Rừng Phương Nam - Cinema 01 & 02
  {
    _id: 'st5',
    movieId: 'movie2',
    cinemaId: 'cinema1',
    roomId: 'room1',
    roomName: 'Cinema 01',
    startAt: `${dates[0]}T09:00:00`,
    endAt: `${dates[0]}T11:18:00`,
    format: '2D',
    language: 'Việt Nam',
    basePrice: 75000,
    status: 'OPEN'
  },
  {
    _id: 'st6',
    movieId: 'movie2',
    cinemaId: 'cinema1',
    roomId: 'room2',
    roomName: 'Cinema 02',
    startAt: `${dates[0]}T16:00:00`,
    endAt: `${dates[0]}T18:18:00`,
    format: '2D',
    language: 'Việt Nam',
    basePrice: 90000,
    status: 'OPEN'
  },

  // Mai - Cinema 01
  {
    _id: 'st7',
    movieId: 'movie6',
    cinemaId: 'cinema1',
    roomId: 'room1',
    roomName: 'Cinema 01',
    startAt: `${dates[1]}T10:30:00`,
    endAt: `${dates[1]}T12:41:00`,
    format: '2D',
    language: 'Việt Nam',
    basePrice: 90000,
    status: 'OPEN'
  },
  {
    _id: 'st8',
    movieId: 'movie6',
    cinemaId: 'cinema1',
    roomId: 'room1',
    roomName: 'Cinema 01',
    startAt: `${dates[1]}T14:00:00`,
    endAt: `${dates[1]}T16:11:00`,
    format: '2D',
    language: 'Việt Nam',
    basePrice: 90000,
    status: 'OPEN'
  }
];

// Lấy suất chiếu theo phim
export const getShowtimesByMovie = (movieId) => {
  return mockShowtimes.filter(st => st.movieId === movieId);
};

// Lấy suất chiếu theo ngày
export const getShowtimesByDate = (date) => {
  return mockShowtimes.filter(st => st.startAt.startsWith(date));
};

// Nhóm suất chiếu theo định dạng
export const groupShowtimesByFormat = (showtimes) => {
  return showtimes.reduce((acc, st) => {
    if (!acc[st.format]) acc[st.format] = [];
    acc[st.format].push(st);
    return acc;
  }, {});
};

// Export danh sách ngày có lịch chiếu
export const availableDates = dates.map(date => ({
  date,
  dayOfWeek: new Date(date).toLocaleDateString('vi-VN', { weekday: 'short' }),
  dayNumber: new Date(date).getDate(),
  month: new Date(date).getMonth() + 1
}));
