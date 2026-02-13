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

  // === LOYALTY (NMN Cinema Membership Program) ===
  POINTS_PER_VND: 1000,           // 1,000 VND = 1 điểm
  VIP_THRESHOLD: 3500,            // 3,500 điểm để lên NMN VIP
  DIAMOND_THRESHOLD: 8000,        // 8,000 điểm để lên NMN Diamond
  FIRST_TRANSACTION_BONUS: 100,   // Tặng 100 điểm cho giao dịch đầu tiên
  MAX_DAILY_POINTS: 50,           // Giới hạn tối đa 50 điểm/ngày (chống lạm dụng)
  MIN_COIN_REDEEM: 450,           // Tối thiểu 450 điểm để đổi thưởng (1 nước Aquafina)
  MIN_POINTS_PER_ORDER: 1000,     // Tối thiểu 1,000 điểm để dùng Cinema Coin thanh toán
  POINT_VALUE_VND: 1,             // 1 điểm = 1 VND giảm giá

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
