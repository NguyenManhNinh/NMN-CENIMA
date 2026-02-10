

TRƯỜNG ĐẠI HỌC THÀNH ĐÔ
NGÀNH CÔNG NGHỆ THÔNG TIN




ĐỀ CƯƠNG ĐỒ ÁN TỐT NGHIỆP
Đề tài: Xây dựng Website quản lý rạp chiếu phim tích hợp thanh toán trực tuyến và AI chatbot
                Sinh viên: Nguyễn Mạnh Ninh                 Mã SV: 2200571
               Lớp: D101A1K14		 	         Ngành: CNTT
               Học phần: Đồ án tốt nghiệp
               Giảng viên hướng dẫn: TS. Vũ Hoàng Anh
LỜI MỞ ĐẦU
Trong những năm gần đây, ngành công nghiệp điện ảnh và giải trí phát triển mạnh mẽ, kéo theo nhu cầu hiện đại hóa vận hành và nâng cao trải nghiệm khách hàng tại các rạp chiếu phim.
Tuy nhiên, ở nhiều mô hình rạp vừa và nhỏ, việc đặt vé thủ công, quản lý suất chiếu rời rạc và thiếu kênh tương tác hỗ trợ khách hàng vẫn là các “điểm nghẽn”, gây bất tiện và làm giảm hiệu quả vận hành.
Xuất phát từ bối cảnh đó đề tài “Xây dựng Website quản lý rạp chiếu phim tích hợp thanh toán trực tuyến và AI chatbot” được thực hiện nhằm xây dựng một hệ thống website toàn diện: vừa hỗ trợ khách hàng tra cứu thông tin, đặt vé thuận tiện vừa cung cấp công cụ quản trị đầy đủ nghiệp vụ cho rạp chiếu phim. Điểm nhấn của đề tài là hệ thống đặt vé theo thời gian thực, tích hợp cổng thanh toán trực tuyến VNPay và trợ lý ảo AI ChatBot để tự động hóa tư vấn – hỗ trợ, góp phần tối ưu trải nghiệm người dùng và nâng cao hiệu quả vận hành.
Bên cạnh đó, thực tế tại Việt Nam cho thấy nhiều doanh nghiệp đã triển khai hoạt động thương mại hóa trên Internet, nhưng do những khó khăn về cơ sở hạ tầng và dịch vụ chưa tối ưu, không ít mô hình vẫn chỉ dừng ở mức giới thiệu sản phẩm và tiếp cận đơn hàng qua web. Vì vậy, với mong muốn đóng góp thúc đẩy tính ứng dụng của thương mại điện tử trong lĩnh vực giải trí, em đã nghiên cứu và xây dựng sản phẩm theo đề tài trên.
Trong quá trình thực hiện đồ án, em đã nhận được sự hướng dẫn tận tình của thầy Vũ Hoàng Anh. Dù đã cố gắng tìm hiểu, phân tích, thiết kế và cài đặt hệ thống, báo cáo chắc chắn vẫn khó tránh khỏi thiếu sót. Em kính mong nhận được sự thông cảm và các ý kiến góp ý của quý thầy cô để em hoàn thiện hơn. Em xin chân thành cảm ơn.




CHƯƠNG 1: TỔNG QUAN VỀ ĐỀ TÀI.
         1.1. Lý do lựa chọn đề tài
         1.2. Mục đích và phạm vi của đề tài
         1.3. Các nội dung chính của báo cáo
CHƯƠNG 2: CƠ SỞ LÝ THUYẾT
2.1. Tổng quan về thương mại điện tử trong lĩnh vực dịch vụ giải trí
2.2. Công nghệ chính được sử dụng(ReactJS,Node,MongoDB)
CHƯƠNG 3: PHÂN TÍCH, THIẾT KẾ VÀ TRIỂN KHAI HỆ THỐNG
3.1. Phân tích yêu cầu bài toán
3.2. Thiết kế hệ thống
3.3. Thiết kế cơ sở dữ liệu
3.4. Mô tả hệ thống
3.5. Các bước cài đặt
CHƯƠNG 4: KẾT LUẬN
4.1. Tóm tắt kết quả đạt được
4.2. Kết quả đạt được so với các hệ thống tương tự
4.3. Các ứng dụng thực tế của hệ thống
4.4. Hướng phát triển và nghiên cứu tiếp theo
Ngày giao đề tài	: 15 tháng 12 năm 2025
Ngày hoàn thành	: 15 tháng 03 năm 2026
Hà Nội, ngày … tháng … năm 2026
Viện QT & CN                      Ngành CNTT           	 GV hướng dẫn


                               	ThS. Nguyễn Văn Diễn



