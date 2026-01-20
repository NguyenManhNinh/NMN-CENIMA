import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Import APIs
import { getGenreBySlugAPI, toggleGenreLikeAPI, rateGenreAPI, incrementGenreViewAPI } from '../../../apis/genreApi';
import { getNowShowingMoviesAPI } from '../../../apis/movieApi';

// Import MUI Components
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Paper,
  Breadcrumbs,
  Dialog,
  DialogContent,
  IconButton,
  Rating,
  CircularProgress
} from '@mui/material';

// Import các biểu tượng từ Material UI
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

// Các thành phần (Components)
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

// Fallback image (data URI - không cần network request, chặn loop onError)
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

// Helper: Xử lý lỗi ảnh - chặn infinite loop
const handleImageError = (e) => {
  e.target.onerror = null; // Chặn loop nếu fallback cũng fail
  e.target.src = FALLBACK_IMAGE;
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

// COMPONENT CHÍNH - TRANG CHI TIẾT BÀI VIẾT (GENRES)
function GenresDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Khởi tạo State
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherMovies, setOtherMovies] = useState([]);

  // State cho Modal Đánh giá
  const [openRatingModal, setOpenRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);

  // State cho Modal Trailer
  const [openTrailerModal, setOpenTrailerModal] = useState(false);

  // State cho Thư viện ảnh (Lightbox)
  const [openGallery, setOpenGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);


  // Hooks xử lý giao diện Responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Ref để ngăn gọi API 2 lần (do StrictMode)
  const viewIncrementedRef = useRef({});

  // Thời gian chờ giữa các lần tính lượt xem (30 phút = 30 * 60 * 1000 ms)
  const VIEW_COOLDOWN_MS = 30 * 60 * 1000;

  // Tải dữ liệu bài viết từ API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch chi tiết Genre (bài viết) từ API
        const genreRes = await getGenreBySlugAPI(slug);
        const genreData = genreRes?.data || genreRes;

        // Biến để lưu viewCount có thể đã được tăng
        let updatedViewCount = genreData?.viewCount || 0;

        // Tăng lượt xem bài viết (với cooldown window 30 phút)
        if (genreData?._id && !viewIncrementedRef.current[genreData._id]) {
          viewIncrementedRef.current[genreData._id] = true;

          const viewKey = `genre_view_${genreData._id}`;
          const lastViewTime = localStorage.getItem(viewKey);
          const now = Date.now();

          // Chỉ tăng view nếu chưa xem hoặc đã quá cooldown window
          if (!lastViewTime || (now - parseInt(lastViewTime, 10)) > VIEW_COOLDOWN_MS) {
            localStorage.setItem(viewKey, now.toString());
            try {
              const viewRes = await incrementGenreViewAPI(genreData._id);
              // Cập nhật viewCount từ response API
              if (viewRes?.viewCount) {
                updatedViewCount = viewRes.viewCount;
              } else {
                // Fallback: tăng thủ công nếu API không trả viewCount
                updatedViewCount = (genreData?.viewCount || 0) + 1;
              }
            } catch (err) {
              console.log('View increment failed:', err);
              // Vẫn tăng thủ công để UI hiển thị đúng
              updatedViewCount = (genreData?.viewCount || 0) + 1;
            }
          }
        }

        // Set genre với viewCount đã cập nhật
        setGenre({
          ...genreData,
          viewCount: updatedViewCount
        });

        // Fetch phim đang chiếu từ API cho sidebar
        const nowShowingRes = await getNowShowingMoviesAPI(5);
        const nowShowingMovies = nowShowingRes?.data?.movies || [];
        setOtherMovies(nowShowingMovies.slice(0, 4));

      } catch (error) {
        console.error('Error fetching genre data:', error);
        setGenre(null);
        setOtherMovies([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);





  // Xử lý sự kiện mua vé (không áp dụng cho genres - giữ lại để tương thích)
  const handleBuyTicket = () => {
    // Genres không có chức năng mua vé
    navigate('/the-loai-phim');
  };

  // Xử lý thư viện ảnh
  const handleOpenGallery = (index) => {
    setCurrentImageIndex(index);
    setOpenGallery(true);
  };

  const handleNextImage = () => {
    if (genre?.stills) {
      setCurrentImageIndex((prev) => (prev + 1) % genre.stills.length);
    }
  };

  const handlePrevImage = () => {
    if (genre?.stills) {
      setCurrentImageIndex((prev) => (prev - 1 + genre.stills.length) % genre.stills.length);
    }
  };

  // Tự động chuyển ảnh cho thư viện
  useEffect(() => {
    let interval;
    if (openGallery && isAutoPlay && genre?.stills?.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % genre.stills.length);
      }, 3000); // Chuyển ảnh mỗi 3 giây
    }
    return () => clearInterval(interval);
  }, [openGallery, isAutoPlay, genre?.stills?.length]);

  // Hiển thị màn hình chờ (Loading)
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

  // Không tìm thấy bài viết
  if (!genre) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6" gutterBottom>Không tìm thấy bài viết</Typography>
        <Button onClick={() => navigate('/the-loai-phim')} variant="outlined">Quay lại danh sách</Button>
      </Box>
    );
  }

  // THÀNH PHẦN PHỤ: Hàng thông tin chi tiết
  const DetailItem = ({ label, value }) => {
    // Helper function để đảm bảo chỉ render string
    const getDisplayValue = (item) => {
      if (item === null || item === undefined) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item.name) return item.name;
      return String(item);
    };

    // Helper function để tạo slug từ tên thể loại
    const createSlug = (name) => {
      return name
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng -
        .replace(/[^\w-]/g, ''); // Bỏ ký tự đặc biệt
    };

    // Handle array or single value
    // Nếu value là string chứa dấu phẩy (ví dụ: "Anthony Russo, Joe Russo"), tách thành mảng
    let items;
    if (Array.isArray(value)) {
      items = value;
    } else if (typeof value === 'string' && value.includes(',') && (label === 'Đạo diễn' || label === 'Diễn viên')) {
      // Tách chuỗi thành mảng các tên riêng biệt
      items = value.split(',').map(s => s.trim()).filter(s => s);
    } else {
      items = [value];
    }

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
            Đang cập nhật
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

            // Nếu là Thể loại thì render Link
            if (label === 'Thể loại') {
              const slug = createSlug(displayValue);
              return (
                <Box component="span" key={index}>
                  <Link
                    to={`/the-loai-phim/${slug}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#1a3a5c'}
                    onMouseLeave={(e) => e.target.style.color = 'inherit'}
                  >
                    {displayValue}
                  </Link>
                  {index < items.length - 1 && ', '}
                </Box>
              );
            }

            // Nếu là Đạo diễn thì render Link
            if (label === 'Đạo diễn') {
              const slug = createSlug(displayValue);
              return (
                <Box component="span" key={index}>
                  <Link
                    to={`/dao-dien-chi-tiet/${slug}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#1a3a5c'}
                    onMouseLeave={(e) => e.target.style.color = 'inherit'}
                  >
                    {displayValue}
                  </Link>
                  {index < items.length - 1 && ', '}
                </Box>
              );
            }

            // Nếu là Diễn viên thì render Link
            if (label === 'Diễn viên') {
              const slug = createSlug(displayValue);
              return (
                <Box component="span" key={index}>
                  <Link
                    to={`/dien-vien-chi-tiet/${slug}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#1a3a5c'}
                    onMouseLeave={(e) => e.target.style.color = 'inherit'}
                  >
                    {displayValue}
                  </Link>
                  {index < items.length - 1 && ', '}
                </Box>
              );
            }

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

      {/* NỘI DUNG CHÍNH */}
      <Box sx={{ bgcolor: COLORS.white, pb: 5 }}>
        <Container maxWidth="lg">

          {/* Thanh điều hướng (Breadcrumbs) */}
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
                {genre.name}
              </Typography>
            </Breadcrumbs>
          </Box>

          <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>

            {/* CỘT TRÁI: Nội dung chính */}
            <Grid item xs={12} md={8}>

              {/* PHẦN ĐẦU TRANG (RESPONSIVE) */}
              {isMobile ? (
                /* GIAO DIỆN MOBILE: Dạng chồng */
                <Box sx={{ mb: 4 }}>
                  {/* 1. Mobile Banner (Landscape) */}
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box
                      component="img"
                      src={genre.bannerUrl || genre.imageUrl}
                      alt={genre.name}
                      onError={handleImageError}
                      sx={{
                        width: '100%',
                        aspectRatio: '16/9',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    {/* Play Button Overlay */}
                    {genre.trailerUrl && (
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
                        {genre.name}
                      </Typography>
                      <Chip
                        label={genre.ageRating}
                        size="small"
                        sx={{
                          bgcolor: COLORS.orange, color: '#fff', fontWeight: 700,
                          height: 22, fontSize: '10px', borderRadius: '4px', mt: 0.5
                        }}
                      />
                    </Box>

                    {/* Meta Info */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 8, rowGap: 1.5, mb: 2, color: COLORS.textLight, fontSize: '12px' }}>
                      {/* Duration - Ẩn nếu không có */}
                      {genre.duration && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 16 }} />
                          <Typography fontSize="inherit" fontWeight={500}>{genre.duration} Phút</Typography>
                        </Box>
                      )}
                      {/* Release Date - Hiển thị createdAt nếu không có releaseDate */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon sx={{ fontSize: 16 }} />
                        <Typography fontSize="inherit" fontWeight={500}>
                          {formatDate(genre.releaseDate || genre.createdAt)}
                        </Typography>
                      </Box>
                      {/* View Count */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <VisibilityIcon sx={{ fontSize: 16, color: '#999' }} />
                        <Typography fontSize="inherit">{genre.viewCount?.toLocaleString() || 0}</Typography>
                      </Box>
                      {/* Rating */}
                      <Box
                        onClick={() => setOpenRatingModal(true)}
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', lineHeight: 1 }}
                      >
                        <StarIcon sx={{ fontSize: 16, color: COLORS.orange, display: 'block' }} />
                        <Typography fontSize="inherit" fontWeight={700} color="#333" sx={{ lineHeight: 1 }}>
                          {genre.rating || 0}
                        </Typography>
                        <Typography fontSize="inherit" color="#999" sx={{ lineHeight: 1 }}>
                          ({genre.ratingCount || 0} đánh giá)
                        </Typography>
                      </Box>
                    </Box>

                    {/* Details List */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                      <DetailItem label="Quốc gia" value={genre.country} />
                      <DetailItem label="Diễn viên" value={genre.actors} />
                      <DetailItem label="Nhà sản xuất" value={genre.studio} />
                      <DetailItem label="Thể loại" value={genre.category} />
                      <DetailItem label="Đạo diễn" value={genre.director} />

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
                        {genre.description || 'Đang cập nhật nội dung.'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                /* GIAO DIỆN DESKTOP: Dạng lưới song song */
                <>
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    {/* Poster + Play */}
                    <Grid item xs={5} sm={4}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={genre.imageUrl}
                          alt={genre.name}
                          onError={handleImageError}
                          sx={{
                            width: '100%',
                            maxWidth: { xs: 160, sm: 200, md: 240 },
                            height: { xs: 220, sm: 280, md: 360 },
                            objectFit: 'cover',
                            borderRadius: 2
                          }}
                        />
                        {genre.trailerUrl && (
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
                          {genre.name}
                        </Typography>
                        <Chip label={genre.ageRating} size="small" sx={{ bgcolor: COLORS.orange, color: '#000', fontWeight: 700 }} />
                      </Box>

                      {/* Meta */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 1, color: COLORS.textLight }}>
                        {/* Duration - Ẩn nếu không có */}
                        {genre.duration && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon fontSize="small" /> <Typography>{genre.duration} Phút</Typography>
                          </Box>
                        )}
                        {/* Release Date - fallback to createdAt */}
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, lineHeight: 1 }}>
                          <CalendarTodayIcon sx={{ fontSize: 16, display: 'block' }} />
                          <Typography fontSize="inherit" fontWeight={500} sx={{ lineHeight: 1 }}>
                            {formatDate(genre.releaseDate || genre.createdAt)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: COLORS.textLight }}>
                          <VisibilityIcon fontSize="small" /> <Typography>{genre.viewCount?.toLocaleString() || 0}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => setOpenRatingModal(true)}>
                          <StarIcon sx={{ fontSize: 16, color: COLORS.orange, position: 'relative', top: 1 }} />
                          <Typography fontWeight={600}>{genre.rating || 0}</Typography>
                          <Typography color={COLORS.textMuted}>({genre.ratingCount || 0} đánh giá)</Typography>
                        </Box>
                      </Box>

                      {/* Details Grid */}
                      {/* Lưới thông tin chi tiết */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <DetailItem label="Quốc gia" value={genre.country || 'Đang cập nhật'} />
                        <DetailItem label="Nhà sản xuất" value={genre.studio || 'Đang cập nhật'} />
                        <DetailItem label="Thể loại" value={genre.category || ['Đang cập nhật']} />
                        <DetailItem label="Đạo diễn" value={genre.director || 'Đang cập nhật'} />
                        <DetailItem label="Diễn viên" value={genre.actors?.map(a => a.name || a) || ['Đang cập nhật']} />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Mô tả phim (Desktop) */}
                  <Box sx={{ mt: 4 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '18px', color: COLORS.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1, '&::before': { content: '""', width: 4, height: 20, bgcolor: COLORS.primary, borderRadius: 1 } }}>
                      NỘI DUNG PHIM
                    </Typography>
                    <Typography sx={{ color: COLORS.text, lineHeight: 1.8, fontSize: '14px', whiteSpace: 'pre-line', textAlign: 'justify' }}>
                      {genre.description}
                    </Typography>
                  </Box>
                </>
              )}

              {/* HÌNH TRONG PHIM - Dùng chung */}
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
                {genre.stills && genre.stills.length > 0 ? (
                  <Box sx={{
                    display: { xs: 'flex', sm: 'grid' },
                    gridTemplateColumns: { sm: 'repeat(4, 1fr)' },
                    overflowX: { xs: 'auto', sm: 'visible' },
                    gap: 1.5,
                    pb: { xs: 1, sm: 0 }, // Add padding bottom for scrollbar spacing on mobile if needed
                    '::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for cleaner look
                    scrollbarWidth: 'none'
                  }}>
                    {genre.stills.map((still, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={typeof still === 'object' ? still.url : still}
                        alt={`Scene ${idx + 1}`}
                        onClick={() => handleOpenGallery(idx)}
                        onError={handleImageError}
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
                  <Typography sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>Đang cập nhật</Typography>
                )
                }
              </Box>

              {/* DIỄN VIÊN - Dùng chung */}
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
                {genre.actors && genre.actors.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {genre.actors.map((actor, idx) => {
                      const actorName = (typeof actor === 'object' ? actor.name : actor) || 'Đang cập nhật';
                      const actorSlug = actorName !== 'Đang cập nhật'
                        ? actorName
                          ?.toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/đ/g, 'd')
                          .replace(/Đ/g, 'D')
                          .replace(/\s+/g, '-')
                          .replace(/[^\w-]/g, '')
                        : null;
                      return (
                        <Box
                          key={idx}
                          component={actorSlug ? Link : 'div'}
                          to={actorSlug ? `/dien-vien-chi-tiet/${actorSlug}` : undefined}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            width: { xs: '100%', sm: '48%' },
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'all 0.2s',
                            '&:hover': {
                              '& .actor-name': { color: actorSlug ? COLORS.primary : 'inherit' }
                            }
                          }}
                        >
                          <Box
                            component="img"
                            src={(typeof actor === 'object' && actor.photoUrl) ? actor.photoUrl : FALLBACK_IMAGE}
                            alt={actorName}
                            onError={handleImageError}
                            sx={{
                              width: 128,
                              height: 85,
                              objectFit: 'cover',
                              flexShrink: 0,
                              cursor: actorSlug ? 'pointer' : 'default'
                            }}
                          />
                          <Typography
                            className="actor-name"
                            sx={{
                              fontSize: '14px',
                              fontWeight: 500,
                              color: actorName === 'Đang cập nhật' ? COLORS.textMuted : COLORS.text,
                              fontStyle: actorName === 'Đang cập nhật' ? 'italic' : 'normal',
                              transition: 'color 0.2s'
                            }}
                          >
                            {actorName}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>Đang cập nhật</Typography>
                )}
              </Box>

              {/* BÌNH LUẬN PHIM */}
              <CommentSection genreId={genre?._id} user={user} />
            </Grid>

            {/* ===== CỘT PHẢI: Thanh bên - Phim đang chiếu ===== */}
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

                {/* genre Cards - Vertical Layout */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {otherMovies.slice(0, 3).map((otherMovie) => (
                    <Box
                      key={otherMovie._id}
                      component={Link}
                      to={`/dat-ve/${otherMovie.slug}`}
                      sx={{
                        textDecoration: 'none',
                        display: 'block',
                        '&:hover .genre-overlay': {
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
                          alt={otherMovie.name}
                          onError={handleImageError}
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
                          className="genre-overlay"
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

                      {/* genre Title - Below Poster */}
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
                        {otherMovie.name}
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

      {/* ==================== MODAL ĐÁNH GIÁ (RATING) ==================== */}
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

        {/* genre Banner */}
        <Box
          sx={{
            width: '100%',
            height: 250,
            background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${genre?.bannerUrl || genre?.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <DialogContent sx={{ textAlign: 'center', pb: 4 }}>
          {/* genre Title */}
          <Typography sx={{ fontWeight: 700, fontSize: '18px', color: COLORS.dark, mb: 3 }}>
            {genre?.name}
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
              {genre?.rating}
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: COLORS.textMuted }}>
              ({genre?.ratingCount || 0} đánh giá)
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
                  const result = await rateGenreAPI(genre._id, userRating);
                  // Update local genre state with new rating
                  setGenre(prev => ({
                    ...prev,
                    rating: result?.data?.rating || result?.rating,
                    ratingCount: result?.data?.ratingCount || result?.ratingCount
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

      {/* ==================== MODAL TRAILER ==================== */}
      <TrailerModal
        open={openTrailerModal}
        onClose={() => setOpenTrailerModal(false)}
        trailerUrl={genre?.trailerUrl}
        movieTitle={genre?.name}
      />

      {/* ==================== THƯ VIỆN ẢNH (LB) ==================== */}
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
          {genre?.stills && (
            <Box
              component="img"
              className="gallery-image"
              src={typeof genre.stills[currentImageIndex] === 'object' ? genre.stills[currentImageIndex]?.url : genre.stills[currentImageIndex]}
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
          {genre?.stills?.map((still, idx) => (
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

export default GenresDetailPage;
