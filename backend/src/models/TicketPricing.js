const mongoose = require('mongoose');

/**
 * Model: TicketPricing
 * Mô tả: Bảng giá vé hiển thị cho người dùng
 *
 * Fields:
 * - title: Tiêu đề (VD: "Giá Vé rạp NMN Cinema - Hà Nội")
 * - tabs: Danh sách tab giá (2D, 3D, Ngày lễ)
 * - notes: Ghi chú (HTML content)
 * - status: Trạng thái (active/draft)
 */
const ticketPricingTabSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên tab là bắt buộc'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Slug là bắt buộc'],
    trim: true,
    lowercase: true
  },
  imageUrl: {
    type: String,
    required: [true, 'URL ảnh bảng giá là bắt buộc']
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { _id: false });

const ticketPricingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề bảng giá là bắt buộc'],
    trim: true,
    default: 'Giá Vé rạp NMN Cinema - Hà Nội'
  },
  tabs: {
    type: [ticketPricingTabSchema],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Phải có ít nhất 1 tab giá'
    }
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'draft'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

// Đảm bảo chỉ có 1 bảng giá active
ticketPricingSchema.pre('save', async function (next) {
  if (this.status === 'active') {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, status: 'active' },
      { status: 'draft' }
    );
  }
  next();
});

const TicketPricing = mongoose.model('TicketPricing', ticketPricingSchema);
module.exports = TicketPricing;