CHƯƠNG 1.TỔNG QUAN VỀ ĐỀ TÀI
1.1.	Lý do chọn đề tài
Chuyển đổi số đang trở thành định hướng trọng tâm trong phát triển kinh tế – xã hội tại Việt Nam, hướng tới xây dựng Chính phủ số, kinh tế số, xã hội số, đồng thời thúc đẩy hình thành các doanh nghiệp công nghệ số có năng lực cạnh tranh và vươn ra toàn cầu.
Theo tầm nhìn đến năm 2030, chuyển đổi số hướng tới đổi mới căn bản hoạt động quản lý – điều hành, hoạt động sản xuất kinh doanh của doanh nghiệp và phương thức sống, làm việc của người dân trên môi trường số an toàn, rộng khắp. Trong bối cảnh đó, lĩnh vực dịch vụ – giải trí cũng cần ứng dụng công nghệ để nâng cao trải nghiệm khách hàng và tối ưu vận hành.
Thực tiễn vận hành tại nhiều rạp chiếu phim quy mô vừa và nhỏ cho thấy các nghiệp vụ như quản lý phim – suất chiếu – phòng chiếu, đặt vé và hỗ trợ khách hàng có thể còn rời rạc hoặc phụ thuộc thao tác thủ công, dễ phát sinh bất tiện như khó theo dõi tình trạng ghế theo thời gian thực, quy trình thanh toán thiếu đồng bộ, và hạn chế kênh tư vấn/giải đáp tức thời cho khách hàng.
Vì vậy đề tài “Xây dựng website quản lý rạp chiếu phim tích hợp thanh toán trực tuyến và AI ChatBot” được lựa chọn là như một bài toán ứng dụng chuyển đổi số trong dịch vụ giải trí hướng tới số hóa quy trình đặt vé quản trị tập trung và tăng cường hỗ trợ khách hàng bằng công nghệ
1.2.	Mục đích và phạm vị của đề tài
1.2.1. Mục đích
Đồ án hướng tới các mục tiêu chính sau:
Xây dựng website hỗ trợ khách hàng tra cứu thông tin phim/lịch chiếu, đặt vé trực tuyến, chọn ghế trực quan theo thời gian thực và thanh toán online.
Xây dựng hệ thống quản trị hỗ trợ rạp chiếu quản lý tập trung các nghiệp vụ: phim, rạp, phòng chiếu, suất chiếu, vé, đơn hàng, khuyến mãi và theo dõi hoạt động vận hành.
Tích hợp thanh toán trực tuyến nhằm hoàn thiện luồng đặt vé theo hướng số hóa dịch vụ, phù hợp định hướng phát triển kinh tế số.
Tích hợp AI Chatbot hỗ trợ hỏi đáp/tra cứu thông tin, góp phần cải thiện trải nghiệm và giảm tải hỗ trợ thủ công.
Đảm bảo các yêu cầu cơ bản về ổn định và bảo mật trong phạm vi đồ án.
1.2.2.	Pham vi
Phạm vi chức năng phía khách hàng:
Xem danh sách phim, xem chi tiết phim, phân loại phim (đang chiếu/sắp chiếu).
Xem lịch chiếu theo phim/rạp/ngày, lựa chọn suất chiếu.
Chọn ghế theo sơ đồ phòng chiếu, tạo đơn hàng và thanh toán trực tuyến.
Nhận/xem thông tin vé (mã QR) qua email, xem lịch sử đặt vé; áp dụng voucher/khuyến mãi.
Tương tác với AI Chatbot để tra cứu thông tin liên quan.
Phạm vi chức năng phía quản trị:
Quản lý dữ liệu phim (CRUD), poster/banner, trạng thái phim.
Quản lý rạp, phòng chiếu, sơ đồ ghế; quản lý suất chiếu và kiểm tra trùng lịch.
Quản lý đơn hàng, thanh toán, vé; quản lý voucher/combo/khuyến mãi.
Quản lý nội dung CMS cơ bản (bài viết, sự kiện, FAQ, phản hồi).
Báo cáo thống kê cơ bản (doanh thu, top phim, tỷ lệ lấp đầy…).
Phạm vi kỹ thuật:
Hệ thống phát triển theo mô hình web, frontend và backend tách rời.
CSDL MongoDB; backend Node.js/Express; frontend ReactJS.
Tích hợp VNPay và AI Chatbot (Gemini) trong phạm vi demo/đồ án.
Triển khai Docker phục vụ kiểm thử và trình bày.
1.3.	Các nội dung chính của báo cáo
Chương 1: Tổng quan về đề tài
Trình bày bối cảnh chuyển đổi số và sự cần thiết áp dụng trong dịch vụ; nêu lý do chọn đề tài, mục tiêu và phạm vi triển khai; xác định đối tượng sử dụng (khách hàng, quản trị) và phạm vi kỹ thuật của hệ thống.
Chương 2: Cơ sở lý thuyết
Trình bày tổng quan nghiệp vụ đặt vé trực tuyến và các thành phần công nghệ sử dụng; mô tả kiến trúc hệ thống và cơ sở lựa chọn stack; giới thiệu cơ chế tích hợp các dịch vụ như realtime, thanh toán trực tuyến và AI chatbot.
Chương 3: Phân tích,thiết kế và triển khai hệ thống
Phân tích yêu cầu chức năng/phi chức năng; thiết kế kiến trúc, cơ sở dữ liệu, các sơ đồ UML; mô tả hiện thực chức năng và triển khai hệ thống trong môi trường chạy thử (Docker).
Chương 4: Kết luận
Tổng kết kết quả đạt được so với mục tiêu; đánh giá ưu điểm và hạn chế; đề xuất định hướng phát triển và mở rộng trong tương lai.
CHƯƠNG 2: CƠ SỞ LÝ THUYẾT
2.1.	Tổng quan về thương mại điện tử trong lĩnh vực dịch vụ giải trí
Theo Nghị định 52/2013/NĐ-CP, hoạt động thương mại điện tử được hiểu là việc tiến hành một phần hoặc toàn bộ quy trình của hoạt động thương mại bằng phương tiện điện tử có kết nối Internet, mạng viễn thông di động hoặc các mạng mở khác.
Trong phạm vi dịch vụ giải trí, bán vé xem phim trực tuyến có thể được xem là một dạng cung ứng dịch vụ thông qua website/ứng dụng, khi người dùng thực hiện các bước lựa chọn dịch vụ, xác nhận thông tin, đặt chỗ và thanh toán qua môi trường mạng. Hệ thống bán vé vì vậy cần được thiết kế theo hướng đáp ứng các nguyên tắc về cung cấp thông tin minh bạch, giao kết hợp đồng trực tuyến, an toàn thanh toán và bảo vệ dữ liệu cá nhân theo định hướng quản lý trong Nghị định.
2.1.1. Thương mại điển tử trong lĩnh vực dịch vụ giải trí
Bán vé rạp phim online là một trường hợp điển hình của thương mại điện tử trong nhóm dịch vụ: người dùng tra cứu thông tin, lựa chọn suất chiếu/ghế và thực hiện giao dịch trên môi trường số. Theo Nghị định 52/2013/NĐ-CP, chủ thể tham gia hoạt động thương mại điện tử có thể là thương nhân/tổ chức/cá nhân tự thiết lập website để bán hàng hóa hoặc cung ứng dịch vụ, hoặc đơn vị cung cấp nền tảng cho bên khác tham gia.
Vì là dịch vụ có thời điểm sử dụng (suất chiếu) hệ thống bán vé cần đặc biệt chú trọng quản lý thông tin giao dịch và quy trình xác nhận để hạn chế nhầm lẫn,đồng thời công khai đầy đủ điểu kiện giao dịch và thông tin liên quan đến dịch vụ.
2.2.	Công nghệ chính được sử dụng ( ReactJS,Node,MongoDB )
2.2.1.	Công nghệ ReactJs (Frontend)
2.2.1.1. Khái niệm và vai trò
ReactJS là một thư viện JavaScript để xây dựng/hiển thị giao diện người dùng (UI) cho web (và cả native). Thay vì viết UI theo kiểu “một trang lớn” React khuyến khích chia UI thành các thành phần nhỏ (components) sau đó kết hợp chúng thành giao diện hoàn chỉnh.
Khi phát triển UI bằng React, quy trình tư duy thường được tiếp cận theo hướng
•	Phân rã giao diện thành các component.
•	Xác định các trạng thái hiển thị (visual states) của từng component.
•	Kết nối các component theo luồng dữ liệu để UI thay đổi khi dữ liệu thay đổi.

       Hình 2.5. Ngôn ngữ ReactJS


