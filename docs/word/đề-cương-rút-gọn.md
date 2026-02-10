
TRƯỜNG ĐẠI HỌC THÀNH ĐÔ
NGÀNH CÔNG NGHỆ THÔNG TIN

ĐỀ CƯƠNG ĐỒ ÁN TỐT NGHIỆP

Đề tài: Xây dựng Website quản lý rạp chiếu phim tích hợp thanh toán trực tuyến và AI chatbot

Sinh viên: Nguyễn Mạnh Ninh          Mã SV: 2200571
Lớp: D101A1K14                       Ngành: CNTT
Học phần: Đồ án tốt nghiệp
Giảng viên hướng dẫn: TS. Vũ Hoàng Anh

---

# LỜI MỞ ĐẦU

Trong những năm gần đây, ngành công nghiệp điện ảnh phát triển mạnh mẽ, kéo theo nhu cầu hiện đại hóa vận hành tại các rạp chiếu phim. Tuy nhiên, ở nhiều mô hình rạp vừa và nhỏ, việc đặt vé thủ công và thiếu kênh hỗ trợ khách hàng vẫn là các "điểm nghẽn" gây bất tiện.

Đề tài "Xây dựng Website quản lý rạp chiếu phim tích hợp thanh toán trực tuyến và AI chatbot" được thực hiện nhằm xây dựng một hệ thống website toàn diện, với điểm nhấn là hệ thống đặt vé theo thời gian thực, tích hợp cổng thanh toán VNPay và trợ lý ảo AI ChatBot.

---

# MỤC LỤC

- CHƯƠNG 1: TỔNG QUAN VỀ ĐỀ TÀI
- CHƯƠNG 2: CƠ SỞ LÝ THUYẾT
- CHƯƠNG 3: PHÂN TÍCH, THIẾT KẾ VÀ TRIỂN KHAI HỆ THỐNG
- CHƯƠNG 4: KẾT LUẬN

Ngày giao đề tài: 15/12/2025
Ngày hoàn thành: 15/03/2026

---

# CHƯƠNG 1: TỔNG QUAN VỀ ĐỀ TÀI

## 1.1. Lý do chọn đề tài

Chuyển đổi số đang trở thành định hướng trọng tâm tại Việt Nam. Thực tiễn vận hành tại nhiều rạp chiếu phim quy mô vừa và nhỏ cho thấy các nghiệp vụ như quản lý phim, đặt vé và hỗ trợ khách hàng còn rời rạc hoặc phụ thuộc thao tác thủ công.

Vì vậy, đề tài này được lựa chọn như một bài toán ứng dụng chuyển đổi số trong dịch vụ giải trí, hướng tới số hóa quy trình đặt vé, quản trị tập trung và tăng cường hỗ trợ khách hàng bằng công nghệ.

## 1.2. Mục đích và phạm vi

### 1.2.1. Mục đích
- Xây dựng website đặt vé trực tuyến, chọn ghế theo thời gian thực
- Xây dựng hệ thống quản trị nghiệp vụ rạp chiếu phim
- Tích hợp thanh toán VNPay và AI Chatbot hỗ trợ khách hàng

### 1.2.2. Phạm vi chức năng

**Phía khách hàng:**
- Xem phim, lịch chiếu, đặt vé, thanh toán online
- Nhận vé QR qua email, áp dụng voucher
- Tương tác với AI Chatbot

**Phía quản trị:**
- Quản lý phim, rạp, phòng chiếu, suất chiếu
- Quản lý đơn hàng, vé, voucher, combo
- Báo cáo thống kê cơ bản

**Kỹ thuật:**
- Frontend: ReactJS + Vite
- Backend: Node.js/Express
- Database: MongoDB
- Triển khai: Docker

---

# CHƯƠNG 2: CƠ SỞ LÝ THUYẾT

## 2.1. Thương mại điện tử trong dịch vụ giải trí

Theo Nghị định 52/2013/NĐ-CP, bán vé rạp phim online là một trường hợp điển hình của thương mại điện tử. Hệ thống bán vé cần đảm bảo cung cấp thông tin minh bạch, giao kết hợp đồng trực tuyến và an toàn thanh toán.

## 2.2. Công nghệ sử dụng

### 2.2.1. ReactJS (Frontend)
- Thư viện JavaScript để xây dựng giao diện người dùng
- Chia UI thành các component nhỏ, tái sử dụng
- Sử dụng Hooks: useState, useEffect, useContext, useReducer

