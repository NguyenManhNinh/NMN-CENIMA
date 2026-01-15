const Movie = require('../models/Movie');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Lấy danh sách phim (có thể lọc, phân trang)
exports.getAllMovies = catchAsync(async (req, res, next) => {
  const { status, genre, country, year, sortBy, limit = 50, page = 1 } = req.query;

  // Build filter query
  const query = {};

  // Filter by status (NOW, COMING, STOP)
  if (status) {
    query.status = status.toUpperCase();
  }

  // Filter by genre (slug or ObjectId)
  if (genre) {
    query.genres = genre;
  }

  // Filter by country
  if (country) {
    query.country = country;
  }

  // Filter by year (extract from releaseDate)
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
    query.releaseDate = { $gte: startDate, $lte: endDate };
  }

  // Sorting options - Ưu tiên menuPriority (admin ghim) rồi fallback
  let sort = { releaseDate: -1 }; // default

  // Nếu filter theo status -> sort cho dropdown menu
  if (status && !sortBy) {
    if (status.toUpperCase() === 'NOW') {
      // NOW: menuPriority desc -> createdAt desc (phim mới thêm lên đầu)
      sort = { menuPriority: -1, createdAt: -1 };
    } else if (status.toUpperCase() === 'COMING') {
      // COMING: menuPriority desc -> createdAt desc (phim mới thêm lên đầu)
      sort = { menuPriority: -1, createdAt: -1 };
    }
  }

  // Nếu có sortBy param, override (cho trang danh sách phim đầy đủ)
  if (sortBy === 'views') sort = { viewCount: -1 };
  if (sortBy === 'rating') sort = { rating: -1, ratingCount: -1 };
  if (sortBy === 'newest') sort = { releaseDate: -1 };
  if (sortBy === 'priority') sort = { menuPriority: -1, createdAt: -1 };

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const movies = await Movie.find(query)
    .populate('director', 'name photoUrl')
    .populate('actors', 'name photoUrl')
    .populate('genres', 'name slug category')
    .limit(parseInt(limit))
    .skip(skip)
    .sort(sort);

  const total = await Movie.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: movies.length,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    data: {
      movies
    }
  });
});

// Lấy danh sách quốc gia unique từ database
exports.getCountries = catchAsync(async (req, res, next) => {
  const countries = await Movie.distinct('country');

  // Lọc bỏ null/undefined và sắp xếp theo alphabet
  const filteredCountries = countries
    .filter(c => c && c.trim())
    .sort((a, b) => a.localeCompare(b, 'vi'));

  res.status(200).json({
    status: 'success',
    results: filteredCountries.length,
    data: {
      countries: filteredCountries
    }
  });
});

// Lấy danh sách năm phát hành unique từ database
exports.getYears = catchAsync(async (req, res, next) => {
  // Aggregation để extract năm từ releaseDate
  const yearsResult = await Movie.aggregate([
    {
      $match: { releaseDate: { $exists: true, $ne: null } }
    },
    {
      $group: {
        _id: { $year: '$releaseDate' }
      }
    },
    {
      $sort: { _id: -1 } // Sắp xếp giảm dần (năm mới nhất trước)
    }
  ]);

  const years = yearsResult.map(item => item._id.toString());

  res.status(200).json({
    status: 'success',
    results: years.length,
    data: {
      years
    }
  });
});

