const TicketPricing = require('../models/TicketPricing');

/**
 * Controller: TicketPricing
 * Quản lý bảng giá vé hiển thị
 */

/**
 * GET /api/v1/ticket-pricing
 * Lấy bảng giá vé đang active
 */
const getTicketPricing = async (req, res) => {
  try {
    const pricing = await TicketPricing.findOne({ status: 'active' })
      .sort({ createdAt: -1 });

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Chưa có bảng giá vé'
      });
    }

    // Sắp xếp tabs theo sortOrder
    pricing.tabs.sort((a, b) => a.sortOrder - b.sortOrder);

    res.status(200).json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Lỗi khi lấy bảng giá vé:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bảng giá vé'
    });
  }
};

/**
 * PUT /api/v1/ticket-pricing
 * Cập nhật hoặc tạo mới bảng giá vé (Admin)
 */
const updateTicketPricing = async (req, res) => {
  try {
    const { title, tabs, notes, status } = req.body;

    // Validate tabs
    if (!tabs || !Array.isArray(tabs) || tabs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Phải có ít nhất 1 tab giá'
      });
    }

    // Tìm bảng giá hiện tại hoặc tạo mới
    let pricing = await TicketPricing.findOne({ status: 'active' });

    if (pricing) {
      // Cập nhật
      pricing.title = title || pricing.title;
      pricing.tabs = tabs;
      pricing.notes = notes !== undefined ? notes : pricing.notes;
      pricing.status = status || 'active';
      await pricing.save();
    } else {
      // Tạo mới
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
    console.error('Lỗi khi cập nhật bảng giá vé:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật bảng giá vé'
    });
  }
};

/**
 * GET /api/v1/ticket-pricing/admin/all
 * Lấy tất cả bảng giá (Admin)
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
    console.error('Lỗi khi lấy danh sách bảng giá:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  getTicketPricing,
  updateTicketPricing,
  getAllTicketPricing
};
