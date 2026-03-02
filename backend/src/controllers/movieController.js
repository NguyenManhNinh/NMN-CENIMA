const Movie = require('../models/Movie');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Proxy lấy thông tin YouTube (avatar kênh, title) - tránh CORS
exports.getYoutubeInfo = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  if (!videoId || videoId.length !== 11) {
    return next(new AppError('Video ID không hợp lệ', 400));
  }

  try {
    // Lấy title + channel từ oEmbed
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const oembed = await oembedRes.json();

    // Lấy avatar kênh từ YouTube page
    let avatar = '';
    try {
      const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await pageRes.text();
      // Tìm channelThumbnail trong InitialPlayerResponse
      const avatarMatch = html.match(/"channelThumbnail":\{"thumbnails":\[\{"url":"([^"]+)"/);
      if (avatarMatch) avatar = avatarMatch[1];
    } catch (e) { /* ignore */ }

    res.status(200).json({
      status: 'success',
      data: {
        title: oembed.title || '',
        channel: oembed.author_name || '',
        avatar
      }
    });
  } catch (err) {
    res.status(200).json({
      status: 'success',
      data: { title: '', channel: '', avatar: '' }
    });
  }
});

// Lấy danh sách phim (có thể lọc, phân trang)
exports.getAllMovies = catchAsync(async (req, res, next) => {
  const { status, genre, country, year, sortBy, search, limit = 50, page = 1 } = req.query;

  // Build filter query
  const query = {};

  // Tìm kiếm theo tên phim (case-insensitive)
  if (search && search.trim()) {
    query.title = { $regex: search.trim(), $options: 'i' };
  }

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
  // Xử lý file upload (Poster) - lưu full URL
  if (req.file) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    req.body.posterUrl = `${baseUrl}/uploads/${req.file.filename}`;
  }

  // Xử lý directorName -> lưu trực tiếp vào director
  if (req.body.directorName) {
    req.body.director = req.body.directorName.trim();
    delete req.body.directorName;
  }

  // Xử lý actorNames (comma-separated) -> lưu mảng string
  if (req.body.actorNames) {
    req.body.actors = req.body.actorNames.split(',').map(n => n.trim()).filter(n => n);
    delete req.body.actorNames;
  }

  let newMovie;
  try {
    newMovie = await Movie.create(req.body);
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('Phim đã tồn tại trong hệ thống!', 400));
    }
    throw err;
  }

  res.status(201).json({
    status: 'success',
    data: {
      movie: newMovie
    }
  });
});

// Cập nhật phim (Admin only)
exports.updateMovie = catchAsync(async (req, res, next) => {
  // Xử lý file upload nếu có cập nhật poster - lưu full URL
  if (req.file) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    req.body.posterUrl = `${baseUrl}/uploads/${req.file.filename}`;
  }

  // Xử lý directorName -> lưu trực tiếp vào director
  if (req.body.directorName !== undefined) {
    req.body.director = req.body.directorName.trim() || null;
    delete req.body.directorName;
  }

  // Xử lý actorNames (comma-separated) -> lưu mảng string
  if (req.body.actorNames !== undefined) {
    req.body.actors = req.body.actorNames
      ? req.body.actorNames.split(',').map(n => n.trim()).filter(n => n)
      : [];
    delete req.body.actorNames;
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
