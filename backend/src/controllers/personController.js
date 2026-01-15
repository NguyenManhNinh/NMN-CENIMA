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
  const { page = 1, limit = 12, search, sort = '-viewCount' } = req.query;

  const filter = {
    role: { $in: ['actor', 'both'] },
    isActive: true
  };

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
  const person = await Person.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { viewCount: 1 } }, // Tăng view count
    { new: true }
  ).lean();

  if (!person) {
    return next(new AppError('Không tìm thấy người này!', 404));
  }

  // Lấy phim tham gia
  let movies = [];
  if (person.role === 'actor' || person.role === 'both') {
    const actorMovies = await Movie.find({ actors: person.name })
      .select('title slug posterUrl releaseDate rating')
      .sort('-releaseDate')
      .lean();
    movies = [...movies, ...actorMovies];
  }
  if (person.role === 'director' || person.role === 'both') {
    const directorMovies = await Movie.find({ director: person.name })
      .select('title slug posterUrl releaseDate rating')
      .sort('-releaseDate')
      .lean();
    movies = [...movies, ...directorMovies];
  }

  // Remove duplicates
  const uniqueMovies = movies.filter(
    (movie, index, self) =>
      index === self.findIndex((m) => m._id.toString() === movie._id.toString())
  );

  res.status(200).json({
    success: true,
    data: {
      ...person,
      movies: uniqueMovies
    }
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

module.exports = {
  getActors,
  getDirectors,
  getPersonBySlug,
  getPersons,
  createPerson,
  updatePerson,
  deletePerson
};
