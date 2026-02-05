import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Typography,
  IconButton,
  Collapse,
  Paper,
  Skeleton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Hằng số
const ITEMS_PER_PAGE = 8; // 4 cột x 2 hàng

// Định nghĩa styles
const styles = {
  accordionCard: {
    bgcolor: '#fff',
    borderRadius: 0,
    mb: 2,
    overflow: 'visible', // Cho phép arrow thò ra ngoài
    boxShadow: 'none'
  },
  accordionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    cursor: 'pointer',
    '&:hover': {
      bgcolor: '#fafafa'
    }
  },
  accordionHeaderDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      bgcolor: 'transparent'
    }
  },
  accordionTitle: {
    fontWeight: 500,
    color: '#0c0d0dff',
    fontSize: '1.2rem',
    fontFamily: '"Nunito Sans", sans-serif'
  },
  accordionSelectedText: {
    fontSize: '0.85rem',
    color: '#F5A623',
    mt: 0.5,
    fontFamily: '"Nunito Sans", sans-serif'
  },
  accordionIconBtn: {
    bgcolor: '#1a2c50',
    color: '#fff',
    width: 36,
    height: 36,
    '&:hover': {
      bgcolor: '#0f1d38'
    },
    '&.Mui-disabled': {
      bgcolor: '#ccc',
      color: '#999'
    }
  },
  accordionContent: {
    px: 2,
    pb: 2,
    pt: 1,
    overflow: 'visible', // Cho phép arrows thò ra
  },

  // Container bao ngoài cho carousel
  carouselShell: {
    position: 'relative',
    width: '100%',
    overflow: 'visible',
  },

  // Khung nhìn carousel - không padding
  carouselViewport: {
    width: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },

  // Container chứa các trang, dùng translateX để chuyển trang
  pagesContainer: {
    display: 'flex',
    width: '100%',
    willChange: 'transform',
    alignItems: 'flex-start', // Không stretch chiều cao page
  },

  // Mỗi trang chiếm 100% chiều rộng viewport
  page: {
    flex: '0 0 100%',
    alignSelf: 'flex-start', // Page tự fit-content
    display: 'grid',
    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
    gridTemplateRows: { xs: 'repeat(4, auto)', sm: 'repeat(2, auto)' },
    gap: { xs: 1, sm: 1.5 },
    px: { xs: 3.5, sm: 4 },
    boxSizing: 'border-box',
    alignContent: 'start', // Tránh grid dãn hàng
  },

  // Style cho card phim
  movieCard: {
    borderRadius: 1.5,
    overflow: 'hidden',
    cursor: 'pointer',
    border: '2px solid transparent',
    bgcolor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    // Bỏ height: 100% để card không bị kéo theo page
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      transform: 'translateY(-2px)'
    }
  },
  posterWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '150%', // 2:3
    overflow: 'hidden'
  },
  poster: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bgcolor: 'rgba(245, 166, 35, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkIcon: {
    fontSize: { xs: 36, sm: 48 },
    color: '#fff',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
  },

  // Tiêu đề phim: giới hạn 2 dòng với chiều cao cố định
  movieTitle: {
    px: 1,
    py: 0.75,
    boxSizing: 'border-box', // Quan trọng
    fontSize: { xs: '0.78rem', sm: '0.85rem' },
    fontWeight: 600,
    color: '#222',
    textAlign: 'left',
    lineHeight: 1.25,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    height: { xs: 46, sm: 50 }, // Chiều cao cố định (tính luôn padding)
  },

  // Nút mũi tên điều hướng - chỉ icon, không background
  arrowBase: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    width: 48,
    height: 48,
    p: 0,
    bgcolor: 'transparent', // Không có background
    boxShadow: 'none',
    color: '#666', // Màu icon
    '&:hover': {
      bgcolor: 'transparent',
      color: '#333', // Đậm hơn khi hover
    },
  },
  arrowLeft: {
    left: 0,
    transform: 'translate(-50%, -50%)',
  },
  arrowRight: {
    right: 0,
    transform: 'translate(50%, -50%)',
  },

  // Trạng thái rỗng và đang tải
  emptyState: {
    py: 4,
    textAlign: 'center',
    color: '#999'
  },
  loadingPage: {
    display: 'grid',
    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
    gridTemplateRows: { xs: 'repeat(4, auto)', sm: 'repeat(2, auto)' },
    gap: { xs: 1.5, sm: 2 },
    width: '100%',
    px: 1
  },
  loadingCard: {
    borderRadius: 1.5,
    overflow: 'hidden'
  },
};

