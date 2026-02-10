# PROMPTS VIẾT BÁO CÁO ĐỒ ÁN TỐT NGHIỆP
## Phân hệ 10-11: FilmDirectorPage & FilmDirectorDetailPage

---

## PHẦN 1: PHÂN TÍCH YÊU CẦU (3.1.13 - 3.1.14)

### 📝 PROMPT 1: Phân tích yêu cầu phân hệ FilmDirectorPage

```
Bạn là chuyên gia phân tích hệ thống phần mềm. Hãy viết nội dung phân tích yêu cầu cho phân hệ "Danh sách đạo diễn (FilmDirectorPage)" trong báo cáo đồ án tốt nghiệp website quản lý rạp chiếu phim.

CHI TIẾT CHỨC NĂNG THỰC TẾ TỪ CODE:
- Trang hiển thị danh sách đạo diễn dạng card với avatar, tên, tiểu sử ngắn, lượt xem, lượt thích
- Bộ lọc quốc tịch: Dropdown lấy từ API /api/v1/persons/nationalities?role=director
- Sắp xếp: 3 tiêu chí (phổ biến nhất - viewCount, mới nhất - createdAt, được thích nhất - likeCount)
- Phân trang: 10 đạo diễn/trang, cuộn lên đầu khi chuyển trang
- Thích/bỏ thích đạo diễn: Optimistic update + rollback nếu API lỗi + lưu localStorage
- Sidebar: Hiển thị phim đang chiếu với poster, tên, rating
- Drawer bộ lọc cho mobile
- URL State Sync: ?quoc-tich=&sap-xep=&page= để chia sẻ và bookmark
- Điều hướng: Click vào đạo diễn → /dao-dien-chi-tiet/:slug

API SỬ DỤNG:
- GET /api/v1/persons/directors (pagination, filter, sort)
- GET /api/v1/persons/nationalities?role=director
- POST /api/v1/persons/:id/like (toggle like/unlike)
- GET /api/v1/movies/now-showing (sidebar)

YÊU CẦU NỘI DUNG:
1. Mục tiêu và phạm vi phân hệ (2-3 đoạn)
2. Tác nhân và quyền hạn (bảng: Guest, User)
3. Bảng yêu cầu chức năng FR-DR-01 đến FR-DR-12 (ID, Yêu cầu, Mô tả, Ưu tiên)
4. Bảng yêu cầu phi chức năng NFR-DR-01 đến NFR-DR-06
5. Quy tắc nghiệp vụ BR-DR-01 đến BR-DR-08

LƯU Ý:
- Viết bằng tiếng Việt chuẩn, học thuật
- Không đạo văn, không xuyên tạc
- Nội dung phải nhất quán với code thực tế
- Format bảng markdown
```

---

### 📝 PROMPT 2: Phân tích yêu cầu phân hệ FilmDirectorDetailPage

