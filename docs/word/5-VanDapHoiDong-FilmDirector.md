# TÀI LIỆU VẤN ĐÁP HỘI ĐỒNG
## Phân hệ: Danh sách & Chi tiết Đạo diễn

---

# PHẦN 1: VẤN ĐÁP FILMDIRECTORPAGE (/dao-dien)

## A. PHẦN TRÌNH BÀY 1-2 PHÚT (Talk Track)

> *"Dạ thưa hội đồng, em xin trình bày về trang Danh sách đạo diễn.*
>
> **Về mục tiêu**: Trang này cho phép người dùng duyệt danh sách đạo diễn trong hệ thống. Có 2 nhóm đối tượng: Guest (khách vãng lai) có thể xem, lọc, sắp xếp và phân trang; User (thành viên) có thêm quyền thích/bỏ thích đạo diễn.
>
> **Về tính năng chính**, trang có 6 tính năng:
> 1. **Bộ lọc quốc tịch động**: Danh sách quốc tịch được fetch từ API, chỉ hiện quốc tịch có đạo diễn thật sự.
> 2. **Sắp xếp 3 tiêu chí**: Phổ biến nhất (viewCount), Mới nhất (createdAt), Được thích nhất (likeCount).
> 3. **Phân trang 10 đạo diễn/trang** với cuộn lên đầu khi chuyển trang.
> 4. **URL State Sync**: Đồng bộ bộ lọc với URL để hỗ trợ bookmark/share link.
> 5. **Like/Unlike với Optimistic Update**: Cập nhật UI ngay lập tức, lưu trạng thái vào localStorage, rollback khi API lỗi.
> 6. **Sidebar phim đang chiếu** và **Responsive drawer** cho mobile.
>
> **Về công nghệ**, em sử dụng React hooks (useState, useEffect, useRef), React Router useSearchParams, và Axios cho API calls."

---

## B. LUỒNG HOẠT ĐỘNG LOGIC XỬ LÝ

### Bước 1: Khởi tạo state từ URL params
```
Khi mount component:
├─ Đọc searchParams từ URL
├─ Lấy 'quoc-tich' → setSelectedNationality
├─ Lấy 'sap-xep' → setSelectedSort (default: 'popular')
└─ Lấy 'page' → setCurrentPage (default: 1)
```

### Bước 2: Tải dữ liệu song song
```
useEffect với dependency []  (mount 1 lần):
├─ fetchNationalities() → gọi API GET /persons/nationalities?role=director
│   └─ setNationalityOptions([{value:'', label:'Tất cả'}, ...data])
└─ fetchSidebarMovies() → gọi API GET /movies/now-showing?limit=3
    └─ setSidebarMovies(movies)

useEffect với dependency [nationality, sort, page]:
├─ loadDirectors()
├─ Map sortMap: 'popular'→'-viewCount', 'newest'→'-createdAt', 'mostLiked'→'-likeCount'
├─ Build params: {page, limit:10, sort, nationality?}
├─ Gọi API GET /persons/directors (params)
├─ setDirectors(data), setTotalPages, setTotalDirectors
└─ Khởi tạo likeStates từ localStorage cho từng director
```

### Bước 3: Filter/Sort/Page thay đổi
```
Khi user thay đổi filter/sort:
├─ setSelectedNationality/setSelectedSort
├─ Reset currentPage = 1 (nếu thay đổi filter/sort)
└─ Trigger useEffect tải lại dữ liệu

Khi user chuyển trang:
├─ setCurrentPage(newPage)
├─ window.scrollTo({ top: 0, behavior: 'smooth' })
└─ Trigger useEffect tải lại dữ liệu

Đồng bộ URL:
├─ useEffect theo [nationality, sort, page]
├─ Build URLSearchParams (chỉ set non-default values)
├─ Guard: if (params != searchParams) setSearchParams
└─ Tránh vòng lặp vô hạn bằng so sánh toString()
```

### Bước 4: Click card điều hướng
```
handleDirectorClick(slug):
└─ navigate(`/dao-dien-chi-tiet/${slug}`)
```

