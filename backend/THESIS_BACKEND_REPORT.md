# CHƯƠNG [X]: THIẾT KẾ VÀ TRIỂN KHAI HỆ THỐNG BACKEND

## 1. Kiến trúc Hệ thống và Công nghệ

### 1.1. Tổng quan Kiến trúc

Hệ thống backend được xây dựng theo kiến trúc **RESTful API**, sử dụng **Node.js** và **Express.js** làm nền tảng chính. Hệ thống được thiết kế theo mô hình phân lớp (Layered Architecture) để đảm bảo tính tách biệt, dễ bảo trì và mở rộng.

- **Presentation Layer (API Routes)**: Tiếp nhận request từ Client (Web/Mobile), thực hiện validate dữ liệu đầu vào.
- **Business Logic Layer (Controllers & Services)**: Xử lý nghiệp vụ chính (đặt vé, thanh toán, giữ ghế...).
- **Data Access Layer (Models)**: Tương tác trực tiếp với cơ sở dữ liệu MongoDB thông qua Mongoose ODM.

### 1.2. Công nghệ và Thư viện Sử dụng

| Hạng mục | Công nghệ/Thư viện | Mục đích sử dụng |
|----------|-------------------|------------------|
| Runtime Environment | Node.js (v18.x) | Môi trường thực thi JavaScript server-side hiệu năng cao, non-blocking I/O. |
| Web Framework | Express.js (v4.x) | Xây dựng RESTful API, quản lý routing và middleware. |
| Database | MongoDB Atlas (v7.x) | Cơ sở dữ liệu NoSQL, lưu trữ dữ liệu dạng document linh hoạt (JSON-like). |
| ODM | Mongoose (v8.x) | Mô hình hóa dữ liệu (Schema), validate và tương tác với MongoDB. |
| Authentication | JWT (JSON Web Token) | Xác thực người dùng stateless, bảo mật API. |
| Security | bcryptjs, helmet, cors | Mã hóa mật khẩu, bảo vệ HTTP headers, xử lý Cross-Origin Resource Sharing. |
| Real-time | Socket.io (v4.x) | Xử lý giao tiếp thời gian thực cho tính năng giữ ghế (Seat Locking). |
| Payment Gateway | VNPay SDK | Tích hợp cổng thanh toán trực tuyến nội địa. |
| AI Integration | Google Gemini API | Tích hợp Chatbot tư vấn phim thông minh. |
| Email Service | Nodemailer | Gửi email xác thực OTP và vé điện tử. |
| Validation | Joi / Express-validator | Kiểm tra tính hợp lệ của dữ liệu đầu vào API. |
| Documentation | Swagger UI | Tự động sinh tài liệu API trực quan. |
| Containerization | Docker | Đóng gói ứng dụng để triển khai đồng nhất trên mọi môi trường. |

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
| 10 | combos | Quản lý danh sách bắp nước (F&B). | - |
| 11 | vouchers | Quản lý mã giảm giá. | code (unique), validTo |
| 12 | reviews | Lưu đánh giá và bình luận của người dùng về phim. | (movieId, userId) (unique) |
| 13 | banners | Quản lý banner quảng cáo trang chủ. | - |
| 14 | articles | Quản lý bài viết tin tức điện ảnh (Blog). | slug (unique) |
| 15 | events | Quản lý sự kiện khuyến mãi. | - |
| 16 | audit_logs | Ghi nhật ký hoạt động hệ thống (Security Audit). | createdAt |
| 17 | chat_sessions | Lưu phiên chat với AI Bot. | userId |
| 18 | chat_messages | Lưu nội dung tin nhắn chat. | sessionId |
| 19 | refresh_tokens | Quản lý token làm mới phiên đăng nhập (Security). | token, userId |

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

### 3.2. Các Nhóm API Chính (Module)

#### Module Quản lý Phim & Suất chiếu (`/movies`, `/showtimes`)

- `GET /movies`: Lấy danh sách phim đang/sắp chiếu (có bộ lọc, phân trang).
- `GET /showtimes`: Lấy lịch chiếu theo Phim, Rạp và Ngày (Logic phức tạp: lọc các suất đã qua giờ, nhóm theo định dạng 2D/3D).
- **Collision Detection**: Khi tạo suất chiếu mới, hệ thống tự động kiểm tra xung đột thời gian với các suất chiếu đã có trong cùng một phòng (roomId).

#### Module Đặt vé Real-time (`/holds`, `/orders`)

