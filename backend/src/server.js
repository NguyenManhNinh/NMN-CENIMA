const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

// Xử lý lỗi đồng bộ chưa được bắt (Uncaught Exception)
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! Đang tắt server...');
  logger.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

dotenv.config();
const app = require('./app');
const connectDB = require('./config/db');

// Kết nối Database
connectDB();

// Khởi động Server
const port = process.env.PORT || 5000;

// Tạo HTTP Server từ Express App
const http = require('http');
const server = http.createServer(app);

// Khởi tạo Socket.io
const socketService = require('./services/socketService');
const io = socketService.init(server);

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  logger.info(`🚀 App đang chạy trên cổng ${port}...`);
});

// Xử lý lỗi bất đồng bộ chưa được bắt (Unhandled Rejection)
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! Đang tắt server...');
  logger.error(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

