const Person = require('../models/Person');
const Movie = require('../models/Movie');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Lấy danh sách diễn viên
 * @route   GET /api/v1/persons/actors
 * @access  Public
 */
const getActors = catchAsync(async (req, res) => {
  const { page = 1, limit = 12, search, sort = '-viewCount', nationality } = req.query;

  const filter = {
    role: { $in: ['actor', 'both'] },
    isActive: true
  };

  // Filter by nationality
  if (nationality) {
    filter.nationality = nationality;
  }

  // Search by name
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { nameEn: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Person.countDocuments(filter);

  const actors = await Person.find(filter)
    .select('name slug photoUrl shortBio genres viewCount likeCount')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    success: true,
    count: actors.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: actors
  });
});

/**
 * @desc    Lấy danh sách đạo diễn
 * @route   GET /api/v1/persons/directors
 * @access  Public
 */
const getDirectors = catchAsync(async (req, res) => {
  const { page = 1, limit = 12, search, sort = '-viewCount' } = req.query;

  const filter = {
    role: { $in: ['director', 'both'] },
    isActive: true
  };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { nameEn: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Person.countDocuments(filter);

  const directors = await Person.find(filter)
    .select('name slug photoUrl shortBio genres viewCount likeCount')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    success: true,
    count: directors.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: directors
  });
});

/**
 * @desc    Lấy chi tiết người theo slug
 * @route   GET /api/v1/persons/:slug
 * @access  Public
 */
const getPersonBySlug = catchAsync(async (req, res, next) => {
  // Không tự động tăng viewCount ở đây - dùng endpoint riêng POST /:id/view
  const person = await Person.findOne({ slug: req.params.slug }).lean();

  if (!person) {
    return next(new AppError('Không tìm thấy người này!', 404));
  }

  // Trả về person data (filmography đã được lưu trong Person model)
  res.status(200).json({
    success: true,
    data: person
  });
});

/**
 * @desc    Tạo person mới
 * @route   POST /api/v1/persons
 * @access  Private/Admin
 */
const createPerson = catchAsync(async (req, res) => {
  const person = await Person.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Tạo thành công!',
    data: person
  });
});

/**
 * @desc    Cập nhật person
 * @route   PUT /api/v1/persons/:id
 * @access  Private/Admin
 */
const updatePerson = catchAsync(async (req, res, next) => {
  const person = await Person.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!person) {
    return next(new AppError('Không tìm thấy người này!', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Cập nhật thành công!',
    data: person
  });
});

/**
 * @desc    Xóa person
 * @route   DELETE /api/v1/persons/:id
 * @access  Private/Admin
 */
const deletePerson = catchAsync(async (req, res, next) => {
  const person = await Person.findByIdAndDelete(req.params.id);

  if (!person) {
    return next(new AppError('Không tìm thấy người này!', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Xóa thành công!'
  });
});

/**
 * @desc    Lấy tất cả persons
 * @route   GET /api/v1/persons
 * @access  Public
 */
const getPersons = catchAsync(async (req, res) => {
  const { page = 1, limit = 12, role, search, sort = '-viewCount' } = req.query;

  const filter = { isActive: true };

  if (role) {
    if (role === 'actor') {
      filter.role = { $in: ['actor', 'both'] };
    } else if (role === 'director') {
      filter.role = { $in: ['director', 'both'] };
    } else {
      filter.role = role;
    }
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { nameEn: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Person.countDocuments(filter);

  const persons = await Person.find(filter)
    .select('name slug photoUrl shortBio role genres viewCount likeCount')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    success: true,
    count: persons.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: persons
  });
});

/**
 * @desc    Lấy danh sách quốc tịch unique
 * @route   GET /api/v1/persons/nationalities
 * @access  Public
 */
const getNationalities = catchAsync(async (req, res) => {
  const nationalities = await Person.distinct('nationality', {
    role: { $in: ['actor', 'both'] },
    isActive: true,
    nationality: { $ne: null, $ne: '' }
  });

  // Sort và format
  const sortedNationalities = nationalities
    .filter(n => n && n.trim())
    .sort((a, b) => a.localeCompare(b, 'vi'));

  res.status(200).json({
    success: true,
    count: sortedNationalities.length,
    data: sortedNationalities
  });
});

/**
 * @desc    Toggle like/unlike cho person (dùng $inc atomic để tránh lỗi validator)
 * @route   POST /api/v1/persons/:id/like
 * @access  Public
 */
const togglePersonLike = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { action } = req.body; // 'like' hoặc 'unlike'

  // Validate action
  if (!['like', 'unlike'].includes(action)) {
    return next(new AppError('Action không hợp lệ! Sử dụng "like" hoặc "unlike"', 400));
  }

  // Dùng $inc atomic để update, không trigger validator toàn bộ document
  const incValue = action === 'like' ? 1 : -1;

  const person = await Person.findByIdAndUpdate(
    id,
    { $inc: { likeCount: incValue } },
    { new: true, runValidators: false } // Không chạy validator
  );

  if (!person) {
    return next(new AppError('Không tìm thấy người này!', 404));
  }

  // Chặn âm: nếu likeCount < 0 thì set về 0
  if (person.likeCount < 0) {
    await Person.findByIdAndUpdate(id, { likeCount: 0 }, { runValidators: false });
    person.likeCount = 0;
  }

  res.status(200).json({
    success: true,
    data: {
      likeCount: person.likeCount
    }
  });
});

/**
 * @desc    Tăng view count cho person
 * @route   POST /api/v1/persons/:id/view
 * @access  Public
 */
const incrementPersonView = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const person = await Person.findByIdAndUpdate(
    id,
    { $inc: { viewCount: 1 } },
    { new: true, runValidators: false } // Không chạy validator
  );

  if (!person) {
    return next(new AppError('Không tìm thấy người này!', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      viewCount: person.viewCount
    }
  });
});

module.exports = {
  getActors,
  getDirectors,
  getPersonBySlug,
  getPersons,
  createPerson,
  updatePerson,
  deletePerson,
  getNationalities,
  togglePersonLike,
  incrementPersonView
};