// Hàm helper: chia mảng thành các trang
function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function MoviePickerAccordion({
  movies = [],
  selectedMovie,
  onSelectMovie,
  disabled = false,
  expanded = false,
  onToggle,
  loading = false
}) {
  const [currentPage, setCurrentPage] = useState(0);

  // Chia danh sách phim thành các trang (8 phim/trang)
  const pages = useMemo(() => chunkArray(movies, ITEMS_PER_PAGE), [movies]);
  const totalPages = pages.length;

  // Điều hướng carousel - vòng lặp vô hạn
  const goToPrev = useCallback(() => {
    if (totalPages <= 1) return;
    setCurrentPage(prev => (prev === 0 ? totalPages - 1 : prev - 1));
  }, [totalPages]);

  const goToNext = useCallback(() => {
    if (totalPages <= 1) return;
    setCurrentPage(prev => (prev >= totalPages - 1 ? 0 : prev + 1));
  }, [totalPages]);

  // Reset về trang đầu khi danh sách phim thay đổi
  useEffect(() => {
    setCurrentPage(0);
  }, [movies]);

  // Lấy thông tin phim đã chọn
  const selectedMovieData = movies.find(m => m._id === selectedMovie);

  // Xử lý khi click vào phim
  const handleMovieClick = (movieId) => {
    if (onSelectMovie) {
      onSelectMovie(movieId);
    }
  };

  // Render skeleton loading
  const renderSkeleton = () => (
    <Box sx={styles.loadingPage}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Box key={i} sx={styles.loadingCard}>
          <Skeleton
            variant="rectangular"
            sx={{
              width: '100%',
              paddingTop: '150%',
              borderRadius: 1.5
            }}
          />
          <Skeleton variant="text" sx={{ mt: 0.5, mx: 1 }} />
          <Skeleton variant="text" sx={{ mx: 1, width: '60%' }} />
        </Box>
      ))}
    </Box>
  );

  // Render carousel phim
  const renderMovieCarousel = () => {
    if (movies.length === 0) {
      return (
        <Box sx={styles.emptyState}>
          <Typography>Không có phim đang chiếu</Typography>
        </Box>
      );
    }

    return (
      <Box sx={styles.carouselShell}>
        {/* LEFT ARROW - Nửa viên */}
        <IconButton
          onClick={goToPrev}
          sx={{ ...styles.arrowBase, ...styles.arrowLeft }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* VIEWPORT */}
        <Box sx={styles.carouselViewport}>
          <Box
            sx={{
              ...styles.pagesContainer,
              transform: `translateX(-${currentPage * 100}%)`,
              transition: 'transform 0.35s ease',
            }}
          >
            {pages.map((pageMovies, pageIndex) => (
              <Box key={pageIndex} sx={styles.page}>
                {pageMovies.map((movie) => {
                  const isSelected = selectedMovie === movie._id;
                  return (
                    <Card
                      key={movie._id}
                      sx={{
                        ...styles.movieCard,
                        ...(isSelected ? styles.movieCardSelected : {}),
                      }}
                      onClick={() => handleMovieClick(movie._id)}
                    >
                      <CardActionArea sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={styles.posterWrapper}>
                          <CardMedia
                            component="img"
                            image={movie.posterUrl || movie.poster || '/placeholder-movie.jpg'}
                            alt={movie.title}
                            sx={styles.poster}
                          />
                        </Box>

                        <Typography sx={styles.movieTitle} title={movie.title}>
                          {movie.title}
                        </Typography>
                      </CardActionArea>
                    </Card>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>

        {/* RIGHT ARROW - Nửa viên */}
        <IconButton
          onClick={goToNext}
          sx={{ ...styles.arrowBase, ...styles.arrowRight }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    );
  };

  return (
    <Paper sx={styles.accordionCard}>
      {/* Phần header của accordion */}
      <Box
        sx={{
          ...styles.accordionHeader,
          ...(disabled ? styles.accordionHeaderDisabled : {})
        }}
        onClick={() => !disabled && onToggle && onToggle()}
      >
        <Box>
          <Typography sx={styles.accordionTitle}>
            Chọn phim{selectedMovieData ? ` - ${selectedMovieData.title}` : ''}
          </Typography>
        </Box>
        <IconButton
          sx={{
            ...styles.accordionIconBtn,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s'
          }}
          disabled={disabled}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </Box>

      {/* Nội dung accordion */}
      <Collapse in={expanded && !disabled}>
        <Box sx={styles.accordionContent}>
          {loading ? renderSkeleton() : renderMovieCarousel()}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default MoviePickerAccordion;