### 2.2.2. Node.js (Backend)
- Môi trường chạy JavaScript phía server
- Xử lý bất đồng bộ (asynchronous) và hướng sự kiện (event-driven)
- Phù hợp xây dựng ứng dụng mạng có khả năng mở rộng

### 2.2.3. MongoDB (Database)
- Hệ quản trị CSDL theo mô hình document-oriented (NoSQL)
- Schema linh hoạt, hỗ trợ embedded document
- Hỗ trợ đầy đủ CRUD và index

---

# CHƯƠNG 3: PHÂN TÍCH, THIẾT KẾ VÀ TRIỂN KHAI HỆ THỐNG

## 3.1. Phân tích yêu cầu bài toán

### 3.1.1. Tổng quan hệ thống

Hệ thống phục vụ hai nhóm người dùng: **Khách hàng** và **Quản trị viên**.

Kiến trúc tách lớp:
- **Frontend**: Giao diện người dùng (React)
- **Backend**: Xử lý nghiệp vụ, API (Express)
- **Database**: Lưu trữ dữ liệu (MongoDB)

Tích hợp bên ngoài:
- Cổng thanh toán VNPay
- AI Chatbot (Gemini)
- Email thông báo (SMTP)

### 3.1.2. Tác nhân hệ thống

| Tác nhân | Mô tả |
|:---------|:------|
| Guest | Xem phim, đăng ký/đăng nhập |
| User | Đặt vé, thanh toán, xem lịch sử |
| Staff | Soát vé check-in |
| Admin | Quản trị toàn bộ hệ thống |

### 3.1.3. Yêu cầu chức năng chính

**A. Trang chủ & Xác thực**
- Hiển thị banner, danh sách phim đang chiếu/sắp chiếu
- Đăng ký/đăng nhập (email, Google OAuth)
- Thanh đặt vé nhanh

**B. Đặt vé**
- Xem thông tin phim, trailer, rating
- Chọn rạp, ngày, suất chiếu
- Chọn ghế theo sơ đồ real-time
- Giữ ghế tạm thời (10-15 phút)

**C. Thanh toán**
- Chọn combo bắp nước
- Nhập voucher giảm giá
- Thanh toán VNPay
- Nhận vé QR qua email

**D. Quản trị**
- CRUD phim, rạp, phòng, suất chiếu
- Quản lý đơn hàng, vé
- Báo cáo doanh thu

### 3.1.4. Yêu cầu phi chức năng

| ID | Yêu cầu | Mô tả |
|:---|:--------|:------|
| NFR-01 | Hiệu năng | API < 500ms, trang load < 3s |
| NFR-02 | Bảo mật | JWT, bcrypt, HTTPS |
| NFR-03 | Responsive | Hỗ trợ mobile/desktop |
| NFR-04 | Real-time | Cập nhật trạng thái ghế |

---

## 3.2. Thiết kế hệ thống

### 3.2.1. Kiến trúc tổng thể

```
┌─────────────────────────────────────────┐
│          PRESENTATION LAYER             │
│  React + Vite + Material-UI             │
└─────────────────────────────────────────┘
                    │ REST API
                    ▼
┌─────────────────────────────────────────┐
│           BUSINESS LAYER                │
│  Express.js + Socket.io + Redis         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│            DATA LAYER                   │
│  MongoDB (15 Collections)               │
└─────────────────────────────────────────┘
```

### 3.2.2. Luồng đặt vé chính

```
[Chọn phim] → [Chọn rạp/ngày] → [Chọn suất chiếu]
                                      ↓
[Nhận vé QR] ← [Thanh toán VNPay] ← [Chọn ghế] → [Giữ ghế 10p]
     ↓                                    ↓
[Gửi email]                         [Chọn combo]
```

### 3.2.3. Luồng thanh toán

```
[Tạo Order PENDING] → [Redirect VNPay] → [User thanh toán]
                                              ↓
[Gửi vé email] ← [Tạo Ticket] ← [VNPay callback SUCCESS]
```

---

## 3.3. Thiết kế cơ sở dữ liệu

### 3.3.1. Danh sách Collection

| STT | Collection | Mô tả |
|:---:|:-----------|:------|
| 1 | User | Người dùng, xác thực, phân quyền |
| 2 | Movie | Thông tin phim |
| 3 | Genre | Thể loại phim |
| 4 | Person | Đạo diễn, diễn viên |
| 5 | Cinema | Rạp chiếu phim |
| 6 | Room | Phòng chiếu, sơ đồ ghế |
| 7 | Showtime | Suất chiếu |
| 8 | Order | Đơn đặt vé |
| 9 | Ticket | Vé điện tử |
| 10 | Payment | Giao dịch thanh toán |
| 11 | Voucher | Mã giảm giá |
| 12 | UserVoucher | Ví voucher người dùng |
| 13 | Combo | Bắp nước |
| 14 | SeatHold | Giữ ghế tạm |
| 15 | Review | Đánh giá phim |

