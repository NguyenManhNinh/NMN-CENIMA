const logger = require('../utils/logger');

let io;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: '*', // Cấu hình CORS cho phép mọi nguồn (hoặc chỉnh lại theo client URL)
        methods: ['GET', 'POST']
      }
    });

    // Namespace cho booking (giữ ghế realtime)
    const bookingNamespace = io.of('/booking');

    bookingNamespace.on('connection', (socket) => {
      logger.info(`🔌 [Socket] Client connected: ${socket.id}`);

      // Tham gia phòng theo showtimeId
      socket.on('joinShowtime', (showtimeId) => {
        socket.join(`showtime:${showtimeId}`);
        logger.info(`📥 [Socket] ${socket.id} joined showtime:${showtimeId}`);
      });

      // Rời phòng
      socket.on('leaveShowtime', (showtimeId) => {
        socket.leave(`showtime:${showtimeId}`);
        logger.info(`📤 [Socket] ${socket.id} left showtime:${showtimeId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`❌ [Socket] Client disconnected: ${socket.id}`);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io chưa được khởi tạo!');
    }
    return io;
  },

  // Broadcast khi ghế được giữ
  emitSeatHeld: (showtimeId, seatCode, userId) => {
    if (!io) return;
    io.of('/booking').to(`showtime:${showtimeId}`).emit('seat:held', {
      seatCode,
      userId,
      timestamp: new Date()
    });
    logger.info(`🪑 [Socket] seat:held - ${seatCode} @ ${showtimeId}`);
  },

  // Broadcast khi ghế được nhả
  emitSeatReleased: (showtimeId, seatCode) => {
    if (!io) return;
    io.of('/booking').to(`showtime:${showtimeId}`).emit('seat:released', {
      seatCode,
      timestamp: new Date()
    });
    logger.info(`🆓 [Socket] seat:released - ${seatCode} @ ${showtimeId}`);
  },

  // Broadcast khi ghế đã bán (sau thanh toán)
  emitSeatSold: (showtimeId, seatCodes) => {
    if (!io) return;
    io.of('/booking').to(`showtime:${showtimeId}`).emit('seat:sold', {
      seatCodes,
      timestamp: new Date()
    });
    logger.info(`💰 [Socket] seat:sold - ${seatCodes.join(', ')} @ ${showtimeId}`);
  }
};

