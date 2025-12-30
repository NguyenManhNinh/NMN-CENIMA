const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Room = require('../models/Room');
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
  }

  const showtimes = await Showtime.find(filter)
    .populate('movieId', 'title duration')
    .populate('cinemaId', 'name')
    .populate('roomId', 'name')
    .sort({ startAt: 1 });

  res.status(200).json({
    status: 'success',
    results: showtimes.length,
    data: {
      showtimes
    }
  });
});

// Lấy chi tiết một suất chiếu (bao gồm thông tin phim, rạp, phòng)
// QUAN TRỌNG: Endpoint này dùng cho trang chọn ghế
exports.getShowtimeById = catchAsync(async (req, res, next) => {
  const showtime = await Showtime.findById(req.params.id)
    .populate('movieId', 'title duration posterUrl ageRating')
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
  const { movieId, roomId, startAt, basePrice } = req.body;

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
    format: room.type // Mặc định theo loại phòng
  });

  res.status(201).json({
    status: 'success',
    data: {
      showtime: newShowtime
    }
  });
});

// Xóa suất chiếu
exports.deleteShowtime = catchAsync(async (req, res, next) => {
  const showtime = await Showtime.findByIdAndDelete(req.params.id);
  if (!showtime) return next(new AppError('Không tìm thấy suất chiếu!', 404));
  res.status(204).json({ status: 'success', data: null });
});
