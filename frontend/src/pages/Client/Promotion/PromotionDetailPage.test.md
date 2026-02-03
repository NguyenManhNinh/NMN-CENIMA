# Test Cases - PromotionDetailPage

## Môi trường Test
- **Frontend URL:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/v1
- **Test Page:** http://localhost:3000/uu-dai/{slug}

---

## TC01: Navigation từ List → Detail

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Navigate từ trang danh sách ưu đãi đến trang chi tiết |
| **Precondition** | User ở trang /uu-dai |
| **Bước thực hiện** | 1. Click vào thumbnail hoặc title của 1 promotion |
| **Kết quả mong đợi** | URL chuyển thành /uu-dai/{slug}, trang chi tiết hiển thị |
| **Trạng thái** | ⏳ Chưa test |

---

## TC02: Hiển thị View Count

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Kiểm tra lượt xem hiển thị đúng |
| **Precondition** | User ở trang chi tiết promotion |
| **Bước thực hiện** | 1. Quan sát header, tìm icon con mắt (👁️) và số bên cạnh |
| **Kết quả mong đợi** | Icon VisibilityIcon hiển thị cùng số lượt xem (vd: "1.2k") |
| **Trạng thái** | ⏳ Chưa test |

---

## TC03: Like Promotion (Anonymous)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | User chưa đăng nhập có thể like (theo IP) |
| **Precondition** | User chưa đăng nhập, ở trang chi tiết promotion |
| **Bước thực hiện** | 1. Click icon trái tim (♡) trong header |
| **Kết quả mong đợi** | - Icon đổi thành ❤️ (filled đỏ)<br>- Toast "Đã thích ưu đãi"<br>- Like count tăng 1 |
| **Trạng thái** | ⏳ Chưa test |

---

## TC04: Unlike Promotion

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | User bỏ like promotion |
| **Precondition** | User đã like promotion (icon ❤️ đỏ) |
| **Bước thực hiện** | 1. Click icon trái tim ❤️ lần nữa |
| **Kết quả mong đợi** | - Icon đổi lại thành ♡ (outline)<br>- Toast "Đã bỏ thích"<br>- Like count giảm 1 |
| **Trạng thái** | ⏳ Chưa test |

---

## TC05: Share Promotion (Web Share API)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Chia sẻ link promotion (mobile/browser hỗ trợ) |
| **Precondition** | Browser hỗ trợ Web Share API (Chrome Android, Safari iOS) |
| **Bước thực hiện** | 1. Click icon share (🔗) trong header |
| **Kết quả mong đợi** | Native share dialog mở ra với title và URL |
| **Trạng thái** | ⏳ Chưa test |

---

## TC06: Share Promotion (Fallback Copy)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Copy link khi browser không hỗ trợ share |
| **Precondition** | Browser KHÔNG hỗ trợ Web Share API (Desktop Chrome/Firefox) |
| **Bước thực hiện** | 1. Click icon share trong header |
| **Kết quả mong đợi** | - Toast "Đã copy link!"<br>- Clipboard chứa URL hiện tại |
| **Trạng thái** | ⏳ Chưa test |

---

## TC07: Hiển thị Banner Image

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Banner/cover image hiển thị đúng |
| **Precondition** | Promotion có coverUrl hoặc thumbnailUrl |
| **Bước thực hiện** | 1. Quan sát khu vực dưới header |
| **Kết quả mong đợi** | Hình ảnh banner full width, không bị stretch |
| **Trạng thái** | ⏳ Chưa test |

---

## TC08: Hiển thị Content (HTML)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Nội dung HTML được render đúng |
| **Precondition** | Promotion có field content |
| **Bước thực hiện** | 1. Cuộn xuống phần nội dung |
| **Kết quả mong đợi** | - HTML render đúng (bold, list, paragraph)<br>- Không có thẻ form/input (đã bị sanitize) |
| **Trạng thái** | ⏳ Chưa test |

---

## TC09: Hiển thị Notes Section

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Phần Lưu ý hiển thị nếu có |
| **Precondition** | Promotion có field notes |
| **Bước thực hiện** | 1. Cuộn xuống dưới phần content |
| **Kết quả mong đợi** | - Nền vàng nhạt<br>- Icon ⚠️<br>- Tiêu đề "Lưu ý"<br>- Nội dung notes |
| **Trạng thái** | ⏳ Chưa test |

---

## TC10: Bottom Banners

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Banner quảng cáo phía dưới |
| **Precondition** | API trả về banners |
| **Bước thực hiện** | 1. Cuộn xuống cuối trang |
| **Kết quả mong đợi** | BottomBannerSection hiển thị với các banner khác |
| **Trạng thái** | ⏳ Chưa test |

---

## TC11: Loading State

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Màn hình loading khi đang fetch data |
| **Precondition** | Mới navigate đến trang |
| **Bước thực hiện** | 1. Navigate đến /uu-dai/{slug}<br>2. Quan sát ngay lập tức |
| **Kết quả mong đợi** | - Nền tối #1a1a2e<br>- Logo NMN Cinema<br>- Spinner xoay<br>- Text "Chờ tôi xíu nhé" |
| **Trạng thái** | ⏳ Chưa test |

---

## TC12: Error State (404)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Hiển thị lỗi khi promotion không tồn tại |
| **Precondition** | N/A |
| **Bước thực hiện** | 1. Navigate đến /uu-dai/not-exist-slug-12345 |
| **Kết quả mong đợi** | - Icon lỗi đỏ<br>- Message "Không tìm thấy ưu đãi" |
| **Trạng thái** | ⏳ Chưa test |

---

## TC13: Cleanup Verification - Không có Claim Section

| Thuộc tính | Giá trị |
|------------|---------|
| **Mô tả** | Xác nhận không còn UI nhận voucher/QR |
| **Precondition** | Đã cleanup code |
| **Bước thực hiện** | 1. Xem toàn bộ trang chi tiết |
| **Kết quả mong đợi** | KHÔNG thấy:<br>- Button "Nhận Voucher"<br>- Button "Lấy Mã QR"<br>- Alert yêu cầu đăng nhập<br>- Quota "Còn X lượt" |
| **Trạng thái** | ⏳ Chưa test |

---

## Hướng dẫn chạy test thủ công

```bash
# 1. Đảm bảo backend đang chạy
cd d:\DATN-Cinema\backend
docker-compose up -d

# 2. Đảm bảo frontend đang chạy
cd d:\DATN-Cinema\frontend
npm run dev

# 3. Mở browser
# Truy cập: http://localhost:3000/uu-dai
```

---

## Kết quả Test

| TC | Kết quả | Ghi chú |
|----|---------|---------|
| TC01 | ⏳ | |
| TC02 | ⏳ | |
| TC03 | ⏳ | |
| TC04 | ⏳ | |
| TC05 | ⏳ | |
| TC06 | ⏳ | |
| TC07 | ⏳ | |
| TC08 | ⏳ | |
| TC09 | ⏳ | |
| TC10 | ⏳ | |
| TC11 | ⏳ | |
| TC12 | ⏳ | |
| TC13 | ⏳ | |