2.2.1.2. Hook trong React
React cung cấp Hooks để component (dạng function) có thể sử dụng các tính năng của React như State,effect,context.Ngoài Hooks có sẵn người phát triển có thể kết hợp để tạo custom hooks.
Nhóm Hook thường dùng
•	useState:Khai báo và cập nhật state làm UI render lại khi state thay đổi.
•	useEffect:Đồng bộ component với hệ thống bên ngoài (API,DOM,kết nội)
•	useContext:Đọc – đăng ký context để nhận dữ liệu từ các component cha ở xa mà không phải truyền props qua nhiều tầng.
•	useReducer:Quản lý State theo kiểu reducer phù hợp khi logic cập nhật state phức tạp hoặc nhiều nhánh xử lý.
Quy tắc sử dụng Hooks
Hooks chỉ nên được gọi ở cấp cao nhất của component hoặc custom hook không gọi trong điều kiện – vòng lặp – sau return có điều kiện để tránh hành vi không nhất quán.
2.2.6.	Công nghệ Node.js (Backend)
2.2.6.1. Khái niệm
Node.js là môi trường chạy JavaScript trên phía máy chủ (runtime) được được thiết kế theo hướng bất đồng bộ (asynchronous) và hướng sự kiện (event-driven) phù hợp để xây dựng các ứng dụng mạng có khả năng mở rộng (scalable network applications).
Điểm quan trọng của Node.js là khả năng xử lý đồng thời nhiều kết nối bằng cơ chế bất đồng bộ khi có yêu cầu đến Node.js kích hoạt hàm xử lý nếu không có việc cần chạy tiếp tiến trình có thể “nhàn rỗi” và chờ sự kiện mới.

                               Hình 2.6. Công nghệ Node.js
2.2.7.	Công nghệ MongoDB (NoSQL)
2.2.7.1. Khái niệm
MongoDB là hệ quản trị cơ sở dữ liệu theo mô hình document-oriented (dữ liệu được lưu dưới dạng tài liệu – document). MongoDB lưu các bản ghi dưới dạng BSON document và các document được gom nhóm thành collection một database có thể chứa nhiều collection.
Trong MongoDB mỗi document trong collection tiêu chuẩn bắt buộc có trường _id mang tính duy nhất đóng vai trò tương tự “khóa chính” để định danh bản ghi. Nếu khi thêm mới document mà không cung cấp _id driver thường tự sinh giá trị _id (ví dụ ObjectId).

	            Hình 2.6. Công nghệ MongoDB (NoSQL)
