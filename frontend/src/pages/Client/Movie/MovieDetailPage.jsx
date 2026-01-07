
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Nơi Call đường dẫn API
import { rateMovieAPI, getNowShowingMoviesAPI } from '../../../apis/movieApi';

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

//Components
import { TrailerModal } from '../../../components/Common';

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

const MOCK_MOVIE = {
  _id: '1',
  title: 'Spongebob: Lời Nguyền Hải Tặc 2',
  posterUrl: 'https://image.tmdb.org/t/p/w500/kGzFbGhp99zva6oZODW5atUtnqi.jpg',
  bannerUrl: 'https://image.tmdb.org/t/p/original/kGzFbGhp99zva6oZODW5atUtnqi.jpg',
  duration: 140,
  releaseDate: '2025-12-20',
  views: 2607282,
  rating: 9.1,
  ratingCount: 7,
  ageRating: 'C18',
  country: 'Việt Nam',
  studio: 'Paramount Pictures',
  genres: ['Hành động'],
  director: 'Christopher Nolan',
  actors: [
    { name: 'Robert Downey Jr.', photo: 'https://image.tmdb.org/t/p/w200/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg' },
    { name: 'Tom Cruise', photo: 'https://image.tmdb.org/t/p/w200/8qBylBsQf4llkGrWR3qAsOtOU8O.jpg' },
    { name: 'Chris Hemsworth', photo: 'https://image.tmdb.org/t/p/w200/jpurJ9jAcLCYjgHHfYF32m3zJYm.jpg' },
    { name: 'Scarlett Johansson', photo: 'https://image.tmdb.org/t/p/w200/6NsMbJXRlDZuDzatN2akFdGuTvx.jpg' }
  ],
  // Hình ảnh trong phim
  images: [
    'https://image.tmdb.org/t/p/w500/cqa3sa4c4jevgnEJwq3CMF8UfTG.jpg',
    'https://image.tmdb.org/t/p/w500/jiqD14fg7UTZOT6qgvzTmfRYpWI.jpg',
    'https://image.tmdb.org/t/p/w500/hwBiPkXuXP8oexHzFBmDfnr0cN.jpg',
    'https://image.tmdb.org/t/p/w500/ySS6S4Q9iBuxq68RXUz0zIY4QSC.jpg'
  ],
  description: `Sau khi phát hiện ra bản đồ kho báu cổ xưa, SpongeBob và Patrick bắt đầu cuộc phiêu lưu đầy thú vị để tìm kiếm kho báu huyền thoại của thuyền trưởng cướp biển. Trên hành trình, họ phải đối mặt với lời nguyền bí ẩn và những thử thách khó khăn.
Bộ phim mang đến những pha hành động gay cấn, tiếng cười sảng khoái cùng thông điệp ý nghĩa về tình bạn và lòng dũng cảm.`,
  trailerUrl: 'https://www.youtube.com/watch?v=example',
  status: 'NOW'
};

