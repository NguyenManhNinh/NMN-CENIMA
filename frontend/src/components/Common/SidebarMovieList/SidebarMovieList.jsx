import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import LocalActivityOutlinedIcon from '@mui/icons-material/LocalActivityOutlined';

/**
 * Sidebar "Phim đang chiếu" – horizontal layout
 * @param {Object[]} movies - Danh sách phim
 * @param {number}   [limit=5] - Số phim hiển thị
 * @param {string}   [accentColor='#f5a623'] - Màu accent (badge, button)
 */
function SidebarMovieList({ movies = [], limit = 5, accentColor = '#f5a623' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {movies.slice(0, limit).map((movie) => (
        <SidebarMovieCard key={movie._id} movie={movie} accentColor={accentColor} />
      ))}
    </Box>
  );
}

function SidebarMovieCard({ movie, accentColor }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = movie.posterUrl || movie.bannerUrl;
  const showFallback = !imgSrc || imgError;

  return (
    <Box
      component={Link}
      to={`/dat-ve/${movie.slug}`}
      sx={{
        textDecoration: 'none',
        display: 'flex',
        gap: 1.5,
        p: 1,
        borderRadius: 1,
        transition: 'background 0.2s',
        '&:hover': { bgcolor: '#f5f5f5' },
        '&:hover .poster-overlay': { opacity: 1 }
      }}
    >
      {/* Poster */}
      <Box sx={{
        width: 80, minWidth: 80, height: 120,
        borderRadius: 1, overflow: 'hidden',
        bgcolor: '#1c1c1c', flexShrink: 0,
        position: 'relative'
      }}>
        {showFallback ? (
          <Box sx={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(145deg, #1c1c1c 0%, #2a2a2a 50%, #1c1c1c 100%)',
            gap: 0.5
          }}>
            <LocalActivityOutlinedIcon sx={{ fontSize: '1.5rem', color: 'rgba(245,166,35,0.5)' }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: 1 }}>
              No poster
            </Typography>
          </Box>
        ) : (
          <Box
            component="img"
            src={imgSrc}
            alt={movie.title}
            onError={() => setImgError(true)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Hover Overlay */}
        <Box className="poster-overlay" sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          bgcolor: 'rgba(0,0,0,0.55)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.25s'
        }}>
          <Button variant="contained" size="small" sx={{
            bgcolor: accentColor, color: '#fff', fontWeight: 700,
            textTransform: 'none', fontSize: '10px',
            px: 1.5, py: 0.4, minWidth: 0, lineHeight: 1.4,
            '&:hover': { bgcolor: '#e09520' }
          }}>
            Mua vé
          </Button>
        </Box>
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5 }}>
        <Typography sx={{
          fontWeight: 700, fontSize: '13px', color: '#333',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4
        }}>
          {movie.title}
        </Typography>

        {movie.duration > 0 && (
          <Typography sx={{ fontSize: '11px', color: '#888' }}>
            {movie.duration} phút
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          {movie.ageRating && (
            <Box sx={{
              bgcolor: accentColor, px: 0.75, py: 0.15,
              borderRadius: '3px', display: 'inline-flex', alignItems: 'center'
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '9px' }}>
                {movie.ageRating}
              </Typography>
            </Box>
          )}
          {movie.rating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <StarIcon sx={{ fontSize: 12, color: accentColor }} />
              <Typography sx={{ color: '#666', fontWeight: 600, fontSize: '11px' }}>
                {typeof movie.rating === 'number' ? movie.rating.toFixed(1) : movie.rating}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default SidebarMovieList;
