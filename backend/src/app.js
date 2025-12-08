const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const {
  correlationMiddleware,
  requestLogger,
  errorLogger
} = require('./middlewares/loggerMiddleware');
const { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } = require('./config/constants');

// Import routes
const routes = require('./routes/V1');

const app = express();

// 1) GLOBAL MIDDLEWARES

// Correlation ID - Quan trọng: Phải đặt trước tất cả middleware khác
app.use(correlationMiddleware);

// Implement CORS
app.use(cors());
app.options('*', cors());

// Set security HTTP headers
app.use(helmet());

// Development logging với Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request logging với Correlation ID (cho cả dev và prod)
app.use(requestLogger);

// Limit requests from same API
const limiter = rateLimit({
  max: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 1 giờ!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 2) ROUTES
app.use('/api/v1', routes);

// Health check endpoint for Docker
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.send('API đang hoạt động!');
});

// Xử lý các route không tồn tại
app.all('*', (req, res, next) => {
  next(new AppError(`Không tìm thấy ${req.originalUrl} trên máy chủ này!`, 404));
});

// 3) ERROR HANDLING MIDDLEWARE
// Error logger - Log lỗi với correlation ID trước khi xử lý
app.use(errorLogger);
app.use(globalErrorHandler);

module.exports = app;