```
Bạn là chuyên gia phân tích hệ thống phần mềm. Hãy viết nội dung phân tích yêu cầu cho phân hệ "Chi tiết đạo diễn (FilmDirectorDetailPage)" trong báo cáo đồ án tốt nghiệp website quản lý rạp chiếu phim.

CHI TIẾT CHỨC NĂNG THỰC TẾ TỪ CODE:
- Hiển thị thông tin cá nhân: tên, ảnh đại diện, ngày sinh, chiều cao, quốc tịch, nơi sinh, nghề nghiệp
- Tiểu sử ngắn (shortBio) và tiểu sử đầy đủ (fullBio/biography)
- Thư viện hình ảnh: Grid ảnh + Dialog lightbox + Autoplay 3s + nút Prev/Next + Play/Pause
- Danh sách phim đã đạo diễn (Filmography): poster, tên phim, vai trò, điều hướng /phim/:slug
- View Count: Tăng 1 lần mỗi 24h, cooldown lưu localStorage, optimistic update +1 ngay lập tức
- Like/Unlike: Optimistic update + rollback + localStorage với key director_liked_{id}
- Breadcrumb: Trang chủ > Đạo diễn > [Tên đạo diễn]
- Sidebar: Phim đang chiếu
- Xử lý 404: Hiển thị "Không tìm thấy đạo diễn" với nút quay lại
- Loading state: Spinner toàn màn hình
- Fallback: "Đang cập nhật" khi thiếu dữ liệu

API SỬ DỤNG:
- GET /api/v1/persons/:slug (lấy chi tiết theo slug)
- POST /api/v1/persons/:id/view (tăng view count)
- POST /api/v1/persons/:id/like (toggle like/unlike)
- GET /api/v1/movies/now-showing (sidebar)

KỸ THUẬT ĐẶC BIỆT:
- useRef để track view increment (chống double-call trong StrictMode)
- fetchSeqRef để chống race condition khi slug thay đổi nhanh
- Promise.all để fetch song song director + sidebar movies

YÊU CẦU NỘI DUNG:
1. Mục tiêu và phạm vi phân hệ (2-3 đoạn)
2. Tác nhân và quyền hạn (bảng: Guest, User)
3. Bảng yêu cầu chức năng FR-DD-01 đến FR-DD-15 (ID, Yêu cầu, Mô tả, Ưu tiên)
4. Bảng yêu cầu phi chức năng NFR-DD-01 đến NFR-DD-06
5. Quy tắc nghiệp vụ BR-DD-01 đến BR-DD-08

LƯU Ý:
- Viết bằng tiếng Việt chuẩn, học thuật
- Không đạo văn, không xuyên tạc
- Nội dung phải nhất quán với code thực tế
```

---

## PHẦN 2: THIẾT KẾ HỆ THỐNG - SƠ ĐỒ UML (3.2.25 - 3.2.26)

### 🎨 PROMPT 3: Use Case Diagram - FilmDirectorPage

```
Vẽ Use Case Diagram cho phân hệ FilmDirectorPage (Danh sách đạo diễn) bằng PlantUML hoặc Draw.io.

TÁC NHÂN:
- Guest (khách): Xem danh sách, lọc, sắp xếp, phân trang, xem chi tiết
- User (thành viên): Tất cả quyền Guest + Thích/bỏ thích đạo diễn

USE CASES:
1. UC-DR-01: Xem danh sách đạo diễn
2. UC-DR-02: Lọc theo quốc tịch
3. UC-DR-03: Sắp xếp danh sách (popular/newest/mostLiked)
4. UC-DR-04: Phân trang (10/trang)
5. UC-DR-05: Xem chi tiết đạo diễn (điều hướng /dao-dien-chi-tiet/:slug)
6. UC-DR-06: Thích đạo diễn (<<extend>> từ Xem danh sách, yêu cầu User)
7. UC-DR-07: Bỏ thích đạo diễn (<<extend>> từ Xem danh sách, yêu cầu User)
8. UC-DR-08: Đặt lại bộ lọc

QUAN HỆ:
- Guest và User đều có thể thực hiện UC-01 đến UC-05, UC-08
- Chỉ User mới có thể thực hiện UC-06, UC-07
- UC-06, UC-07 <<extend>> từ UC-01

Tạo mã PlantUML hoàn chỉnh với tiếng Việt.
```

---

### 🎨 PROMPT 4: Use Case Diagram - FilmDirectorDetailPage

