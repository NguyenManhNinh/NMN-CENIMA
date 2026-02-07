/**
 * Seed script cho FeaturedArticle
 * Chạy: node src/seeds/seedFeatured.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const FeaturedArticle = require('../models/FeaturedArticle');

const seedData = [
  {
    title: 'Phim Hay Tháng 2/2026: Tương Lai Đen Tối',
    thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cde69a1?w=600&h=338&fit=crop',
    excerpt: 'Khám phá những bộ phim hấp dẫn nhất tháng 2/2026 với các bom tấn hành động và phim kinh dị đáng chờ đợi.',
    content: '<p>Nội dung chi tiết về các phim hay tháng 2/2026...</p>',
    author: 'Admin',
    viewCount: 1250,
    likeCount: 89,
    status: 'published'
  },
  {
    title: 'Phim Hay Tháng 1/2026: Mùa Ván Đay',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=338&fit=crop',
    excerpt: 'Tổng hợp những bộ phim đáng xem nhất đầu năm 2026 với nhiều thể loại phong phú.',
    content: '<p>Nội dung chi tiết về các phim hay tháng 1/2026...</p>',
    author: 'Admin',
    viewCount: 2340,
    likeCount: 156,
    status: 'published'
  },
  {
    title: 'Phim Hay Tháng 12/2025: Mùa Lễ Hội',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=338&fit=crop',
    excerpt: 'Những bộ phim ấm áp và cảm động cho mùa lễ hội cuối năm.',
    content: '<p>Nội dung chi tiết về các phim hay tháng 12/2025...</p>',
    author: 'Admin',
    viewCount: 3120,
    likeCount: 234,
    status: 'published'
  },
  {
    title: 'Phim Hay Tháng 11/2025: Hành Trình Mới',
    thumbnail: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=338&fit=crop',
    excerpt: 'Khám phá các tác phẩm điện ảnh xuất sắc nhất tháng 11 với nhiều đề tài mới mẻ.',
    content: '<p>Nội dung chi tiết về các phim hay tháng 11/2025...</p>',
    author: 'Admin',
    viewCount: 1890,
    likeCount: 112,
    status: 'published'
  },
  {
    title: 'Phim Hay Tháng 10/2025: Mùa Kinh Dị',
    thumbnail: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&h=338&fit=crop',
    excerpt: 'Halloween 2025 với những bộ phim kinh dị đáng sợ nhất.',
    content: '<p>Nội dung chi tiết về các phim hay tháng 10/2025...</p>',
    author: 'Admin',
    viewCount: 4560,
    likeCount: 345,
    status: 'published'
  }
];

const seedFeatured = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ
    await FeaturedArticle.deleteMany({});
    console.log('🗑️  Cleared old featured articles');

    // Tạo dữ liệu mới
    const articles = await FeaturedArticle.insertMany(seedData);
    console.log(`✅ Created ${articles.length} featured articles`);

    articles.forEach(article => {
      console.log(`   - ${article.title} (slug: ${article.slug})`);
    });

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  }
};

seedFeatured();
