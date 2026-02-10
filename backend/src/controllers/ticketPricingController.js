const TicketPricing = require('../models/TicketPricing');

/**
 * Controller: TicketPricing (Bảng giá vé)
 *
 * Quản lý CRUD bảng giá vé hiển thị trên trang /gia-ve.
 *
 * Endpoints:
 * - GET  /api/v1/ticket-pricing           → Lấy bảng giá active (Public)
 * - PUT  /api/v1/ticket-pricing           → Cập nhật/tạo mới bảng giá (Admin)
 * - GET  /api/v1/ticket-pricing/admin/all → Lấy tất cả bảng giá (Admin)
 */

/**
 * [PUBLIC] Lấy bảng giá vé đang active
 * - Sử dụng .lean() để trả về plain JS object (hiệu suất tốt hơn)
 * - Tabs được sắp xếp theo sortOrder tăng dần
 *
 * @route   GET /api/v1/ticket-pricing
 * @access  Public
 */
const getTicketPricing = async (req, res) => {
  try {
    // Tìm bảng giá đang active, dùng .lean() để tối ưu hiệu suất
    const pricing = await TicketPricing.findOne({ status: 'active' }).lean();

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Chưa có bảng giá vé'
      });
    }

    // Sắp xếp tabs theo sortOrder (an toàn vì .lean() trả về plain object)
    pricing.tabs = [...pricing.tabs].sort((a, b) => a.sortOrder - b.sortOrder);

    res.status(200).json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('[TicketPricing] Lỗi khi lấy bảng giá vé:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bảng giá vé'
    });
  }
};

/**
 * [ADMIN] Cập nhật hoặc tạo mới bảng giá vé
 * - Nếu đã có bảng giá active → cập nhật nó
 * - Nếu chưa có → tạo mới với status = "active"
 *
 * @route   PUT /api/v1/ticket-pricing
 * @access  Admin (protect + restrictTo('admin'))
 * @body    { title, tabs[], notes, status }
 */
const updateTicketPricing = async (req, res) => {
  try {
    const { title, tabs, notes, status } = req.body;

    // Validate: tabs phải là mảng và có ít nhất 1 phần tử
    if (!tabs || !Array.isArray(tabs) || tabs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Phải có ít nhất 1 tab giá'
      });
    }

    // Tìm bảng giá active hiện tại
    let pricing = await TicketPricing.findOne({ status: 'active' });

    if (pricing) {
      // Cập nhật bảng giá hiện tại
      pricing.title = title || pricing.title;
      pricing.tabs = tabs;
      pricing.notes = notes !== undefined ? notes : pricing.notes;
      pricing.status = status || 'active';
      await pricing.save();
    } else {
      // Tạo mới bảng giá (chưa có bảng giá nào active)
      pricing = await TicketPricing.create({
        title: title || 'Giá Vé rạp NMN Cinema - Hà Nội',
        tabs,
        notes: notes || '',
        status: status || 'active'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật bảng giá vé thành công',
      data: pricing
    });
  } catch (error) {
    console.error('[TicketPricing] Lỗi khi cập nhật bảng giá vé:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật bảng giá vé'
    });
  }
};

/**
 * [ADMIN] Lấy tất cả bảng giá (bao gồm cả draft)
 * - Sắp xếp theo ngày tạo mới nhất
 *
 * @route   GET /api/v1/ticket-pricing/admin/all
 * @access  Admin (protect + restrictTo('admin'))
 */
const getAllTicketPricing = async (req, res) => {
  try {
    const pricings = await TicketPricing.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: pricings
    });
  } catch (error) {
    console.error('[TicketPricing] Lỗi khi lấy danh sách bảng giá:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách bảng giá'
    });
  }
};

module.exports = {
  getTicketPricing,
  updateTicketPricing,
  getAllTicketPricing
};