### Bước 5: Like/Unlike với Optimistic Update
```
handleToggleLike(directorId, event):
├─ e.stopPropagation() ← Chặn bubble lên card click
├─ if (likeLoading[directorId]) return ← Chống spam
├─
├─ Đọc trạng thái hiện tại:
│   ├─ prevLiked = localStorage.getItem(`director_liked_${id}`) === 'true'
│   └─ prevCount = likeStates[id].likeCount
├─
├─ Tính trạng thái mới:
│   ├─ nextLiked = !prevLiked
│   ├─ nextCount = prevLiked ? prevCount-1 : prevCount+1
│   └─ action = nextLiked ? 'like' : 'unlike'
├─
├─ Optimistic Update (trước khi gọi API):
│   ├─ setLikeLoading[id] = true
│   ├─ setLikeStates[id] = {liked: nextLiked, likeCount: nextCount}
│   └─ localStorage.setItem(`director_liked_${id}`, nextLiked)
├─
├─ Gọi API:
│   └─ togglePersonLikeAPI(id, action)
├─
├─ Thành công:
│   └─ Sync likeCount từ response (chính xác hơn client)
├─
└─ Thất bại (catch):
    ├─ Rollback localStorage
    ├─ Rollback likeStates về prev
    └─ setLikeLoading[id] = false
```

### Bước 6: Xử lý lỗi
```
API danh sách fail:
├─ console.error('Lỗi khi tải dữ liệu đạo diễn:', error)
├─ setDirectors([]) ← Empty list
├─ setTotalDirectors(0)
└─ setTotalPages(1)

API nationalities fail:
└─ setNationalityOptions([{value:'', label:'Tất cả'}]) ← Chỉ option mặc định

API like fail:
└─ Rollback (như trên)
```

---

## C. BỘ CÂU HỎI THƯỜNG GẶP (20 CÂU)

### 👤 Nhóm 1: Câu hỏi nghiệp vụ

**Q1: Người dùng chưa đăng nhập có thể like đạo diễn được không?**
> A: Hiện tại hệ thống cho phép cả Guest like bằng cách lưu trạng thái vào localStorage. Hướng cải tiến là yêu cầu login để like và lưu vào database theo userId.

**Q2: Tại sao phân trang 10 đạo diễn/trang mà không phải số khác?**
> A: 10 là con số cân bằng giữa UX (không quá ít gây nhiều click, không quá nhiều gây lag) và hiệu năng API. Có thể cấu hình qua biến `itemsPerPage`.

**Q3: Nếu user đang ở trang 5 rồi thay đổi filter, page sẽ như thế nào?**
> A: Khi thay đổi filter (quốc tịch hoặc sắp xếp), hệ thống tự động reset về page 1 để tránh trường hợp trang 5 mới chỉ có 2 đạo diễn.

**Q4: Bộ lọc quốc tịch có hardcode không?**
> A: Không. Danh sách quốc tịch được fetch động từ API `GET /persons/nationalities?role=director`, chỉ trả về quốc tịch có đạo diễn thật sự active trong DB.

---

### ⚛️ Nhóm 2: Câu hỏi kỹ thuật React

**Q5: Tại sao có 3 useEffect riêng biệt cho fetch?**
> A: Tách để quản lý tốt hơn: (1) nationalities chỉ fetch 1 lần khi mount, (2) sidebar movies chỉ fetch 1 lần, (3) directors fetch lại mỗi khi filter/sort/page thay đổi. Tránh re-fetch không cần thiết.

**Q6: URL sync có gây vòng lặp render vô hạn không?**
> A: Không, vì có guard `if (params.toString() !== searchParams.toString())`. Chỉ khi URL thực sự khác mới gọi setSearchParams.

**Q7: useEffect dependency array `[searchParams]` có vấn đề gì không?**
> A: Có thể gây re-render nếu searchParams object mới được tạo. Nhưng React Router tối ưu bằng cách giữ reference ổn định khi URL không đổi.

**Q8: Tại sao dùng `sortMap` để map sort UI với API param?**
> A: UI dùng tên thân thiện ('popular', 'newest'), nhưng API cần format sort của MongoDB ('-viewCount', '-createdAt'). Map này giúp decouple UI khỏi API contract.

---

### 🔄 Nhóm 3: Data Consistency

**Q9: Tại sao dùng localStorage thay vì database cho like state?**
> A: Để tranh thủ UX nhanh (không cần login) và giảm tải server. Trade-off: trạng thái không sync giữa các thiết bị. Cải tiến: khi có auth, lưu vào DB theo userId.

**Q10: Nếu 2 người cùng like 1 đạo diễn thì likeCount có chính xác không?**
> A: Có, vì sau optimistic update, hệ thống sync lại likeCount từ server response. Server là nguồn truth duy nhất.

**Q11: Rollback like khi lỗi hoạt động thế nào?**
> A: Lưu `prevLiked` và `prevCount` trước khi update. Trong catch block: (1) rollback localStorage, (2) rollback likeStates, (3) log error.

**Q12: Nếu user spam click Like 10 lần liên tiếp thì sao?**
> A: Có `likeLoading[directorId]` guard. Khi đang gọi API, click tiếp sẽ bị return sớm. Chỉ 1 request được gửi đi.

