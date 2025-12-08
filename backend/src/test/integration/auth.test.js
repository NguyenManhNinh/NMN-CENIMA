const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

// Cấu hình kết nối DB test
beforeAll(async () => {
  jest.setTimeout(30000); // Tăng timeout lên 30s
  const mongoUri = 'mongodb://127.0.0.1:27017/datn-cinema-test-otp';
  await mongoose.connect(mongoUri);
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth API with OTP', () => {
  jest.setTimeout(30000); // Tăng timeout lên 30s
  const userData = {
    name: 'Test User OTP',
    email: 'testotp@example.com',
    password: 'password123',
    phone: '0123456789'
  };

  let otpCode;

  it('POST /api/v1/auth/register - Nên gửi OTP và trả về thông báo', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(userData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toContain('Vui lòng kiểm tra email');

    // Lấy OTP từ DB để test bước tiếp theo
    const user = await User.findOne({ email: userData.email }).select('+otpCode +isActive');
    expect(user).toBeDefined();
    expect(user.isActive).toBe(false);
    expect(user.otpCode).toBeDefined();
    otpCode = user.otpCode;
  });

  it('POST /api/v1/auth/login - Nên thất bại nếu chưa verify', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: userData.email,
      password: userData.password
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toContain('chưa được kích hoạt');
  });

  it('POST /api/v1/auth/verify - Nên kích hoạt tài khoản thành công', async () => {
    const res = await request(app).post('/api/v1/auth/verify').send({
      email: userData.email,
      otp: otpCode
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.token).toBeDefined();

    const user = await User.findOne({ email: userData.email });
    expect(user.isActive).toBe(true);
  });

  it('POST /api/v1/auth/login - Nên đăng nhập thành công sau khi verify', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: userData.email,
      password: userData.password
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.token).toBeDefined();
  });
});
