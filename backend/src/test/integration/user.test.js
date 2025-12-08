const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

describe('User Management API', () => {
  jest.setTimeout(60000);

  let token;
  const userData = {
    name: 'Test User Management',
    email: 'testuser@example.com',
    password: 'password123',
    phone: '0987654321'
  };

  beforeAll(async () => {
    console.log('Connecting to DB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/datn-cinema-test-user');
    console.log('Connected. Dropping DB...');
    await mongoose.connection.dropDatabase();

    // 1. Register
    console.log('Registering user...');
    const regRes = await request(app).post('/api/v1/auth/register').send(userData);
    console.log('Register response:', regRes.statusCode);

    // 2. Activate user manually
    console.log('Activating user...');
    const user = await User.findOne({ email: userData.email }).select('+otpCode');
    if (!user) {
      console.log('User not found after register!');
    } else {
      user.isActive = true;
      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.log('User activated.');
    }

    // 3. Login to get token
    console.log('Logging in...');
    const res = await request(app).post('/api/v1/auth/login').send({
      email: userData.email,
      password: userData.password
    });
    console.log('Login response:', res.statusCode);
    token = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('PATCH /api/v1/users/updateMe - Nên cập nhật thông tin cá nhân', async () => {
    const res = await request(app)
      .patch('/api/v1/users/updateMe')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
        address: '123 Test Street',
        gender: 'male'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.user.name).toEqual('Updated Name');
    expect(res.body.data.user.address).toEqual('123 Test Street');
    expect(res.body.data.user.gender).toEqual('male');
  });

  it('PATCH /api/v1/users/updateMe - Không được phép cập nhật mật khẩu', async () => {
    const res = await request(app)
      .patch('/api/v1/users/updateMe')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'newpassword123'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('không dành cho việc cập nhật mật khẩu');
  });

  it('PATCH /api/v1/users/updateMyPassword - Nên cập nhật mật khẩu thành công', async () => {
    const res = await request(app)
      .patch('/api/v1/users/updateMyPassword')
      .set('Authorization', `Bearer ${token}`)
      .send({
        passwordCurrent: 'password123',
        password: 'newpassword123',
        passwordConfirm: 'newpassword123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.token).toBeDefined();

    // Thử login với mật khẩu mới
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: userData.email,
      password: 'newpassword123'
    });
    expect(loginRes.statusCode).toEqual(200);
  });

  it('DELETE /api/v1/users/deleteMe - Nên vô hiệu hóa tài khoản (soft delete)', async () => {
    const res = await request(app)
      .delete('/api/v1/users/deleteMe')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);

    // Kiểm tra trong DB
    const user = await User.findOne({ email: userData.email }).select('+isActive');
    expect(user.isActive).toBe(false);
  });
});
