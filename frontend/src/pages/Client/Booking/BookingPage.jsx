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

// Mock Data
import { mockMovies, getNowShowingMovies, getMovieById } from '../../../mocks/mockMovies';
import { mockCinemas } from '../../../mocks/mockCinemas';
import { mockShowtimes, availableDates } from '../../../mocks/mockShowtimes';


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

// ==================== BOOKING PAGE COMPONENT ====================
function BookingPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  // States
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(availableDates[0]?.date || '');
  const [otherMovies, setOtherMovies] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [openRatingModal, setOpenRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [openTrailerModal, setOpenTrailerModal] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);

  // Load movie data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const foundMovie = getMovieById(movieId);
      setMovie(foundMovie || mockMovies[0]);
      const nowShowing = getNowShowingMovies().filter(m => m._id !== movieId).slice(0, 4);
      setOtherMovies(nowShowing);
      setLoading(false);
    }, 300);
  }, [movieId]);

  // Filter showtimes
  const filteredShowtimes = useMemo(() => {
    if (!movie) return [];
    return mockShowtimes.filter(st => {
      const stDate = st.startAt.split('T')[0];
      return stDate === selectedDate;
    });
  }, [selectedDate, movie]);

  // Group showtimes by cinema and format
  const groupedShowtimes = useMemo(() => {
    const grouped = {};
    mockCinemas.forEach(cinema => {
      if (selectedCinema !== 'all' && cinema._id !== selectedCinema) return;

      const cinemaShowtimes = filteredShowtimes.filter(st => st.cinemaId === cinema._id);
      if (cinemaShowtimes.length > 0) {
        const byFormat = {};
        cinemaShowtimes.forEach(st => {
          const key = `${st.format} ${st.language}`;
          if (!byFormat[key]) byFormat[key] = [];
          byFormat[key].push(st);
        });
        grouped[cinema._id] = { cinema, formats: byFormat };
      }
    });
    return grouped;
  }, [filteredShowtimes, selectedCinema]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
      <Box sx={{ textAlign: 'center', py: 10, bgcolor: COLORS.bgLight, minHeight: '100vh' }}>
        <MovieIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
        <Typography variant="h5" color="text.secondary">Không tìm thấy phim</Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 3 }}>Về trang chủ</Button>
      </Box>
    );
  }

  return (
    <Box className="booking-page" sx={{ bgcolor: COLORS.bgLight, minHeight: '100vh' }}>

      {/* ==================== BANNER TRAILER SECTION ==================== */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 1585.6,
          mx: "auto",
          overflow: "hidden",

          // khóa tỉ lệ thay vì height
          aspectRatio: { xs: "16 / 9", md: "21 / 9" },
          minHeight: { xs: 220, md: 360 },

          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url(${movie.bannerUrl || movie.posterUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "50% 25%", // thường kéo lên chút để thấy mặt
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
              <Grid container spacing={3}>
                {/* Poster */}
                <Grid item xs={12} sm={4}>
                  <Box
                    component="img"
                    src={movie.posterUrl}
                    alt={movie.title}
                    sx={{
                      width: '100%',
                      maxWidth: 240,
                      height: { xs: 280, md: 360 },
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      mt: { xs: 0, md: -10 },
                      position: 'relative',
                      zIndex: 10,
                      border: '1px solid white'
                    }}
                  />
                </Grid>

                {/* Movie Details */}
                <Grid item xs={12} sm={8}>
                  {/* Title + Badges */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: COLORS.dark }}>
                      {movie.title}
                    </Typography>
                    <Chip label={movie.ageRating} size="small" sx={{ bgcolor: COLORS.orange, color: '#000', fontWeight: 700 }} />
                  </Box>

                  {/* Meta Row */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap', color: COLORS.textLight }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon fontSize="small" />
                      <Typography variant="body2">{movie.duration} Phút</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon fontSize="small" />
                      <Typography variant="body2">{movie.releaseDate}</Typography>
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
                      <StarIcon fontSize="small"
                        sx={{
                          color: COLORS.orange,
                          transition: 'color 0.2s'
                        }} />
                      <Typography variant="body2"
                        sx={{
                          fontWeight: 600,
                          transition: 'color 0.2s'
                        }}>
                        {movie.rating}
                      </Typography>
                      <Typography variant="body2"
                        sx={{
                          color: COLORS.textMuted,
                          transition: 'color 0.2s'
                        }}>(64 votes)
                      </Typography>
                    </Box>
                  </Box>

                  {/* Details Grid*/}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' },
                    gap: 1.5,
                    fontSize: '0.9rem',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                  }}>
                    <Typography sx={{ color: COLORS.textMuted }}>Quốc gia:</Typography>
                    <Typography sx={{
                      color: COLORS.text,
                      '&:hover': { color: 'red' }
                    }}>
                      Việt Nam
                    </Typography>

                    <Typography sx={{ color: COLORS.textMuted }}>Nhà sản xuất:</Typography>
                    <Typography sx={{ color: COLORS.text }}>NMN Studio</Typography>

                    <Typography sx={{ color: COLORS.textMuted }}>Thể loại:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {movie.genres?.map((genre, idx) => (
                        <Chip
                          key={idx}
                          label={genre}
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/goc-dien-anh/the-loai/${encodeURIComponent(genre.toLowerCase())}`)}
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
                      ))}
                    </Box>

                    <Typography sx={{ color: COLORS.textMuted }}>Đạo diễn:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {movie.director?.split(',').map((director, idx) => (
                        <Chip
                          key={idx}
                          label={director.trim()}
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/goc-dien-anh/dao-dien/${encodeURIComponent(director.trim().toLowerCase())}`)}
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
                      ))}
                    </Box>

                    <Typography sx={{ color: COLORS.textMuted }}>Diễn viên:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {movie.actors?.slice(0, 3).map((actor, idx) => (
                        <Chip
                          key={idx}
                          label={actor}
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/goc-dien-anh/dien-vien/${encodeURIComponent(actor.toLowerCase())}`)}
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
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

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
                      <MenuItem value="hanoi">Hà Nội</MenuItem>
                      <MenuItem value="danang">Đà Nẵng</MenuItem>
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
                      {mockCinemas.map(c => (
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
                            fontWeight: 500,
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
                                  minWidth: 60, py: 0.5, px: 1, fontSize: '13px',
                                  color: '#333333', borderColor: '#333333', borderRadius: '6px',
                                  fontFamily: '"Nunito Sans", sans-serif',
                                  '&:hover': { bgcolor: COLORS.primary, color: COLORS.white, borderColor: COLORS.primary }
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
                        aspectRatio: "16/9",
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
              (55 đánh giá)
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
              onClick={() => {
                // TODO: Submit rating to API
                setOpenRatingModal(false);
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
