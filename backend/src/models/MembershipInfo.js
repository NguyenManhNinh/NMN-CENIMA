const mongoose = require('mongoose');

// Sub-schema: Section nội dung thành viên
const membershipSectionSchema = new mongoose.Schema({
  // Tiêu đề section (VD: "Thể lệ và quy định", "Hướng dẫn tích điểm")
  title: {
    type: String,
    required: [true, 'Tiêu đề section là bắt buộc'],
    trim: true
  },
  // Slug dùng cho URL hash (VD: "the-le", "tich-diem")
  slug: {
    type: String,
    required: [true, 'Slug là bắt buộc'],
    trim: true
  },
  // URL ảnh banner minh họa (optional - không phải section nào cũng cần ảnh)
  imageUrl: {
    type: String,
    default: ''
  },
  // Nội dung HTML (bảng quyền lợi, điều kiện, hướng dẫn...)
  content: {
    type: String,
    default: ''
  },
  // Thứ tự sắp xếp section (số nhỏ = hiển thị trước)
  sortOrder: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Main schema: Thông tin thành viên
const membershipInfoSchema = new mongoose.Schema({
  // Tiêu đề trang
  title: {
    type: String,
    required: [true, 'Tiêu đề trang thành viên là bắt buộc'],
    trim: true,
    default: 'Chương trình Thành viên NMN Cinema Membership | Tích điểm và đổi thưởng'
  },
  // Danh sách section nội dung (phải có ít nhất 1 section)
  sections: {
    type: [membershipSectionSchema],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Phải có ít nhất 1 section nội dung'
    }
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
 * Pre-save Hook: Đảm bảo chỉ có 1 trang thành viên active tại mọi thời điểm.
 * Khi lưu trang mới với status = "active",
 * tất cả trang khác sẽ tự động chuyển sang "draft".
 */
membershipInfoSchema.pre('save', async function (next) {
  if (this.status === 'active') {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, status: 'active' },
      { status: 'draft' }
    );
  }
  next();
});

const MembershipInfo = mongoose.model('MembershipInfo', membershipInfoSchema);
module.exports = MembershipInfo;
