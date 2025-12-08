const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

/**
 * Lấy thông tin điểm và hạng thành viên
 */
exports.getMyLoyalty = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('points rank name email');

  // Tính điểm cần để lên hạng tiếp theo
  const rankThresholds = {
    MEMBER: { min: 0, max: 999, next: 'VIP', pointsToNext: 1000 },
    VIP: { min: 1000, max: 4999, next: 'VVIP', pointsToNext: 5000 },
    VVIP: { min: 5000, max: Infinity, next: null, pointsToNext: null }
  };

  const currentRankInfo = rankThresholds[user.rank] || rankThresholds.MEMBER;
  const pointsToNextRank = currentRankInfo.pointsToNext
    ? Math.max(0, currentRankInfo.pointsToNext - user.points)
    : null;

  res.status(200).json({
    status: 'success',
    data: {
      name: user.name,
      email: user.email,
      points: user.points,
      rank: user.rank,
      nextRank: currentRankInfo.next,
      pointsToNextRank,
      benefits: getRankBenefits(user.rank)
    }
  });
});

/**
 * Lấy lịch sử tích/tiêu điểm
 */
exports.getPointsHistory = catchAsync(async (req, res, next) => {
  // TODO: Cần tạo PointsTransaction model nếu muốn lưu chi tiết
  // Hiện tại trả về từ Orders đã PAID
  const Order = require('../models/Order');

  const orders = await Order.find({
    userId: req.user.id,
    status: 'PAID'
  })
    .select('orderNo totalAmount createdAt')
    .sort({ createdAt: -1 })
    .limit(20);

  const history = orders.map(order => ({
    type: 'EARN',
    points: Math.floor(order.totalAmount / 10000), // 10,000 VND = 1 điểm
    description: `Đơn hàng ${order.orderNo}`,
    date: order.createdAt
  }));

  res.status(200).json({
    status: 'success',
    results: history.length,
    data: { history }
  });
});

/**
 * Helper: Lấy quyền lợi theo hạng
 */
function getRankBenefits(rank) {
  const benefits = {
    MEMBER: [
      'Tích 1 điểm cho mỗi 10,000 VND',
      'Nhận thông báo khuyến mãi'
    ],
    VIP: [
      'Tích 1.5 điểm cho mỗi 10,000 VND',
      'Giảm 5% giá vé thứ 2 trở đi',
      'Ưu tiên chọn ghế VIP',
      'Quà sinh nhật đặc biệt'
    ],
    VVIP: [
      'Tích 2 điểm cho mỗi 10,000 VND',
      'Giảm 10% tất cả đơn hàng',
      'Miễn phí nâng cấp ghế VIP',
      'Vé xem phim miễn phí mỗi tháng',
      'Combo bắp nước miễn phí',
      'Ưu tiên mua vé suất chiếu sớm'
    ]
  };
  return benefits[rank] || benefits.MEMBER;
}