---

### ⚡ Nhóm 4: Hiệu năng / UX

**Q13: Fetch nationalities và sidebar có song song không?**
> A: Có, cả 2 đều trong useEffect với `[]` dependency, chạy đồng thời khi mount. Không cần Promise.all vì independent.

**Q14: Có debounce khi thay đổi filter không?**
> A: Hiện không có. Filter là dropdown nên mỗi click = 1 lần chọn. Nếu có search text input thì nên debounce.

**Q15: Tại sao scroll lên đầu khi chuyển trang?**
> A: UX tốt hơn. Khi user click page 2, họ muốn xem từ đầu trang 2, không phải giữa trang.

**Q16: Loading state hiển thị như thế nào?**
> A: Dùng full-screen spinner với position: fixed khi `loading === true`. Khi data load xong, spinner ẩn và content render.

---

### ⚠️ Nhóm 5: Lỗi / Edge Case

**Q17: Nếu không có đạo diễn nào (empty list) thì UI hiển thị gì?**
> A: Hiển thị message "Không tìm thấy đạo diễn nào" với icon rỗng. directors = [] nên không có card nào render.

**Q18: Nếu user nhập URL với quốc tịch không tồn tại thì sao?**
> A: API trả về empty array. UI hiển thị "Không tìm thấy" + bộ lọc vẫn hiện quốc tịch user nhập (từ URL param).

**Q19: API timeout thì xử lý thế nào?**
> A: catch block set directors = [], totalPages = 1. User thấy empty state và có thể refresh. Cần cải tiến: hiển thị error message + nút retry.

---

### 🔒 Nhóm 6: Bảo mật

**Q20: Like có cần login không?**
> A: Hiện không cần. Trạng thái lưu localStorage. Risk: spam từ nhiều browser. Cải tiến: rate limit ở backend, yêu cầu auth, captcha.

---

## D. 5 CÂU HỎI GÀI / PHẢN BIỆN

### 🔥 Gài 1: "Vì sao dùng localStorage mà không dùng Database để lưu like?"

> **Gợi ý trả lời:**
> "Dạ hiện tại hệ thống đang ưu tiên trải nghiệm nhanh, cho phép Guest like mà không cần login. Trade-off là trạng thái không sync giữa các thiết bị. Khi em triển khai authentication đầy đủ, em sẽ:
> 1. Lưu like vào collection `PersonLikes` với userId + personId
> 2. Vẫn giữ localStorage làm cache để optimistic update
> 3. Backend validate để tránh duplicate like"

---

### 🔥 Gài 2: "URL sync có gây vòng lặp render vô hạn không?"

> **Gợi ý trả lời:**
> "Dạ không ạ, vì em có guard comparison: `if (params.toString() !== searchParams.toString())`.
> - Khi state thay đổi → tính params mới → so sánh với URL hiện tại
> - Chỉ khi khác mới gọi setSearchParams
> - setSearchParams trigger re-render, nhưng lần render tiếp params === searchParams → không gọi tiếp
> - Vòng lặp bị chặn ở bước comparison"

---

### 🔥 Gài 3: "Optimistic update sai dữ liệu thì sao? Ví dụ likeCount server là 100 nhưng client hiện 101?"

> **Gợi ý trả lời:**
> "Dạ sau khi gọi API thành công, em luôn sync lại likeCount từ response:
> ```javascript
> setLikeStates(prev => ({
>   ...prev,
>   [directorId]: { liked: nextLiked, likeCount: res.data.likeCount }
> }));
> ```
> Server response là source of truth cuối cùng. Client chỉ optimistic để UX nhanh hơn, nhưng không phải truth."

---

### 🔥 Gài 4: "Nếu user mở 2 tab, like ở tab 1, tab 2 có cập nhật không?"

> **Gợi ý trả lời:**
> "Dạ không tự động cập nhật. localStorage không có event listener cross-tab trong code hiện tại. Khi refresh tab 2, trạng thái sẽ đồng bộ vì đọc lại localStorage. Cải tiến:
> 1. Dùng `window.addEventListener('storage', ...)` để listen cross-tab changes
> 2. Hoặc dùng state management như Redux persist"

---

### 🔥 Gài 5: "Bạn có chống được bot spam like không?"

> **Gợi ý trả lời:**
> "Dạ ở frontend em có `likeLoading` chống spam click. Tuy nhiên bot có thể bypass bằng cách gọi API trực tiếp. Cần bổ sung ở backend:
> 1. Rate limiting: max 10 like/phút/IP
> 2. Yêu cầu authentication
> 3. CAPTCHA nếu detect pattern bất thường
> 4. Check fingerprint hoặc session"

