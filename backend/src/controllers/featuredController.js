const mongoose = require('mongoose');
const FeaturedArticle = require('../models/FeaturedArticle');
const redisService = require('../services/redisService');

/**
 * Controller: FeaturedArticle
 * Quản lý bài viết "Phim Hay Tháng"
 */

/**
 * GET /api/v1/featured
 * Lấy danh sách bài viết (có phân trang)
 */
const getFeaturedArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = { status: 'published' };

    const total = await FeaturedArticle.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const articles = await FeaturedArticle.find(query)
      .select('title slug thumbnail excerpt viewCount likeCount createdAt')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: articles,
      total,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách bài viết'
    });
  }
};

/**
 * GET /api/v1/featured/:slug
 * Lấy chi tiết bài viết theo slug
 */
const getFeaturedArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await FeaturedArticle.findOne({ slug, status: 'published' });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết bài viết:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết bài viết'
    });
  }
};

/**
 * POST /api/v1/featured/:id/view
 * Tăng lượt xem bài viết (24h cooldown per user/IP)
 */
const incrementView = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy viewer identifier: userId hoặc IP
    const viewerId = req.user?._id?.toString() || req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    const viewKey = `featured_view:${id}:${viewerId}`;

    // Check Redis cooldown (24h)
    let shouldIncrement = true;

    if (redisService.isReady()) {
      try {
        const redis = redisService.getClient();
        const exists = await redis.get(viewKey);
        if (!exists) {
          // Chưa view trong 24h - set key với TTL 86400 seconds (24h)
          await redis.setex(viewKey, 86400, '1');
        } else {
          // Đã view trong 24h - không tăng count
          shouldIncrement = false;
        }
      } catch (err) {
        console.warn('[ViewCount] Redis error, falling back to no cooldown:', err.message);
      }
    }

    let article;
    if (shouldIncrement) {
      article = await FeaturedArticle.findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } },
        { new: true }
      );
    } else {
      article = await FeaturedArticle.findById(id);
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    res.status(200).json({
      success: true,
      viewCount: article.viewCount,
      incremented: shouldIncrement
    });
  } catch (error) {
    console.error('Lỗi khi tăng lượt xem:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * POST /api/v1/featured/:id/like
 * Toggle like bài viết (yêu cầu đăng nhập)
 */
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID bài viết không hợp lệ'
      });
    }

    const article = await FeaturedArticle.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const likedIndex = article.likedBy.indexOf(userId);
    let liked = false;

    if (likedIndex === -1) {
      // Chưa like → thêm like
      article.likedBy.push(userId);
      article.likeCount = article.likedBy.length;
      liked = true;
    } else {
      // Đã like → bỏ like
      article.likedBy.splice(likedIndex, 1);
      article.likeCount = article.likedBy.length;
      liked = false;
    }

    await article.save();

    res.status(200).json({
      success: true,
      liked,
      likeCount: article.likeCount
    });
  } catch (error) {
    console.error('Lỗi khi toggle like:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// ============ ADMIN ENDPOINTS ============

/**
 * POST /api/v1/featured (Admin)
 * Tạo bài viết mới
 */
const createFeaturedArticle = async (req, res) => {
  try {
    const { title, thumbnail, excerpt, content, author, status } = req.body;

    const article = await FeaturedArticle.create({
      title,
      thumbnail,
      excerpt,
      content,
      author,
      status: status || 'published'
    });

    res.status(201).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Lỗi khi tạo bài viết:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo bài viết'
    });
  }
};

/**
 * PUT /api/v1/featured/:id (Admin)
 * Cập nhật bài viết
 */
const updateFeaturedArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const article = await FeaturedArticle.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật bài viết:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật bài viết'
    });
  }
};

/**
 * DELETE /api/v1/featured/:id (Admin)
 * Xóa bài viết
 */
const deleteFeaturedArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await FeaturedArticle.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa bài viết thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa bài viết:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa bài viết'
    });
  }
};

/**
 * GET /api/v1/featured/admin/all (Admin)
 * Lấy tất cả bài viết (bao gồm draft)
 */
const getAllFeaturedArticlesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const total = await FeaturedArticle.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const articles = await FeaturedArticle.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: articles,
      total,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  getFeaturedArticles,
  getFeaturedArticleBySlug,
  incrementView,
  toggleLike,
  createFeaturedArticle,
  updateFeaturedArticle,
  deleteFeaturedArticle,
  getAllFeaturedArticlesAdmin
};
