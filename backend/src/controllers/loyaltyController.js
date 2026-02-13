const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const {
  POINTS_PER_VND,
  VIP_THRESHOLD,
  DIAMOND_THRESHOLD,
  FIRST_TRANSACTION_BONUS
} = require('../config/constants');

/**
 * Lấy thông tin điểm và hạng thành viên NMN Cinema
 */
exports.getMyLoyalty = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('points rank name email');

  // Ngưỡng hạng thành viên NMN Cinema
  const rankThresholds = {
    MEMBER: { min: 0, max: VIP_THRESHOLD - 1, next: 'VIP', pointsToNext: VIP_THRESHOLD },
    VIP: { min: VIP_THRESHOLD, max: DIAMOND_THRESHOLD - 1, next: 'DIAMOND', pointsToNext: DIAMOND_THRESHOLD },
    DIAMOND: { min: DIAMOND_THRESHOLD, max: Infinity, next: null, pointsToNext: null }
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
    points: Math.floor(order.totalAmount / POINTS_PER_VND),
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
 * Helper: Quyền lợi thành viên NMN Cinema
 */
function getRankBenefits(rank) {
  const benefits = {
    MEMBER: [
      'Tích 1 điểm cho mỗi 1,000 VND',
      'Cộng thêm 3% bắp nước + 5% vé xem phim',
      'Tặng 100 điểm khi hoàn tất giao dịch đầu tiên',
      'Quà sinh nhật: 1 combo (1 nước ngọt + 1 bắp ngọt)'
    ],
    VIP: [
      'Tích 1 điểm cho mỗi 1,000 VND',
      'Cộng thêm 3% bắp nước + 7% vé xem phim',
      'Quà lên hạng: 1 combo + 3 vé xem phim 2D',
      'Quà sinh nhật: 1 combo (2 nước ngọt + 1 bắp ngọt) + 1 vé 2D'
    ],
    DIAMOND: [
      'Tích 1 điểm cho mỗi 1,000 VND',
      'Cộng thêm 5% bắp nước + 10% vé xem phim',
      'Quà lên hạng: 2 combo + 5 vé xem phim 2D',
      'Quà sinh nhật: 1 combo (2 nước ngọt + 1 bắp ngọt) + 2 vé 2D'
    ]
  };
  return benefits[rank] || benefits.MEMBER;
}
