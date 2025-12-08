const SeatHold = require('../models/SeatHold');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const socketService = require('../services/socketService');

// Tạo giữ ghế (Hold)
exports.createHold = catchAsync(async (req, res, next) => {
  const { showtimeId, seatCode, groupId } = req.body;
  const userId = req.user.id; // Lấy từ authMiddleware

  // 1. KIỂM TRA CHỦ ĐỘNG (Lớp bảo vệ 1): Xử lý độ trễ của TTL MongoDB
  // Nếu ghế đang có người giữ nhưng đã hết hạn (mà MongoDB chưa kịp xóa), t sẽ xóa thủ công.
  const existingHold = await SeatHold.findOne({ showtimeId, seatCode });

  if (existingHold) {
    if (existingHold.expiredAt < Date.now()) {
      // Đã hết hạn -> Xóa ngay lập tức để người mới có thể đặt
      await SeatHold.findByIdAndDelete(existingHold._id);
    } else {
      // Chưa hết hạn -> Chặn
      return next(new AppError('Ghế này đã có người giữ!', 409));
    }
  }

  // 2. Tạo bản ghi Hold mới
  // Dùng try/catch để xử lý Race Condition (nếu 2 người cùng bấm đúng lúc đã xóa)
  try {
    const newHold = await SeatHold.create({
      showtimeId,
      seatCode,
      userId,
      groupId
    });

    // 3. Phát sự kiện Socket (REAL-TIME UPDATE)
    // Thông báo ngay lập tức cho tất cả client khác để cập nhật trạng thái ghế trên sơ đồ (đổi màu ghế).
    socketService.emitSeatHeld(showtimeId, seatCode, userId);

    res.status(201).json({
      status: 'success',
      data: {
        hold: newHold
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('Ghế này đã có người giữ!', 409)); // 409 Conflict
    }
    throw err; // Ném tiếp lỗi khác nếu không phải duplicate
  }
});

// Hủy giữ ghế (Release)
exports.releaseHold = catchAsync(async (req, res, next) => {
  const { showtimeId, seatCode } = req.body;
  const userId = req.user.id;

  // 1. Xóa bản ghi Hold
  // Chỉ xóa nếu đúng là người đang giữ (hoặc Admin - logic mở rộng sau)
  const hold = await SeatHold.findOneAndDelete({
    showtimeId,
    seatCode,
    userId
  });

  if (!hold) {
    return next(new AppError('Không tìm thấy thông tin giữ ghế hoặc bạn không phải người giữ!', 404));
  }

  // 2. Phát sự kiện Socket (REAL-TIME UPDATE)
  // Thông báo cho client khác biết ghế đã được nhả ra (đổi lại màu ghế trống).
  socketService.emitSeatReleased(showtimeId, seatCode);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Lấy danh sách ghế đang được giữ của một suất chiếu (để hiển thị khi load trang)
exports.getHoldsByShowtime = catchAsync(async (req, res, next) => {
  const { showtimeId } = req.params;

  const holds = await SeatHold.find({ showtimeId }).select('seatCode userId expiredAt');

  res.status(200).json({
    status: 'success',
    results: holds.length,
    data: {
      holds
    }
  });
});
