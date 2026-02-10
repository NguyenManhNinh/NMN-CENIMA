import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
//Icon cảnh báo nếu không tìm thấy ưu đãi nào
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PromotionCard from './PromotionCard';
import BottomBannerSection from './BottomBannerSection';
import { getPromotionsHomeAPI } from '../../../apis/promotionApi';

// CONSTANTS
const ITEMS_PER_PAGE = 20;

// STYLES
const styles = {
  page: {
    minHeight: '60vh',
    background: 'url(/src/assets/images/bg-header.jpg) center top / cover no-repeat fixed',
    py: 1
  },
  container: {
    maxWidth: 1320
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, 1fr)',
      sm: 'repeat(3, 1fr)',
      md: 'repeat(4, 1fr)',
      lg: 'repeat(4, 1fr)'
    },
    gap: { xs: 2, md: 3 }
  },
  loadMoreWrapper: {
    display: 'flex',
    justifyContent: 'center',
    mt: { xs: 3, md: 4 }
  },
  loadMoreButton: {
    px: 6,
    py: 1.2,
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#333',
    borderColor: '#ddd',
    '&:hover': {
      borderColor: '#999',
      bgcolor: '#f9f9f9'
    }
  },
  emptyState: {
    textAlign: 'center',
    py: 8
  },
  emptyText: {
    color: '#999',
    fontSize: '1rem'
  },
  errorState: {
    textAlign: 'center',
    py: 4
  },
  retryButton: {
    mt: 2
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

// COMPONENT
function PromotionListPage() {
  const navigate = useNavigate();

  // State: dữ liệu
  const [promotions, setPromotions] = useState([]);
  const [banners, setBanners] = useState([]);

  // State: loading & error
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // State: pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * Lấy danh sách ưu đãi từ API /promotions/home
   * @param {number} page - Trang cần lấy
   * @param {boolean} append - true = load more, false = load mới
   */
  const fetchPromotions = useCallback(async (page = 1, append = false) => {
    // Set loading state
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      // API đã unwrap, trả về { promotions, banners } trực tiếp
      const data = await getPromotionsHomeAPI({
        page,
        limit: ITEMS_PER_PAGE,
        sort: 'newest'
      });

      // Validate response shape
      if (!data || !Array.isArray(data.promotions)) {
        throw new Error('API trả về dữ liệu không hợp lệ');
      }

      const { promotions: apiPromotions, banners: apiBanners, pagination } = data;

      if (append) {
        // Load more: merge và dedupe theo _id
        setPromotions(prev => {
          const merged = [...prev, ...apiPromotions];
          const unique = new Map(merged.map(item => [item._id, item]));
          return Array.from(unique.values());
        });
      } else {
        // Load mới: set dữ liệu + banners
        setPromotions(apiPromotions || []);
        setBanners(apiBanners || []);
      }

      // Cập nhật pagination
      if (pagination) {
        setCurrentPage(pagination.page || page);
        setTotalPages(pagination.totalPages || 1);
      }

    } catch (err) {
      console.error('[PromotionListPage] fetchPromotions error:', err.message);

      if (append) {
        setError('Không thể tải thêm dữ liệu. Vui lòng thử lại.');
      } else {
        setError('Không thể tải danh sách ưu đãi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Load dữ liệu khi mount
  useEffect(() => {
    fetchPromotions(1, false);
  }, [fetchPromotions]);

  // Handler: Load thêm
  const handleLoadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchPromotions(currentPage + 1, true);
    }
  };

  // Handler: Click vào card
  const handleCardClick = (promotion) => {
    if (promotion.slug) {
      navigate(`/uu-dai/${promotion.slug}`);
    }
  };

  // Handler: Thử lại khi lỗi
  const handleRetry = () => {
    fetchPromotions(1, false);
  };

  // Tính toán: có thể load thêm không
  const canLoadMore = currentPage < totalPages;

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

  // RENDER: Main content
  return (
    <Box sx={styles.page}>
      <Container maxWidth={false} sx={styles.container}>
        <Box sx={{ bgcolor: '#fff', borderRadius: 0, p: { xs: 2, md: 3 } }}>

          {/* Error state */}
          {error && (
            <Box sx={styles.errorState}>
              <Alert severity="error" sx={{ justifyContent: 'center', mb: 2 }}>
                {error}
              </Alert>
              <Button variant="outlined" onClick={handleRetry} sx={styles.retryButton}>
                Thử lại
              </Button>
            </Box>
          )}

          {/* Empty state */}
          {!error && promotions.length === 0 && (
            <Box sx={styles.emptyState}>
              <Typography
                sx={{
                  ...styles.emptyText,
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.8,
                }}
              >
                <ErrorOutlineIcon
                  fontSize="inherit"
                  sx={{ color: 'error.main' }}
                />
                Không tìm thấy ưu đãi nào
              </Typography>
            </Box>
          )}

          {/* Promotions grid */}
          {!error && promotions.length > 0 && (
            <>
              <Box sx={styles.grid}>
                {promotions.map((promotion) => (
                  <PromotionCard
                    key={promotion._id}
                    promotion={promotion}
                    onClick={() => handleCardClick(promotion)}
                  />
                ))}
              </Box>

              {/* Load more button */}
              {canLoadMore && (
                <Box sx={styles.loadMoreWrapper}>
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    sx={styles.loadMoreButton}
                    startIcon={loadingMore ? <CircularProgress size={16} /> : null}
                  >
                    {loadingMore ? 'Đang tải...' : 'Xem thêm'}
                  </Button>
                </Box>
              )}

              {/* Bottom banners - chỉ render khi có data */}
              <BottomBannerSection banners={banners} />
            </>
          )}

        </Box>
      </Container>
    </Box>
  );
}

export default PromotionListPage;
