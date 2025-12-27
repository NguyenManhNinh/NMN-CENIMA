const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên rạp!'],
      unique: true,
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Vui lòng nhập địa chỉ rạp!'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Vui lòng nhập thành phố!'],
      trim: true,
      default: 'Hà Nội'
    },
    phone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại hotline!'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'MAINTENANCE'],
      default: 'OPEN'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate rooms
cinemaSchema.virtual('rooms', {
  ref: 'Room',
  foreignField: 'cinemaId',
  localField: '_id'
});

const Cinema = mongoose.model('Cinema', cinemaSchema);

module.exports = Cinema;
