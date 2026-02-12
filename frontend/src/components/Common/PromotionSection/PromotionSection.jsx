import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Skeleton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import LocalActivityOutlinedIcon from '@mui/icons-material/LocalActivityOutlined';

// API
import { getPromotionsAPI } from '../../../apis/promotionApi';



// CONSTANTS
const ITEMS_PER_PAGE = 4;
const AUTO_ROTATE_INTERVAL_DESKTOP = 20000; // 20 giây cho desktop
const AUTO_ROTATE_INTERVAL_MOBILE = 4000;   // 4 giây cho mobile
const CARD_WIDTH = 264.76;
const CARD_HEIGHT = 397.14;
const SWIPE_THRESHOLD = 50; // Ngưỡng swipe tối thiểu (px)

// STYLES
const styles = {
  section: {
    py: 5
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: { xs: '1.25rem', md: '1.5rem' },
    color: '#F3C246',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center'
  },
  dotsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 1,
    mt: 2
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: 'none',
    padding: 0
  },
  dotActive: {
    backgroundColor: '#fff',
    transform: 'scale(1.2)'
  },
  gridContainer: {
    transition: 'opacity 0.5s ease-in-out'
  },
  card: {
    boxShadow: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'transform 0.3s',
  },
  imageContainer: {
    overflow: 'hidden',
    width: '100%',
    borderRadius: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'relative',
    backgroundColor: '#1c1c1c'
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
    transition: 'transform 0.3s'
  },
  title: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#fff',
    textTransform: 'uppercase',
    mt: 1.5,
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: '2.8em'
  },
  // Mobile carousel styles - swipe enabled
  mobileCarousel: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    touchAction: 'pan-y pinch-zoom', // Cho phép scroll dọc, chặn ngang
    cursor: 'grab'
  },
  mobileSlider: {
    display: 'flex',
    transition: 'transform 0.4s ease-out'
  },
  mobileSlide: {
    minWidth: '100%',
    px: 2,
    display: 'flex',
    justifyContent: 'center'
  },
  mobileCard: {
    width: '100%',
    maxWidth: 300,
    userSelect: 'none',
    backgroundColor: 'transparent'
  },
  // Fallback UI khi không có ảnh
  imageFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #1c1c1c 0%, #2a2a2a 50%, #1c1c1c 100%)',
    gap: 1.5,
    aspectRatio: '4/3',
    minHeight: 200
  },
  fallbackIcon: {
    fontSize: '3rem',
    color: 'rgba(245, 166, 35, 0.6)'
  },
  fallbackText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    px: 2,
    textAlign: 'center'
  }
};

// Sub-component: Image with fallback UI
function PromotionImage({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <Box sx={styles.imageFallback}>
        <LocalActivityOutlinedIcon sx={styles.fallbackIcon} />
        <Typography sx={styles.fallbackText}>
          Chưa có ảnh
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={styles.image}
      draggable={false}
      onError={() => setHasError(true)}
    />
  );
}

