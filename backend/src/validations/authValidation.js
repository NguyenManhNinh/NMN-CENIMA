const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên người dùng!'),
  email: z.string().email('Địa chỉ email không hợp lệ!'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự!'),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Địa chỉ email không hợp lệ!'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu!')
});

const verifySchema = z.object({
  email: z.string().email('Địa chỉ email không hợp lệ!'),
  otp: z.string().length(4, 'Mã OTP phải có 4 ký tự!')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Địa chỉ email không hợp lệ!')
});

const resetPasswordSchema = z.object({
  email: z.string().email('Địa chỉ email không hợp lệ!'),
  otp: z.string().length(4, 'Mã OTP phải có 4 ký tự!'),
  password: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự!')
});

module.exports = {
  registerSchema,
  loginSchema,
  verifySchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
