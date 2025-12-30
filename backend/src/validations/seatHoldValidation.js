const { z } = require('zod');

// Schema giữ ghế
const createHoldSchema = z.object({
  showtimeId: z
    .string({ required_error: 'Vui lòng chọn suất chiếu!' })
    .regex(/^[0-9a-fA-F]{24}$/, 'ID suất chiếu không hợp lệ!'),
  seatCode: z
    .string({ required_error: 'Vui lòng chọn ghế!' })
    .regex(/^[A-Z]\d{1,2}$/, 'Mã ghế không hợp lệ (VD: A1, A01, B2)!'),
  groupId: z
    .string()
    .optional()
});

// Schema nhả ghế
const releaseHoldSchema = z.object({
  showtimeId: z
    .string({ required_error: 'Thiếu ID suất chiếu!' })
    .regex(/^[0-9a-fA-F]{24}$/, 'ID suất chiếu không hợp lệ!'),
  seatCode: z
    .string({ required_error: 'Thiếu mã ghế!' })
    .regex(/^[A-Z]\d{1,2}$/, 'Mã ghế không hợp lệ (VD: A1, A01, B2)!')
});

// Schema lấy holds theo showtime (params)
const showtimeIdParamSchema = z.object({
  showtimeId: z
    .string({ required_error: 'Thiếu ID suất chiếu!' })
    .regex(/^[0-9a-fA-F]{24}$/, 'ID suất chiếu không hợp lệ!')
});

module.exports = {
  createHoldSchema,
  releaseHoldSchema,
  showtimeIdParamSchema
};
