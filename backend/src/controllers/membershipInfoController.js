const MembershipInfo = require('../models/MembershipInfo');
const sanitizeHtml = require('sanitize-html');

/**
 * Sanitize HTML content - chỉ cho phép semantic tags,
 * loại bỏ inline style/class để frontend wrapper style kiểm soát giao diện.
 */
const cleanHtml = (dirty) => {
  if (!dirty) return '';
  return sanitizeHtml(dirty, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 'span',
      'h2', 'h3', 'h4',
      'ul', 'ol', 'li',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'a'
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      span: ['style']
    },
    allowedStyles: {
      span: {
        'color': [/^#[0-9a-fA-F]{6}$/],
        'font-weight': [/^\d+$/]
      }
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' })
    },
    disallowedTagsMode: 'discard'
  });
};

/**
 * Controller: MembershipInfo (Thông tin thành viên)
 *
 * Quản lý nội dung trang thành viên hiển thị trên /thanh-vien.
 *
 * Endpoints:
 * - GET  /api/v1/membership-info           → Lấy trang thành viên active (Public)
 * - PUT  /api/v1/membership-info           → Cập nhật/tạo mới nội dung (Admin)
 * - GET  /api/v1/membership-info/admin/all → Lấy tất cả nội dung (Admin)
 */

/**
 * [PUBLIC] Lấy trang thành viên đang active
 * - Sử dụng .lean() để trả về plain JS object
 * - Sections được sắp xếp theo sortOrder tăng dần
 *
 * @route   GET /api/v1/membership-info
 * @access  Public
 */
const getMembershipInfo = async (req, res) => {
  try {
    const info = await MembershipInfo.findOne({ status: 'active' }).lean();

    if (!info) {
      return res.status(404).json({
        success: false,
        message: 'Chưa có thông tin thành viên'
      });
    }

    // Sắp xếp sections theo sortOrder
    info.sections = [...info.sections].sort((a, b) => a.sortOrder - b.sortOrder);

    res.status(200).json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('[MembershipInfo] Lỗi khi lấy thông tin thành viên:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin thành viên'
    });
  }
};

/**
 * [ADMIN] Cập nhật hoặc tạo mới trang thành viên
 * - Nếu đã có trang active → cập nhật nó
 * - Nếu chưa có → tạo mới với status = "active"
 *
 * @route   PUT /api/v1/membership-info
 * @access  Admin (protect + restrictTo('admin'))
 * @body    { title, sections[], status }
 */
const updateMembershipInfo = async (req, res) => {
  try {
    const { title, sections, status } = req.body;

    // Validate: sections phải là mảng và có ít nhất 1 phần tử
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Phải có ít nhất 1 section nội dung'
      });
    }

    // Sanitize HTML content của mỗi section trước khi lưu
    const sanitizedSections = sections.map(section => ({
      ...section,
      content: cleanHtml(section.content)
    }));

    // Tìm trang active hiện tại
    let info = await MembershipInfo.findOne({ status: 'active' });

    if (info) {
      // Cập nhật trang hiện tại
      info.title = title || info.title;
      info.sections = sanitizedSections;
      info.status = status || 'active';
      await info.save();
    } else {
      // Tạo mới (chưa có trang nào active)
      info = await MembershipInfo.create({
        title: title || 'Chương trình Thành viên NMN Cinema Membership | Tích điểm và đổi thưởng',
        sections: sanitizedSections,
        status: status || 'active'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành viên thành công',
      data: info
    });
  } catch (error) {
    console.error('[MembershipInfo] Lỗi khi cập nhật thông tin thành viên:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật thông tin thành viên'
    });
  }
};

/**
 * [ADMIN] Lấy tất cả trang thành viên (bao gồm draft)
 * - Sắp xếp theo ngày tạo mới nhất
 *
 * @route   GET /api/v1/membership-info/admin/all
 * @access  Admin (protect + restrictTo('admin'))
 */
const getAllMembershipInfo = async (req, res) => {
  try {
    const infos = await MembershipInfo.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: infos
    });
  } catch (error) {
    console.error('[MembershipInfo] Lỗi khi lấy danh sách:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách thông tin thành viên'
    });
  }
};

module.exports = {
  getMembershipInfo,
  updateMembershipInfo,
  getAllMembershipInfo
};