// PROMOTION SECTION COMPONENT
function PromotionSection() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [allPromotions, setAllPromotions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Touch/Swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const autoSlideRef = useRef(null);

  // Load promotions từ API
  useEffect(() => {
    const loadPromotions = async () => {
      setLoading(true);
      try {
        const data = await getPromotionsAPI({ limit: 20 });
        // unwrap() trả về mảng trực tiếp hoặc { promotions: [] }
        const promotions = Array.isArray(data) ? data : (data?.promotions || []);
        setAllPromotions(promotions);
      } catch (error) {
        console.error('Lỗi khi tải danh sách ưu đãi:', error);
        setAllPromotions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, []);

  // Tính số trang desktop (4 items/trang)
  const totalPages = Math.ceil(allPromotions.length / ITEMS_PER_PAGE);

  // Lấy promotions hiển thị cho desktop
  const visiblePromotions = allPromotions.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Chuyển trang desktop
  const goToNextPage = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
      setIsAnimating(false);
    }, 300);
  }, [totalPages]);

  const goToPage = (pageIndex) => {
    if (pageIndex !== currentPage) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(pageIndex);
        setIsAnimating(false);
      }, 300);
    }
  };

  // Mobile: Chuyển slide
  const goToNextMobileSlide = useCallback(() => {
    setCurrentMobileIndex((prev) => (prev + 1) % allPromotions.length);
  }, [allPromotions.length]);

  const goToPrevMobileSlide = useCallback(() => {
    setCurrentMobileIndex((prev) =>
      prev === 0 ? allPromotions.length - 1 : prev - 1
    );
  }, [allPromotions.length]);

  // Touch handlers cho swipe
  const handleTouchStart = (e) => {
    // Reset auto-slide timer khi user touch
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isSwipeLeft = distance > SWIPE_THRESHOLD;
    const isSwipeRight = distance < -SWIPE_THRESHOLD;

    if (isSwipeLeft && allEvents.length > 1) {
      goToNextMobileSlide();
    }
    if (isSwipeRight && allEvents.length > 1) {
      goToPrevMobileSlide();
    }

    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);

    // Restart auto-slide
    startAutoSlide();
  };

  // Auto-slide function
  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
    if (allPromotions.length > 1) {
      autoSlideRef.current = setInterval(() => {
        goToNextMobileSlide();
      }, AUTO_ROTATE_INTERVAL_MOBILE);
    }
  }, [allPromotions.length, goToNextMobileSlide]);

  // Auto-rotate cho desktop
  useEffect(() => {
    if (isMobile || totalPages <= 1) return;

    const interval = setInterval(() => {
      goToNextPage();
    }, AUTO_ROTATE_INTERVAL_DESKTOP);

    return () => clearInterval(interval);
  }, [totalPages, goToNextPage, isMobile]);

  // Auto-rotate cho mobile
  useEffect(() => {
    if (!isMobile || allPromotions.length <= 1) return;

    startAutoSlide();

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [isMobile, allPromotions.length, startAutoSlide]);

  const handlePromotionClick = (slug) => {
    navigate(`/uu-dai/${slug}`);
  };

  // Render skeleton
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[...Array(isMobile ? 1 : 4)].map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Skeleton
            variant="rectangular"
            sx={{
              height: { xs: 400, sm: CARD_HEIGHT },
              borderRadius: 1,
              maxWidth: { xs: 300, sm: CARD_WIDTH },
              mx: 'auto'
            }}
          />
          <Skeleton width="80%" sx={{ mt: 1.5, mx: 'auto' }} />
        </Grid>
      ))}
    </Grid>
  );

  // Không hiển thị section nếu không có promotions
  if (!loading && allPromotions.length === 0) {
    return null;
  }

  return (
    <Box sx={styles.section}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ ...styles.sectionTitle, color: '#EA3B92' }}>
            ƯU ĐÃI
          </Typography>
          <Typography
            sx={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.85)',
              mt: 1,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
              px: { xs: 2, md: 0 }
            }}
          >
            Hệ thống rạp NMN Cinema luôn là cụm rạp có nhiều chương trình ưu đãi nổi bật, cập nhật thường xuyên theo tuần/tháng để khách hàng dễ dàng săn vé rẻ và nhận quà hấp dẫn.
          </Typography>

          {/* Dots indicator - chỉ hiện trên desktop */}
          {!isMobile && totalPages > 1 && (
            <Box sx={styles.dotsContainer}>
              {Array.from({ length: totalPages }).map((_, index) => (
                <Box
                  key={index}
                  component="button"
                  onClick={() => goToPage(index)}
                  sx={{
                    ...styles.dot,
                    ...(index === currentPage ? styles.dotActive : {})
                  }}
                  aria-label={`Page ${index + 1}`}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Loading hoặc Content */}
        {
          loading ? renderSkeletons() : (
            <>
              {/* Mobile: Swipe Carousel */}
              {isMobile ? (
                <Box
                  sx={styles.mobileCarousel}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Slider - không có nút điều hướng */}
                  <Box
                    sx={{
                      ...styles.mobileSlider,
                      transform: `translateX(-${currentMobileIndex * 100}%)`
                    }}
                  >
                    {allPromotions.map((promo) => (
                      <Box key={promo._id} sx={styles.mobileSlide}>
                        <Card
                          sx={styles.mobileCard}
                          onClick={() => handlePromotionClick(promo.slug)}
                        >
                          <Box sx={{
                            ...styles.imageContainer,
                            width: '100%'
                          }}>
                            <PromotionImage src={promo.thumbnailUrl} alt={promo.title} />
                          </Box>
                          <Typography sx={{ ...styles.title, textAlign: 'left' }}>
                            {promo.title}
                          </Typography>
                        </Card>
                      </Box>
                    ))}
                  </Box>

                  {/* Hint swipe - hiển thị nhẹ ở lần đầu */}
                  {allPromotions.length > 1 && (
                    <Typography
                      sx={{
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.75rem',
                        mt: 1,
                        fontStyle: 'italic'
                      }}
                    >
                      ← Vuốt để xem thêm →
                    </Typography>
                  )}
                </Box>
              ) : (
                /* Desktop: Grid 4 cards */
                <Grid
                  container
                  spacing={3}
                  sx={{
                    ...styles.gridContainer,
                    opacity: isAnimating ? 0 : 1
                  }}
                >
                  {visiblePromotions.map((promo) => (
                    <Grid item xs={6} sm={6} md={3} key={promo._id}>
                      <Card
                        sx={styles.card}
                        onClick={() => handlePromotionClick(promo.slug)}
                      >
                        <Box sx={styles.imageContainer}>
                          <PromotionImage src={promo.thumbnailUrl} alt={promo.title} />
                        </Box>
                        <Typography sx={styles.title}>
                          {promo.title}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )
        }
      </Container >
    </Box >
  );
}

export default PromotionSection;
