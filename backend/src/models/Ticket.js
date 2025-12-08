const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true,
    index: true
  },
  seatCode: {
    type: String,
    required: true
  },
  ticketCode: {
    type: String,
    required: true,
    unique: true, // Mã vé hiển thị (VD: 8 ký tự)
    index: true
  },
  qrChecksum: {
    type: String,
    required: true,
    index: true // Chuỗi hash để xác thực QR
  },
  status: {
    type: String,
    enum: ['VALID', 'USED', 'VOID'],
    default: 'VALID',
    index: true
  },
  issuedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  usedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Chặn bán trùng vé: 1 ghế trong 1 suất chỉ có 1 vé VALID
ticketSchema.index({ showtimeId: 1, seatCode: 1 }, { unique: true });

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
