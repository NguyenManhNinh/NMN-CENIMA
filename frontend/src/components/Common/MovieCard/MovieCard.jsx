import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Rating,
  Fade
} from '@mui/material';
import {
  PlayCircle as PlayIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
// Background image
import filmBackground from '../../../assets/images/film-bg.png';

// STYLES
const styles = {
  // Card container
  card: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
    backgroundColor: '#fff',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
    }
  },
  // Container cho poster và overlay
  mediaContainer: {
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: '2/3', // Tỷ lệ poster chuẩn - ảnh sẽ hiển thị đẹp không bị cắt nhiều
    backgroundColor: '#1a3a5c', // Background tối để tránh flash trắng
    '&:hover .overlay': {
      opacity: 1
    }
  },
  // Poster phim
  media: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    userSelect: 'none',
    pointerEvents: 'none'  // Ngăn kéo thả ảnh
  },
  // Nhãn độ tuổi
  ageRating: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontWeight: 'bold',
    fontSize: '0.75rem'
  },
  // Overlay khi hover
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.5,
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  // Nút action trong overlay
  overlayButton: {
    minWidth: 130,
    fontWeight: 600,
    textTransform: 'none'
  },
  // Nội dung card (tên phim, rating)
  content: {
    textAlign: 'left',
    py: 0.5,
  },
  // Tên phim
  title: {
    fontWeight: 800,
    fontSize: '1rem',
    mb: 2,
    fontFamily: '"Space Grotesk", "Noto Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif', fontFamily: 'Space Grotesk',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
};

// HELPER - Lấy màu cho nhãn độ tuổi
const getAgeRatingColor = (rating) => {
  const colors = {
    'P': 'success',    // Phổ biến - xanh lá
    'C13': 'info',     // 13+ - xanh dương
    'C16': 'warning',  // 16+ - cam
    'C18': 'error'     // 18+ - đỏ
  };
  return colors[rating] || 'default';
};

// MOVIE CARD COMPONENT
function MovieCard({ movie, onTrailerClick }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // HANDLERS

  // Click nút Mua vé
  const handleBuyTicket = (e) => {
    e.stopPropagation(); // Ngăn trigger click card
    navigate(`/dat-ve/${movie._id}/lich-chieu-phim`);
  };

  // Click nút Xem trailer
  const handleTrailer = (e) => {
    e.stopPropagation();
    if (onTrailerClick) {
      onTrailerClick(movie);
    }
  };

  // Click vào card -> Chi tiết phim
  const handleCardClick = () => {
    navigate(`/chi-tiet-phim/${movie._id}`);
  };

  // RENDER
  return (
    <Card
      sx={styles.card}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* === POSTER VÀ OVERLAY === */}
      <Box sx={styles.mediaContainer}>
        {/* Poster */}
        <CardMedia
          component="img"
          image={movie.posterUrl || 'https://placehold.co/400x600/1a3a5c/ffffff?text=No+Image'}
          alt={movie.title}
          sx={styles.media}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x600/1a3a5c/ffffff?text=No+Image';
          }}
        />

        {/* Nhãn độ tuổi */}
        <Chip
          label={movie.ageRating}
          color={getAgeRatingColor(movie.ageRating)}
          size="small"
          sx={styles.ageRating}
        />

        {/* Overlay hiển thị khi hover */}
        <Fade in={isHovered}>
          <Box className="overlay" sx={styles.overlay}>
            {/* Nút Mua vé */}
            <Button
              variant="contained"
              color="warning"
              startIcon={<TicketIcon />}
              onClick={handleBuyTicket}
              sx={styles.overlayButton}
            >
              Mua vé
            </Button>

            {/* Nút Xem trailer */}
            {movie.trailerUrl && (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<PlayIcon />}
                onClick={handleTrailer}
                sx={{
                  ...styles.overlayButton,
                  color: '#fff',
                  borderColor: '#fff',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: '#fff'
                  }
                }}
              >
                Trailer
              </Button>
            )}
          </Box>
        </Fade>
      </Box>

      {/* === NỘI DUNG: Tên phim, đánh giá === */}
      <CardContent sx={styles.content}>
        <Typography sx={styles.title} title={movie.title}>
          {movie.title}
        </Typography>

        {/* Rating (nếu có) */}
        <Rating
          value={4}
          size="small"
          readOnly
          precision={0.5}
        />
      </CardContent>
    </Card>
  );
}

export default MovieCard;
