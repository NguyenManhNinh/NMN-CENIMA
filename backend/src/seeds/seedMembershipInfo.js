/**
 * Seed: Membership Info
 * Tạo dữ liệu mẫu cho trang thông tin thành viên
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const MembershipInfo = require('../models/MembershipInfo');

const MONGO_URI = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27018/datn-cinema';

const seedMembershipInfo = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await MembershipInfo.deleteMany({});
    console.log('🗑️  Cleared old membership info data');

    const membershipData = {
      title: 'Chương trình Thành viên NMN Cinema Membership | Tích điểm và đổi thưởng',
      sections: [
        {
          title: 'Thể lệ và quy định về Chương trình Thành viên NMN Cinema',
          slug: 'the-le',
          imageUrl: '',
          content: `
<h3>1. Cách đăng ký để trở thành khách hàng thành viên NMN Cinema</h3>
<ul>
  <li><strong>Nơi đăng ký bắt buộc:</strong> Quầy vé NMN Cinema (<strong style="color: #000000; font-weight: 700">LÀM THẺ HOÀN TOÀN MIỄN PHÍ</strong>)</li>
  <li><strong>Thông tin đăng ký cần có:</strong> Họ và tên, Số điện thoại, Số CCCD, Ngày sinh</li>
  <li>1 SĐT/CCCD chỉ đăng ký được duy nhất <strong>1 tài khoản/1 thẻ thành viên</strong> với 1 mã số duy nhất</li>
  <li>Tài khoản được quyền sử dụng ngay sau khi đăng ký</li>
  <li>Trong trường hợp mất thẻ thành viên, cần mang CCCD đến quầy để làm lại thẻ</li>
</ul>

<h3>Để kích hoạt thành viên online và mua vé với giá ưu đãi:</h3>
<ul>
  <li>Tài khoản online đăng ký <strong>số điện thoại trùng</strong> với số điện thoại đã đăng ký THẺ THÀNH VIÊN (trùng cả đầu số)</li>
  <li>Số điện thoại của tài khoản online phải được <strong>xác thực</strong> trong mục TÀI KHOẢN online</li>
</ul>

<h3>2. Các hạng thành viên</h3>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: center;">
  <thead>
    <tr style="background-color: #1A1A2E; color: #FFD700;">
      <th>Hạng</th>
      <th>Điều kiện</th>
      <th>Quyền lợi</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>MEMBER</strong></td>
      <td>Đăng ký miễn phí</td>
      <td>Tích 1 điểm / 1.000đ chi tiêu</td>
    </tr>
    <tr style="background-color: #FFF8E1;">
      <td><strong>VIP</strong><br>(từ 1.000 điểm)</td>
      <td>Tích lũy ≥ 1.000 điểm</td>
      <td>Giảm 5% giá vé, quà sinh nhật, ưu đãi sự kiện</td>
    </tr>
    <tr style="background-color: #FCE4EC;">
      <td><strong>VVIP</strong><br>(từ 5.000 điểm)</td>
      <td>Tích lũy ≥ 5.000 điểm</td>
      <td>Giảm 10% giá vé, suất chiếu sớm, quà sinh nhật đặc biệt, ưu tiên ghế VIP</td>
    </tr>
  </tbody>
</table>
          `.trim(),
          sortOrder: 1
        },
        {
          title: 'Hướng dẫn thể lệ tích điểm',
          slug: 'tich-diem',
          imageUrl: 'https://touchcinema.com/storage/slider-tv/z4045880677164-1ba77b4619d45e773581092b6319ac62.jpg',
          content: `
<h3>Quy tắc tích điểm</h3>
<ul>
  <li>Mỗi <strong>1.000đ</strong> chi tiêu mua vé hoặc combo = <strong>1 điểm</strong> thưởng</li>
  <li>Điểm được cộng <strong>tự động</strong> sau khi thanh toán thành công (qua VNPay hoặc tại quầy)</li>
  <li>Điểm chỉ áp dụng cho giao dịch <strong>mua vé xem phim</strong> và <strong>combo đồ ăn/nước uống</strong></li>
  <li>Điểm <strong>không áp dụng</strong> cho: phí tiện ích, phụ thu 3D/IMAX đã giảm giá</li>
  <li>Điểm tích lũy <strong>không có thời hạn</strong> (không bị reset hàng năm)</li>
</ul>

<h3>Ví dụ tính điểm</h3>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: center;">
  <thead>
    <tr style="background-color: #1A1A2E; color: #FFD700;">
      <th>Giao dịch</th>
      <th>Số tiền</th>
      <th>Điểm nhận được</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Vé 2D thường</td><td>60.000đ</td><td>60 điểm</td></tr>
    <tr><td>Vé 3D + Combo bắp nước</td><td>150.000đ</td><td>150 điểm</td></tr>
    <tr><td>2 vé + Combo đôi</td><td>280.000đ</td><td>280 điểm</td></tr>
  </tbody>
</table>
          `.trim(),
          sortOrder: 2
        },
        {
          title: 'Quà sinh nhật thành viên',
          slug: 'qua-sinh-nhat',
          imageUrl: '',
          content: `
<h3>Ưu đãi sinh nhật dành cho thành viên</h3>
<ul>
  <li>Thành viên <strong>VIP</strong>: Tặng <strong>1 vé xem phim 2D miễn phí</strong> trong tháng sinh nhật</li>
  <li>Thành viên <strong>VVIP</strong>: Tặng <strong>1 combo (vé + bắp nước)</strong> trong tháng sinh nhật</li>
  <li>Ưu đãi sinh nhật được kích hoạt <strong>tự động</strong> vào ngày 1 của tháng sinh nhật</li>
  <li>Quà sinh nhật có giá trị sử dụng trong <strong>30 ngày</strong> kể từ ngày kích hoạt</li>
  <li>Mỗi thành viên chỉ nhận <strong>1 lần/năm</strong>, không cộng dồn</li>
</ul>

<h3>Cách nhận quà sinh nhật</h3>
<ol>
  <li>Đảm bảo thông tin <strong>ngày sinh</strong> đã cập nhật chính xác trên tài khoản</li>
  <li>Voucher sinh nhật sẽ xuất hiện trong mục <strong>"Voucher của tôi"</strong> trên tài khoản online</li>
  <li>Hoặc thông báo tại quầy khi mua vé trong tháng sinh nhật</li>
</ol>
          `.trim(),
          sortOrder: 3
        },
        {
          title: 'Điều kiện sử dụng điểm',
          slug: 'su-dung-diem',
          imageUrl: 'https://touchcinema.com/storage/slider-app/z4986572984860-008d90891c78bc2a0b13b8acd84f9e88.jpg',
          content: `
<h3>Quy đổi điểm thưởng</h3>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: center;">
  <thead>
    <tr style="background-color: #1A1A2E; color: #FFD700;">
      <th>Điểm</th>
      <th>Phần thưởng</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>500 điểm</td><td>1 nước ngọt size M</td></tr>
    <tr><td>700 điểm</td><td>1 bắp rang bơ size L</td></tr>
    <tr><td>1.000 điểm</td><td>1 combo bắp + nước</td></tr>
    <tr><td>1.200 điểm</td><td>1 vé xem phim 2D</td></tr>
    <tr><td>1.500 điểm</td><td>1 vé xem phim 3D</td></tr>
  </tbody>
</table>

<h3>Điều kiện áp dụng</h3>
<ul>
  <li>Đổi quà/đổi voucher <strong>chỉ thực hiện tại quầy vé</strong> (nhân viên thao tác)</li>
  <li>Điểm sẽ bị <strong>trừ ngay</strong> sau khi đổi thưởng thành công</li>
  <li>Quà đổi <strong>không hoàn lại</strong> và <strong>không quy đổi thành tiền mặt</strong></li>
  <li>Mỗi lần đổi quà cần xuất trình <strong>thẻ thành viên</strong> hoặc <strong>xác nhận SĐT</strong></li>
  <li>Không áp dụng đồng thời với các chương trình khuyến mãi khác (trừ khi có ghi chú riêng)</li>
</ul>

<h3>Quy trình tại quầy</h3>
<ol>
  <li>Nhân viên <strong>quét thẻ/nhập SĐT</strong> để tra cứu thành viên</li>
  <li>Tích điểm sau khi khách <strong>mua vé/đồ ăn</strong></li>
  <li>Đổi quà/đổi voucher và <strong>trừ điểm</strong> tương ứng</li>
  <li>Xử lý trường hợp đặc biệt: <strong>sinh nhật, ưu đãi VIP, điều chỉnh điểm</strong> (admin/quản lý)</li>
</ol>
          `.trim(),
          sortOrder: 4
        }
      ],
      status: 'active'
    };

    const info = await MembershipInfo.create(membershipData);
    console.log('✅ Created membership info:', info.title);
    console.log('   Sections:', info.sections.map(s => s.title).join(', '));

    await mongoose.disconnect();
    console.log('✅ Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedMembershipInfo();
