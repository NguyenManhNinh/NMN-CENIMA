import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Chip,
  Paper,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Dialog,
  DialogContent,
  Rating,
  CircularProgress
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Star as StarIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Movie as MovieIcon,
  ArrowForwardIos as ArrowIcon,
  PlayCircleFilled as PlayIcon,
  Close as CloseIcon,
  StarBorder as StarBorderIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';

// API calls
import { getMovieAPI, getNowShowingMoviesAPI, rateMovieAPI } from '../../../apis/movieApi';
import { getAllShowtimesAPI } from '../../../apis/showtimeApi';
import { getAllCinemasAPI, getCitiesAPI } from '../../../apis/cinemaApi';
import { useAuth } from '../../../contexts/AuthContext';


// ==================== COLORS ====================
const COLORS = {
  primary: '#034EA2',
  orange: '#F5A623',
  dark: '#1a1a2e',
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
  white: '#FFFFFF',
  border: '#E5E5E5',
  bgLight: '#F8F9FA',
  bgCard: '#FFFFFF'
};

// Helper: Generate next 7 days with formatted info
const getNextDays = (count = 7) => {
  const days = [];
  const today = new Date();
  const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Format as YYYY-MM-DD using LOCAL timezone (not UTC)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    days.push({
      date: dateString,
      dayOfWeek: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      month: date.getMonth() + 1
    });
  }
  return days;
};

