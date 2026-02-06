const crypto = require('crypto');
const Order = require('../models/Order');
const SeatHold = require('../models/SeatHold');
const Showtime = require('../models/Showtime');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const paymentController = require('./paymentController');
const { VIP_SEAT_SURCHARGE } = require('../config/constants');

exports.createOrder = catchAsync(async (req, res, next) => {
  const { showtimeId, seats, combos, voucherCode } = req.body; // seats: ['A1', 'B2']
  const userId = req.user.id;

  console.log('[Order] createOrder called:', { userId, showtimeId, seats: seats?.length });

  // P0-6 Fix: Kiểm tra nếu có order PENDING cho user+showtime → dùng lại
  // Trường hợp user quay lại từ VNPay và muốn thanh toán lại
  const existingPendingOrder = await Order.findOne({
    userId,
    showtimeId,
    status: 'PENDING'
  }).sort({ createdAt: -1 }); // Lấy order mới nhất

  if (existingPendingOrder) {
    console.log('[Order] Found existing PENDING order:', existingPendingOrder.orderNo);

    // Kiểm tra order chưa quá 15 phút (còn valid)
    const orderAge = Date.now() - new Date(existingPendingOrder.createdAt).getTime();
    const MAX_ORDER_AGE = 15 * 60 * 1000; // Gía trị thời gian realtime thật 15 phút 15 * 60 * 1000
    // const MAX_ORDER_AGE = 2 * 60 * 1000; // Gía trị thời gian realtime để test là 2p 2 * 60 * 1000

    // So sánh seats: lấy seatCode từ order và so với seats từ request
    const orderSeatCodes = existingPendingOrder.seats.map(s => s.seatCode).sort();
    const requestSeatCodes = [...seats].sort();
    const seatsMatch = JSON.stringify(orderSeatCodes) === JSON.stringify(requestSeatCodes);

    console.log('[Order] Checking PENDING order:', {
      orderNo: existingPendingOrder.orderNo,
      orderAge: Math.round(orderAge / 1000) + 's',
      maxAge: '900s',
      seatsMatch,
      orderSeats: orderSeatCodes,
      requestSeats: requestSeatCodes
    });

    if (orderAge < MAX_ORDER_AGE && seatsMatch) {
      // Order còn valid → tạo payment URL mới và trả về
      console.log('[Order] ✅ Reusing existing PENDING order:', existingPendingOrder.orderNo);
      const paymentUrl = paymentController.createPaymentUrl(req, existingPendingOrder);

      return res.status(200).json({
        status: 'success',
        data: {
          order: existingPendingOrder,
          paymentUrl,
          reused: true // Flag để client biết đây là order được dùng lại
        }
      });
    } else {
      console.log('[Order] ❌ PENDING order not valid for reuse:', {
        expired: orderAge >= MAX_ORDER_AGE,
        seatsMismatch: !seatsMatch
      });

      // PENDING order quá hạn hoặc ghế khác → mark as EXPIRED and continue to create new order
      if (orderAge >= MAX_ORDER_AGE) {
        // Mark old order as EXPIRED
        console.log('[Order] PENDING order expired - marking as EXPIRED and allowing new order');
        existingPendingOrder.status = 'EXPIRED';
        await existingPendingOrder.save();
        // Continue to create new order below (don't return error)
      }

      // Seats mismatch → mark old order as EXPIRED and continue to create new order
      if (!seatsMatch && orderAge < MAX_ORDER_AGE) {
        console.log('[Order] Seats mismatch - expiring old order and creating new one');
        existingPendingOrder.status = 'EXPIRED';
        await existingPendingOrder.save();
        // Continue to create new order below (don't return error)
      }
    }
  }

  // 1. Kiểm tra Showtime
  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) {
    return next(new AppError('Suất chiếu không tồn tại!', 404));
  }

  // 2. Kiểm tra SeatHold (Quan trọng: Phải còn hiệu lực)
  // Tìm tất cả hold của user cho suất này
  const holds = await SeatHold.find({
    showtimeId,
    userId,
    seatCode: { $in: seats }
  });

  if (holds.length !== seats.length) {
    return next(new AppError('Một số ghế chưa được giữ hoặc đã hết hạn! Vui lòng chọn lại.', 400));
  }

  // Kiểm tra expiredAt của từng hold (Active Check)
  const now = Date.now();
  for (const hold of holds) {
    if (hold.expiredAt < now) {
      // Nếu hết hạn, xóa luôn và báo lỗi
      await SeatHold.findByIdAndDelete(hold._id);
      return next(new AppError(`Ghế ${hold.seatCode} đã hết thời gian giữ!`, 400));
    }
  }

  // 3. Tính tiền (Logic đơn giản hóa cho Demo)
  // Giá vé: BasePrice (cộng thêm nếu VIP - chưa implement VIP logic sâu, tạm lấy base)
  let totalTicketPrice = 0;
  const seatSnapshot = [];

  // Fetch Room to get SeatMap
  const Room = require('../models/Room');
  const room = await Room.findById(showtime.roomId);

  for (const seatCode of seats) {
    // Logic: Find seat type in Room's seatMap
    // seatCode example: 'A1', 'B2'
    let seatType = 'standard';
    let price = showtime.basePrice;

    if (room && room.seatMap) {
      // Parse row and number from seatCode (e.g., A1 -> Row A, Number 1)
      const rowChar = seatCode.charAt(0);
      const seatNum = parseInt(seatCode.slice(1));

      const rowData = room.seatMap.find(r => r.row === rowChar);
      if (rowData) {
        const seatData = rowData.seats.find(s => s.number === seatNum);
        if (seatData) {
          seatType = seatData.type || 'standard';

          // Tính giá theo loại ghế (giống frontend)
          if (seatType === 'vip') {
            price = showtime.basePrice + VIP_SEAT_SURCHARGE; // VIP: +5,000đ
          } else if (seatType === 'couple') {
            // Couple: (basePrice + 10,000đ) x 2 người
            const COUPLE_SEAT_SURCHARGE = require('../config/constants').COUPLE_SEAT_SURCHARGE || 10000;
            price = (showtime.basePrice + COUPLE_SEAT_SURCHARGE) * 2;
          }
        }
      }
    }

    totalTicketPrice += price;
    seatSnapshot.push({
      seatCode,
      price,
      isVip: seatType === 'vip'
    });
  }

  // Tính tiền Combo (Secure: Fetch price from DB)
  let totalComboPrice = 0;
  const comboSnapshot = [];
  if (combos && combos.length > 0) {
    const Combo = require('../models/Combo');
    // combos: [{ id: 'comboId', quantity: 2 }] - Client should send ID
    // Support legacy format for demo if needed, but best to enforce ID

    for (const c of combos) {
      let comboData;
      // Nếu client gửi ID (Best Practice)
      if (c.id || c._id) {
        comboData = await Combo.findById(c.id || c._id);
      } else if (c.name) {
        // Fallback: Tìm theo tên
        comboData = await Combo.findOne({ name: c.name });
      }

      if (comboData) {
        const unitPrice = comboData.price;
        const total = c.quantity * unitPrice;
        totalComboPrice += total;
        comboSnapshot.push({
          name: comboData.name,
          quantity: c.quantity,
          unitPrice: unitPrice,
          totalPrice: total
        });
      }
    }
  }

  let totalAmount = totalTicketPrice + totalComboPrice;
  const subTotal = totalAmount; // Chưa tính discount
  let discount = 0;

  //giữ để lưu vào Order
  let voucherIdToSave = null;
  let userVoucherIdToSave = null;
  let promotionIdToSave = null; // Phase 3: Promotion quota

  // VOUCHER LOGIC - Validate + tính discount (KHÔNG consume)
  if (voucherCode) {
    const Voucher = require('../models/Voucher');

    const codeUpper = voucherCode.toUpperCase();
    const voucher = await Voucher.findOne({ code: codeUpper });

    if (!voucher) {
      return next(new AppError('Mã giảm giá không tồn tại!', 404));
    }

    const nowDate = new Date();
    if (voucher.status !== 'ACTIVE') {
      return next(new AppError('Mã giảm giá không khả dụng!', 400));
    }
    if (nowDate < voucher.validFrom || nowDate > voucher.validTo) {
      return next(new AppError('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực!', 400));
    }

    // Check global usage limit
    if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
      return next(new AppError('Mã giảm giá đã hết lượt sử dụng!', 400));
    }

    // Check if user already used this voucher (PAID orders only)
    const usedOrder = await Order.findOne({
      userId: userId,
      voucherId: voucher._id,
      status: 'PAID'
    });

    if (usedOrder) {
      return next(new AppError('Bạn đã sử dụng mã giảm giá này rồi!', 400));
    }

    // Tính discount
    if (voucher.type === 'FIXED') {
      discount = voucher.value;
    } else if (voucher.type === 'PERCENT') {
      discount = (totalAmount * voucher.value) / 100;
      if (voucher.maxDiscount > 0 && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    }

    // không giảm quá tổng
    if (discount > totalAmount) discount = totalAmount;

    // ✅ lưu voucherId để increment usageCount sau khi payment success
    voucherIdToSave = voucher._id;
  }

  totalAmount -= discount;

  // P0-5 Fix: Atomic consume SeatHolds để tránh double order cùng ghế
  const holdIds = holds.map(h => h._id);
  const consumeResult = await SeatHold.deleteMany({
    _id: { $in: holdIds },
    userId: userId,
    showtimeId: showtimeId
  });

  if (consumeResult.deletedCount !== seats.length) {
    return next(new AppError('Ghế đã được đặt bởi người khác! Vui lòng chọn lại.', 409));
  }

  // 4. Tạo Order PENDING
  // P0-4 Fix: Dùng crypto để tránh trùng orderNo
  const orderNo = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  const newOrder = await Order.create({
    orderNo,
    userId,
    showtimeId,
    seats: seatSnapshot,
    combos: comboSnapshot,

    voucherCode: voucherCode ? voucherCode.toUpperCase() : null,
    voucherId: voucherIdToSave,
    userVoucherId: userVoucherIdToSave,

    subTotal,
    discount,
    totalAmount,

    // ✅ NEW: voucher chưa consume
    voucherConsumed: false,
    voucherConsumeState: 'NONE',
    voucherConsumedAt: null,

    // Phase 3: Promotion quota
    promotionId: promotionIdToSave,
    promotionReserveState: 'NONE',

    status: 'PENDING'
  });

  // 5. Tạo Payment URL (VNPay)
  // Gọi sang paymentController để lấy URL
  const paymentUrl = paymentController.createPaymentUrl(req, newOrder);

  res.status(201).json({
    status: 'success',
    data: {
      order: newOrder,
      paymentUrl
    }
  });
});

