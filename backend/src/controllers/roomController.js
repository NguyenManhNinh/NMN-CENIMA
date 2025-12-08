const Room = require('../models/Room');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Lấy danh sách phòng (có thể lọc theo cinemaId)
exports.getAllRooms = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.cinemaId) filter = { cinemaId: req.params.cinemaId };

  const rooms = await Room.find(filter);

  res.status(200).json({
    status: 'success',
    results: rooms.length,
    data: {
      rooms
    }
  });
});

// Lấy thông tin một phòng
exports.getRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(new AppError('Không tìm thấy phòng với ID này!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      room
    }
  });
});

// Tạo phòng mới (Admin only)
exports.createRoom = catchAsync(async (req, res, next) => {
  // Nếu route nested /cinemas/:cinemaId/rooms thì lấy cinemaId từ params
  if (!req.body.cinemaId && req.params.cinemaId) req.body.cinemaId = req.params.cinemaId;

  const newRoom = await Room.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      room: newRoom
    }
  });
});

// Cập nhật phòng (Admin only)
exports.updateRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!room) {
    return next(new AppError('Không tìm thấy phòng với ID này!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      room
    }
  });
});

// Xóa phòng (Admin only)
exports.deleteRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findByIdAndDelete(req.params.id);

  if (!room) {
    return next(new AppError('Không tìm thấy phòng với ID này!', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
