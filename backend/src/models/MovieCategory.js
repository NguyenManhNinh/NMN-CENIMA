const mongoose = require('mongoose');

/**
 * MovieCategory Model - Thể loại phim (Hành động, Hài, Tình cảm...)
 * Quản lý danh sách thể loại riêng cho phim, không liên quan đến Genre
 */
const movieCategorySchema = new mongoose.Schema(
  {
    // Tên thể loại (VD: Hành động, Hài, Tình cảm)
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên thể loại!'],
      trim: true,
      unique: true
    },
    // Mô tả thể loại
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Index
movieCategorySchema.index({ name: 1 });

const MovieCategory = mongoose.model('MovieCategory', movieCategorySchema);

module.exports = MovieCategory;
