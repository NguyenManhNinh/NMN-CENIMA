/**
 * Rate Limit Middleware - Enterprise Level
 * Sử dụng Redis để đồng bộ rate limiting across PM2 cluster
 */
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisService = require('../services/redisService');

/**
 * Tạo rate limiter với Redis store
 * Fallback về memory store nếu Redis không available
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 phút
    max = 100,            // 100 requests per window
    message = 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.',
    keyPrefix = 'rl:'
  } = options;

  const config = {
    windowMs,
    max,
    message: {
      status: 'fail',
      message
    },
    standardHeaders: true, // `RateLimit-*` headers
    legacyHeaders: false,  // Disable `X-RateLimit-*` headers
    skip: (req) => {
      // Skip rate limit trong development
      if (process.env.NODE_ENV === 'development') return true;
      // Skip rate limit cho health check
      if (req.path === '/api/v1/health') return true;
      return false;
    },
    keyGenerator: (req) => {
      // Dùng X-Forwarded-For nếu có (behind Nginx/Cloudflare)
      return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    }
  };

  // Thêm Redis store nếu Redis sẵn sàng
  const client = redisService.getClient();
  if (client && redisService.isReady()) {
    config.store = new RedisStore({
      sendCommand: (...args) => client.call(...args),
      prefix: keyPrefix
    });
    console.log('✅ Rate Limiter: Sử dụng Redis Store');
  } else {
    console.log('⚠️ Rate Limiter: Sử dụng Memory Store (Redis chưa sẵn sàng)');
  }

  return rateLimit(config);
};

/**
 * Global Rate Limiter - Áp dụng cho tất cả API
 * 100 requests/phút/IP
 */
const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút.',
  keyPrefix: 'rl:global:'
});

/**
 * Auth Rate Limiter - Chặt hơn cho login/register
 * 10 requests/phút/IP (chống brute force)
 */
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 1 phút.',
  keyPrefix: 'rl:auth:'
});

/**
 * Payment Rate Limiter - Rất chặt cho thanh toán
 * 5 requests/phút/IP
 */
const paymentLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Quá nhiều yêu cầu thanh toán, vui lòng thử lại sau.',
  keyPrefix: 'rl:payment:'
});

/**
 * API Heavy Rate Limiter - Cho các API tốn tài nguyên
 * 30 requests/phút/IP
 */
const heavyLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.',
  keyPrefix: 'rl:heavy:'
});

/**
 * Chatbot Rate Limiter - Giới hạn Gemini API calls
 * 20 requests/phút/IP
 */
const chatbotLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Bạn đang gửi tin nhắn quá nhanh, vui lòng chờ một chút.',
  keyPrefix: 'rl:chatbot:'
});

module.exports = {
  createRateLimiter,
  globalLimiter,
  authLimiter,
  paymentLimiter,
  heavyLimiter,
  chatbotLimiter
};
