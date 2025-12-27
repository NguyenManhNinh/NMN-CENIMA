const Cinema = require('../models/Cinema');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Lấy danh sách tất cả rạp
exports.getAllCinemas = catchAsync(async (req, res, next) => {
  const cinemas = await Cinema.find().populate('rooms');

  res.status(200).json({
    status: 'success',
    results: cinemas.length,
    data: {
      cinemas
    }
  });
});

// Lấy thông tin của một rạp
exports.getCinema = catchAsync(async (req, res, next) => {
  const cinema = await Cinema.findById(req.params.id).populate('rooms');

  if (!cinema) {
    return next(new AppError('Không tìm thấy rạp với ID này!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      cinema
    }
  });
});

// Tạo rạp mới (Admin only)
exports.createCinema = catchAsync(async (req, res, next) => {
  const newCinema = await Cinema.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      cinema: newCinema
    }
  });
});

// Cập nhật rạp (Admin only)
exports.updateCinema = catchAsync(async (req, res, next) => {
  const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!cinema) {
    return next(new AppError('Không tìm thấy rạp với ID này!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      cinema
    }
  });
});

// Xóa rạp (Admin only)
exports.deleteCinema = catchAsync(async (req, res, next) => {
  const cinema = await Cinema.findByIdAndDelete(req.params.id);

  if (!cinema) {
    return next(new AppError('Không tìm thấy rạp với ID này!', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Lấy danh sách thành phố (khu vực) có rạp
exports.getCities = catchAsync(async (req, res, next) => {
  const cities = await Cinema.distinct('city');

  res.status(200).json({
    status: 'success',
    results: cities.length,
    data: {
      cities
    }
  });
});
