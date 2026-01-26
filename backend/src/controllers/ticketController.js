const Ticket = require('../models/Ticket');
const SeatHold = require('../models/SeatHold');
const Showtime = require('../models/Showtime');
const crypto = require('crypto');
const QRCode = require('qrcode');
const sendEmail = require('../services/emailService');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Hàm nội bộ: Hoàn tất giao dịch (Được gọi từ Payment Controller)
exports.finalizeTransaction = async (order) => {
  // Idempotency guard - nếu đã có ticket theo orderId => coi như đã finalize
  const existingTickets = await Ticket.find({ orderId: order._id });
  if (existingTickets && existingTickets.length > 0) {
    // đảm bảo order status đúng
    if (order.status !== 'PAID') {
      order.status = 'PAID';
      await order.save();
    }
    console.log('[Finalize] Already finalized, returning existing tickets');
    return existingTickets;
  }

  // 1. Cập nhật trạng thái Order
  order.status = 'PAID';
  await order.save();

  // 2. Fetch thông tin Showtime, Movie, Cinema
  const showtime = await Showtime.findById(order.showtimeId)
    .populate('movieId', 'title posterUrl duration ageRating')
    .populate('cinemaId', 'name address')
    .populate('roomId', 'name');

  const movieTitle = showtime?.movieId?.title || 'Phim';
  const cinemaName = showtime?.cinemaId?.name || 'Rạp';
  const roomName = showtime?.roomId?.name || 'Phòng';
  const showtimeStr = showtime?.startAt
    ? new Date(showtime.startAt).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh', // Fix timezone
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    : 'Chưa xác định';

  // 3. Tạo Vé & Xóa Hold
  const tickets = [];
  const qrAttachments = [];

  for (const seat of order.seats) {
    // Tạo mã vé & QR Checksum
    const ticketCode = `TKT-${Date.now()}-${seat.seatCode}`;
    const qrChecksum = crypto
      .createHash('sha256')
      .update(`${ticketCode}-${process.env.JWT_SECRET}`)
      .digest('hex');

    // QR Data - Chứa đầy đủ thông tin để quét check-in
    const qrData = {
      ticketCode,
      seatCode: seat.seatCode,
      orderId: order._id.toString(),
      showtimeId: order.showtimeId.toString(),
      movie: movieTitle,
      showtime: showtimeStr,
      cinema: `${cinemaName} - ${roomName}`,
      checksum: qrChecksum.substring(0, 16) // Chỉ lấy 16 ký tự đầu
    };

    // Tạo QR Code Image (Data URL)
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 200
    });

    // Tạo vé
    const newTicket = await Ticket.create({
      orderId: order._id,
      userId: order.userId,
      showtimeId: order.showtimeId,
      seatCode: seat.seatCode,
      ticketCode,
      qrChecksum,
      status: 'VALID'
    });
    tickets.push(newTicket);

    // Chuẩn bị attachment cho email
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    qrAttachments.push({
      filename: `ticket-${seat.seatCode}.png`,
      content: Buffer.from(base64Data, 'base64'),
      cid: `qr-${seat.seatCode}`
    });

    // Xóa SeatHold
    await SeatHold.findOneAndDelete({
      showtimeId: order.showtimeId,
      seatCode: seat.seatCode
    });
  }

  // 4. Gửi Email
  try {
    const user = await User.findById(order.userId);
    if (user) {
      await sendEmail.sendTicket(user.email, {
        movie: movieTitle,
        showtime: showtimeStr,
        cinema: `${cinemaName} - ${roomName}`,
        seats: order.seats.map(s => s.seatCode).join(', '),
        orderNo: order.orderNo,
        totalAmount: order.totalAmount
      }, qrAttachments[0].content);

      console.log(`✅ Email sent to ${user.email}`);
    }
  } catch (err) {
    console.error('❌ Error sending email:', err);
  }

  return tickets;
};


