import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
// STYLES - Style đơn giản, ổn định
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5'
  },
  slidesWrapper: {
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.5s ease-in-out'
  },
  slide: {
    flexShrink: 0,
    width: '100%',
    position: 'relative',
    cursor: 'pointer',
    transition: 'opacity 0.5s ease-in-out'
  },
  slideActive: {
    opacity: 1,
    zIndex: 2
  },
  slideInactive: {
    opacity: 1,
    zIndex: 1
  },
  image: {
    width: '100%',
    height: 'auto',
    // aspectRatio: '21/9',
    objectFit: 'cover',
    display: 'block',
    backgroundColor: 'white',
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
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 1,
    zIndex: 10
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.3s',
    border: '2px solid white',
    padding: 0
  },
  dotActive: {
    backgroundColor: '#1a3a5c',
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

  // Nếu không có banner, hiển thị placeholder full width
  if (!banners || banners.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: { xs: 200, sm: 300, md: 400 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a3a5c 0%, #0d1b2a 100%)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          {/* <Box
            component="img"
            src={LogoNMNCinema}
            alt="NMN Cinema"
            sx={{ width: 120, height: 'auto', opacity: 0.5, mb: 2 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          /> */}
        </Box>
      </Box>
    );
  }

  const translateX = -currentIndex * 100;

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
