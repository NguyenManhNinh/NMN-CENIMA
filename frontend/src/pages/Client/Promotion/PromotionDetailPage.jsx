import { useState, useEffect, useCallback } from 'react';
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
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';

// API imports
import {
  getPromotionBySlugAPI,
  getPromotionsHomeAPI,
  toggleLikeAPI
} from '../../../apis/promotionApi';

// STYLES
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
    mb: 0.5
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
  bannerWrapper: {
    width: '100%',
    bgcolor: '#f5f5f5'
  },
  bannerImage: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
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

// HELPERS
const formatCount = (count) => {
  if (count == null) return '';
  if (count === 0) return '0';
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

// COMPONENT
function PromotionDetailPage() {
  const { slug } = useParams();

  // State
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promotion, setPromotion] = useState(null);
  const [error, setError] = useState(null);
  const [banners, setBanners] = useState([]);

  // Fetch promotion data
  const fetchPromotion = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getPromotionBySlugAPI(slug);

      if (!data) {
        setError('Không tìm thấy ưu đãi');
        return;
      }

      setPromotion(data);
      setLiked(!!data.liked);

    } catch (err) {
      console.error('Error fetching promotion:', err);
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Fetch banners
  const fetchBanners = useCallback(async () => {
    try {
      const data = await getPromotionsHomeAPI();
      setBanners(data?.banners || []);
    } catch (err) {
      console.error('Error fetching banners:', err);
    }
  }, []);

  // Track view trong session để tránh gọi API nhiều lần
  useEffect(() => {
    const viewedKey = `promo_viewed_${slug}`;
    const alreadyViewed = sessionStorage.getItem(viewedKey);

    if (!alreadyViewed) {
      sessionStorage.setItem(viewedKey, '1');
    }
    fetchPromotion();
    fetchBanners();
  }, [slug, fetchPromotion, fetchBanners]);

  // Handler: Share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: promotion?.title,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Đã copy link!');
      }
    } catch {
      toast.error('Không thể chia sẻ lúc này');
    }
  };

  // Handler: Toggle like/unlike
  const handleLike = async () => {
    try {
      const response = await toggleLikeAPI(promotion._id);
      if (response.success) {
        setLiked(response.liked);
        setPromotion(prev => ({
          ...prev,
          likeCount: response.likeCount
        }));
        toast.success(response.message);
      }
    } catch (err) {
      console.error('Like error:', err);
      toast.error('Không thể thích ưu đãi lúc này');
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
              {formatCount(promotion?.likeCount ?? 0)}
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

        {/* CONTENT - XSS sanitization */}
        {promotion?.content && (
          <Box sx={styles.contentBox}>
            <Box
              sx={styles.content}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(promotion.content, {
                  FORBID_TAGS: ['form', 'input', 'textarea', 'button', 'select', 'option', 'label'],
                  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onchange', 'onsubmit']
                })
              }}
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

      {/* BOTTOM BANNERS */}
      <Container maxWidth={false} sx={{ maxWidth: 1320, px: { xs: 2, md: 3 } }}>
        <BottomBannerSection banners={banners} />
      </Container>
    </Box>
  );
}

export default PromotionDetailPage;
