const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Cấu hình Email - Dùng Gmail SMTP với port 465 (SSL)
// Port 587 (STARTTLS) bị timeout trên một số hosting (Render), port 465 hoạt động ổn định hơn
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL trực tiếp
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
  connectionTimeout: 10000, // 10s timeout
  greetingTimeout: 10000,
  socketTimeout: 15000
});


const sendEmail = async (options) => {
  // options: { email, subject, message, attachments }
  const mailOptions = {
    from: `NMN Cinema <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.email}`);
  } catch (error) {
    logger.error(`Email send failed to ${options.email}: ${error.message} | Code: ${error.code || 'N/A'}`);
    throw error; // Để caller quyết định xử lý
  }
};

exports.sendOTP = async (email, otp) => {
  await sendEmail({
    email,
    subject: 'Mã xác thực OTP - NMN Cinema',
    message: `Mã xác thực của bạn là: ${otp}. Mã này sẽ hết hạn trong 10 phút.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a5c, #2d5a87); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .otp-box { background: #f8f9fa; border: 2px dashed #F5A623; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
          .otp-code { font-size: 36px; font-weight: 700; color: #F5A623; letter-spacing: 8px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 13px; color: #666; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NMN Cinema</h1>
            <p>Xác thực tài khoản</p>
          </div>

          <div class="content">
            <p>Kính chào Quý khách,</p>

            <p>Chúng tôi nhận được yêu cầu xác thực từ tài khoản của Quý khách. Vui lòng sử dụng mã OTP bên dưới để hoàn tất quá trình xác thực:</p>

            <div class="otp-box">
              <p style="margin: 0 0 10px; color: #666;">Mã xác thực của bạn</p>
              <div class="otp-code">${otp}</div>
            </div>

            <div class="warning">
              <strong>Lưu ý bảo mật:</strong>
              <ul style="margin: 10px 0 0; padding-left: 20px;">
                <li>Mã này sẽ hết hạn sau <strong>10 phút</strong>.</li>
                <li>Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</li>
                <li>NMN Cinema sẽ không bao giờ gọi điện yêu cầu bạn cung cấp mã OTP.</li>
              </ul>
            </div>

            <p>Nếu Quý khách không yêu cầu mã này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi ngay.</p>

            <p>Trân trọng,<br><strong>Đội ngũ NMN Cinema</strong></p>
          </div>

          <div class="footer">
            <p>Email: support@nmncinema.com | Hotline: 0849045706</p>
            <p>© 2026 NMN Cinema. Đồ án tốt nghiệp - Nguyễn Mạnh Ninh</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

exports.sendTicket = async (email, ticketInfo, qrBuffer) => {
  const formattedAmount = ticketInfo.totalAmount
    ? ticketInfo.totalAmount.toLocaleString('vi-VN') + ' VNĐ'
    : '';

  await sendEmail({
    email,
    subject: '🎬 Xác nhận đặt vé thành công - NMN Cinema',
    message: 'Cảm ơn Quý khách đã đặt vé tại NMN Cinema!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a5c, #2d5a87); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 10px 0 0; opacity: 0.9; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .greeting { font-size: 18px; color: #1a3a5c; margin-bottom: 20px; }
          .ticket-box { background: #f8f9fa; border-left: 4px solid #F5A623; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .ticket-row { display: flex; margin: 10px 0; }
          .ticket-label { font-weight: 600; color: #666; min-width: 120px; }
          .ticket-value { color: #333; }
          .highlight { color: #F5A623; font-weight: 700; font-size: 18px; }
          .qr-section { text-align: center; margin: 30px 0; padding: 20px; background: #fafafa; border-radius: 8px; }
          .qr-section img { max-width: 180px; }
          .qr-note { color: #666; font-size: 14px; margin-top: 10px; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 13px; color: #666; border-radius: 0 0 10px 10px; }
          .footer a { color: #1a3a5c; text-decoration: none; }
          .divider { height: 1px; background: #e0e0e0; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>NMN Cinema</h1>
            <p>Xác nhận đặt vé thành công</p>
          </div>

          <!-- Content -->
          <div class="content">
            <p class="greeting">Kính chào Quý khách,</p>

            <p>Cảm ơn Quý khách đã tin tưởng và sử dụng dịch vụ của <strong>NMN Cinema</strong>. Chúng tôi xin xác nhận đơn đặt vé của Quý khách đã được thanh toán thành công.</p>

            <!-- Ticket Details -->
            <div class="ticket-box">
              <div class="ticket-row">
                <span class="ticket-label">Phim:</span>
                <span class="ticket-value highlight">${ticketInfo.movie}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Suất chiếu:</span>
                <span class="ticket-value">${ticketInfo.showtime}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Rạp:</span>
                <span class="ticket-value">${ticketInfo.cinema || ''}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Ghế:</span>
                <span class="ticket-value highlight">${ticketInfo.seats}</span>
              </div>
              ${ticketInfo.orderNo ? `
              <div class="ticket-row">
                <span class="ticket-label">Mã đơn hàng:</span>
                <span class="ticket-value">${ticketInfo.orderNo}</span>
              </div>` : ''}
              ${formattedAmount ? `
              <div class="ticket-row">
                <span class="ticket-label">Tổng tiền:</span>
                <span class="ticket-value highlight">${formattedAmount}</span>
              </div>` : ''}
            </div>

            <!-- QR Code Section -->
            <div class="qr-section">
              <p><strong>Mã QR Check-in</strong></p>
              <img src="cid:ticket-qr" alt="QR Code">
              <p class="qr-note">Vui lòng xuất trình mã QR này tại quầy để nhận vé.</p>
            </div>

            <div class="divider"></div>

            <p><strong>Lưu ý quan trọng:</strong></p>
            <ul>
              <li>Quý khách vui lòng có mặt tại rạp trước giờ chiếu <strong>15-20 phút</strong> để làm thủ tục check-in.</li>
              <li>Vui lòng mang theo điện thoại hoặc in mã QR để xuất trình tại quầy.</li>
              <li>Vé đã mua không thể đổi, trả hoặc hoàn tiền.</li>
            </ul>

            <p>Chúc Quý khách có những phút giây thư giãn tuyệt vời tại NMN Cinema! 🍿</p>

            <p>Trân trọng,<br><strong>Đội ngũ NMN Cinema</strong></p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Email: support@nmncinema.com | Hotline: 0849045706</p>
            <p>© 2026 NMN Cinema. Đồ án tốt nghiệp - Nguyễn Mạnh Ninh</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: 'ticket-qr.png',
        content: qrBuffer,
        cid: 'ticket-qr'
      }
    ]
  });
};

exports.sendWelcome = async (email, name) => {
  await sendEmail({
    email,
    subject: 'Chào mừng bạn đến với NMN Cinema!',
    message: `Xin chào ${name}, cảm ơn bạn đã đăng ký tài khoản tại NMN Cinema.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a5c, #2d5a87); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0 0 10px; font-size: 28px; }
          .header p { margin: 0; font-size: 18px; opacity: 0.9; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .welcome-name { color: #F5A623; font-weight: 700; }
          .benefits { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .benefit-item { display: flex; align-items: center; margin: 10px 0; }
          .benefit-icon { width: 30px; height: 30px; background: #F5A623; border-radius: 50%; text-align: center; line-height: 30px; margin-right: 15px; color: white; font-weight: bold; }
          .cta-button { display: inline-block; background: #F5A623; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 13px; color: #666; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Chào mừng bạn!</h1>
            <p>Gia nhập cộng đồng NMN Cinema</p>
          </div>

          <div class="content">
            <p>Xin chào <span class="welcome-name">${name}</span>,</p>

            <p>Chúng tôi rất vui mừng chào đón bạn trở thành thành viên của <strong>NMN Cinema</strong>! Tài khoản của bạn đã được tạo thành công.</p>

            <div class="benefits">
              <p style="margin: 0 0 15px; font-weight: 600;">Là thành viên, bạn sẽ được hưởng:</p>
              <div class="benefit-item">
                <div class="benefit-icon">1</div>
                <span>Tích điểm thưởng với mỗi giao dịch</span>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">2</div>
                <span>Ưu đãi độc quyền dành riêng cho thành viên</span>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">3</div>
                <span>Đặt vé nhanh chóng, thanh toán tiện lợi</span>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">4</div>
                <span>Nhận thông báo phim mới và sự kiện đặc biệt</span>
              </div>
            </div>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="cta-button">Khám phá ngay</a>
            </p>

            <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ bạn!</p>

            <p>Chúc bạn có những trải nghiệm điện ảnh tuyệt vời!</p>

            <p>Trân trọng,<br><strong>Đội ngũ NMN Cinema</strong></p>
          </div>

          <div class="footer">
            <p>Email: support@nmncinema.com | Hotline: 0849045706</p>
            <p>© 2026 NMN Cinema. Đồ án tốt nghiệp - Nguyễn Mạnh Ninh</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

// --- Ưu đãi thông báo Email ---

exports.sendPromotionNotification = async (email, userName, promotion, voucherCode = null) => {
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const unsubscribeUrl = `${frontendUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
  const promotionUrl = `${frontendUrl}/uu-dai/${promotion.slug}`;

  // Format dates
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  await sendEmail({
    email,
    subject: `${promotion.title} - NMN Cinema`,
    message: `Ưu đãi mới: ${promotion.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.8; color: #333; margin: 0; padding: 20px; background: #f9f9f9; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 4px; }
          .greeting { margin-bottom: 20px; }
          .promo-title { font-size: 20px; font-weight: 600; color: #222; margin: 20px 0 10px; }
          .promo-content { color: #555; margin-bottom: 20px; }
          .voucher-section { background: #fafafa; border-left: 3px solid #1a3a5c; padding: 15px 20px; margin: 25px 0; }
          .voucher-code { font-size: 18px; font-weight: 600; color: #1a3a5c; letter-spacing: 2px; margin-top: 5px; }
          .time-info { color: #666; font-size: 14px; margin: 20px 0; }
          .cta-link { color: #1a3a5c; font-weight: 600; text-decoration: none; }
          .cta-link:hover { text-decoration: underline; }
          .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
          .unsubscribe { margin-top: 10px; }
          .unsubscribe a { color: #999; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="greeting">
            <p>Kính gửi Quý khách <strong>${userName}</strong>,</p>
          </div>

          <p>NMN Cinema trân trọng thông báo đến Quý khách chương trình ưu đãi mới:</p>

          <div class="promo-title">${promotion.title}</div>
          <div class="promo-content">${promotion.excerpt || ''}</div>

          ${voucherCode ? `
          <div class="voucher-section">
            <div style="color: #666; font-size: 13px;">Mã ưu đãi:</div>
            <div class="voucher-code">${voucherCode}</div>
          </div>
          ` : ''}

          <div class="time-info">
            <strong>Thời gian áp dụng:</strong> ${formatDate(promotion.startAt)} - ${formatDate(promotion.endAt)}
          </div>

          <p>
            <a href="${promotionUrl}" class="cta-link">Xem chi tiết chương trình →</a>
          </p>

          <div class="signature">
            <p>Trân trọng,<br><strong>NMN Cinema</strong></p>
          </div>

        <div class="footer">
            <p>Email: support@nmncinema.com | Hotline: 0849045706</p>
            <p>© 2026 NMN Cinema. Đồ án tốt nghiệp - Nguyễn Mạnh Ninh</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

// Gửi email hàng loạt (batch) - Anti-spam
exports.sendBulkPromotionEmails = async (promotion, users, voucherCode = null) => {
  const BATCH_SIZE = 50;
  const DELAY_BETWEEN_BATCHES = 2000; // 2 giây

  let sentCount = 0;
  let failedCount = 0;

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(user =>
        exports.sendPromotionNotification(user.email, user.name, promotion, voucherCode)
      )
    );

    results.forEach(r => {
      if (r.status === 'fulfilled') sentCount++;
      else failedCount++;
    });

    // Delay để tránh rate limit
    if (i + BATCH_SIZE < users.length) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  // Update lastPromotionEmailAt cho users đã gửi thành công
  const User = require('../models/User');
  const userIds = users.map(u => u._id);
  await User.updateMany(
    { _id: { $in: userIds } },
    { lastPromotionEmailAt: new Date() }
  );

  logger.info(`Promotion emails sent: ${sentCount} success, ${failedCount} failed`);
  return { sentCount, failedCount };
};

module.exports = {
  sendEmail,
  sendOTP: exports.sendOTP,
  sendTicket: exports.sendTicket,
  sendWelcome: exports.sendWelcome,
  sendPromotionNotification: exports.sendPromotionNotification,
  sendBulkPromotionEmails: exports.sendBulkPromotionEmails
};
