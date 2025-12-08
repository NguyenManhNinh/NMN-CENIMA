const Banner = require('../models/Banner');
const Article = require('../models/Article');
const Event = require('../models/Event');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

// --- BANNERS ---
exports.getAllBanners = catchAsync(async (req, res, next) => {
  // Public: chỉ lấy ACTIVE, Admin: lấy hết
  const filter = req.user && ['admin', 'manager'].includes(req.user.role) ? {} : { status: 'ACTIVE' };

  const banners = await Banner.find(filter).sort({ position: 1, createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: banners.length,
    data: { banners }
  });
});

exports.createBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { banner }
  });
});

exports.updateBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!banner) return next(new AppError('No banner found with that ID', 404));
  res.status(200).json({
    status: 'success',
    data: { banner }
  });
});

exports.deleteBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return next(new AppError('No banner found with that ID', 404));
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// --- ARTICLES (News/Reviews) ---
exports.getAllArticles = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Article.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const articles = await features.query.populate('authorId', 'name');

  res.status(200).json({
    status: 'success',
    results: articles.length,
    data: { articles }
  });
});

exports.getArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findOne({ slug: req.params.slug }).populate('authorId', 'name');
  if (!article) return next(new AppError('No article found with that slug', 404));
  res.status(200).json({
    status: 'success',
    data: { article }
  });
});

exports.createArticle = catchAsync(async (req, res, next) => {
  if (!req.body.authorId) req.body.authorId = req.user.id;
  const article = await Article.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { article }
  });
});

exports.updateArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!article) return next(new AppError('No article found with that ID', 404));
  res.status(200).json({
    status: 'success',
    data: { article }
  });
});

exports.deleteArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  if (!article) return next(new AppError('No article found with that ID', 404));
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// --- EVENTS ---
exports.getAllEvents = catchAsync(async (req, res, next) => {
  const filter = {};
  // Nếu là public user, chỉ hiện sự kiện chưa kết thúc (tùy logic)
  if (!req.user) {
    // filter.status = { $ne: 'ENDED' };
  }

  const features = new APIFeatures(Event.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const events = await features.query;

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: { events }
  });
});

exports.createEvent = catchAsync(async (req, res, next) => {
  const event = await Event.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { event }
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!event) return next(new AppError('No event found with that ID', 404));
  res.status(200).json({
    status: 'success',
    data: { event }
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return next(new AppError('No event found with that ID', 404));
  res.status(204).json({
    status: 'success',
    data: null
  });
});
