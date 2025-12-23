# CHƯƠNG [X]: THIẾT KẾ VÀ TRIỂN KHAI HỆ THỐNG BACKEND

## 1. Kiến trúc Hệ thống và Công nghệ

### 1.1. Tổng quan Kiến trúc

Hệ thống backend được xây dựng theo kiến trúc **RESTful API**, sử dụng **Node.js** và **Express.js** làm nền tảng chính. Hệ thống được thiết kế theo mô hình phân lớp (Layered Architecture) để đảm bảo tính tách biệt, dễ bảo trì và mở rộng.

**Kiến trúc Defense-in-Depth (Enterprise):**

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Cloudflare │────▶│    Nginx    │────▶│  PM2 Cluster │────▶│  MongoDB   │
│   (CDN/WAF) │     │ Rate Limit  │     │   (4 cores)  │     │   Atlas    │
└─────────────┘     └─────────────┘     └──────┬───────┘     └────────────┘
                                               │
                                        ┌──────▼───────┐
                                        │    Redis     │
                                        │ (Cache/Rate) │
                                        └──────────────┘
```

- **Presentation Layer (API Routes)**: Tiếp nhận request từ Client (Web/Mobile), thực hiện validate dữ liệu đầu vào.
- **Business Logic Layer (Controllers & Services)**: Xử lý nghiệp vụ chính (đặt vé, thanh toán, giữ ghế...).
- **Data Access Layer (Models)**: Tương tác trực tiếp với cơ sở dữ liệu MongoDB thông qua Mongoose ODM.
- **Caching Layer (Redis)**: Cache API responses, rate limiting đồng bộ cluster.

### 1.2. Công nghệ và Thư viện Sử dụng

| Hạng mục | Công nghệ/Thư viện | Mục đích sử dụng |
|----------|-------------------|------------------|
| Runtime Environment | Node.js (v18.x) | Môi trường thực thi JavaScript server-side hiệu năng cao, non-blocking I/O. |
| Web Framework | Express.js (v4.x) | Xây dựng RESTful API, quản lý routing và middleware. |
| Database | MongoDB Atlas (v7.x) | Cơ sở dữ liệu NoSQL, lưu trữ dữ liệu dạng document linh hoạt (JSON-like). |
| Cache | Redis (v7.x) | Caching API responses, rate limiting cluster-safe. |
| ODM | Mongoose (v8.x) | Mô hình hóa dữ liệu (Schema), validate và tương tác với MongoDB. |
| Authentication | JWT (JSON Web Token) | Xác thực người dùng stateless, bảo mật API. |
| Security | bcryptjs, helmet, cors, hpp | Mã hóa mật khẩu, bảo vệ HTTP headers, xử lý CORS, chống HTTP Parameter Pollution. |
| Real-time | Socket.io (v4.x) | Xử lý giao tiếp thời gian thực cho tính năng giữ ghế (Seat Locking). |
| Payment Gateway | VNPay SDK | Tích hợp cổng thanh toán trực tuyến nội địa. |
| AI Integration | Google Gemini API | Tích hợp Chatbot tư vấn phim thông minh với RAG (Retrieval-Augmented Generation). |
| Email Service | Nodemailer | Gửi email xác thực OTP và vé điện tử. |
| Validation | Joi / Express-validator | Kiểm tra tính hợp lệ của dữ liệu đầu vào API. |
| Documentation | Swagger UI | Tự động sinh tài liệu API trực quan. |
| Containerization | Docker + Docker Compose | Đóng gói ứng dụng để triển khai đồng nhất trên mọi môi trường. |
| Process Manager | PM2 (Cluster Mode) | Load balancing, auto-restart, tận dụng đa nhân CPU. |
| Compression | compression | Nén response gzip giảm bandwidth. |

---

## 2. Thiết kế Cơ sở dữ liệu (Database Design)

Hệ thống sử dụng MongoDB với **19 Collections** chính, được tối ưu hóa bằng các Index để tăng tốc độ truy vấn.

### 2.1. Danh sách Collections và Chức năng

| STT | Collection | Mô tả Chức năng | Index Quan trọng |
|-----|------------|-----------------|------------------|
| 1 | users | Lưu trữ thông tin người dùng, phân quyền (Role), điểm thành viên. | email (unique), phone |
| 2 | movies | Lưu trữ thông tin phim, trailer, poster, trạng thái chiếu. | slug (unique), status |
| 3 | cinemas | Quản lý danh sách rạp chiếu phim. | name |
| 4 | rooms | Quản lý phòng chiếu và sơ đồ ghế (Seat Map). | cinemaId |
| 5 | showtimes | Quản lý lịch chiếu phim (Suất chiếu). | (roomId, startAt) (unique) |
| 6 | seat_holds | Lưu trạng thái giữ ghế tạm thời (Real-time). | (showtimeId, seatCode) (unique), expiredAt (TTL) |
| 7 | orders | Lưu trữ đơn hàng đặt vé. | orderNo (unique) |
| 8 | tickets | Lưu trữ vé điện tử đã thanh toán thành công. | ticketCode (unique), qrChecksum |
| 9 | payments | Lưu lịch sử giao dịch thanh toán qua VNPay. | txnRef (unique) |
| 10 | combos | Quản lý danh sách bắp nước (F&B). | status |
| 11 | vouchers | Quản lý mã giảm giá. | code (unique), validTo |
| 12 | reviews | Lưu đánh giá và bình luận của người dùng về phim. | (movieId, userId) (unique) |
| 13 | banners | Quản lý banner quảng cáo trang chủ. | order |
| 14 | articles | Quản lý bài viết tin tức điện ảnh (Blog). | slug (unique) |
| 15 | events | Quản lý sự kiện khuyến mãi. | status, startAt |
| 16 | faqs | Câu hỏi thường gặp. | category, isActive |
| 17 | feedbacks | Góp ý từ khách hàng. | createdAt |
| 18 | chat_sessions | Lưu phiên chat với AI Bot. | userId |
| 19 | chat_messages | Lưu nội dung tin nhắn chat. | sessionId |

### 2.2. Cơ chế TTL Index (Time-To-Live) cho Giữ ghế

Để giải quyết bài toán giữ ghế tạm thời trong 15 phút, hệ thống sử dụng tính năng **TTL Index** của MongoDB trên collection `seat_holds`.

- Trường `expiredAt` được đánh index TTL.
- MongoDB sẽ tự động xóa bản ghi khi thời gian hiện tại vượt qua giá trị `expiredAt`.
- Kết hợp với Socket.io để thông báo real-time cho các client khác khi ghế được nhả ra.

---

## 3. Thiết kế API (API Specifications)

Hệ thống cung cấp RESTful API version 1.0 (`/api/v1`), hỗ trợ đầy đủ các phương thức HTTP chuẩn (GET, POST, PUT, PATCH, DELETE).

### 3.1. Authentication & Authorization

- **Cơ chế**: JWT (JSON Web Token).
- **Flow**: Client gửi credentials -> Server xác thực -> Trả về Access Token (ngắn hạn) và Refresh Token (dài hạn, HTTP-only cookie).
- **RBAC (Role-Based Access Control)**:
  - **User**: Đặt vé, xem lịch sử, đánh giá phim.
  - **Staff**: Quét QR Check-in, xem lịch chiếu.
  - **Manager**: Quản lý phim, suất chiếu, xem báo cáo doanh thu.
  - **Admin**: Quản trị hệ thống, quản lý người dùng, phân quyền.

### 3.2. Thống kê API

| Metric | Số lượng |
|--------|----------|
| **Tổng Modules** | 19 |
| **Tổng Endpoints** | 40+ |
| **Endpoints đã test** | 40/40 (100%) |

### 3.3. Các Nhóm API Chính (Module)

#### Module Xác thực (`/auth`)
- `POST /auth/register`: Đăng ký tài khoản mới (gửi OTP qua email).
- `POST /auth/verify-otp`: Xác thực mã OTP.
- `POST /auth/login`: Đăng nhập lấy Access Token + Refresh Token.
- `POST /auth/refresh`: Làm mới Access Token.
- `GET /auth/google`: Đăng nhập bằng Google OAuth.

#### Module Quản lý Phim & Suất chiếu (`/movies`, `/showtimes`)
- `GET /movies`: Lấy danh sách phim đang/sắp chiếu (có bộ lọc, phân trang).
- `GET /showtimes`: Lấy lịch chiếu theo Phim, Rạp và Ngày.
- **Collision Detection**: Khi tạo suất chiếu mới, hệ thống tự động kiểm tra xung đột thời gian.

#### Module Đặt vé Real-time (`/holds`, `/orders`)
- `POST /holds`: Giữ ghế. Hệ thống kiểm tra ghế trống -> Tạo bản ghi seat_holds -> Phát sự kiện Socket.io.
- `POST /orders`: Tạo đơn hàng, trả về URL thanh toán VNPay.

#### Module Thanh toán VNPay (`/payments`)
- `GET /payments/vnpay_ipn`: Endpoint nhận thông báo kết quả giao dịch từ VNPay (Server-to-Server).
- `GET /payments/vnpay_return`: Redirect user về frontend sau thanh toán.
- **Security**: Xác thực chữ ký số (HMAC SHA512) từ VNPay.

#### Module Quản trị (`/users`, `/reports`)
- `GET /users`: Lấy danh sách users (Admin).
- `PATCH /users/:id`: Cập nhật thông tin user (Admin).
- `DELETE /users/:id`: Xóa user (Admin).
- `GET /reports/revenue`: Báo cáo doanh thu.
- `GET /reports/top-movies`: Top phim bán chạy.

#### Module AI Chatbot (`/chatbot`)
- `POST /chatbot/message`: Gửi tin nhắn và nhận phản hồi từ AI.
- **RAG Pattern**: Dữ liệu từ MongoDB được inject vào prompt Gemini.
- **Anti-Hallucination**: System prompt nghiêm ngặt, chỉ trả lời dựa trên dữ liệu thực.

---

## 4. Bảo mật Hệ thống (Security Implementation)

### 4.1. Các lớp bảo mật

| Lớp | Công nghệ | Mô tả |
|-----|-----------|-------|
| **Layer 1** | Cloudflare | CDN, WAF, DDoS Protection, ẩn IP thật. |
| **Layer 2** | Nginx | Reverse Proxy, Rate Limiting cứng (10 req/s). |
| **Layer 3** | Express Rate Limit + Redis | Rate Limiting đồng bộ cluster (100 req/phút). |
| **Layer 4** | Helmet + HPP | Security Headers, chống HTTP Parameter Pollution. |

### 4.2. Chi tiết biện pháp bảo mật

| Biện pháp | Mô tả |
|-----------|-------|
| **Password Hashing** | bcryptjs với Salt rounds = 12. |
| **Rate Limiting** | 100 req/phút/IP (global), 10 req/phút (auth), 5 req/phút (payment). |
| **Redis Store** | Rate limit đồng bộ across PM2 cluster instances. |
| **NoSQL Injection** | express-mongo-sanitize loại bỏ ký tự đặc biệt ($). |
| **XSS Protection** | xss-clean và helmet. |
| **Response Compression** | gzip compression giảm 70% bandwidth. |
| **Secure Payment** | HMAC SHA512 checksum cho mọi giao dịch VNPay. |

---

## 5. Kết quả Kiểm thử API

### 5.1. Tổng kết

| Metric | Kết quả |
|--------|---------|
| **Tổng endpoints tested** | 40 |
| **Tổng modules** | 19 |
| **Pass rate** | 100% |
| **Bugs phát hiện** | 5 |
| **Bugs đã fix** | 5 |

### 5.2. Bugs đã phát hiện và sửa

| Bug | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Gemini 404 | Model name sai | Đổi thành `models/gemini-2.5-flash` |
| Chatbot không lấy được Combo | Status case-sensitive | `'active'` → `'ACTIVE'` |
| Feedback/FAQ routes lỗi | Require path sai | `../controllers` → `../../controllers` |
| Admin không sửa được user | Thiếu PATCH route | Thêm updateUser, deleteUser |
| CMS validation error | Field name sai | `imageUrl` → `bannerUrl` |

---

## 6. Kết quả Đạt được

Hệ thống Backend hoạt động ổn định, đáp ứng đầy đủ các yêu cầu chức năng nghiệp vụ của rạp chiếu phim.

| Tiêu chí | Kết quả |
|----------|---------|
| Tốc độ phản hồi API | Trung bình dưới **200ms** |
| Khả năng xử lý đồng thời | Tốt nhờ kiến trúc Non-blocking I/O của Node.js |
| Quy trình triển khai | Tự động hóa và chuẩn hóa bằng **Docker** |
| Tài liệu API | Đầy đủ, trực quan qua **Swagger UI** |
| Enterprise Security | Redis Rate Limiting, PM2 Cluster, Nginx Proxy |
| Số Models | **19/19** Collections |
| Số Controllers | **18** Controllers |
| Số Routes | **19** Route files |
| Số API Endpoints | **40+** endpoints |
| Test Coverage | **100%** (40/40 endpoints) |

---

*Đồ án Tốt nghiệp - Nguyễn Mạnh Ninh (2200571) - Cập nhật: 16/12/2025*