// API: Lấy danh sách vé của user đang đăng nhập
exports.getMyTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({ userId: req.user.id })
    .populate({
      path: 'showtimeId',
      select: 'startAt endAt format basePrice',
      populate: [
        { path: 'movieId', select: 'title slug posterUrl duration' },
        { path: 'roomId', select: 'name type' },
        { path: 'cinemaId', select: 'name address' }
      ]
    })
    .sort({ issuedAt: -1 });

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: { tickets }
  });
});

// API: Lấy chi tiết 1 vé
exports.getTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate({
      path: 'showtimeId',
      select: 'startAt endAt format basePrice',
      populate: [
        { path: 'movieId', select: 'title slug posterUrl duration ageRating' },
        { path: 'roomId', select: 'name type' },
        { path: 'cinemaId', select: 'name address phone' }
      ]
    })
    .populate('orderId', 'orderNo totalAmount');

  if (!ticket) {
    return next(new AppError('Không tìm thấy vé!', 404));
  }

  // Kiểm tra quyền: Chỉ chủ sở hữu hoặc Admin mới được xem
  if (ticket.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Bạn không có quyền xem vé này!', 403));
  }

  res.status(200).json({
    status: 'success',
    data: { ticket }
  });
});

/**
 * API: Check-in vé (Staff/Admin quét QR)
 * @route POST /api/v1/tickets/checkin
 * @desc Đánh dấu vé đã sử dụng khi khách đến rạp
 */
exports.checkInTicket = catchAsync(async (req, res, next) => {
  const { ticketCode, checksum } = req.body;

  if (!ticketCode) {
    return next(new AppError('Vui lòng cung cấp mã vé!', 400));
  }

  // 1. Tìm vé theo ticketCode
  const ticket = await Ticket.findOne({ ticketCode })
    .populate({
      path: 'showtimeId',
      select: 'startAt endAt',
      populate: [
        { path: 'movieId', select: 'title' },
        { path: 'cinemaId', select: 'name' }
      ]
    });

  if (!ticket) {
    return next(new AppError('Mã vé không tồn tại!', 404));
  }

  // 2. Kiểm tra checksum (nếu có)
  if (checksum && ticket.qrChecksum.substring(0, 16) !== checksum) {
    return next(new AppError('Mã xác thực không hợp lệ!', 400));
  }

  // 3. Kiểm tra trạng thái vé
  if (ticket.status === 'USED') {
    return next(new AppError('Vé đã được sử dụng trước đó!', 400));
  }
  if (ticket.status === 'VOID') {
    return next(new AppError('Vé đã bị hủy!', 400));
  }

  // 4. Kiểm tra thời gian suất chiếu (cho phép check-in trước 1 tiếng và sau 30 phút kể từ startAt)
  const showtime = ticket.showtimeId;
  if (showtime) {
    const now = new Date();
    const startAt = new Date(showtime.startAt);
    const oneHourBefore = new Date(startAt.getTime() - 60 * 60 * 1000);
    const thirtyMinutesAfter = new Date(startAt.getTime() + 30 * 60 * 1000);

    if (now < oneHourBefore) {
      return next(new AppError(`Chưa đến giờ check-in. Vui lòng quay lại sau ${oneHourBefore.toLocaleTimeString('vi-VN')}!`, 400));
    }
    if (now > thirtyMinutesAfter) {
      return next(new AppError('Đã quá thời gian check-in cho suất chiếu này!', 400));
    }
  }

  // 5. Cập nhật trạng thái vé
  ticket.status = 'USED';
  ticket.usedAt = new Date();
  await ticket.save();

  res.status(200).json({
    status: 'success',
    message: 'Check-in thành công!',
    data: {
      ticket: {
        ticketCode: ticket.ticketCode,
        seatCode: ticket.seatCode,
        status: ticket.status,
        usedAt: ticket.usedAt,
        movie: ticket.showtimeId?.movieId?.title,
        cinema: ticket.showtimeId?.cinemaId?.name,
        showtime: ticket.showtimeId?.startAt
      }
    }
  });
});

