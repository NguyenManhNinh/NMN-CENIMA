const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const Movie = require('../models/Movie');
const Combo = require('../models/Combo');
const Voucher = require('../models/Voucher');
const Showtime = require('../models/Showtime');
const geminiService = require('../services/geminiService');
const catchAsync = require('../utils/catchAsync');

/**
 * Gửi tin nhắn đến chatbot
 * POST /api/v1/chatbot/message
 */
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { message, sessionId } = req.body;
  const userId = req.user?.id || null;

  if (!message || message.trim() === '') {
    return res.status(400).json({
      status: 'fail',
      message: 'Vui lòng nhập tin nhắn!'
    });
  }

  // Tìm hoặc tạo session
  let session;
  if (sessionId) {
    session = await ChatSession.findById(sessionId);
  }

  if (!session) {
    session = await ChatSession.create({
      userId,
      channel: 'WEB',
      lastActivityAt: new Date()
    });
  } else {
    session.lastActivityAt = new Date();
    await session.save();
  }

  // Lưu tin nhắn người dùng
  await ChatMessage.create({
    sessionId: session._id,
    sender: 'USER',
    message: message.trim()
  });

  // Lấy lịch sử hội thoại (10 tin nhắn gần nhất)
  const history = await ChatMessage.find({ sessionId: session._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const conversationHistory = history.reverse().map(msg => ({
    sender: msg.sender,
    message: msg.message
  }));

  // LẤY CONTEXT THỰC TỪ DATABASE
  const Cinema = require('../models/Cinema');
  const Promotion = require('../models/Promotion');

  // 1. Phim đang chiếu
  const nowShowingMovies = await Movie.find({ status: 'NOW' })
    .select('title ageRating duration genre description')
    .limit(10)
    .lean();

  // 2. Phim sắp chiếu
  const comingSoonMovies = await Movie.find({ status: 'COMING' })
    .select('title releaseDate description')
    .limit(5)
    .lean();

  // 3. Combo F&B đang bán
  const combos = await Combo.find({ status: 'ACTIVE' })
    .select('name description price items')
    .lean();

  // 4. Voucher/Khuyến mãi còn hiệu lực
  const activeVouchers = await Voucher.find({
    status: 'ACTIVE',
    validTo: { $gte: new Date() }
  })
    .select('code value type description')
    .limit(5)
    .lean();

  // 5. Suất chiếu hôm nay và ngày mai
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const upcomingShowtimes = await Showtime.find({
    startAt: { $gte: new Date(), $lt: dayAfterTomorrow },
    status: 'OPEN'
  })
    .populate('movieId', 'title')
    .populate('cinemaId', 'name')
    .populate('roomId', 'name type')
    .select('startAt format basePrice')
    .sort({ startAt: 1 })
    .limit(30)
    .lean();

  // 6. Danh sách rạp
  const cinemas = await Cinema.find({ status: 'ACTIVE' })
    .select('name address phone')
    .lean();

  // 7. Ưu đãi/Khuyến mãi (từ Promotion model)
  const events = await Promotion.find({
    status: 'ACTIVE',
    endAt: { $gte: new Date() }
  })
    .select('title excerpt startAt endAt')
    .limit(5)
    .lean();

  // Gọi Gemini với context đầy đủ
  const botResponse = await geminiService.chat(
    message.trim(),
    conversationHistory.slice(0, -1),
    {
      userName: req.user?.name || null,
      nowShowingMovies,
      comingSoonMovies,
      combos,
      activeVouchers,
      upcomingShowtimes: upcomingShowtimes.map(s => ({
        movie: s.movieId?.title || 'N/A',
        cinema: s.cinemaId?.name || 'N/A',
        room: s.roomId?.name || 'N/A',
        roomType: s.roomId?.type || '2D',
        time: s.startAt,
        format: s.format,
        price: s.basePrice
      })),
      cinemas,
      events
    }
  );

  // Lưu phản hồi của bot
  const botMessage = await ChatMessage.create({
    sessionId: session._id,
    sender: 'BOT',
    message: botResponse.message,
    intent: botResponse.intent
  });

  res.status(200).json({
    status: 'success',
    data: {
      sessionId: session._id,
      message: botResponse.message,
      intent: botResponse.intent,
      timestamp: botMessage.createdAt
    }
  });
});

/**
 * Lấy lịch sử chat của session
 * GET /api/v1/chatbot/history/:sessionId
 */
exports.getHistory = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;

  const messages = await ChatMessage.find({ sessionId })
    .select('sender message intent createdAt')
    .sort({ createdAt: 1 })
    .limit(50);

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: { messages }
  });
});

/**
 * Tạo session mới
 * POST /api/v1/chatbot/session
 */
exports.createSession = catchAsync(async (req, res, next) => {
  const userId = req.user?.id || null;

  const session = await ChatSession.create({
    userId,
    channel: req.body.channel || 'WEB',
    lastActivityAt: new Date()
  });

  // Tin nhắn chào mừng
  const welcomeMessage = await ChatMessage.create({
    sessionId: session._id,
    sender: 'BOT',
    message: 'Xin chào! 🎬 Tôi là trợ lý ảo của NMN Cinema. Tôi có thể giúp bạn:\n\n• Tìm phim đang/sắp chiếu\n• Hướng dẫn đặt vé\n• Thông tin giá vé & combo\n• Chương trình thành viên\n\nBạn cần hỗ trợ gì ạ?',
    intent: 'GREETING'
  });

  res.status(201).json({
    status: 'success',
    data: {
      sessionId: session._id,
      welcomeMessage: welcomeMessage.message
    }
  });
});

/**
 * Quick replies - Các câu hỏi nhanh
 * GET /api/v1/chatbot/quick-replies
 */
exports.getQuickReplies = catchAsync(async (req, res, next) => {
  const quickReplies = [
    { id: 1, text: '🎬 Phim đang chiếu', query: 'Phim gì đang chiếu?' },
    { id: 2, text: '🎫 Cách đặt vé', query: 'Hướng dẫn đặt vé' },
    { id: 3, text: '💰 Giá vé', query: 'Giá vé bao nhiêu?' },
    { id: 4, text: '🍿 Combo', query: 'Có những combo nào?' },
    { id: 5, text: '⭐ Thành viên', query: 'Chương trình thành viên' },
    { id: 6, text: '🎁 Khuyến mãi', query: 'Khuyến mãi hiện tại' }
  ];

  res.status(200).json({
    status: 'success',
    data: { quickReplies }
  });
});