// Lấy chi tiết phim (theo ID hoặc Slug)
exports.getMovie = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Kiểm tra xem param là ObjectId hay slug
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  const query = isObjectId
    ? { _id: id }
    : { slug: id };

  const movie = await Movie.findOne(query)
    .populate('director', 'name photoUrl slug')
    .populate('actors', 'name photoUrl slug')
    .populate('genres', 'name slug category');

  if (!movie) {
    return next(new AppError('Không tìm thấy phim!', 404));
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

// Đánh giá phim (User - Mỗi user chỉ được đánh giá 1 lần)
exports.rateMovie = catchAsync(async (req, res, next) => {
  let { rating } = req.body;
  const userId = req.user._id; // Lấy user ID từ middleware auth

  // Validate rating: phải là số và trong khoảng 1-10
  rating = Number(rating);
  if (isNaN(rating) || rating < 1 || rating > 10) {
    return next(new AppError('Vui lòng đánh giá từ 1 đến 10!', 400));
  }

  // Giới hạn tối đa 10 sao (phòng trường hợp bypass)
  rating = Math.min(10, Math.max(1, rating));

  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    return next(new AppError('Không tìm thấy phim với ID này!', 404));
  }

  // Kiểm tra user đã đánh giá phim này chưa
  if (movie.ratedBy && movie.ratedBy.includes(userId)) {
    return next(new AppError('Bạn đã bình chọn cho phim này rồi!', 400));
  }

  // Calculate new average rating
  // newAvg = (oldAvg * oldCount + newRating) / (oldCount + 1)
  const oldRating = movie.rating || 0;
  const oldCount = movie.ratingCount || 0;
  const newCount = oldCount + 1;
  let newRating = ((oldRating * oldCount) + rating) / newCount;

  // Đảm bảo rating không vượt quá 10 và làm tròn 1 chữ số thập phân
  newRating = Math.min(10, Math.round(newRating * 10) / 10);

  // Update movie with new rating and add user to ratedBy list
  const updatedMovie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      rating: newRating,
      ratingCount: newCount,
      $addToSet: { ratedBy: userId } // Thêm user vào danh sách đã đánh giá
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Đánh giá thành công!',
    data: {
      rating: updatedMovie.rating,
      ratingCount: updatedMovie.ratingCount,
      userRating: rating
    }
  });
});

// Tăng lượt xem phim (gọi khi user vào trang chi tiết phim)
exports.incrementViewCount = catchAsync(async (req, res, next) => {
  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  );

  if (!movie) {
    return next(new AppError('Không tìm thấy phim với ID này!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      viewCount: movie.viewCount
    }
  });
});

// Toggle Like phim (User - Mỗi user chỉ được like 1 lần, click lại sẽ unlike)
exports.toggleLike = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const movieId = req.params.id;

  const movie = await Movie.findById(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim với ID này!', 404));
  }

  // Kiểm tra user đã like chưa
  const hasLiked = movie.likedBy && movie.likedBy.includes(userId);

  let updatedMovie;
  if (hasLiked) {
    // UNLIKE: Xóa user khỏi likedBy và giảm likeCount
    updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      {
        $pull: { likedBy: userId },
        $inc: { likeCount: -1 }
      },
      { new: true }
    );
    // Đảm bảo likeCount không âm
    if (updatedMovie.likeCount < 0) {
      await Movie.findByIdAndUpdate(movieId, { likeCount: 0 });
      updatedMovie.likeCount = 0;
    }
  } else {
    // LIKE: Thêm user vào likedBy và tăng likeCount
    updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      {
        $addToSet: { likedBy: userId },
        $inc: { likeCount: 1 }
      },
      { new: true }
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      liked: !hasLiked,
      likeCount: updatedMovie.likeCount
    }
  });
});

// Kiểm tra trạng thái like của user hiện tại
exports.getLikeStatus = catchAsync(async (req, res, next) => {
  const movieId = req.params.id;

  // Nếu không đăng nhập, trả về liked: false
  if (!req.user) {
    return res.status(200).json({
      status: 'success',
      data: { liked: false }
    });
  }

  const userId = req.user._id;
  const movie = await Movie.findById(movieId).select('likedBy');

  if (!movie) {
    return next(new AppError('Không tìm thấy phim với ID này!', 404));
  }

  const liked = movie.likedBy && movie.likedBy.includes(userId);

  res.status(200).json({
    status: 'success',
    data: { liked }
  });
});
