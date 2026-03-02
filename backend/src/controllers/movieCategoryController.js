const MovieCategory = require('../models/MovieCategory');
const Movie = require('../models/Movie');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Lấy tất cả thể loại phim
 * @route   GET /api/v1/movie-categories
 * @access  Public
 */
const getAllMovieCategories = catchAsync(async (req, res) => {
  const categories = await MovieCategory.find().sort({ name: 1 }).lean();

  // Đếm số phim + lấy tên phim đã gán cho mỗi thể loại
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const movies = await Movie.find({ movieCategories: cat.name }, 'title').lean();
      return {
        ...cat,
        movieCount: movies.length,
        movieNames: movies.map(m => m.title)
      };
    })
  );

  res.status(200).json({
    success: true,
    count: categoriesWithCount.length,
    data: categoriesWithCount
  });
});

/**
 * @desc    Tạo thể loại phim mới + gán cho phim được chọn
 * @route   POST /api/v1/movie-categories
 * @access  Private/Admin
 */
const createMovieCategory = catchAsync(async (req, res) => {
  const { name, movieIds } = req.body;

  // Kiểm tra trùng tên
  const existing = await MovieCategory.findOne({ name: name.trim() });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Thể loại phim đã tồn tại trong hệ thống!'
    });
  }

  // Tạo thể loại mới
  const category = await MovieCategory.create({
    name: name.trim()
  });

  // Gán thể loại cho các phim được chọn
  if (movieIds && movieIds.length > 0) {
    await Movie.updateMany(
      { _id: { $in: movieIds } },
      { $addToSet: { movieCategories: name.trim() } }
    );
  }

  res.status(201).json({
    success: true,
    message: 'Tạo thể loại phim thành công!',
    data: category
  });
});

/**
 * @desc    Cập nhật thể loại phim + cập nhật phim liên quan
 * @route   PUT /api/v1/movie-categories/:id
 * @access  Private/Admin
 */
const updateMovieCategory = catchAsync(async (req, res, next) => {
  const { name, movieIds } = req.body;

  // Tìm thể loại hiện tại
  const oldCategory = await MovieCategory.findById(req.params.id);
  if (!oldCategory) {
    return next(new AppError('Không tìm thấy thể loại!', 404));
  }

  const oldName = oldCategory.name;

  // Kiểm tra trùng tên (trừ chính nó)
  if (name && name.trim() !== oldName) {
    const existing = await MovieCategory.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Tên thể loại đã tồn tại!'
      });
    }
  }

  const newName = name ? name.trim() : oldName;

  // Cập nhật tên thể loại
  oldCategory.name = newName;
  await oldCategory.save();

  // Nếu đổi tên → cập nhật tên trong tất cả phim đã gán
  if (newName !== oldName) {
    await Movie.updateMany(
      { movieCategories: oldName },
      { $set: { 'movieCategories.$': newName } }
    );
  }

  // Nếu có movieIds → cập nhật lại danh sách phim
  if (movieIds !== undefined) {
    // Xóa thể loại này khỏi tất cả phim cũ
    await Movie.updateMany(
      { movieCategories: newName },
      { $pull: { movieCategories: newName } }
    );
    // Gán cho các phim mới được chọn
    if (movieIds.length > 0) {
      await Movie.updateMany(
        { _id: { $in: movieIds } },
        { $addToSet: { movieCategories: newName } }
      );
    }
  }

  res.status(200).json({
    success: true,
    message: 'Cập nhật thể loại thành công!',
    data: oldCategory
  });
});

/**
 * @desc    Xóa thể loại phim + xóa khỏi tất cả phim
 * @route   DELETE /api/v1/movie-categories/:id
 * @access  Private/Admin
 */
const deleteMovieCategory = catchAsync(async (req, res, next) => {
  const category = await MovieCategory.findById(req.params.id);
  if (!category) {
    return next(new AppError('Không tìm thấy thể loại!', 404));
  }

  // Xóa thể loại này khỏi tất cả phim
  await Movie.updateMany(
    { movieCategories: category.name },
    { $pull: { movieCategories: category.name } }
  );

  // Xóa thể loại
  await MovieCategory.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Xóa thể loại thành công!'
  });
});

/**
 * @desc    Lấy danh sách phim đã gán cho 1 thể loại
 * @route   GET /api/v1/movie-categories/:id/movies
 * @access  Public
 */
const getMoviesByCategory = catchAsync(async (req, res, next) => {
  const category = await MovieCategory.findById(req.params.id);
  if (!category) {
    return next(new AppError('Không tìm thấy thể loại!', 404));
  }

  const movies = await Movie.find(
    { movieCategories: category.name },
    '_id title slug posterUrl'
  ).lean();

  res.status(200).json({
    success: true,
    data: movies
  });
});

module.exports = {
  getAllMovieCategories,
  createMovieCategory,
  updateMovieCategory,
  deleteMovieCategory,
  getMoviesByCategory
};