---

# PHẦN 2: VẤN ĐÁP FILMDIRECTORDETAILPAGE (/dao-dien-chi-tiet/:slug)

## A. PHẦN TRÌNH BÀY 1-2 PHÚT (Talk Track)

> *"Dạ thưa hội đồng, em xin trình bày về trang Chi tiết đạo diễn.*
>
> **Về mục tiêu**: Trang hiển thị thông tin đầy đủ của một đạo diễn, bao gồm tiểu sử, gallery ảnh, và các phim đã đạo diễn.
>
> **Về thành phần UI**:
> - Thông tin cá nhân: avatar, tên, ngày sinh, chiều cao, quốc tịch, nơi sinh, nghề nghiệp
> - Tiểu sử ngắn và đầy đủ
> - Gallery với lightbox, điều khiển prev/next, autoplay 3 giây
> - Filmography grid với điều hướng sang chi tiết phim
> - Breadcrumb và sidebar phim đang chiếu
>
> **Về các cơ chế đặc biệt**, trang có 4 cơ chế đáng chú ý:
> 1. **Fetch song song** đạo diễn và sidebar movies
> 2. **Chống race condition** khi user đổi slug nhanh (fetchSeqRef)
> 3. **Chống double-call** trong React StrictMode (viewIncrementedRef)
> 4. **View cooldown 24h** lưu localStorage để tránh spam view
> 5. **Like optimistic update** với rollback khi lỗi"

---

## B. LUỒNG HOẠT ĐỘNG LOGIC XỬ LÝ

### Bước 1-2: Nhận slug và fetch song song
```
const { slug } = useParams()
const fetchSeqRef = useRef(0) ← Chống race condition

useEffect [slug] (Effect A - Fetch Director):
├─ setLoading(true), setDirector(null), setNotFound(false)
├─ const currentSeq = ++fetchSeqRef.current ← Increment sequence
├─
├─ Promise.all([
│   getPersonBySlugAPI(slug),
│   getNowShowingMoviesAPI(5)
│ ])
├─
├─ if (currentSeq !== fetchSeqRef.current) return ← RACE GUARD: bỏ response cũ
├─
├─ Kiểm tra dữ liệu:
│   └─ if (!person || !['director','both'].includes(person.role))
│       → setNotFound(true), return
├─
├─ setDirector(person)
├─ setSidebarMovies(movies)
└─ setLoading(false)
```

### Bước 3: Chống race condition khi đổi slug nhanh
```
Scenario: User click đạo diễn A → fetch A bắt đầu
          User click đạo diễn B ngay sau → fetch B bắt đầu
          Fetch A trả về sau fetch B (network latency)

Vấn đề: Không có guard → Kết quả A ghi đè B → Hiển thị sai

Giải pháp (fetchSeqRef):
├─ Mỗi lần fetch, increment seq: currentSeq = ++fetchSeqRef.current
├─ Fetch A: currentSeq = 1
├─ Fetch B: currentSeq = 2 (fetchSeqRef.current = 2)
├─ Fetch A response về: check 1 !== 2 → BỎ QUA
├─ Fetch B response về: check 2 === 2 → XỬ LÝ
└─ Kết quả: Luôn hiển thị đúng người cuối cùng được click
```

### Bước 4: Kiểm tra và hiển thị 404
```
Điều kiện 404:
├─ Không tìm thấy person trong DB (API 404)
├─ Hoặc person.role không phải 'director' hoặc 'both'
└─
Khi 404:
├─ setNotFound(true)
├─ Render UI: "Không tìm thấy đạo diễn" + Nút "Quay lại danh sách"
└─ Không render phần chi tiết
```

### Bước 5: Render với fallback
```
Với mỗi field có thể null/undefined:
├─ birthDate: format hoặc "Đang cập nhật"
├─ height: `${height} cm` hoặc "Đang cập nhật"
├─ nationality: value hoặc "Đang cập nhật"
├─ birthPlace: value hoặc "Đang cập nhật"
├─ occupation: value hoặc "Đang cập nhật"
└─ shortBio/fullBio: text hoặc không hiển thị section
```

