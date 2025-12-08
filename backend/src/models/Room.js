const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Cinema',
      required: [true, 'Phòng chiếu phải thuộc về một rạp!']
    },
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên phòng (ví dụ: P01)!'],
      trim: true
    },
    type: {
      type: String,
      enum: ['2D', '3D', 'IMAX'],
      default: '2D'
    },
    totalSeats: {
      type: Number,
      default: 0
    },
    // seatMap: Lưu cấu trúc ghế (Matrix). Ví dụ:
    // [
    //   { row: 'A', seats: [{ number: 1, type: 'standard', isBooked: false }, ...] },
    //   ...
    // ]
    seatMap: [
      {
        row: String,
        seats: [
          {
            number: Number,
            type: {
              type: String,
              enum: ['standard', 'vip', 'couple'],
              default: 'standard'
            },
            isBooked: {
              type: Boolean,
              default: false
            }
          }
        ]
      }
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

// Đảm bảo tên phòng là duy nhất trong một rạp
roomSchema.index({ cinemaId: 1, name: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
