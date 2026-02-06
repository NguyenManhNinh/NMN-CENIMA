const mongoose = require('mongoose');

const seatHoldSchema = new mongoose.Schema({
  showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: [true, 'Phải có suất chiếu!'],
    index: true
  },
  seatCode: {
    type: String,
    required: [true, 'Phải có mã ghế!'],
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Phải có người giữ ghế!']
  },
  groupId: { // Mã nhóm ghế (để giữ nhiều ghế cùng lúc)
    type: String,
    default: null
  },
  // Thời điểm hết hạn (TTL)
  expiredAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000), // thời gian reatltime thật 15 phút
    // default: () => new Date(Date.now() + 2 * 60 * 1000), // thời gian realitme để tét 2 phút
    index: { expires: 0 } // TTL Index: MongoDB tự xóa khi thời gian hiện tại >= expiredAt
  }
}, {
  timestamps: true
});

// RÀNG BUỘC KỸ THUẬT QUAN TRỌNG (THESIS HIGHLIGHT):
// 1. Chống Double Holding: Unique Index đảm bảo 1 ghế trong 1 suất chiếu chỉ được giữ bởi 1 người.
// 2. Tự động nhả ghế: TTL Index giúp MongoDB tự động xóa bản ghi sau 15 phút mà không cần Cron Job.
seatHoldSchema.index({ showtimeId: 1, seatCode: 1 }, { unique: true });

const SeatHold = mongoose.model('SeatHold', seatHoldSchema);
module.exports = SeatHold;