// Phim đang chiếu cho sidebar
const MOCK_NOW_SHOWING = [
  {
    _id: '2',
    title: 'Thiên Đường Máu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/cdqLnri3NEGcmfnqwk2TSIYtddg.jpg',
    ageRating: 'T18',
    rating: 8.7
  },
  {
    _id: '3',
    title: 'Avatar: Lửa Và Tro Tàn',
    posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCAUMDIoKoRzKDFvX.jpg',
    ageRating: 'T13',
    rating: 9.5
  },
  {
    _id: '4',
    title: 'Ai Thượng Ai Mến',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qPa4kuaUOHEZi90bwpFg54bLqp8.jpg',
    ageRating: 'P',
    rating: 7.2
  }
];

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

  // Load dữ liệu phim
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // TODO: Thay bằng API call thực tế cho movie
        setMovie(MOCK_MOVIE);

        // Fetch phim đang chiếu từ API
        const nowShowingRes = await getNowShowingMoviesAPI(5);
        const nowShowingMovies = nowShowingRes?.data?.movies || [];
        setOtherMovies(nowShowingMovies.filter(m => m._id !== id).slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
        setOtherMovies(MOCK_NOW_SHOWING);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    if (movie?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % movie.images.length);
    }
  };

  const handlePrevImage = () => {
    if (movie?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + movie.images.length) % movie.images.length);
    }
  };

  // Autoplay for gallery
  useEffect(() => {
    let interval;
    if (openGallery && isAutoPlay && movie?.images?.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % movie.images.length);
      }, 3000); // Chuyển ảnh mỗi 3 giây
    }
    return () => clearInterval(interval);
  }, [openGallery, isAutoPlay, movie?.images?.length]);

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
              <Link
                to="/"
                style={{
                  textDecoration: 'none',
                  color: COLORS.textMuted,
                  fontSize: '14px'
                }}
              >
                Trang chủ
              </Link>
              <Link
                to="/the-loai-phim"
                style={{
                  textDecoration: 'none',
                  color: COLORS.textMuted,
                  fontSize: '14px'
                }}
              >
                Phim
              </Link>
              <Typography sx={{ color: COLORS.text, fontSize: '14px', fontWeight: 500 }}>
                {movie.title}
              </Typography>
            </Breadcrumbs>
          </Box>

          <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>

            {/*LEFT COLUMN: Poster + Info*/}
            <Grid item xs={12} md={8}>
              <Grid container spacing={{ xs: 2, md: 3 }}>

                {/* Poster with Play Button */}
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
                    {/* Play Button Overlay */}
                    {movie.trailerUrl && (
                      <Box
                        onClick={() => setOpenTrailerModal(true)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.3s',

                          '&:hover .play-icon': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <Box
                          className="play-icon"
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: '#0000008F',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.3s'
                          }}
                        >
                          <PlayArrowIcon sx={{ fontSize: 35, color: 'white', ml: 0.5 }} />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Movie Details */}
                <Grid item xs={7} sm={8}>
                  {/* Title + Age Rating */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1, md: 2 }, flexWrap: 'wrap' }}>
                    <Typography sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.3rem', md: '1.6rem' },
                      color: COLORS.dark
                    }}>
                      {movie.title}
                    </Typography>
                    <Chip
                      label={movie.ageRating}
                      size="small"
                      sx={{
                        bgcolor: COLORS.orange,
                        color: '#000',
                        fontWeight: 700,
                        fontSize: { xs: '10px', md: '12px' },
                        height: { xs: 20, md: 24 }
                      }}
                    />
                  </Box>

                  {/* Meta Row 1: Duration, Release Date */}
                  <Box sx={{
                    display: 'flex',
                    gap: 4,
                    mb: 1,
                    color: COLORS.textLight
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: { xs: 14, md: 18 } }} />
                      <Typography sx={{ fontSize: { xs: '12px', md: '14px' } }}>
                        {movie.duration} Phút
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: { xs: 14, md: 18 } }} />
                      <Typography sx={{ fontSize: { xs: '12px', md: '14px' } }}>
                        {formatDate(movie.releaseDate)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Meta Row 2: Views, Rating */}
                  <Box sx={{
                    display: 'flex',
                    gap: 4,
                    mb: { xs: 1.5, md: 2.5 },
                    color: COLORS.textLight
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <VisibilityIcon sx={{ fontSize: { xs: 14, md: 18 } }} />
                      <Typography sx={{ fontSize: { xs: '12px', md: '14px' } }}>
                        {movie.views?.toLocaleString() || '0'}
                      </Typography>
                    </Box>
                    {/* Rating - Clickable */}
                    <Box
                      onClick={() => setOpenRatingModal(true)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                      }}
                    >
                      <StarIcon sx={{ fontSize: { xs: 14, md: 18 }, color: COLORS.orange }} />
                      <Typography sx={{ fontSize: { xs: '12px', md: '14px' }, fontWeight: 600 }}>
                        {movie.rating}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '12px', md: '14px' }, color: COLORS.textMuted }}>
                        ({movie.ratingCount || 0} đánh giá)
                      </Typography>
                    </Box>
                  </Box>

                  {/* Details Grid */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr',
                    gap: 1,
                    fontSize: '0.85rem'
                  }}>
                    {/* Quốc gia */}
                    <Typography sx={{ color: '#4A4A4A' }}>Quốc gia:</Typography>
                    <Typography sx={{
                      color: COLORS.text,
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: (movie.country || 'Việt Nam') === 'Việt Nam' ? '#e53935' : COLORS.text
                      }
                    }}>
                      {movie.country || 'Việt Nam'}
                    </Typography>

                    {/* Nhà sản xuất */}
                    <Typography sx={{ color: '#4A4A4A' }}>Nhà sản xuất:</Typography>
                    <Typography sx={{ color: COLORS.text }}>{movie.studio || 'NMN Studio'}</Typography>

                    {/* Thể loại */}
                    <Typography sx={{ color: '#4A4A4A' }}>Thể loại:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {movie.genres?.length > 0 ? movie.genres.map((genre, idx) => (
                        <Chip
                          key={idx}
                          label={typeof genre === 'string' ? genre : genre?.name}
                          size="small"
                          variant="outlined"
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
                              color: '#1a3a5c',
                              borderColor: '#1a3a5c'
                            }
                          }}
                        />
                      )) : (
                        <Typography sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>Chưa cập nhật</Typography>
                      )}
                    </Box>

                    {/* Đạo diễn */}
                    <Typography sx={{ color: '#4A4A4A' }}>Đạo diễn:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {movie.director ? (
                        <Chip
                          label={movie.director}
                          size="small"
                          variant="outlined"
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
                              color: '#1a3a5c',
                              borderColor: '#1a3a5c'
                            }
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>Chưa cập nhật</Typography>
                      )}
                    </Box>

                    {/* Diễn viên */}
                    <Typography sx={{ color: '#4A4A4A' }}>Diễn viên:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {movie.actors?.length > 0 ? movie.actors.map((actor, idx) => (
                        <Chip
                          key={idx}
                          label={typeof actor === 'string' ? actor : actor?.name}
                          size="small"
                          variant="outlined"
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
                              color: '#1a3a5c',
                              borderColor: '#1a3a5c'
                            }
                          }}
                        />
                      )) : (
                        <Typography sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>Chưa cập nhật</Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/*NỘI DUNG PHIM*/}
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
                  NỘI DUNG PHIM
                </Typography>
                <Typography sx={{
                  color: COLORS.text,
                  lineHeight: 1.8,
                  fontSize: '14px',
                  whiteSpace: 'pre-line'
                }}>
                  {movie.description || <span style={{ color: COLORS.textMuted, fontStyle: 'italic' }}>Chưa cập nhật</span>}
                </Typography>
              </Box>

              {/* HÌNH TRONG PHIM */}
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
                {movie.images && movie.images.length > 0 ? (
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                    gap: 1.5
                  }}>
                    {movie.images.map((img, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={img}
                        alt={`Scene ${idx + 1}`}
                        onClick={() => handleOpenGallery(idx)}
                        sx={{
                          width: 174,
                          height: 116,
                          objectFit: 'cover',
                          cursor: 'pointer',
                          transition: 'transform 0.3s',
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>Chưa cập nhật</Typography>
                )}
              </Box>

              {/* DIỄN VIÊN */}
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
                          src={typeof actor === 'object' ? actor.photo : 'https://via.placeholder.com/110'}
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
                  BÌNH LUẬN PHIM
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f8f8f8' }} elevation={0}>
                  <Typography color="text.secondary" fontSize="14px">
                    Đăng nhập để bình luận về phim này
                  </Typography>
                </Paper>
              </Box>
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
          {movie?.images && (
            <Box
              component="img"
              className="gallery-image"
              src={movie.images[currentImageIndex]}
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
          {movie?.images?.map((img, idx) => (
            <Box
              key={idx}
              component="img"
              src={img}
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
    </Box>
  );
}

export default MovieDetailPage;
