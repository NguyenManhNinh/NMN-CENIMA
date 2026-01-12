const mongoose = require('mongoose');
const Genre = require('../models/Genre');
const Movie = require('../models/Movie');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Lấy tất cả bài viết/thể loại với filter và pagination
 * @route   GET /api/v1/genres
 * @access  Public
 */
const getGenres = catchAsync(async (req, res) => {
  const {
    isActive,
    category,
    tag,        // Tag thể loại: Hành động, Viễn tưởng...
    country,
    year,
    status,
    sortBy = 'order',
    page = 1,
    limit = 15
  } = req.query;

  // Build filter
  const filter = {};

  if (isActive && isActive !== 'all') {
    filter.isActive = isActive === 'true';
  }
  if (category) {
    filter.category = category;
  }
  if (tag) {
    // Filter bài viết có chứa tag trong mảng tags
    filter.tags = { $in: [tag] };
  }
  if (country) {
    filter.country = country;
  }
  if (year) {
    filter.year = parseInt(year);
  }
  if (status) {
    filter.status = status;
  }

  // Build sort
  let sort = { order: 1, createdAt: -1 };
  switch (sortBy) {
    case 'views':
      sort = { viewCount: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'rating':
    case 'likes':
      sort = { likeCount: -1 };
      break;
    default:
      sort = { order: 1, createdAt: -1 };
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Genre.countDocuments(filter);
  const totalPages = Math.ceil(total / parseInt(limit));

  const genres = await Genre.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    success: true,
    count: genres.length,
    total,
    totalPages,
    currentPage: parseInt(page),
    data: {
      genres
    }
  });
});

/**
 * @desc    Lấy chi tiết thể loại theo slug
 * @route   GET /api/v1/genres/:slug
 * @access  Public
 */
const getGenreBySlug = catchAsync(async (req, res, next) => {
  const genre = await Genre.findOne({ slug: req.params.slug }).lean();

  if (!genre) {
    return next(new AppError('Không tìm thấy thể loại này!', 404));
  }

  // Đếm số phim
  const movieCount = await Movie.countDocuments({
    genres: genre._id,
    status: { $in: ['NOW', 'COMING'] }
  });

  res.status(200).json({
    success: true,
    data: { ...genre, movieCount }
  });
});

/**
 * @desc    Lấy danh sách phim theo thể loại
 * @route   GET /api/v1/genres/:slug/movies
 * @access  Public
 */
const getMoviesByGenre = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 12, status, sort = '-releaseDate' } = req.query;

  const genre = await Genre.findOne({ slug: req.params.slug });
  if (!genre) {
    return next(new AppError('Không tìm thấy thể loại này!', 404));
  }

  // Build filter
  const filter = { genres: genre._id };
  if (status) {
    filter.status = status;
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Movie.countDocuments(filter);

  const movies = await Movie.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    success: true,
    count: movies.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: movies
  });
});

/**
 * @desc    Tạo thể loại mới
 * @route   POST /api/v1/genres
 * @access  Private/Admin
 */
const createGenre = catchAsync(async (req, res) => {
  const genre = await Genre.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Tạo thể loại thành công!',
    data: genre
  });
});

/**
 * @desc    Cập nhật thể loại
 * @route   PUT /api/v1/genres/:id
 * @access  Private/Admin
 */
const updateGenre = catchAsync(async (req, res, next) => {
  const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!genre) {
    return next(new AppError('Không tìm thấy thể loại này!', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Cập nhật thể loại thành công!',
    data: genre
  });
});

/**
 * @desc    Xóa thể loại
 * @route   DELETE /api/v1/genres/:id
 * @access  Private/Admin
 */
const deleteGenre = catchAsync(async (req, res, next) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);

  if (!genre) {
    return next(new AppError('Không tìm thấy thể loại này!', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Xóa thể loại thành công!'
  });
});

/**
 * @desc    Lấy danh sách categories duy nhất cho dropdown
 * @route   GET /api/v1/genres/categories
 * @access  Public
 */
const getCategories = catchAsync(async (req, res) => {
  // Lấy danh sách categories duy nhất từ database
  const categories = await Genre.distinct('category', { isActive: true });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories.sort()
  });
});

/**
 * @desc    Lấy danh sách countries duy nhất cho dropdown
 * @route   GET /api/v1/genres/countries
 * @access  Public
 */
const getCountries = catchAsync(async (req, res) => {
  const countries = await Genre.distinct('country', { isActive: true });

  res.status(200).json({
    success: true,
    count: countries.length,
    data: countries.sort()
  });
});

