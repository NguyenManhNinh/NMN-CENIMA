// Mock Cinemas & Rooms Data - Dữ liệu rạp và phòng chiếu mẫu
export const mockCinemas = [
  {
    _id: 'cinema1',
    name: 'NMN Cinema Hà Nội',
    address: '123 Cầu Giấy, Hà Nội',
    phone: '0849045706',
    description: 'Rạp chiếu phim hiện đại tại trung tâm Hà Nội',
    image: 'https://example.com/cinema1.jpg',
    status: 'ACTIVE'
  },
  {
    _id: 'cinema2',
    name: 'NMN Cinema Đà Nẵng',
    address: '456 Nguyễn Văn Linh, Đà Nẵng',
    phone: '0849045707',
    description: 'Rạp chiếu phim cao cấp tại Đà Nẵng',
    image: 'https://example.com/cinema2.jpg',
    status: 'ACTIVE'
  }
];

export const mockRooms = [
  {
    _id: 'room1',
    cinemaId: 'cinema1',
    name: 'Cinema 01',
    type: '2D',
    totalSeats: 54,
    status: 'ACTIVE',
    seatMap: generateSeatMap(6, 9) // 6 hàng x 9 cột
  },
  {
    _id: 'room2',
    cinemaId: 'cinema1',
    name: 'Cinema 02',
    type: '3D',
    totalSeats: 54,
    status: 'ACTIVE',
    seatMap: generateSeatMap(6, 9)
  },
  {
    _id: 'room3',
    cinemaId: 'cinema1',
    name: 'Cinema VIP',
    type: 'IMAX',
    totalSeats: 40,
    status: 'ACTIVE',
    seatMap: generateSeatMap(5, 8, true) // VIP room
  }
];

// Hàm tạo sơ đồ ghế
function generateSeatMap(rows, cols, isVip = false) {
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatMap = [];

  for (let i = 0; i < rows; i++) {
    const rowSeats = [];
    for (let j = 1; j <= cols; j++) {
      // 2 hàng cuối là VIP
      const isVipSeat = isVip || i >= rows - 2;
      // Ghế đôi ở hàng cuối (nếu là số chẵn)
      const isCouple = i === rows - 1 && j % 2 === 0;

      rowSeats.push({
        seatCode: `${rowLabels[i]}${j}`,
        row: rowLabels[i],
        number: j,
        type: isCouple ? 'couple' : (isVipSeat ? 'vip' : 'standard'),
        price: isCouple ? 180000 : (isVipSeat ? 120000 : 90000),
        status: 'available' // available, held, sold, maintenance
      });
    }
    seatMap.push({
      row: rowLabels[i],
      seats: rowSeats
    });
  }

  return seatMap;
}

// Export sơ đồ ghế mẫu cho demo
export const mockSeatMapDemo = {
  roomId: 'room1',
  roomName: 'Cinema 01',
  screenLabel: 'MÀN HÌNH',
  rows: [
    {
      row: 'A',
      seats: [
        { seatCode: 'A1', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'A2', type: 'standard', price: 90000, status: 'sold' },
        { seatCode: 'A3', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'A4', type: 'standard', price: 90000, status: 'held' },
        { seatCode: 'A5', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'A6', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'A7', type: 'standard', price: 90000, status: 'sold' },
        { seatCode: 'A8', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'A9', type: 'standard', price: 90000, status: 'available' }
      ]
    },
    {
      row: 'B',
      seats: [
        { seatCode: 'B1', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'B2', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'B3', type: 'standard', price: 90000, status: 'sold' },
        { seatCode: 'B4', type: 'standard', price: 90000, status: 'sold' },
        { seatCode: 'B5', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'B6', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'B7', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'B8', type: 'standard', price: 90000, status: 'held' },
        { seatCode: 'B9', type: 'standard', price: 90000, status: 'available' }
      ]
    },
    {
      row: 'C',
      seats: [
        { seatCode: 'C1', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'C2', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'C3', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'C4', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'C5', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'C6', type: 'standard', price: 90000, status: 'sold' },
        { seatCode: 'C7', type: 'standard', price: 90000, status: 'sold' },
        { seatCode: 'C8', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'C9', type: 'standard', price: 90000, status: 'available' }
      ]
    },
    {
      row: 'D',
      seats: [
        { seatCode: 'D1', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'D2', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'D3', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'D4', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'D5', type: 'standard', price: 90000, status: 'maintenance' },
        { seatCode: 'D6', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'D7', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'D8', type: 'standard', price: 90000, status: 'available' },
        { seatCode: 'D9', type: 'standard', price: 90000, status: 'available' }
      ]
    },
    {
      row: 'E',
      seats: [
        { seatCode: 'E1', type: 'vip', price: 120000, status: 'available' },
        { seatCode: 'E2', type: 'vip', price: 120000, status: 'available' },
        { seatCode: 'E3', type: 'vip', price: 120000, status: 'sold' },
        { seatCode: 'E4', type: 'vip', price: 120000, status: 'available' },
        { seatCode: 'E5', type: 'vip', price: 120000, status: 'available' },
        { seatCode: 'E6', type: 'vip', price: 120000, status: 'available' },
        { seatCode: 'E7', type: 'vip', price: 120000, status: 'sold' },
        { seatCode: 'E8', type: 'vip', price: 120000, status: 'sold' },
        { seatCode: 'E9', type: 'vip', price: 120000, status: 'available' }
      ]
    },
    {
      row: 'F',
      seats: [
        { seatCode: 'F1-2', type: 'couple', price: 180000, status: 'available' },
        { seatCode: 'F3-4', type: 'couple', price: 180000, status: 'sold' },
        { seatCode: 'F5-6', type: 'couple', price: 180000, status: 'available' },
        { seatCode: 'F7-8', type: 'couple', price: 180000, status: 'available' }
      ]
    }
  ],
  legend: [
    { type: 'available', label: 'Ghế trống', color: '#4CAF50' },
    { type: 'selected', label: 'Đang chọn', color: '#2196F3' },
    { type: 'held', label: 'Đang giữ', color: '#FF9800' },
    { type: 'sold', label: 'Đã bán', color: '#9E9E9E' },
    { type: 'vip', label: 'Ghế VIP', color: '#9C27B0' },
    { type: 'couple', label: 'Ghế đôi', color: '#E91E63' },
    { type: 'maintenance', label: 'Bảo trì', color: '#F44336' }
  ]
};
