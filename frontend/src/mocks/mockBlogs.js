export const mockBlogs = [
  // Thể loại phim
  {
    _id: 'Những Pha Rượt Đuổi Mãn Nhãn',
    title: 'Phim Hành Động - Những Pha Rượt Đuổi Mãn Nhãn',
    category: 'Thể loại phim',
    imageUrl: 'https://www.galaxycine.vn/media/2025/12/8/preview-avatar-fire-and-ash-mot-tuyet-tac-nua-cua-james-cameron-6_1765204784694.jpg',
    excerpt: 'Khám phá thế giới phim hành động với những pha gay cấn...',
    views: 3456,
    likes: 234,
    author: 'NMN Cinema',
    createdAt: '2024-12-15'
  },
  {
    _id: 'Những Thước Phim Ám Ảnh',
    title: 'Phim Kinh Dị - Những Thước Phim Ám Ảnh',
    category: 'Thể loại phim',
    imageUrl: 'https://www.galaxycine.vn/media/2025/12/3/zootopia-2-disney-thua-biet-khan-gia-muon-gi-6_1764774408476.jpg',
    excerpt: 'Dòng phim kinh dị với những khoảnh khắc rùng rợn...',
    views: 2672,
    likes: 456,
    author: 'NMN Cinema',
    createdAt: '2024-12-14'
  },
  {
    _id: 'Những Câu Chuyện Đẹp Về Tình Yêu',
    title: 'Phim Tình Cảm - Những Câu Chuyện Đẹp Về Tình Yêu',
    category: 'Thể loại phim',
    imageUrl: 'https://www.galaxycine.vn/media/2025/11/30/quan-k-nam-mot-phim-viet-vua-dep-lai-vua-hay-5_1764474870488.jpg',
    excerpt: 'Những bộ phim tình cảm lay động trái tim...',
    views: 1890,
    likes: 345,
    author: 'NMN Cinema',
    createdAt: '2024-12-13'
  },
  {
    _id: 'Thế Giới Màu Sắc Diệu Kỳ',
    title: 'Phim Hoạt Hình - Thế Giới Màu Sắc Diệu Kỳ',
    category: 'Thể loại phim',
    imageUrl: 'https://www.galaxycine.vn/media/2025/11/17/750_1763373893620.jpg',
    excerpt: 'Phim hoạt hình phù hợp cho mọi lứa tuổi...',
    views: 2010,
    likes: 378,
    author: 'NMN Cinema',
    createdAt: '2024-12-12'
  },
  // Diễn viên, Đạo diễn
  {
    _id: 'James Cameron - Vua Của Những Bom Tấn',
    title: 'James Cameron - Vua Của Những Bom Tấn',
    category: 'Diễn viên, Đạo diễn',
    imageUrl: 'https://www.galaxycine.vn/media/2025/12/7/750_1765080791109.jpg',
    excerpt: 'James Cameron - đạo diễn của Titanic, Avatar...',
    views: 4567,
    likes: 567,
    author: 'NMN Cinema',
    createdAt: '2024-12-10'
  },
  {
    _id: 'Trấn Thành - Từ MC Đến Đạo Diễn Triệu View',
    title: 'Trấn Thành - Từ MC Đến Đạo Diễn Triệu View',
    category: 'Diễn viên, Đạo diễn',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop',
    excerpt: 'Hành trình từ nghệ sĩ hài đến đạo diễn...',
    views: 3456,
    likes: 456,
    author: 'NMN Cinema',
    createdAt: '2024-12-08'
  },
  {
    _id: 'person3',
    title: 'Tom Holland - Người Nhện Thế Hệ Mới',
    category: 'Diễn viên, Đạo diễn',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=450&fit=crop',
    excerpt: 'Tom Holland và hành trình trở thành Spider-Man...',
    views: 2345,
    likes: 345,
    author: 'NMN Cinema',
    createdAt: '2024-12-05'
  },
  {
    _id: 'Hoàng Thùy Linh - Ngôi Sao Đa Tài Của Showbiz Việt',
    title: 'Hoàng Thùy Linh - Ngôi Sao Đa Tài Của Showbiz Việt',
    category: 'Diễn viên, Đạo diễn',
    imageUrl: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&h=450&fit=crop',
    excerpt: 'Từ ca sĩ đến diễn viên, Hoàng Thùy Linh không ngừng tỏa sáng...',
    views: 1890,
    likes: 234,
    author: 'NMN Cinema',
    createdAt: '2024-12-01'
  }
];

// Lấy blogs theo category
export const getBlogsByCategory = (category) => {
  return mockBlogs.filter(blog => blog.category === category);
};

// Lấy blog theo ID
export const getBlogById = (id) => {
  return mockBlogs.find(blog => blog._id === id);
};

export default mockBlogs;
