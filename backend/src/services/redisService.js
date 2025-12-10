/**
 * Redis Service - Enterprise Cache & Session Management
 * Kết nối Redis cho rate limiting và caching
 */
const Redis = require('ioredis');

let client = null;
let isConnected = false;

/**
 * Khởi tạo kết nối Redis
 */
const initRedis = () => {
  if (client) return client;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    lazyConnect: true,
    // Reconnect strategy
    retryStrategy: (times) => {
      if (times > 10) {
        console.error('❌ Redis: Quá nhiều lần thử kết nối lại');
        return null;
      }
      return Math.min(times * 100, 3000);
    }
  });

  client.on('connect', () => {
    console.log('🔗 Redis: Đang kết nối...');
  });

  client.on('ready', () => {
    isConnected = true;
    console.log('✅ Redis: Đã sẵn sàng');
  });

  client.on('error', (err) => {
    isConnected = false;
    console.error('❌ Redis Error:', err.message);
  });

  client.on('close', () => {
    isConnected = false;
    console.log('🔌 Redis: Đã ngắt kết nối');
  });

  // Connect
  client.connect().catch((err) => {
    console.error('❌ Redis: Không thể kết nối -', err.message);
  });

  return client;
};

/**
 * Lấy client instance
 */
const getClient = () => {
  if (!client) {
    initRedis();
  }
  return client;
};

/**
 * Kiểm tra Redis có sẵn sàng không
 */
const isReady = () => isConnected;

/**
 * Cache helper - GET
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Parsed JSON hoặc null
 */
const get = async (key) => {
  if (!isConnected) return null;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis GET Error:', err.message);
    return null;
  }
};

/**
 * Cache helper - SET
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 phút)
 */
const set = async (key, value, ttl = 300) => {
  if (!isConnected) return false;
  try {
    await client.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('Redis SET Error:', err.message);
    return false;
  }
};

/**
 * Cache helper - DELETE
 * @param {string} pattern - Key pattern (hỗ trợ wildcard *)
 */
const del = async (pattern) => {
  if (!isConnected) return false;
  try {
    if (pattern.includes('*')) {
      // Xóa theo pattern
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } else {
      await client.del(pattern);
    }
    return true;
  } catch (err) {
    console.error('Redis DEL Error:', err.message);
    return false;
  }
};

/**
 * Đóng kết nối Redis
 */
const disconnect = async () => {
  if (client) {
    await client.quit();
    client = null;
    isConnected = false;
  }
};

module.exports = {
  initRedis,
  getClient,
  isReady,
  get,
  set,
  del,
  disconnect
};
