const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Cấu hình Email (Sử dụng Gmail hoặc Ethereal để test)
// Tốt nhất nên dùng biến môi trường
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME, // VD: tên@gmail.com
    pass: process.env.EMAIL_PASSWORD  // VD: app-specific-password
  }
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
    logger.info(`📧 Email sent to ${options.email}`);
  } catch (error) {
    logger.error(`❌ Email send failed: ${error.message}`);
    // Don't throw in dev/test to avoid blocking flow if creds are missing
    if (process.env.NODE_ENV === 'production') throw error;
  }
};

exports.sendOTP = async (email, otp) => {
  const message = `Mã xác thực của bạn là: ${otp}. Mã này sẽ hết hạn trong 10 phút.`;
  await sendEmail({
    email,
    subject: 'Mã xác thực OTP - NMN Cinema',
    message,
    html: `<h1>Mã xác thực: ${otp}</h1><p>Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>`
  });
};

exports.sendTicket = async (email, ticketInfo, qrBuffer) => {
  await sendEmail({
    email,
    subject: 'Vé điện tử của bạn - NMN Cinema',
    message: 'Cảm ơn bạn đã đặt vé. Vui lòng xem file đính kèm.',
    html: `
      <h1>Đặt vé thành công!</h1>
      <p>Phim: <b>${ticketInfo.movie}</b></p>
      <p>Suất chiếu: ${ticketInfo.showtime}</p>
      <p>Ghế: ${ticketInfo.seats}</p>
      <p>Vui lòng mang mã QR đính kèm đến rạp để check-in.</p>
    `,
    attachments: [
      {
        filename: 'ticket-qr.png',
        content: qrBuffer
      }
    ]
  });
};

exports.sendWelcome = async (email, name) => {
  await sendEmail({
    email,
    subject: 'Chào mừng đến với NMN Cinema',
    message: `Xin chào ${name}, cảm ơn bạn đã đăng ký tài khoản.`,
    html: `<h1>Xin chào ${name}!</h1><p>Chào mừng bạn gia nhập cộng đồng NMN Cinema.</p>`
  });
};

module.exports = {
  sendEmail,
  sendOTP: exports.sendOTP,
  sendTicket: exports.sendTicket,
  sendWelcome: exports.sendWelcome
};
