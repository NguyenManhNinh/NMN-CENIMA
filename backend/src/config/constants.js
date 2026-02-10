/**
 * Hằng số cấu hình hệ thống
 * Tập trung các giá trị cố định để dễ quản lý và thay đổi
 */

module.exports = {
  // === PRICING ===
  VIP_SEAT_SURCHARGE: 5000,     // Phụ thu ghế VIP (VND) - giữ nhất quán với frontend
  COUPLE_SEAT_SURCHARGE: 10000, // Phụ thu ghế Couple (VND) - mỗi người

  // === SEAT HOLD ===
  SEAT_HOLD_DURATION_MINUTES: 15, // Thời gian giữ ghế (phút)

  // === ROOM ===
  DEFAULT_SEATS_PER_ROOM: 50, // Số ghế mặc định/phòng (dùng cho tính occupancy)

  // === LOYALTY ===
  POINTS_PER_VND: 1000, // Số VND để đổi 1 điểm (1,000 VND = 1 Point)
  VIP_THRESHOLD: 1000,   // Điểm tối thiểu lên VIP
  VVIP_THRESHOLD: 5000,  // Điểm tối thiểu lên VVIP

  // === OTP ===
  OTP_EXPIRY_MINUTES: 5, // Thời gian hết hạn OTP (phút)

  // === JWT ===
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY_DAYS: 7,

  // === RATE LIMIT ===
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW_MS: 60 * 60 * 1000, // 1 giờ

  // === PAGINATION ===
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};
