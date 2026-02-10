/**
 * Unit Tests cho Ticket Pricing Controller
 * Test cases: getTicketPricing, updateTicketPricing
 */

jest.mock('../../models/TicketPricing');

const TicketPricing = require('../../models/TicketPricing');
const {
  getTicketPricing,
  updateTicketPricing,
  getAllTicketPricing
} = require('../../controllers/ticketPricingController');

describe('TicketPricing Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
      user: { id: 'admin123', role: 'admin' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  // =========================================
  // GET TICKET PRICING (PUBLIC)
  // =========================================
  describe('getTicketPricing', () => {
    /**
     * TC-TP-01: Lấy bảng giá thành công
     * Kỳ vọng: Trả về bảng giá active với 3 tabs
     */
    test('Nên trả về bảng giá vé active', async () => {
      // Arrange
      const mockPricing = {
        _id: 'pricing123',
        title: 'Giá Vé rạp NMN Cinema - Hà Nội',
        tabs: [
          { name: 'GIÁ VÉ 2D', slug: '2D-price', imageUrl: '/images/2d.png', sortOrder: 1 },
          { name: 'GIÁ VÉ 3D', slug: '3D-price', imageUrl: '/images/3d.png', sortOrder: 2 },
          { name: 'NGÀY LỄ', slug: 'holiday-price', imageUrl: '/images/holiday.png', sortOrder: 3 }
        ],
        notes: '<p>Ghi chú bảng giá</p>',
        status: 'active'
      };

      TicketPricing.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPricing)
      });

      // Act
      await getTicketPricing(mockReq, mockRes);

      // Assert
      expect(TicketPricing.findOne).toHaveBeenCalledWith({ status: 'active' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPricing
      });
    });

    /**
     * TC-TP-02: Chưa có bảng giá
     * Kỳ vọng: Trả về 404
     */
    test('Nên trả về 404 nếu chưa có bảng giá', async () => {
      // Arrange
      TicketPricing.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      // Act
      await getTicketPricing(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Chưa có bảng giá vé'
      });
    });

    /**
     * TC-TP-03: Tabs được sắp xếp theo sortOrder
     * Kỳ vọng: Tab 2D (sortOrder=1) đứng trước 3D (sortOrder=2)
     */
    test('Nên sắp xếp tabs theo sortOrder', async () => {
      // Arrange - tabs không theo thứ tự
      const mockPricing = {
        _id: 'pricing123',
        title: 'Test',
        tabs: [
          { name: 'NGÀY LỄ', slug: 'holiday-price', imageUrl: '/images/holiday.png', sortOrder: 3 },
          { name: 'GIÁ VÉ 2D', slug: '2D-price', imageUrl: '/images/2d.png', sortOrder: 1 },
          { name: 'GIÁ VÉ 3D', slug: '3D-price', imageUrl: '/images/3d.png', sortOrder: 2 }
        ],
        notes: '',
        status: 'active'
      };

      TicketPricing.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPricing)
      });

      // Act
      await getTicketPricing(mockReq, mockRes);

      // Assert - tabs đã được sort
      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.tabs[0].name).toBe('GIÁ VÉ 2D');
      expect(response.data.tabs[1].name).toBe('GIÁ VÉ 3D');
      expect(response.data.tabs[2].name).toBe('NGÀY LỄ');
    });
  });

  // =========================================
  // UPDATE TICKET PRICING (ADMIN)
  // =========================================
  describe('updateTicketPricing', () => {
    /**
     * TC-TP-04: Admin cập nhật bảng giá thành công
     * Kỳ vọng: Bảng giá được cập nhật
     */
    test('Nên cập nhật bảng giá thành công', async () => {
      // Arrange
      mockReq.body = {
        title: 'Giá Vé rạp NMN Cinema - Hà Nội (Cập nhật)',
        tabs: [
          { name: 'GIÁ VÉ 2D', slug: '2D-price', imageUrl: '/images/2d-new.png', sortOrder: 1 }
        ],
        notes: 'Ghi chú mới'
      };

      const existingPricing = {
        _id: 'pricing123',
        title: 'Old Title',
        tabs: [],
        notes: '',
        status: 'active',
        save: jest.fn().mockResolvedValue(true)
      };

      TicketPricing.findOne = jest.fn().mockResolvedValue(existingPricing);

      // Act
      await updateTicketPricing(mockReq, mockRes);

      // Assert
      expect(existingPricing.save).toHaveBeenCalled();
      expect(existingPricing.title).toBe('Giá Vé rạp NMN Cinema - Hà Nội (Cập nhật)');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    /**
     * TC-TP-05: Tạo mới nếu chưa có bảng giá
     * Kỳ vọng: Bảng giá mới được tạo
     */
    test('Nên tạo mới bảng giá nếu chưa có', async () => {
      // Arrange
      mockReq.body = {
        title: 'Bảng giá mới',
        tabs: [
          { name: 'GIÁ VÉ 2D', slug: '2D-price', imageUrl: '/images/2d.png', sortOrder: 1 }
        ]
      };

      TicketPricing.findOne = jest.fn().mockResolvedValue(null);
      TicketPricing.create = jest.fn().mockResolvedValue({
        _id: 'newPricing123',
        title: 'Bảng giá mới',
        tabs: mockReq.body.tabs,
        status: 'active'
      });

      // Act
      await updateTicketPricing(mockReq, mockRes);

      // Assert
      expect(TicketPricing.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    /**
     * TC-TP-06: Từ chối nếu tabs rỗng
     * Kỳ vọng: Trả về 400 Bad Request
     */
    test('Nên từ chối nếu tabs rỗng', async () => {
      // Arrange
      mockReq.body = {
        title: 'Test',
        tabs: [] // Rỗng
      };

      // Act
      await updateTicketPricing(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Phải có ít nhất 1 tab giá'
      });
    });

    /**
     * TC-TP-07: Từ chối nếu không có tabs
     * Kỳ vọng: Trả về 400 Bad Request
     */
    test('Nên từ chối nếu không có field tabs', async () => {
      // Arrange
      mockReq.body = {
        title: 'Test'
        // Không có tabs
      };

      // Act
      await updateTicketPricing(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // =========================================
  // GET ALL TICKET PRICING (ADMIN)
  // =========================================
  describe('getAllTicketPricing', () => {
    /**
     * TC-TP-08: Admin lấy tất cả bảng giá
     * Kỳ vọng: Trả về danh sách bảng giá
     */
    test('Nên trả về tất cả bảng giá', async () => {
      // Arrange
      const mockPricings = [
        { _id: 'p1', title: 'Bảng giá 1', status: 'active' },
        { _id: 'p2', title: 'Bảng giá 2', status: 'draft' }
      ];

      TicketPricing.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPricings)
      });

      // Act
      await getAllTicketPricing(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPricings
      });
    });
  });

  // =========================================
  // VALIDATION
  // =========================================
  describe('Validation', () => {
    /**
     * TC-TP-09: Tab phải có đủ required fields
     */
    test('Tab phải có name, slug, imageUrl', () => {
      // Arrange
      const validTab = {
        name: 'GIÁ VÉ 2D',
        slug: '2D-price',
        imageUrl: '/images/2d.png',
        sortOrder: 1
      };

      // Assert
      expect(validTab.name).toBeDefined();
      expect(validTab.slug).toBeDefined();
      expect(validTab.imageUrl).toBeDefined();
    });

    /**
     * TC-TP-10: Slug phải có format hợp lệ
     */
    test('Slug nên có format hợp lệ (letters, numbers, hyphen)', () => {
      // Arrange
      const slugs = ['2D-price', '3D-price', 'holiday-price'];
      const slugPattern = /^[a-zA-Z0-9-]+$/;

      // Assert
      slugs.forEach(slug => {
        expect(slug).toMatch(slugPattern);
      });
    });
  });
});