```
Vẽ Use Case Diagram cho phân hệ FilmDirectorDetailPage (Chi tiết đạo diễn) bằng PlantUML hoặc Draw.io.

TÁC NHÂN:
- Guest (khách): Xem thông tin, xem gallery, xem filmography, xem tiểu sử
- User (thành viên): Tất cả quyền Guest + Thích/bỏ thích

USE CASES:
1. UC-DD-01: Xem thông tin cá nhân đạo diễn
2. UC-DD-02: Xem tiểu sử (shortBio + fullBio)
3. UC-DD-03: Xem thư viện hình ảnh (gallery)
4. UC-DD-04: Mở lightbox xem ảnh phóng to
5. UC-DD-05: Điều khiển autoplay gallery
6. UC-DD-06: Xem filmography (phim đã đạo diễn)
7. UC-DD-07: Điều hướng đến chi tiết phim
8. UC-DD-08: Thích đạo diễn (<<extend>>, yêu cầu User)
9. UC-DD-09: Bỏ thích đạo diễn (<<extend>>, yêu cầu User)
10. UC-DD-10: Tự động tăng view count (<<include>> từ UC-01, có cooldown 24h)

QUAN HỆ:
- UC-01 <<include>> UC-10 (tự động)
- UC-03 <<include>> UC-04 (khi click ảnh)
- UC-08, UC-09 <<extend>> từ UC-01 (chỉ User)

Tạo mã PlantUML hoàn chỉnh với tiếng Việt.
```

---

### 🎨 PROMPT 5: Activity Diagram - Luồng xem và lọc danh sách đạo diễn

```
Vẽ Activity Diagram cho luồng "Xem và lọc danh sách đạo diễn" bằng PlantUML.

LUỒNG XỬ LÝ:
1. [Start] Người dùng truy cập /dao-dien
2. Hệ thống gọi API lấy danh sách quốc tịch
3. Hệ thống gọi API lấy danh sách đạo diễn (page 1, sort popular)
4. Hệ thống gọi API lấy phim đang chiếu (sidebar)
5. Hiển thị danh sách đạo diễn + bộ lọc + sidebar
6. [Decision] Người dùng thay đổi bộ lọc?
   - Có → Cập nhật URL params → Gọi API với params mới → Quay lại bước 5
   - Không → [Decision] Người dùng chuyển trang?
7. [Decision] Người dùng chuyển trang?
   - Có → Cập nhật page → Gọi API → Scroll lên đầu → Quay lại bước 5
   - Không → [Decision] Người dùng click đạo diễn?
8. [Decision] Người dùng click đạo diễn?
   - Có → Điều hướng /dao-dien-chi-tiet/:slug → [End]
   - Không → Chờ tương tác tiếp

SWIMLANES: Frontend, Backend API, MongoDB

Tạo mã PlantUML hoàn chỉnh với tiếng Việt.
```

---

### 🎨 PROMPT 6: Activity Diagram - Luồng xem chi tiết và tăng view

```
Vẽ Activity Diagram cho luồng "Xem chi tiết đạo diễn và tăng view count" bằng PlantUML.

LUỒNG XỬ LÝ:
1. [Start] Người dùng truy cập /dao-dien-chi-tiet/:slug
2. Hiển thị loading spinner
3. Hệ thống gọi song song: getPersonBySlugAPI + getNowShowingMoviesAPI
4. [Decision] Tìm thấy đạo diễn?
   - Không → Hiển thị trang 404 "Không tìm thấy đạo diễn" → [End]
   - Có → Tiếp tục
5. Render thông tin đạo diễn (thông tin cá nhân, tiểu sử, gallery, filmography)
6. [Decision] Kiểm tra cooldown 24h trong localStorage
   - Đã xem trong 24h → Không tăng view → Tiếp tục
   - Chưa xem / hết cooldown → Tiếp tục bước 7
7. [Decision] Kiểm tra viewIncrementedRef (StrictMode guard)
   - Đã increment trong session → Không gọi API → Tiếp tục
   - Chưa increment → Tiếp tục bước 8
8. Optimistic update: +1 viewCount ngay lập tức
9. Lưu thời gian vào localStorage
10. Gọi API POST /persons/:id/view
11. Sync viewCount từ response server
12. [End] Hiển thị trang chi tiết hoàn chỉnh

SWIMLANES: Frontend, localStorage, Backend API

Tạo mã PlantUML hoàn chỉnh với tiếng Việt.
```

---

