/**
 * Cache Middleware - Enterprise API Response Caching
 * Cache các API response tĩnh để giảm tải database
 */
const redisService = require('../services/redisService');

/**
 * Middleware cache API response
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 phút)
 * @param {Function} keyGenerator - Custom key generator function
 */
const cacheResponse = (ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Chỉ cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Không cache nếu user đã đăng nhập (dữ liệu cá nhân)
    if (req.user) {
      return next();
    }

    // Không cache nếu Redis không sẵn sàng
    if (!redisService.isReady()) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `cache:${req.originalUrl}`;

    try {
      // Check cache
      const cachedData = await redisService.get(cacheKey);

      if (cachedData) {
        // Cache HIT
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-TTL', ttl.toString());
        return res.json(cachedData);
      }

      // Cache MISS - Override res.json để cache response
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        // Chỉ cache success responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await redisService.set(cacheKey, data, ttl);
        }
        res.set('X-Cache', 'MISS');
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error('Cache Middleware Error:', err.message);
      next();
    }
  };
};

/**
 * Xóa cache khi data thay đổi (dùng trong controllers)
 * @param {string} pattern - Cache key pattern
 */
const invalidateCache = async (pattern) => {
  try {
    await redisService.del(pattern);
    console.log(`🗑️ Cache invalidated: ${pattern}`);
  } catch (err) {
    console.error('Cache Invalidate Error:', err.message);
  }
};

/**
 * Cache keys cho các endpoints
 */
const CACHE_KEYS = {
  MOVIES: 'cache:/api/v1/movies*',
  CINEMAS: 'cache:/api/v1/cinemas*',
  SHOWTIMES: 'cache:/api/v1/showtimes*',
  COMBOS: 'cache:/api/v1/combos*',
  FAQS: 'cache:/api/v1/faqs*'
};

/**
 * TTL presets (seconds)
 */
const CACHE_TTL = {
  SHORT: 60,        // 1 phút - Showtimes, availability
  MEDIUM: 300,      // 5 phút - Movies list, cinemas
  LONG: 1800,       // 30 phút - FAQs, combos
  VERY_LONG: 3600   // 1 giờ - Static content
};

module.exports = {
  cacheResponse,
  invalidateCache,
  CACHE_KEYS,
  CACHE_TTL
};
