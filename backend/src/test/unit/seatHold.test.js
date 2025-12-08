/**
 * Unit Tests cho SeatHold Service/Controller
 * Test cases theo thesis: TC-01, TC-02
 */

// Mock dependencies trước khi import
jest.mock('../../models/SeatHold');
jest.mock('../../services/socketService');

const SeatHold = require('../../models/SeatHold');
const socketService = require('../../services/socketService');
const seatHoldController = require('../../controllers/seatHoldController');

describe('SeatHold Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Reset mocks
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

  describe('createHold', () => {
    /**
     * TC-01: Giữ ghế đồng thời
     * Kỳ vọng: Một giữ thành công; bên kia báo bận
     */
    test('Nên giữ ghế thành công khi ghế trống', async () => {
      // Arrange
      mockReq.body = {
        showtimeId: '507f1f77bcf86cd799439011',
        seatCode: 'A1',
        groupId: 'group123'
      };

      SeatHold.findOne = jest.fn().mockResolvedValue(null);
      SeatHold.create = jest.fn().mockResolvedValue({
        _id: 'hold123',
        showtimeId: mockReq.body.showtimeId,
        seatCode: 'A1',
        userId: 'user123',
        expiredAt: new Date(Date.now() + 15 * 60 * 1000)
      });
      socketService.emitSeatHeld = jest.fn();

      // Act
      await seatHoldController.createHold(mockReq, mockRes, mockNext);

      // Assert
      expect(SeatHold.create).toHaveBeenCalled();
      expect(socketService.emitSeatHeld).toHaveBeenCalledWith(
        mockReq.body.showtimeId,
        'A1',
        'user123'
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('Nên từ chối khi ghế đã có người giữ (chưa hết hạn)', async () => {
      // Arrange
      mockReq.body = {
        showtimeId: '507f1f77bcf86cd799439011',
        seatCode: 'A1'
      };

      // Mock ghế đã được giữ và chưa hết hạn
      SeatHold.findOne = jest.fn().mockResolvedValue({
        _id: 'existingHold',
        seatCode: 'A1',
        userId: 'otherUser',
        expiredAt: new Date(Date.now() + 10 * 60 * 1000) // Còn 10 phút
      });

      // Act
      await seatHoldController.createHold(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(409);
      expect(error.message).toContain('đã có người giữ');
    });

    /**
     * TC-02: Timeout hold
     * Kỳ vọng: Ghế tự mở khi hết hạn
     */
    test('Nên xóa hold cũ nếu đã hết hạn và cho người mới giữ', async () => {
      // Arrange
      mockReq.body = {
        showtimeId: '507f1f77bcf86cd799439011',
        seatCode: 'A1'
      };

      const expiredHold = {
        _id: 'expiredHold',
        seatCode: 'A1',
        userId: 'oldUser',
        expiredAt: new Date(Date.now() - 1000) // Đã hết hạn
      };

      SeatHold.findOne = jest.fn().mockResolvedValue(expiredHold);
      SeatHold.findByIdAndDelete = jest.fn().mockResolvedValue(expiredHold);
      SeatHold.create = jest.fn().mockResolvedValue({
        _id: 'newHold',
        seatCode: 'A1',
        userId: 'user123'
      });
      socketService.emitSeatHeld = jest.fn();

      // Act
      await seatHoldController.createHold(mockReq, mockRes, mockNext);

      // Assert
      expect(SeatHold.findByIdAndDelete).toHaveBeenCalledWith('expiredHold');
      expect(SeatHold.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('Nên xử lý race condition (duplicate key error)', async () => {
      // Arrange
      mockReq.body = {
        showtimeId: '507f1f77bcf86cd799439011',
        seatCode: 'A1'
      };

      SeatHold.findOne = jest.fn().mockResolvedValue(null);
      SeatHold.create = jest.fn().mockRejectedValue({ code: 11000 }); // Duplicate key

      // Act
      await seatHoldController.createHold(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(409);
    });
  });

  describe('releaseHold', () => {
    test('Nên nhả ghế thành công khi đúng chủ sở hữu', async () => {
      // Arrange
      mockReq.body = {
        showtimeId: '507f1f77bcf86cd799439011',
        seatCode: 'A1'
      };

      SeatHold.findOneAndDelete = jest.fn().mockResolvedValue({
        _id: 'hold123',
        seatCode: 'A1',
        userId: 'user123'
      });
      socketService.emitSeatReleased = jest.fn();

      // Act
      await seatHoldController.releaseHold(mockReq, mockRes, mockNext);

      // Assert
      expect(SeatHold.findOneAndDelete).toHaveBeenCalledWith({
        showtimeId: mockReq.body.showtimeId,
        seatCode: 'A1',
        userId: 'user123'
      });
      expect(socketService.emitSeatReleased).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    test('Nên từ chối khi không phải người giữ', async () => {
      // Arrange
      mockReq.body = {
        showtimeId: '507f1f77bcf86cd799439011',
        seatCode: 'A1'
      };

      SeatHold.findOneAndDelete = jest.fn().mockResolvedValue(null);

      // Act
      await seatHoldController.releaseHold(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
    });
  });
});