### 🎨 PROMPT 7: Sequence Diagram - Toggle Like đạo diễn

```
Vẽ Sequence Diagram cho luồng "Toggle like/unlike đạo diễn" bằng PlantUML.

PARTICIPANTS:
- User (Actor)
- FilmDirectorPage / FilmDirectorDetailPage (Frontend)
- localStorage (Browser Storage)
- personApi (API Client)
- personController (Backend)
- Person (MongoDB Model)

LUỒNG CHÍNH (Happy Path - Like):
1. User click nút Like
2. Frontend kiểm tra likeLoading[id] → nếu true thì return
3. Frontend đọc trạng thái hiện tại từ localStorage (director_liked_{id})
4. Frontend tính toán: nextLiked = !currentLiked, nextCount = currentCount + 1
5. [Optimistic Update] Frontend set likeLoading[id] = true
6. [Optimistic Update] Frontend update UI: isLiked = true, likeCount += 1
7. [Optimistic Update] Frontend lưu localStorage: director_liked_{id} = 'true'
8. Frontend gọi personApi.togglePersonLikeAPI(id, 'like')
9. personApi POST /api/v1/persons/:id/like với body { action: 'like' }
10. personController gọi Person.findByIdAndUpdate với $inc: { likeCount: 1 }
11. MongoDB cập nhật document
12. personController trả về { success: true, data: { likeCount: newCount } }
13. Frontend sync likeCount từ response
14. Frontend set likeLoading[id] = false

LUỒNG LỖI (Rollback):
- Nếu step 8-12 lỗi → Frontend rollback:
  - localStorage.setItem(likeKey, 'false')
  - setIsLiked(false)
  - setLikeCount(prevCount)
  - setLikeLoading[id] = false

Tạo mã PlantUML hoàn chỉnh với tiếng Việt, có cả alt fragment cho lỗi.
```

---

### 🎨 PROMPT 8: Sequence Diagram - View Count với Cooldown

```
Vẽ Sequence Diagram cho luồng "Tăng view count với cooldown 24h" bằng PlantUML.

PARTICIPANTS:
- Browser (Actor)
- FilmDirectorDetailPage (Frontend)
- viewIncrementedRef (useRef)
- localStorage (Browser Storage)
- personApi (API Client)
- personController (Backend)
- Person (MongoDB Model)

LUỒNG XỬ LÝ:
1. Browser navigate đến /dao-dien-chi-tiet/:slug
2. useEffect[director._id] được trigger
3. Frontend kiểm tra director._id có tồn tại không
4. Frontend đọc localStorage: director_view_{id}
5. Frontend tính diff = now - lastViewTime
6. [alt] Nếu diff <= 24h (86400000ms)
   - Note: "Đã xem gần đây, không tăng view"
   - Return (không làm gì)
7. [alt] Nếu hết cooldown
   - Frontend kiểm tra viewIncrementedRef.current[id]
   - [alt] Nếu đã increment trong session → Return
   - [alt] Nếu chưa increment:
     a. Set viewIncrementedRef.current[id] = true
     b. Lưu localStorage: director_view_{id} = now
     c. [Optimistic] setDirector(prev => ({...prev, viewCount: prev.viewCount + 1}))
     d. Gọi personApi.incrementPersonViewAPI(id)
     e. personController gọi Person.findByIdAndUpdate với $inc: { viewCount: 1 }
     f. MongoDB cập nhật
     g. personController trả về { viewCount: serverCount }
     h. Frontend sync viewCount từ server

Tạo mã PlantUML hoàn chỉnh với tiếng Việt, sử dụng alt/opt fragments.
```

---

### 🎨 PROMPT 9: Class Diagram - FilmDirectorPage

