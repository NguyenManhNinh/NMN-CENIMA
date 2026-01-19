import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Material UI Components
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Breadcrumbs,
  Dialog,
  IconButton,
  CircularProgress
} from '@mui/material';

// Material UI Icons
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import StarIcon from '@mui/icons-material/Star';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

// API calls
import { getPersonBySlugAPI, incrementPersonViewAPI, togglePersonLikeAPI } from '@/apis/personApi';
import { getNowShowingMoviesAPI } from '@/apis/movieApi';

// Constants
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

const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 giờ

// Helper Functions
const formatDate = (dateString) => {
  if (!dateString) return 'Chưa cập nhật';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Fallback image (data URI - không cần network request, chặn loop onError)
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

// Helper: Xử lý lỗi ảnh - chặn infinite loop
const handleImageError = (e) => {
  e.target.onerror = null; // Chặn loop nếu fallback cũng fail
  e.target.src = FALLBACK_IMAGE;
};

// MAIN COMPONENT
function FilmDirectorDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // States
  const [director, setDirector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarMovies, setSidebarMovies] = useState([]);

  // Gallery states
  const [openGallery, setOpenGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Like state
  const [isLiked, setIsLiked] = useState(false);

  // View count tracking
  const viewIncrementedRef = useRef({});

  // Fetch Director Data bằng API thật
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch director và sidebar movies song song
        const [directorRes, moviesRes] = await Promise.all([
          getPersonBySlugAPI(slug),
          getNowShowingMoviesAPI(5)
        ]);

        const directorData = directorRes?.data;

        // Validate: không tìm thấy hoặc không phải đạo diễn
        if (!directorData || !['director', 'both'].includes(directorData.role)) {
          setDirector(null);
          return;
        }

        // View count với 24h cooldown + useRef guard tránh StrictMode double-call
        let incrementedViewCount = directorData.viewCount || 0;
        if (directorData?._id && !viewIncrementedRef.current[directorData._id]) {
          viewIncrementedRef.current[directorData._id] = true;
          const viewKey = `director_view_${directorData._id}`;
          const lastViewTime = localStorage.getItem(viewKey);
          const now = Date.now();

          if (!lastViewTime || (now - parseInt(lastViewTime, 10)) > VIEW_COOLDOWN_MS) {
            try {
              const viewRes = await incrementPersonViewAPI(directorData._id);
              incrementedViewCount = viewRes?.data?.viewCount ?? (incrementedViewCount + 1);
              localStorage.setItem(viewKey, now.toString());
            } catch (viewError) {
              console.error('Lỗi tăng view count:', viewError);
            }
          }
        }

        // Mapping fields cho UI
        const mappedDirector = {
          ...directorData,
          viewCount: incrementedViewCount,
          filmography: directorData.filmography || directorData.moviesAsDirector || [],
          photos: directorData.gallery?.map(g => g.url || g) || [],
          biography: directorData.fullBio || ''
        };

        setDirector(mappedDirector);

        // Parse sidebar movies (robust cho nhiều response format)
        const movies = moviesRes?.data?.movies || moviesRes?.movies || moviesRes?.data || moviesRes || [];
        setSidebarMovies(Array.isArray(movies) ? movies : []);

      } catch (error) {
        console.error('Lỗi khi tải dữ liệu đạo diễn:', error);
        setDirector(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Khởi tạo like state từ localStorage
  useEffect(() => {
    if (director?._id) {
      const likeKey = `director_liked_${director._id}`;
      setIsLiked(localStorage.getItem(likeKey) === 'true');
    }
  }, [director?._id]);

  // Like loading state - chống spam click
  const [likeLoading, setLikeLoading] = useState(false);

  // Toggle Like Handler - API thật
  const handleToggleLike = async () => {
    if (!director?._id) return;

    // Chống spam click
    if (likeLoading) return;

    const likeKey = `director_liked_${director._id}`;
    const currentLiked = localStorage.getItem(likeKey) === 'true';
    const prevCount = director.likeCount || 0;

    // Set loading
    setLikeLoading(true);

    // Optimistic update
    const newLiked = !currentLiked;
    const action = newLiked ? 'like' : 'unlike';
    setIsLiked(newLiked);
    localStorage.setItem(likeKey, newLiked.toString());
    setDirector(prev => ({
      ...prev,
      likeCount: currentLiked
        ? Math.max((prev.likeCount || 1) - 1, 0)
        : (prev.likeCount || 0) + 1
    }));

    // Call API thật
    try {
      const res = await togglePersonLikeAPI(director._id, action);
      // Sync likeCount từ response backend (chính xác hơn)
      setDirector(prev => ({
        ...prev,
        likeCount: res?.data?.likeCount ?? prev.likeCount
      }));
    } catch (error) {
      console.error('Lỗi toggle like:', error);
      // Rollback on error
      localStorage.setItem(likeKey, currentLiked.toString());
      setIsLiked(currentLiked);
      setDirector(prev => ({
        ...prev,
        likeCount: prevCount
      }));
    } finally {
      setLikeLoading(false);
    }
  };

  // Gallery Handlers
  const handleOpenGallery = (index) => {
    setCurrentImageIndex(index);
    setOpenGallery(true);
  };

  const handleNextImage = () => {
    if (director?.photos) {
      setCurrentImageIndex((prev) => (prev + 1) % director.photos.length);
    }
  };

  const handlePrevImage = () => {
    if (director?.photos) {
      setCurrentImageIndex((prev) => (prev - 1 + director.photos.length) % director.photos.length);
    }
  };

  // Autoplay
  useEffect(() => {
    let interval;
    if (openGallery && isAutoPlay && director?.photos?.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % director.photos.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [openGallery, isAutoPlay, director?.photos?.length]);

  // Navigate handlers
  const handleMovieClick = (movieSlug) => {
    navigate(`/phim/${movieSlug}`);
  };

  // LOADING SCREEN
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
        <Box
          component="img"
          src="/NMN_CENIMA_LOGO.png"
          alt="NMN Cinema"
          sx={{ width: 200, height: 200, mb: 1.5, objectFit: 'contain' }}
        />
        <CircularProgress size={40} thickness={2} sx={{ color: '#F5A623', mb: 2 }} />
        <Typography
          sx={{
            color: '#FFA500',
            fontSize: '1.2rem',
            fontWeight: 600,
            fontFamily: '"Montserrat", sans-serif',
            letterSpacing: '0.5px'
          }}
        >
          Đang tải...
        </Typography>
      </Box>
    );
  }

  // 404 SCREEN
  //NOT FOUND SCREEN
  if (!director) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6" gutterBottom>Không tìm thấy đạo diễn</Typography>
        <Button onClick={() => navigate('/dao-dien')} variant="outlined">
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  const bgColor = '#4285F4';
  const age = calculateAge(director.birthDate);

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link to="/" style={{ textDecoration: 'none', color: COLORS.textLight, fontSize: '14px' }}>
            Trang chủ
          </Link>
          <Link to="/dao-dien" style={{ textDecoration: 'none', color: COLORS.textLight, fontSize: '14px' }}>
            Đạo diễn
          </Link>
          <Typography sx={{ color: COLORS.text, fontSize: '14px' }}>{director.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* HEADER: Ảnh + Thông tin */}
            <Grid container spacing={{ xs: 0, md: 3 }}>
              {/* Ảnh đại diện */}
              <Grid item xs={12} md={4}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  mb: { xs: 2, md: 0 }
                }}>
                  <Box
                    sx={{
                      width: { xs: 180, sm: 200, md: 280 },
                      aspectRatio: '2 / 3',
                      borderRadius: { xs: '10px', md: 0 },
                      overflow: 'hidden',
                      boxShadow: 'none',
                      bgcolor: 'transparent',
                    }}
                  >
                    <Box
                      component="img"
                      src={director.photoUrl}
                      alt={director.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center 20%',
                        display: 'block',
                      }}
                      onError={handleImageError}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Thông tin cá nhân - Responsive Layout */}
              <Grid item xs={12} md={8}>
                {/* Tên đạo diễn */}
                <Typography sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.4rem', sm: '1.6rem', md: '2rem' },
                  color: COLORS.dark,
                  mb: 1.5,
                  lineHeight: 1.2,
                  textAlign: { xs: 'center', md: 'left' }
                }}>
                  {director.name}
                </Typography>

                {/* Hàng nút hành động: Like + View count */}
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  gap: 1,
                  mb: 2
                }}>
                  {/* Nút Like */}
                  <Button
                    variant="contained"
                    onClick={handleToggleLike}
                    disabled={likeLoading}
                    disableRipple
                    disableElevation
                    startIcon={<ThumbUpIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      backgroundColor: bgColor,
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: { xs: '12px', md: '13px' },
                      px: { xs: 2, md: 2.4 },
                      py: 0.5,
                      minWidth: 'auto',
                      height: { xs: '30px', md: '32px' },
                      borderRadius: '4px',
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: bgColor,
                        boxShadow: 'none',
                      },
                      '&:active': {
                        backgroundColor: bgColor,
                        boxShadow: 'none',
                      },
                      '&:focus': {
                        backgroundColor: bgColor,
                      },
                      '&.Mui-focusVisible': {
                        backgroundColor: bgColor,
                        boxShadow: 'none',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: bgColor,
                        color: '#fff',
                        opacity: 0.7,
                      },
                    }}
                  >
                    {formatNumber(director.likeCount || 0)}
                  </Button>

                  {/* Badge lượt xem */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    px: 1.5,
                    fontSize: { xs: '12px', md: '13px' },
                    height: { xs: '30px', md: '32px' },
                    bgcolor: '#fff'
                  }}>
                    <VisibilityIcon sx={{ fontSize: 18, color: '#666' }} />
                    <Typography sx={{ fontSize: 'inherit', color: '#666', fontWeight: 500 }}>
                      {formatNumber(director.viewCount || 0)}
                    </Typography>
                  </Box>
                </Box>

                {/* Giới thiệu ngắn - Line clamp trên mobile */}
                {director.shortBio && (
                  <Typography sx={{
                    fontStyle: 'italic',
                    fontSize: { xs: '13px', md: '14px' },
                    color: '#555',
                    lineHeight: 1.7,
                    mb: 2.5,
                    textAlign: { xs: 'justify', md: 'left' },
                    display: { xs: '-webkit-box', md: 'block' },
                    WebkitLineClamp: { xs: 4, md: 'unset' },
                    WebkitBoxOrient: 'vertical',
                    overflow: { xs: 'hidden', md: 'visible' }
                  }}>
                    {director.shortBio}
                  </Typography>
                )}

                {/* Thông tin chi tiết - Box có nền trên mobile */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  bgcolor: { xs: '#f8f9fa', md: 'transparent' },
                  border: { xs: '1px solid #eee', md: 'none' },
                  borderRadius: { xs: '8px', md: 0 },
                  p: { xs: 2, md: 0 }
                }}>
                  {/* Ngày sinh */}
                  {director.birthDate && (
                    <Typography sx={{ fontSize: { xs: '13px', md: '14px' } }}>
                      <Box component="span" sx={{ color: '#888' }}>Ngày sinh: </Box>
                      <Box component="span" sx={{ color: '#333', fontWeight: 500 }}>
                        {formatDate(director.birthDate)}
                      </Box>
                    </Typography>
                  )}

                  {/* Chiều cao */}
                  {director.height && (
                    <Typography sx={{ fontSize: { xs: '13px', md: '14px' } }}>
                      <Box component="span" sx={{ color: '#888' }}>Chiều cao: </Box>
                      <Box component="span" sx={{ color: '#333', fontWeight: 500 }}>
                        {director.height}
                      </Box>
                    </Typography>
                  )}

                  {/* Quốc tịch */}
                  {director.nationality && (
                    <Typography sx={{ fontSize: { xs: '13px', md: '14px' } }}>
                      <Box component="span" sx={{ color: '#888' }}>Quốc tịch: </Box>
                      <Box component="span" sx={{ color: '#333', fontWeight: 500 }}>
                        {director.nationality}
                      </Box>
                    </Typography>
                  )}

                  {/* Nơi sinh */}
                  {director.birthPlace && (
                    <Typography sx={{ fontSize: { xs: '13px', md: '14px' } }}>
                      <Box component="span" sx={{ color: '#888' }}>Nơi sinh: </Box>
                      <Box component="span" sx={{ color: '#333', fontWeight: 500 }}>
                        {director.birthPlace}
                      </Box>
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Gallery Section */}
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
                HÌNH ẢNH ĐẠO DIỄN
              </Typography>

              {director.photos?.length > 0 ? (
                <Box sx={{
                  display: { xs: 'flex', sm: 'grid' },
                  gridTemplateColumns: { sm: 'repeat(4, 1fr)' },
                  overflowX: { xs: 'auto', sm: 'visible' },
                  gap: 1.5,
                  pb: { xs: 1, sm: 0 },
                  '::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none'
                }}>
                  {director.photos.map((photo, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={photo}
                      alt={`${director.name} - ${idx + 1}`}
                      onClick={() => handleOpenGallery(idx)}
                      onError={handleImageError}
                      sx={{
                        width: { xs: '200px', sm: '100%' },
                        flexShrink: 0,
                        aspectRatio: '16/9',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        transition: 'transform 0.3s',
                        '&:hover': { transform: { sm: 'scale(1.05)' } }
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>
                  Chưa cập nhật
                </Typography>
              )}
            </Box>

            {/* SECTION: PHIM ĐÃ THAM GIA */}
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
                PHIM ĐÃ THAM GIA
              </Typography>

              {director.filmography && director.filmography.length > 0 ? (
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: { xs: 2, md: 2.5 }
                }}>
                  {director.filmography.map((movie) => (
                    <Box
                      key={movie.slug || movie._id}
                      component={Link}
                      to={`/phim/${movie.slug}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        textDecoration: 'none',
                        color: 'inherit',
                        p: 1,
                        borderRadius: 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Box
                        component="img"
                        src={movie.posterUrl}
                        alt={movie.title}
                        onError={handleImageError}
                        sx={{
                          width: { xs: 90, md: 100 },
                          height: { xs: 60, md: 65 },
                          objectFit: 'cover',
                          borderRadius: '8px',
                          flexShrink: 0,
                          bgcolor: '#f0f0f0'
                        }}
                      />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          className="movie-title"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '13px', md: '14px' },
                            color: COLORS.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {movie.title}
                        </Typography>

                        <Typography sx={{
                          fontSize: { xs: '12px', md: '13px' },
                          color: movie.role ? COLORS.textLight : COLORS.textMuted,
                          fontStyle: movie.role ? 'normal' : 'italic',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          mt: 0.25
                        }}>
                          {movie.role || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>
                  Chưa cập nhật
                </Typography>
              )}
            </Box>

            {/*SECTION: TIỂU SỬ */}
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
                TIỂU SỬ
              </Typography>
              <Typography sx={{
                color: COLORS.text,
                lineHeight: 1.8,
                fontSize: '14px',
                whiteSpace: 'pre-line',
                textAlign: 'justify'
              }}>
                {director.fullBio || director.biography || 'Chưa cập nhật tiểu sử.'}
              </Typography>
            </Box>
          </Grid>

          {/* Thanh bên - Phim đang chiếu */}
          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              {/* Tiêu đề */}
              <Typography sx={{
                fontWeight: 600,
                fontSize: '18px',
                color: '#4A4A4A',
                mb: 2,
                textTransform: 'uppercase'
              }}>
                Phim đang chiếu
              </Typography>

              {/* Thẻ phim - Dọc */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sidebarMovies.slice(0, 3).map((movie) => (
                  <Box
                    key={movie._id}
                    component={Link}
                    to={`/dat-ve/${movie.slug}`}
                    sx={{
                      textDecoration: 'none',
                      display: 'block',
                      '&:hover .movie-overlay': {
                        opacity: 1
                      }
                    }}
                  >
                    {/* Poster phim */}
                    <Box sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      aspectRatio: '16/9',
                      borderRadius: 1,
                      bgcolor: '#f7f7f9ff',
                    }}>
                      {/* Ảnh Poster */}
                      <Box
                        component="img"
                        src={movie.bannerUrl || movie.posterUrl}
                        alt={movie.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          bgcolor: '#f7f7f9ff'
                        }}
                      />

                      {/* Badge đánh giá */}
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
                        {/* Độ tuổi */}
                        <Box sx={{
                          bgcolor: '#f5a623',
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
                            {movie.ageRating || 'P'}
                          </Typography>
                        </Box>

                        {/* Đánh giá sao */}
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.25,
                          px: 0.75,
                          py: 0.25
                        }}>
                          <StarIcon sx={{ fontSize: 12, color: '#f5a623' }} />
                          <Typography sx={{
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '10px'
                          }}>
                            {movie.rating?.toFixed(1) || '0'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Overlay khi hover */}
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
                          startIcon={<ConfirmationNumberIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            bgcolor: '#f5a623',
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

                    {/* Tiêu đề phim */}
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
                      {movie.title}
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
                  color: '#1A3A5C',
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
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Gallery Dialog */}
      <Dialog
        open={openGallery}
        onClose={() => setOpenGallery(false)}
        maxWidth={false}
        fullScreen
        sx={{
          '& .MuiBackdrop-root': { backgroundColor: 'rgba(0,0,0,0.9)' }
        }}
        PaperProps={{
          sx: { bgcolor: 'transparent', boxShadow: 'none' }
        }}
      >
        {/* Controls */}
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
          <IconButton onClick={() => setIsAutoPlay(!isAutoPlay)} sx={{ color: '#fff' }}>
            {isAutoPlay ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton
            onClick={() => {
              const container = document.querySelector('.gallery-container');
              if (container?.requestFullscreen) container.requestFullscreen();
            }}
            sx={{ color: '#fff' }}
          >
            <FullscreenIcon />
          </IconButton>
          <IconButton onClick={() => setOpenGallery(false)} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Gallery Container */}
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
          {/* Previous */}
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
          {director?.photos && (
            <Box
              component="img"
              src={director.photos[currentImageIndex]}
              alt={`${director.name} - ${currentImageIndex + 1}`}
              sx={{
                maxWidth: '85vw',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
              onError={handleImageError}
            />
          )}

          {/* Next */}
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

        {/* Thumbnails */}
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
          {director?.photos?.map((photo, idx) => (
            <Box
              key={idx}
              component="img"
              src={photo}
              alt={`Thumb ${idx + 1}`}
              onClick={() => setCurrentImageIndex(idx)}
              onError={handleImageError}
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

export default FilmDirectorDetailPage;

