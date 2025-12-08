/**
 * Validation schemas cho Order routes
 * Sử dụng Zod để validate request body
 */
const { z } = require('zod');

// Schema tạo đơn hàng mới
const createOrderSchema = z.object({
  showtimeId: z
    .string({ required_error: 'Vui lòng chọn suất chiếu!' })
    .regex(/^[0-9a-fA-F]{24}$/, 'ID suất chiếu không hợp lệ!'),
  seats: z
    .array(z.string().regex(/^[A-Z]\d+$/, 'Mã ghế không hợp lệ (VD: A1, B2)!'))
    .min(1, 'Vui lòng chọn ít nhất 1 ghế!')
    .max(10, 'Tối đa 10 ghế cho mỗi đơn hàng!'),
  combos: z
    .array(
      z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID combo không hợp lệ!').optional(),
        _id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID combo không hợp lệ!').optional(),
        name: z.string().optional(),
        quantity: z.number().int().positive('Số lượng phải lớn hơn 0!')
      })
    )
    .optional()
    .default([]),
  voucherCode: z
    .string()
    .max(20, 'Mã voucher không hợp lệ!')
    .optional()
});

// Schema lấy đơn hàng theo ID (cho params)
const orderIdParamSchema = z.object({
  id: z
    .string({ required_error: 'Thiếu ID đơn hàng!' })
    .regex(/^[0-9a-fA-F]{24}$/, 'ID đơn hàng không hợp lệ!')
});

module.exports = {
  createOrderSchema,
  orderIdParamSchema
};