2.2.7.2. Mô hình đặc trưng Schema linh hoạt
Document trong MongoDB được biểu diễn bằng các cặp field–value giá trị của một field có thể là kiểu BSON cơ bản hoặc document lồng (embedded document) mảng hoặc mảng document. Nhờ đó MongoDB phù hợp để mô tả dữ liệu có cấu trúc phân cấp, hoặc nhóm thông tin liên quan trong cùng một bản ghi.
MongoDB có mô hình schema linh hoạt (flexible schema) về mặc định,các document trong cùng collection không bắt buộc phải có cùng tập field kiểu dữ liệu. Tuy nhiên khi hệ thống cần ràng buộc dữ liệu chặt chẽ MongoDB hỗ trợ Schema Validation để thiết lập các quy tắc kiểm tra field (kiểu dữ liệu, phạm vi giá trị, điều kiện bắt buộc…) nhằm đảm bảo dữ liệu tuân thủ thiết kế.
2.2.7.3. Thao tác cơ bản (CRUD)
MongoDB hỗ trợ đầy đủ nhóm thao tác CRUD (Create – Read – Update – Delete) trên document trong collection. Đây là nhóm thao tác cốt lõi để ứng dụng thực hiện thêm mới truy vấn cập nhật và xoá dữ liệu.
2.2.7.4. Index và ràng buộc dữ liệu
MongoDB cung cấp index để tăng hiệu quả truy vấn. Nếu không có index phù hợp hệ thống có thể phải quét toàn bộ document trong collection để trả kết quả. Tuy nhiên index cũng tạo chi phí khi ghi dữ liệu (insert update) vì phải cập nhật cấu trúc index đi kèm.
Để tránh trùng lặp dữ liệu theo yêu cầu nghiệp vụ MongoDB có unique index đảm bảo giá trị (hoặc tổ hợp giá trị) trên các field được đánh index là duy nhất trong collection. Ngoài ra MongoDB mặc định tạo unique index cho field _id.
CHƯƠNG 3: PHÂN TÍCH, THIẾT KẾ VÀ TRIỂN KHAI HỆ THỐNG
3.1.Phân tích yêu cầu bài toán
3.1.1. Tổng quan hệ thống
Hệ thống Website quản lý rạp chiếu phim tích hợp thanh toán trực tuyến và AI Chatbot là một ứng dụng web phục vụ đồng thời hai nhóm người dùng chính khách hàng và bộ phận quản trị - vận hành rạp.Mục tiêu của hệ thống là cung cấp nền tảng đặt vé trực tuyến thuận tiện,hỗ trợ quản trị nghiệp vụ tập trung,đồng thời tích hợp các dịch vụ mở rộng như thanh toán online và chatbot nhằm nâng cao trải nghiệm người dùng.
Về tổng thế,hệ thống được triển khai theo mô hình web tách lớp:
Frontend (Client):Giao diện người dùng chịu trách nhiệm hiển thị nội dung trang chủ,xử lý luồng đăng nhập đăng ký và tương tác API.
Backend (Server/API):Xử lý nghiệp vụ xác thực người dùng cung cấp dữ liệu phim/lịch chiếu thực thi các quy tắc nghiệp vụ và tích hợp các dịch vụ ngoài ( thanh toán,chatbot)
Cơ sở dữ liệu:Lưu trữ người dùng nội dung phim lịch chiếu và các dữ liệu vận hành của hệ thống.
Hệ thống được chia thành các phân hệ chức năng để thuận tiện phân tích – thiết kế - kiểm thử.Trong phạm vi hiện tại báo cáo ưu tiên trình bày phân hệ Trang chủ - Đăng nhập – Đăng ký trước vì đây là điểm vào của hệ thống và là nền tảng để người dùng thực hiện các chức năng quan trong như đặt vé,thanh toán và quản lý vé ở các phân hệ tiếp theo.
Ngoài ra hệ thống có các tương tác bên ngoài có ảnh hưởng trực tiếp đến thiết kế và vận hành:
Cổng thanh toán (VNPay):phục vụ thanh toán đơn hàng yêu cầu xử lý luồng kết quả và đảm bảo tránh ghi nhận trùng giao dịch.
Dịch vụ AI Chatbot:phục vụ hỏi đáp tra cứu thông tin yêu cầu cơ chế kết nối API và kiểm soát nội dung trả lời.
Email/thông báo:dùng cho các hoạt động xác thực,thông báo kết quả hoặc gửi thông tin cho người dùng
3.1.2. Phân tích yêu cầu phần hệ 1:Trang chủ - Đăng nhập – Đăng ký
3.1.2.1. Tác nhân và quyền hạn
Tác nhân 	Quyền hạn
Guest (khách vãng lai)	Xem trang chủ,xem danh sách phim,mở form đăng nhập / đăng ký,gửi thông tin đăng ký / đăng nhập.
User (thành viên)	Sau khi đăng nhập thành công sẽ có trạng thái xác thực để sử dụng các chức năng dành cho tài khoản (sang các phân hệ tiếp theo).