// ==================== BOOKING PAGE COMPONENT ====================
function BookingPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  // Available dates (next 7 days)
  const availableDates = useMemo(() => getNextDays(7), []);

  // States
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(availableDates[0]?.date || '');
  const [otherMovies, setOtherMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [openRatingModal, setOpenRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [openTrailerModal, setOpenTrailerModal] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);

  // Load movie data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get movie details
        const movieRes = await getMovieAPI(movieId);
        const movieData = movieRes?.data?.movie;
        setMovie(movieData);

        // 2. Get other now showing movies
        const nowShowingRes = await getNowShowingMoviesAPI(5);
        const nowShowingMovies = nowShowingRes?.data?.movies || [];
        setOtherMovies(nowShowingMovies.filter(m => m._id !== movieId).slice(0, 4));

        // 3. Get all cinemas
        const cinemasRes = await getAllCinemasAPI();
        setCinemas(cinemasRes?.data?.cinemas || []);

        // 4. Get all cities for area filter
        const citiesRes = await getCitiesAPI();
        setCities(citiesRes?.data?.cities || []);

      } catch (error) {
        console.error('Error fetching movie data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  // Load showtimes when date changes
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!movieId || !selectedDate) return;
      try {
        const res = await getAllShowtimesAPI({ movieId, date: selectedDate });
        setShowtimes(res?.data?.showtimes || []);
      } catch (error) {
        console.error('Error fetching showtimes:', error);
        setShowtimes([]);
      }
    };

    fetchShowtimes();
  }, [movieId, selectedDate]);

  // Filter showtimes - use showtimes from API state
  const filteredShowtimes = useMemo(() => {
    if (!movie || !showtimes.length) return [];
    return showtimes; // Already filtered by date from API
  }, [showtimes, movie]);

  // Group showtimes by cinema and format
  const groupedShowtimes = useMemo(() => {
    const grouped = {};

    // Get unique cinema IDs from showtimes
    const cinemaIds = [...new Set(filteredShowtimes.map(st => st.cinemaId?._id || st.cinemaId))];

    cinemaIds.forEach(cinemaId => {
      if (selectedCinema !== 'all' && cinemaId !== selectedCinema) return;

      // Find cinema info - from populated data in showtime or from cinemas state
      const cinemaShowtimes = filteredShowtimes.filter(st =>
        (st.cinemaId?._id || st.cinemaId) === cinemaId
      );

      if (cinemaShowtimes.length > 0) {
        // Get cinema info from first showtime or from cinemas state
        const cinemaInfo = cinemaShowtimes[0]?.cinemaId ||
          cinemas.find(c => c._id === cinemaId) ||
          { _id: cinemaId, name: 'NMN Cinema' };

        const byFormat = {};
        cinemaShowtimes.forEach(st => {
          const format = st.format || '2D';
          const language = st.language || 'Phụ đề';
          const key = `${format} ${language}`;
          if (!byFormat[key]) byFormat[key] = [];
          byFormat[key].push(st);
        });
        grouped[cinemaId] = { cinema: cinemaInfo, formats: byFormat };
      }
    });
    return grouped;
  }, [filteredShowtimes, selectedCinema, cinemas]);


  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleShowtimeClick = (showtime) => {
    navigate(`/chon-ghe/${showtime._id}`);
  };

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // Loading
  if (loading) {
    return (
      <Box
        sx={{
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
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src="/NMN_CENIMA_LOGO.png"
          alt="NMN Cinema"
          sx={{ width: 200, height: 200, mb: 1.5, objectFit: 'contain' }}
        />

        {/* Spinning Loader */}
        <CircularProgress
          size={40}
          thickness={2}
          sx={{
            color: '#F5A623',
            mb: 2
          }}
        />

        {/* Loading Text */}
        <Typography
          sx={{
            color: '#FFA500',
            fontSize: '1.2rem',
            fontWeight: 600,
            fontFamily: '"Montserrat","Poppins", "Google Sans", sans-serif',
            letterSpacing: '0.5px'
          }}
        >
          Chờ tôi xíu nhé
        </Typography>
      </Box>
    );
  }

  if (!movie) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3
      }}>
        {/* Animated Film Reel Icon */}
        <Box sx={{
          mb: 4,
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)', opacity: 1 },
            '50%': { transform: 'scale(1.05)', opacity: 0.8 },
            '100%': { transform: 'scale(1)', opacity: 1 }
          }
        }}>
        </Box>

        {/* Error Code */}
        <Typography sx={{
          fontSize: { xs: '4rem', md: '6rem' },
          fontWeight: 800,
          color: 'transparent',
          background: 'linear-gradient(90deg, #F5A623, #FF6B6B)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          fontFamily: '"Montserrat", sans-serif',
          lineHeight: 1,
          mb: 2
        }}>
          404
        </Typography>

        {/* Title */}
        <Typography sx={{
          fontSize: { xs: '1.5rem', md: '2rem' },
          fontWeight: 700,
          color: '#fff',
          fontFamily: '"Nunito Sans", sans-serif',
          mb: 1.5,
          textAlign: 'center'
        }}>
          Không tìm thấy phim
        </Typography>

        {/* Description */}
        <Typography sx={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: '"Nunito Sans", sans-serif',
          mb: 4,
          textAlign: 'center',
          maxWidth: 400
        }}>
          Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            component={Link}
            to="/"
            variant="contained"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '50px',
              background: 'linear-gradient(90deg, #F5A623, #FF6B6B)',
              fontWeight: 600,
              fontSize: '0.95rem',
              fontFamily: '"Nunito Sans", sans-serif',
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(245, 166, 35, 0.4)',
              '&:hover': {
                background: 'linear-gradient(90deg, #e09520, #e55656)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(245, 166, 35, 0.5)'
              },
              transition: 'all 0.3s'
            }}
          >
            Về trang chủ
          </Button>
          <Button
            component={Link}
            to="/phim-dang-chieu"
            variant="outlined"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '50px',
              borderColor: 'rgba(255,255,255,0.3)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.95rem',
              fontFamily: '"Nunito Sans", sans-serif',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#F5A623',
                bgcolor: 'rgba(245, 166, 35, 0.1)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s'
            }}
          >
            Xem phim đang chiếu
          </Button>
        </Box>

        {/* Decorative Elements */}
        <Box sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,107,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }} />
      </Box>
    );
  }

  return (
    <Box className="booking-page" sx={{ bgcolor: COLORS.bgLight, minHeight: '100vh' }}>

      {/* ==================== BANNER TRAILER SECTION ==================== */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 1585.6,
        height: { xs: 280, md: 850 },
        mx: 'auto',
        background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)), url(${movie.bannerUrl || movie.posterUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Play Button*/}
        <IconButton
          onClick={() => movie?.trailerUrl && setOpenTrailerModal(true)}
          sx={{
            width: { xs: 60, md: 80 },
            height: { xs: 60, md: 80 },
            transition: 'all 0.3s',
            cursor: movie?.trailerUrl ? 'pointer' : 'default',
            '&:hover': { transform: 'scale(1.1)' }
          }}
        >
          <PlayIcon sx={{ fontSize: 64, color: 'white' }} />
        </IconButton>
      </Box>

      {/* ==================== MAIN CONTENT SECTION ==================== */}
      <Box sx={{ bgcolor: COLORS.white, pb: 5 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} sx={{ py: 3, alignItems: 'flex-start' }}>

            {/* ===== LEFT COLUMN (8 cols): Poster + Info + Nội dung + Lịch chiếu ===== */}
            <Grid item xs={12} md={8}>
              {/* Inner Grid for Poster + Movie Details */}
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {/* Poster */}
                <Grid item xs={5} sm={4}>
                  <Box
                    component="img"
                    src={movie.posterUrl}
                    alt={movie.title}
                    sx={{
                      width: '100%',
                      maxWidth: { xs: 160, sm: 200, md: 240 },
                      height: { xs: 220, sm: 280, md: 360 },
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      mt: { xs: -5, md: -10 },
                      position: 'relative',
                      zIndex: 10,
                      border: '1px solid white'
                    }}
                  />
                </Grid>

                {/* Movie Details */}
                <Grid item xs={7} sm={8}>
                  {/* Title + Badges */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1, md: 2 }, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.3rem', md: '1.6rem' }, color: COLORS.dark }}>
                      {movie.title}
                    </Typography>
                    <Chip label={movie.ageRating} size="small" sx={{ bgcolor: COLORS.orange, color: '#000', fontWeight: 700, fontSize: { xs: '10px', md: '12px' }, height: { xs: 20, md: 24 } }} />
                  </Box>

                  {/* Meta Row */}
                  <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, mb: { xs: 1.5, md: 2.5 }, flexWrap: 'wrap', color: COLORS.textLight }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon sx={{ fontSize: { xs: 14, md: 20 } }} />
                      <Typography sx={{ fontSize: { xs: '11px', md: '14px' } }}>{movie.duration} Phút</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: { xs: 14, md: 20 } }} />
                      <Typography sx={{ fontSize: { xs: '11px', md: '14px' } }}>{formatDate(movie.releaseDate)}</Typography>
                    </Box>
                    <Box
                      onClick={() => setOpenRatingModal(true)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          color: '#1a3a5c',
                          '& .MuiSvgIcon-root': { color: '#1a3a5c' },
                          '& .MuiTypography-root': { color: '#1a3a5c' }
                        }
                      }}
                    >
                      <StarIcon sx={{ fontSize: { xs: 14, md: 20 }, color: COLORS.orange, transition: 'color 0.2s' }} />
                      <Typography sx={{ fontSize: { xs: '11px', md: '14px' }, fontWeight: 600, transition: 'color 0.2s' }}>
                        {movie.rating}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '11px', md: '14px' }, color: COLORS.textMuted, transition: 'color 0.2s' }}>
                        ({movie.ratingCount || 0} đánh giá)
                      </Typography>
                    </Box>
                    {/* Quốc gia - Mobile only */}
                    <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 1 }}>
                      <Typography sx={{
                        fontSize: '11px',
                        color: '#4A4A4A'
                      }}>
                        Quốc gia:
                      </Typography>
                      <Typography sx={{
                        fontSize: '11px',
                        color: COLORS.text,
                        fontWeight: 500,
                        transition: 'color 0.2s',
                        '&:hover': {
                          color: (movie.country || 'Việt Nam') === 'Việt Nam' ? '#e53935' : COLORS.text
                        },
                      }}>
                        {movie.country || 'Việt Nam'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Details Grid - Desktop only (sm and up) */}
                  <Box sx={{
                    display: { xs: 'none', sm: 'grid' },
                    gridTemplateColumns: '110px 1fr',
                    gap: 1,
                    fontSize: '0.85rem',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                  }}>
                    <Typography sx={{ color: '#4A4A4A', cursor: 'default', transition: 'color 0.2s' }}>Quốc gia:</Typography>
                    <Typography sx={{
                      color: '#333333',
                      cursor: 'default',
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: (movie.country || 'Việt Nam') === 'Việt Nam' ? '#e53935' : '#333333'
                      },

                    }}>
                      {movie.country || 'Việt Nam'}
                    </Typography>

                    <Typography sx={{ color: '#4A4A4A' }}>Nhà sản xuất:</Typography>
                    <Typography sx={{ color: '#333333' }}>{movie.studio || 'NMN Studio'}</Typography>

                    <Typography sx={{ color: '#4A4A4A' }}>Thể loại:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {(!movie.genres || movie.genres.length === 0) ? (
                        <Typography sx={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>Chưa cập nhật</Typography>
                      ) : (
                        movie.genres.map((genre, idx) => {
                          const genreName = typeof genre === 'string' ? genre : genre?.name || '';
                          return (
                            <Chip
                              key={idx}
                              label={genreName}
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                const slug = genreName
                                  ?.toLowerCase()
                                  .normalize('NFD')
                                  .replace(/[\u0300-\u036f]/g, '')
                                  .replace(/đ/g, 'd')
                                  .replace(/Đ/g, 'D')
                                  .replace(/\s+/g, '-')
                                  .replace(/[^\w-]/g, '');
                                navigate(`/the-loai-phim/${slug}`);
                              }}
                              sx={{
                                fontSize: '0.85rem',
                                height: 28,
                                borderRadius: '7px',
                                border: '1px solid #333',
                                color: '#333',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: '#1a3a5c',
                                  color: '#1a3a5c',
                                  bgcolor: 'rgba(26, 58, 92, 0.05)'
                                }
                              }}
                            />
                          );
                        })
                      )}
                    </Box>

                    <Typography sx={{ color: '#4A4A4A' }}>Đạo diễn:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {(() => {
                        // Handle both API (object) and mock (string) formats
                        const directors = typeof movie.director === 'string'
                          ? movie.director.split(',').map(d => d.trim())
                          : movie.director?.name
                            ? [movie.director.name]
                            : [];

                        if (directors.length === 0) {
                          return <Typography sx={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>Chưa cập nhật</Typography>;
                        }

                        return directors.map((directorName, idx) => (
                          <Chip
                            key={idx}
                            label={directorName}
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const slug = directorName
                                ?.toLowerCase()
                                .normalize('NFD')
                                .replace(/[\u0300-\u036f]/g, '')
                                .replace(/đ/g, 'd')
                                .replace(/Đ/g, 'D')
                                .replace(/\s+/g, '-')
                                .replace(/[^\w-]/g, '');
                              navigate(`/dao-dien/${slug}`);
                            }}
                            sx={{
                              fontSize: '0.85rem',
                              height: 28,
                              borderRadius: '7px',
                              border: '1px solid #333',
                              color: '#333',
                              fontWeight: 500,
                              bgcolor: 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: '#1a3a5c',
                                color: '#1a3a5c',
                                bgcolor: 'rgba(26, 58, 92, 0.05)'
                              }
                            }}
                          />
                        ));
                      })()}
                    </Box>

                    <Typography sx={{ color: '#4A4A4A' }}>Diễn viên:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {(!movie.actors || movie.actors.length === 0) ? (
                        <Typography sx={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>Chưa cập nhật</Typography>
                      ) : (
                        movie.actors.slice(0, 3).map((actor, idx) => {
                          const actorName = typeof actor === 'string' ? actor : actor?.name || '';
                          return (
                            <Chip
                              key={idx}
                              label={actorName}
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                const slug = actorName
                                  ?.toLowerCase()
                                  .normalize('NFD')
                                  .replace(/[\u0300-\u036f]/g, '')
                                  .replace(/đ/g, 'd')
                                  .replace(/Đ/g, 'D')
                                  .replace(/\s+/g, '-')
                                  .replace(/[^\w-]/g, '');
                                navigate(`/dien-vien/${slug}`);
                              }}
                              sx={{
                                fontSize: '0.85rem',
                                height: 28,
                                borderRadius: '7px',
                                border: '1px solid #333',
                                color: '#333',
                                fontWeight: 500,
                                bgcolor: 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: '#1a3a5c',
                                  color: '#1a3a5c',
                                  bgcolor: 'rgba(26, 58, 92, 0.05)'
                                }
                              }}
                            />
                          );
                        })
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* ===== Extended Details - Mobile only (xs) - Full width aligned with poster ===== */}
              <Box sx={{
                display: { xs: 'grid', sm: 'none' },
                gridTemplateColumns: '101px 1fr',
                gap: 0.5,
                fontSize: '11px',
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                mt: 2
              }}>
                <Typography sx={{ color: '#4A4A4A' }}>Nhà sản xuất:</Typography>
                <Typography sx={{ color: '#333333' }}>{movie.studio || 'NMN Studio'}</Typography>

                <Typography sx={{ color: '#4A4A4A' }}>Thể loại:</Typography>
                <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 0.75 }, flexWrap: 'wrap' }}>
                  {(!movie.genres || movie.genres.length === 0) ? (
                    <Typography sx={{ color: '#999', fontSize: '11px', fontStyle: 'italic' }}>Chưa cập nhật</Typography>
                  ) : (
                    movie.genres.map((genre, idx) => {
                      const genreName = typeof genre === 'string' ? genre : genre?.name || '';
                      return (
                        <Chip
                          key={idx}
                          label={genreName}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            const slug = genreName
                              ?.toLowerCase()
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .replace(/đ/g, 'd')
                              .replace(/Đ/g, 'D')
                              .replace(/\s+/g, '-')
                              .replace(/[^\w-]/g, '');
                            navigate(`/the-loai-phim/${slug}`);
                          }}
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.85rem' },
                            height: { xs: 22, sm: 28 },
                            borderRadius: '7px',
                            border: '1px solid #333',
                            color: '#333',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: '#1a3a5c',
                              color: '#1a3a5c',
                              bgcolor: 'rgba(26, 58, 92, 0.05)'
                            }
                          }}
                        />
                      );
                    })
                  )}
                </Box>

                <Typography sx={{ color: '#4A4A4A' }}>Đạo diễn:</Typography>
                <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 0.75 }, flexWrap: 'wrap' }}>
                  {(() => {
                    const directors = typeof movie.director === 'string'
                      ? movie.director.split(',').map(d => d.trim())
                      : movie.director?.name
                        ? [movie.director.name]
                        : [];

                    if (directors.length === 0) {
                      return <Typography sx={{ color: '#999', fontSize: '11px', fontStyle: 'italic' }}>Chưa cập nhật</Typography>;
                    }

                    return directors.map((directorName, idx) => (
                      <Chip
                        key={idx}
                        label={directorName}
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          const slug = directorName
                            ?.toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/đ/g, 'd')
                            .replace(/Đ/g, 'D')
                            .replace(/\s+/g, '-')
                            .replace(/[^\w-]/g, '');
                          navigate(`/dao-dien/${slug}`);
                        }}
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.85rem' },
                          height: { xs: 22, sm: 28 },
                          borderRadius: '7px',
                          border: '1px solid #333',
                          color: '#333',
                          fontWeight: 500,
                          bgcolor: 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#1a3a5c',
                            color: '#1a3a5c',
                            bgcolor: 'rgba(26, 58, 92, 0.05)'
                          }
                        }}
                      />
                    ));
                  })()}
                </Box>

                <Typography sx={{ color: '#4A4A4A' }}>Diễn viên:</Typography>
                <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 0.75 }, flexWrap: 'wrap' }}>
                  {(!movie.actors || movie.actors.length === 0) ? (
                    <Typography sx={{ color: '#999', fontSize: '11px', fontStyle: 'italic' }}>Chưa cập nhật</Typography>
                  ) : (
                    movie.actors.slice(0, 3).map((actor, idx) => {
                      const actorName = typeof actor === 'string' ? actor : actor?.name || '';
                      return (
                        <Chip
                          key={idx}
                          label={actorName}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            const slug = actorName
                              ?.toLowerCase()
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .replace(/đ/g, 'd')
                              .replace(/Đ/g, 'D')
                              .replace(/\s+/g, '-')
                              .replace(/[^\w-]/g, '');
                            navigate(`/dien-vien/${slug}`);
                          }}
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.85rem' },
                            height: { xs: 22, sm: 28 },
                            borderRadius: '7px',
                            border: '1px solid #333',
                            color: '#333',
                            fontWeight: 500,
                            bgcolor: 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: '#1a3a5c',
                              color: '#1a3a5c',
                              bgcolor: 'rgba(26, 58, 92, 0.05)'
                            }
                          }}
                        />
                      );
                    })
                  )}
                </Box>
              </Box>

              {/* ===== Nội dung + Lịch chiếu (Full width of left column) ===== */}
              {/* 2. NỘI DUNG PHIM */}
              <Box sx={{ mt: 4, mb: 4 }}>
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: '16px',
                  fontFamily: '"Nunito Sans", sans-serif',
                  color: '#4A4A4A', mb: 1,
                  borderLeft: `3.2px solid #1a1a2e`,
                  pl: 1.2, display: 'inline-block',
                  pb: 0.5
                }}>
                  Nội Dung Phim
                </Typography>
                <Typography sx={{
                  color: '#333333', lineHeight: 1.7,
                  fontFamily: '"Nunito Sans", sans-serif', pl: 1.7,
                  mb: 2, fontSize: '14px', textAlign: 'justify'
                }}>
                  {movie.description}
                </Typography>
              </Box>

              {/* 3. LỊCH CHIẾU */}
              <Box>
                <Typography sx={{
                  fontWeight: 700,
                  fontSize: '16px',
                  fontFamily: '"Nunito Sans", sans-serif',
                  color: '#333333',
                  mb: 2,
                  borderLeft: `3.2px solid #1a1a2e`,
                  pl: 1.2, display: 'inline-block',
                  pb: 0.5
                }}>
                  Lịch Chiếu
                </Typography>

                {/* Date Selector */}
                <Box sx={{
                  display: 'flex',
                  gap: 3.7,
                  overflowX: 'auto',
                  pb: 3,
                  mb: 2,
                  '&::-webkit-scrollbar': { display: 'none' }
                }}>
                  {availableDates.map((dateObj, idx) => (
                    <Box
                      key={dateObj.date}
                      onClick={() => setSelectedDate(dateObj.date)}
                      sx={{
                        minWidth: 80,
                        py: 1.5, px: 1,
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        bgcolor: selectedDate === dateObj.date ? COLORS.primary : COLORS.bgLight,
                        color: selectedDate === dateObj.date ? COLORS.white : COLORS.text,
                        border: `1px solid ${selectedDate === dateObj.date ? COLORS.primary : COLORS.border}`,
                        flexShrink: 0
                      }}
                    >
                      {isToday(dateObj.date) && <Typography sx={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: selectedDate === dateObj.date ? '#fff' : COLORS.orange
                      }}>
                        Hôm Nay
                      </Typography>}
                      <Typography sx={{
                        fontWeight: 600,
                        fontSize: '13px',
                        fontFamily: '"Nunito Sans", sans-serif'
                      }}>
                        {dateObj.dayOfWeek}
                      </Typography>
                      <Typography sx={{
                        fontWeight: 700,
                        fontSize: '18px',
                        fontFamily: '"Nunito Sans", sans-serif'
                      }}>
                        {dateObj.dayNumber}
                      </Typography>
                      <Typography sx={{
                        fontSize: '11px',
                        fontFamily: '"Nunito Sans", sans-serif'
                      }}>
                        Th{dateObj.month}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Filters */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 140, maxWidth: 180 }}>
                    <Select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} displayEmpty
                      sx={{
                        fontSize: '14px',
                        fontFamily: '"Nunito Sans", sans-serif',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.border
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.border
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.border,
                          borderWidth: '1px'
                        }
                      }}>
                      <MenuItem value="all">Toàn quốc</MenuItem>
                      {cities.map((city, idx) => (
                        <MenuItem key={idx} value={city}>{city}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 160, maxWidth: 200 }}>
                    <Select value={selectedCinema} onChange={(e) => setSelectedCinema(e.target.value)} displayEmpty
                      sx={{
                        fontSize: '14px',
                        fontFamily: '"Nunito Sans", sans-serif',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.border
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.border
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.border,
                          borderWidth: '1px'
                        }
                      }}>
                      <MenuItem value="all">Tất cả rạp</MenuItem>
                      {cinemas
                        .filter(c => selectedArea === 'all' || c.city === selectedArea)
                        .map(c => (
                          <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Cinema List */}
                {Object.keys(groupedShowtimes).length > 0 ? (
                  Object.values(groupedShowtimes).map(({ cinema, formats }) => (
                    <Paper key={cinema._id}
                      sx={{
                        mb: 2,
                        overflow: 'hidden'
                      }} elevation={0}>
                      <Box sx={{
                        p: 1.5,
                        margin: 0,
                      }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '15px',
                            color: '#333333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontFamily: '"Nunito Sans", sans-serif'
                          }}>
                          <LocationIcon sx={{ color: COLORS.primary, fontSize: 18 }} />
                          {cinema.name}
                        </Typography>
                      </Box>
                      {Object.entries(formats).map(([format, showtimes]) => (
                        <Box key={format}
                          sx={{
                            p: 1.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 1.5,
                            // borderBottom: `1px solid ${COLORS.border}`,
                            // '&:last-child': { borderBottom: 'none' }
                          }}>
                          <Typography sx={{
                            minWidth: 100,
                            fontWeight: 600,
                            fontSize: '13px',
                            color: '#333333',
                            fontFamily: '"Nunito Sans", sans-serif'
                          }}>
                            {format}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {showtimes.map(st => (
                              <Button
                                key={st._id}
                                variant="outlined"
                                onClick={() => handleShowtimeClick(st)}
                                sx={{
                                  minWidth: 60,
                                  py: 0.5,
                                  px: 1,
                                  fontSize: '13px',
                                  color: '#333333',
                                  borderColor: '#333333',
                                  borderRadius: '6px',
                                  fontFamily: '"Nunito Sans", sans-serif',
                                  '&:hover': {
                                    bgcolor: COLORS.primary,
                                    color: COLORS.white,
                                    borderColor: COLORS.primary
                                  }
                                }}
                              >
                                {formatTime(st.startAt)}
                              </Button>
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Paper>
                  ))
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }} elevation={0}>
                    <CalendarIcon sx={{ fontSize: 40, color: '#ddd', mb: 1 }} />
                    <Typography color="text.secondary" fontSize="14px">Không có suất chiếu trong ngày hôm nay</Typography>
                  </Paper>
                )}
              </Box>
            </Grid>

            {/* Right: Sidebar - PHIM ĐANG CHIẾU */}
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper
                sx={{
                  p: 1,
                  position: 'sticky',
                  top: 10,
                }} elevation={0}>
                {/* Title */}
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#4A4A4A',
                  mb: 2,
                  fontFamily: '"Nunito Sans", sans-serif',
                  textTransform: 'uppercase'
                }}>
                  Phim đang chiếu
                </Typography>

                {/* Movie Cards - Vertical Layout */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {otherMovies.slice(0, 3).map((otherMovie) => (
                    <Box
                      key={otherMovie._id}
                      component={Link}
                      to={`/dat-ve/${otherMovie._id}`}
                      sx={{
                        textDecoration: 'none',
                        display: 'block',
                        '&:hover .movie-overlay': {
                          opacity: 1
                        }
                      }}
                    >
                      {/* Poster Container with Overlay */}
                      <Box sx={{
                        position: "relative",
                        overflow: "hidden",
                        aspectRatio: "3/4",
                        borderRadius: 1,
                        bgcolor: "#f7f7f9ff",
                      }}>
                        {/* Poster Image */}
                        <Box
                          component="img"
                          src={otherMovie.bannerUrl || otherMovie.posterUrl}
                          alt={otherMovie.title}
                          onError={(e) => {
                            e.target.onerror = null;
                          }}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            bgcolor: '#f7f7f9ff'
                          }}
                        />

                        {/* Combined Rating Badge - Bottom Right */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: 6,
                          right: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          {/* Age Rating */}
                          <Box sx={{
                            bgcolor: COLORS.orange,
                            px: 0.75,
                            py: 0.25,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <Typography sx={{
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '10px',
                              fontFamily: '"Nunito Sans", sans-serif'
                            }}>
                              {otherMovie.ageRating}
                            </Typography>
                          </Box>

                          {/* Star Rating */}
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.25,
                            px: 0.75,
                            py: 0.25
                          }}>
                            <StarIcon sx={{ fontSize: 12, color: COLORS.orange }} />
                            <Typography sx={{
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '10px',
                              fontFamily: '"Nunito Sans", sans-serif'
                            }}>
                              {otherMovie.rating}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Hover Overlay with "Mua vé" button */}
                        <Box
                          className="movie-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s'
                          }}
                        >
                          <Button
                            variant="contained"
                            startIcon={<TicketIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              bgcolor: COLORS.orange,
                              color: '#fff',
                              fontWeight: 600,
                              fontFamily: '"Nunito Sans", sans-serif',
                              textTransform: 'none',
                              fontSize: '12px',
                              px: 2,
                              py: 0.5,
                              '&:hover': {
                                bgcolor: '#e09520'
                              }
                            }}
                          >
                            Mua vé
                          </Button>
                        </Box>
                      </Box>

                      {/* Movie Title - Below Poster */}
                      <Typography sx={{
                        mt: 0.75,
                        fontWeight: 600,
                        fontSize: '13px',
                        color: '#333333',
                        fontFamily: '"Nunito Sans", sans-serif',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {otherMovie.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Xem thêm button */}
                <Button
                  component={Link}
                  to="/phim-dang-chieu"
                  fullWidth
                  disableRipple
                  sx={{
                    mt: 2,
                    py: 1,
                    color: COLORS.primary,
                    fontWeight: 600,
                    fontSize: '13px',
                    fontFamily: '"Nunito Sans", sans-serif',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'transparent'
                    }
                  }}
                  endIcon={<ArrowIcon sx={{ fontSize: 12 }} />}
                >
                  Xem thêm
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ==================== RATING MODAL ==================== */}
      <Dialog
        open={openRatingModal}
        onClose={() => setOpenRatingModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' }
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={() => setOpenRatingModal(false)}
          sx={{
            position: 'absolute',
            right: 5,
            top: 5,
            zIndex: 70,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: COLORS.white }
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Movie Banner */}
        <Box
          sx={{
            width: '100%',
            height: 250,
            background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${movie?.bannerUrl || movie?.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <DialogContent sx={{ textAlign: 'center', pb: 4 }}>
          {/* Movie Title */}
          <Typography sx={{ fontWeight: 700, fontSize: '18px', color: COLORS.dark, mb: 3 }}>
            {movie?.title}
          </Typography>

          {/* Current Rating */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              px: 4,
              py: 2,
              borderRadius: '50px',
              border: `1.7px solid ${COLORS.primary}`,
              mb: 3
            }}
          >
            <StarIcon sx={{ color: COLORS.orange, fontSize: 28 }} />
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.dark }}>
              {movie?.rating}
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: COLORS.textMuted }}>
              ({movie?.ratingCount || 0} đánh giá)
            </Typography>
          </Box>

          {/* User Rating */}
          <Box sx={{ mb: 3 }}>
            <Rating
              value={userRating}
              onChange={(event, newValue) => setUserRating(newValue)}
              size="large"
              max={10}
              icon={<StarIcon sx={{ fontSize: 32, color: COLORS.orange }} />}
              emptyIcon={<StarBorderIcon sx={{ fontSize: 32, color: COLORS.textMuted }} />}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenRatingModal(false)}
              sx={{
                py: 1.5,
                borderRadius: 0,
                borderColor: COLORS.border,
                color: COLORS.text,
                fontWeight: 600,
                '&:hover': { borderColor: COLORS.primary, bgcolor: 'transparent' }
              }}
            >
              Đóng
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={async () => {
                if (!userRating) {
                  alert('Vui lòng chọn số sao để đánh giá!');
                  return;
                }

                // Check if user is logged in
                const token = localStorage.getItem('accessToken');
                if (!token) {
                  alert('Vui lòng đăng nhập để đánh giá!');
                  return;
                }

                try {
                  // Token is automatically added by interceptor
                  const result = await rateMovieAPI(movie._id, userRating);
                  // Update local movie state with new rating
                  setMovie(prev => ({
                    ...prev,
                    rating: result.data.rating,
                    ratingCount: result.data.ratingCount
                  }));
                  setOpenRatingModal(false);
                  alert('Đánh giá thành công!');
                } catch (error) {
                  console.error('Rating error:', error);
                  const errorMsg = error.response?.data?.message || 'Đánh giá thất bại!';

                  // Handle expired token
                  if (errorMsg.includes('expired') || errorMsg.includes('jwt')) {
                    localStorage.removeItem('accessToken');
                    alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                    window.location.reload();
                  } else {
                    alert(errorMsg);
                  }
                }
              }}
              sx={{
                py: 1.5,
                borderRadius: 0,
                bgcolor: COLORS.primary,
                fontWeight: 600,
                '&:hover': { bgcolor: '#023A7A' }
              }}
            >
              Xác Nhận
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ==================== TRAILER MODAL ==================== */}
      <Dialog
        open={openTrailerModal}
        onClose={() => setOpenTrailerModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: '#000'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', aspectRatio: '16/9' }}>
          {movie?.trailerUrl && (
            <iframe
              width="1038px"
              height="582px"
              src={movie.trailerUrl.replace('watch?v=', 'embed/')}
              title={`${movie.title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box >
  );
}

export default BookingPage;
