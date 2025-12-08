const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên người dùng!'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email!'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập địa chỉ email hợp lệ!'
      ]
    },
    password: {
      type: String,
      required: [
        function () {
          return this.authType === 'local';
        },
        'Vui lòng nhập mật khẩu!'
      ],
      minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự!'],
      select: false // Không trả về mật khẩu khi query
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['user', 'staff', 'manager', 'admin'],
      default: 'user'
    },
    authType: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local'
    },
    authId: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: false,
      select: false
    },
    // --- Membership Fields ---
    points: {
      type: Number,
      default: 0
    },
    rank: {
      type: String,
      enum: ['MEMBER', 'VIP', 'VVIP'],
      default: 'MEMBER'
    },
    // -------------------------
    otpCode: {
      type: String,
      select: false
    },
    otpExpires: {
      type: Date,
      select: false
    },
    avatar: {
      type: String,
      default: 'default.jpg'
    },
    address: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    birthday: {
      type: Date
    },
    passwordChangedAt: Date
  },
  {
    timestamps: true // Tự động tạo createdAt và updatedAt
  }
);

// Middleware: Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
  // Chỉ chạy nếu mật khẩu được thay đổi
  if (!this.isModified('password')) return next();

  // Mã hóa mật khẩu với cost là 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// Middleware: Cập nhật passwordChangedAt khi đổi mật khẩu
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Trừ 1s để đảm bảo token tạo sau khi đổi pass
  next();
});

// Phương thức instance: Kiểm tra mật khẩu
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Phương thức instance: Kiểm tra xem mật khẩu có thay đổi sau khi token được cấp không
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False nghĩa là không thay đổi
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
