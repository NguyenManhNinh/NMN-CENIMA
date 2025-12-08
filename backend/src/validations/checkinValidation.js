/**
 * Validation schemas cho Payment routes
 * Sử dụng Zod để validate request body
 */
const { z } = require('zod');

// Schema cho check-in (scan vé)
const scanTicketSchema = z.object({
  ticketCode: z
    .string()
    .min(1, 'Mã vé không được để trống!')
    .optional(),
  qrChecksum: z
    .string()
    .min(1, 'Mã QR không được để trống!')
    .optional()
}).refine(
  (data) => data.ticketCode || data.qrChecksum,
  { message: 'Vui lòng cung cấp mã vé hoặc mã QR!' }
);

module.exports = {
  scanTicketSchema
};