```
Vẽ Class Diagram rút gọn cho phân hệ FilmDirectorPage bằng PlantUML.

CÁC LỚP:

1. FRONTEND LAYER:
   - FilmDirectorPage (React Component)
     + directors: Array
     + nationalityOptions: Array
     + sidebarMovies: Array
     + selectedNationality: string
     + selectedSort: string
     + currentPage: number
     + totalPages: number
     + likeStates: Object
     + likeLoading: Object
     + loading: boolean
     + filterDrawerOpen: boolean
     ---
     + fetchNationalities(): void
     + loadDirectors(): void
     + fetchSidebarMovies(): void
     + handleDirectorClick(slug): void
     + handlePageChange(page): void
     + handleToggleLike(id, event): void
     + resetFilters(): void

   - personApi (API Client Module)
     + getDirectorsAPI(params): Promise
     + getNationalitiesAPI(params): Promise
     + togglePersonLikeAPI(id, action): Promise

   - movieApi (API Client Module)
     + getNowShowingMoviesAPI(limit): Promise

2. BACKEND LAYER:
   - PersonController
     + getDirectors(req, res): Response
     + getNationalities(req, res): Response
     + togglePersonLike(req, res): Response

   - PersonService (nếu có)
     + findDirectors(filter, sort, pagination): Array
     + getUniqueNationalities(role): Array
     + updateLikeCount(id, action): Person

   - Person (Mongoose Model)
     + _id: ObjectId
     + name: string
     + slug: string
     + role: enum ['actor', 'director', 'both']
     + avatar: string
     + shortBio: string
     + nationality: string
     + viewCount: number
     + likeCount: number
     + isActive: boolean
     + createdAt: Date

QUAN HỆ:
- FilmDirectorPage --> personApi : uses
- FilmDirectorPage --> movieApi : uses
- personApi --> PersonController : HTTP requests
- PersonController --> Person : Mongoose queries

Tạo mã PlantUML hoàn chỉnh với stereotype <<component>>, <<service>>, <<model>>.
```

---

### 🎨 PROMPT 10: Class Diagram - FilmDirectorDetailPage

```
Vẽ Class Diagram rút gọn cho phân hệ FilmDirectorDetailPage bằng PlantUML.

CÁC LỚP:

1. FRONTEND LAYER:
   - FilmDirectorDetailPage (React Component)
     + director: Object
     + sidebarMovies: Array
     + loading: boolean
     + isLiked: boolean
     + likeLoading: boolean
     + openGallery: boolean
     + currentImageIndex: number
     + isAutoPlay: boolean
     - viewIncrementedRef: useRef
     - fetchSeqRef: useRef
     ---
     + fetchDirector(): void
     + incrementView(): void
     + handleToggleLike(): void
     + handleOpenGallery(index): void
     + handleNextImage(): void
     + handlePrevImage(): void
     + handleMovieClick(slug): void

   - personApi (API Client Module)
     + getPersonBySlugAPI(slug): Promise
     + incrementPersonViewAPI(id): Promise
     + togglePersonLikeAPI(id, action): Promise

   - movieApi (API Client Module)
     + getNowShowingMoviesAPI(limit): Promise

2. BACKEND LAYER:
   - PersonController
     + getPersonBySlug(req, res): Response
     + incrementPersonView(req, res): Response
     + togglePersonLike(req, res): Response

   - Person (Mongoose Model)
     + _id: ObjectId
     + name: string
     + slug: string
     + role: string
     + avatar: string
     + shortBio: string
     + fullBio: string
     + birthDate: Date
     + height: number
     + nationality: string
     + birthPlace: string
     + occupation: string
     + gallery: Array<{url, caption}>
     + filmography: Array<{movie, role}>
     + viewCount: number
     + likeCount: number

   - Movie (Mongoose Model - cho filmography)
     + _id: ObjectId
     + title: string
     + slug: string
     + poster: string
     + rating: number

QUAN HỆ:
- FilmDirectorDetailPage --> personApi : uses
- FilmDirectorDetailPage --> movieApi : uses
- personApi --> PersonController : HTTP
- PersonController --> Person : queries
- Person --> Movie : references (filmography)

Tạo mã PlantUML hoàn chỉnh.
```