3.1.4.3.Yêu cầu chức năng (FR)
A.Trang chủ (HomePage)
ID	Yêu cầu	Mô tả 	Ưu tiên
FR-HP-01	Hiển thị Banner quảng cáo	Hiển thị slider banner tự động xoay với các poster phim/sự kiện	Cao
FR-HP-02	Thanh đặt vé nhanh 	Cho phép chọn Phim → Rạp → Ngày → Suất chiếu → Mua vé nhanh	Cao
FR-HP-03	Danh sách phim đang chiếu	Hiển thị grid phim với poster, tên, rating, nút đặt vé/xem trailer	Cao
FR-HP-04	Danh sách phim sắp chiếu	Tab chuyển đổi để xem phim sắp ra mắt	Cao
FR-HP-05	Section Góc điện ảnh	Hiển thị thể loại phim, diễn viên, đạo diễn	Trung bình
FR-HP-06	Section Ưu đãi khuyến mại	Hiển thị các sự kiện/khuyến mãi đang diễn ra	Trung bình
FR-HP-07	Responsive Mobile	Giao diện tương thích với thiết bị di động	Cao
B.Đăng nhập (Login)
ID	Yêu cầu	Mô tả 	Ưu tiên
FR-LG-01	Form đăng nhập	Nhập email và mật khẩu	Cao
FR-LG-02	Validation form	Kiểm tra định dạng email, mật khẩu không rỗng	Cao
FR-LG-03	Xác thực với API	Gọi API /api/v1/auth/login để xác thực	Cao
FR-LG-04	Lưu token	Lưu JWT token vào localStorage sau khi đăng nhập thành công	Cao
FR-LG-05	Đăng nhập Google	Cho phép đăng nhập bằng tài khoản Google OAuth	Trung bình
FR-LG-06	Chuyển sang đăng ký	Link chuyển sang modal đăng ký	Cao
FR-LG-07	Quên mật khẩu	Link chuyển sang modal quên mật khẩu	Trung bình
C.Đăng ký (Register)
ID	Yêu cầu	Mô tả 	Ưu tiên
FR-RG-01	Form đăng ký	Nhập họ tên, email, số điện thoại, mật khẩu, giới tính, ngày sinh	Cao
FR-RG-02	Validation form	Kiểm tra email hợp lệ, SĐT 10 số, mật khẩu ≥ 6 ký tự	Cao
FR-RG-03	Xác nhận mật khẩu	So khớp mật khẩu và xác nhận mật khẩu	Cao
FR-RG-04	Gọi API đăng ký	POST /api/v1/auth/register với thông tin user	Cao
FR-RG-05	Thông báo kết quả	Hiển thị thông báo thành công/thất bại	Cao
FR-RG-06	Chuyển sang đăng ký	Link chuyển sang modal đăng ký	Cao
FR-RG-07	Chuyển sang đăng nhập	Tự động chuyển về modal đăng nhập sau khi đăng ký thành công	Cao
3.1.4.4.Yêu cầu phi chức năng (NFR)
ID	Yêu cầu	Mô tả
NFR-01	Hiệu năng	Trang chủ load < 3 giây, API response < 500ms
NFR-02	Bảo mật	Mật khẩu được hash bằng bcrypt, sử dụng JWT với thời hạn
NFR-03	Khả dụng	Hệ thống hoạt động 24/7
NFR-04	Responsive	Hỗ trợ màn hình từ 320px đến 1920px
NFR-05	Trình duyệt	Hỗ trợ Chrome, Firefox, Safari, Edge phiên bản mới nhất
3.1.5. Phân tích yêu cầu phân hệ 2: Phim đang chiếu
3.1.5.1.Tác nhân
•	Guest:xem danh sách phim đang chiếu xem trailer, chuyển sang xem chi tiết/đặt vé (tùy chính sách có bắt đăng nhập ở bước sau).
•	User.thực hiện toàn bộ chức năng như Guest (các chức năng theo tài khoản sẽ thuộc phân hệ sau)
3.1.5.2. Yêu cầu chức năng (FR) – MoviePage
ID	Yêu cầu 	Mô tả 	Ưu tiên
FR-MP-01	Hiển thị danh sách phim đang chiếu	Render danh sách phim dạng grid/card: poster, tên, giới hạn tuổi, thời lượng, điểm đánh giá…	Cao
FR-MP-02	Tab/Lọc trạng thái phim	Cho phép chuyển giữa “Đang chiếu / Sắp chiếu” (nếu có), hoặc lọc theo status (NOW/COMING).	Cao
FR-MP-03	Điều hướng xem chi tiết phim	Click vào phim để đi tới trang chi tiết (MovieDetail/BookingPage tùy thiết kế).	Cao
FR-MP-04	Xem trailer	Mở trailer (modal/popup hoặc chuyển trang) từ card phim.	Trung bình
FR-MP-05	Phân trang / tải thêm	Hỗ trợ pagination hoặc “load more” khi số lượng phim lớn.	Trung bình
FR-MP-06	Hiển thị trạng thái tải dữ liệu	Có loading/skeleton khi gọi API, tránh trắng trang.	Cao
FR-MP-07	Xử lý trạng thái rỗng/lỗi	Nếu không có phim hoặc API lỗi → hiển thị empty/error rõ ràng.	Cao
FR-MP-08	Điều hướng sang đặt vé	Từ MoviePage, người dùng có thể bấm “Đặt vé” để sang BookingPage theo movieId.	Cao
3.1.5.4.Yêu cầu phi chức năng (NFR)
ID	Yêu cầu 	Mô tả
NFR-MP-01	Hiệu năng	Danh sách phim tải ổn định, phản hồi thao tác chuyển tab/lọc mượt.
NFR-MP-02	Khả dụng	Có loading/empty/error; hệ thống vẫn giữ layout ổn định khi lỗi API.
NFR-MP-03	Responsive	Hiển thị tốt trên mobile/desktop (grid co giãn).
NFR-MP-04	Tương thích trình duyệt	Hoạt động tốt trên Chrome/Edge/Firefox bản mới.
NFR-MP-05	Bảo mật luồng điều hướng	Không lộ dữ liệu nhạy cảm; request chỉ lấy dữ liệu công khai của phim.
3.1.6.Phân tích yêu cầu phân hệ 3:Đặt vé xem phim
3.1.6.1.Tác nhân Actors
Khách hàng:thực hiện các thao tác xem thông tin phim,xem trailer,xem/lọc,lịch chiếu và chọn suất chiếu để đặt vé.
User:thực hiện thêm thao tác đánh giá phim (tương tác qua modal và gọi API đánh giá)
3.1.6.2.Yêu cầu chức năng (FR) – Booking Page
Mã	Yêu cầu	Mô tả
FR-BK-01	Xem thông tin phim	Xem chi tiết:poster,tên,thời lượng,rating,thể loại,đạo diễn,diễn viên
FR-BK-02	Chọn ngày chiếu	Chọn từ danh sách 7 ngày tới
FR-BK-03	Lọc theo khu vực	Lọc rạp theo thành phố
FR-BK-04	Lọc theo rạp	Chọn rạp củ thể
FR-BK-05	Xem lịch chiếu	Hiển thị suất chiếu theo rạp,format (2D/3D)
FR-BK-06	Chọn suất chiếu	Chọn giờ chiếu để đặt vé
FR-BK-07	Đánh giá phim	Đánh giá phim theo thang 1 – 10
FR-BK-08 	Xem trailer	Xem trailer phim trong modal
3.1.6.4.Yêu cầu phi chức năng (NFR)
Mã	Yêu cầu	Mô tả
NFR-BK-01	Hiệu năng	Trang load <3 giây
NFR-BK-02	Reponsive	Hiển thị tốt trên mobile và desktop
NFR-BK-03	Bảo mật	JWT token vowis auto -refresh
NFR-BK-04	Khả dụng	Fallback “chưa cập nhật”khi thiếu dữ liệu
3.1.7.Phân tích yêu cầu phân hệ 4: Luồng đặt vé chi tiết
3.1.7.2.Tác nhân (Actors)
User (khách hàng):thực hiện toàn bộ thao tác đặt vé từ chọn ghế đến thanh toán và xem kết quả.
VNPay Gateway:hệ thống thanh toán bên thứ ba tiếp nhận thanh toán và phản hồi kết quả về hệ thống.
Backend System:tiếp nhận request từ frontend xử lý nghiệp vụ tạo đơn/giữ ghế/tạo vé/cập nhật trạng thái thanh toán và truy xuất dữ liệu.
3.1.7.3.Yêu cầu chức năng (FR)
A.SeatSelectionPage – Chọn ghế
ID	Yêu cầu	Mô tả 	Ưu tiên
FR-SS-01	Hiển thị sơ đồ ghế	Render sơ đồ phòng chiếu với trạng thái ghế (trống/đã đặt/đang giữ)	Cao
FR-SS-02	Chọn/bỏ chọn ghế	Click để toggle trạng thái chọn ghế	Cao
FR-SS-03	Giữ ghế tạm thời 	Gọi API hold seat khi chọn release khi bỏ	Cao
FR-SS-04	Đếm ngược 15 phút	Timer hiển thị thời gian còn lại để hoàn tất	Cao
FR-SS-05	Tính giá theo loại ghế	Standard/VIP/Couple  có giá khác nhau	Cao
FR-SS-06	Điều hướng liên tục	Chuyển sang ComboPage sau khi chọn ghế	Cao
B.Chọn Combo (ComboPage)
ID	Yêu cầu	Mô tả 	Ưu tiên
FR-CB-01	Hiển thị danh sách Combo	Lấy API /combos	Cao
FR-CB-02	Tăng/giảm số lượng	Nút +/- thay đổi quantity	Cao
FR-CB-03	Tính tổng tiền Combo 	Cập nhật realtime khi thay đổi	Cao
FR-CB-04	Modal xác nhận tuổi	Kiểm tra với phim có giới hạn tuổi	Cao
FR-CB-05	Điều hướng thanh toán	Chuyển sang PaymentConfirmPage	Cao
C.Thanh toán (PaymentConfirmPage)
ID	Yêu cầu	Mô tả 	Ưu tiên
FR-PM-01	Hiển thị thông tin đơn hàng 	Phim,ghế,combo,tổng tiền	Cao
FR-PM-02	Nhập/chọn voucher	Áp dụng mã giảm giá	Cao
FR-PM-03	Tính toán giảm giá 	Trừ discount vào tổng tiền	Cao
FR-PM-04	Chọn phương thức thanh toán 	VNPay	Cao
FR-PM-05a	Tạo đơn hàng 	Gọi API POST/orders	Cao
FR-PM-05b	Xác nhận thông tin trước thanh toán	Modal hiển thị tóm tắt đơn hàng checkbox đồng ý điều khoản	Trung bình
FR-PM-06	Redirect VNPay	Chuyển sang cổng thanh toán	Cao
D.Kết quả thanh toán (PaymentResultPage)
ID	Yêu cầu	Mô tả 	Ưu tiên
FR-PR-01	Hiển thị trạng thái	Thành công/thất bại với icon	Cao
FR-PR-02	Thông tin đơn hàng 	Lấy API theo orderNo	Cao
FR-PR-03	Chi tiết vé	Phim,rạp,ghế,suất chiếu	Cao
FR-PR-04	Nút điều hướng	Về trang chủ hoặc thử lại	Cao
3.1.7.4.Yêu cầu phi chức năng (NFR)
ID	Yêu cầu 	Mô tả
NFR-01	Hiệu năng	API response < 500ms,trang load < 3s
NFR-02	Realtime	Cập nhật trạng thái ghế theo thời gian thực
NFR-03	Bảo mật	JWT authentication,HTTPS
NFR-04	Responsive	Tương thích mobile/desktop
NFR-05	Tính nhất quán	Giá tính ở frontend = backend
3.2.Thiết kế hệ thống
Hệ thống sẽ nêu ra nhưng mô hình chính
3.2.1.Kiến trúc tổng thể phân hệ 1:Trang chủ - Đăng nhập – Đăng ký