### Bước 6: Luồng tăng View Count
```
useEffect [director?._id] (Effect B - Increment View):
├─ if (!director?._id) return ← Chờ có director
├─
├─ const id = director._id
├─ const viewKey = `director_view_${id}`
├─ const now = Date.now()
├─ const lastViewTime = Number(localStorage.getItem(viewKey) || 0)
├─
├─ // COOLDOWN CHECK (24h = 86400000ms)
├─ if (lastViewTime && (now - lastViewTime) <= 86400000) return
├─
├─ // STRICTMODE GUARD
├─ if (viewIncrementedRef.current[id]) return
├─ viewIncrementedRef.current[id] = true
├─
├─ // QUAN TRỌNG: Set localStorage TRƯỚC API để effect lần 2 thấy và bỏ qua
├─ localStorage.setItem(viewKey, String(now))
├─
├─ // OPTIMISTIC UPDATE
├─ setDirector(prev => ({...prev, viewCount: (prev.viewCount || 0) + 1}))
├─
├─ // CALL API
├─ incrementPersonViewAPI(id)
│   .then(res => {
│       const serverCount = res?.data?.viewCount
│       if (typeof serverCount === 'number')
│           setDirector(prev => ({...prev, viewCount: serverCount})) ← Sync từ server
│   })
│   .catch(err => console.error) ← Không rollback view (metric đã tăng ở server)
```

### Bước 7: Luồng Like/Unlike
```
handleToggleLike():
├─ if (!director?._id) return
├─ if (likeLoading) return ← Chống spam
├─
├─ Đọc trạng thái:
│   ├─ likeKey = `director_liked_${id}`
│   ├─ currentLiked = localStorage.getItem(likeKey) === 'true'
│   └─ prevCount = director.likeCount || 0
├─
├─ setLikeLoading(true)
├─
├─ Optimistic Update:
│   ├─ newLiked = !currentLiked
│   ├─ action = newLiked ? 'like' : 'unlike'
│   ├─ setIsLiked(newLiked)
│   ├─ localStorage.setItem(likeKey, newLiked.toString())
│   └─ setDirector(prev => ({...prev, likeCount: newLiked ? prev+1 : prev-1}))
├─
├─ try: togglePersonLikeAPI(id, action)
│   └─ Sync likeCount từ response
├─
└─ catch: Rollback tất cả (localStorage, isLiked, likeCount)
└─ finally: setLikeLoading(false)
```

### Bước 8: Gallery Lightbox
```
handleOpenGallery(index):
├─ setCurrentImageIndex(index)
└─ setOpenGallery(true)

handleNextImage():
└─ setCurrentImageIndex((prev + 1) % photos.length)

handlePrevImage():
└─ setCurrentImageIndex((prev - 1 + photos.length) % photos.length)

Autoplay useEffect [openGallery, isAutoPlay, photos.length]:
├─ if (openGallery && isAutoPlay && photos.length > 1):
│   └─ interval = setInterval(handleNextImage, 3000)
├─ return () => clearInterval(interval) ← CLEANUP tránh memory leak
```

---

## C. BỘ CÂU HỎI THƯỜNG GẶP (25 CÂU)

### 🔗 Nhóm 1: Slug Routing và Fetch

**Q1: Slug là gì và tại sao dùng slug thay vì ID?**
> A: Slug là URL-friendly version của tên (VD: "park-chan-wook"). Ưu điểm: SEO tốt hơn, dễ đọc cho user. ID dạng ObjectId khó nhớ.

**Q2: Nếu đổi tên đạo diễn thì slug có đổi không?**
> A: Tùy thuộc vào business logic. Hiện tại slug được generate từ `name` khi create. Nếu edit name, cần regenerate slug hoặc giữ slug cũ (recommend để không break bookmarks).

**Q3: API gọi bằng slug hay ID?**
> A: Frontend gọi bằng slug (`GET /persons/:slug`), backend tìm bằng `{ slug }` trong MongoDB.

---

### ⚠️ Nhóm 2: Xử lý 404 + Fallback

**Q4: Điều kiện nào trigger 404?**
> A: 2 điều kiện: (1) Không tìm thấy person với slug đó, (2) Tìm thấy nhưng role không phải 'director' hoặc 'both'.

**Q5: Tại sao check role, không chỉ check slug?**
> A: Vì có thể có diễn viên (role='actor') trùng slug. Trang /dao-dien-chi-tiet chỉ dành cho đạo diễn.

**Q6: Fallback "Đang cập nhật" dùng khi nào?**
> A: Khi field như birthDate, height, nationality là null/undefined. Thay vì hiển thị empty, cho user biết data chưa có.

---

### ⏱️ Nhóm 3: View Cooldown 24h

**Q7: Tại sao cần cooldown 24h cho view count?**
> A: Tránh user spam F5 để tăng view ảo. 24h là khoảng thời gian hợp lý.

**Q8: Cooldown lưu ở đâu?**
> A: localStorage với key `director_view_{id}`, value là timestamp (milliseconds).

**Q9: Nếu user xóa localStorage thì view có tăng lại không?**
> A: Có, đây là limitation của client-side approach. Cải tiến: lưu thêm ở backend theo IP hoặc session.