---

### 🎨 PROMPT 11: Kiến trúc tổng thể FilmDirectorPage

```
Vẽ sơ đồ Kiến trúc tổng thể cho phân hệ FilmDirectorPage bằng Draw.io hoặc PlantUML.

CẤU TRÚC 3 TẦNG:

1. PRESENTATION LAYER (Frontend - ReactJS):
   - FilmDirectorPage.jsx
   - Components: DirectorCard, FilterBar, Sidebar, Pagination, MobileDrawer
   - State Management: useState, useEffect, useSearchParams
   - API Client: personApi.js, movieApi.js

2. APPLICATION LAYER (Backend - Node.js/Express):
   - Routes: personRouter.js
   - Controllers: personController.js
   - Middleware: authMiddleware (optional cho like)

3. DATA LAYER (MongoDB):
   - Collection: persons (filter role=['director','both'])
   - Collection: movies (sidebar)
   - Indexes: role, nationality, viewCount, likeCount, isActive

LUỒNG DỮ LIỆU:
Client → Axios → Express Router → Controller → Mongoose → MongoDB → Response → Axios → React State → UI

API ENDPOINTS:
- GET /api/v1/persons/directors
- GET /api/v1/persons/nationalities?role=director
- POST /api/v1/persons/:id/like
- GET /api/v1/movies/now-showing

Tạo sơ đồ với các box, arrow và label tiếng Việt.
```

---

## PHẦN 3: MẪU NỘI DUNG HOÀN CHỈNH

### 📄 PROMPT 12: Viết toàn bộ nội dung 3.1.13 (FilmDirectorPage)

```
Viết nội dung hoàn chỉnh cho mục 3.1.13 trong báo cáo đồ án tốt nghiệp:

3.1.13. Phân tích yêu cầu phân hệ 10: Danh sách đạo diễn (FilmDirectorPage)
3.1.13.1. Mục tiêu và phạm vi phân hệ
3.1.13.2. Tác nhân và quyền hạn
3.1.13.3. Yêu cầu chức năng (FR)
3.1.13.4. Yêu cầu phi chức năng (NFR)
3.1.13.5. Quy tắc nghiệp vụ

[Sử dụng thông tin từ PROMPT 1]
[Format: markdown với bảng]
[Ngôn ngữ: Tiếng Việt học thuật]
```

---

### 📄 PROMPT 13: Viết toàn bộ nội dung 3.2.25 (Thiết kế FilmDirectorPage)

```
Viết nội dung hoàn chỉnh cho mục 3.2.25 trong báo cáo đồ án tốt nghiệp:

3.2.25. Thiết kế hệ thống – Danh sách đạo diễn (FilmDirectorPage)
3.2.25.1. Kiến trúc tổng thể phân hệ
3.2.25.2. Use Case Diagram
3.2.25.3. Activity Diagram – Luồng xem và lọc danh sách
3.2.25.4. Sequence Diagram – Toggle like đạo diễn
3.2.25.5. Class Diagram rút gọn

[Mỗi mục có mô tả ngắn + hình ảnh sơ đồ]
[Sử dụng PlantUML code từ PROMPT 3, 5, 7, 9, 11]
[Format: markdown]
```

---

## GHI CHÚ QUAN TRỌNG

1. **Nhất quán với code**: Tất cả nội dung phải phản ánh đúng implementation thực tế
2. **Không đạo văn**: Viết mới hoàn toàn dựa trên phân tích code
3. **Một nguồn duy nhất**: Source code là nguồn chính thống duy nhất
4. **Format chuẩn**: Giống format các phân hệ 1-9 đã có trong word.md
5. **Số thứ tự**:
   - Phân hệ 10 = 3.1.13 (phân tích), 3.2.25 (thiết kế)
   - Phân hệ 11 = 3.1.14 (phân tích), 3.2.26 (thiết kế)
