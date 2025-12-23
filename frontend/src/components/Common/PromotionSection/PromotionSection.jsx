import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Skeleton
} from '@mui/material';

// API
import { getAllEventsAPI } from '../../../apis/cmsApi';

// Background image
import filmBackground from '../../../assets/images/background-uudai.png';

// CONSTANTS
const EVENTS_PER_PAGE = 4;       // Số events hiển thị mỗi lần (4 cards)
const AUTO_ROTATE_INTERVAL = 20000; // 20 giây
const CARD_WIDTH = 264.76;       // Chiều rộng card
const CARD_HEIGHT = 397.14;      // Chiều cao card

// STYLES
const styles = {
  section: {
    py: 5,
    backgroundImage: `url(${filmBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 3
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
    gap: 1
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#F9F400',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: 'none',
    padding: 0
  },
  dotActive: {
    backgroundColor: '#5BBD2B',
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
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'relative',
    backgroundColor: '#e0e0e0' // Placeholder color
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'scale(1.05)'
    }
  },
  title: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1a3a5c',
    mt: 1.5,
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: '2.8em'
  },
  emptyState: {
    textAlign: 'center',
    py: 5,
    color: '#666'
  }
};

// PROMOTION SECTION COMPONENT
function PromotionSection() {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load events từ API
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const response = await getAllEventsAPI();
        if (response?.data?.events) {
          // Lọc chỉ lấy events đang diễn ra hoặc sắp diễn ra
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

  // Tính số trang (mỗi trang 4 events)
  const totalPages = Math.ceil(allEvents.length / EVENTS_PER_PAGE);

  // Lấy events hiển thị theo trang hiện tại
  const visibleEvents = allEvents.slice(
    currentPage * EVENTS_PER_PAGE,
    (currentPage + 1) * EVENTS_PER_PAGE
  );

  // Chuyển sang trang tiếp theo
  const goToNextPage = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
      setIsAnimating(false);
    }, 300);
  }, [totalPages]);

  // Chuyển đến trang cụ thể
  const goToPage = (pageIndex) => {
    if (pageIndex !== currentPage) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(pageIndex);
        setIsAnimating(false);
      }, 300);
    }
  };

  // Auto-rotate mỗi 20 giây
  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      goToNextPage();
    }, AUTO_ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, [totalPages, goToNextPage]);

  const handleEventClick = (eventId) => {
    navigate(`/khuyen-mai/${eventId}`);
  };

  // Render skeleton khi loading
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[...Array(4)].map((_, index) => (
        <Grid item xs={6} sm={6} md={3} key={index}>
          <Skeleton
            variant="rectangular"
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton width="80%" sx={{ mt: 1.5 }} />
          <Skeleton width="60%" />
        </Grid>
      ))}
    </Grid>
  );

  // Không hiển thị section nếu không có events và không loading
  if (!loading && allEvents.length === 0) {
    return null; // Ẩn section khi không có ưu đãi
  }

  return (
    <Box sx={styles.section}>
      <Container maxWidth="lg">
        {/* Header với dots pagination */}
        <Box sx={styles.sectionHeader}>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
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
                lineHeight: 1.6
              }}
            >
              Hệ thống rạp NMN Cinema luôn là cụm rạp có nhiều chương trình ưu đãi khuyến mại nổi bật, cập nhật thường xuyên theo tuần/tháng để khách hàng dễ dàng săn vé rẻ và nhận quà hấp dẫn.
            </Typography>
          </Box>
          {/* Dots indicator */}
          {totalPages > 1 && (
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

        {/* Loading skeleton hoặc Grid events */}
        {loading ? renderSkeletons() : (
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
                  {/* Image */}
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

                  {/* Title */}
                  <Typography sx={styles.title}>
                    {event.title}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default PromotionSection;