- `POST /holds`: Giữ ghế. Hệ thống kiểm tra ghế trống -> Tạo bản ghi seat_holds -> Phát sự kiện Socket.io `seat:held` cho tất cả client đang xem suất chiếu đó.
- `POST /orders`: Tạo đơn hàng ở trạng thái PENDING. Kiểm tra lại trạng thái giữ ghế lần cuối trước khi chuyển sang thanh toán.

#### Module Thanh toán VNPay (`/payments`)

- `POST /payments/vnpay/create`: Tạo URL thanh toán bảo mật (có chữ ký `vnp_SecureHash`).
- `GET /payments/vnpay/ipn`: Endpoint nhận thông báo kết quả giao dịch từ VNPay (Server-to-Server). Đây là "nguồn chân lý" để cập nhật trạng thái đơn hàng.
- **Idempotency**: Kiểm tra `txnRef` để đảm bảo không xử lý trùng lặp một giao dịch nhiều lần.
- **Security**: Xác thực lại chữ ký số (Checksum) từ VNPay gửi về để chống giả mạo request.

#### Module Vé & Check-in (`/tickets`, `/checkin`)

- `GET /tickets/me`: Lấy danh sách vé đã mua của người dùng.
- `POST /checkin/scan`: Dành cho nhân viên soát vé.
  - **Input**: QR Code (chứa TicketCode + Checksum).
  - **Logic**: Xác thực Checksum -> Kiểm tra trạng thái vé (VALID -> USED).
  - Chặn sử dụng lại vé đã check-in.

---

## 4. Biểu đồ Luồng Xử lý (Process Flows)

### 4.1. Luồng Giữ ghế Real-time (Socket.io)

```
Client A chọn ghế -> Gửi request POST /holds
        ↓
Server kiểm tra ghế trong seat_holds và tickets
        ↓
Nếu trống -> Lưu vào DB (TTL 15 phút)
        ↓
Server phát sự kiện Socket seat:held tới Room showtimeId
        ↓
Client B (đang xem cùng suất) nhận sự kiện
        ↓
Cập nhật giao diện ghế thành màu xám (Đang được giữ)
```

### 4.2. Luồng Thanh toán VNPay (IPN)

```
1. Client checkout -> Server tạo Order PENDING -> Trả về URL thanh toán VNPay

2. User thanh toán thành công trên cổng VNPay

3. VNPay gọi API IPN (Background) tới Server

4. Server xử lý:
   - Validate SecureHash
   - Tìm Order theo OrderNo
   - Update Order PENDING -> PAID
   - Tạo vé điện tử (Tickets) vào collection tickets
   - Xóa giữ ghế (SeatHolds)
   - Gửi Email vé tới User
```

---

## 5. Bảo mật Hệ thống (Security Implementation)

Để đảm bảo an toàn dữ liệu và chống tấn công, hệ thống áp dụng các biện pháp:

| Biện pháp | Mô tả |
|-----------|-------|
| **Password Hashing** | Sử dụng bcryptjs với Salt rounds = 12 để mã hóa mật khẩu người dùng. |
| **Rate Limiting** | Giới hạn 100 request/phút/IP để chống tấn công DDoS và Brute-force. |
| **NoSQL Injection Protection** | Sử dụng thư viện express-mongo-sanitize để loại bỏ các ký tự đặc biệt ($) trong input. |
| **XSS Protection** | Sử dụng xss-clean và helmet để thiết lập HTTP Headers bảo mật. |
| **Secure Payment** | Xác thực chữ ký số (HMAC SHA512) trong mọi giao dịch với VNPay. Dữ liệu nhạy cảm không được lưu logs. |

---

## 6. Kết quả Đạt được

Hệ thống Backend hoạt động ổn định, đáp ứng đầy đủ các yêu cầu chức năng nghiệp vụ của rạp chiếu phim.

| Tiêu chí | Kết quả |
|----------|---------|
| Tốc độ phản hồi API | Trung bình dưới **200ms** |
| Khả năng xử lý đồng thời | Tốt nhờ kiến trúc Non-blocking I/O của Node.js |
| Quy trình triển khai | Tự động hóa và chuẩn hóa bằng **Docker** |
| Tài liệu API | Đầy đủ, trực quan qua **Swagger UI** |
| Số Models | **19/19** Collections |
| Số Controllers | **18** Controllers |
| Số Routes | **19** Route files |
| Số API Endpoints | **60+** endpoints |

---

*Đồ án Tốt nghiệp - Nguyễn Mạnh Ninh (2200571) - Cập nhật: 08/12/2025*
