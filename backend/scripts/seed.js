/**
 * SEED DATA SCRIPT
 * Tạo dữ liệu demo cho thesis presentation
 *
 * Usage: node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const User = require('../src/models/User');
const Cinema = require('../src/models/Cinema');
const Room = require('../src/models/Room');
const Movie = require('../src/models/Movie');
const Showtime = require('../src/models/Showtime');
const Combo = require('../src/models/Combo');
const Voucher = require('../src/models/Voucher');
const Banner = require('../src/models/Banner');
const Article = require('../src/models/Article');
const Event = require('../src/models/Event');

const log = (msg, type = 'INFO') => {
  const icons = { INFO: 'ℹ️', SUCCESS: '✅', ERROR: '❌' };
  console.log(`${icons[type]} ${msg}`);
};

async function seedUsers() {
  log('Seeding Users...');

  const users = [
    { email: 'admin@nmncinema.com', password: 'Admin@123', name: 'Admin NMN', role: 'admin', isActive: true },
    { email: 'manager@nmncinema.com', password: 'Manager@123', name: 'Manager Ninh', role: 'manager', isActive: true },
    { email: 'staff@nmncinema.com', password: 'Staff@123', name: 'Staff Anh', role: 'staff', isActive: true },
    { email: 'user1@test.com', password: 'User@123', name: 'Nguyễn Văn A', role: 'user', isActive: true, points: 500, rank: 'VIP' },
    { email: 'user2@test.com', password: 'User@123', name: 'Trần Thị B', role: 'user', isActive: true, points: 100 },
    { email: 'user3@test.com', password: 'User@123', name: 'Lê Văn C', role: 'user', isActive: true }
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      log(`  Created: ${u.email}`, 'SUCCESS');
    }
  }
}

async function seedCinema() {
  log('Seeding Cinema & Rooms...');

  let cinema = await Cinema.findOne({ name: 'NMN Cinema Hà Nội' });
  if (!cinema) {
    cinema = await Cinema.create({
      name: 'NMN Cinema Hà Nội',
      address: '123 Đường Láng, Đống Đa, Hà Nội',
      phone: '024-1234-5678',
      description: 'Rạp chiếu phim hiện đại nhất Hà Nội',
      status: 'OPEN'
    });
    log(`  Created Cinema: ${cinema.name}`, 'SUCCESS');
  }

  const rooms = [
    { name: 'Cinema 01', type: '2D', totalSeats: 54, status: 'ACTIVE' },
    { name: 'Cinema 02', type: '3D', totalSeats: 54, status: 'ACTIVE' },
    { name: 'Cinema 03', type: 'IMAX', totalSeats: 80, status: 'ACTIVE' }
  ];

  for (const r of rooms) {
    const exists = await Room.findOne({ name: r.name, cinemaId: cinema._id });
    if (!exists) {
      await Room.create({ ...r, cinemaId: cinema._id });
      log(`  Created Room: ${r.name}`, 'SUCCESS');
    }
  }

  return cinema;
}

async function seedMovies() {
  log('Seeding Movies...');

  const movies = [
    { title: 'Lật Mặt 7: Một Điều Ước', status: 'NOW', duration: 132, ageRating: 'C13', genres: ['Hành động', 'Hài'], director: 'Lý Hải', releaseDate: new Date('2024-04-26') },
    { title: 'Cô Dâu Hào Môn', status: 'NOW', duration: 110, ageRating: 'C16', genres: ['Hài', 'Tình cảm'], director: 'Vũ Ngọc Đãng', releaseDate: new Date('2024-10-25') },
    { title: 'Mai', status: 'NOW', duration: 130, ageRating: 'C18', genres: ['Tâm lý', 'Tình cảm'], director: 'Trấn Thành', releaseDate: new Date('2024-02-10') },
    { title: 'Godzilla x Kong: Đế Chế Mới', status: 'NOW', duration: 115, ageRating: 'C13', genres: ['Hành động', 'Viễn tưởng'], director: 'Adam Wingard', releaseDate: new Date('2024-03-29') },
    { title: 'Dune: Phần Hai', status: 'NOW', duration: 166, ageRating: 'C13', genres: ['Viễn tưởng', 'Phiêu lưu'], director: 'Denis Villeneuve', releaseDate: new Date('2024-03-01') },
    { title: 'Avatar 3', status: 'COMING', duration: 180, ageRating: 'C13', genres: ['Viễn tưởng', 'Phiêu lưu'], director: 'James Cameron', releaseDate: new Date('2025-12-20') },
    { title: 'Avengers: Secret Wars', status: 'COMING', duration: 150, ageRating: 'C13', genres: ['Hành động', 'Siêu anh hùng'], director: 'Russo Brothers', releaseDate: new Date('2026-05-01') },
    { title: 'Bố Già 3', status: 'COMING', duration: 125, ageRating: 'C16', genres: ['Hài', 'Gia đình'], director: 'Trấn Thành', releaseDate: new Date('2025-12-31') },
    { title: 'Quỷ Ám: Tín Đồ', status: 'COMING', duration: 100, ageRating: 'C18', genres: ['Kinh dị'], director: 'David Gordon Green', releaseDate: new Date('2025-12-25') },
    { title: 'Transformers 8', status: 'COMING', duration: 140, ageRating: 'C13', genres: ['Hành động', 'Viễn tưởng'], director: 'Michael Bay', releaseDate: new Date('2026-06-15') }
  ];

  const created = [];
  for (const m of movies) {
    const exists = await Movie.findOne({ title: m.title });
    if (!exists) {
      const movie = await Movie.create({
        ...m,
        description: `${m.title} - Bộ phim hấp dẫn đáng xem nhất năm 2025.`,
        posterUrl: `https://via.placeholder.com/300x450?text=${encodeURIComponent(m.title)}`,
        bannerUrl: `https://via.placeholder.com/1200x400?text=${encodeURIComponent(m.title)}`,
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      });
      created.push(movie);
      log(`  Created Movie: ${m.title}`, 'SUCCESS');
    } else {
      created.push(exists);
    }
  }

  return created;
}

async function seedShowtimes(movies, cinema) {
  log('Seeding Showtimes...');

  // Clear old showtimes first to ensure fresh data
  await Showtime.deleteMany({});
  log('  Cleared old showtimes');

  const rooms = await Room.find({ cinemaId: cinema._id });
  const nowMovies = movies.filter(m => m.status === 'NOW');

  if (rooms.length === 0) {
    log('  No rooms found!', 'ERROR');
    return;
  }

  const times = ['10:00', '12:30', '15:00', '17:30', '20:00', '22:30'];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day
  let created = 0;

  // Create showtimes for next 7 days
  for (let day = 0; day < 7; day++) {
    for (const room of rooms) {
      // Each room gets 3-4 showtimes per day
      for (let timeIdx = 0; timeIdx < 4; timeIdx++) {
        const movie = nowMovies[Math.floor(Math.random() * nowMovies.length)];
        const timeStr = times[timeIdx + (room.type === 'IMAX' ? 2 : 0)];
        const [hours, mins] = timeStr.split(':');

        const startAt = new Date(today);
        startAt.setDate(startAt.getDate() + day);
        startAt.setHours(parseInt(hours), parseInt(mins), 0, 0);

        const endAt = new Date(startAt.getTime() + movie.duration * 60000 + 30 * 60000); // +30 min cleanup

        try {
          await Showtime.create({
            movieId: movie._id,
            cinemaId: cinema._id,
            roomId: room._id,
            startAt,
            endAt,
            format: room.type,
            basePrice: room.type === 'IMAX' ? 150000 : room.type === '3D' ? 100000 : 85000,
            status: 'OPEN'
          });
          created++;
        } catch (err) {
          // Skip duplicate key errors
        }
      }
    }
  }
  log(`  Created ${created} showtimes for ${nowMovies.length} movies`, 'SUCCESS');
}

async function seedCombos() {
  log('Seeding Combos...');

  const combos = [
    { name: 'Combo Solo', description: '1 Bắp Nhỏ + 1 Nước Nhỏ', price: 59000, items: [{ name: 'Bắp Nhỏ', quantity: 1 }, { name: 'Coca Nhỏ', quantity: 1 }] },
    { name: 'Combo Couple', description: '1 Bắp Lớn + 2 Nước', price: 89000, items: [{ name: 'Bắp Lớn', quantity: 1 }, { name: 'Coca Lớn', quantity: 2 }] },
    { name: 'Combo Family', description: '2 Bắp Lớn + 4 Nước', price: 159000, items: [{ name: 'Bắp Lớn', quantity: 2 }, { name: 'Coca Lớn', quantity: 4 }] },
    { name: 'Combo VIP', description: 'Bắp Caramel + 2 Nước + Snack', price: 129000, items: [{ name: 'Bắp Caramel', quantity: 1 }, { name: 'Pepsi', quantity: 2 }, { name: 'Snack', quantity: 1 }] },
    { name: 'Nước Lẻ', description: '1 Nước Lớn', price: 35000, items: [{ name: 'Nước Lớn', quantity: 1 }] }
  ];

  for (const c of combos) {
    const exists = await Combo.findOne({ name: c.name });
    if (!exists) {
      await Combo.create({ ...c, status: 'ACTIVE' });
      log(`  Created Combo: ${c.name}`, 'SUCCESS');
    }
  }
}

async function seedVouchers() {
  log('Seeding Vouchers...');

  const vouchers = [
    { code: 'WELCOME10', type: 'PERCENT', value: 10, maxDiscount: 50000, validFrom: new Date(), validTo: new Date(Date.now() + 30 * 86400000), usageLimit: 100 },
    { code: 'VIP20', type: 'PERCENT', value: 20, maxDiscount: 100000, validFrom: new Date(), validTo: new Date(Date.now() + 60 * 86400000), usageLimit: 50 },
    { code: 'NOEL50K', type: 'FIXED', value: 50000, validFrom: new Date(), validTo: new Date('2025-12-31'), usageLimit: 200 }
  ];

  for (const v of vouchers) {
    const exists = await Voucher.findOne({ code: v.code });
    if (!exists) {
      await Voucher.create({ ...v, status: 'ACTIVE' });
      log(`  Created Voucher: ${v.code}`, 'SUCCESS');
    }
  }
}

async function seedCMS() {
  log('Seeding CMS Content...');

  // Banners
  const banners = [
    { imageUrl: 'https://via.placeholder.com/1200x400?text=Banner+1', title: 'Khuyến mãi Noel', linkUrl: '/events', position: 1, priority: 1 },
    { imageUrl: 'https://via.placeholder.com/1200x400?text=Banner+2', title: 'Phim hay tháng 12', linkUrl: '/movies', position: 2, priority: 2 },
    { imageUrl: 'https://via.placeholder.com/1200x400?text=Banner+3', title: 'Thành viên VIP', linkUrl: '/membership', position: 3, priority: 3 }
  ];

  for (const b of banners) {
    const exists = await Banner.findOne({ title: b.title });
    if (!exists) {
      await Banner.create({ ...b, status: 'ACTIVE' });
      log(`  Created Banner: ${b.title}`, 'SUCCESS');
    }
  }

  // Articles
  const articles = [
    { title: 'Top 10 phim hay nhất 2025', slug: 'top-10-phim-hay-2025', category: 'REVIEW', summary: 'Điểm danh những bộ phim xuất sắc nhất năm.', content: 'Nội dung chi tiết...', status: 'PUBLISHED' },
    { title: 'Lật Mặt 7 phá kỷ lục phòng vé', slug: 'lat-mat-7-pha-ky-luc', category: 'NEWS', summary: 'Doanh thu vượt 1000 tỷ đồng.', content: 'Nội dung chi tiết...', status: 'PUBLISHED' },
    { title: 'Trấn Thành và hành trình làm đạo diễn', slug: 'tran-thanh-dao-dien', category: 'NEWS', summary: 'Từ MC đến đạo diễn triệu đô.', content: 'Nội dung chi tiết...', status: 'PUBLISHED' }
  ];

  for (const a of articles) {
    const exists = await Article.findOne({ slug: a.slug });
    if (!exists) {
      try {
        await Article.create({ ...a, thumbnailUrl: 'https://via.placeholder.com/400x250' });
        log(`  Created Article: ${a.title}`, 'SUCCESS');
      } catch (err) {
        // Skip duplicate
      }
    }
  }

  // Events
  const events = [
    { title: 'Khuyến mãi Noel 2025', description: 'Giảm 50% vé xem phim từ 24-26/12', bannerUrl: 'https://via.placeholder.com/800x400', startAt: new Date('2025-12-24'), endAt: new Date('2025-12-26'), status: 'UPCOMING' },
    { title: 'Happy Hour - Thứ 2 vui vẻ', description: 'Mua 1 tặng 1 mỗi thứ 2 hàng tuần', bannerUrl: 'https://via.placeholder.com/800x400', startAt: new Date(), endAt: new Date('2026-03-31'), status: 'ONGOING' },
    { title: 'Student Day', description: 'Sinh viên giảm 30% khi đặt vé trước 17h', bannerUrl: 'https://via.placeholder.com/800x400', startAt: new Date(), endAt: new Date('2026-06-30'), status: 'ONGOING' }
  ];

  for (const e of events) {
    const exists = await Event.findOne({ title: e.title });
    if (!exists) {
      await Event.create(e);
      log(`  Created Event: ${e.title}`, 'SUCCESS');
    }
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║      NMN CINEMA - SEED DATA SCRIPT        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  await mongoose.connect(process.env.MONGO_URI);
  log('MongoDB connected', 'SUCCESS');

  try {
    await seedUsers();
    const cinema = await seedCinema();
    const movies = await seedMovies();
    await seedShowtimes(movies, cinema);
    await seedCombos();
    await seedVouchers();
    await seedCMS();

    console.log('\n✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('────────────────────────────────');
    console.log('Admin: admin@nmncinema.com / Admin@123');
    console.log('Manager: manager@nmncinema.com / Manager@123');
    console.log('Staff: staff@nmncinema.com / Staff@123');
    console.log('User: user1@test.com / User@123');
    console.log('────────────────────────────────\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main();
