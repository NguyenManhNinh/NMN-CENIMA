const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Room = require('../models/Room');
const Ticket = require('../models/Ticket');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Hàm kiểm tra xung đột lịch chiếu
const checkCollision = async (roomId, startAt, endAt, excludeId = null) => {
  const query = {
    roomId,
    status: { $ne: 'CANCELED' }, // Bỏ qua các suất đã hủy
    $or: [
      {
        startAt: { $lt: endAt },
        endAt: { $gt: startAt }
      }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId }; // Loại trừ chính nó khi update
  }

  const existingShowtime = await Showtime.findOne(query);
  return existingShowtime;
};

// Lấy danh sách suất chiếu (Filter: movie, cinema, date)
// Mặc định chỉ trả về suất chiếu CHƯA qua (startAt > now)
// Thêm ?includePast=true để lấy cả suất đã qua (cho Admin)
exports.getAllShowtimes = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.query.movieId) filter.movieId = req.query.movieId;
  if (req.query.cinemaId) filter.cinemaId = req.query.cinemaId;
  if (req.query.roomId) filter.roomId = req.query.roomId;

  // Filter theo ngày (ví dụ: ?date=2025-01-01)
  if (req.query.date) {
    const startOfDay = new Date(req.query.date);
    const endOfDay = new Date(req.query.date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    filter.startAt = { $gte: startOfDay, $lt: endOfDay };
  } else {
    // Mặc định: CHỈ lấy suất chiếu TƯƠNG LAI (chưa bắt đầu)
    // Trừ khi có query param includePast=true
    if (req.query.includePast !== 'true') {
      filter.startAt = { $gt: new Date() };
    }
  }

  const showtimes = await Showtime.find(filter)
    .populate('movieId', 'title duration posterUrl')
    .populate('cinemaId', 'name')
    .populate('roomId', 'name totalSeats')
    .sort({ startAt: 1 })
    .lean();

  // Tính ghế trống cho từng suất
  const showtimeIds = showtimes.map(s => s._id);
  const ticketCounts = await Ticket.aggregate([
    { $match: { showtimeId: { $in: showtimeIds }, status: { $ne: 'VOID' } } },
    { $group: { _id: '$showtimeId', count: { $sum: 1 } } }
  ]);
  const ticketMap = {};
  ticketCounts.forEach(t => { ticketMap[t._id.toString()] = t.count; });

  const result = showtimes.map(s => ({
    ...s,
    soldSeats: ticketMap[s._id.toString()] || 0,
    availableSeats: (s.roomId?.totalSeats || 0) - (ticketMap[s._id.toString()] || 0)
  }));

  res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      showtimes: result
    }
  });
});

// Lấy chi tiết một suất chiếu (bao gồm thông tin phim, rạp, phòng)
// QUAN TRỌNG: Endpoint này dùng cho trang chọn ghế
exports.getShowtimeById = catchAsync(async (req, res, next) => {
  const showtime = await Showtime.findById(req.params.id)
    .populate('movieId', 'title duration posterUrl ageRating rating ratingCount country studio movieCategories director actors releaseDate')
    .populate('cinemaId', 'name address')
    .populate('roomId', 'name type totalSeats seatMap');

  if (!showtime) {
    return next(new AppError('Không tìm thấy suất chiếu này!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      showtime
    }
  });
});

// Tạo suất chiếu mới (Admin only)
exports.createShowtime = catchAsync(async (req, res, next) => {
  const { movieId, roomId, startAt, basePrice, seatPrices, format, subtitle, status, maintenanceSeats } = req.body;

  // 1. Lấy thông tin phim để tính endAt
  const movie = await Movie.findById(movieId);
  if (!movie) return next(new AppError('Không tìm thấy phim!', 404));

  // 2. Lấy thông tin phòng để lấy cinemaId (nếu chưa gửi lên)
  const room = await Room.findById(roomId);
  if (!room) return next(new AppError('Không tìm thấy phòng!', 404));

  // 3. Tính toán thời gian kết thúc
  // Thời gian phim + 30 phút dọn dẹp
  const startTime = new Date(startAt);
  const durationMs = (movie.duration + 30) * 60 * 1000;
  const endTime = new Date(startTime.getTime() + durationMs);

  // 4. KIỂM TRA XUNG ĐỘT
  const collision = await checkCollision(roomId, startTime, endTime);
  if (collision) {
    return next(new AppError('Xung đột lịch chiếu! Phòng này đang bận trong khoảng thời gian đã chọn.', 400));
  }

  // 5. Tạo suất chiếu
  const newShowtime = await Showtime.create({
    movieId,
    roomId,
    cinemaId: room.cinemaId, // Tự động lấy từ phòng
    startAt: startTime,
    endAt: endTime,
    basePrice,
    seatPrices: seatPrices || { standard: basePrice, vip: basePrice, couple: basePrice },
    format: format || room.type, // Ưu tiên frontend, fallback room.type
    subtitle: subtitle || 'Phụ đề',
    status: status || 'COMING',
    maintenanceSeats: maintenanceSeats || []
  });

  res.status(201).json({
    status: 'success',
    data: {
      showtime: newShowtime
    }
  });
});

// Cập nhật suất chiếu (Admin only)
exports.updateShowtime = catchAsync(async (req, res, next) => {
  const showtime = await Showtime.findById(req.params.id);
  if (!showtime) return next(new AppError('Không tìm thấy suất chiếu!', 404));

  const { startAt, basePrice, format, subtitle, status } = req.body;

  // Nếu đổi startAt → tính lại endAt + check collision
  if (startAt) {
    const movie = await Movie.findById(showtime.movieId);
    if (!movie) return next(new AppError('Không tìm thấy phim!', 404));

    const startTime = new Date(startAt);
    const durationMs = (movie.duration + 30) * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);

    const collision = await checkCollision(showtime.roomId, startTime, endTime, showtime._id);
    if (collision) {
      return next(new AppError('Xung đột lịch chiếu! Phòng này đang bận trong khoảng thời gian đã chọn.', 400));
    }

    showtime.startAt = startTime;
    showtime.endAt = endTime;
  }

  if (basePrice !== undefined) showtime.basePrice = basePrice;
  if (format) showtime.format = format;
  if (subtitle !== undefined) showtime.subtitle = subtitle;
  if (status) showtime.status = status;

  await showtime.save();

  res.status(200).json({
    status: 'success',
    data: { showtime }
  });
});

// Xóa suất chiếu
exports.deleteShowtime = catchAsync(async (req, res, next) => {
  const showtime = await Showtime.findByIdAndDelete(req.params.id);
  if (!showtime) return next(new AppError('Không tìm thấy suất chiếu!', 404));
  res.status(204).json({ status: 'success', data: null });
});
