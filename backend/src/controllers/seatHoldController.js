const SeatHold = require('../models/SeatHold');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const socketService = require('../services/socketService');

// Tạo giữ ghế (Hold)
// Giới hạn tối đa số ghế 1 user có thể giữ cho 1 suất chiếu
const MAX_SEATS_PER_USER = 8;

exports.createHold = catchAsync(async (req, res, next) => {
  const { showtimeId, seatCode, groupId } = req.body;
  const userId = req.user.id; // Lấy từ authMiddleware

  // 0. KIỂM TRA GIỚI HẠN SỐ GHẾ (Chống spam-lock)
  const userHoldCount = await SeatHold.countDocuments({ showtimeId, userId });
  if (userHoldCount >= MAX_SEATS_PER_USER) {
    return next(new AppError(`Bạn chỉ được giữ tối đa ${MAX_SEATS_PER_USER} ghế!`, 400));
  }

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

// Lấy danh sách ghế đang được giữ VÀ ghế đã bán của một suất chiếu
exports.getHoldsByShowtime = catchAsync(async (req, res, next) => {
  const { showtimeId } = req.params;
  const Ticket = require('../models/Ticket');

  // 1. Lấy ghế đang được tạm giữ (SeatHold)
  const holds = await SeatHold.find({ showtimeId }).select('seatCode userId expiredAt');

  // 2. Lấy ghế đã bán (Ticket với status VALID)
  const soldTickets = await Ticket.find({
    showtimeId,
    status: 'VALID'
  }).select('seatCode');
  const soldSeatCodes = soldTickets.map(t => t.seatCode);

  res.status(200).json({
    status: 'success',
    results: holds.length,
    data: {
      holds,
      soldSeats: soldSeatCodes // Danh sách ghế đã bán
    }
  });
});

/**
 * Verify hold còn hiệu lực và trả về thời gian còn lại
 * - Nếu hết hạn: Lazy cleanup (xóa ngay) và trả về valid: false
 * - Nếu còn hạn: Trả về remainingSeconds để client sync timer
 */
exports.verifyHold = catchAsync(async (req, res, next) => {
  const { showtimeId } = req.params;
  const userId = req.user.id;

  // 1. Tìm tất cả ghế đang giữ của user cho suất chiếu này
  const holds = await SeatHold.find({ showtimeId, userId });

  if (!holds || holds.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        valid: false,
        message: 'Không tìm thấy ghế nào đang được giữ.',
        remainingSeconds: 0
      }
    });
  }

  // 2. Tìm thời gian hết hạn sớm nhất
  const expiryTimes = holds.map(h => new Date(h.expiredAt).getTime());
  const earliestExpiry = Math.min(...expiryTimes);
  const now = Date.now();

  let remainingSeconds = Math.floor((earliestExpiry - now) / 1000);

  // 3. Lazy cleanup: Xóa ngay nếu hết hạn (MongoDB TTL có độ trễ ~60s)
  if (remainingSeconds <= 0) {
    await SeatHold.deleteMany({ showtimeId, userId });

    // Emit socket event để thông báo ghế đã được nhả
    holds.forEach(hold => {
      socketService.emitSeatReleased(showtimeId, hold.seatCode);
    });

    return res.status(200).json({
      status: 'success',
      data: {
        valid: false,
        message: 'Thời gian giữ ghế đã hết.',
        remainingSeconds: 0
      }
    });
  }

  // 4. Trả về kết quả Valid
  res.status(200).json({
    status: 'success',
    data: {
      valid: true,
      remainingSeconds,
      holds: holds.map(h => h.seatCode)
    }
  });
});

/**
 * Release all holds của user cho 1 suất chiếu
 * - Dùng khi user rời trang chọn ghế (không đi combo)
 * - Giải phóng tất cả ghế đang giữ cùng lúc
 */
exports.releaseAllHolds = catchAsync(async (req, res, next) => {
  const { showtimeId } = req.params;
  const userId = req.user.id;

  // 1. Tìm tất cả ghế đang giữ
  const holds = await SeatHold.find({ showtimeId, userId });

  if (holds.length > 0) {
    // 2. Xóa tất cả
    await SeatHold.deleteMany({ showtimeId, userId });

    // 3. Emit socket cho từng ghế để client khác cập nhật UI
    holds.forEach(hold => {
      socketService.emitSeatReleased(showtimeId, hold.seatCode);
    });

    console.log(`[SeatHold] Released ${holds.length} seats for user ${userId} in showtime ${showtimeId}`);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
