# NỘI DUNG THUYẾT TRÌNH - PHÂN HỆ DIỄN VIÊN

## 1. GIỚI THIỆU PHÂN HỆ

Phân hệ Diễn viên gồm 2 trang chính:
- **ActorsPage**: Danh sách diễn viên
- **ActorDetailPage**: Chi tiết diễn viên

---

## 2. TRANG DANH SÁCH DIỄN VIÊN (ActorsPage)

### 2.1. Chức năng chính
| STT | Chức năng | Mô tả |
|:---|:----------|:------|
| 1 | Hiển thị danh sách | Ảnh, tên, shortBio, viewCount, likeCount |
| 2 | Lọc theo quốc tịch | Dropdown danh sách quốc tịch từ API |
| 3 | Sắp xếp | Phổ biến (-viewCount), Mới nhất (-createdAt), Được thích nhất (-likeCount) |
| 4 | Phân trang | 10 items/page, server-side pagination |
| 5 | Like/Unlike | Optimistic Update + Rollback nếu lỗi |
| 6 | Sidebar | Phim đang chiếu tại rạp |

### 2.2. APIs sử dụng
```
GET  /api/v1/persons/actors?page=1&limit=10&sort=-viewCount&nationality=Việt Nam
GET  /api/v1/persons/nationalities
POST /api/v1/persons/:id/like  {action: 'like'|'unlike'}
GET  /api/v1/movies/now-showing?limit=5
```

### 2.3. Điểm kỹ thuật nổi bật
- **URL Query Params**: Đồng bộ filter với URL → Shareable, SEO-friendly
- **Optimistic Update**: UI phản hồi ngay 0ms, không chờ API
- **likeLoading per-item**: Chống spam click cùng lúc nhiều nút Like
- **localStorage**: Lưu trạng thái liked (`actor_liked_<id>`)

---

## 3. TRANG CHI TIẾT DIỄN VIÊN (ActorDetailPage)

### 3.1. Chức năng chính
| STT | Chức năng | Mô tả |
|:---|:----------|:------|
| 1 | Thông tin cá nhân | Tên, ảnh, ngày sinh, quốc tịch, chiều cao |
| 2 | Tiểu sử | fullBio từ backend → biography |
| 3 | Gallery ảnh | Lightbox, next/prev, autoplay 3s |
| 4 | Filmography | Danh sách phim đã đóng |
| 5 | Like/Unlike | Optimistic Update |
| 6 | View Count | Tăng lượt xem với cooldown 24h |
| 7 | Sidebar | Phim đang chiếu |

### 3.2. APIs sử dụng
```
GET  /api/v1/persons/:slug
POST /api/v1/persons/:id/view
POST /api/v1/persons/:id/like  {action: 'like'|'unlike'}
GET  /api/v1/movies/now-showing?limit=5
```

### 3.3. View Count Cooldown 24h
```
1. Kiểm tra localStorage: actor_view_<id>
2. So sánh: now - lastViewTime > 86,400,000ms (24h)?
   - Có → Gọi API tăng view + Lưu timestamp mới
   - Không → Bỏ qua
3. useRef tracking: Tránh gọi API duplicate trong session
```

---

## 4. BACKEND CONTROLLER (personController.js)

| Function | Route | Mô tả |
|:---------|:------|:------|
| `getActors` | GET /actors | Danh sách + filter + sort + pagination |
| `getNationalities` | GET /nationalities | Danh sách quốc tịch unique |
| `getPersonBySlug` | GET /:slug | Chi tiết theo slug |
| `togglePersonLike` | POST /:id/like | $inc likeCount ±1, chặn âm |
| `incrementPersonView` | POST /:id/view | $inc viewCount +1 |

---

## 5. CÂU HỎI THƯỜNG GẶP

### Q1: Tại sao dùng Optimistic Update?
**A:** Tăng UX - UI phản hồi ngay (0ms thay vì 200-500ms). Có rollback nếu API lỗi.

### Q2: View Count Cooldown hoạt động thế nào?
**A:** Lưu timestamp vào localStorage, so sánh với 86,400,000ms (24h). Nếu chưa hết cooldown thì không gọi API.

### Q3: Tại sao lưu Like vào localStorage?
**A:** Cho phép Guest (chưa đăng nhập) cũng Like được. Không cần backend quản lý session.

### Q4: Backend xử lý likeCount âm thế nào?
**A:** Code line 266-269: Nếu likeCount < 0 thì set về 0.

### Q5: Sao đồng bộ filter với URL?
**A:** SEO-friendly, shareable link, browser back/forward works.

---

## 6. CÂU PHẢN BIỆN

### "localStorage không an toàn, user cheat được?"
**A:** Đây là MVP. ViewCount/likeCount không critical như dữ liệu tài chính. Nếu cần bảo mật hơn có thể chuyển server-side session.

### "Sao không dùng Redux?"
**A:** Scope nhỏ (2 trang), useState + useContext đủ. Tránh over-engineering.

### "1 triệu diễn viên thì sao?"
**A:** Server-side pagination, MongoDB indexing, lazy loading ảnh.

---

## 7. TECH STACK

| Layer | Technology |
|:------|:-----------|
| Frontend | React 18, Material-UI v5, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose ODM |
| State | useState, useRef, useSearchParams |
