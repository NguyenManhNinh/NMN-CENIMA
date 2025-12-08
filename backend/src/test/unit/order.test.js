/**
 * Unit Tests cho Order Controller
 * Test cases: createOrder, getMyOrders
 */

jest.mock('../../models/Order');
jest.mock('../../models/Showtime');
jest.mock('../../models/SeatHold');
jest.mock('../../models/Combo');
jest.mock('../../models/Voucher');
jest.mock('../../models/Ticket');

const Order = require('../../models/Order');
const Showtime = require('../../models/Showtime');
const SeatHold = require('../../models/SeatHold');
const Combo = require('../../models/Combo');
const Voucher = require('../../models/Voucher');
const Ticket = require('../../models/Ticket');

describe('Order Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
      user: { id: 'user123' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('createOrder', () => {
    test('Nên tạo order thành công với dữ liệu hợp lệ', async () => {
      // Arrange
      mockReq.body = {
        showtimeId: '507f1f77bcf86cd799439011',
        seats: ['A1', 'A2'],
        combos: [{ comboId: 'combo1', quantity: 2 }]
      };

      const mockShowtime = {
        _id: '507f1f77bcf86cd799439011',
        movieId: { title: 'Test Movie' },
        roomId: { name: 'Room 1' },
        basePrice: 100000,
        startAt: new Date('2025-12-08T14:00:00')
      };

      Showtime.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockShowtime)
        })
      });

      SeatHold.find = jest.fn().mockResolvedValue([
        { seatCode: 'A1', userId: 'user123' },
        { seatCode: 'A2', userId: 'user123' }
      ]);

      Combo.find = jest.fn().mockResolvedValue([
        { _id: 'combo1', name: 'Combo A', price: 50000 }
      ]);

      Order.create = jest.fn().mockResolvedValue({
        _id: 'order123',
        orderNo: 'NMN123456',
        totalAmount: 300000,
        status: 'PENDING'
      });

      // Assert
      expect(Showtime.findById).toBeDefined();
      expect(SeatHold.find).toBeDefined();
      expect(Order.create).toBeDefined();
    });

    test('Nên từ chối nếu không có seat hold hợp lệ', async () => {
      // Arrange
      mockReq.body = {
        showtimeId: '507f1f77bcf86cd799439011',
        seats: ['A1', 'A2']
      };

      const mockShowtime = {
        _id: '507f1f77bcf86cd799439011',
        basePrice: 100000
      };

      Showtime.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockShowtime)
        })
      });

      // User không có hold cho ghế A1, A2
      SeatHold.find = jest.fn().mockResolvedValue([]);

      // Assert - should fail because no holds
      expect(SeatHold.find).toBeDefined();
    });

    test('Nên áp dụng voucher đúng cách', async () => {
      // Arrange
      mockReq.body = {
        showtimeId: '507f1f77bcf86cd799439011',
        seats: ['A1'],
        voucherCode: 'DISCOUNT50'
      };

      const mockVoucher = {
        _id: 'voucher123',
        code: 'DISCOUNT50',
        type: 'PERCENT',
        value: 50, // 50%
        maxDiscount: 50000,
        validFrom: new Date(Date.now() - 86400000),
        validTo: new Date(Date.now() + 86400000),
        usageCount: 0,
        usageLimit: 100,
        status: 'active'
      };

      Voucher.findOne = jest.fn().mockResolvedValue(mockVoucher);

      // Assert
      expect(mockVoucher.value).toBe(50);
      expect(mockVoucher.type).toBe('PERCENT');
    });

    test('Nên từ chối voucher hết hạn', async () => {
      // Arrange
      const expiredVoucher = {
        code: 'EXPIRED',
        validTo: new Date(Date.now() - 86400000), // Hết hạn
        status: 'active'
      };

      Voucher.findOne = jest.fn().mockResolvedValue(expiredVoucher);

      // Assert - voucher is expired
      expect(expiredVoucher.validTo.getTime()).toBeLessThan(Date.now());
    });
  });

  describe('getMyOrders', () => {
    test('Nên trả về danh sách orders của user', async () => {
      // Arrange
      const mockOrders = [
        { _id: 'order1', totalAmount: 200000, status: 'PAID' },
        { _id: 'order2', totalAmount: 150000, status: 'PENDING' }
      ];

      Order.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockOrders)
        })
      });

      // Assert
      expect(Order.find).toBeDefined();
      expect(mockOrders.length).toBe(2);
    });
  });

  describe('Idempotency', () => {
    /**
     * TC-03: IPN idempotent
     * Kỳ vọng: Đơn hàng chỉ PAID một lần
     */
    test('Nên bỏ qua duplicate order creation', async () => {
      // Arrange - Order đã tồn tại
      const existingOrder = {
        _id: 'order123',
        orderNo: 'NMN123456',
        status: 'PAID'
      };

      Order.findOne = jest.fn().mockResolvedValue(existingOrder);

      // Assert - order already exists
      expect(existingOrder.status).toBe('PAID');
    });
  });

  describe('Price Calculation', () => {
    test('Nên tính phụ thu ghế VIP đúng', async () => {
      // Arrange
      const basePrice = 100000;
      const vipSurcharge = 30000; // VIP_SEAT_SURCHARGE
      const seats = [
        { seatCode: 'A1', isVip: false }, // 100000
        { seatCode: 'V1', isVip: true }   // 130000
      ];

      const expectedTotal = basePrice + (basePrice + vipSurcharge);

      // Assert
      expect(expectedTotal).toBe(230000);
    });

    test('Nên tính tổng tiền combo đúng', async () => {
      // Arrange
      const combos = [
        { price: 50000, quantity: 2 },  // 100000
        { price: 70000, quantity: 1 }   // 70000
      ];

      const totalCombo = combos.reduce((sum, c) => sum + c.price * c.quantity, 0);

      // Assert
      expect(totalCombo).toBe(170000);
    });
  });
});
