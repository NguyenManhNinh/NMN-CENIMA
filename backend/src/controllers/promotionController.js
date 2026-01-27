const Promotion = require('../models/Promotion');
const PromotionRedeem = require('../models/PromotionRedeem');
// const Voucher = require('../models/Voucher'); // Không sử dụng - đã comment
const UserVoucher = require('../models/UserVoucher');

// PUBLIC APIs
/**
 * GET /api/v1/promotions
 * Lấy danh sách promotions (public, chỉ ACTIVE)
 */
const getPromotions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      keyword,
      applyMode,
      type,
      sort = 'newest',
      displayPosition,  // NEW: LIST | BOTTOM_BANNER
      featuredOnly      // NEW: true để lọc isFeatured
    } = req.query;

    const now = new Date();

    // Build query
    const query = {
      status: 'ACTIVE',
      publishAt: { $lte: now },
      startAt: { $lte: now },
      endAt: { $gte: now }
    };

    // Filter by keyword
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { excerpt: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filter by applyMode
    if (applyMode) {
      query.applyMode = applyMode;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by displayPosition (LIST, BOTTOM_BANNER)
    if (displayPosition) {
      query.displayPosition = displayPosition;
    }

    // Filter by isFeatured
    if (featuredOnly === 'true') {
      query.isFeatured = true;
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'featured') {
      sortOption = { isFeatured: -1, priority: -1, createdAt: -1 };
    } else if (sort === 'ending') {
      sortOption = { endAt: 1 };
    } else if (sort === 'banner') {
      // Sort cho bottom banner theo thứ tự bannerOrder
      sortOption = { bannerOrder: 1, priority: -1, createdAt: -1 };
    }

    // Execute query
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [promotions, total] = await Promise.all([
      Promotion.find(query)
        .select('-content -metaTitle -metaDescription')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Promotion.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: promotions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('getPromotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách ưu đãi'
    });
  }
};

/**
 * GET /api/v1/promotions/:slug
 * Lấy chi tiết promotion + claimState
 */
const getPromotionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?._id; // Có thể null nếu chưa đăng nhập

    const promotion = await Promotion.findOne({ slug })
      .populate('voucherId', 'code type value maxDiscount validFrom validTo')
      .lean();

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ưu đãi'
      });
    }

    // Tăng view count
    await Promotion.findByIdAndUpdate(promotion._id, { $inc: { viewCount: 1 } });

    // Tính toán claimState
    const now = new Date();
    let claimState = 'ELIGIBLE';
    let userVoucher = null;
    let redeemToken = null;

    // Check thời gian
    if (promotion.status !== 'ACTIVE') {
      claimState = 'INACTIVE';
    } else if (now < promotion.startAt) {
      claimState = 'NOT_STARTED';
    } else if (now > promotion.endAt) {
      claimState = 'EXPIRED';
    } else if (!userId) {
      claimState = 'NOT_LOGGED_IN';
    } else {
      // Check đã claim chưa (tùy applyMode)
      if (promotion.applyMode === 'ONLINE_VOUCHER' && promotion.voucherId) {
        userVoucher = await UserVoucher.findOne({
          userId,
          voucherId: promotion.voucherId._id,
          status: 'ACTIVE'
        }).lean();

        if (userVoucher) {
          claimState = 'ALREADY_CLAIMED';
        }
      } else if (promotion.applyMode === 'OFFLINE_ONLY') {
        redeemToken = await PromotionRedeem.findOne({
          promotionId: promotion._id,
          userId,
          status: 'ISSUED'
        }).lean();

        if (redeemToken) {
          claimState = 'ALREADY_CLAIMED';
        }
      }
    }

    res.json({
      success: true,
      data: {
        ...promotion,
        claimState,
        canClaim: claimState === 'ELIGIBLE',
        userVoucher: userVoucher ? {
          quantity: userVoucher.quantity,
          usedCount: userVoucher.usedCount,
          expiresAt: userVoucher.expiresAt
        } : null,
        redeemToken: redeemToken ? {
          token: redeemToken.token,
          expiresAt: redeemToken.expiresAt,
          status: redeemToken.status
        } : null
      }
    });
  } catch (error) {
    console.error('getPromotionBySlug error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết ưu đãi'
    });
  }
};

/**
 * POST /api/v1/promotions/:id/claim
 * Nhận voucher (ONLINE_VOUCHER) - Tạo UserVoucher
 */
const claimPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Lấy promotion
    const promotion = await Promotion.findById(id).populate('voucherId');

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ưu đãi'
      });
    }

    // Validate
    const now = new Date();

    if (promotion.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Ưu đãi không còn hoạt động'
      });
    }

    if (now < promotion.startAt || now > promotion.endAt) {
      return res.status(400).json({
        success: false,
        message: 'Ưu đãi đã hết hạn hoặc chưa bắt đầu'
      });
    }

    if (promotion.applyMode !== 'ONLINE_VOUCHER') {
      return res.status(400).json({
        success: false,
        message: 'Ưu đãi này không hỗ trợ nhận mã online'
      });
    }

    if (!promotion.voucherId) {
      return res.status(400).json({
        success: false,
        message: 'Ưu đãi chưa được liên kết với mã giảm giá'
      });
    }

    // Check rank constraint (nếu có)
    if (promotion.allowedUserRanks && promotion.allowedUserRanks.length > 0) {
      const user = req.user;
      if (!promotion.allowedUserRanks.includes(user.rank || 'MEMBER')) {
        return res.status(403).json({
          success: false,
          message: 'Ưu đãi chỉ dành cho hạng thành viên: ' + promotion.allowedUserRanks.join(', ')
        });
      }
    }

    // Check IDEMPOTENT: đã claim chưa?
    const existingVoucher = await UserVoucher.findOne({
      userId,
      voucherId: promotion.voucherId._id,
      status: 'ACTIVE'
    });

    if (existingVoucher) {
      return res.status(200).json({
        success: true,
        message: 'Bạn đã nhận ưu đãi này rồi',
        alreadyClaimed: true,
        userVoucher: {
          _id: existingVoucher._id,
          voucherCode: promotion.voucherId.code,
          quantity: existingVoucher.quantity,
          usedCount: existingVoucher.usedCount,
          expiresAt: existingVoucher.expiresAt
        }
      });
    }

    // Tạo UserVoucher
    const userVoucher = await UserVoucher.create({
      userId,
      voucherId: promotion.voucherId._id,
      quantity: promotion.quantityPerUser,
      usedCount: 0,
      status: 'ACTIVE',
      expiresAt: promotion.endAt, // Hết hạn theo promotion
      source: 'PROMOTION',
      sourceId: promotion._id
    });

    // Tăng claimCount
    await Promotion.findByIdAndUpdate(id, { $inc: { claimCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Nhận ưu đãi thành công!',
      alreadyClaimed: false,
      userVoucher: {
        _id: userVoucher._id,
        voucherCode: promotion.voucherId.code,
        quantity: userVoucher.quantity,
        usedCount: userVoucher.usedCount,
        expiresAt: userVoucher.expiresAt
      }
    });
  } catch (error) {
    console.error('claimPromotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi nhận ưu đãi'
    });
  }
};

/**
 * POST /api/v1/promotions/:id/offline-claim
 * Lấy token/QR để dùng tại quầy (OFFLINE_ONLY)
 */
const offlineClaimPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Lấy promotion
    const promotion = await Promotion.findById(id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ưu đãi'
      });
    }

    // Validate
    const now = new Date();

    if (promotion.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Ưu đãi không còn hoạt động'
      });
    }

    if (now < promotion.startAt || now > promotion.endAt) {
      return res.status(400).json({
        success: false,
        message: 'Ưu đãi đã hết hạn hoặc chưa bắt đầu'
      });
    }

    if (promotion.applyMode !== 'OFFLINE_ONLY') {
      return res.status(400).json({
        success: false,
        message: 'Ưu đãi này không hỗ trợ nhận mã tại quầy'
      });
    }

    // Check IDEMPOTENT: đã claim chưa?
    const existingRedeem = await PromotionRedeem.findOne({
      promotionId: promotion._id,
      userId,
      status: 'ISSUED'
    });

    if (existingRedeem) {
      return res.status(200).json({
        success: true,
        message: 'Bạn đã lấy mã rồi',
        alreadyClaimed: true,
        redeem: {
          token: existingRedeem.token,
          qrData: existingRedeem.qrData,
          expiresAt: existingRedeem.expiresAt,
          status: existingRedeem.status
        }
      });
    }

    // Tạo token mới
    const token = PromotionRedeem.generateToken();
    const qrData = PromotionRedeem.generateQRData(token, promotion._id);

    const redeem = await PromotionRedeem.create({
      promotionId: promotion._id,
      userId,
      token,
      qrData,
      status: 'ISSUED',
      issuedAt: now,
      expiresAt: promotion.endAt
    });

    // Tăng claimCount
    await Promotion.findByIdAndUpdate(id, { $inc: { claimCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Lấy mã thành công! Vui lòng đưa mã này cho nhân viên tại quầy.',
      alreadyClaimed: false,
      redeem: {
        token: redeem.token,
        qrData: redeem.qrData,
        expiresAt: redeem.expiresAt,
        status: redeem.status
      }
    });
  } catch (error) {
    console.error('offlineClaimPromotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy mã'
    });
  }
};

// STAFF APIs
/**
 * POST /api/v1/staff/promotions/redeem
 * Staff quét token để redeem
 */
