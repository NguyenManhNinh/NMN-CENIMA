# 🎬 NMN Cinema Backend API

> Website Quản lý Rạp chiếu phim Tích hợp Thanh toán Trực tuyến và AI Chatbot

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ](#-công-nghệ)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Docker](#-docker)
- [API Documentation](#-api-documentation)
- [Seed Data](#-seed-data)
- [Testing](#-testing)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)

---

## ✨ Tính năng

### Khách hàng
- 🎫 Đặt vé trực tuyến với **ghế realtime** (Socket.io)
- 💳 Thanh toán **VNPay** (QR, ATM, Visa/Mastercard)
- 🤖 Trợ lý ảo **AI Chatbot** (Google Gemini)
- 👤 Đăng ký/Đăng nhập (Email OTP, Google, Facebook)
- ⭐ Đánh giá phim & Bình luận
- 🎁 Chương trình thành viên thân thiết

### Quản trị
- 📊 Dashboard với báo cáo doanh thu
- 🎬 Quản lý Phim, Lịch chiếu, Phòng chiếu
- 📝 CMS (Banner, Bài viết, Sự kiện)
- 🎟️ Quản lý Voucher & Combo
- 👥 Phân quyền RBAC (Admin/Manager/Staff/User)
- 📱 Check-in vé bằng QR Code

---

## 🛠 Công nghệ

| Hạng mục | Công nghệ | Phiên bản |
|----------|-----------|-----------|
| Runtime | Node.js | 18.x LTS |
| Framework | Express.js | 4.21.x |
| Database | MongoDB | 7.x |
| ODM | Mongoose | 8.8.x |
| Auth | JWT + bcrypt | jsonwebtoken 9.x |
| Realtime | Socket.io | 4.8.x |
| Payment | VNPay | Sandbox/Production |
| AI | Google Gemini API | 1.5 Flash |
| Email | Nodemailer | 6.x |
| Docs | Swagger | swagger-jsdoc 6.x |
| Logging | Winston | 3.x |
| Security | helmet, cors, xss-clean | latest |
| Validation | Joi | 17.x |

---

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB >= 7.x (hoặc MongoDB Atlas)
- npm hoặc yarn
- Docker Desktop (tùy chọn)

### Clone & Install

```bash
# Clone repository
git clone https://github.com/your-repo/datn-cinema.git
cd datn-cinema/backend

# Cài đặt dependencies
npm install
```

---

## ⚙️ Cấu hình

### 1. Tạo file `.env`

```bash
cp .env.example .env
```

### 2. Điền các biến môi trường

```env
# ===== SERVER =====
NODE_ENV=development
PORT=5000
LOG_LEVEL=info

# ===== DATABASE =====
MONGO_URI=mongodb://localhost:27017/datn-cinema

# ===== JWT =====
JWT_SECRET=your-super-secret-key-at-least-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# ===== EMAIL (Gmail App Password) =====
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=NMN Cinema <noreply@nmncinema.com>

# ===== VNPAY =====
VNPAY_TMN_CODE=your-tmn-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/result

# ===== GOOGLE OAUTH =====
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# ===== AI CHATBOT =====
GEMINI_API_KEY=your-gemini-api-key

# ===== FRONTEND =====
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 Chạy ứng dụng

### Development (với hot-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

---

## 🐳 Docker

### Build & Run

```bash
# Build và chạy với Docker Compose
docker-compose up -d --build

# Chạy (không rebuild)
docker-compose up -d

# Xem logs
docker-compose logs -f backend

# Dừng
docker-compose down

# Dừng và xóa volumes (XÓA DATA!)
docker-compose down -v
```

### Services

| Service | Port | Mô tả |
|---------|------|-------|
| backend | 5000 | Node.js API |
| mongo | 27017 | MongoDB Database |

### Database Commands

```bash
# Chạy seed script trong Docker
docker exec nmn-cinema-backend node scripts/seed.js

# Truy cập MongoDB shell
docker exec -it nmn-cinema-mongo mongosh

# Xem databases
docker exec -it nmn-cinema-mongo mongosh --eval "show dbs"

# Xem collections
docker exec -it nmn-cinema-mongo mongosh datn-cinema --eval "show collections"

# Đếm documents
docker exec -it nmn-cinema-mongo mongosh datn-cinema --eval "db.movies.countDocuments()"
```

### Debug & Troubleshoot

```bash
# Xem containers đang chạy
docker ps

# Xem logs chi tiết
docker logs nmn-cinema-backend --tail 50

# Vào container bash
docker exec -it nmn-cinema-backend sh

# Kiểm tra port
netstat -ano | findstr :27017

# Restart container
docker-compose restart backend
```

### Cleanup

```bash
# Xóa containers đã stop
docker container prune

# Xóa images không dùng
docker image prune

# Xóa tất cả không dùng
docker system prune -a
```

---

## 📚 API Documentation

Swagger UI có sẵn tại: `http://localhost:5000/api-docs`

### Các nhóm API chính (18 modules, 60+ endpoints)

| Nhóm | Endpoint | Mô tả |
|------|----------|-------|
| Auth | `/api/v1/auth` | Đăng ký, Đăng nhập, OTP, OAuth |
| Users | `/api/v1/users` | Quản lý người dùng |
| Movies | `/api/v1/movies` | CRUD Phim |
| Cinemas | `/api/v1/cinemas` | Quản lý rạp chiếu |
| Rooms | `/api/v1/rooms` | Quản lý phòng chiếu |
| Showtimes | `/api/v1/showtimes` | Lịch chiếu |
| Holds | `/api/v1/holds` | Giữ ghế realtime |
| Orders | `/api/v1/orders` | Đơn hàng |
| Payments | `/api/v1/payments` | VNPay integration |
| Tickets | `/api/v1/tickets` | Vé điện tử |
| Check-in | `/api/v1/checkin` | Quét QR soát vé |
| Combos | `/api/v1/combos` | Bắp nước |
| Vouchers | `/api/v1/vouchers` | Mã giảm giá |
| Reviews | `/api/v1/reviews` | Đánh giá phim |
| Loyalty | `/api/v1/loyalty` | Điểm thành viên |
| CMS | `/api/v1/cms` | Banner, Blog, Events |
| Reports | `/api/v1/reports` | Báo cáo doanh thu |
| Chatbot | `/api/v1/chatbot` | AI Assistant |

---

## 🌱 Seed Data

Tạo dữ liệu demo cho development/testing:

```bash
# Chạy local
node scripts/seed.js

# Chạy trong Docker
docker exec nmn-cinema-backend node scripts/seed.js
```

### Tài khoản mẫu

| Role | Email | Password |
|------|-------|----------|
| Admin | manhninhadmin@nmncinema.com | ninh@123 |
| Manager | manhninhmanager@nmncinema.com | ninh@1234 |
| Staff | manhninhstaff@nmncinema.com | ninh@12345 |
| User | manhninhuser@nmncinema.com | ninh@123456 |

### Dữ liệu được tạo
- 6 Users (đủ 4 roles)
- 1 Cinema + 3 Rooms
- 10 Movies (5 đang chiếu, 5 sắp chiếu)
- 84 Showtimes (7 ngày tới)
- 5 Combos + 3 Vouchers
- 3 Banners + 3 Articles + 3 Events

---

## 💾 Database Backup

### Sao lưu dữ liệu

```bash
# Windows
scripts\backup.bat

# Linux/Mac
./scripts/backup.sh
```

### Khôi phục dữ liệu

```bash
# Windows
scripts\restore.bat nmn_cinema_20251208_093000
```

> ⚠️ **Lưu ý:** Lệnh restore sẽ **XÓA** toàn bộ dữ liệu hiện tại trước khi khôi phục.

---

## 🧪 Testing

```bash
# Chạy unit tests
npm test

# Chạy với watch mode
npm run test:watch
```

---

## 📁 Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/              # Cấu hình (DB, Constants, Swagger)
│   │   ├── db.js            # Kết nối MongoDB
│   │   ├── constants.js     # Hằng số hệ thống
│   │   └── swagger.js       # Swagger configuration
│   ├── controllers/         # 18 controllers xử lý request
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── ...
│   ├── middlewares/         # Middleware
│   │   ├── authMiddleware.js     # JWT verification, RBAC
│   │   ├── errorMiddleware.js    # Global error handler
│   │   ├── loggerMiddleware.js   # Correlation ID
│   │   └── validateMiddleware.js # Input validation
│   ├── models/              # 19 Mongoose schemas
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Showtime.js
│   │   ├── SeatHold.js      # TTL index cho giữ ghế
│   │   ├── Order.js
│   │   ├── Ticket.js
│   │   └── ...
│   ├── routes/V1/           # 19 route files với Swagger docs
│   │   ├── index.js         # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   └── ...
│   ├── services/            # Business logic & external services
│   │   ├── socketService.js      # Socket.io for realtime
│   │   ├── emailService.js       # Nodemailer
│   │   ├── geminiService.js      # AI Chatbot
│   │   ├── googleAuthService.js  # Google OAuth
│   │   └── auditLogService.js    # Activity logging
│   ├── utils/               # Helper functions
│   │   ├── AppError.js      # Custom error class
│   │   ├── catchAsync.js    # Async error wrapper
│   │   ├── apiFeatures.js   # Query builder (filter, sort, paginate)
│   │   └── logger.js        # Winston logger
│   ├── validations/         # Joi validation schemas
│   ├── app.js               # Express app setup
│   └── server.js            # HTTP server + Socket.io
├── scripts/
│   ├── seed.js              # Seed demo data
│   ├── backup.bat           # Database backup (Windows)
│   └── restore.bat          # Database restore (Windows)
├── test/
│   └── integration/         # Jest integration tests
├── public/
│   └── uploads/             # User uploaded files
├── logs/                    # Application logs (Winston)
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── .dockerignore            # Docker ignore rules
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Docker services orchestration
├── jest.config.js           # Jest configuration
├── package.json             # Dependencies & scripts
└── README.md                # This file
```

---

## � Bảo mật

| Tính năng | Triển khai |
|-----------|------------|
| Password Hashing | bcrypt (salt rounds = 12) |
| JWT Token | Access (15m) + Refresh (7d) |
| Rate Limiting | 100 req/phút/IP |
| Security Headers | helmet |
| CORS | cors with whitelist |
| XSS Protection | xss-clean |
| NoSQL Injection | express-mongo-sanitize |
| Input Validation | Joi |

---

## �👨‍💻 Tác giả

**Nguyễn Mạnh Ninh**
- MSSV: 2200571
- Lớp: D101K14
- Đồ án tốt nghiệp 2025

---

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.
