/**
 * Mock data cho Admin Dashboard
 * Sẽ được thay thế bằng API thật khi backend có endpoint /admin/dashboard/stats
 */

// ===== 1. THẺ THỐNG KÊ =====
export const STAT_CARDS = [
  {
    id: 'revenue',
    label: 'Doanh thu tháng',
    value: 520500000,
    displayValue: '520.5 tr',
    unit: 'VNĐ',
    change: 12.5,
    icon: 'AttachMoney',
    color: '#4caf50'
  },
  {
    id: 'tickets',
    label: 'Vé bán hôm nay',
    value: 156,
    displayValue: '156',
    unit: 'vé',
    change: 8.2,
    icon: 'ConfirmationNumber',
    color: '#ff9800'
  },
  {
    id: 'movies',
    label: 'Phim đang chiếu',
    value: 12,
    displayValue: '12',
    unit: 'phim',
    change: 3,
    icon: 'MovieFilter',
    color: '#2196f3'
  },
  {
    id: 'users',
    label: 'Người dùng mới',
    value: 45,
    displayValue: '45',
    unit: 'người',
    change: 15.3,
    icon: 'PersonAdd',
    color: '#9c27b0'
  }
];

// ===== 2. DOANH THU 7 NGÀY (BarChart) =====
export const REVENUE_7_DAYS = [
  { day: '22/02 (T2)', tickets: 28, combos: 14 },
  { day: '23/02 (T3)', tickets: 22, combos: 13 },
  { day: '24/02 (T4)', tickets: 32, combos: 16 },
  { day: '25/02 (T5)', tickets: 25, combos: 13 },
  { day: '26/02 (T6)', tickets: 42, combos: 23 },
  { day: '27/02 (T7)', tickets: 58, combos: 31 },
  { day: '28/02 (CN)', tickets: 62, combos: 33 }
];

// ===== 3. THỂ LOẠI PHIM (PieChart) =====
// value = số vé bán theo thể loại trong tháng
export const GENRE_DISTRIBUTION = [
  { id: 0, value: 350, label: 'Hành động', color: '#1B4F93' },
  { id: 1, value: 200, label: 'Kinh dị', color: '#e74c3c' },
  { id: 2, value: 180, label: 'Tình cảm', color: '#e91e63' },
  { id: 3, value: 150, label: 'Hoạt hình', color: '#ff9800' },
  { id: 4, value: 120, label: 'Khoa học VT', color: '#00bcd4' }
];

// ===== 4. XU HƯỚNG 30 NGÀY (LineChart) =====
// value = doanh thu ngày (triệu VNĐ)
export const REVENUE_30_DAYS = [
  { day: '30/01', value: 32 },
  { day: '31/01', value: 28 },
  { day: '01/02', value: 35 },
  { day: '02/02', value: 42 },
  { day: '03/02', value: 38 },
  { day: '04/02', value: 55 },
  { day: '05/02', value: 62 },
  { day: '06/02', value: 45 },
  { day: '07/02', value: 40 },
  { day: '08/02', value: 48 },
  { day: '09/02', value: 52 },
  { day: '10/02', value: 58 },
  { day: '11/02', value: 65 },
  { day: '12/02', value: 70 },
  { day: '13/02', value: 55 },
  { day: '14/02', value: 48 },
  { day: '15/02', value: 42 },
  { day: '16/02', value: 50 },
  { day: '17/02', value: 58 },
  { day: '18/02', value: 72 },
  { day: '19/02', value: 85 },
  { day: '20/02', value: 68 },
  { day: '21/02', value: 60 },
  { day: '22/02', value: 55 },
  { day: '23/02', value: 62 },
  { day: '24/02', value: 75 },
  { day: '25/02', value: 88 },
  { day: '26/02', value: 92 },
  { day: '27/02', value: 78 },
  { day: '28/02', value: 82 }
];

