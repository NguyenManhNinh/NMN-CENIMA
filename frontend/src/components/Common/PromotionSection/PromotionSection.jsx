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

// API
import { getAllEventsAPI } from '../../../apis/cmsApi';

// Background image
import filmBackground from '../../../assets/images/background-uudai.png';

// CONSTANTS
const EVENTS_PER_PAGE = 4;
const AUTO_ROTATE_INTERVAL_DESKTOP = 20000; // 20 giây cho desktop
const AUTO_ROTATE_INTERVAL_MOBILE = 4000;   // 4 giây cho mobile
const CARD_WIDTH = 264.76;
const CARD_HEIGHT = 397.14;
const SWIPE_THRESHOLD = 50; // Ngưỡng swipe tối thiểu (px)

// STYLES
const styles = {
  section: {
    py: 5,
    backgroundImage: `url(${filmBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: { xs: '1.25rem', md: '1.5rem' },
    color: '#1a3a5c',
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
    backgroundColor: '#ccc',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: 'none',
    padding: 0
  },
  dotActive: {
    backgroundColor: '#1a3a5c',
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
    width: { xs: '100%', sm: CARD_WIDTH },
    height: { xs: 'auto', sm: CARD_HEIGHT },
    aspectRatio: { xs: '2/3', sm: 'auto' },
    borderRadius: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s'
  },
  title: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#1a3a5c',
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
    userSelect: 'none' // Ngăn select text khi swipe
  }
};

// PROMOTION SECTION COMPONENT
function PromotionSection() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [allEvents, setAllEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Touch/Swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const autoSlideRef = useRef(null);

  // Load events từ API
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const response = await getAllEventsAPI();
        if (response?.data?.events) {
          const now = new Date();
          const activeEvents = response.data.events.filter(event => {
            const endDate = new Date(event.endAt);
            return endDate >= now || event.status !== 'ENDED';
          });
          setAllEvents(activeEvents);
        } else {
          setAllEvents([]);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách ưu đãi:', error);
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Tính số trang desktop (4 events/trang)
  const totalPages = Math.ceil(allEvents.length / EVENTS_PER_PAGE);

  // Lấy events hiển thị cho desktop
  const visibleEvents = allEvents.slice(
    currentPage * EVENTS_PER_PAGE,
    (currentPage + 1) * EVENTS_PER_PAGE
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
    setCurrentMobileIndex((prev) => (prev + 1) % allEvents.length);
  }, [allEvents.length]);

  const goToPrevMobileSlide = useCallback(() => {
    setCurrentMobileIndex((prev) =>
      prev === 0 ? allEvents.length - 1 : prev - 1
    );
  }, [allEvents.length]);

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
    if (allEvents.length > 1) {
      autoSlideRef.current = setInterval(() => {
        goToNextMobileSlide();
      }, AUTO_ROTATE_INTERVAL_MOBILE);
    }
  }, [allEvents.length, goToNextMobileSlide]);

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
    if (!isMobile || allEvents.length <= 1) return;

    startAutoSlide();

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [isMobile, allEvents.length, startAutoSlide]);

  const handleEventClick = (eventId) => {
    navigate(`/khuyen-mai/${eventId}`);
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

  // Không hiển thị section nếu không có events
  if (!loading && allEvents.length === 0) {
    return null;
  }

  return (
    <Box sx={styles.section}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" sx={styles.sectionTitle}>
            ƯU ĐÃI - KHUYẾN MẠI
          </Typography>
          <Typography
            sx={{
              fontSize: '0.95rem',
              color: '#666',
              mt: 1,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
              px: { xs: 2, md: 0 }
            }}
          >
            Hệ thống rạp NMN Cinema luôn là cụm rạp có nhiều chương trình ưu đãi khuyến mại nổi bật, cập nhật thường xuyên theo tuần/tháng để khách hàng dễ dàng săn vé rẻ và nhận quà hấp dẫn.
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
        {loading ? renderSkeletons() : (
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
                  {allEvents.map((event) => (
                    <Box key={event._id} sx={styles.mobileSlide}>
                      <Card
                        sx={styles.mobileCard}
                        onClick={() => handleEventClick(event._id)}
                      >
                        <Box sx={{
                          ...styles.imageContainer,
                          width: '100%',
                          aspectRatio: '2/3',
                          height: 'auto'
                        }}>
                          <Box
                            component="img"
                            src={event.bannerUrl || 'https://placehold.co/400x600/1a3a5c/ffffff?text=No+Image'}
                            alt={event.title}
                            sx={styles.image}
                            draggable={false}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/400x600/1a3a5c/ffffff?text=No+Image';
                            }}
                          />
                        </Box>
                        <Typography sx={{ ...styles.title, textAlign: 'center' }}>
                          {event.title}
                        </Typography>
                      </Card>
                    </Box>
                  ))}
                </Box>

                {/* Hint swipe - hiển thị nhẹ ở lần đầu */}
                {allEvents.length > 1 && (
                  <Typography
                    sx={{
                      textAlign: 'center',
                      color: '#999',
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
                {visibleEvents.map((event) => (
                  <Grid item xs={6} sm={6} md={3} key={event._id}>
                    <Card
                      sx={styles.card}
                      onClick={() => handleEventClick(event._id)}
                    >
                      <Box sx={styles.imageContainer}>
                        <Box
                          component="img"
                          src={event.bannerUrl || 'https://placehold.co/400x600/1a3a5c/ffffff?text=No+Image'}
                          alt={event.title}
                          className="event-image"
                          sx={styles.image}
                          draggable={false}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/400x600/1a3a5c/ffffff?text=No+Image';
                          }}
                        />
                      </Box>
                      <Typography sx={styles.title}>
                        {event.title}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default PromotionSection;
