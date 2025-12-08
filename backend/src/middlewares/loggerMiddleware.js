/**
 * Logger Middleware với Correlation ID
 * Mỗi request có một ID duy nhất để trace qua các service/logs
 */
const crypto = require('crypto');

// Tạo correlation ID cho mỗi request
const correlationMiddleware = (req, res, next) => {
  // Lấy correlation ID từ header nếu có (cho distributed tracing)
  // Hoặc tạo mới nếu không có
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();

  // Gắn vào request object
  req.correlationId = correlationId;

  // Gắn vào response header để client có thể trace
  res.setHeader('x-correlation-id', correlationId);

  next();
};

// Request logger - Log mọi request
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request info
  console.log(JSON.stringify({
    type: 'REQUEST',
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || null
  }));

  // Hook vào response để log khi hoàn thành
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - startTime;

    console.log(JSON.stringify({
      type: 'RESPONSE',
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || null
    }));

    return originalSend.call(this, body);
  };

  next();
};

// Error logger - Log chi tiết lỗi
const errorLogger = (err, req, res, next) => {
  console.error(JSON.stringify({
    type: 'ERROR',
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId,
    method: req.method,
    path: req.originalUrl,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      statusCode: err.statusCode || 500
    },
    userId: req.user?.id || null
  }));

  next(err);
};

module.exports = {
  correlationMiddleware,
  requestLogger,
  errorLogger
};