**Q10: Công thức check cooldown là gì?**
> A: `if (now - lastViewTime <= 86400000) return;` với 86400000 = 24h * 60m * 60s * 1000ms.

---

### ⚛️ Nhóm 4: StrictMode Double-call

**Q11: React StrictMode là gì? Tại sao nó "double call"?**
> A: StrictMode chạy useEffect 2 lần (mount → unmount → mount) trong development để phát hiện side-effect bugs. Production không có.

**Q12: Tại sao view tăng 2 lần trong StrictMode nếu không có guard?**
> A: Effect chạy 2 lần → gọi API 2 lần → view +2 thay vì +1.

**Q13: Bạn chặn bằng cách nào?**
> A: Dùng `useRef` (viewIncrementedRef) với object `{[id]: true}`. Lần chạy thứ 2, check thấy đã true → return.

**Q14: Tại sao dùng useRef mà không phải useState?**
> A: useRef không trigger re-render, phù hợp cho flag check. useState sẽ gây re-render không cần thiết.

---

### 🏎️ Nhóm 5: Race Condition

**Q15: Race condition xảy ra thế nào?**
> A: User click nhanh từ đạo diễn A → B. Fetch A bắt đầu, fetch B bắt đầu. Nếu A response về sau B (network latency), data A ghi đè B → hiển thị sai.

**Q16: fetchSeqRef giải quyết thế nào?**
> A: Mỗi fetch được gán sequence number. Khi response về, check sequence === current. Nếu không khớp → bỏ qua response đó.

**Q17: Có cách khác ngoài fetchSeqRef không?**
> A: Có: (1) AbortController để cancel request cũ, (2) React Query với staleTime, (3) Thư viện như SWR. fetchSeqRef là cách đơn giản nhất.

---

### ❤️ Nhóm 6: Like Optimistic + Rollback

**Q18: Optimistic update nghĩa là gì?**
> A: Cập nhật UI ngay lập tức trước khi có response từ server. Nếu API fail thì rollback. Tạo cảm giác app nhanh.

**Q19: Rollback like hoạt động thế nào?**
> A: Lưu `prevLiked` và `prevCount` trước khi optimistic. Trong catch: (1) localStorage.setItem(likeKey, prevLiked), (2) setIsLiked(prevLiked), (3) setDirector(prevCount).

**Q20: Nếu mạng chậm, user click like 2 lần thì sao?**
> A: likeLoading guard. Khi đang gọi API, button disabled, click tiếp bị return sớm.

---

### 🖼️ Nhóm 7: Gallery Autoplay

**Q21: Autoplay interval là bao lâu?**
> A: 3 giây (3000ms).

**Q22: Tại sao cần clearInterval trong cleanup?**
> A: Tránh memory leak. Khi close lightbox hoặc unmount component, interval phải được clear nếu không nó tiếp tục chạy.

**Q23: Nếu ảnh lỗi (broken image) thì xử lý thế nào?**
> A: Hiện chưa có onError handler. Cần thêm: `<img onError={(e) => e.target.src = '/fallback.jpg'} />`

---

### 🎬 Nhóm 8: Filmography

**Q24: Filmography lấy từ dữ liệu nào?**
> A: Trong document Person có field `filmography: [{movie: ObjectId, role: String}]`. Khi populate, có thông tin phim.

**Q25: Click phim điều hướng thế nào?**
> A: `navigate('/phim/' + movie.slug)` hoặc dùng `<Link to={/phim/${slug}}>`.

---

## D. 7 CÂU HỎI GÀI / PHẢN BIỆN

### 🔥 Gài 1: "Cooldown view bằng localStorage có lách được không?"

> **Gợi ý trả lời:**
> "Dạ có thể lách bằng cách: xóa localStorage, dùng incognito mode, hoặc đổi browser. Đây là trade-off của client-side tracking. Cải tiến:
> 1. Backend lưu view log theo IP + timestamp
> 2. Rate limit: max 1 view/IP/24h cho mỗi đạo diễn
> 3. Kết hợp fingerprinting (không 100% chính xác nhưng tốt hơn)"

---

### 🔥 Gài 2: "Nếu mở 2 tab cùng đạo diễn, view có tăng 2 lần không?"

> **Gợi ý trả lời:**
> "Dạ không ạ. Vì localStorage được chia sẻ giữa các tab cùng origin.
> - Tab 1 set localStorage trước khi gọi API
> - Tab 2 đọc localStorage, thấy còn trong cooldown → return
> - Chỉ có 1 view được tính
>
> Tuy nhiên nếu 2 tab load đồng thời (cùng millisecond trước khi localStorage được set), có thể tăng 2. Cần backend dedup."

