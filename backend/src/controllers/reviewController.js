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

  // Build query - only top-level comments (parentId is null)
  const query = {
    movie: new mongoose.Types.ObjectId(movieId),
    status: 'APPROVED',
    parentId: null // Only get root comments, not replies
  };
  if (verified === '1') query.isVerified = true;
  if (noSpoiler === '1') query.hasSpoiler = false;

  // Sort options
  let sortObj = { createdAt: -1 }; // newest
  if (sort === 'helpful') sortObj = { likesCount: -1, createdAt: -1 };
  if (sort === 'high') sortObj = { rating: -1, createdAt: -1 };
  if (sort === 'low') sortObj = { rating: 1, createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  // Aggregation pipeline for reactions
  const pipeline = [
    { $match: query },
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ['$reactions', []] } }
      }
    },
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
        reactions: 1, // Return full reactions array for frontend processing if needed
        createdAt: 1,
        parentId: 1,
        user: {
          _id: '$userObj._id',
          name: '$userObj.name',
          avatar: '$userObj.avatar',
          role: '$userObj.role'
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
 * Tạo review mới (hoặc reply)
 * POST /movies/:movieId/reviews
 */
exports.createReview = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { movieId } = req.params;
  const { rating, title = '', content, hasSpoiler = false, parentId = null } = req.body;

  // Validate content length (10 chars cho reply, 20 cho top-level)
  const minLength = parentId ? 10 : 20;
  if (!content || content.length < minLength) {
    return next(new AppError(`Nội dung phải có ít nhất ${minLength} ký tự`, 400));
  }

  // Nếu là reply, kiểm tra parent comment có tồn tại
  if (parentId) {
    const parentExists = await Review.findById(parentId);
    if (!parentExists) {
      return next(new AppError('Bình luận gốc không tồn tại', 404));
    }
  }

  // Check verified (user đã mua vé cho phim này)
  let isVerified = false;
  try {
    const hasOrder = await Order.findOne({
      user: userId,
      'movieInfo.movieId': movieId,
      status: { $in: ['PAID', 'COMPLETED'] }
    });
    isVerified = !!hasOrder;
  } catch (err) {
    console.log('Verified check skipped:', err.message);
  }

  const review = await Review.create({
    movie: movieId,
    user: userId,
    parentId,
    rating: parentId ? null : rating, // Replies don't have rating
    title: parentId ? '' : title, // Replies don't have title
    content,
    hasSpoiler,
    isVerified
  });

  // Populate user info
  await review.populate('user', 'name avatar role');

  res.status(201).json({
    status: 'success',
    data: { review }
  });
});

/**
 * Lấy replies của một comment
 * GET /reviews/:id/replies
 */
exports.getReplies = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const replies = await Review.find({ parentId: id, status: 'APPROVED' })
    .populate('user', 'name avatar role')
    .sort({ createdAt: 1 });

  res.status(200).json({
    status: 'success',
    data: {
      replies,
      count: replies.length
    }
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
 * React to review (Like, Love, Haha, etc.)
 * POST /reviews/:id/like
 */
exports.likeReview = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { type = 'LIKE' } = req.body; // Default to LIKE if not provided

  const review = await Review.findById(id);
  if (!review) {
    return next(new AppError('Không tìm thấy bình luận', 404));
  }

  // Ensure reactions array exists
  if (!review.reactions) review.reactions = [];

  const idx = review.reactions.findIndex((r) => String(r.user) === String(userId));

  if (idx >= 0) {
    // User already reacted
    if (review.reactions[idx].type === type) {
      // Same reaction -> toggle off (unlike)
      review.reactions.splice(idx, 1);
    } else {
      // Different reaction -> update type
      review.reactions[idx].type = type;
    }
  } else {
    // New reaction
    review.reactions.push({ user: userId, type });
  }

  await review.save();

  // Find user's current reaction (if any)
  const myReaction = review.reactions.find(r => String(r.user) === String(userId));

  res.status(200).json({
    status: 'success',
    data: {
      likesCount: review.reactions.length,
      myReaction: myReaction ? myReaction.type : null,
      reactions: review.reactions
    }
  });
});

/**
 * Legacy API compatibility - getAllReviews
 */
exports.getAllReviews = exports.getReviewsByMovie;
