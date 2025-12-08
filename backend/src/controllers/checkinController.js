const Ticket = require('../models/Ticket');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Quét vé (Check-in)
 * @route POST /api/v1/checkin/scan
 * @access Staff, Manager, Admin
 */
exports.scanTicket = catchAsync(async (req, res, next) => {
  const { ticketCode, qrChecksum } = req.body;

  // 1. Validate Input
  if (!ticketCode && !qrChecksum) {
    return next(new AppError('Vui lòng cung cấp mã vé hoặc mã QR!', 400));
  }

  // 2. Tìm vé trong DB
  // Ưu tiên tìm theo qrChecksum (bảo mật hơn vì khó đoán)
  let query = {};
  if (qrChecksum) query.qrChecksum = qrChecksum;
  else query.ticketCode = ticketCode;

  const ticket = await Ticket.findOne(query)
    .populate('userId', 'name email')
    .populate('showtimeId', 'startAt endAt roomId movieId')
    .populate({
      path: 'showtimeId',
      populate: [
        { path: 'movieId', select: 'title posterUrl duration' },
        { path: 'roomId', select: 'name' }
      ]
    });

  if (!ticket) {
    return next(new AppError('Vé không tồn tại hoặc mã QR không hợp lệ!', 404));
  }

  // 3. Kiểm tra trạng thái vé
  if (ticket.status === 'USED') {
    return res.status(200).json({
      status: 'fail',
      message: `Vé đã được sử dụng vào lúc: ${ticket.usedAt ? ticket.usedAt.toLocaleString() : 'N/A'}`,
      data: {
        ticketCode: ticket.ticketCode,
        seatCode: ticket.seatCode,
        status: ticket.status
      }
    });
  }

  if (ticket.status === 'VOID') {
    return next(new AppError('Vé đã bị hủy!', 400));
  }

  // 4. Kiểm tra thời gian suất chiếu (Optional: Cảnh báo nếu đến quá sớm hoặc quá muộn)
  // Logic này tùy chọn, hiện tại chỉ warning, không chặn.

  // 5. Cập nhật trạng thái -> USED
  ticket.status = 'USED';
  ticket.usedAt = Date.now();
  await ticket.save();

  // 6. Audit Log
  const auditLogService = require('../services/auditLogService');
  await auditLogService.createLog(
    req.user.id,
    'CHECKIN_TICKET',
    'Ticket',
    ticket._id,
    { ticketCode: ticket.ticketCode, seatCode: ticket.seatCode }
  );

  // 7. Trả về thông tin để nhân viên đối chiếu
  res.status(200).json({
    status: 'success',
    message: 'Check-in thành công! ✅',
    data: {
      ticketCode: ticket.ticketCode,
      seatCode: ticket.seatCode,
      movie: ticket.showtimeId?.movieId?.title || 'Unknown Movie',
      room: ticket.showtimeId?.roomId?.name || 'Unknown Room',
      showtime: ticket.showtimeId?.startAt,
      customer: ticket.userId?.name || 'Unknown Customer',
      poster: ticket.showtimeId?.movieId?.posterUrl
    }
  });
});
