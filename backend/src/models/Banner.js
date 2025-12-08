const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  linkUrl: {
    type: String, // Link khi click vào banner (VD: /movie/lat-mat-7)
    default: ''
  },
  title: {
    type: String,
    trim: true
  },
  position: {
    type: Number,
    default: 0 // Thứ tự hiển thị (0, 1, 2...)
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
