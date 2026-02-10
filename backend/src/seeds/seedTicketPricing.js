/**
 * Seed: Ticket Pricing
 * Tạo dữ liệu mẫu cho bảng giá vé
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const TicketPricing = require('../models/TicketPricing');

const MONGO_URI = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27018/datn-cinema';

const seedTicketPricing = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ
    await TicketPricing.deleteMany({});
    console.log('🗑️  Cleared old ticket pricing data');

    // Tạo bảng giá mẫu
    const pricingData = {
      title: 'Giá Vé rạp NMN Cinema - Hà Nội',
      tabs: [
        {
          name: 'GIÁ VÉ 2D',
          slug: '2D-price',
          imageUrl: 'https://touchcinema.com/storage/slider-tv/z4045880677164-1ba77b4619d45e773581092b6319ac62.jpg',
          sortOrder: 1
        },
        {
          name: 'GIÁ VÉ 3D',
          slug: '3D-price',
          imageUrl: 'https://touchcinema.com/storage/slider-app/z4986572984860-008d90891c78bc2a0b13b8acd84f9e88.jpg',
          sortOrder: 2
        },
        {
          name: 'NGÀY LỄ',
          slug: 'holiday-price',
          imageUrl: 'https://touchcinema.com/storage/slider-tv/z4103264955341-3bb1395fb3108359cda4af45aee336f4-1724913363.jpg',
          sortOrder: 3
        }
      ],
      notes: `
<h3>GHI CHÚ:</h3>
<ul>
  <li>Bảng giá trên áp dụng cho khách hàng có thẻ thành viên, khách hàng không có thẻ thành viên phụ thu 10.000đ/vé đối với ghế thường, 20.000đ/vé đối với ghế đôi.</li>
  <li>Bảng giá trên áp dụng cho suất chiếu thông thường, suất chiếu sớm (suất chiếu đặc biệt, suất chiếu sneakshow) phụ thu 10.000đ/vé đối với ghế thường, 20.000đ/vé đối với ghế đôi.</li>
  <li>Giá vé khi đặt vé trực tuyến trên website và ứng dụng NMN Cinema là giá vé người lớn.</li>
  <li>Giá vé học sinh, sinh viên được áp dụng cho người từ 22 tuổi trở xuống khi mua vé tại quầy.</li>
  <li>Giá vé trẻ em, người cao tuổi, đối tượng ưu tiên áp dụng cho trẻ em, người từ 60 tuổi trở lên, người có công với cách mạng, người có hoàn cảnh đặc biệt khó khăn và các đối tượng khác theo quy định của pháp luật khi mua vé tại quầy.</li>
  <li>Người khuyết tật đặc biệt nặng được miễn giá vé, người khuyết tật nặng được giảm 50% giá vé khi mua vé tại quầy.</li>
</ul>
      `.trim(),
      status: 'active'
    };

    const pricing = await TicketPricing.create(pricingData);
    console.log('✅ Created ticket pricing:', pricing.title);
    console.log('   Tabs:', pricing.tabs.map(t => t.name).join(', '));

    await mongoose.disconnect();
    console.log('✅ Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedTicketPricing();
