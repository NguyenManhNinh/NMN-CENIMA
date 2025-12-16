# 🧪 DANH SÁCH API TEST - NMN CINEMA

**Base URL:** `http://localhost:5000/api/v1`

---

## 1️⃣ AUTHENTICATION

### POST /auth/register
```json
{
  "name": "Nguyen Van Test",
  "email": "test123@gmail.com",
  "password": "Test@123",
  "passwordConfirm": "Test@123",
  "phone": "0987654321"
}
```

### POST /auth/login
```json
{
  "email": "admin@nmncinema.com",
  "password": "Admin@123"
}
```
**→ Lưu `accessToken` để dùng cho các API cần Auth!**

---

## 2️⃣ MOVIES

### GET /movies
*(Public - Không cần Auth)*

### POST /movies *(Admin)*
```json
{
  "title": "Avengers: Endgame",
  "description": "Biệt đội siêu anh hùng",
  "duration": 180,
  "genre": ["Action", "Sci-Fi"],
  "director": "Russo Brothers",
  "cast": ["Robert Downey Jr", "Chris Evans"],
  "ageRating": "C13",
  "posterUrl": "https://example.com/poster.jpg",
  "trailerUrl": "https://youtube.com/watch?v=xxx",
  "releaseDate": "2024-12-20",
  "status": "NOW"
}
```

### GET /movies/:id
*(Thay `:id` bằng movieId thực)*

---

## 3️⃣ CINEMAS

### GET /cinemas
*(Public)*

### POST /cinemas *(Admin)*
```json
{
  "name": "NMN Cinema Hà Nội",
  "address": "123 Cầu Giấy, Hà Nội",
  "phone": "0849045706",
  "status": "ACTIVE"
}
```

### GET /cinemas/:id

---

## 4️⃣ ROOMS

### GET /rooms
### GET /rooms?cinemaId=xxx

### POST /rooms *(Admin)*
```json
{
  "name": "P01",
  "cinemaId": "<CINEMA_ID>",
  "type": "2D",
  "totalSeats": 100,
  "seatMap": [
    {
      "row": "A",
      "seats": [
        { "number": 1, "type": "standard" },
        { "number": 2, "type": "vip" }
      ]
    }
  ]
}
```

---

## 5️⃣ SHOWTIMES

### GET /showtimes
### GET /showtimes?movieId=xxx

### POST /showtimes *(Admin)*
```json
{
  "movieId": "<MOVIE_ID>",
  "cinemaId": "<CINEMA_ID>",
  "roomId": "<ROOM_ID>",
  "startAt": "2024-12-20T19:00:00Z",
  "format": "2D",
  "basePrice": 90000,
  "status": "OPEN"
}
```

---

## 6️⃣ SEAT HOLDS (Giữ ghế)

### POST /holds *(User Auth)*
```json
{
  "showtimeId": "<SHOWTIME_ID>",
  "seatCode": "A1"
}
```

### DELETE /holds/:holdId

---

## 7️⃣ ORDERS

### POST /orders *(User Auth)*
```json
{
  "showtimeId": "<SHOWTIME_ID>",
  "seats": ["A1", "A2"],
  "combos": [
    { "id": "<COMBO_ID>", "quantity": 1 }
  ],
  "voucherCode": "GIAM10K"
}
```

### GET /orders/me

---

## 8️⃣ PAYMENTS

### POST /payments/vnpay/create *(User Auth)*
```json
{
  "orderId": "<ORDER_ID>",
  "returnUrl": "http://localhost:3000/payment/result"
}
```

---

## 9️⃣ COMBOS

### GET /combos

### POST /combos *(Admin)*
```json
{
  "name": "Combo Couple",
  "description": "2 bắp lớn + 2 nước",
  "price": 120000,
  "items": [
    { "name": "Bắp rang bơ lớn", "quantity": 2 },
    { "name": "Pepsi lớn", "quantity": 2 }
  ],
  "status": "ACTIVE"
}
```

---

## 🔟 VOUCHERS

### GET /vouchers

### POST /vouchers *(Admin)*
```json
{
  "code": "GIAM20K",
  "type": "FIXED",
  "value": 20000,
  "minOrderValue": 100000,
  "maxUses": 100,
  "validFrom": "2024-12-01",
  "validTo": "2024-12-31",
  "status": "ACTIVE"
}
```

---

## 1️⃣1️⃣ REVIEWS

### POST /movies/:movieId/reviews *(User Auth)*
```json
{
  "rating": 5,
  "content": "Phim rất hay!"
}
```

### GET /movies/:movieId/reviews

---

## 1️⃣2️⃣ REPORTS *(Admin)*

### GET /reports/revenue?from=2024-01-01&to=2024-12-31
### GET /reports/top-movies?limit=10
### GET /reports/occupancy

---

## 1️⃣3️⃣ CHATBOT

### POST /chatbot/message *(Optional Auth)*
```json
{
  "message": "Phim gì đang chiếu?"
}
```

---

## 1️⃣4️⃣ CMS

### GET /cms/banners
### GET /cms/articles
### GET /cms/events

---

## 1️⃣5️⃣ USERS *(Admin)*

### GET /users
### GET /users/:userId

---

## 1️⃣6️⃣ TICKETS

### GET /tickets/me *(User Auth)*

---

## 1️⃣7️⃣ LOYALTY

### GET /loyalty/me *(User Auth)*
### GET /loyalty/history *(User Auth)*

---

## 1️⃣8️⃣ FEEDBACKS

### POST /feedbacks *(Public)*
```json
{
  "name": "Nguyen Van A",
  "email": "test@gmail.com",
  "topic": "SERVICE",
  "content": "Dịch vụ rất tốt!",
  "rating": 5
}
```

### GET /feedbacks *(Admin)*

---

## 1️⃣9️⃣ FAQs

### GET /faqs *(Public)*

### POST /faqs *(Admin)*
```json
{
  "question": "Làm sao để đặt vé?",
  "answer": "Đặt vé qua website hoặc app",
  "category": "BOOKING",
  "isActive": true
}
```

---

## 2️⃣0️⃣ HEALTH CHECK

### GET /health
*(Không cần Auth)*

---

## 📝 GHI CHÚ QUAN TRỌNG

| Cần Auth | Header |
|----------|--------|
| User | `Authorization: Bearer <accessToken>` |
| Admin | `Authorization: Bearer <adminToken>` |

**Admin account:** `admin@nmncinema.com` / `Admin@123`

---

*Tổng: 38+ endpoints*
