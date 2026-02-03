/**
 * Seed Data cho Promotion
 * Chạy: node src/seeds/promotionSeeds.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');
const Voucher = require('../models/Voucher');

// Ưu tiên Docker local, fallback .env
const MONGO_URI = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27018/datn-cinema';

async function seedPromotions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Tìm hoặc tạo voucher để liên kết
    let voucher = await Voucher.findOne({ code: 'UUDAI2024' });

    if (!voucher) {
      voucher = await Voucher.create({
        code: 'UUDAI2024',
        type: 'PERCENT',
        value: 20,
        maxDiscount: 50000,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 ngày
        usageLimit: 1000,
        status: 'ACTIVE'
      });
      console.log('✅ Created voucher UUDAI2024');
    }

    // Xóa promotions cũ (nếu muốn reset)
    // await Promotion.deleteMany({});

    const promotions = [
      {
        title: 'Giảm 20% cho khách hàng mới',
        excerpt: 'Chương trình ưu đãi dành cho khách hàng lần đầu đặt vé tại NMN Cinema',
        content: `
          <h2>Ưu đãi đặc biệt cho khách hàng mới!</h2>
          <p>NMN Cinema tri ân khách hàng lần đầu sử dụng dịch vụ với mã giảm giá <strong>20%</strong> cho đơn hàng đầu tiên.</p>

          <h3>Điều kiện áp dụng:</h3>
          <ul>
            <li>Áp dụng cho khách hàng đăng ký tài khoản mới</li>
            <li>Giảm tối đa 50.000đ</li>
            <li>Áp dụng cho tất cả các suất chiếu</li>
            <li>Không áp dụng cùng ưu đãi khác</li>
          </ul>

          <h3>Cách sử dụng:</h3>
          <ol>
            <li>Nhấn "Nhận ưu đãi" bên dưới</li>
            <li>Mã sẽ tự động được lưu vào ví voucher của bạn</li>
            <li>Khi thanh toán, chọn mã từ ví voucher</li>
          </ol>
        `,
        thumbnailUrl: '/uploads/promotions/new-customer.jpg',
        coverUrl: '/uploads/promotions/new-customer-cover.jpg',
        status: 'ACTIVE',
        type: 'PROMOTION',
        isFeatured: true,
        priority: 100,
        publishAt: new Date(),
        startAt: new Date(),
        endAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        applyMode: 'ONLINE_VOUCHER',
        voucherId: voucher._id,
        quantityPerUser: 1,
        metaTitle: 'Giảm 20% cho khách hàng mới - NMN Cinema',
        metaDescription: 'Đăng ký ngay để nhận mã giảm giá 20% cho lần đặt vé đầu tiên tại NMN Cinema'
      },
      {
        title: 'Combo bắp nước giảm 30% vào thứ 4',
        excerpt: 'Thứ 4 vui vẻ - Mua combo bắp nước tại quầy được giảm 30%',
        content: `
          <h2>Thứ 4 Vui Vẻ tại NMN Cinema!</h2>
          <p>Đặc biệt vào mỗi thứ 4 hàng tuần, tất cả combo bắp nước sẽ được <strong>giảm 30%</strong>!</p>

          <h3>Điều kiện áp dụng:</h3>
          <ul>
            <li>Chỉ áp dụng tại quầy vào thứ 4</li>
            <li>Áp dụng cho tất cả các combo</li>
            <li>Mỗi khách hàng được sử dụng 1 lần/ngày</li>
          </ul>

          <h3>Cách sử dụng:</h3>
          <ol>
            <li>Nhấn "Lấy mã tại quầy" bên dưới</li>
            <li>Đưa mã QR cho nhân viên tại quầy</li>
            <li>Nhận combo với giá ưu đãi</li>
          </ol>
        `,
        thumbnailUrl: '/uploads/promotions/wednesday-combo.jpg',
        coverUrl: '/uploads/promotions/wednesday-combo-cover.jpg',
        status: 'ACTIVE',
        type: 'PROMOTION',
        isFeatured: false,
        priority: 50,
        publishAt: new Date(),
        startAt: new Date(),
        endAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        applyMode: 'OFFLINE_ONLY',
        metaTitle: 'Thứ 4 Vui Vẻ - Combo giảm 30% tại NMN Cinema',
        metaDescription: 'Mua combo bắp nước vào thứ 4 được giảm 30% tại quầy NMN Cinema'
      },
      {
        title: 'Ưu đãi thành viên VIP - Mua 1 tặng 1',
        excerpt: 'Dành riêng cho thành viên VIP và VVIP - Mua 1 vé được tặng 1 vé miễn phí',
        content: `
          <h2>Đặc quyền VIP - Mua 1 Tặng 1!</h2>
          <p>NMN Cinema tri ân khách hàng thân thiết với ưu đãi <strong>Mua 1 Tặng 1</strong> dành riêng cho thành viên VIP và VVIP.</p>

          <h3>Điều kiện áp dụng:</h3>
          <ul>
            <li>Chỉ áp dụng cho thành viên VIP/VVIP</li>
            <li>Vé tặng có giá trị bằng hoặc thấp hơn vé mua</li>
            <li>Áp dụng từ thứ 2 đến thứ 5 (trừ lễ tết)</li>
            <li>Mỗi thành viên sử dụng tối đa 2 lần/tháng</li>
          </ul>
        `,
        thumbnailUrl: '/uploads/promotions/vip-buy1get1.jpg',
        coverUrl: '/uploads/promotions/vip-buy1get1-cover.jpg',
        status: 'ACTIVE',
        type: 'PROMOTION',
        isFeatured: true,
        priority: 90,
        publishAt: new Date(),
        startAt: new Date(),
        endAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        applyMode: 'OFFLINE_ONLY',
        allowedUserRanks: ['VIP', 'VVIP'],
        metaTitle: 'VIP Mua 1 Tặng 1 - NMN Cinema',
        metaDescription: 'Đặc quyền thành viên VIP tại NMN Cinema - Mua 1 vé tặng 1 vé miễn phí'
      }
    ];

    // Upsert (tạo mới hoặc skip nếu slug đã tồn tại)
    for (const promo of promotions) {
      const existing = await Promotion.findOne({ title: promo.title });
      if (!existing) {
        await Promotion.create(promo);
        console.log(`✅ Created: ${promo.title}`);
      } else {
        console.log(`⏭️ Skipped (exists): ${promo.title}`);
      }
    }

    console.log('\n🎉 Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedPromotions();
