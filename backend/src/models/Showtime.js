const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Suất chiếu phải có phim!'],
    index: true // FK
  },
  cinemaId: { // Thêm cinemaId để dễ query
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cinema',
    required: [true, 'Suất chiếu phải thuộc về một rạp!'],
    index: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Suất chiếu phải thuộc về một phòng!'],
    index: true // FK 
  },
  startAt: {
    type: Date,
    required: [true, 'Vui lòng nhập thời gian bắt đầu!']
  },
  endAt: {
    type: Date,
    // Tính toán dựa trên movie.duration + thời gian dọn phòng
    required: [true, 'Vui lòng nhập thời gian kết thúc!']
  },
  basePrice: {
    type: Number,
    required: [true, 'Vui lòng nhập giá vé cơ bản!']
  },
  format: {
    type: String,
    enum: ['2D', '3D', 'IMAX'], // Khớp với Room.type
    default: '2D'
  },
  // Phụ đề hoặc lồng tiếng
  subtitle: {
    type: String,
    enum: ['Phụ đề', 'Lồng tiếng', 'Thuyết minh', ''],
    default: 'Phụ đề'
  },
  // Danh sách ghế hỏng/bảo trì riêng cho suất này
  maintenanceSeats: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'CANCELED'],
    default: 'OPEN'
  }
}, {
  timestamps: true
});

// RÀNG BUỘC KỸ THUẬT QUAN TRỌNG: Chống xung đột suất chiếu
// Đảm bảo không có 2 suất chiếu bắt đầu trong cùng một phòng. (Logic Controller phải check overlap)
showtimeSchema.index({ roomId: 1, startAt: 1 }, { unique: true });

const Showtime = mongoose.model('Showtime', showtimeSchema);
module.exports = Showtime;
