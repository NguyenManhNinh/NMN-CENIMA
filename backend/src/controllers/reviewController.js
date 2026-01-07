const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Lấy danh sách reviews của phim với sort/filter/pagination
 * GET /movies/:movieId/reviews?sort=newest|helpful|high|low&verified=1&noSpoiler=1&page=1&limit=10
 */
exports.getReviewsByMovie = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;
  const {
    sort = 'newest',
    verified,
    noSpoiler,
    page = 1,
    limit = 10
  } = req.query;

  // Validate ObjectId - nếu không hợp lệ (mock data), trả về empty
  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(200).json({
      status: 'success',
      data: {
        reviews: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          totalPages: 0
        }
      }
    });
  }

  // Build query
  const query = { movie: new mongoose.Types.ObjectId(movieId), status: 'APPROVED' };
  if (verified === '1') query.isVerified = true;
  if (noSpoiler === '1') query.hasSpoiler = false;

  // Sort options
  let sortObj = { createdAt: -1 }; // newest
  if (sort === 'helpful') sortObj = { likesCount: -1, createdAt: -1 };
  if (sort === 'high') sortObj = { rating: -1, createdAt: -1 };
  if (sort === 'low') sortObj = { rating: 1, createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  // Aggregation pipeline for likesCount computed field
  const pipeline = [
    { $match: query },
    { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
    { $sort: sortObj },
    { $skip: skip },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userObj'
      }
    },
    { $unwind: '$userObj' },
    {
      $project: {
        _id: 1,
        rating: 1,
        title: 1,
        content: 1,
        hasSpoiler: 1,
        isVerified: 1,
        likesCount: 1,
        likes: 1,
        createdAt: 1,
        user: {
          _id: '$userObj._id',
          name: '$userObj.name',
          avatar: '$userObj.avatar'
        }
      }
    }
  ];

  const [reviews, total] = await Promise.all([
    Review.aggregate(pipeline),
    Review.countDocuments(query)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    }
  });
});

/**
 * Lấy tóm tắt reviews (avg rating + distribution)
 * GET /movies/:movieId/reviews/summary
 */
exports.getReviewsSummary = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;

  // Validate ObjectId - nếu không hợp lệ (mock data), trả về default empty
  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(200).json({
      status: 'success',
      data: { avgRating: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    });
  }

  const result = await Review.aggregate([
    { $match: { movie: new mongoose.Types.ObjectId(movieId), status: 'APPROVED' } },
    {
      $group: {
        _id: '$movie',
        avgRating: { $avg: '$rating' },
        total: { $sum: 1 },
        star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        avgRating: { $round: ['$avgRating', 1] },
        total: 1,
        distribution: {
          1: '$star1',
          2: '$star2',
          3: '$star3',
          4: '$star4',
          5: '$star5'
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: result[0] || { avgRating: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
  });
});

/**
 * Tạo review mới
 * POST /movies/:movieId/reviews
 */
exports.createReview = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { movieId } = req.params;
  const { rating, title = '', content, hasSpoiler = false } = req.body;

  // Validate content length
  if (!content || content.length < 20) {
    return next(new AppError('Nội dung bình luận phải có ít nhất 20 ký tự', 400));
  }

  // Check if user already reviewed this movie
  const existingReview = await Review.findOne({ movie: movieId, user: userId });
  if (existingReview) {
    return next(new AppError('Bạn đã đánh giá phim này rồi', 400));
  }

  // Check verified (user đã mua vé cho phim này)
  let isVerified = false;
  try {
    // Tìm order đã thanh toán có phim này
    const hasOrder = await Order.findOne({
      user: userId,
      'movieInfo.movieId': movieId,
      status: { $in: ['PAID', 'COMPLETED'] }
    });
    isVerified = !!hasOrder;
  } catch (err) {
    // Nếu không có Order model hoặc lỗi, bỏ qua
    console.log('Verified check skipped:', err.message);
  }

  const review = await Review.create({
    movie: movieId,
    user: userId,
    rating,
    title,
    content,
    hasSpoiler,
    isVerified
  });

  // Populate user info
  await review.populate('user', 'name avatar');

  res.status(201).json({
    status: 'success',
    data: { review }
  });
});

/**
 * Cập nhật review (chỉ owner)
 * PATCH /reviews/:id
 */
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });

  if (!review) {
    return next(new AppError('Không tìm thấy bình luận hoặc bạn không có quyền', 404));
  }

  const { rating, title, content, hasSpoiler } = req.body;

  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (content) {
    if (content.length < 20) {
      return next(new AppError('Nội dung bình luận phải có ít nhất 20 ký tự', 400));
    }
    review.content = content;
  }
  if (hasSpoiler !== undefined) review.hasSpoiler = hasSpoiler;

  await review.save();
  await review.populate('user', 'name avatar');

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

/**
 * Xóa review (owner hoặc admin)
 * DELETE /reviews/:id
 */
exports.deleteReview = catchAsync(async (req, res, next) => {
  const query = { _id: req.params.id };
  if (req.user.role !== 'admin') {
    query.user = req.user._id;
  }

  const review = await Review.findOneAndDelete(query);
  if (!review) {
    return next(new AppError('Không tìm thấy bình luận hoặc bạn không có quyền', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Toggle like review
 * POST /reviews/:id/like
 */
exports.likeReview = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    return next(new AppError('Không tìm thấy bình luận', 404));
  }

  const idx = review.likes.findIndex((u) => String(u) === String(userId));
  if (idx >= 0) {
    review.likes.splice(idx, 1); // Unlike
  } else {
    review.likes.push(userId); // Like
  }

  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      likesCount: review.likes.length,
      liked: idx < 0
    }
  });
});

/**
 * Legacy API compatibility - getAllReviews
 */
exports.getAllReviews = exports.getReviewsByMovie;
