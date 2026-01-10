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

module.exports = {
  getGenres,
  getGenreBySlug,
  getMoviesByGenre,
  createGenre,
  updateGenre,
  deleteGenre,
  getCategories,
  getCountries,
  getYears
};