const staffRedeemPromotion = async (req, res) => {
  try {
    const { token } = req.body;
    const staffId = req.user._id;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã token'
      });
    }

    // Tìm và update atomic
    const redeem = await PromotionRedeem.findOneAndUpdate(
      {
        token: token.toUpperCase(),
        status: 'ISSUED',
        expiresAt: { $gte: new Date() }
      },
      {
        $set: {
          status: 'REDEEMED',
          redeemedAt: new Date(),
          redeemedByStaffId: staffId
        }
      },
      { new: true }
    ).populate('promotionId', 'title');

    if (!redeem) {
      // Check xem token có tồn tại không
      const existingRedeem = await PromotionRedeem.findOne({ token: token.toUpperCase() });

      if (!existingRedeem) {
        return res.status(404).json({
          success: false,
          message: 'Mã không tồn tại'
        });
      }

      if (existingRedeem.status === 'REDEEMED') {
        return res.status(400).json({
          success: false,
          message: 'Mã đã được sử dụng trước đó',
          redeemedAt: existingRedeem.redeemedAt
        });
      }

      if (existingRedeem.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Mã đã hết hạn'
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Mã không hợp lệ'
      });
    }

    res.json({
      success: true,
      message: 'Xác nhận ưu đãi thành công!',
      redeem: {
        token: redeem.token,
        promotionTitle: redeem.promotionId?.title,
        redeemedAt: redeem.redeemedAt
      }
    });
  } catch (error) {
    console.error('staffRedeemPromotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác nhận mã'
    });
  }
};
// ADMIN APIs (CRUD)
/**
 * POST /api/v1/admin/promotions
 * Tạo promotion mới
 */
const createPromotion = async (req, res) => {
  try {
    const promotionData = req.body;

    const promotion = await Promotion.create(promotionData);

    res.status(201).json({
      success: true,
      message: 'Tạo ưu đãi thành công',
      data: promotion
    });
  } catch (error) {
    console.error('createPromotion error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Slug đã tồn tại, vui lòng đổi tiêu đề'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo ưu đãi'
    });
  }
};

/**
 * PATCH /api/v1/admin/promotions/:id
 * Cập nhật promotion
 */
const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ưu đãi'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật ưu đãi thành công',
      data: promotion
    });
  } catch (error) {
    console.error('updatePromotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật ưu đãi'
    });
  }
};

/**
 * DELETE /api/v1/admin/promotions/:id
 * Xóa promotion (soft delete - chuyển INACTIVE)
 */
const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { status: 'INACTIVE' },
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ưu đãi'
      });
    }

    res.json({
      success: true,
      message: 'Xóa ưu đãi thành công'
    });
  } catch (error) {
    console.error('deletePromotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa ưu đãi'
    });
  }
};

/**
 * GET /api/v1/admin/promotions
 * Lấy tất cả promotions (bao gồm DRAFT, INACTIVE)
 */
const getAllPromotionsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, keyword } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { slug: { $regex: keyword, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [promotions, total] = await Promise.all([
      Promotion.find(query)
        .populate('voucherId', 'code type value')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Promotion.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: promotions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('getAllPromotionsAdmin error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};
/**
 * GET /api/v1/promotions/home
 * Endpoint tổng hợp: trả cả danh sách LIST + BOTTOM_BANNER trong 1 request
 * FE chỉ cần gọi 1 lần, atomic response
 */
const getPromotionsHome = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      keyword,
      applyMode,
      type,
      sort = 'newest',
      bannerLimit = 2 // Số lượng banner tối đa
    } = req.query;

    const now = new Date();

    // Base query cho promotions đang active
    const baseQuery = {
      status: 'ACTIVE',
      publishAt: { $lte: now },
      startAt: { $lte: now },
      endAt: { $gte: now }
    };

    // ========== QUERY 1: Danh sách LIST (paginate) ==========
    const listQuery = { ...baseQuery, displayPosition: 'LIST' };

    // Filter by keyword
    if (keyword) {
      listQuery.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { excerpt: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filter by applyMode
    if (applyMode) {
      listQuery.applyMode = applyMode;
    }

    // Filter by type
    if (type) {
      listQuery.type = type;
    }

    // Sort options cho LIST
    let sortOption = { createdAt: -1 };
    if (sort === 'featured') {
      sortOption = { isFeatured: -1, priority: -1, createdAt: -1 };
    } else if (sort === 'ending') {
      sortOption = { endAt: 1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ========== QUERY 2: Banners BOTTOM_BANNER (limit, sort bannerOrder) ==========
    const bannerQuery = { ...baseQuery, displayPosition: 'BOTTOM_BANNER' };
    const bannerSortOption = { bannerOrder: 1, priority: -1, createdAt: -1 };

    // Execute cả 3 queries song song
    const [promotions, total, banners] = await Promise.all([
      Promotion.find(listQuery)
        .select('title slug thumbnailUrl coverUrl startAt endAt isFeatured priority createdAt')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Promotion.countDocuments(listQuery),
      Promotion.find(bannerQuery)
        .select('title slug thumbnailUrl coverUrl bannerOrder priority createdAt')
        .sort(bannerSortOption)
        .limit(parseInt(bannerLimit))
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        promotions,
        banners
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('getPromotionsHome error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy trang ưu đãi'
    });
  }
};

module.exports = {
  // Public
  getPromotions,
  getPromotionsHome, // NEW
  getPromotionBySlug,
  claimPromotion,
  offlineClaimPromotion,
  // Staff
  staffRedeemPromotion,
  // Admin
  createPromotion,
  updatePromotion,
  deletePromotion,
  getAllPromotionsAdmin
};
