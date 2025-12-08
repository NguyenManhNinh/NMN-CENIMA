const Ticket = require('../models/Ticket');
const SeatHold = require('../models/SeatHold');
const crypto = require('crypto');
const QRCode = require('qrcode');
const sendEmail = require('../services/emailService');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Hàm nội bộ: Hoàn tất giao dịch (Được gọi từ Payment Controller)
exports.finalizeTransaction = async (order) => {
  // 1. Cập nhật trạng thái Order
  order.status = 'PAID';
  await order.save();

  // 2. Tạo Vé & Xóa Hold
  const tickets = [];
  const qrAttachments = [];

  for (const seat of order.seats) {
    // Tạo mã vé & QR Checksum
    const ticketCode = `TKT-${Date.now()}-${seat.seatCode}`;
    const qrChecksum = crypto
      .createHash('sha256')
      .update(`${ticketCode}-${process.env.JWT_SECRET}`)
      .digest('hex');

    // Tạo QR Code Image (Data URL)
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
      ticketCode,
      seatCode: seat.seatCode,
      checksum: qrChecksum
    }));

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
    // Convert Data URL to Buffer
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    qrAttachments.push({
      filename: `ticket-${seat.seatCode}.png`,
      content: Buffer.from(base64Data, 'base64'),
      cid: `qr-${seat.seatCode}` // Content ID để nhúng vào HTML
    });

    // Xóa SeatHold (Quan trọng: Giải phóng ghế khỏi bảng tạm giữ)
    await SeatHold.findOneAndDelete({
      showtimeId: order.showtimeId,
      seatCode: seat.seatCode
    });
  }

  // 3. Gửi Email
  try {
    const user = await User.findById(order.userId);
    if (user) {
      let htmlContent = `<h1>Vé xem phim của bạn</h1>
      <p>Cảm ơn bạn đã đặt vé tại NMN Cinema!</p>
      <p>Mã đơn hàng: <b>${order.orderNo}</b></p>
      <p>Tổng tiền: <b>${order.totalAmount.toLocaleString()} VND</b></p>
      <hr/>
      <h3>Danh sách vé:</h3>`;

      tickets.forEach(t => {
        htmlContent += `
        <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
          <p>Ghế: <b>${t.seatCode}</b></p>
          <p>Mã vé: ${t.ticketCode}</p>
          <img src="cid:qr-${t.seatCode}" alt="QR Code" width="150"/>
        </div>`;
      });

      await sendEmail.sendTicket(user.email, {
        movie: 'Phim Demo (Cần fetch tên phim)', // TODO: Fetch movie title
        showtime: 'Suất chiếu (Cần fetch)', // TODO: Fetch showtime
        seats: order.seats.map(s => s.seatCode).join(', ')
      }, qrAttachments[0].content); // Demo gửi 1 QR đầu tiên, thực tế nên gửi list
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
