const Movie = require('../models/Movie');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Lấy danh sách phim (có thể lọc, phân trang)
exports.getAllMovies = catchAsync(async (req, res, next) => {
  const { status, genre, limit = 50, page = 1 } = req.query;

  // Build filter query
  const query = {};

  // Filter by status (NOW, COMING, STOP)
  if (status) {
    query.status = status.toUpperCase();
  }

  // Filter by genre
  if (genre) {
    query.genres = genre;
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const movies = await Movie.find(query)
    .populate('director', 'name photoUrl')
    .populate('actors', 'name photoUrl')
    .populate('genres', 'name slug')
    .limit(parseInt(limit))
    .skip(skip)
    .sort({ releaseDate: -1 });

  const total = await Movie.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: movies.length,
    total,
    data: {
      movies
    }
  });
});

// Lấy chi tiết phim (theo ID hoặc Slug)
exports.getMovie = catchAsync(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
  // Hoặc tìm theo slug nếu params là slug: const movie = await Movie.findOne({ slug: req.params.slug });

  if (!movie) {
    return next(new AppError('Không tìm thấy phim với ID này!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      movie
    }
  });
});

// Tạo phim mới (Admin only)
exports.createMovie = catchAsync(async (req, res, next) => {
  // Xử lý file upload (Poster)
  if (req.file) {
    req.body.posterUrl = req.file.filename; // Lưu tên file vào DB
  }

  const newMovie = await Movie.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      movie: newMovie
    }
  });
});

// Cập nhật phim (Admin only)
exports.updateMovie = catchAsync(async (req, res, next) => {
  // Xử lý file upload nếu có cập nhật poster
  if (req.file) {
    req.body.posterUrl = req.file.filename;
  }

  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!movie) {
    return next(new AppError('Không tìm thấy phim với ID này!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      movie
    }
  });
});

// Xóa phim (Admin only)
exports.deleteMovie = catchAsync(async (req, res, next) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);

  if (!movie) {
    return next(new AppError('Không tìm thấy phim với ID này!', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