---

### 🔥 Gài 3: "Tại sao phải sync viewCount từ server sau optimistic?"

> **Gợi ý trả lời:**
> "Optimistic chỉ là dự đoán (+1). Thực tế:
> - Có thể nhiều user khác cũng đang view → server count cao hơn
> - Có thể API increment nhiều hơn 1 (edge case)
> - Server là source of truth
>
> Sync đảm bảo client hiển thị giá trị chính xác sau khi API thành công."

---

### 🔥 Gài 4: "Nếu API trả về role là 'actor' thay vì 'director' thì sao?"

> **Gợi ý trả lời:**
> "Dạ code có check:
> ```javascript
> if (!['director', 'both'].includes(person.role)) {
>   setNotFound(true);
>   return;
> }
> ```
> Nếu role là 'actor', trang hiển thị 404 'Không tìm thấy đạo diễn'. Đây là validation layer để đảm bảo trang /dao-dien-chi-tiet chỉ hiển thị đạo diễn."

---

### 🔥 Gài 5: "fetchSeqRef là gì? Tại sao cần nó?"

> **Gợi ý trả lời:**
> "fetchSeqRef là useRef lưu 'sequence number' của request. Mỗi lần fetch mới, em increment nó. Khi response về, em check sequence của request đó có bằng current không.
>
> Nếu user click đạo diễn A rồi B nhanh:
> - Request A: seq = 1
> - Request B: seq = 2, fetchSeqRef.current = 2
> - Response A về: check 1 !== 2 → bỏ qua
> - Response B về: check 2 === 2 → xử lý
>
> Không có nó, response A (chậm hơn) sẽ ghi đè B → hiển thị sai đạo diễn."

---

### 🔥 Gài 6: "Làm sao kiểm thử được luồng autoplay + cleanup?"

> **Gợi ý trả lời:**
> "Dạ có 3 cách test:
> 1. **Manual**: Mở lightbox, đợi > 3s, xem ảnh có tự chuyển không. Đóng lightbox, check console xem có interval error không.
> 2. **Unit test với Jest**: Mock setInterval, verify cleanup được gọi khi unmount.
> 3. **React DevTools Profiler**: Check interval có bị leak qua memory consumption.
>
> Em đã test manual và confirm cleanup hoạt động."

---

### 🔥 Gài 7: "Tại sao tách Effect A (fetch director) và Effect B (increment view)?"

> **Gợi ý trả lời:**
> "Dạ ban đầu em để chung, nhưng gặp 2 vấn đề:
> 1. **Race condition**: increment view chạy trước khi director data về → lỗi vì chưa có ID
> 2. **StrictMode double fetch**: cả fetch và increment đều bị double
>
> Tách ra:
> - Effect A [slug]: Fetch data, chống race với fetchSeqRef
> - Effect B [director?._id]: Chỉ chạy khi director có ID, chống StrictMode với viewIncrementedRef
>
> Mỗi effect có concerns riêng, dễ maintain hơn."

---

# PHẦN 3: CÂU HỎI SO SÁNH & TỔNG HỢP

## A. 10 Câu hỏi So sánh

**Q1: State management ở 2 trang khác nhau thế nào?**
> A:
> - FilmDirectorPage: Quản lý list (directors[], pagination, nhiều filter states)
> - FilmDirectorDetailPage: Quản lý single object (director{}, gallery states)
> List phức tạp hơn vì có sorting, filtering, pagination.

**Q2: URL params sync có ở cả 2 trang không?**
> A: Chỉ FilmDirectorPage có URL sync (quoc-tich, sap-xep, page). FilmDirectorDetailPage dùng slug trong path, không cần query params.

**Q3: Tối ưu fetch dữ liệu khác nhau thế nào?**
> A:
> - FilmDirectorPage: 3 useEffect riêng biệt (nationalities, sidebar, directors)
> - FilmDirectorDetailPage: Promise.all cho director + sidebar (song song)
> Detail page dùng Promise.all vì cả 2 data cần render cùng lúc.

**Q4: Optimistic update có ở cả 2 trang không?**
> A: Có, cả 2 đều có:
> - Like: Cập nhật UI ngay, rollback khi lỗi (giống nhau)
> - View (chỉ DetailPage): Cập nhật +1 ngay, sync từ server
> Logic giống nhau nhưng DetailPage thêm view.

**Q5: Xử lý lỗi khác nhau thế nào?**
> A:
> - FilmDirectorPage (empty list): Hiển thị "Không tìm thấy" với icon rỗng
> - FilmDirectorDetailPage (404): Hiển thị page 404 với nút quay lại
> Chi tiết nghiêm trọng hơn vì user chờ xem 1 người cụ thể.

