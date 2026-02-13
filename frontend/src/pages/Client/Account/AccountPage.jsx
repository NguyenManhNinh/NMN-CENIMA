import { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Skeleton
} from '@mui/material';
import {
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  WorkspacePremium as PremiumIcon,
  MonetizationOn as CoinIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { getMyLoyaltyAPI } from '../../../apis/loyaltyApi';
import JsBarcode from 'jsbarcode';

// ==================== DESIGN TOKENS ====================
const COLORS = {
  white: '#FFFFFF',
  greetingBg: '#2E343B',
  gold: '#C9A86A',
  goldLight: '#E8D5A8',
  border: '#E6E6E6',
  textPrimary: '#333333',
  textSecondary: '#888888',
  textMuted: '#AAAAAA',
  vip: '#FFD700',
  diamond: '#E8407B'
};

const RANK_CONFIG = {
  MEMBER: {
    label: 'Normal',
    color: COLORS.gold,
    icon: <StarIcon />,
    gradient: 'linear-gradient(135deg, #C9A86A 0%, #E8D5A8 100%)'
  },
  VIP: {
    label: 'VIP',
    color: COLORS.vip,
    icon: <TrophyIcon />,
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
  },
  DIAMOND: {
    label: 'Diamond',
    color: COLORS.diamond,
    icon: <PremiumIcon />,
    gradient: 'linear-gradient(135deg, #E8407B 0%, #C850C0 100%)'
  }
};

// ==================== STYLES ====================
const styles = {
  pageContainer: {
    background: 'url(/src/assets/images/bg-header.jpg) center top / cover no-repeat',
    minHeight: '100vh',
    py: { xs: 3, md: 5 },
    px: { xs: 2, md: 0 }
  },
  pageTitle: {
    fontSize: { xs: '1.6rem', md: '2.2rem' },
    fontWeight: 700,
    color: '#EA3B92',
    mb: 3,
    fontFamily: '"Nunito Sans", sans-serif'
  },
  greetingBar: {
    bgcolor: COLORS.greetingBg,
    borderRadius: 'none',
    px: { xs: 2, md: 4 },
    py: 1.8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 1
  },
  greetingText: {
    color: '#fff',
    fontSize: { xs: '0.95rem', md: '1.05rem' },
    fontWeight: 400,
    fontFamily: '"Nunito Sans", sans-serif'
  },
  greetingName: {
    color: COLORS.gold,
    fontWeight: 700
  },
  tierLabel: {
    color: '#ccc',
    fontSize: { xs: '0.85rem', md: '0.95rem' },
    fontFamily: '"Nunito Sans", sans-serif'
  },
  tierValue: {
    color: COLORS.gold,
    fontWeight: 700,
    ml: 0.5
  },
  mainCard: {
    bgcolor: COLORS.white,
    borderRadius: 'none',
    overflow: 'hidden'
  },
  cardBody: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: 'stretch'
  },
  // Left column
  leftCol: {
    flex: { xs: '1 1 auto', md: '0 0 58%' },
    px: { xs: 2, md: 3 },
    py: { xs: 2, md: 3 }
  },
  coinHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2
  },
  coinTitle: {
    fontSize: { xs: '1.05rem', md: '1.2rem' },
    fontWeight: 700,
    color: COLORS.textPrimary,
    fontFamily: '"Nunito Sans", sans-serif'
  },
  coinValue: {
    fontSize: { xs: '1.3rem', md: '1.7rem' },
    fontWeight: 800,
    color: COLORS.textPrimary,
    lineHeight: 1,
    fontFamily: '"Nunito Sans", sans-serif'
  },
  coinUnit: {
    fontSize: { xs: '1.2rem', md: '1.5rem' },
    color: '#000',
    ml: 0,
    verticalAlign: 'middle'
  },
  barcodeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mt: 1,
    mb: 0.5,
    gap: 0.7
  },
  memberCode: {
    fontSize: { xs: '1rem', md: '1.15rem' },
    fontWeight: 500,
    color: COLORS.textPrimary,
    letterSpacing: '2px',
    mt: 0,
    lineHeight: 1.2,
    textAlign: 'center',
    fontFamily: '"Nunito Sans", sans-serif'
  },
  noteText: {
    fontSize: '0.8rem',
    color: COLORS.textSecondary,
    mt: 4,
    fontStyle: 'italic',
    lineHeight: 1.5,
    textAlign: 'center',
    fontFamily: '"Nunito Sans", sans-serif'
  },
  // Vertical divider
  verticalDivider: {
    display: { xs: 'none', md: 'block' },
    width: '1px',
    bgcolor: COLORS.border,
    alignSelf: 'stretch'
  },
  // Horizontal divider (mobile)
  horizontalDivider: {
    display: { xs: 'block', md: 'none' },
    height: '1px',
    bgcolor: COLORS.border,
    mx: 2
  },
  // Right column
  rightCol: {
    flex: { xs: '1 1 auto', md: '0 0 42%' },
    px: { xs: 2, md: 3 },
    py: { xs: 2, md: 3 },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 0,
    borderLeft: { xs: 'none', md: `1px solid ${COLORS.border}` }
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    py: 1.5,
    borderBottom: `1px solid ${COLORS.border}`,
    '&:last-of-type': {
      borderBottom: 'none'
    }
  },
  infoLabel: {
    fontSize: '0.9rem',
    color: COLORS.textSecondary,
    fontFamily: '"Nunito Sans", sans-serif'
  },
  infoValue: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: COLORS.textPrimary,
    fontFamily: '"Nunito Sans", sans-serif'
  },

  // Rank badge
  rankBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    px: 1.5,
    py: 0.3,
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 700,
    fontFamily: '"Nunito Sans", sans-serif'
  }
};

