export const SEAT_PRICES = {
  STANDARD: 75000,
  VIP: 100000,
  COUPLE: 180000
};

// Màu sắc ghế
export const SEAT_COLORS = {
  STANDARD: {
    available: '#00CED1',    // Cyan
    sold: '#9CA3AF',         // Gray
    selected: '#FFD700'      // Yellow/Gold
  },
  VIP: {
    available: '#DC2626',    // Red
    sold: '#9CA3AF',
    selected: '#FFD700'
  },
  COUPLE: {
    available: '#9333EA',    // Purple
    sold: '#9CA3AF',
    selected: '#FFD700'
  }
};

// Tạo dữ liệu ghế cho phòng chiếu
// Layout: 9 hàng (A-I), mỗi hàng 10 ghế (trừ hàng cuối là ghế đôi)
export const mockSeats = [
  // Hàng A - 10 ghế thường
  { id: 'A10', row: 'A', number: 10, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'A09', row: 'A', number: 9, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'A08', row: 'A', number: 8, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'A07', row: 'A', number: 7, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'A06', row: 'A', number: 6, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'A05', row: 'A', number: 5, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'A04', row: 'A', number: 4, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'A03', row: 'A', number: 3, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'A02', row: 'A', number: 2, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'A01', row: 'A', number: 1, type: 'STANDARD', status: 'available', price: 75000 },

  // Hàng B - 10 ghế thường
  { id: 'B10', row: 'B', number: 10, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'B09', row: 'B', number: 9, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'B08', row: 'B', number: 8, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'B07', row: 'B', number: 7, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'B06', row: 'B', number: 6, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'B05', row: 'B', number: 5, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'B04', row: 'B', number: 4, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'B03', row: 'B', number: 3, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'B02', row: 'B', number: 2, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'B01', row: 'B', number: 1, type: 'STANDARD', status: 'available', price: 75000 },

  // Hàng C - 10 ghế thường
  { id: 'C10', row: 'C', number: 10, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'C09', row: 'C', number: 9, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'C08', row: 'C', number: 8, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'C07', row: 'C', number: 7, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'C06', row: 'C', number: 6, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'C05', row: 'C', number: 5, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'C04', row: 'C', number: 4, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'C03', row: 'C', number: 3, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'C02', row: 'C', number: 2, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'C01', row: 'C', number: 1, type: 'STANDARD', status: 'available', price: 75000 },

  // Hàng D - 10 ghế thường
  { id: 'D10', row: 'D', number: 10, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'D09', row: 'D', number: 9, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'D08', row: 'D', number: 8, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'D07', row: 'D', number: 7, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'D06', row: 'D', number: 6, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'D05', row: 'D', number: 5, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'D04', row: 'D', number: 4, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'D03', row: 'D', number: 3, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'D02', row: 'D', number: 2, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'D01', row: 'D', number: 1, type: 'STANDARD', status: 'available', price: 75000 },

  // Hàng E - 10 ghế VIP
  { id: 'E10', row: 'E', number: 10, type: 'VIP', status: 'available', price: 100000 },
  { id: 'E09', row: 'E', number: 9, type: 'VIP', status: 'available', price: 100000 },
  { id: 'E08', row: 'E', number: 8, type: 'VIP', status: 'sold', price: 100000 },
  { id: 'E07', row: 'E', number: 7, type: 'VIP', status: 'sold', price: 100000 },
  { id: 'E06', row: 'E', number: 6, type: 'VIP', status: 'available', price: 100000 },
  { id: 'E05', row: 'E', number: 5, type: 'VIP', status: 'available', price: 100000 },
  { id: 'E04', row: 'E', number: 4, type: 'VIP', status: 'available', price: 100000 },
  { id: 'E03', row: 'E', number: 3, type: 'VIP', status: 'available', price: 100000 },
  { id: 'E02', row: 'E', number: 2, type: 'VIP', status: 'available', price: 100000 },
  { id: 'E01', row: 'E', number: 1, type: 'VIP', status: 'available', price: 100000 },

  // Hàng F - 10 ghế VIP
  { id: 'F10', row: 'F', number: 10, type: 'VIP', status: 'available', price: 100000 },
  { id: 'F09', row: 'F', number: 9, type: 'VIP', status: 'available', price: 100000 },
  { id: 'F08', row: 'F', number: 8, type: 'VIP', status: 'available', price: 100000 },
  { id: 'F07', row: 'F', number: 7, type: 'VIP', status: 'available', price: 100000 },
  { id: 'F06', row: 'F', number: 6, type: 'VIP', status: 'sold', price: 100000 },
  { id: 'F05', row: 'F', number: 5, type: 'VIP', status: 'sold', price: 100000 },
  { id: 'F04', row: 'F', number: 4, type: 'VIP', status: 'available', price: 100000 },
  { id: 'F03', row: 'F', number: 3, type: 'VIP', status: 'available', price: 100000 },
  { id: 'F02', row: 'F', number: 2, type: 'VIP', status: 'available', price: 100000 },
  { id: 'F01', row: 'F', number: 1, type: 'VIP', status: 'available', price: 100000 },

  // Hàng G - 10 ghế thường
  { id: 'G10', row: 'G', number: 10, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'G09', row: 'G', number: 9, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'G08', row: 'G', number: 8, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'G07', row: 'G', number: 7, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'G06', row: 'G', number: 6, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'G05', row: 'G', number: 5, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'G04', row: 'G', number: 4, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'G03', row: 'G', number: 3, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'G02', row: 'G', number: 2, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'G01', row: 'G', number: 1, type: 'STANDARD', status: 'available', price: 75000 },

  // Hàng H - 10 ghế thường
  { id: 'H10', row: 'H', number: 10, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'H09', row: 'H', number: 9, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'H08', row: 'H', number: 8, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'H07', row: 'H', number: 7, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'H06', row: 'H', number: 6, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'H05', row: 'H', number: 5, type: 'STANDARD', status: 'sold', price: 75000 },
  { id: 'H04', row: 'H', number: 4, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'H03', row: 'H', number: 3, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'H02', row: 'H', number: 2, type: 'STANDARD', status: 'available', price: 75000 },
  { id: 'H01', row: 'H', number: 1, type: 'STANDARD', status: 'available', price: 75000 },

  // Hàng I - 5 ghế đôi (10 chỗ ngồi)
  { id: 'I05', row: 'I', number: 5, type: 'COUPLE', status: 'available', price: 180000 },
  { id: 'I04', row: 'I', number: 4, type: 'COUPLE', status: 'available', price: 180000 },
  { id: 'I03', row: 'I', number: 3, type: 'COUPLE', status: 'sold', price: 180000 },
  { id: 'I02', row: 'I', number: 2, type: 'COUPLE', status: 'available', price: 180000 },
  { id: 'I01', row: 'I', number: 1, type: 'COUPLE', status: 'available', price: 180000 }
];

// Nhóm ghế theo hàng cho dễ render
export const getSeatsByRow = () => {
  const rows = {};
  mockSeats.forEach(seat => {
    if (!rows[seat.row]) {
      rows[seat.row] = [];
    }
    rows[seat.row].push(seat);
  });
  return rows;
};

// Thông tin suất chiếu mẫu
export const mockShowtime = {
  _id: 'showtime001',
  movieId: 'movie001',
  movieTitle: 'Spongebob: Lời Nguyền Hải Tặc 2',
  posterUrl: 'https://cdn.galaxycine.vn/media/2025/11/24/spongebob_1763956577365.jpg',
  cinemaName: 'NMN Cinema Hà Nội',
  roomName: 'Phòng 01',
  date: '29/12/2024',
  time: '20:00',
  format: '3D Phụ đề',
  ageRating: 'T13',
  price: {
    standard: 75000,
    vip: 100000,
    couple: 180000
  }
};

export default mockSeats;
