# Hướng Dẫn Cài Đặt & Cấu Hình

## Yêu Cầu Hệ Thống

| Phần mềm | Phiên bản | Tải về |
|----------|-----------|--------|
| Docker Desktop | v4+ | https://docker.com/products/docker-desktop |
| Node.js | v18+ | https://nodejs.org |
| Git | Bất kỳ | https://git-scm.com |

> Backend chạy bằng Docker (bao gồm MongoDB + Redis). Node.js chỉ cần cho Frontend.

---

## Bước 1: Clone Dự Án

```bash
git clone <link-repo>
cd DATN-Cinema
```

---

## Bước 2: Cài Đặt

**Backend** — Không cần cài thủ công, Docker tự xử lý khi build.

**Frontend:**
```bash
cd frontend
npm install
```

---

## Bước 3: Cấu Hình Biến Môi Trường

### 3.1. Backend (`backend/.env`)

```bash
cd backend
copy .env.example .env
```

Mở `backend/.env` và điền theo mẫu:

```env
# --- Server ---
NODE_ENV=development
PORT=5000

# --- Database (Docker tự tạo, không cần cài) ---
MONGO_URI=mongodb://mongo:27017/datn-cinema
REDIS_URL=redis://redis:6379

# --- JWT ---
JWT_SECRET=chuoi_bi_mat_bat_ky
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=chuoi_bi_mat_khac
JWT_REFRESH_EXPIRES_IN=7d

# --- Email (Gmail App Password) ---
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx
EMAIL_FROM=NMN Cinema <your_email@gmail.com>

# --- VNPay Sandbox ---
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/result
VNPAY_IPN_URL=http://localhost:5000/api/v1/payments/vnpay_ipn

# --- Google OAuth ---
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# --- AI Chatbot (Gemini) ---
GEMINI_API_KEY=your_gemini_key

# --- Frontend URL ---
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# --- Upload ---
UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=./public/uploads
```

> **Quan trọng:** `MONGO_URI` dùng `mongo` (tên service Docker), **không phải** `localhost`.

### 3.2. Frontend (`frontend/.env`)

```bash
cd frontend
copy .env.example .env
```

Mở `frontend/.env` và điền:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_TITLE=NMN CINEMA
VITE_NODE_ENV=development
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_PAYMENT_RETURN_URL=http://localhost:3000/payment/result
```

---

## Bước 4: Lấy API Key

Điền vào `backend/.env` sau khi lấy key từ các dịch vụ sau:

### 4.1. Gmail App Password → `EMAIL_PASS`
1. Vào https://myaccount.google.com → Bảo mật → Bật Xác minh 2 bước
2. Tìm "Mật khẩu ứng dụng" → Tạo mới → Copy 16 ký tự

### 4.2. VNPay Sandbox → `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`
1. Đăng ký tại https://sandbox.vnpayment.vn/merchantv2
2. Lấy TMN Code và Hash Secret từ trang quản lý

### 4.3. Google OAuth → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
1. Vào https://console.cloud.google.com → APIs & Services → Credentials
2. Tạo OAuth Client ID → Web Application
3. Thêm Redirect URI: `http://localhost:5000/api/v1/auth/google/callback`

### 4.4. Google Gemini AI → `GEMINI_API_KEY`
1. Vào https://aistudio.google.com/apikey
2. Tạo API Key → Copy

---

## Bước 5: Chạy Dự Án

Mở **2 terminal**:

### Terminal 1 — Backend (Docker)

```bash
cd backend
docker compose up --build
```

- Lần đầu build khoảng 2–3 phút, lần sau chỉ cần `docker compose up`
- Backend API: http://localhost:5000
- MongoDB Compass: kết nối `mongodb://localhost:27018`
- Redis: `localhost:6379`

Dừng backend:
```bash
docker compose down
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

- Website: http://localhost:3000

---

## Bước 6: Tạo Tài Khoản Admin

**Cách đơn giản nhất:**

1. Mở http://localhost:3000 → Đăng ký tài khoản bình thường
2. Xác thực OTP qua email
3. Mở MongoDB Compass → kết nối `mongodb://localhost:27018`
4. Vào database `datn-cinema` → collection `users` → tìm user vừa tạo
5. Sửa 2 trường: `role: "Admin"` và `isMaster: true`
6. Đăng nhập trang Admin tại: http://localhost:3000/admin

---

## Bước 7: Deploy Production (Tùy chọn)

### Deploy lên Render.com

**Backend (Web Service):**
1. Tạo Web Service tại https://render.com
2. Connect GitHub repo → Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Thêm tất cả biến trong `backend/.env` vào Environment Variables
6. Đổi `MONGO_URI` sang MongoDB Atlas (xem bên dưới)

**Frontend (Static Site):**
1. Tạo Static Site tại Render
2. Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Thêm các biến `VITE_*` vào Environment Variables
6. Đổi `VITE_API_BASE_URL` và `VITE_SOCKET_URL` thành URL backend trên Render

**MongoDB Atlas (cho production):**
1. Đăng ký miễn phí tại https://cloud.mongodb.com
2. Tạo Cluster M0 Free → Tạo Database User → Network Access: `0.0.0.0/0`
3. Lấy connection string → dán vào `MONGO_URI` trên Render

---

## Cấu Trúc Thư Mục

```
DATN-Cinema/
├── backend/                    # API Server (Docker)
│   ├── src/
│   │   ├── config/             # Hằng số cấu hình
│   │   ├── controllers/        # Xử lý logic API
│   │   ├── middlewares/         # Auth, phân quyền
│   │   ├── models/             # MongoDB Schema
│   │   ├── routes/             # Định tuyến API
│   │   ├── services/           # Email, Socket, AI
│   │   └── server.js           # Entry point
│   ├── Dockerfile              # Docker image
│   ├── docker-compose.yml      # Backend + MongoDB + Redis
│   ├── .env.example            # Mẫu biến môi trường
│   └── package.json
│
├── frontend/                   # React.js + Vite
│   ├── src/
│   │   ├── apis/               # Gọi API (axios)
│   │   ├── components/         # Component UI
│   │   ├── contexts/           # Auth, Permission
│   │   ├── hooks/              # Timer, Socket
│   │   ├── pages/              # Client + Admin
│   │   └── App.jsx             # Router chính
│   ├── .env.example            # Mẫu biến môi trường
│   └── package.json
│
└── Cách cài đặt và cấu hình.md
```

---

## Xử Lý Lỗi Thường Gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Docker build lỗi | Docker Desktop chưa chạy | Mở Docker Desktop trước |
| `ECONNREFUSED :27017` | Backend .env dùng `localhost` thay vì `mongo` | Đổi thành `mongodb://mongo:27017/datn-cinema` |
| CORS error | URL frontend/backend không khớp | Kiểm tra `CORS_ORIGIN` trong `.env` |
| Email gửi thất bại | Sai Gmail App Password | Tạo lại App Password 16 ký tự |
| VNPay lỗi checksum | Sai Hash Secret | Kiểm tra `VNPAY_HASH_SECRET` |
| Ảnh không hiển thị | Thư mục uploads bị xóa | Upload lại qua trang Admin |
| Socket.IO lỗi | Sai `VITE_SOCKET_URL` | Phải trỏ đúng URL backend |
