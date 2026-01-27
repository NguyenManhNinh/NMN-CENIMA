import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import BottomBannerSection from './BottomBannerSection';

// API imports - TẠM THỜI COMMENT LẠI
// import { getPromotionBySlugAPI } from '../../../apis/promotionApi';

// =============================================
// MOCK DATA - Dữ liệu mẫu để phát triển UI
// =============================================
const MOCK_PROMOTIONS = {
  'uu-dai-tet-2026': {
    _id: 'mock-2',
    title: 'TẾT RỘN RÀNG - ƯU ĐÃI NGẬP TRÀN TẠI LOTTE CINEMA',
    slug: 'uu-dai-tet-2026',
    content: `
      <p>Du xuân xem phim hay, lại còn được nhận ngay ưu đãi "khủng" từ sự kết hợp của Lotte Cinema & Lotte Mart!</p>
      <p>✨ <strong>ƯU ĐÃI ĐẶC BIỆT:</strong> <span style="color: #e71a0f; font-weight: bold;">GIẢM NGAY 10%</span> cho Hotfood Combo.</p>
      <p><strong>Cách thức nhận ưu đãi cực đơn giản:</strong> Chỉ cần mang theo hóa đơn mua sắm bất kỳ tại Lotte Mart đến quầy vé Lotte Cinema là bạn sẽ được áp dụng giảm giá ngay lập tức.</p>
      <p><strong>Thời gian:</strong> Duy nhất từ ngày 18-24/02/2026.</p>
    `,
    notes: `Áp dụng tại các cụm rạp Lotte Cinema x Lotte Mart:
- Lotte Cinema Nam Sài Gòn (Tầng 3 Lotte Mart Quận 7)
- Lotte Cinema Gò Vấp (Tầng 3 Lotte Mart Gò Vấp)
- Lotte Cinema Cộng Hòa (Tầng 4, Pico Plaza)
- Lotte Cinema Bình Dương (Tầng 2, Lotte Mart Bình Dương)
- Lotte Cinema Vũng Tàu (Tầng 3, Lotte Mart Vũng Tàu)
- Lotte Cinema Đồng Nai (Tầng 5, Lotte Mart Đồng Nai)
- Lotte Cinema Cần Thơ (Tầng 3, Lotte Mart Cần Thơ)
- Lotte Cinema Phan Thiết (Tầng 5, Lotte Mart Phan Thiết)
- Lotte Cinema Đà Nẵng (Tầng 5&6, Lotte Mart Đà Nẵng)
- Lotte Cinema West Lake (Tầng 4, Lotte Mall West Lake)`,
    thumbnailUrl: 'https://media.lottecinemavn.com/Media/Event/52232691628d44f48e910a6dc834a70a.jpg',
    coverUrl: 'https://media.lottecinemavn.com/Media/Event/52232691628d44f48e910a6dc834a70a.jpg',
    viewCount: 856,
    likeCount: 45
  },
};

// Default mock nếu slug không tìm thấy
const DEFAULT_MOCK = MOCK_PROMOTIONS['uu-dai-tet-2026'];

// MOCK BANNERS - 2 banner hiển thị bên dưới
const MOCK_BANNERS = [
  {
    _id: 'banner-1',
    title: 'QUYỀN LỢI THÀNH VIÊN NĂM 2026',
    slug: 'quyen-loi-thanh-vien-2026',
    coverUrl: 'https://media.lottecinemavn.com/Media/WebAdmin/686ec4448f6642769e44371129e4f68c.jpg',
    bannerOrder: 1
  },
  {
    _id: 'banner-2',
    title: 'MERCHANDISE MÙI PHỞ',
    slug: 'merchandise-mui-pho',
    coverUrl: 'https://media.lottecinemavn.com/Media/WebAdmin/e82257ea7d14466f934cb90de5d22ab3.jpg',
    bannerOrder: 2
  }
];

// =============================================
// STYLES - Theo template Lotte Cinema
// =============================================
const styles = {
  page: {
    minHeight: '60vh',
    bgcolor: '#f5f5f5',
    py: { xs: 2, md: 3 }
  },
  mainContainer: {
    maxWidth: 900,
    px: { xs: 2, md: 3 }
  },
  // Header section - White background với title + actions
  headerBox: {
    bgcolor: '#fff',
    p: { xs: 2, md: 2.5 },
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 2,
    borderBottom: '1px solid #eee'
  },
  titleSection: {
    flex: 1
  },
  title: {
    fontSize: { xs: '1.1rem', md: '1.35rem' },
    fontWeight: 700,
    color: 'hsla(0, 0%, 4%, 1.00)',
    lineHeight: 1.4,
    mb: 0
  },
  actionsBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexShrink: 0
  },
  actionButton: {
    p: 0.8,
    color: '#666',
  },
  actionCount: {
    fontSize: '0.7rem',
    color: '#888',
    ml: -0.5,
    mr: 0.5
  },
  likedButton: {
    p: 0.8,
    color: '#e71a0f',
  },
  // Banner - hiển thị đúng tỉ lệ gốc, không crop
  bannerWrapper: {
    width: '100%',
    bgcolor: '#f5f5f5'
  },
  bannerImage: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  // Content section
  contentBox: {
    bgcolor: '#fff',
    p: { xs: 2, md: 3 }
  },
  content: {
    fontSize: '0.95rem',
    lineHeight: 1.9,
    color: '#333',
    '& p': { mb: 1.5 },
    '& strong': { fontWeight: 600 }
  },
  // Notes section
  notesBox: {
    bgcolor: '#f5f5dc',
    p: { xs: 2, md: 2.5 },
    mt: 0.5
  },
  notesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1.5
  },
  notesTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#666'
  },
  notesContent: {
    fontSize: '0.9rem',
    lineHeight: 1.8,
    color: '#555',
    whiteSpace: 'pre-line'
  },
  // Loading state styles
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bgcolor: '#1a1a2e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  loadingLogo: {
    width: 200,
    height: 200,
    mb: 1.5,
    objectFit: 'contain'
  },
  loadingSpinner: {
    color: '#F5A623',
    mb: 2
  },
  loadingText: {
    color: '#FFA500',
    fontSize: '1.2rem',
    fontWeight: 600,
    fontFamily: '"Montserrat","Poppins", "Google Sans", sans-serif',
    letterSpacing: '0.5px'
  }
};

