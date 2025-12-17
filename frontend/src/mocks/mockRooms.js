// Mock Rooms Data - Dữ liệu phòng chiếu và sơ đồ ghế
export const mockRooms = [
  {
    _id: 'room1',
    cinemaId: 'cinema1',
    name: 'Cinema 01',
    type: '2D',
    totalSeats: 54,
    status: 'ACTIVE',
    seatMap: generateSeatMap(6, 9) // 6 hàng x 9 ghế
  },
  {
    _id: 'room2',
    cinemaId: 'cinema1',
    name: 'Cinema 02',
    type: '3D',
    totalSeats: 72,
    status: 'ACTIVE',
    seatMap: generateSeatMap(8, 9)
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

// Helper: Tạo sơ đồ ghế
function generateSeatMap(rows, cols, isVip = false) {
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatMap = [];

  for (let i = 0; i < rows; i++) {
    const row = {
      row: rowLabels[i],
      seats: []
    };

    for (let j = 1; j <= cols; j++) {
      // Hàng cuối thường là VIP
      const seatType = (i === rows - 1 || isVip) ? 'vip' : 'standard';
      // Ghế đôi ở 2 cột cuối hàng cuối
      const isCoupleStr = (i === rows - 1 && j >= cols - 1) ? 'couple' : seatType;

      row.seats.push({
        number: j,
        code: `${rowLabels[i]}${j}`,
        type: i === rows - 1 && j >= cols - 1 ? 'couple' : seatType,
        price: seatType === 'vip' ? 90000 : 75000
      });
    }

    seatMap.push(row);
  }

  return seatMap;
}

// Mock trạng thái ghế cho 1 suất chiếu
export const mockSeatStatus = {
  showtimeId: 'showtime1',
  soldSeats: ['A1', 'A2', 'B5', 'C3', 'C4'], // Ghế đã bán
  holdingSeats: ['D7', 'D8'], // Ghế đang được giữ
  maintenanceSeats: ['F9'] // Ghế bảo trì
};

export default mockRooms;