**Q6: UX navigation khác gì?**
> A:
> - List: Pagination (cuộn lên khi chuyển page)
> - Detail: Breadcrumb + Gallery navigation (prev/next/autoplay)
> List cần di chuyển qua nhiều trang, Detail cần explore sâu trong 1 entity.

**Q7: LocalStorage dùng khác nhau thế nào?**
> A: Cả 2 dùng cho like (`director_liked_{id}`). DetailPage thêm view cooldown (`director_view_{id}`). Key format nhất quán.

**Q8: Loading state hiển thị khác thế nào?**
> A: Cả 2 dùng full-screen spinner. DetailPage có thêm notFound state cho 404.

**Q9: Sidebar movies có ở cả 2 trang không?**
> A: Có, cả 2 đều fetch `getNowShowingMoviesAPI`. Logic giống nhau, có thể extract thành custom hook `useSidebarMovies()`.

**Q10: Mobile responsive khác thế nào?**
> A:
> - List: Filter drawer (hidden on desktop, slide-in on mobile)
> - Detail: Gallery dialog, filmography grid responsive
> List cần hide filter để tiết kiệm không gian.

---

## B. 5 Câu hỏi Data Consistency

**Q11: localStorage có risk gì về data consistency?**
> A: Không sync giữa devices, có thể bị xóa bởi user, không auth-protected. Cải tiến: dùng backend storage với userId.

**Q12: Rollback mechanism hoạt động thế nào?**
> A: Lưu prevState trước optimistic update. Trong catch block: (1) Restore localStorage, (2) Restore React state, (3) Log error.

**Q13: Sync server count sau optimistic có race condition không?**
> A: Không, vì sync chỉ xảy ra sau API thành công. Nếu có race (2 likes cùng lúc), server count vẫn đúng vì dùng $inc atomic.

**Q14: Nếu API succeed nhưng server count sai so với client?**
> A: Client luôn dùng server count (`res.data.likeCount`). Server là source of truth.

**Q15: Có cần locking mechanism khi nhiều user like cùng lúc không?**
> A: Không cần ở client. MongoDB $inc là atomic operation, tự handle concurrent updates.

---

## C. 5 Câu hỏi Testing

**Q16: Làm sao test filter/sort/pagination?**
> A:
> - Unit: Mock API, verify params được build đúng
> - Integration: Render component, interact với filter, verify directors list thay đổi
> - E2E: Cypress click dropdown, select option, assert results

**Q17: Làm sao test optimistic update + rollback?**
> A:
> 1. Mock API để return error
> 2. Click like, verify UI updated
> 3. Wait API response, verify UI rolled back
> 4. Check localStorage also rolled back

**Q18: Làm sao test view cooldown 24h?**
> A:
> 1. Clear localStorage, visit page, verify view +1
> 2. Refresh, verify view không tăng
> 3. Set localStorage timestamp > 24h ago, refresh, verify view +1

**Q19: Làm sao test gallery autoplay?**
> A:
> 1. Open lightbox, wait 3s, assert currentIndex changed
> 2. Click pause, wait 3s, assert currentIndex NOT changed
> 3. Close lightbox, verify no setInterval errors

**Q20: Làm sao test race condition?**
> A:
> 1. Mock API với delay khác nhau (A: 500ms, B: 100ms)
> 2. Click A, immediately click B
> 3. Assert final render shows B (not A)

---

## D. 5 Câu hỏi Cải tiến

**Q21: Có thể thêm caching không?**
> A: Có:
> - React Query với staleTime cho list/detail
> - SWR với revalidateOnFocus: false
> - Redux persist cho offline support
> Reduce API calls, improve UX.

**Q22: Có cần debounce filter không?**
> A: Dropdown không cần (1 click = 1 selection). Nếu thêm search input thì cần debounce 300-500ms.

**Q23: Rate limit view/like như thế nào?**
> A: Backend middleware:
> - Redis với IP key + expiry
> - Max 10 likes/minute/IP
> - Max 1 view/IP/24h/person

**Q24: SSR/SEO có thể triển khai không?**
> A: Có với Next.js:
> - getServerSideProps cho detail page (SEO important)
> - getStaticProps + revalidate cho list (can cache)
> Meta tags từ director data.

**Q25: Accessibility cần cải thiện gì?**
> A:
> - aria-labels cho buttons
> - Keyboard navigation cho gallery
> - Focus management trong dialog
> - Color contrast cho icons

---

**Chúc bạn vấn đáp thành công! 🎓**
