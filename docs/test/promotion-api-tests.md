# Test Cases - Promotion API

## 🔧 Chuẩn bị

### 1. Chạy seed data
```bash
cd backend
node src/seeds/promotionSeeds.js
```

### 2. Khởi động backend
```bash
npm run dev
```

---

## 📋 Test Cases

### BASE_URL: `http://localhost:5000/api/v1`

---

## TC-01: Lấy danh sách promotions (Public)

**Request:**
```http
GET {{BASE_URL}}/promotions
```

**Expected:**
- Status: 200
- Response có `success: true`
- `data` là mảng promotions
- Chỉ có promotions ACTIVE và trong thời gian

**Query params test:**
```http
GET {{BASE_URL}}/promotions?page=1&limit=5
GET {{BASE_URL}}/promotions?applyMode=ONLINE_VOUCHER
GET {{BASE_URL}}/promotions?sort=featured
GET {{BASE_URL}}/promotions?keyword=VIP
```

---

## TC-02: Lấy chi tiết promotion (Public)

**Request:**
```http
GET {{BASE_URL}}/promotions/giam-20-cho-khach-hang-moi-xxxxx
```

**Expected:**
- Status: 200
- Response có `success: true`
- `data.claimState` = "NOT_LOGGED_IN" (nếu chưa đăng nhập)
- Có đầy đủ thông tin: title, content, applyMode...

---

## TC-03: Lấy chi tiết với user đã đăng nhập

**Request:**
```http
GET {{BASE_URL}}/promotions/:slug
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected:**
- `claimState` = "ELIGIBLE" (nếu chưa claim)
- `claimState` = "ALREADY_CLAIMED" (nếu đã claim)
- `canClaim` = true/false

---

## TC-04: Claim voucher (ONLINE_VOUCHER)

**Request:**
```http
POST {{BASE_URL}}/promotions/:id/claim
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected (lần 1):**
- Status: 201
- `success: true`
- `alreadyClaimed: false`
- `userVoucher` có thông tin

**Expected (lần 2 - IDEMPOTENT):**
- Status: 200
- `success: true`
- `alreadyClaimed: true`
- KHÔNG tạo UserVoucher mới

---

## TC-05: Claim voucher khi chưa đăng nhập

**Request:**
```http
POST {{BASE_URL}}/promotions/:id/claim
```

**Expected:**
- Status: 401
- `success: false`

---

## TC-06: Claim promotion không phải ONLINE_VOUCHER

**Request:**
```http
POST {{BASE_URL}}/promotions/:offline_promotion_id/claim
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected:**
- Status: 400
- Message: "Ưu đãi này không hỗ trợ nhận mã online"

---

## TC-07: Offline claim (OFFLINE_ONLY)

**Request:**
```http
POST {{BASE_URL}}/promotions/:offline_id/offline-claim
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected (lần 1):**
- Status: 201
- `success: true`
- `redeem.token` có giá trị
- `redeem.qrData` có giá trị

**Expected (lần 2 - IDEMPOTENT):**
- Status: 200
- `alreadyClaimed: true`
- Trả về token cũ, KHÔNG tạo mới

---

## TC-08: Staff redeem token

**Request:**
```http
POST {{BASE_URL}}/promotions/staff/redeem
Authorization: Bearer {{STAFF_TOKEN}}
Content-Type: application/json

{
  "token": "ABC123DEF456..."
}
```

**Expected (lần 1):**
- Status: 200
- `success: true`
- Token chuyển sang REDEEMED

**Expected (lần 2):**
- Status: 400
- Message: "Mã đã được sử dụng trước đó"

---

## TC-09: Staff redeem token không tồn tại

**Request:**
```http
POST {{BASE_URL}}/promotions/staff/redeem
Authorization: Bearer {{STAFF_TOKEN}}
Content-Type: application/json

{
  "token": "INVALID_TOKEN"
}
```

**Expected:**
- Status: 404
- Message: "Mã không tồn tại"

---

## TC-10: Admin CRUD

### 10.1 Tạo promotion
```http
POST {{BASE_URL}}/promotions/admin
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "title": "Test Promotion",
  "content": "Nội dung test",
  "startAt": "2024-01-01",
  "endAt": "2024-12-31",
  "applyMode": "ONLINE_VOUCHER",
  "voucherId": "..."
}
```

### 10.2 Cập nhật promotion
```http
PATCH {{BASE_URL}}/promotions/admin/:id
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "status": "INACTIVE"
}
```

### 10.3 Xóa promotion (soft delete)
```http
DELETE {{BASE_URL}}/promotions/admin/:id
Authorization: Bearer {{ADMIN_TOKEN}}
```

---

## ✅ Checklist Kết Quả

| Test Case | Mô tả | Pass/Fail |
|:----------|:------|:----------|
| TC-01 | Lấy danh sách promotions | ⬜ |
| TC-02 | Chi tiết promotion (public) | ⬜ |
| TC-03 | Chi tiết với user đăng nhập | ⬜ |
| TC-04 | Claim voucher (lần 1 + idempotent) | ⬜ |
| TC-05 | Claim khi chưa đăng nhập | ⬜ |
| TC-06 | Claim sai applyMode | ⬜ |
| TC-07 | Offline claim (lần 1 + idempotent) | ⬜ |
| TC-08 | Staff redeem (lần 1 + lần 2) | ⬜ |
| TC-09 | Staff redeem token không tồn tại | ⬜ |
| TC-10 | Admin CRUD | ⬜ |

---

## 🐛 Debug Tips

1. **Check MongoDB:** `db.promotions.find().pretty()`
2. **Check UserVoucher:** `db.uservouchers.find({source: 'PROMOTION'})`
3. **Check PromotionRedeem:** `db.promotionredeems.find()`
4. **Backend logs:** Xem console để debug errors
