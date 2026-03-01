const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const Movie = require('../models/Movie');
const User = require('../models/User');
const Showtime = require('../models/Showtime');
const Room = require('../models/Room');
const Promotion = require('../models/Promotion');
const catchAsync = require('../utils/catchAsync');

// ========== EXISTING ENDPOINTS ==========

exports.getRevenueStats = catchAsync(async (req, res, next) => {
  // Thống kê doanh thu theo ngày trong 7 ngày gần nhất
  const stats = await Order.aggregate([
    {
      $match: {
        status: 'PAID',
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalRevenue: { $sum: "$totalAmount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

exports.getTopMovies = catchAsync(async (req, res, next) => {
  // Top 5 phim có doanh thu cao nhất
  const stats = await Order.aggregate([
    { $match: { status: 'PAID' } },
    {
      $lookup: {
        from: 'showtimes',
        localField: 'showtimeId',
        foreignField: '_id',
        as: 'showtime'
      }
    },
    { $unwind: '$showtime' },
    {
      $lookup: {
        from: 'movies',
        localField: 'showtime.movieId',
        foreignField: '_id',
        as: 'movie'
      }
    },
    { $unwind: '$movie' },
    {
      $group: {
        _id: '$movie._id',
        title: { $first: '$movie.title' },
        posterUrl: { $first: '$movie.posterUrl' },
        ageRating: { $first: '$movie.ageRating' },
        revenue: { $sum: '$totalAmount' },
        ticketsSold: { $sum: { $size: '$seats' } }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 }
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

exports.getOccupancyRate = catchAsync(async (req, res, next) => {
  // Lấy khung thời gian hôm nay (timezone VN: UTC+7)
  const now = new Date();
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const startOfDay = new Date(Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate()) - 7 * 60 * 60 * 1000);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  // 1. Lấy tất cả suất chiếu hôm nay (OPEN)
  const todayShowtimes = await Showtime.find({
    startAt: { $gte: startOfDay, $lt: endOfDay },
    status: 'OPEN'
  }).select('_id roomId').lean();

  if (todayShowtimes.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        occupancyRate: 0,
        bookedSeats: 0,
        totalCapacity: 0,
        availableSeats: 0,
        totalShowtimes: 0
      }
    });
  }

  const showtimeIds = todayShowtimes.map(s => s._id);
  const roomIds = [...new Set(todayShowtimes.map(s => s.roomId.toString()))];

  // 2. Tổng sức chứa = tổng Room.totalSeats cho mỗi suất chiếu
  const rooms = await Room.find({ _id: { $in: roomIds } }).select('_id totalSeats').lean();
  const roomCapacityMap = {};
  rooms.forEach(r => { roomCapacityMap[r._id.toString()] = r.totalSeats || 0; });

  let totalCapacity = 0;
  todayShowtimes.forEach(s => {
    totalCapacity += roomCapacityMap[s.roomId.toString()] || 0;
  });

  // 3. Đếm ghế đã đặt từ đơn hàng PAID hôm nay
  const bookedStats = await Order.aggregate([
    {
      $match: {
        showtimeId: { $in: showtimeIds },
        status: 'PAID'
      }
    },
    {
      $group: {
        _id: null,
        bookedSeats: { $sum: { $size: '$seats' } }
      }
    }
  ]);

  const bookedSeats = bookedStats.length > 0 ? bookedStats[0].bookedSeats : 0;
  const occupancyRate = totalCapacity > 0 ? (bookedSeats / totalCapacity) * 100 : 0;

  res.status(200).json({
    status: 'success',
    data: {
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      bookedSeats,
      totalCapacity,
      availableSeats: totalCapacity - bookedSeats,
      totalShowtimes: todayShowtimes.length
    }
  });
});

// ========== NEW DASHBOARD ENDPOINTS ==========

/**
 * GET /reports/dashboard/stats
 * 4 thẻ thống kê: Doanh thu tháng, Vé bán hôm nay, Phim đang chiếu, User mới
 */
exports.getDashboardStats = catchAsync(async (req, res) => {
  const now = new Date();

  // Đầu tháng hiện tại
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Đầu tháng trước
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Đầu ngày hôm nay
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Đầu ngày hôm qua
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // 7 ngày trước
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  // 14 ngày trước (so sánh tuần trước)
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // 1. Doanh thu tháng này & tháng trước
  const [revenueThisMonth] = await Order.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const [revenueLastMonth] = await Order.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const monthRevenue = revenueThisMonth?.total || 0;
  const lastMonthRevenue = revenueLastMonth?.total || 0;
  const revenueChange = lastMonthRevenue > 0
    ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10
    : 0;

  // 2. Vé bán hôm nay & hôm qua
  const ticketsToday = await Order.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: startOfToday } } },
    { $unwind: '$seats' },
    { $count: 'total' }
  ]);
  const ticketsYesterday = await Order.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: startOfYesterday, $lt: startOfToday } } },
    { $unwind: '$seats' },
    { $count: 'total' }
  ]);
  const todayTickets = ticketsToday[0]?.total || 0;
  const yesterdayTickets = ticketsYesterday[0]?.total || 0;
  const ticketsChange = yesterdayTickets > 0
    ? Math.round(((todayTickets - yesterdayTickets) / yesterdayTickets) * 1000) / 10
    : 0;

  // 3. Phim đang chiếu
  const moviesNow = await Movie.countDocuments({ status: 'NOW' });
  const moviesComing = await Movie.countDocuments({ status: 'COMING' });

  // 4. User mới (7 ngày) & so sánh 7 ngày trước đó
  const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const newUsersLastWeek = await User.countDocuments({
    createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
  });
  const usersChange = newUsersLastWeek > 0
    ? Math.round(((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 1000) / 10
    : 0;

  // Format displayValue
  const formatVND = (v) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)} tỷ`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)} tr`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
    return `${v}`;
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats: [
        {
          id: 'revenue',
          label: 'Doanh thu tháng',
          value: monthRevenue,
          displayValue: formatVND(monthRevenue),
          unit: 'VNĐ',
          change: revenueChange,
          icon: 'AttachMoney',
          color: '#4caf50'
        },
        {
          id: 'tickets',
          label: 'Vé bán hôm nay',
          value: todayTickets,
          displayValue: `${todayTickets}`,
          unit: 'vé',
          change: ticketsChange,
          icon: 'ConfirmationNumber',
          color: '#ff9800'
        },
        {
          id: 'movies',
          label: 'Phim đang chiếu',
          value: moviesNow,
          displayValue: `${moviesNow}`,
          unit: 'phim',
          change: moviesComing,
          icon: 'MovieFilter',
          color: '#2196f3'
        },
        {
          id: 'users',
          label: 'Người dùng mới',
          value: newUsersThisWeek,
          displayValue: `${newUsersThisWeek}`,
          unit: 'người',
          change: usersChange,
          icon: 'PersonAdd',
          color: '#9c27b0'
        }
      ]
    }
  });
});

