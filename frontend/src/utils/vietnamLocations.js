// Danh sách Tỉnh/Thành phố → Quận/Huyện Việt Nam (các thành phố lớn)
const VIETNAM_LOCATIONS = {
  'Thành phố Hà Nội': [
    'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Hai Bà Trưng', 'Quận Đống Đa',
    'Quận Tây Hồ', 'Quận Cầu Giấy', 'Quận Thanh Xuân', 'Quận Hoàng Mai',
    'Quận Long Biên', 'Quận Nam Từ Liêm', 'Quận Bắc Từ Liêm', 'Quận Hà Đông',
    'Huyện Gia Lâm', 'Huyện Đông Anh', 'Huyện Sóc Sơn', 'Huyện Thanh Trì',
    'Huyện Thường Tín', 'Huyện Hoài Đức', 'Huyện Đan Phượng', 'Huyện Thanh Oai',
    'Huyện Mê Linh', 'Huyện Chương Mỹ', 'Huyện Ba Vì', 'Huyện Phúc Thọ',
    'Huyện Thạch Thất', 'Huyện Quốc Oai', 'Huyện Ứng Hoà', 'Huyện Mỹ Đức',
    'Huyện Phú Xuyên', 'Thị xã Sơn Tây'
  ],
  'Thành phố Hồ Chí Minh': [
    'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8',
    'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp',
    'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Bình Tân',
    'Thành phố Thủ Đức', 'Huyện Bình Chánh', 'Huyện Hóc Môn',
    'Huyện Củ Chi', 'Huyện Nhà Bè', 'Huyện Cần Giờ'
  ],
  'Thành phố Đà Nẵng': [
    'Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn',
    'Quận Liên Chiểu', 'Quận Cẩm Lệ', 'Huyện Hoà Vang', 'Huyện Hoàng Sa'
  ],
  'Thành phố Hải Phòng': [
    'Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Hải An',
    'Quận Kiến An', 'Quận Đồ Sơn', 'Quận Dương Kinh', 'Huyện An Dương',
    'Huyện An Lão', 'Huyện Kiến Thuỵ', 'Huyện Thuỷ Nguyên', 'Huyện Tiên Lãng',
    'Huyện Vĩnh Bảo', 'Huyện Cát Hải', 'Huyện Bạch Long Vĩ'
  ],
  'Thành phố Cần Thơ': [
    'Quận Ninh Kiều', 'Quận Bình Thuỷ', 'Quận Cái Răng', 'Quận Ô Môn',
    'Quận Thốt Nốt', 'Huyện Phong Điền', 'Huyện Cờ Đỏ', 'Huyện Thới Lai', 'Huyện Vĩnh Thạnh'
  ],
  'Tỉnh Bắc Ninh': [
    'Thành phố Bắc Ninh', 'Thành phố Từ Sơn', 'Huyện Yên Phong', 'Huyện Quế Võ',
    'Huyện Tiên Du', 'Huyện Thuận Thành', 'Huyện Gia Bình', 'Huyện Lương Tài'
  ],
  'Tỉnh Hưng Yên': [
    'Thành phố Hưng Yên', 'Huyện Văn Lâm', 'Huyện Văn Giang', 'Huyện Yên Mỹ',
    'Huyện Mỹ Hào', 'Huyện Ân Thi', 'Huyện Khoái Châu', 'Huyện Kim Động',
    'Huyện Tiên Lữ', 'Huyện Phù Cừ'
  ],
  'Tỉnh Hải Dương': [
    'Thành phố Hải Dương', 'Thành phố Chí Linh', 'Huyện Nam Sách', 'Huyện Kinh Môn',
    'Huyện Kim Thành', 'Huyện Thanh Hà', 'Huyện Cẩm Giàng', 'Huyện Bình Giang',
    'Huyện Gia Lộc', 'Huyện Tứ Kỳ', 'Huyện Ninh Giang', 'Huyện Thanh Miện'
  ],
  'Tỉnh Vĩnh Phúc': [
    'Thành phố Vĩnh Yên', 'Thành phố Phúc Yên', 'Huyện Lập Thạch', 'Huyện Tam Dương',
    'Huyện Tam Đảo', 'Huyện Bình Xuyên', 'Huyện Yên Lạc', 'Huyện Vĩnh Tường', 'Huyện Sông Lô'
  ],
  'Tỉnh Bắc Giang': [
    'Thành phố Bắc Giang', 'Huyện Yên Thế', 'Huyện Tân Yên', 'Huyện Lạng Giang',
    'Huyện Lục Nam', 'Huyện Lục Ngạn', 'Huyện Sơn Động', 'Huyện Yên Dũng',
    'Huyện Việt Yên', 'Huyện Hiệp Hoà'
  ],
  'Tỉnh Phú Thọ': [
    'Thành phố Việt Trì', 'Thị xã Phú Thọ', 'Huyện Đoan Hùng', 'Huyện Hạ Hoà',
    'Huyện Thanh Ba', 'Huyện Phù Ninh', 'Huyện Yên Lập', 'Huyện Cẩm Khê',
    'Huyện Tam Nông', 'Huyện Lâm Thao', 'Huyện Thanh Sơn', 'Huyện Thanh Thuỷ', 'Huyện Tân Sơn'
  ],
  'Tỉnh Thái Nguyên': [
    'Thành phố Thái Nguyên', 'Thành phố Sông Công', 'Thị xã Phổ Yên',
    'Huyện Phú Bình', 'Huyện Đồng Hỷ', 'Huyện Võ Nhai', 'Huyện Đại Từ',
    'Huyện Định Hoá', 'Huyện Phú Lương'
  ],
  'Tỉnh Quảng Ninh': [
    'Thành phố Hạ Long', 'Thành phố Móng Cái', 'Thành phố Cẩm Phả', 'Thành phố Uông Bí',
    'Thị xã Quảng Yên', 'Thị xã Đông Triều', 'Huyện Bình Liêu', 'Huyện Tiên Yên',
    'Huyện Đầm Hà', 'Huyện Hải Hà', 'Huyện Ba Chẽ', 'Huyện Vân Đồn', 'Huyện Cô Tô'
  ],
  'Tỉnh Nam Định': [
    'Thành phố Nam Định', 'Huyện Mỹ Lộc', 'Huyện Vụ Bản', 'Huyện Ý Yên',
    'Huyện Nghĩa Hưng', 'Huyện Nam Trực', 'Huyện Trực Ninh', 'Huyện Xuân Trường',
    'Huyện Giao Thuỷ', 'Huyện Hải Hậu'
  ],
  'Tỉnh Ninh Bình': [
    'Thành phố Ninh Bình', 'Thành phố Tam Điệp', 'Huyện Nho Quan', 'Huyện Gia Viễn',
    'Huyện Hoa Lư', 'Huyện Yên Khánh', 'Huyện Kim Sơn', 'Huyện Yên Mô'
  ],
  'Tỉnh Thanh Hoá': [
    'Thành phố Thanh Hoá', 'Thành phố Sầm Sơn', 'Huyện Mường Lát', 'Huyện Quan Hoá',
    'Huyện Bá Thước', 'Huyện Quan Sơn', 'Huyện Lang Chánh', 'Huyện Ngọc Lặc',
    'Huyện Cẩm Thuỷ', 'Huyện Thạch Thành', 'Huyện Hà Trung', 'Huyện Vĩnh Lộc',
    'Huyện Yên Định', 'Huyện Thọ Xuân', 'Huyện Triệu Sơn', 'Huyện Thiệu Hoá',
    'Huyện Hoằng Hoá', 'Huyện Hậu Lộc', 'Huyện Nga Sơn', 'Huyện Như Xuân',
    'Huyện Như Thanh', 'Huyện Nông Cống', 'Huyện Đông Sơn', 'Huyện Quảng Xương',
    'Huyện Tĩnh Gia', 'Thị xã Bỉm Sơn', 'Thị xã Nghi Sơn'
  ],
  'Tỉnh Nghệ An': [
    'Thành phố Vinh', 'Thị xã Cửa Lò', 'Thị xã Thái Hoà', 'Thị xã Hoàng Mai',
    'Huyện Quế Phong', 'Huyện Quỳ Châu', 'Huyện Kỳ Sơn', 'Huyện Tương Dương',
    'Huyện Nghĩa Đàn', 'Huyện Quỳ Hợp', 'Huyện Quỳnh Lưu', 'Huyện Con Cuông',
    'Huyện Tân Kỳ', 'Huyện Anh Sơn', 'Huyện Diễn Châu', 'Huyện Yên Thành',
    'Huyện Đô Lương', 'Huyện Thanh Chương', 'Huyện Nghi Lộc', 'Huyện Nam Đàn', 'Huyện Hưng Nguyên'
  ],
  'Tỉnh Thừa Thiên Huế': [
    'Thành phố Huế', 'Huyện Phong Điền', 'Huyện Quảng Điền', 'Huyện Phú Vang',
    'Huyện Phú Lộc', 'Huyện Nam Đông', 'Huyện A Lưới', 'Thị xã Hương Thuỷ', 'Thị xã Hương Trà'
  ],
  'Tỉnh Quảng Nam': [
    'Thành phố Tam Kỳ', 'Thành phố Hội An', 'Huyện Duy Xuyên', 'Huyện Điện Bàn',
    'Huyện Đại Lộc', 'Huyện Thăng Bình', 'Huyện Quế Sơn', 'Huyện Núi Thành',
    'Huyện Tiên Phước', 'Huyện Bắc Trà My', 'Huyện Nam Trà My', 'Huyện Hiệp Đức',
    'Huyện Phước Sơn', 'Huyện Đông Giang', 'Huyện Tây Giang', 'Huyện Nam Giang', 'Huyện Nông Sơn'
  ],
  'Tỉnh Khánh Hoà': [
    'Thành phố Nha Trang', 'Thành phố Cam Ranh', 'Huyện Cam Lâm', 'Huyện Diên Khánh',
    'Huyện Vạn Ninh', 'Huyện Ninh Hoà', 'Huyện Khánh Vĩnh', 'Huyện Khánh Sơn', 'Huyện Trường Sa'
  ],
  'Tỉnh Lâm Đồng': [
    'Thành phố Đà Lạt', 'Thành phố Bảo Lộc', 'Huyện Đam Rông', 'Huyện Lạc Dương',
    'Huyện Lâm Hà', 'Huyện Đơn Dương', 'Huyện Đức Trọng', 'Huyện Di Linh',
    'Huyện Bảo Lâm', 'Huyện Đạ Huoai', 'Huyện Đạ Tẻh', 'Huyện Cát Tiên'
  ],
  'Tỉnh Bình Dương': [
    'Thành phố Thủ Dầu Một', 'Thành phố Dĩ An', 'Thành phố Thuận An', 'Thành phố Tân Uyên',
    'Thành phố Bến Cát', 'Huyện Bàu Bàng', 'Huyện Dầu Tiếng', 'Huyện Bắc Tân Uyên', 'Huyện Phú Giáo'
  ],
  'Tỉnh Đồng Nai': [
    'Thành phố Biên Hoà', 'Thành phố Long Khánh', 'Huyện Tân Phú', 'Huyện Vĩnh Cửu',
    'Huyện Định Quán', 'Huyện Trảng Bom', 'Huyện Thống Nhất', 'Huyện Cẩm Mỹ',
    'Huyện Long Thành', 'Huyện Xuân Lộc', 'Huyện Nhơn Trạch'
  ],
  'Tỉnh Bà Rịa - Vũng Tàu': [
    'Thành phố Vũng Tàu', 'Thành phố Bà Rịa', 'Thị xã Phú Mỹ',
    'Huyện Xuyên Mộc', 'Huyện Long Điền', 'Huyện Đất Đỏ', 'Huyện Châu Đức', 'Huyện Côn Đảo'
  ],
  'Tỉnh Long An': [
    'Thành phố Tân An', 'Thị xã Kiến Tường', 'Huyện Tân Hưng', 'Huyện Vĩnh Hưng',
    'Huyện Mộc Hoá', 'Huyện Tân Thạnh', 'Huyện Thạnh Hoá', 'Huyện Đức Huệ',
    'Huyện Đức Hoà', 'Huyện Bến Lức', 'Huyện Thủ Thừa', 'Huyện Tân Trụ',
    'Huyện Cần Đước', 'Huyện Cần Giuộc', 'Huyện Châu Thành'
  ],
  'Tỉnh Tiền Giang': [
    'Thành phố Mỹ Tho', 'Thị xã Gò Công', 'Thị xã Cai Lậy',
    'Huyện Tân Phước', 'Huyện Cái Bè', 'Huyện Cai Lậy', 'Huyện Châu Thành',
    'Huyện Chợ Gạo', 'Huyện Gò Công Tây', 'Huyện Gò Công Đông', 'Huyện Tân Phú Đông'
  ],
  'Tỉnh An Giang': [
    'Thành phố Long Xuyên', 'Thành phố Châu Đốc', 'Huyện An Phú', 'Huyện Tân Châu',
    'Huyện Phú Tân', 'Huyện Châu Phú', 'Huyện Tịnh Biên', 'Huyện Tri Tôn',
    'Huyện Châu Thành', 'Huyện Chợ Mới', 'Huyện Thoại Sơn'
  ]
};

export default VIETNAM_LOCATIONS;
