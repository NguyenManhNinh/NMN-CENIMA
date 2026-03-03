const Combo = require('../models/Combo');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllCombos = catchAsync(async (req, res, next) => {
  // Public: chỉ lấy ACTIVE, Admin: lấy hết
  const filter = req.user && ['admin', 'manager'].includes(req.user.role) ? {} : { status: 'ACTIVE' };

  const combos = await Combo.find(filter).populate('movieIds', 'title');

  res.status(200).json({
    status: 'success',
    results: combos.length,
    data: { combos }
  });
});

exports.createCombo = catchAsync(async (req, res, next) => {
  const combo = await Combo.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { combo }
  });
});

exports.updateCombo = catchAsync(async (req, res, next) => {
  console.log('=== UPDATE COMBO ===');
  console.log('ID:', req.params.id);
  console.log('Body:', JSON.stringify(req.body, null, 2));

  const combo = await Combo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('movieIds', 'title');

  console.log('Updated combo:', JSON.stringify(combo, null, 2));

  if (!combo) return next(new AppError('No combo found with that ID', 404));
  res.status(200).json({
    status: 'success',
    data: { combo }
  });
});

exports.deleteCombo = catchAsync(async (req, res, next) => {
  const combo = await Combo.findByIdAndDelete(req.params.id);
  if (!combo) return next(new AppError('No combo found with that ID', 404));
  res.status(204).json({
    status: 'success',
    data: null
  });
});
