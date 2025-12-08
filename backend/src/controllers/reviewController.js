const Review = require('../models/Review');
const Ticket = require('../models/Ticket');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.movieId) filter = { movieId: req.params.movieId };

  const features = new APIFeatures(Review.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query.populate('userId', 'name avatar');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.movieId) req.body.movieId = req.params.movieId;
  if (!req.body.userId) req.body.userId = req.user.id;

  // 1. Check if user bought ticket for this movie (Optional Logic)
  // Tìm vé của user cho phim này và trạng thái USED (đã xem)
  // Logic này hơi phức tạp vì Ticket -> Showtime -> Movie
  // Để đơn giản cho Demo: Chỉ cần User đã đăng nhập là được review.
  // Hoặc check Ticket tồn tại (không cần USED).

  /*
  // Advanced Check:
  const hasTicket = await Ticket.findOne({
    userId: req.user.id,
    status: { $in: ['VALID', 'USED'] }
  }).populate({
    path: 'showtimeId',
    match: { movieId: req.body.movieId }
  });

  // Do populate match trả về null nếu không khớp, cần check kỹ hơn
  // Tạm thời bỏ qua check vé để dễ test.
  */

  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { review }
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  // Chỉ chủ sở hữu mới được sửa
  const review = await Review.findOne({ _id: req.params.id, userId: req.user.id });

  if (!review) {
    return next(new AppError('No review found or you are not the owner', 404));
  }

  review.rating = req.body.rating || review.rating;
  review.comment = req.body.comment || review.comment;
  await review.save();

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  // Admin hoặc chủ sở hữu
  const query = { _id: req.params.id };
  if (req.user.role !== 'admin') {
    query.userId = req.user.id;
  }

  const review = await Review.findOneAndDelete(query);
  if (!review) {
    return next(new AppError('No review found or permission denied', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