Hình 3.1 – Kiến trúc tổng thể phân hệ Trang chủ – Đăng nhập – Đăng ký
3.2.2.Use Case Diagram Trang chủ - Đăng nhập – Đăng ký

Hình 3.2.Sơ đồ Use Case Diagram – Phân hệ Trang chủ/Đăng nhập/Đăng ký
3.2.3. Activity Diagram
Activity Diagram – Đăng nhập

Hình 3.3. Sơ đồ Activity – Đăng nhập
Activity Diagram – Đăng ký

Hình 3.4 Sơ đồ Activity – Đăng ký
3.2.4. Sequence Diagram
Sequence Diagram – Đăng nhập

Hình 3.5. Sơ đồ Sequence (tương tác hệ thống) – Đăng ký
Sequence Diagram – Đăng ký

Hình 3.6. Sơ đồ Sequence (tương tác hệ thống) – Đăng ký
3.2.5.Class Diagram rút gọn (Auth/home) – Phân hệ 1

Hình 3.7.Sơ đồ Class Diagram rút gọn – Phân hệ Home & Authentication
3.2.6.Thiết kế hệ thống phân hệ 2 – Phim đang chiếu
3.2.6.1.Kiến trúc hệ thống

Hình 3.8. Kiến trúc tổng thể phân hệ phim đang chiếu
3.2.7.Use Case Diagram – Phim đang chiếu

Hình 3.9. Use Case Diagram Phim đang chiếu
3.2.8. Activity Diagram – Xem phim đang chiếu

Hình 3.10. Activity Diagram luồng xử lý phim đang chiếu (xem phim đang chiếu)
3.2.9. Sequence Diagram – Tải danh sách phim

Hình 3.11. Sequence Diagram tải danh sách phim
3.2.10. Class Diagram – Phim đang chiếu


Hình 3.12. Class Diagram rút gọn phân hệ phim đang chiếu
3.2.11.Thiết kế hệ thống đặt vé

