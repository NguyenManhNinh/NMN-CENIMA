const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Cinema = require('../../src/models/Cinema');
const Room = require('../../src/models/Room');
const Movie = require('../../src/models/Movie');
const Showtime = require('../../src/models/Showtime');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

let adminToken;
let cinemaId, roomId1, roomId2, movieId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // 1. Tạo Admin
  await User.deleteOne({ email: 'admin_test_showtime@cinema.com' });
  const admin = await User.create({
    name: 'Admin Test Showtime',
    email: 'admin_test_showtime@cinema.com',
    password: 'Password123!',
    role: 'admin',
    isActive: true
  });

  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'admin_test_showtime@cinema.com',
    password: 'Password123!'
  });
  adminToken = res.body.token;

  // 2. Tạo Cinema & Rooms
  const cinema = await Cinema.create({ name: 'Cinema Test Showtime', address: 'Hanoi', phone: '111' });
  cinemaId = cinema._id;

  const room1 = await Room.create({ name: 'Room 1', cinemaId, totalSeats: 50 });
  roomId1 = room1._id;

  const room2 = await Room.create({ name: 'Room 2', cinemaId, totalSeats: 50 });
  roomId2 = room2._id;

  // 3. Tạo Movie (Duration 120 mins)
  const movie = await Movie.create({
    title: 'Movie Test Showtime',
    description: 'Desc',
    director: 'Director',
    duration: 120,
    posterUrl: 'poster.jpg',
    trailerUrl: 'url',
    releaseDate: new Date()
  });
  movieId = movie._id;
});

afterAll(async () => {
  // Cleanup
  await Showtime.deleteMany({ movieId });
  await Movie.deleteMany({ _id: movieId });
  await Room.deleteMany({ cinemaId });
  await Cinema.deleteMany({ _id: cinemaId });
  await User.deleteOne({ email: 'admin_test_showtime@cinema.com' });
  await mongoose.connection.close();
});

describe('Showtime Collision Detection', () => {

  test('TC-01: Tạo Suất A (10:00 - 12:00) tại Phòng 1 -> PASS', async () => {
    // Start: 10:00. End: 10:00 + 120m + 30m = 12:30 (Logic controller tự tính)
    // Để đơn giản test, ta chỉ quan tâm startAt. Controller sẽ tính endAt.
    const startAt = new Date();
    startAt.setHours(10, 0, 0, 0); // Hôm nay 10:00

    const res = await request(app)
      .post('/api/v1/showtimes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        movieId,
        roomId: roomId1,
        startAt,
        basePrice: 50000
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.showtime).toHaveProperty('_id');
  });

  test('TC-02: Tạo Suất B (11:00 - 13:00) tại Phòng 1 -> FAIL (Collision)', async () => {
    // Suất A kết thúc lúc 12:30 (120p phim + 30p dọn).
    // Suất B bắt đầu lúc 11:00 -> Chắc chắn trùng.
    const startAt = new Date();
    startAt.setHours(11, 0, 0, 0);

    const res = await request(app)
      .post('/api/v1/showtimes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        movieId,
        roomId: roomId1,
        startAt,
        basePrice: 50000
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Xung đột lịch chiếu');
  });

  test('TC-03: Tạo Suất C (11:00 - 13:00) tại Phòng 2 -> PASS (Different Room)', async () => {
    // Cùng giờ với Suất B nhưng khác phòng -> OK
    const startAt = new Date();
    startAt.setHours(11, 0, 0, 0);

    const res = await request(app)
      .post('/api/v1/showtimes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        movieId,
        roomId: roomId2,
        startAt,
        basePrice: 50000
      });

    expect(res.statusCode).toBe(201);
  });

});