// =============================================
// HELPERS
// =============================================
const formatCount = (count) => {
  if (!count) return '0';
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

// =============================================
// COMPONENT
// =============================================
function PromotionDetailPage() {
  const { slug } = useParams();

  // State
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promotion, setPromotion] = useState(null);
  const [error, setError] = useState(null);

  // Simulate loading (TODO: thay bằng API call thực tế)
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const data = MOCK_PROMOTIONS[slug] || DEFAULT_MOCK;
      setPromotion(data);
      setLoading(false);
    }, 800); // Giả lập delay 800ms

    return () => clearTimeout(timer);
  }, [slug]);

  // Handler: Like
  const handleLike = () => {
    setLiked(!liked);
    // TODO: Call API to toggle like
  };

  // Handler: Share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: promotion?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // RENDER: Loading state
  if (loading) {
    return (
      <Box sx={styles.loadingOverlay}>
        <Box
          component="img"
          src="/NMN_CENIMA_LOGO.png"
          alt="NMN Cinema"
          sx={styles.loadingLogo}
        />
        <CircularProgress size={40} thickness={2} sx={styles.loadingSpinner} />
        <Typography sx={styles.loadingText}>
          Chờ tôi xíu nhé
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={styles.page}>
        <Container maxWidth="md" sx={{ pt: 4 }}>
          <Paper sx={{ ...styles.contentBox, textAlign: 'center', py: 6 }}>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>{error}</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Get banner image
  const bannerUrl = promotion?.coverUrl || promotion?.thumbnailUrl;

  // Main render
  return (
    <Box sx={styles.page}>
      <Container maxWidth="md" sx={styles.mainContainer}>

        {/* HEADER: Title + Actions */}
        <Box sx={styles.headerBox}>
          <Box sx={styles.titleSection}>
            <Typography component="h1" sx={styles.title}>
              {promotion?.title}
            </Typography>
          </Box>

          <Box sx={styles.actionsBox}>
            {/* View count */}
            <Tooltip title="Lượt xem">
              <IconButton sx={styles.actionButton} disableRipple>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography sx={styles.actionCount}>
              {formatCount(promotion?.viewCount)}
            </Typography>

            {/* Like button */}
            <Tooltip title={liked ? 'Bỏ thích' : 'Thích'}>
              <IconButton
                sx={liked ? styles.likedButton : styles.actionButton}
                onClick={handleLike}
              >
                {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Typography sx={styles.actionCount}>
              {formatCount(promotion?.likeCount + (liked ? 1 : 0))}
            </Typography>

            {/* Share button */}
            <Tooltip title="Chia sẻ">
              <IconButton sx={styles.actionButton} onClick={handleShare}>
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* BANNER */}
        {bannerUrl && (
          <Box sx={styles.bannerWrapper}>
            <Box
              component="img"
              src={bannerUrl}
              alt={promotion?.title}
              sx={styles.bannerImage}
            />
          </Box>
        )}

        {/* CONTENT */}
        {promotion?.content && (
          <Box sx={styles.contentBox}>
            <Box
              sx={styles.content}
              dangerouslySetInnerHTML={{ __html: promotion.content }}
            />
          </Box>
        )}

        {/* NOTES */}
        {promotion?.notes && (
          <Box sx={styles.notesBox}>
            <Box sx={styles.notesHeader}>
              <Typography sx={{ ...styles.notesTitle, fontSize: '1rem' }}>
                <WarningAmberIcon
                  fontSize="inherit"
                  sx={{ color: 'error.main' }}
                />
                Lưu ý
              </Typography>
            </Box>
            <Typography sx={styles.notesContent}>
              {promotion.notes}
            </Typography>
          </Box>
        )}
      </Container>

      {/* BOTTOM BANNERS - Full width như PromotionListPage */}
      <Container maxWidth={false} sx={{ maxWidth: 1320, px: { xs: 2, md: 3 } }}>
        <BottomBannerSection banners={MOCK_BANNERS} />
      </Container>
    </Box>
  );
}

export default PromotionDetailPage;