// Lấy lịch sử đặt vé của user hiện tại (CN-1.2 / Sitemap A11)
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ userId: req.user.id })
    .sort('-createdAt')
    .populate({
      path: 'showtimeId',
      select: 'startAt movieId roomId',
      populate: [
        { path: 'movieId', select: 'title posterUrl' },
        { path: 'roomId', select: 'name' }
      ]
    });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// Admin: Lấy tất cả đơn hàng
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find()
    .sort('-createdAt')
    .populate('userId', 'name email');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// Admin/User: Lấy chi tiết đơn hàng
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: 'showtimeId',
      select: 'startAt movieId roomId',
      populate: [
        { path: 'movieId', select: 'title posterUrl' },
        { path: 'roomId', select: 'name' }
      ]
    })
    .populate('userId', 'name email');

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng!', 404));
  }

  // Check quyền: Admin hoặc chính chủ mới được xem
  if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && order.userId._id.toString() !== req.user.id) {
    return next(new AppError('Bạn không có quyền xem đơn hàng này!', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Lấy chi tiết đơn hàng theo orderNo (cho PaymentResultPage)
exports.getOrderByOrderNo = catchAsync(async (req, res, next) => {
  const { orderNo } = req.params;

  const order = await Order.findOne({ orderNo })
    .populate({
      path: 'showtimeId',
      select: 'startAt movieId roomId cinemaId',
      populate: [
        { path: 'movieId', select: 'title posterUrl' },
        { path: 'roomId', select: 'name' },
        { path: 'cinemaId', select: 'name' }
      ]
    })
    .populate('userId', 'name email');

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng!', 404));
  }

  // Check quyền: Admin hoặc chính chủ mới được xem
  if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && order.userId._id.toString() !== req.user.id) {
    return next(new AppError('Bạn không có quyền xem đơn hàng này!', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});
