
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Nơi Call đường dẫn API
// Nơi Call đường dẫn API
import { getMovieAPI, rateMovieAPI, getNowShowingMoviesAPI, incrementViewAPI } from '../../../apis/movieApi';

// Thêm Matenial MUI Components
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Paper,
  Breadcrumbs,
  Divider,
  Avatar,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Rating
} from '@mui/material';

// Thêm Matenial MUI Icons
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import { useTheme, useMediaQuery } from '@mui/material';

//Components
import { TrailerModal } from '../../../components/Common';
import CommentSection from '../../../components/Movie/CommentSection';
import { useAuth } from '../../../contexts/AuthContext';

// MÀU SẮC - lấy từ BookingPage
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

// HÀM TIỆN ÍCH (UTILITIES)
// Format ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// COMPONENT CHÍNH - TRANG CHI TIẾT PHIM
function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherMovies, setOtherMovies] = useState([]);

  // Rating Modal State
  const [openRatingModal, setOpenRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);

  // Trailer Modal State
  const [openTrailerModal, setOpenTrailerModal] = useState(false);

  // Image Gallery Lightbox State
  const [openGallery, setOpenGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);


  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Ref để chống double-call (do React StrictMode)
  const viewIncrementedRef = useRef({});

  // Cooldown window cho view counting (30 phút = 30 * 60 * 1000 ms)
  const VIEW_COOLDOWN_MS = 30 * 60 * 1000;

  // Load dữ liệu phim
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch chi tiết phim từ API
        const movieRes = await getMovieAPI(id);
        setMovie(movieRes?.data?.movie || null);

        // Fetch phim đang chiếu từ API cho sidebar
        const nowShowingRes = await getNowShowingMoviesAPI(5);
        const nowShowingMovies = nowShowingRes?.data?.movies || [];
        setOtherMovies(nowShowingMovies.filter(m => m._id !== id).slice(0, 4));

        // Tăng lượt xem phim (với cooldown window 30 phút)
        if (!viewIncrementedRef.current[id]) {
          viewIncrementedRef.current[id] = true;

          const viewKey = `movie_view_${id}`;
          const lastViewTime = localStorage.getItem(viewKey);
          const now = Date.now();

          // Chỉ tăng view nếu chưa xem hoặc đã quá cooldown window
          if (!lastViewTime || (now - parseInt(lastViewTime, 10)) > VIEW_COOLDOWN_MS) {
            localStorage.setItem(viewKey, now.toString());
            incrementViewAPI(id).catch(err => console.log('View increment failed:', err));
          }
        }
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setMovie(null);
        setOtherMovies([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);





  // Xử lý click Mua vé
  const handleBuyTicket = () => {
    navigate(`/dat-ve/${id}`);
  };

  // Gallery handlers
  const handleOpenGallery = (index) => {
    setCurrentImageIndex(index);
    setOpenGallery(true);
  };

  const handleNextImage = () => {
    if (movie?.stills) {
      setCurrentImageIndex((prev) => (prev + 1) % movie.stills.length);
    }
  };

  const handlePrevImage = () => {
    if (movie?.stills) {
      setCurrentImageIndex((prev) => (prev - 1 + movie.stills.length) % movie.stills.length);
    }
  };

  // Autoplay for gallery
  useEffect(() => {
    let interval;
    if (openGallery && isAutoPlay && movie?.stills?.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % movie.stills.length);
      }, 3000); // Chuyển ảnh mỗi 3 giây
    }
    return () => clearInterval(interval);
  }, [openGallery, isAutoPlay, movie?.stills?.length]);

  // Loading state
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

  // Không tìm thấy phim
  if (!movie) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6" gutterBottom>Không tìm thấy phim</Typography>
        <Button onClick={() => navigate(-1)} variant="outlined">Quay lại</Button>
      </Box>
    );
  }

  // HELPER COMPONENT: ITEM CHI TIẾT
  const DetailItem = ({ label, value }) => {
    // Helper function để đảm bảo chỉ render string
    const getDisplayValue = (item) => {
      if (item === null || item === undefined) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item.name) return item.name;
      return String(item);
    };

    // Handle array or single value
    const items = Array.isArray(value) ? value : [value];

    // Kiểm tra nếu không có dữ liệu
    const placeholderTexts = ['chưa cập nhật', 'đang cập nhật', 'không có', 'n/a', ''];

    const isEmptyValue = (v) => {
      if (v === null || v === undefined) return true;
      if (typeof v === 'string' && !v.trim()) return true;
      if (typeof v === 'string' && placeholderTexts.includes(v.toLowerCase().trim())) return true;
      if (typeof v === 'object' && !v.name) return true;
      if (typeof v === 'object' && v.name && !v.name.trim()) return true;
      if (typeof v === 'object' && v.name && placeholderTexts.includes(v.name.toLowerCase().trim())) return true;
      return false;
    };

    const hasNoData = !value ||
      (Array.isArray(value) && value.length === 0) ||
      (Array.isArray(value) && value.every(v => isEmptyValue(v))) ||
      (!Array.isArray(value) && isEmptyValue(value));

    // Nếu không có dữ liệu, hiển thị "Chưa cập nhật" với màu #999999
    if (hasNoData) {
      return (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '100px 1fr' : '110px 1fr',
          gap: 1,
          fontSize: { xs: '14px', md: '0.85rem' },
          mb: { xs: 0.5, md: 0 }
        }}>
          <Typography sx={{ color: '#4A4A4A', minWidth: '100px' }}>{label}:</Typography>
          <Typography sx={{ color: '#999999', fontWeight: 400, fontStyle: 'italic' }}>
            Chưa cập nhật
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '100px 1fr' : '110px 1fr',
        gap: 1,
        fontSize: { xs: '14px', md: '0.85rem' },
        mb: { xs: 0.5, md: 0 }
      }}>
        <Typography sx={{ color: '#4A4A4A', minWidth: '100px' }}>{label}:</Typography>
        <Box sx={{ color: COLORS.text, fontWeight: 500, width: 'fit-content' }}>
          {items.map((item, index) => {
            const displayValue = getDisplayValue(item);
            if (!displayValue) return null;
            return (
              <Box
                component="span"
                key={index}
                sx={{
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: (label === 'Quốc gia' && displayValue === 'Việt Nam') ? '#e53935' : '#1a3a5c',
                    cursor: 'pointer'
                  }
                }}
              >
                {displayValue}
                {index < items.length - 1 && ', '}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: COLORS.bgLight, minHeight: '100vh' }}>

      {/*MAIN CONTENT*/}
      <Box sx={{ bgcolor: COLORS.white, pb: 5 }}>
        <Container maxWidth="lg">

          {/* Breadcrumb Navigation */}
          <Box sx={{ py: 2 }}>
            <Breadcrumbs
              separator="/"
              sx={{
                '& .MuiBreadcrumbs-separator': { color: COLORS.textMuted, mx: 1 }
              }}
            >
              <Link to="/" style={{ textDecoration: 'none', color: COLORS.textMuted, fontSize: isMobile ? '13px' : '14px' }}>Trang chủ</Link>
              <Link to="/the-loai-phim" style={{ textDecoration: 'none', color: COLORS.textMuted, fontSize: isMobile ? '13px' : '14px' }}>Phim</Link>
              <Typography sx={{ color: COLORS.text, fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                {movie.title}
              </Typography>
            </Breadcrumbs>
          </Box>

          <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>

            {/* LEFT COLUMN: Main Content */}
            <Grid item xs={12} md={8}>

              {/* RESPONSIVE HEADER SECTION */}
              {isMobile ? (
                /* MOBILE VIEW: Stacked Layout */
                <Box sx={{ mb: 4 }}>
                  {/* 1. Mobile Banner (Landscape) */}
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box
                      component="img"
                      src={movie.bannerUrl || movie.posterUrl}
                      alt={movie.title}
                      sx={{
                        width: '100%',
                        aspectRatio: '16/9',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    {/* Play Button Overlay */}
                    {movie.trailerUrl && (
                      <Box
                        onClick={() => setOpenTrailerModal(true)}
                        sx={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: 'rgba(0,0,0,0.2)', cursor: 'pointer'
                        }}
                      >
                        <Box sx={{
                          width: 50, height: 50, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.8)'
                        }}>
                          <PlayArrowIcon sx={{ fontSize: 30, color: 'white', ml: 0.5 }} />
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* 2. Mobile Title & Info */}
                  <Box>
                    {/* Title + Age */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#333', lineHeight: 1.3, fontSize: '20px' }}>
                        {movie.title}
                      </Typography>
                      <Chip
                        label={movie.ageRating}
                        size="small"
                        sx={{
                          bgcolor: COLORS.orange, color: '#fff', fontWeight: 700,
                          height: 22, fontSize: '10px', borderRadius: '4px', mt: 0.5
                        }}
                      />
                    </Box>

                    {/* Meta Info */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 8, rowGap: 1.5, mb: 2, color: COLORS.textLight, fontSize: '12px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                        <Typography fontSize="inherit" fontWeight={500}>{movie.duration} Phút</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon sx={{ fontSize: 16 }} />
                        <Typography fontSize="inherit" fontWeight={500}>{formatDate(movie.releaseDate)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <VisibilityIcon sx={{ fontSize: 16, color: '#999' }} />
                        <Typography fontSize="inherit">{movie.viewCount?.toLocaleString() || 0}</Typography>
                      </Box>
                      <Box
                        onClick={() => setOpenRatingModal(true)}
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', lineHeight: 1 }}
                      >
                        <StarIcon sx={{ fontSize: 16, color: COLORS.orange, display: 'block' }} />
                        <Typography fontSize="inherit" fontWeight={700} color="#333" sx={{ lineHeight: 1 }}>
                          {movie.rating}
                        </Typography>
                        <Typography fontSize="inherit" color="#999" sx={{ lineHeight: 1 }}>
                          ({movie.ratingCount})
                        </Typography>
                      </Box>
                    </Box>

                    {/* Details List */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                      <DetailItem label="Quốc gia" value={movie.country} />
                      <DetailItem label="Diễn viên" value={movie.actors} />
                      <DetailItem label="Nhà sản xuất" value={movie.studio} />
                      <DetailItem label="Thể loại" value={movie.genres} />
                      <DetailItem label="Đạo diễn" value={movie.director} />

                    </Box>

                    {/* Description */}
                    <Box>
                      <Typography sx={{
                        fontWeight: 700,
                        fontSize: '16px',
                        color: COLORS.primary,
                        mb: 1,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        '&::before': {
                          content: '""',
                          width: 4,
                          height: 20,
                          bgcolor: COLORS.primary,
                          borderRadius: 1
                        }
                      }}>
                        Nội dung phim
                      </Typography>
                      <Typography sx={{ color: '#555', lineHeight: 1.6, fontSize: '14px', textAlign: 'justify' }}>
                        {movie.description || 'Chưa cập nhật nội dung.'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                /* DESKTOP VIEW: Side-by-Side Grid */
                <>
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    {/* Poster + Play */}
                    <Grid item xs={5} sm={4}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={movie.posterUrl}
                          alt={movie.title}
                          sx={{
                            width: '100%',
                            maxWidth: { xs: 160, sm: 200, md: 240 },
                            height: { xs: 220, sm: 280, md: 360 },
                            objectFit: 'cover',
                            borderRadius: 2
                          }}
                        />
                        {movie.trailerUrl && (
                          <Box
                            onClick={() => setOpenTrailerModal(true)}
                            sx={{
                              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: 2, cursor: 'pointer', transition: 'all 0.3s',
                              '&:hover .play-icon': { transform: 'scale(1.1)' }
                            }}
                          >
                            <Box className="play-icon" sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: '#0000008F', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s' }}>
                              <PlayArrowIcon sx={{ fontSize: 35, color: 'white', ml: 0.5 }} />
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    {/* Info */}
                    <Grid item xs={7} sm={8}>
                      {/* Title */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.6rem', color: COLORS.dark }}>
                          {movie.title}
                        </Typography>
                        <Chip label={movie.ageRating} size="small" sx={{ bgcolor: COLORS.orange, color: '#000', fontWeight: 700 }} />
                      </Box>

                      {/* Meta */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 1, color: COLORS.textLight }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon fontSize="small" /> <Typography>{movie.duration} Phút</Typography>
                        </Box>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, lineHeight: 1 }}>
                          <CalendarTodayIcon sx={{ fontSize: 16, display: 'block' }} />
                          <Typography fontSize="inherit" fontWeight={500} sx={{ lineHeight: 1 }}>
                            {formatDate(movie.releaseDate)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: COLORS.textLight }}>
                          <VisibilityIcon fontSize="small" /> <Typography>{movie.viewCount?.toLocaleString() || 0}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => setOpenRatingModal(true)}>
                          <StarIcon sx={{ fontSize: 16, color: COLORS.orange, position: 'relative', top: 1 }} />
                          <Typography fontWeight={600}>{movie.rating}</Typography>
                          <Typography color={COLORS.textMuted}>({movie.ratingCount} đánh giá)</Typography>
                        </Box>
                      </Box>

                      {/* Details Grid */}
                      {/* Details Grid */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <DetailItem label="Quốc gia" value={movie.country || 'Việt Nam'} />
                        <DetailItem label="Nhà sản xuất" value={movie.studio || 'NMN Studio'} />
                        <DetailItem label="Thể loại" value={movie.genres || ['Hành động']} />
                        <DetailItem label="Đạo diễn" value={movie.director || 'Chưa cập nhật'} />
                        <DetailItem label="Diễn viên" value={movie.actors?.map(a => a.name || a) || ['Đang cập nhật']} />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Desktop Description */}
                  <Box sx={{ mt: 4 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '18px', color: COLORS.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1, '&::before': { content: '""', width: 4, height: 20, bgcolor: COLORS.primary, borderRadius: 1 } }}>
                      NỘI DUNG PHIM
                    </Typography>
                    <Typography sx={{ color: COLORS.text, lineHeight: 1.8, fontSize: '14px', whiteSpace: 'pre-line', textAlign: 'justify' }}>
                      {movie.description}
                    </Typography>
                  </Box>
                </>
              )}

              {/* HÌNH TRONG PHIM - SHARED */}
              <Box sx={{ mt: 4 }}>
                <Typography sx={{
                  fontWeight: 700,
                  fontSize: '18px',
                  color: COLORS.primary,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&::before': {
                    content: '""',
                    width: 4,
                    height: 20,
                    bgcolor: COLORS.primary,
                    borderRadius: 1
                  }
                }}>
                  HÌNH TRONG PHIM
                </Typography>
                {movie.stills && movie.stills.length > 0 ? (
                  <Box sx={{
                    display: { xs: 'flex', sm: 'grid' },
                    gridTemplateColumns: { sm: 'repeat(4, 1fr)' },
                    overflowX: { xs: 'auto', sm: 'visible' },
                    gap: 1.5,
                    pb: { xs: 1, sm: 0 }, // Add padding bottom for scrollbar spacing on mobile if needed
                    '::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for cleaner look
                    scrollbarWidth: 'none'
                  }}>
                    {movie.stills.map((still, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={typeof still === 'object' ? still.url : still}
                        alt={`Scene ${idx + 1}`}
                        onClick={() => handleOpenGallery(idx)}
                        sx={{
                          width: { xs: '263px', sm: '100%' }, // Fixed width on mobile for scrolling
                          flexShrink: 0, // Prevent shrinking in flex container
                          height: { xs: '187.85px', sm: 'auto' },
                          aspectRatio: { xs: 'unset', sm: '16/9' }, // Cinematic aspect ratio for desktop, fixed size for mobile
                          objectFit: 'cover',
                          borderRadius: 0, // No border radius
                          cursor: 'pointer',
                          transition: 'transform 0.3s',
                          '&:hover': { transform: { sm: 'scale(1.05)' } }
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>Chưa cập nhật</Typography>
                )
                }
              </Box>

              {/* DIỄN VIÊN - SHARED */}
              <Box sx={{ mt: 4 }}>
                <Typography sx={{
                  fontWeight: 700,
                  fontSize: '18px',
                  color: COLORS.primary,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&::before': {
                    content: '""',
                    width: 4,
                    height: 20,
                    bgcolor: COLORS.primary,
                    borderRadius: 1
                  }
                }}>
                  DIỄN VIÊN
                </Typography>
                {movie.actors && movie.actors.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {movie.actors.map((actor, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: '48%' } }}>
                        <Box
                          component="img"
                          src={typeof actor === 'object' ? actor.photoUrl : 'https://via.placeholder.com/110'}
                          alt={typeof actor === 'object' ? actor.name : actor}
                          sx={{
                            width: 128,
                            height: 85,
                            objectFit: 'cover',
                            flexShrink: 0,
                            cursor: 'pointer'
                          }}
                        />
                        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: COLORS.text }}>
                          {typeof actor === 'object' ? actor.name : actor}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>Chưa cập nhật</Typography>
                )}
              </Box>

              {/*BÌNH LUẬN PHIM*/}
              <CommentSection movieId={id} user={user} />
            </Grid>

            {/* ===== RIGHT COLUMN: Sidebar - PHIM ĐANG CHIẾU ===== */}
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper
                sx={{
                  p: 2,
                  position: 'sticky',
                  top: 10,
                }} elevation={0}>
                {/* Title */}
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#4A4A4A',
                  mb: 2,
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
                              fontSize: '10px'
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
                              fontSize: '10px'
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
                            startIcon={<ConfirmationNumberOutlinedIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              bgcolor: COLORS.orange,
                              color: '#fff',
                              fontWeight: 600,
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
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'transparent'
                    }
                  }}
                  endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
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

                  // Handle expired token or already rated
                  if (errorMsg.includes('expired') || errorMsg.includes('jwt')) {
                    localStorage.removeItem('accessToken');
                    alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                    window.location.reload();
                  } else {
                    alert(errorMsg); // Sẽ hiển "Bạn đã bình chọn cho phim này rồi!"
                  }
                }
              }}
              sx={{
                py: 1.5,
                borderRadius: 0,
                bgcolor: COLORS.primary,
                fontWeight: 600,
                '&:hover': { bgcolor: '#023c7a' }
              }}
            >
              Xác Nhận
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ==================== TRAILER MODAL ==================== */}
      <TrailerModal
        open={openTrailerModal}
        onClose={() => setOpenTrailerModal(false)}
        trailerUrl={movie?.trailerUrl}
        movieTitle={movie?.title}
      />

      {/* ==================== IMAGE GALLERY LIGHTBOX ==================== */}
      <Dialog
        open={openGallery}
        onClose={() => setOpenGallery(false)}
        maxWidth={false}
        fullScreen
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0,0,0,0.9)'
          }
        }}
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none'
          }
        }}
      >
        {/* Top Controls Bar */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1,
          p: 1,
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 10
        }}>
          {/* Play/Pause Button */}
          <IconButton
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            sx={{ color: '#fff' }}
          >
            {isAutoPlay ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>

          {/* Fullscreen Button */}
          <IconButton
            onClick={() => {
              const container = document.querySelector('.gallery-container');
              if (container?.requestFullscreen) {
                container.requestFullscreen();
              }
            }}
            sx={{ color: '#fff' }}
          >
            <FullscreenIcon />
          </IconButton>

          {/* Close Button */}
          <IconButton
            onClick={() => setOpenGallery(false)}
            sx={{ color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Gallery Container - for fullscreen */}
        <Box
          className="gallery-container"
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100vh',
            bgcolor: '#000'
          }}
        >
          {/* Previous Button */}
          <IconButton
            onClick={handlePrevImage}
            sx={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              zIndex: 10
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 40 }} />
          </IconButton>

          {/* Current Image */}
          {movie?.stills && (
            <Box
              component="img"
              className="gallery-image"
              src={typeof movie.stills[currentImageIndex] === 'object' ? movie.stills[currentImageIndex]?.url : movie.stills[currentImageIndex]}
              alt={`Scene ${currentImageIndex + 1}`}
              sx={{
                maxWidth: '85vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                // Fullscreen mode - fill entire screen
                '.gallery-container:fullscreen &': {
                  maxWidth: '100vw',
                  maxHeight: '100vh',
                  width: '100%',
                  height: '100%'
                }
              }}
            />
          )}

          {/* Next Button */}
          <IconButton
            onClick={handleNextImage}
            sx={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              zIndex: 10
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>

        {/* Thumbnail Navigation */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          p: 2,
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0
        }}>
          {movie?.stills?.map((still, idx) => (
            <Box
              key={idx}
              component="img"
              src={typeof still === 'object' ? still.url : still}
              alt={`Thumb ${idx + 1}`}
              onClick={() => setCurrentImageIndex(idx)}
              sx={{
                width: 60,
                height: 40,
                objectFit: 'cover',
                cursor: 'pointer',
                opacity: idx === currentImageIndex ? 1 : 0.5,
                border: idx === currentImageIndex ? '2px solid #fff' : 'none',
                transition: 'opacity 0.3s',
                '&:hover': { opacity: 1 }
              }}
            />
          ))}
        </Box>
      </Dialog>
    </Box >
  );
}

export default MovieDetailPage;