// ==================== BARCODE COMPONENT ====================
function BarcodeDisplay({ value }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: false,
          margin: 0,
          background: 'transparent'
        });
      } catch (e) {
        console.error('Barcode generation error:', e);
      }
    }
  }, [value]);

  return <svg ref={svgRef} />;
}

// ==================== RANK BADGE COMPONENT ====================
function RankBadge({ rank }) {
  const config = RANK_CONFIG[rank] || RANK_CONFIG.MEMBER;
  return (
    <Box sx={{
      ...styles.rankBadge,
      background: config.gradient,
      color: '#fff'
    }}>
      {config.icon}
      {config.label}
    </Box>
  );
}

// ==================== MAIN COMPONENT ====================
export default function AccountPage() {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        const res = await getMyLoyaltyAPI();
        setLoyaltyData(res.data);
      } catch (err) {
        console.error('Fetch loyalty failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoyalty();
  }, []);

  // Generate member code from user ID
  const memberCode = user?._id
    ? user._id.slice(-12).toUpperCase().replace(/(.{4})/g, '$1 ').trim()
    : '0000 0000 0000';

  const barcodeValue = user?._id
    ? user._id.slice(-16)
    : '0000000000000000';

  const rank = loyaltyData?.rank || user?.rank || 'MEMBER';
  const points = loyaltyData?.points ?? user?.points ?? 0;
  const rankConfig = RANK_CONFIG[rank] || RANK_CONFIG.MEMBER;

  if (!user) {
    return (
      <Box sx={styles.pageContainer}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', color: COLORS.textSecondary, mt: 10 }}>
            Vui lòng đăng nhập để xem thông tin tài khoản.
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={styles.pageContainer}>
      <Container maxWidth="lg">
        {/* Page Title */}
        <Typography sx={styles.pageTitle}>
          Rạp chiếu phim của tôi
        </Typography>

        {/* Main Card */}
        <Box sx={styles.mainCard}>
          {/* Greeting Bar (card header) */}
          <Box sx={styles.greetingBar}>
            <Typography sx={styles.greetingText}>
              Xin chào <Box component="span" sx={styles.greetingName}>{user.name}!</Box>
            </Typography>
            <Typography sx={styles.tierLabel}>
              Cấp độ thành viên |
              <Box component="span" sx={styles.tierValue}>
                {rankConfig.label}
              </Box>
            </Typography>
          </Box>

          {/* Card Body - 2 columns */}
          <Box sx={styles.cardBody}>
            {/* LEFT COLUMN - Cinema Coin + Barcode */}
            <Box sx={styles.leftCol}>
              {/* Wrapper chung: coin header + barcode cùng width */}
              <Box sx={{ display: 'inline-block', maxWidth: '100%' }}>
                {/* Cinema Coin header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={styles.coinTitle}>Cinema Coin</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {loading ? (
                      <Skeleton width={80} height={50} />
                    ) : (
                      <>
                        <Typography sx={styles.coinValue}>
                          {points.toLocaleString('vi-VN')}
                        </Typography>
                        <CoinIcon sx={{ ...styles.coinUnit, ml: 0 }} />
                      </>
                    )}
                  </Box>
                </Box>

                {/* Barcode */}
                <Box sx={styles.barcodeContainer}>
                  <Box sx={{
                    display: 'inline-block',
                    lineHeight: 0,
                    p: 0
                  }}>
                    <BarcodeDisplay value={barcodeValue} />
                  </Box>
                  <Typography sx={styles.memberCode}>
                    {memberCode}
                  </Typography>
                </Box>

                {/* Note */}
                <Typography sx={styles.noteText}>
                  Áp dụng thanh toán bằng Cinema Coin với số điểm tối thiểu là 450 điểm.
                </Typography>
              </Box>{/* end wrapper inline-block */}
            </Box>{/* end leftCol */}

            {/* Vertical divider (desktop) */}
            <Box sx={styles.verticalDivider} />
            {/* Horizontal divider (mobile) */}
            <Box sx={styles.horizontalDivider} />

            {/* RIGHT COLUMN - Membership Info */}
            <Box sx={styles.rightCol}>
              {/* Info rows */}
              <Box>
                <Box sx={styles.infoRow}>
                  <Typography sx={styles.infoLabel}>Cấp độ thành viên</Typography>
                  {loading ? (
                    <Skeleton width={60} />
                  ) : (
                    <RankBadge rank={rank} />
                  )}
                </Box>
                <Box sx={styles.infoRow}>
                  <Typography sx={styles.infoLabel}>Mã thành viên</Typography>
                  <Typography sx={styles.infoValue}>
                    {memberCode}
                  </Typography>
                </Box>
                <Box sx={styles.infoRow}>
                  <Typography sx={styles.infoLabel}>Điểm tích lũy</Typography>
                  {loading ? (
                    <Skeleton width={40} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{
                        ...styles.infoValue,
                        color: '#000'
                      }}>
                        {points.toLocaleString('vi-VN')}
                      </Typography>
                      <CoinIcon sx={{ fontSize: '1.1rem', color: '#000' }} />
                    </Box>
                  )}
                </Box>
                {loyaltyData?.nextRank && (
                  <Box sx={styles.infoRow}>
                    <Typography sx={styles.infoLabel}>
                      Hạng tiếp theo ({loyaltyData.nextRank})
                    </Typography>
                    <Typography sx={{
                      ...styles.infoValue,
                      fontSize: '0.85rem'
                    }}>
                      Cần thêm {loyaltyData.pointsToNextRank?.toLocaleString('vi-VN')} điểm
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>{/* end cardBody */}
        </Box>{/* end mainCard */}
      </Container>
    </Box>
  );
}