/**
 * @desc    Lấy danh sách years duy nhất cho dropdown
 * @route   GET /api/v1/genres/years
 * @access  Public
 */
const getYears = catchAsync(async (req, res) => {
  const years = await Genre.distinct('year', { isActive: true });

  res.status(200).json({
    success: true,
    count: years.length,
    data: years.sort((a, b) => b - a) // Sắp xếp năm mới nhất trước
  });
});

/**
 * @desc    Toggle like/unlike cho genre (mỗi user chỉ like 1 lần)
 * @route   POST /api/v1/genres/:id/like
 * @access  Private (phải đăng nhập)
 */
const toggleLike = catchAsync(async (req, res) => {
  console.log('=== TOGGLE LIKE DEBUG ===');
  console.log('Params:', req.params);
  console.log('User:', req.user ? { _id: req.user._id, email: req.user.email } : 'NO USER');
  console.log('Headers Auth:', req.headers.authorization ? 'Present' : 'Missing');

  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ!'
    });
  }

  // Kiểm tra user đã đăng nhập
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập!'
    });
  }

  const userId = req.user._id;

  const genre = await Genre.findById(id);
  if (!genre) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết!'
    });
  }

  // Kiểm tra user đã like chưa
  const hasLiked = genre.likedBy.some(uid => uid.toString() === userId.toString());

  if (hasLiked) {
    // Unlike - xóa userId khỏi likedBy và giảm likeCount
    genre.likedBy = genre.likedBy.filter(id => id.toString() !== userId.toString());
    genre.likeCount = Math.max(0, genre.likeCount - 1);
  } else {
    // Like - thêm userId vào likedBy và tăng likeCount
    genre.likedBy.push(userId);
    genre.likeCount = genre.likeCount + 1;
  }

  await genre.save();

  res.status(200).json({
    success: true,
    liked: !hasLiked,
    likeCount: genre.likeCount,
    message: hasLiked ? 'Đã bỏ thích!' : 'Đã thích!'
  });
});

/**
 * @desc    Kiểm tra trạng thái like của user
 * @route   GET /api/v1/genres/:id/like-status
 * @access  Private (phải đăng nhập)
 */
const getLikeStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const genre = await Genre.findById(id);
  if (!genre) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết!'
    });
  }

  const hasLiked = genre.likedBy.includes(userId);

  res.status(200).json({
    success: true,
    liked: hasLiked,
    likeCount: genre.likeCount
  });
});

/**
 * @desc    Rate genre (đánh giá bài viết)
 * @route   POST /api/v1/genres/:id/rate
 * @access  Private
 */
const rateGenre = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;
  const userId = req.user._id;

  // Validate rating
  if (!rating || rating < 1 || rating > 10) {
    return res.status(400).json({
      success: false,
      message: 'Rating phải từ 1 đến 10!'
    });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ!'
    });
  }

  const genre = await Genre.findById(id);
  if (!genre) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết!'
    });
  }

  // Check if user already rated
  const existingRating = genre.ratedBy.find(
    r => r.user && r.user.toString() === userId.toString()
  );

  if (existingRating) {
    return res.status(400).json({
      success: false,
      message: 'Bạn đã đánh giá bài viết này rồi!'
    });
  }

  // Add new rating
  genre.ratedBy.push({ user: userId, rating: rating });

  // Recalculate average rating
  const totalRatings = genre.ratedBy.length;
  const sumRatings = genre.ratedBy.reduce((sum, r) => sum + (r.rating || 0), 0);
  genre.rating = Math.round((sumRatings / totalRatings) * 10) / 10; // Round to 1 decimal
  genre.ratingCount = totalRatings;

  await genre.save();

  res.status(200).json({
    success: true,
    message: 'Đánh giá thành công!',
    data: {
      rating: genre.rating,
      ratingCount: genre.ratingCount
    }
  });
});

/**
 * @desc    Increment view count cho genre
 * @route   POST /api/v1/genres/:id/view
 * @access  Public
 */
const incrementView = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ!'
    });
  }

  const genre = await Genre.findByIdAndUpdate(
    id,
    { $inc: { viewCount: 1 } },
    { new: true }
  );

  if (!genre) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết!'
    });
  }

  res.status(200).json({
    success: true,
    viewCount: genre.viewCount
  });
});

module.exports = {
  getGenres,
  getGenreBySlug,
  getMoviesByGenre,
  createGenre,
  updateGenre,
  deleteGenre,
  getCategories,
  getCountries,
  getYears,
  toggleLike,
  getLikeStatus,
  rateGenre,
  incrementView
};
