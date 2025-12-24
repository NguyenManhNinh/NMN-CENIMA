const Genre = require('../models/Genre');
const Movie = require('../models/Movie');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Lấy tất cả thể loại
 * @route   GET /api/v1/genres
 * @access  Public
 */
const getGenres = catchAsync(async (req, res) => {
  const { isActive } = req.query;

  const filter = {};
  // Chỉ filter khi có query param và không phải 'all'
  if (isActive && isActive !== 'all') {
    filter.isActive = isActive === 'true';
  }

  const genres = await Genre.find(filter)
    .sort({ order: 1, name: 1 })
    .lean();

  // Đếm số phim cho mỗi thể loại
  const genresWithCount = await Promise.all(
    genres.map(async (genre) => {
      const movieCount = await Movie.countDocuments({
        genres: genre._id,
        status: { $in: ['NOW', 'COMING'] }
      });
      return { ...genre, movieCount };
    })
  );

  res.status(200).json({
    success: true,
    count: genresWithCount.length,
    data: genresWithCount
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

module.exports = {
  getGenres,
  getGenreBySlug,
  getMoviesByGenre,
  createGenre,
  updateGenre,
  deleteGenre
};
