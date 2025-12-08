/**
 * Unit Tests cho Check-in Controller
 * Test cases theo thesis: TC-04 (Quét QR 2 lần)
 */

jest.mock('../../models/Ticket');
jest.mock('../../services/auditLogService');

const Ticket = require('../../models/Ticket');
const auditLogService = require('../../services/auditLogService');
const checkinController = require('../../controllers/checkinController');

describe('Check-in Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      user: { id: 'staff123' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('scanTicket - TC-04: Check-in QR', () => {
    /**
     * TC-04: Check-in QR
     * Kỳ vọng: Quét QR 2 lần -> Lần 1 thành công; lần 2 bị từ chối
     */

    test('Lần quét thứ 2 nên bị từ chối vì vé đã sử dụng', async () => {
      // Arrange
      mockReq.body = {
        qrChecksum: 'valid_checksum_abc123'
      };

      const usedTicket = {
        _id: 'ticket123',
        ticketCode: 'TKT-123',
        seatCode: 'A1',
        status: 'USED',
        usedAt: new Date(),
        userId: { name: 'Test User' },
        showtimeId: {
          startAt: new Date(),
          movieId: { title: 'Test Movie' },
          roomId: { name: 'Room 1' }
        }
      };

      // Mock chain populate
      Ticket.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(usedTicket)
        })
      });

      // Act
      await checkinController.scanTicket(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'fail',
          message: expect.stringContaining('đã được sử dụng')
        })
      );
    });

    test('Nên từ chối vé đã bị hủy (VOID)', async () => {
      // Arrange
      mockReq.body = {
        ticketCode: 'TKT-VOID-123'
      };

      const voidTicket = {
        _id: 'ticket123',
        ticketCode: 'TKT-VOID-123',
        status: 'VOID'
      };

      Ticket.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(voidTicket)
        })
      });

      // Act
      await checkinController.scanTicket(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('bị hủy');
    });

    test('Nên từ chối khi không tìm thấy vé', async () => {
      // Arrange
      mockReq.body = {
        qrChecksum: 'invalid_checksum'
      };

      Ticket.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        })
      });

      // Act
      await checkinController.scanTicket(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
    });

    test('Nên yêu cầu ticketCode hoặc qrChecksum', async () => {
      // Arrange
      mockReq.body = {}; // Không có gì

      // Act
      await checkinController.scanTicket(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });
  });
});