Hình 3.13 – Sơ đồ kiến trúc tổng thể phân hệ đặt vé
3.2.12.Use Case Diagram – Đặt vé

Hình 3.14. Sơ đồ Use Case của phân hệ đặt vé
3.2.13. Activity Diagram – Đặt vé

Hình 3.15. Sơ đồ Activity mô tả luồng đặt vé .
3.2.14. Sequence Diagram (tương tác hệ thống) – Đánh giá phim

Hình 3.16: Sơ đồ Sequence mô tả tương tác đánh giá phim trên BookingPage
3.2.15. Class Diagram rút gọn – Đặt vé

Hình 3.17. Sơ đồ Class Diagram rút gọn của phân hệ đặt vé
3.2.16.Thiết kế hệ thống – Chọn ghế

Hình 3.18.Sơ đồ kiến trúc tổng thể chọn ghế
3.2.16.2.Use Case Diagram – Chọn ghế

Hình 3.19. Sơ đồ Use Case Diagram – Chọn ghế
3.2.16.3.Activity Diagram – Luồng chọn ghế

Hình 3.20.Sơ đồ Activity Diagram luồng chọn ghế
3.2.16.4.Sequence Diagram – Giữ ghế

Hình 3.21.Sơ đồ Sequence Diagram Giữ ghế
3.2.16.5.Class Diagram rút gọn – Chọn ghế

Hình 3.22.Sơ đồ Class Diagram rút gọn – SeatSelectionPage
3.2.17.Thiết kế hệ thống – Chọn combo
3.2.17.1.Use case Diagram – Chọn combo

Hình 3.23.Sơ đồ Use Case Diagram chọn combo
3.2.17.2.Activity Diagram – Luồng chọn combo

Hình 3.24.Sơ đồ Activity Diagram luồng chọn combo
3.2.17.3.Class Diagram rút gọn – Chọn combo

Hình 3.25.Sơ đồ Class Diagram rút gọn chọn combo
3.2.18.Thiết kế hệ thống – Xác nhận & thanh toán
3.2.18.1.Use Case Diagram – Xác nhận & thanh toan

Hình 3.26.Sơ đồ Use Case Diagram xác nhận & thanh toán
3.2.18.2.Sequence Diagram – Áp dụng voucher & tạo thanh toán

Hình 3.27. Sơ đồ Sequence Diagram – Áp dụng voucher & thanh toán
3.2.18.3.Class Diagram – Hệ thống Voucher Wallet

Hình 3.28.Sơ đồ Class Diagram – Hệ thống Voucher Wallet
3.2.19.Thiết kế hệ thống – Kết quả thanh toán
3.2.19.1.Activity Diagram – Hiển thị kết quả thanh toán

Hình 3.29. Sơ đồ Activity Diagram kết quả thanh toán
3.2.19.2.Sequence Diagram – Tải đơn và hiển thị kết quả

Hình 3.30.Sơ đồ Sequence Diagram tải đơn và hiện thị kêt quả
3.3. Thiết kế cơ sở dữ liệu
Hệ thống sử dụng các bảng chính:
1: User:Thông tin người dùng,xác thực,phân quyền
2: Movie:Thông tin phim,đạo diễn,diễn viên,thể loại
3: Genre:Thể loại phim
4: Person:Đạo diễn,diễn viên
5: Cinema:Thông tin rạp chiếu
6: Room:Phòng chiếu sơ đồ ghế
7: Showtime:Suất chiếu phim
8: Order:Đơn đặt vé
9: Ticket:Vé điển tử
10: Payment:Giao dịch thanh toán VNPay
11: Review:Bình luận,đánh giá phim
12: Voucher:Mã giảm gia
13: UserVoucher:Ví voucher của người dùng
14: Combo:Đò ăn nước uống đi kèm
15: SeatHold:Giữ ghế tạm thời
3.4. Mô tả hệ thống
3.4.1. Kiến trúc tổng thể hệ thống
Hệ thống NNM Cinema được xây dựng theo mô hình Client – Server áp dụng kiến trúc 3-tier nhằm đảm bảo tính mở rộng,dễ bảo trì và phù hợp với các hệ thống website hiện đại.
3.4.2.Các module chức năng chính
Module 1: Quản lý người dùng (User Management)
Chức năng 	Mô tả
Đăng ký / Đăng nhập	Xác thực người dùng bằng email và mật khẩu
Phân quyền	User,Staff,Manager,Admin
Quản lý hồ sơ	Cập nhật thông tin cá nhân
Thành viên	Tích điểm,xếp hạng MEMBER / VIP /VVIP
Module 2: Quản lý nội dung (Content Management)
Chức năng	Mô tả
Phim	Thêm,sửa,xóa phim,quản lý poster,trailer
Thể loại	Phân loại phim
Đạo diễn / diễn viên	Thông tin cá nhân,tiểu sử,filmography
Rạp / phòng chiếu	Quản lý cụm rạp,phòng chiếu và sơ đồ ghế
Module 3: Đặt vé (Booking)
Chức năng	Mô tả
Suất chiếu	Thanh toán trực tuyến
Idempotent	Phân loại phim
Đạo diễn / diễn viên	Thông tin cá nhân,tiểu sử,filmography
Rạp / phòng chiếu	Quản lý cụm rạp,phòng chiếu và sơ đồ ghế
Module 4:Thanh toán & Vé điện tử
Chức năng	Mô tả
VNPay	Thanh toán trực tuyến
Idempotent	Chống xử lý trùng callback
Vé QR	Tạo vé điện tử mã QR
Check-in	Quét vé tại rạp
Module 5:Tương tác & hỗ trợ
Chức năng	Mô tả
Đánh giá phim	Rating,bình luận
Tương tác	Like,view
Chat AI	Hỗ trợ tra cứu phim và đặt vé
3.4.3. Luồng xử lý nghiệp vụ chính
Luồng đặt vé
[Chọn phim] → [Chọn rạp & ngày]
      ↓