// ===== 5. TOP 5 PHIM BÁN CHẠY =====
export const TOP_MOVIES = [
  { rank: 1, title: 'Avengers: Doomsday', tickets: 120, percentage: 100, ageRating: 'T13', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
  { rank: 2, title: 'Dune: Phần Hai', tickets: 98, percentage: 82, ageRating: 'T16', poster: 'https://image.tmdb.org/t/p/w92/8b8R8l88Qje9dn9OE8PY05Nez7S.jpg' },
  { rank: 3, title: 'Oppenheimer', tickets: 85, percentage: 71, ageRating: 'T18', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
  { rank: 4, title: 'Wonka', tickets: 72, percentage: 60, ageRating: 'P', poster: 'https://image.tmdb.org/t/p/w92/qhb1qOilapbapxWQn9jtRCMwXJF.jpg' },
  { rank: 5, title: 'Inside Out 2', tickets: 58, percentage: 48, ageRating: 'P', poster: 'https://image.tmdb.org/t/p/w92/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg' }
];

// ===== 6. ĐƠN HÀNG GẦN ĐÂY =====
// Các trường từ Order model: orderNo, userId, showtimeId, seats, combos, totalAmount, subTotal, discount, voucherCode, status, createdAt
export const RECENT_ORDERS = [
  {
    orderNo: 'ORD-20260228-001', customer: 'Nguyễn Văn A', movie: 'Avengers: Doomsday', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    seats: 2, combos: 1, subTotal: 330000, discount: 30000, voucherCode: null,
    totalAmount: 300000, status: 'PAID', createdAt: '28/02 14:30'
  },
  {
    orderNo: 'ORD-20260228-002', customer: 'Trần Thị B', movie: 'Dune: Phần Hai', poster: 'https://image.tmdb.org/t/p/w92/8b8R8l88Qje9dn9OE8PY05Nez7S.jpg',
    seats: 3, combos: 2, subTotal: 520000, discount: 70000, voucherCode: 'VIP20',
    totalAmount: 450000, status: 'PAID', createdAt: '28/02 13:45'
  },
  {
    orderNo: 'ORD-20260228-003', customer: 'Lê Minh C', movie: 'Wonka', poster: 'https://image.tmdb.org/t/p/w92/qhb1qOilapbapxWQn9jtRCMwXJF.jpg',
    seats: 1, combos: 0, subTotal: 150000, discount: 0, voucherCode: null,
    totalAmount: 150000, status: 'PENDING', createdAt: '28/02 13:20'
  },
  {
    orderNo: 'ORD-20260228-004', customer: 'Phạm Hồng D', movie: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    seats: 4, combos: 2, subTotal: 720000, discount: 120000, voucherCode: 'HAPPY50',
    totalAmount: 600000, status: 'PAID', createdAt: '28/02 12:50'
  },
  {
    orderNo: 'ORD-20260228-005', customer: 'Hoàng Thị E', movie: 'Inside Out 2', poster: 'https://image.tmdb.org/t/p/w92/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    seats: 2, combos: 1, subTotal: 250000, discount: 50000, voucherCode: 'STUDENT',
    totalAmount: 200000, status: 'CANCELLED', createdAt: '28/02 12:10'
  },
  {
    orderNo: 'ORD-20260228-006', customer: 'Đỗ Quang F', movie: 'Avengers: Doomsday', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    seats: 5, combos: 3, subTotal: 950000, discount: 0, voucherCode: null,
    totalAmount: 950000, status: 'PAID', createdAt: '28/02 11:30'
  },
  {
    orderNo: 'ORD-20260228-007', customer: 'Bùi Mai G', movie: 'Wonka', poster: 'https://image.tmdb.org/t/p/w92/qhb1qOilapbapxWQn9jtRCMwXJF.jpg',
    seats: 2, combos: 1, subTotal: 300000, discount: 30000, voucherCode: 'MEMBER10',
    totalAmount: 270000, status: 'PROCESSING', createdAt: '28/02 11:00'
  },
  {
    orderNo: 'ORD-20260228-008', customer: 'Ngô Thanh H', movie: 'Dune: Phần Hai', poster: 'https://image.tmdb.org/t/p/w92/8b8R8l88Qje9dn9OE8PY05Nez7S.jpg',
    seats: 1, combos: 0, subTotal: 150000, discount: 0, voucherCode: null,
    totalAmount: 150000, status: 'FAILED', createdAt: '28/02 10:20'
  },
  {
    orderNo: 'ORD-20260228-009', customer: 'Vũ Hải I', movie: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    seats: 3, combos: 1, subTotal: 510000, discount: 50000, voucherCode: 'VIP20',
    totalAmount: 460000, status: 'PAID', createdAt: '28/02 09:45'
  },
  {
    orderNo: 'ORD-20260228-010', customer: 'Trịnh Lan K', movie: 'Inside Out 2', poster: 'https://image.tmdb.org/t/p/w92/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    seats: 2, combos: 2, subTotal: 380000, discount: 0, voucherCode: null,
    totalAmount: 380000, status: 'EXPIRED', createdAt: '28/02 09:10'
  },
  {
    orderNo: 'ORD-20260227-011', customer: 'Lý Minh L', movie: 'Avengers: Doomsday', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    seats: 6, combos: 3, subTotal: 1200000, discount: 200000, voucherCode: 'FAMILY',
    totalAmount: 1000000, status: 'PAID', createdAt: '27/02 21:30'
  },
  {
    orderNo: 'ORD-20260227-012', customer: 'Phan Thu M', movie: 'Wonka', poster: 'https://image.tmdb.org/t/p/w92/qhb1qOilapbapxWQn9jtRCMwXJF.jpg',
    seats: 2, combos: 1, subTotal: 280000, discount: 28000, voucherCode: 'MEMBER10',
    totalAmount: 252000, status: 'PAID', createdAt: '27/02 20:15'
  }
];

// ===== 7. SUẤT CHIẼU HÔM NAY =====
// Các trường từ Showtime model: movieId, roomId, startAt, endAt, basePrice, format, subtitle, status
export const TODAY_SHOWTIMES = [
  // SÁNG
  { time: '09:00', endTime: '11:05', movie: 'Avengers: Doomsday', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', ageRating: 'T13', room: 'P01', format: '2D', subtitle: 'Phụ đề', basePrice: 90000, seatStatus: '45/120', status: 'OPEN' },
  { time: '09:30', endTime: '11:15', movie: 'Wonka', poster: 'https://image.tmdb.org/t/p/w92/qhb1qOilapbapxWQn9jtRCMwXJF.jpg', ageRating: 'P', room: 'P02', format: '2D', subtitle: 'Lồng tiếng', basePrice: 85000, seatStatus: '38/100', status: 'OPEN' },
  { time: '10:00', endTime: '12:30', movie: 'Dune: Phần Hai', poster: 'https://image.tmdb.org/t/p/w92/8b8R8l88Qje9dn9OE8PY05Nez7S.jpg', ageRating: 'T16', room: 'P03', format: 'IMAX', subtitle: 'Phụ đề', basePrice: 150000, seatStatus: '82/150', status: 'OPEN' },
  { time: '10:30', endTime: '12:15', movie: 'Inside Out 2', poster: 'https://image.tmdb.org/t/p/w92/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', ageRating: 'P', room: 'P04', format: '2D', subtitle: 'Lồng tiếng', basePrice: 85000, seatStatus: '55/130', status: 'OPEN' },
  // TRƯA
  { time: '12:00', endTime: '14:30', movie: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', ageRating: 'T18', room: 'P05', format: 'VIP', subtitle: 'Phụ đề', basePrice: 200000, seatStatus: '30/60', status: 'OPEN' },
  { time: '12:30', endTime: '14:35', movie: 'Avengers: Doomsday', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', ageRating: 'T13', room: 'P02', format: '3D', subtitle: 'Phụ đề', basePrice: 120000, seatStatus: '72/100', status: 'OPEN' },
  { time: '13:00', endTime: '14:45', movie: 'Wonka', poster: 'https://image.tmdb.org/t/p/w92/qhb1qOilapbapxWQn9jtRCMwXJF.jpg', ageRating: 'P', room: 'P01', format: '2D', subtitle: 'Lồng tiếng', basePrice: 85000, seatStatus: '30/120', status: 'OPEN' },
  { time: '13:30', endTime: '16:00', movie: 'Dune: Phần Hai', poster: 'https://image.tmdb.org/t/p/w92/8b8R8l88Qje9dn9OE8PY05Nez7S.jpg', ageRating: 'T16', room: 'P04', format: '2D', subtitle: 'Phụ đề', basePrice: 90000, seatStatus: '65/130', status: 'OPEN' },
  // CHIỀU
  { time: '14:30', endTime: '17:00', movie: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', ageRating: 'T18', room: 'P03', format: 'IMAX', subtitle: 'Phụ đề', basePrice: 180000, seatStatus: '95/150', status: 'OPEN' },
  { time: '15:00', endTime: '16:45', movie: 'Inside Out 2', poster: 'https://image.tmdb.org/t/p/w92/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', ageRating: 'P', room: 'P01', format: '2D', subtitle: 'Lồng tiếng', basePrice: 85000, seatStatus: '40/120', status: 'OPEN' },
  { time: '16:00', endTime: '18:05', movie: 'Avengers: Doomsday', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', ageRating: 'T13', room: 'P05', format: 'VIP', subtitle: 'Phụ đề', basePrice: 250000, seatStatus: '48/60', status: 'OPEN' },
  { time: '16:30', endTime: '18:15', movie: 'Wonka', poster: 'https://image.tmdb.org/t/p/w92/qhb1qOilapbapxWQn9jtRCMwXJF.jpg', ageRating: 'P', room: 'P02', format: '2D', subtitle: 'Lồng tiếng', basePrice: 85000, seatStatus: '60/100', status: 'CLOSED' },
  // TỐI
  { time: '18:00', endTime: '20:30', movie: 'Dune: Phần Hai', poster: 'https://image.tmdb.org/t/p/w92/8b8R8l88Qje9dn9OE8PY05Nez7S.jpg', ageRating: 'T16', room: 'P01', format: '2D', subtitle: 'Phụ đề', basePrice: 90000, seatStatus: '90/120', status: 'OPEN' },
  { time: '18:30', endTime: '21:00', movie: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', ageRating: 'T18', room: 'P04', format: '3D', subtitle: 'Phụ đề', basePrice: 130000, seatStatus: '88/130', status: 'OPEN' },
  { time: '19:00', endTime: '21:05', movie: 'Avengers: Doomsday', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', ageRating: 'T13', room: 'P03', format: 'IMAX', subtitle: 'Phụ đề', basePrice: 180000, seatStatus: '140/150', status: 'OPEN' },
  { time: '19:30', endTime: '21:15', movie: 'Inside Out 2', poster: 'https://image.tmdb.org/t/p/w92/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', ageRating: 'P', room: 'P02', format: '2D', subtitle: 'Lồng tiếng', basePrice: 85000, seatStatus: '75/100', status: 'OPEN' },
  { time: '20:00', endTime: '21:45', movie: 'Wonka', poster: 'https://image.tmdb.org/t/p/w92/qhb1qOilapbapxWQn9jtRCMwXJF.jpg', ageRating: 'P', room: 'P05', format: 'VIP', subtitle: 'Phụ đề', basePrice: 200000, seatStatus: '52/60', status: 'OPEN' },
  // KHUYA
  { time: '21:00', endTime: '23:30', movie: 'Dune: Phần Hai', poster: 'https://image.tmdb.org/t/p/w92/8b8R8l88Qje9dn9OE8PY05Nez7S.jpg', ageRating: 'T16', room: 'P01', format: '2D', subtitle: 'Phụ đề', basePrice: 80000, seatStatus: '78/120', status: 'OPEN' },
  { time: '21:30', endTime: '00:00', movie: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', ageRating: 'T18', room: 'P02', format: '3D', subtitle: 'Phụ đề', basePrice: 110000, seatStatus: '55/100', status: 'CANCELED' },
  { time: '22:00', endTime: '00:05', movie: 'Avengers: Doomsday', poster: 'https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', ageRating: 'T13', room: 'P03', format: 'IMAX', subtitle: 'Phụ đề', basePrice: 150000, seatStatus: '110/150', status: 'OPEN' }
];

// ===== 8. TỶ LỆ LẤP ĐẦY GHẾ =====
export const SEAT_OCCUPANCY = {
  totalSeats: 860,
  bookedSeats: 585,
  percentage: 68,
  rooms: [
    { name: 'P01 (120 ghế)', booked: 98, total: 120 },
    { name: 'P02 (100 ghế)', booked: 75, total: 100 },
    { name: 'P03 IMAX (150 ghế)', booked: 140, total: 150 },
    { name: 'P04 (130 ghế)', booked: 95, total: 130 },
    { name: 'P05 VIP (60 ghế)', booked: 52, total: 60 },
    { name: 'P06 (100 ghế)', booked: 45, total: 100 },
    { name: 'P07 (100 ghế)', booked: 40, total: 100 },
    { name: 'P08 (100 ghế)', booked: 40, total: 100 }
  ],
  yesterdayPercentage: 72
};

// ===== 9. TOP COMBO BÁN CHẠY =====
// price = giá 1 combo (nghìn VNĐ), revenue = số lượng bán × giá
export const TOP_COMBOS = [
  { name: 'Combo Couple', sold: 85, price: 129, revenue: 10965, color: '#1B4F93' },
  { name: 'Combo Bắp Nước', sold: 72, price: 89, revenue: 6408, color: '#ff9800' },
  { name: 'Combo Gia Đình', sold: 45, price: 199, revenue: 8955, color: '#4caf50' },
  { name: 'Bắp Rang Lớn', sold: 38, price: 59, revenue: 2242, color: '#e91e63' },
  { name: 'Nước Ngọt Lớn', sold: 30, price: 39, revenue: 1170, color: '#00bcd4' }
];

// ===== 10. PHÂN BỔ THÀNH VIÊN =====
export const MEMBERSHIP_DISTRIBUTION = [
  { id: 0, value: 1250, label: 'Member', color: '#90caf9' },
  { id: 1, value: 320, label: 'VIP', color: '#ff9800' },
  { id: 2, value: 85, label: 'Diamond', color: '#9c27b0' }
];

// ===== 11. KHUYẾN MÃI ĐANG HOẠT ĐỘNG =====
export const ACTIVE_PROMOTIONS = {
  totalPromotions: 5,
  totalVouchers: 12,
  voucherUsageRate: 62,
  promotionList: [
    { name: 'Giảm 20% VIP', type: 'Giảm giá', endDate: '15/03', used: 45, total: 100 },
    { name: 'Mua 2 tặng 1', type: 'Combo', endDate: '10/03', used: 78, total: 200 },
    { name: 'Sinh nhật -50%', type: 'Đặc biệt', endDate: '31/03', used: 12, total: 50 },
    { name: 'Happy Hour T2-T4', type: 'Giờ vàng', endDate: '28/03', used: 156, total: 300 },
    { name: 'Combo Student', type: 'Combo', endDate: '20/03', used: 89, total: 150 }
  ]
};
