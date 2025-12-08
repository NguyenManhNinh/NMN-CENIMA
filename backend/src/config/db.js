const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Hàm kết nối đến cơ sở dữ liệu MongoDB
const connectDB = async () => {
  try {
    // Lấy chuỗi kết nối từ biến môi trường
    const conn = await mongoose.connect(process.env.MONGO_URI);

    logger.info(`✅ MongoDB đã kết nối: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
    // Thoát quy trình nếu kết nối thất bại
    process.exit(1);
  }
};

module.exports = connectDB;

