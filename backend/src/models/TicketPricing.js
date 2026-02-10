const mongoose = require('mongoose');
// Sub-schema: Tab giá vé
const ticketPricingTabSchema = new mongoose.Schema({
  // Tên hiển thị trên tab (VD: "GIÁ VÉ 2D", "GIÁ VÉ 3D", "NGÀY LỄ")
  name: {
    type: String,
    required: [true, 'Tên tab là bắt buộc'],
    trim: true
  },
  // Slug dùng cho URL hash (VD: "2D-price", "3D-price", "holiday-price")
  // Lưu ý: KHÔNG dùng lowercase để giữ đúng format chữ hoa (2D, 3D)
  slug: {
    type: String,
    required: [true, 'Slug là bắt buộc'],
    trim: true
  },
  // URL ảnh bảng giá (hiển thị toàn bộ nội dung giá vé dạng hình ảnh)
  imageUrl: {
    type: String,
    required: [true, 'URL ảnh bảng giá là bắt buộc']
  },
  // Thứ tự sắp xếp tab (số nhỏ = hiển thị trước)
  sortOrder: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Main schema: Bảng giá vé
const ticketPricingSchema = new mongoose.Schema({
  // Tiêu đề bảng giá
  title: {
    type: String,
    required: [true, 'Tiêu đề bảng giá là bắt buộc'],
    trim: true,
    default: 'Giá Vé rạp NMN Cinema - Hà Nội'
  },
  // Danh sách tab giá vé (phải có ít nhất 1 tab)
  tabs: {
    type: [ticketPricingTabSchema],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Phải có ít nhất 1 tab giá'
    }
  },
  // Ghi chú bổ sung (HTML content)
  notes: {
    type: String,
    default: ''
  },
  // Trạng thái: "active" (hiển thị) hoặc "draft" (ẩn)
  status: {
    type: String,
    enum: ['active', 'draft'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

/**
 * Pre-save Hook: Đảm bảo chỉ có 1 bảng giá active tại mọi thời điểm.
 * Khi lưu bảng giá mới với status = "active",
 * tất cả bảng giá khác sẽ tự động chuyển sang "draft".
 */
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
