const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Model: FeaturedArticle
 * Mô tả: Bài viết "Phim Hay Tháng" - giới thiệu phim nổi bật
 *
 * Fields:
 * - title: Tiêu đề bài viết
 * - slug: URL-friendly identifier
 * - thumbnail: Ảnh thumbnail (16:9)
 * - excerpt: Mô tả ngắn (hiển thị trong danh sách)
 * - content: Nội dung chi tiết (HTML)
 * - viewCount: Lượt xem
 * - likeCount: Số lượt thích
 * - likedBy: Danh sách user đã thích
 * - author: Tác giả
 * - status: Trạng thái (draft/published)
 */
const featuredArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề bài viết là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không quá 200 ký tự']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  thumbnail: {
    type: String,
    required: [true, 'Ảnh thumbnail là bắt buộc']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Mô tả ngắn không quá 500 ký tự']
  },
  content: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: '' // YouTube embed URL, e.g. https://www.youtube.com/embed/VIDEO_ID
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Auto-generate slug từ title
featuredArticleSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      locale: 'vi'
    }) + '-' + Date.now().toString(36);
  }
  next();
});

// Index cho tìm kiếm và sắp xếp (slug đã có unique nên không cần index thêm)
featuredArticleSchema.index({ createdAt: -1 });
featuredArticleSchema.index({ viewCount: -1 });
featuredArticleSchema.index({ likeCount: -1 });
featuredArticleSchema.index({ status: 1 });

module.exports = mongoose.model('FeaturedArticle', featuredArticleSchema);