### 3.3.2. Các Collection chính

**User:**
- _id, name, email, password, role (user/staff/admin)
- points, rank (MEMBER/VIP/VVIP)

**Movie:**
- _id, title, slug, description, duration
- director (ref Person), actors, genres
- posterUrl, trailerUrl, rating, status

**Showtime:**
- _id, movieId, cinemaId, roomId
- startAt, endAt, basePrice, format (2D/3D/IMAX)

**Order:**
- _id, orderNo, userId, showtimeId
- seats[], combos[], totalAmount, discount
- voucherCode, status (PENDING/PAID/FAILED)

**Ticket:**
- _id, orderId, userId, showtimeId
- seatCode, ticketCode, qrChecksum
- status (VALID/USED/VOID)

---

## 3.4. Mô tả hệ thống

### 3.4.1. Các module chức năng

| Module | Chức năng |
|:-------|:----------|
| User Management | Đăng ký, đăng nhập, phân quyền, tích điểm |
| Content | CRUD phim, thể loại, đạo diễn, diễn viên |
| Booking | Chọn suất chiếu, ghế, combo, voucher |
| Payment | Thanh toán VNPay, xuất vé QR |
| Review | Bình luận, đánh giá phim |
| Chat AI | Hỗ trợ tra cứu thông tin |

### 3.4.2. Tích hợp bên ngoài

| Dịch vụ | Mục đích |
|:--------|:---------|
| VNPay | Thanh toán trực tuyến |
| Google OAuth | Đăng nhập nhanh |
| Gemini AI | Chatbot hỗ trợ |
| SMTP | Gửi email vé |

### 3.4.3. Bảo mật

| Lớp | Giải pháp |
|:----|:----------|
| Xác thực | JWT Access/Refresh Token |
| Mã hóa | bcrypt (password), SHA-256 (QR) |
| Rate Limit | Redis-based |
| Injection | express-mongo-sanitize, xss-clean |

---

## 3.5. Các bước cài đặt

### 3.5.1. Yêu cầu

| Thành phần | Phiên bản |
|:-----------|:----------|
| Node.js | 18.x |
| MongoDB | 7.x |
| Redis | 7.x |
| Docker | 24.x |

### 3.5.2. Cài đặt thủ công

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run dev   # http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

### 3.5.3. Cài đặt Docker

```bash
cd backend
docker-compose up -d
```

| Service | Port |
|:--------|:-----|
| Backend | 5000 |
| MongoDB | 27018 |
| Redis | 6379 |

---

# CHƯƠNG 4: KẾT LUẬN

## 4.1. Kết quả đạt được

- **Đặt vé**: Luồng hoàn chỉnh từ chọn phim đến thanh toán
- **Thanh toán**: Tích hợp VNPay với xử lý idempotent
- **Vé điện tử**: QR Code, gửi email, soát vé check-in
- **Thành viên**: Tích điểm, xếp hạng VIP/VVIP
- **AI chatbot**: Hỗ trợ tra cứu thông tin 24/7

## 4.2. So sánh với hệ thống tương tự

| Tiêu chí | NMN Cinema | CGV | Galaxy |
|:---------|:----------:|:---:|:------:|
| Đặt vé online | ✅ | ✅ | ✅ |
| Thanh toán VNPay | ✅ | ✅ | ✅ |
| Tích điểm thành viên | ✅ | ✅ | ✅ |
| Chat hỗ trợ AI | ✅ | ❌ | ❌ |
| Open Source | ✅ | ❌ | ❌ |

## 4.3. Ứng dụng thực tế

- Triển khai cho rạp chiếu phim vừa và nhỏ
- Nền tảng học tập Full-stack development
- Tùy biến cho các ngành dịch vụ khác

## 4.4. Hướng phát triển

**Ngắn hạn:** Ứng dụng Mobile, đa ngôn ngữ, thêm MoMo/ZaloPay

**Dài hạn:** Blockchain vé điện tử, ML dự đoán nhu cầu, SaaS đa rạp

---

*Hà Nội, ngày ... tháng ... năm 2026*

**Viện QT & CN** | **Ngành CNTT** | **GV hướng dẫn: ThS. Nguyễn Văn Diễn**
