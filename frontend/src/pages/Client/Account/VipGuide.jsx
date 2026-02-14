import { useState, useEffect } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { MonetizationOn as CoinIcon } from '@mui/icons-material';
import { getMyLoyaltyAPI } from '../../../apis/loyaltyApi';
import { useAuth } from '../../../contexts/AuthContext';

const font = '"Nunito Sans", sans-serif';
const VIP_THRESHOLD = 3500;
const DIAMOND_THRESHOLD = 8000;

const textSx = { fontSize: '0.82rem', color: '#555', fontFamily: font, lineHeight: 1.9 };
const headingSx = { fontSize: '0.92rem', fontWeight: 700, color: '#333', fontFamily: font, mb: 1, mt: 3 };
const subHeadingSx = { fontSize: '0.85rem', fontWeight: 700, color: '#ea3b92', fontFamily: font, mb: 0.5, mt: 2 };

export default function VipGuide() {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        const res = await getMyLoyaltyAPI();
        setLoyaltyData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLoyalty();
  }, []);

  const currentRank = loyaltyData?.rank || 'MEMBER';
  const currentPoints = loyaltyData?.points ?? 0;
  const totalSpend = currentPoints * 1000;
  const rankLabel = { MEMBER: 'Normal', VIP: 'VIP', DIAMOND: 'Diamond' };

  const nextThreshold = currentRank === 'MEMBER' ? VIP_THRESHOLD : currentRank === 'VIP' ? DIAMOND_THRESHOLD : DIAMOND_THRESHOLD;
  const maxSpend = nextThreshold * 1000;
  const progressPercent = currentRank === 'DIAMOND' ? 100 : Math.min(100, (totalSpend / maxSpend) * 100);

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#fff', p: 3 }}>
        <Skeleton height={30} sx={{ mb: 1 }} />
        <Skeleton height={10} sx={{ mb: 3 }} />
        <Skeleton height={200} />
      </Box>
    );
  }

  const nameUpper = (user?.name || 'Khách hàng').toUpperCase();

  return (
    <Box sx={{ bgcolor: '#fff', px: { xs: 2, md: 3 }, py: 3 }}>

      {/* Xếp hạng */}
      <Typography sx={{ ...textSx, fontSize: '1rem', mb: 0.5 }}>
        Xếp hạng <b>{nameUpper}</b> của bạn là <b style={{ color: '#ea3b92' }}>{rankLabel[currentRank]}</b>.
      </Typography>

      {/* Số lượng nâng cấp */}
      <Box sx={{ mt: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#555', fontFamily: font }}>
            Số lượng nâng cấp VIP vào năm
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#888', fontFamily: font }}>
              {maxSpend.toLocaleString('vi-VN')}
            </Typography>
            <CoinIcon sx={{ fontSize: 14, color: '#C9A86A' }} />
          </Box>
        </Box>
        <Box sx={{ height: 8, bgcolor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${progressPercent}%`, bgcolor: '#ea3b92', borderRadius: 4, transition: 'width 0.5s' }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.3 }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#aaa', fontFamily: font }}>{totalSpend.toLocaleString('vi-VN')}đ</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#aaa', fontFamily: font }}>{maxSpend.toLocaleString('vi-VN')}đ</Typography>
        </Box>
      </Box>

      {/* ============ TIÊU ĐỀ CHÍNH ============ */}
      <Box sx={{ borderTop: '1px solid #e6e6e6', pt: 2.5 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#1a2332', fontFamily: font, textTransform: 'uppercase', mb: 0.3 }}>
          Chương trình thành viên NMN Cinema Membership
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#ea3b92', fontFamily: font, mb: 2 }}>
          TÍCH ĐIỂM VÀ ĐỔI THƯỞNG
        </Typography>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#333', fontFamily: font, mb: 1.5, textTransform: 'uppercase' }}>
          Thể lệ và quy định về chương trình thành viên NMN Cinema
        </Typography>
      </Box>

      {/* ============ 1. CÁCH ĐĂNG KÝ ============ */}
      <Typography sx={headingSx}>1. Cách đăng ký để trở thành khách hàng thành viên NMN Cinema</Typography>
      <Typography sx={textSx}>
        <b>Nơi đăng ký bắt buộc:</b> Quầy vé NMN Cinema (LÀM THẺ HOÀN TOÀN MIỄN PHÍ)
      </Typography>
      <Typography sx={textSx}>
        <b>Thông tin đăng ký cần có:</b> Họ và tên, Số điện thoại, Số CCCD, Ngày sinh
      </Typography>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li><Typography sx={textSx}>1 SĐT/CCCD chỉ đăng ký được duy nhất 1 tài khoản/1 thẻ thành viên với 1 mã số duy nhất</Typography></li>
        <li><Typography sx={textSx}>Tài khoản được quyền sử dụng ngay</Typography></li>
        <li><Typography sx={textSx}>Trong trường hợp mất thẻ thành viên cần mang CMND đến quầy để làm lại thẻ</Typography></li>
      </ul>

      <Typography sx={subHeadingSx}>ĐỂ KÍCH HOẠT THÀNH VIÊN ONLINE VÀ MUA VÉ VỚI GIÁ ƯU ĐÃI:</Typography>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li><Typography sx={textSx}>Tài khoản online đăng ký số điện thoại trùng với số điện thoại mà bạn đã đăng ký THẺ THÀNH VIÊN (trùng cả về đầu số).</Typography></li>
        <li><Typography sx={textSx}>Số điện thoại của tài khoản online phải được xác thực trong mục TÀI KHOẢN online.</Typography></li>
      </ul>

      {/* ============ 2. HƯỚNG DẪN THỂ LỆ TÍCH ĐIỂM ============ */}
      <Typography sx={{ ...headingSx, pt: 2.5, borderTop: '1px solid #e6e6e6' }}>2. Hướng dẫn thể lệ tích điểm</Typography>

      {/* Bảng so sánh */}
      <Box sx={{ my: 2, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font, fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left', background: '#f9f9f9' }}></th>
              <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center', background: '#f9f9f9' }}>Normal</th>
              <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center', background: '#f9f9f9' }}>VIP</th>
              <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center', background: '#f9f9f9' }}>Diamond</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', fontWeight: 600 }}>Tại Quầy vé</td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>5%</td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>7%</td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>10%</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', fontStyle: 'italic', color: '#888', fontSize: '0.75rem' }}>
                VD: Với giao dịch mua vé 100.000vnd sẽ tích được
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>5.000</td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>7.000</td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>10.000</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', fontWeight: 600 }}>Tại Quầy Bắp nước</td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>3%</td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>3%</td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>5%</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', fontStyle: 'italic', color: '#888', fontSize: '0.75rem' }}>
                VD: Với giao dịch mua bắp nước 100.000vnd sẽ tích được
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>3.000</td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>3.000</td>
              <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center' }}>5.000</td>
            </tr>
          </tbody>
        </table>
      </Box>

      <Typography sx={{ ...textSx, textAlign: 'center', fontWeight: 700, color: '#ea3b92', my: 1.5 }}>
        1.000 đồng = 1 điểm
      </Typography>
      <Typography sx={{ ...textSx, mb: 2 }}>
        Bạn có thể dễ dàng kiểm tra điểm của mình trên Website NMN Cinema hoặc Ứng dụng NMN Cinema trên điện thoại (Với điều kiện phải thực hiện kích hoạt thành viên online)
      </Typography>

      {/* NMN Member */}
      <Typography sx={{ ...subHeadingSx, color: '#C9A86A' }}>NMN Member (điểm tích lũy từ 0 – 3.499 điểm)</Typography>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li><Typography sx={textSx}>Khách hàng đăng kí mới khi hoàn tất thanh toán giao dịch đầu tiên được cộng ngay 100 điểm</Typography></li>
        <li><Typography sx={textSx}>Cộng điểm đổi thưởng thêm 3% số tiền chi tiêu cho bắp nước và 5% số tiền chi tiêu cho vé</Typography></li>
      </ul>

      {/* NMN VIP */}
      <Typography sx={{ ...subHeadingSx, color: '#FFD700' }}>NMN VIP (điểm tích lũy từ 3.500 – 7.999 điểm)</Typography>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li><Typography sx={textSx}>Khách hàng lên hạng thẻ VIP được tặng 1 combo (1 nước ngọt + 1 bắp ngọt) và 3 vé xem phim 2D</Typography></li>
        <li><Typography sx={textSx}>Cộng điểm đổi thưởng thêm 3% số tiền chi tiêu cho bắp nước và 7% số tiền chi tiêu cho vé</Typography></li>
      </ul>

      {/* NMN Diamond */}
      <Typography sx={{ ...subHeadingSx, color: '#E8407B' }}>NMN Diamond (điểm tích lũy từ 8.000 điểm trở lên)</Typography>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li><Typography sx={textSx}>Khách hàng lên hạng thẻ Diamond được tặng 2 combo [2 x (1 nước ngọt + 1 bắp ngọt)] và 5 vé xem phim 2D</Typography></li>
        <li><Typography sx={textSx}>Cộng điểm đổi thưởng thêm 5% số tiền chi tiêu cho bắp nước và 10% số tiền chi tiêu cho vé</Typography></li>
      </ul>

      <Typography sx={{ ...textSx, mt: 1.5 }}>
        Khách hàng thành viên được tự động nâng hạng khi đủ điểm lên hạng mà không cần phải đợi xét duyệt vào cuối năm như các rạp khác. Khách hàng cần đến quầy đổi thẻ theo cấp hạng mới để được nhận quà trước khi số điểm bị reset vào cuối năm.
      </Typography>
      <Typography sx={{ ...textSx, mt: 1, fontStyle: 'italic' }}>
        Hạng thẻ của năm tiếp theo sẽ được tính dựa trên điểm tích lũy năm nay (tính tại thời điểm 31/12 hàng năm)
      </Typography>

      {/* ============ 3. QUÀ SINH NHẬT ============ */}
      <Typography sx={{ ...headingSx, pt: 2.5, borderTop: '1px solid #e6e6e6' }}>3. Quà sinh nhật thành viên</Typography>
      <Typography sx={textSx}>
        Thay lời chúc mừng đến quý khách hàng, NMN Cinema xin dành tặng bạn món quà nhân dịp sinh nhật của mình
      </Typography>

      <Typography sx={{ ...subHeadingSx, color: '#333' }}>Quà tặng</Typography>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li><Typography sx={textSx}><b>NMN Member:</b> 1 combo (1 nước ngọt + 1 bắp ngọt)</Typography></li>
        <li><Typography sx={textSx}><b>NMN VIP:</b> 1 combo (2 nước ngọt + 1 bắp ngọt) và 1 vé xem phim 2D</Typography></li>
        <li><Typography sx={textSx}><b>NMN Diamond:</b> 1 combo (2 nước ngọt + 1 bắp ngọt) và 2 vé xem phim 2D</Typography></li>
      </ul>

      <Typography sx={{ ...subHeadingSx, color: '#333' }}>Điều kiện nhận quà sinh nhật</Typography>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li><Typography sx={textSx}>Thời gian nhận quà sinh nhật dành cho khách hàng: Trong vòng 10 ngày kể từ ngày sinh nhật</Typography></li>
        <li><Typography sx={textSx}>Khách hàng thành viên nhận quà sinh nhật trực tiếp tại rạp</Typography></li>
        <li><Typography sx={textSx}>Chỉ những thành viên có ít nhất 1 giao dịch trong năm và trước thời điểm nhận quà mới được nhận phần quà sinh nhật từ NMN Cinema</Typography></li>
        <li><Typography sx={textSx}>Khách hàng vui lòng xuất trình giấy tờ tuỳ thân (CMND/…) tương ứng với tài khoản thành viên để nhận quà</Typography></li>
        <li><Typography sx={textSx}>Quà sinh nhật có giá trị sử dụng 1 tháng kể từ ngày sinh nhật</Typography></li>
        <li><Typography sx={textSx}>Nếu có nhu cầu đổi vị bắp, bạn vui lòng thanh toán thêm khoản phụ thu</Typography></li>
        <li><Typography sx={textSx}>Phần quà sinh nhật không có giá trị quy đổi thành tiền mặt</Typography></li>
      </ul>

      {/* ============ 4. ĐIỀU KIỆN SỬ DỤNG ĐIỂM ============ */}
      <Typography sx={{ ...headingSx, pt: 2.5, borderTop: '1px solid #e6e6e6' }}>4. Điều kiện sử dụng điểm</Typography>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li><Typography sx={textSx}>Điểm tích lũy là điểm dùng để xét cấp bậc hạng thẻ. Điểm thưởng là điểm dùng để đổi các phần quà tương ứng với số điểm.</Typography></li>
        <li><Typography sx={textSx}>Khi đổi thưởng, điểm tích lũy sẽ vẫn được giữ nguyên, chỉ có điểm thưởng bị trừ đi</Typography></li>
        <li><Typography sx={textSx}>Điểm thành viên bao gồm điểm tích lũy và điểm thưởng chỉ có giá trị sử dụng trong năm. Toàn bộ điểm sẽ được reset về 0 vào 23h59' ngày 31/12 hàng năm.</Typography></li>
      </ul>

      <Typography sx={{ ...textSx, mt: 1.5, mb: 1 }}>
        Khách hàng thành viên có thể sử dụng điểm thưởng để đổi các phần quà tương ứng như sau:
      </Typography>

      {/* Bảng đổi điểm */}
      <Box sx={{ my: 2, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font, fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'center', background: '#f9f9f9' }}>Điểm</th>
              <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left', background: '#f9f9f9' }}>Phần quà</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['450', '1 nước Aquafina'],
              ['500', '1 nước ngọt'],
              ['550', '1 nước ngọt lớn'],
              ['700', '1 bắp ngọt'],
              ['800', '1 bắp phô mai / caramel'],
              ['1.100', '1 nước ngọt + 1 bắp ngọt'],
              ['1.150', '1 nước ngọt lớn + 1 bắp ngọt'],
              ['1.200', '1 nước ngọt + 1 bắp phô mai / caramel'],
              ['1.250', '1 nước ngọt lớn + 1 bắp phô mai / caramel'],
              ['1.500', '2 nước ngọt + 1 bắp ngọt'],
              ['1.600', '2 nước ngọt + 1 bắp phô mai / caramel HOẶC 2 nước ngọt lớn + 1 bắp ngọt'],
              ['1.700', '2 nước ngọt lớn + 1 bắp phô mai / caramel'],
              ['1.000', '1 vé 2D'],
              ['1.200', '1 vé 3D']
            ].map(([pts, reward], idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #ddd', padding: '6px 12px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>{pts} điểm</td>
                <td style={{ border: '1px solid #ddd', padding: '6px 12px' }}>{reward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Typography sx={{ ...subHeadingSx, color: '#333' }}>Quy định sử dụng điểm</Typography>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li><Typography sx={textSx}>Quà tặng quy đổi từ điểm thưởng chỉ có giá trị sử dụng trong ngày thực hiện đổi</Typography></li>
        <li><Typography sx={textSx}>Quà tặng được đổi tại quầy hoặc đổi online ngay trong giao dịch</Typography></li>
        <li><Typography sx={textSx}>Không quy đổi quà ra tiền mặt hay chuyển nhượng sang tài khoản khác</Typography></li>
        <li><Typography sx={textSx}>Thành viên phải cung cấp CMND hoặc thẻ thành viên để nhận quà</Typography></li>
        <li><Typography sx={textSx}>Thông tin chương trình, quà thưởng và các ưu đãi dành cho thành viên có thể được thay đổi và cập nhật thường xuyên mà không báo trước</Typography></li>
      </ul>

    </Box>
  );
}
