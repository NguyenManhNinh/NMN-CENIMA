import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card
} from '@mui/material';

// Mock data - sẽ thay bằng API
import { getOngoingEvents } from '../../../mocks/mockEvents';

// CONSTANTS
const EVENTS_PER_PAGE = 3;       // Số events hiển thị mỗi lần
const AUTO_ROTATE_INTERVAL = 20000; // 20 giây

// STYLES
const styles = {
  section: {
    py: 5,
    backgroundColor: '#f5f5f5'
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
    pl: 2,
    borderLeft: '4px solid #1a3a5c',
    letterSpacing: 1
  },
  dotsContainer: {
    display: 'flex',
    gap: 1
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 64, 93, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: 'none',
    padding: 0
  },
  dotActive: {
    backgroundColor: '#00405d',
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
    aspectRatio: '16/9',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
    color: '#333',
    mt: 1.5,
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: '2.8em'
  }
};

// PROMOTION SECTION COMPONENT
function PromotionSection() {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load events
  useEffect(() => {
    const ongoingEvents = getOngoingEvents();
    setAllEvents(ongoingEvents);
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
    navigate(`/events/${eventId}`);
  };

  return (
    <Box sx={styles.section}>
      <Container maxWidth="lg">
        {/* Header với dots pagination */}
        <Box sx={styles.sectionHeader}>
          <Typography variant="h5" component="h2" sx={styles.sectionTitle}>
            ƯU ĐÃI
          </Typography>

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

        {/* Grid 4 cards với fade animation */}
        <Grid
          container
          spacing={3}
          sx={{
            ...styles.gridContainer,
            opacity: isAnimating ? 0 : 1
          }}
        >
          {visibleEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card
                sx={styles.card}
                onClick={() => handleEventClick(event._id)}
              >
                {/* Image */}
                <Box sx={styles.imageContainer}>
                  <Box
                    component="img"
                    src={event.bannerUrl}
                    alt={event.title}
                    className="event-image"
                    sx={styles.image}
                    draggable={false}
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
      </Container>
    </Box>
  );
}

export default PromotionSection;