/**
 * GET /reports/dashboard/revenue-7d
 * Doanh thu 7 ngày (BarChart): vé + combo riêng
 */
exports.getRevenue7Days = catchAsync(async (req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const stats = await Order.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: sevenDaysAgo } } },
    {
      $addFields: {
        ticketRevenue: { $sum: '$seats.price' },
        comboRevenue: { $sum: '$combos.totalPrice' }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%d/%m', date: '$createdAt', timezone: '+07:00' } },
        dateSort: { $first: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+07:00' } } },
        tickets: { $sum: '$ticketRevenue' },
        combos: { $sum: '$comboRevenue' }
      }
    },
    { $sort: { dateSort: 1 } }
  ]);

  // Gửi giá trị gốc (VNĐ) — frontend tự format hiển thị
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const result = stats.map(s => {
    const d = new Date(s.dateSort);
    const dayName = days[d.getDay()];
    return {
      day: `${s._id} (${dayName})`,
      tickets: s.tickets,
      combos: s.combos
    };
  });

  res.status(200).json({ status: 'success', data: { revenue: result } });
});

/**
 * GET /reports/dashboard/revenue-30d
 * Xu hướng doanh thu 30 ngày (LineChart)
 */
exports.getRevenue30Days = catchAsync(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const stats = await Order.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%d/%m', date: '$createdAt', timezone: '+07:00' } },
        dateSort: { $first: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+07:00' } } },
        total: { $sum: '$totalAmount' }
      }
    },
    { $sort: { dateSort: 1 } }
  ]);

  // Gửi giá trị gốc (VNĐ)
  const result = stats.map(s => ({
    day: s._id,
    value: s.total
  }));

  // Tính ngày bắt đầu/kết thúc (theo khoảng thời gian thực tế, timezone VN)
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const vnStart = new Date(thirtyDaysAgo.getTime() + 7 * 60 * 60 * 1000);
  const formatDD_MM = (d) => `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
  const startDate = formatDD_MM(vnStart);
  const endDate = formatDD_MM(vnNow);

  res.status(200).json({
    status: 'success',
    data: { revenue: result, startDate, endDate }
  });
});

/**
 * GET /reports/dashboard/genre-stats
 * Thể loại phim phổ biến (PieChart)
 * - Ưu tiên: Top 5 thể loại theo vé bán 30 ngày gần nhất
 * - Fallback: Số lượng phim theo thể loại (khi chưa có đơn hàng)
 */
exports.getGenreStats = catchAsync(async (req, res) => {
  const GENRE_COLORS = ['#1B4F93', '#e74c3c', '#e91e63', '#ff9800', '#00bcd4', '#4caf50', '#9c27b0', '#795548'];

  // Lọc 30 ngày gần nhất
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // === CÁCH 1: Theo vé bán 30 ngày ===
  const stats = await Order.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: thirtyDaysAgo } } },
    { $lookup: { from: 'showtimes', localField: 'showtimeId', foreignField: '_id', as: 'showtime' } },
    { $unwind: '$showtime' },
    { $lookup: { from: 'movies', localField: 'showtime.movieId', foreignField: '_id', as: 'movie' } },
    { $unwind: '$movie' },
    { $unwind: '$movie.genres' },
    { $lookup: { from: 'genres', localField: 'movie.genres', foreignField: '_id', as: 'genre' } },
    { $unwind: '$genre' },
    // Unwind category array
    { $unwind: '$genre.category' },
    // Tách chuỗi "Hài, Gia đình, Tình cảm" thành từng thể loại riêng
    {
      $addFields: {
        splitCategories: { $split: ['$genre.category', ', '] }
      }
    },
    { $unwind: '$splitCategories' },
    // Trim khoảng trắng
    {
      $addFields: {
        cleanCategory: { $trim: { input: '$splitCategories' } }
      }
    },
    {
      $group: {
        _id: '$cleanCategory',
        value: { $sum: { $size: '$seats' } }
      }
    },
    { $match: { _id: { $ne: '' } } },
    { $sort: { value: -1 } },
    { $limit: 5 }
  ]);

  let result;
  let source = 'tickets'; // Nguồn dữ liệu

  if (stats.length > 0) {
    // Có dữ liệu vé → hiển thị theo vé bán
    result = stats.map((s, i) => ({
      id: i,
      value: s.value,
      label: s._id,
      color: GENRE_COLORS[i % GENRE_COLORS.length]
    }));
  } else {
    // === FALLBACK: Đếm số phim theo thể loại ===
    source = 'movies';
    const Genre = require('../models/Genre');
    const fallback = await Movie.aggregate([
      { $match: { status: { $in: ['NOW', 'COMING'] } } },
      { $unwind: '$genres' },
      { $lookup: { from: 'genres', localField: 'genres', foreignField: '_id', as: 'genre' } },
      { $unwind: '$genre' },
      { $unwind: '$genre.category' },
      {
        $addFields: {
          splitCategories: { $split: ['$genre.category', ', '] }
        }
      },
      { $unwind: '$splitCategories' },
      {
        $addFields: {
          cleanCategory: { $trim: { input: '$splitCategories' } }
        }
      },
      {
        $group: {
          _id: '$cleanCategory',
          value: { $sum: 1 }
        }
      },
      { $match: { _id: { $ne: '' } } },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);

    result = fallback.map((s, i) => ({
      id: i,
      value: s.value,
      label: s._id,
      color: GENRE_COLORS[i % GENRE_COLORS.length]
    }));
  }

  res.status(200).json({ status: 'success', data: { genres: result, source } });
});

/**
 * GET /reports/dashboard/today-showtimes
 * Suất chiếu hôm nay
 */
exports.getTodayShowtimes = catchAsync(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const showtimes = await Showtime.find({
    startAt: { $gte: startOfToday, $lt: endOfToday }
  })
    .populate('movieId', 'title posterUrl ageRating')
    .populate('roomId', 'name totalSeats')
    .sort({ startAt: 1 });

  // Tính số ghế đã bán cho mỗi suất
  const result = await Promise.all(showtimes.map(async (s) => {
    const orders = await Order.aggregate([
      { $match: { showtimeId: s._id, status: { $in: ['PAID', 'PENDING', 'PROCESSING'] } } },
      { $unwind: '$seats' },
      { $count: 'booked' }
    ]);
    const booked = orders[0]?.booked || 0;
    const totalSeats = s.roomId?.totalSeats || 100;

    const formatTime = (date) => {
      const d = new Date(date);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    return {
      time: formatTime(s.startAt),
      endTime: formatTime(s.endAt),
      movie: s.movieId?.title || 'N/A',
      poster: s.movieId?.posterUrl || '',
      ageRating: s.movieId?.ageRating || 'P',
      room: s.roomId?.name || 'N/A',
      format: s.format,
      subtitle: s.subtitle,
      basePrice: s.basePrice,
      seatStatus: `${booked}/${totalSeats}`,
      status: s.status
    };
  }));

  res.status(200).json({ status: 'success', data: { showtimes: result } });
});

/**
 * GET /reports/dashboard/recent-orders
 * Đơn hàng gần đây (20 đơn mới nhất)
 */
exports.getRecentOrders = catchAsync(async (req, res) => {
  const orders = await Order.find()
    .populate('userId', 'name')
    .populate({
      path: 'showtimeId',
      select: 'movieId',
      populate: { path: 'movieId', select: 'title posterUrl' }
    })
    .sort({ createdAt: -1 })
    .limit(20);

  const result = orders.map(o => {
    const createdAt = new Date(o.createdAt);
    const dd = String(createdAt.getDate()).padStart(2, '0');
    const mm = String(createdAt.getMonth() + 1).padStart(2, '0');
    const hh = String(createdAt.getHours()).padStart(2, '0');
    const mi = String(createdAt.getMinutes()).padStart(2, '0');

    return {
      orderNo: o.orderNo,
      customer: o.userId?.name || 'N/A',
      movie: o.showtimeId?.movieId?.title || 'N/A',
      poster: o.showtimeId?.movieId?.posterUrl || '',
      seats: o.seats?.length || 0,
      combos: o.combos?.length || 0,
      subTotal: o.subTotal,
      discount: o.discount,
      voucherCode: o.voucherCode,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: `${dd}/${mm} ${hh}:${mi}`
    };
  });

  res.status(200).json({ status: 'success', data: { orders: result } });
});

/**
 * GET /reports/dashboard/top-combos
 * Top combo bán chạy — theo tháng hiện tại, tự cập nhật khi sang tháng mới
 */
exports.getTopCombos = catchAsync(async (req, res) => {
  const COMBO_COLORS = ['#1B4F93', '#ff9800', '#4caf50', '#e91e63', '#00bcd4', '#9c27b0', '#795548', '#607d8b', '#f44336', '#3f51b5'];

  // Lọc theo tháng hiện tại (timezone VN)
  const now = new Date();
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const year = vnNow.getUTCFullYear();
  const month = vnNow.getUTCMonth(); // 0-indexed
  // Đầu tháng hiện tại (UTC)
  const startOfMonth = new Date(Date.UTC(year, month, 1) - 7 * 60 * 60 * 1000);

  const stats = await Order.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: startOfMonth } } },
    { $unwind: '$combos' },
    {
      $group: {
        _id: '$combos.name',
        sold: { $sum: '$combos.quantity' },
        revenue: { $sum: '$combos.totalPrice' },
        avgPrice: { $avg: '$combos.unitPrice' }
      }
    },
    { $sort: { sold: -1 } },
    { $limit: 10 }
  ]);

  const result = stats.map((s, i) => ({
    name: s._id,
    sold: s.sold,
    price: Math.round(s.avgPrice),
    revenue: s.revenue,
    color: COMBO_COLORS[i % COMBO_COLORS.length]
  }));

  // Label tháng hiện tại
  const monthLabel = `Tháng ${month + 1}/${year}`;

  res.status(200).json({ status: 'success', data: { combos: result, monthLabel } });
});

/**
 * GET /reports/dashboard/membership
 * Phân bổ thành viên (PieChart)
 */
exports.getMembershipStats = catchAsync(async (req, res) => {
  const RANK_COLORS = { MEMBER: '#90caf9', VIP: '#ff9800', DIAMOND: '#9c27b0' };

  const stats = await User.aggregate([
    { $group: { _id: '$rank', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const result = stats.map((s, i) => ({
    id: i,
    value: s.count,
    label: s._id || 'MEMBER',
    color: RANK_COLORS[s._id] || '#90caf9'
  }));

  res.status(200).json({ status: 'success', data: { membership: result } });
});

/**
 * GET /reports/dashboard/promotions
 * Khuyến mãi đang hoạt động
 * - Phân biệt Voucher vs Offline vs Payment
 * - Xử lý đúng totalRedeemsLimit = null (không giới hạn)
 * - Giới hạn hiển thị 5 KM, ưu tiên theo priority
 */
exports.getActivePromotions = catchAsync(async (req, res) => {
  const now = new Date();

  const promotions = await Promotion.find({
    status: 'ACTIVE',
    endAt: { $gte: now }
  })
    .select('title type endAt redeemCount totalRedeemsLimit applyMode voucherId priority')
    .sort({ priority: -1, endAt: 1 })
    .limit(5);

  // Đếm tổng số KM active (không limit)
  const totalPromotions = await Promotion.countDocuments({
    status: 'ACTIVE',
    endAt: { $gte: now }
  });

  // Đếm voucher thực: chỉ KM có applyMode = ONLINE_VOUCHER
  const totalVouchers = await Promotion.countDocuments({
    status: 'ACTIVE',
    endAt: { $gte: now },
    applyMode: 'ONLINE_VOUCHER'
  });

  // Tính usage rate chỉ trên các KM có quota
  let totalUsed = 0;
  let totalLimit = 0;
  const promotionList = promotions.map(p => {
    const used = p.redeemCount || 0;
    const hasQuota = p.totalRedeemsLimit !== null && p.totalRedeemsLimit !== undefined;
    const total = hasQuota ? p.totalRedeemsLimit : null;

    if (hasQuota) {
      totalUsed += used;
      totalLimit += p.totalRedeemsLimit;
    }

    const endDate = new Date(p.endAt);
    const dd = String(endDate.getDate()).padStart(2, '0');
    const mm = String(endDate.getMonth() + 1).padStart(2, '0');

    // Map applyMode sang label tiếng Việt
    let applyLabel;
    switch (p.applyMode) {
      case 'ONLINE_VOUCHER': applyLabel = 'Voucher'; break;
      case 'OFFLINE_ONLY': applyLabel = 'Tại quầy'; break;
      case 'PAYMENT_METHOD_ONLY': applyLabel = 'Thanh toán'; break;
      default: applyLabel = 'Khuyến mãi';
    }

    return {
      name: p.title,
      type: p.type === 'EVENT' ? 'Sự kiện' : 'Khuyến mãi',
      applyMode: p.applyMode,
      applyLabel,
      endDate: `${dd}/${mm}`,
      used,
      total,
      hasQuota
    };
  });

  const voucherUsageRate = totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      promotions: {
        totalPromotions,
        totalVouchers,
        voucherUsageRate,
        promotionList
      }
    }
  });
});

/**
 * GET /reports/dashboard/today-summary
 * Tổng quan nhanh — dữ liệu thực hôm nay
 * Theo hướng các hệ thống cinema lớn (CGV, Lotte, Galaxy):
 * - Doanh thu hôm nay + % so với hôm qua
 * - Số đơn hàng hôm nay + % so với hôm qua
 * - Review mới hôm nay + rating trung bình
 * - Thành viên mới hôm nay
 */
exports.getTodaySummary = catchAsync(async (req, res) => {
  const Review = require('../models/Review');

  // Timezone VN: UTC+7
  const now = new Date();
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const startOfToday = new Date(Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate()) - 7 * 60 * 60 * 1000);
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

  // Format ngày hôm nay (VN)
  const dd = String(vnNow.getUTCDate()).padStart(2, '0');
  const mm = String(vnNow.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = vnNow.getUTCFullYear();
  const todayLabel = `${dd}/${mm}/${yyyy}`;

  // 1. Doanh thu hôm nay & hôm qua
  const [revToday] = await Order.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: startOfToday } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const [revYesterday] = await Order.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: startOfYesterday, $lt: startOfToday } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const todayRevenue = revToday?.total || 0;
  const yesterdayRevenue = revYesterday?.total || 0;
  const revenueChange = yesterdayRevenue > 0
    ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 1000) / 10
    : 0;

  // Format doanh thu
  const formatVND = (v) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)} tỷ`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)} triệu`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
    return `${v}`;
  };

  // 2. Đơn hàng hôm nay & hôm qua (chỉ PAID)
  const ordersToday = await Order.countDocuments({ status: 'PAID', createdAt: { $gte: startOfToday } });
  const ordersYesterday = await Order.countDocuments({ status: 'PAID', createdAt: { $gte: startOfYesterday, $lt: startOfToday } });
  const ordersChange = ordersYesterday > 0
    ? Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 1000) / 10
    : 0;

  // 3. Review mới hôm nay + rating trung bình
  const reviewStats = await Review.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfToday },
        status: 'APPROVED',
        parentId: null,
        rating: { $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  const todayReviews = reviewStats[0]?.count || 0;
  const avgRating = reviewStats[0]?.avgRating ? Math.round(reviewStats[0].avgRating * 10) / 10 : 0;

  // 4. Thành viên mới hôm nay
  const newMembersToday = await User.countDocuments({ createdAt: { $gte: startOfToday } });

  res.status(200).json({
    status: 'success',
    data: {
      todayLabel,
      revenue: {
        value: todayRevenue,
        display: formatVND(todayRevenue),
        change: revenueChange
      },
      orders: {
        value: ordersToday,
        change: ordersChange
      },
      reviews: {
        count: todayReviews,
        avgRating
      },
      newMembers: newMembersToday
    }
  });
});
