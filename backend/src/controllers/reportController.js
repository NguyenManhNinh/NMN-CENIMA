const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const Movie = require('../models/Movie');
const catchAsync = require('../utils/catchAsync');
const { DEFAULT_SEATS_PER_ROOM } = require('../config/constants');

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
  // Tỷ lệ lấp đầy = Tổng vé bán / Tổng ghế cung cấp
  // Tính trên toàn bộ hệ thống (hoặc filter theo date nếu cần)

  const totalTickets = await Ticket.countDocuments({ status: { $in: ['VALID', 'USED'] } });

  // Ước tính tổng ghế cung cấp (Số showtime * Số ghế trung bình/phòng)
  // Đây là tính toán tương đối cho Dashboard
  const Showtime = require('../models/Showtime');
  const totalShowtimes = await Showtime.countDocuments();
  const totalCapacity = totalShowtimes * DEFAULT_SEATS_PER_ROOM;

  const occupancyRate = totalCapacity > 0 ? (totalTickets / totalCapacity) * 100 : 0;

  res.status(200).json({
    status: 'success',
    data: {
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      totalTickets,
      totalCapacity
    }
  });
});
