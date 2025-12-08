# Hướng dẫn Kiểm thử Backend - NMN Cinema

## 1. Yêu cầu môi trường

| Thành phần | Phiên bản |
|------------|-----------|
| Node.js | 18.x LTS |
| MongoDB | 7.x (hoặc Docker) |
| npm | 9.x+ |

---

## 2. Cách chạy Tests

### 2.1. Jest Integration Tests

```bash
# Chạy tất cả tests
npm test

# Chạy test cụ thể
npm test -- --testPathPattern=showtime
```

### 2.2. Seed Data (Demo)

```bash
# Chạy local
node scripts/seed.js

# Chạy trong Docker
docker exec nmn-cinema-backend node scripts/seed.js
```

---

## 3. Test thủ công với Swagger UI

1. Khởi động server: `npm start` hoặc `docker-compose up -d`
2. Mở trình duyệt: http://localhost:5000/api-docs
3. Test từng API endpoint:

### Authentication
```
POST /api/v1/auth/login
Body: { "email": "admin@nmncinema.com", "password": "Admin@123" }
```

### Get Movies
```
GET /api/v1/movies
```

### Seat Hold (Real-time)
```
POST /api/v1/holds
Body: { "showtimeId": "...", "seatCode": "A5" }
```

---

## 4. Tài khoản Test có sẵn

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nmncinema.com | Admin@123 |
| Manager | manager@nmncinema.com | Manager@123 |
| Staff | staff@nmncinema.com | Staff@123 |
| User | user1@test.com | User@123 |

---

## 5. Kịch bản Test quan trọng

### 5.1. Luồng Đặt vé Real-time
1. Mở 2 trình duyệt (User A và User B)
2. Cả 2 vào cùng suất chiếu
3. User A giữ ghế A5 → Thành công
4. User B cố giữ ghế A5 → Phải báo lỗi 409 Conflict

### 5.2. Luồng Thanh toán VNPay
1. Tạo Order (POST /orders)
2. Lấy link thanh toán (POST /payments/vnpay/create)
3. Thanh toán trên VNPay Sandbox
4. Kiểm tra Order status = PAID
5. Kiểm tra Ticket được tạo

### 5.3. Check-in QR
1. Đăng nhập Staff account
2. POST /checkin/scan với ticketCode và qrChecksum
3. Vé chuyển status từ VALID → USED
4. Quét lại lần 2 → Phải báo lỗi "Vé đã sử dụng"

---

## 6. Troubleshooting

### Lỗi "Port 5000 in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Hoặc dừng Docker
docker-compose down
```

### Lỗi MongoDB connection
- Kiểm tra MONGO_URI trong .env
- Nếu dùng Docker: `docker-compose up -d mongo`

### Lỗi "Invalid Signature" VNPay
- Kiểm tra VNPAY_HASH_SECRET trong .env
- Đảm bảo dùng đúng API Sandbox của VNPay

---

*Tài liệu hướng dẫn test - Cập nhật: 08/12/2025*