[Chọn suất chiếu]
      ↓
[Chọn ghế] → [Giữ ghế tạm thời]
      ↓
[Chọn combo]
      ↓
[Nhập voucher]
      ↓
[Thanh toán VNPay]
      ↓
[Tạo vé QR & gửi email]
Luồng check-in vé
[Khách đến rạp]
      ↓
[Quét QR vé]
      ↓
[Xác thực checksum]
      ↓
[Kiểm tra thời gian suất chiếu]
      ↓
[Check-in thành công]
3.4.4. Tích hợp hệ thống bên ngoài
Dịch vụ	Mục đích
VNPay	Thanh toán trực tuyến
Google OAth	Đăng nhập nhanh
AI chatbot	Hỗ trợ khách hàng
SMTP Email	Gửi vé thông báo
3.4.5.Bảo mật hệ thống
Dịch vụ	Mục đích
Xác thực	JWT
Mã hóa mật khẩu	Bcrypt
QR Checksum	SHA-256
Phân quyền	Middleware theo role
Validate	Kiểm tra giữ liệu đầu vào
Chống tấn công 	Rate limit cơ bản
3.5. Các bước cài đặt
3.5.1.Yêu cầu hệ thống
Thành phần 	Phiên bản
NodeJs	v24.11.0
MongoDB	7
Redis	7
Docker	4.57.0
3.5.2.Cài đặt thủ công
Backend
ID	Mô tả	Cách chạy
1	Di chuyển vào thư mục backend
	cd backend

2	Cài đặt dependencies
	npm install

3	Tạo file .env
	cp .env.example .env

4	Chạy server development	npm run dev

Các thư viện chính:
Expreess 4.21,Mongoose 8.8 (MongoDB ODM)
JWT,bcrypt (xác thực)
VNPay,SDK,QRCode (thanh toán vé)
Socket.io,Redis (Realtime)
Nodemailer (Gửi mail)
Frontend
ID	Mô tả	Cách chạy
1	Di chuyển vào thư mục frontend
	cd frontend

2	Cài đặt dependencies
	npm install

4	Chạy server development	npm run dev

Các thư viện chính
React 18.2,Vite 5.2
Material UI 5.15 (UI component)
Redux Toolkit (State Manager)
React Router 6.22 (Routing)
Axios (HTTP client)
3.5.3.Cài đặt với docker
ID	Mô tả	Cách chạy
1	Di chuyển vào thư mục backend
	cd backend

2	Tạo file .env
	cp .env.example .env

3	Khởi động toàn bộ services	Docker-compose up -d
Services trong docker compose
Services	Image	Port
Backend	Node 18 Apline	5000
Mongo	MongoDB 7	27018
Redis	Redis 7 Apline	6379
3.5.4. Biến môi trường quan trọng
Biến 	Mô tả
MONGO_URI	Connection string MongoDB
JWT_SECRET	Secret key cho jwt
VNP_TMN_CODE	Mã merchant VNPay
VNP_HASH_SECRET	Secret key VNPay
SMTP_HOST	SMTP server gửi mail
REDIS_URL	Connection string Redis


CHƯƠNG 4: KẾT LUẬN
4.1. Tóm tắt kết quả đạt được
Đồ án đã xây dựng thành công hệ thống Website quản lý rạp chiếu phim tích hợp thanh toán trực tuyến và AI Chatbot.
Về mặt chức năng:
Quản lý phim:CRUD phim,đạo diễn,diễn viên,thể loại với SEO-friendly URL
Đặt vé:Chọn phim – suất chiếu – ghế - combo – thanh toán
Thanh toán:Tích hợp VNPay với xử lý idempotent,chống duplicate
Vé điển tử:Xuất vé Code,gửi mail,soát vé check-in
Thành viên:Tích điểm,xếp hạng VIP/VVIP,voucher cá nhân
Đánh giá:Bình luận,rating phim với hệ thống báo cáo nội dung
Real-time:Chat hỗ trợ AI (gemini),thông báo Socket.io
4.2. Kết quả đạt được so với hệ thống tương tự
Tiêu chí	NMN Cinema	GCV	Lotte	Cinestar
Đặt vé online	        V 	        V	        V	        V
Thanh toán VNPay	        V	        V	        V	        V
Tích điểm thành viên	        V	        V	        V	        V
Voucher/giảm giá	        V	        V	        V	        V
Chat hỗ trợ AI	        V	        X	        X	        X
Bình luận đánh giá	        V	        V	        V	        V
Responsive Mobile	        V	        V	        V	        V
4.3. Các ứng dụng của hệ thống thực tế
4.3.1. Triển khai cho rạp chiếu phim
Hệ thống có thể áp dụng cho các rạp chiếu phim vừa và nhỏ
Hỗ trợ quản lý đa rạp,phòng chiếu
Tích hợp sẵn cổng thanh toán VNPay
4.3.2. Nền tảng học tập
Mã nguồn mở phục vụ về học tập
Phát triển ứng dụng full-stack
Tích hợp cổng thanh toán trực tuyến
Xây dựng hệ thống Real-time
4.4.Hướng phát triển và nghiên cứu tiếp theo
4.4.1. Ngắn hạn (1-3 tháng)
Ứng dụng Mobile:React Native hoặc Flutter
Đa ngôn ngữ:Hỗ trợ tiếng anh,Hàn Nhật
Thêm cổng thanh toán:Momo,ZaloPay,quét QR
4.4.2.Dài hạn (3-9 tháng)
Tích hợp blockchain cho vé điển tử trống giả mạo
Machine Learning dự đoán nhu cầu,tối ưu giá vé
Mở rộng thành  Saas cho nhiều rạp sử dụng chung hạ tầng


