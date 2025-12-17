import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

// STYLES - Galaxy Cinema Style đơn giản, ổn định
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    py: { xs: 1, md: 2 }
  },
  slidesWrapper: {
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.5s ease-in-out'
  },
  slide: {
    flexShrink: 0,
    width: { xs: '85%', md: '70%' },
    position: 'relative',
    cursor: 'pointer',
    transition: 'transform 0.3s, opacity 0.3s',
    mx: { xs: 0.5, md: 1 },
    borderRadius: 1,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  },
  slideActive: {
    transform: 'scale(1)',
    opacity: 1,
    zIndex: 2
  },
  slideInactive: {
    transform: 'scale(0.92)',
    opacity: 0.5,
    zIndex: 1
  },
  image: {
    width: '100%',
    height: 'auto',
    aspectRatio: '21/9',
    objectFit: 'cover',
    display: 'block',
    backgroundColor: '#1a3a5c',
    userSelect: 'none'  // Ngăn kéo thả ảnh
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    width: { xs: 36, md: 45 },
    height: { xs: 36, md: 45 },
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.7)'
    }
  },
  prevButton: {
    left: { xs: 5, md: 15 }
  },
  nextButton: {
    right: { xs: 5, md: 15 }
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.3s',
    border: 'none',
    padding: 0
  },
  dotActive: {
    backgroundColor: '#f26b38',
    transform: 'scale(1.2)'
  }
};

function BannerSlider({ banners = [], autoplay = true, autoplaySpeed = 4000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplayRef = useRef(null);

  // Autoplay
  useEffect(() => {
    if (autoplay && banners.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, autoplaySpeed);
    }
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [autoplay, autoplaySpeed, banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  if (!banners.length) return null;

  // Center mode transform
  const slideWidth = 72;
  const centerOffset = (100 - slideWidth) / 2;
  const translateX = -currentIndex * slideWidth + centerOffset;

  return (
    <Box sx={styles.container}>
      <Box
        sx={{
          ...styles.slidesWrapper,
          transform: `translateX(${translateX}%)`
        }}
      >
        {banners.map((banner, index) => (
          <Box
            key={banner._id}
            component={banner.link ? Link : 'div'}
            to={banner.link || '#'}
            sx={{
              ...styles.slide,
              ...(index === currentIndex ? styles.slideActive : styles.slideInactive)
            }}
          >
            <Box
              component="img"
              src={banner.imageUrl}
              alt={banner.title}
              sx={styles.image}
              loading="lazy"
              onError={(e) => {
                if (!e.target.dataset.fallback) {
                  e.target.dataset.fallback = 'true';
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0NTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFhM2E1YyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OTU4gQ2luZW1hPC90ZXh0Pjwvc3ZnPg==';
                }
              }}
            />
          </Box>
        ))}
      </Box>

      {banners.length > 1 && (
        <>
          <IconButton onClick={handlePrev} sx={{ ...styles.navButton, ...styles.prevButton }}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={handleNext} sx={{ ...styles.navButton, ...styles.nextButton }}>
            <ChevronRightIcon />
          </IconButton>
        </>
      )}

      {banners.length > 1 && (
        <Box sx={styles.dotsContainer}>
          {banners.map((_, index) => (
            <Box
              key={index}
              component="button"
              onClick={() => handleDotClick(index)}
              sx={{
                ...styles.dot,
                ...(index === currentIndex ? styles.dotActive : {})
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default BannerSlider;
