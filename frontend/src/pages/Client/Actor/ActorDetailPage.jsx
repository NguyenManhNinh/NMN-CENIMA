import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Import MUI Components
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Breadcrumbs,
  Dialog,
  IconButton,
  CircularProgress
} from '@mui/material';

// Import Icons

import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTheme, useMediaQuery } from '@mui/material';

// APIs
import { getNowShowingMoviesAPI } from '@/apis/movieApi';
import { getPersonBySlugAPI, incrementPersonViewAPI, togglePersonLikeAPI } from '@/apis/personApi';

//CONSTANTS
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

//HELPER FUNCTIONS
// Format ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return 'Đang cập nhật';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Tính tuổi từ ngày sinh
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

//MAIN COMPONENT
function ActorDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  //STATES
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherMovies, setOtherMovies] = useState([]);

  // Gallery states
  const [openGallery, setOpenGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // View count tracking
  const viewIncrementedRef = useRef({});
  const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 giờ

  //FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy thông tin diễn viên
        const actorRes = await getPersonBySlugAPI(slug);
        const actorData = actorRes?.data;
        if (!actorData) {
          setActor(null);
          return;
        }
        // Tăng view count (với cooldown - chỉ 1 lần mỗi 24h)
        if (actorData?._id && !viewIncrementedRef.current[actorData._id]) {
          viewIncrementedRef.current[actorData._id] = true;
          const viewKey = `actor_view_${actorData._id}`;
          const lastViewTime = localStorage.getItem(viewKey);
          const now = Date.now();
          if (!lastViewTime || (now - parseInt(lastViewTime, 10)) > VIEW_COOLDOWN_MS) {
            localStorage.setItem(viewKey, now.toString());
            // Call API tăng view count
            try {
              const viewRes = await incrementPersonViewAPI(actorData._id);
              // Update viewCount từ server
              actorData.viewCount = viewRes?.data?.viewCount ?? actorData.viewCount;
            } catch (err) {
              console.error('Lỗi tăng view count:', err);
            }
          }
        }

        // Mapping fields từ backend sang frontend naming convention
        const mappedActor = {
          ...actorData,
          // Backend trả filmography trực tiếp trong Person model
          filmography: actorData.filmography || [],
          // Backend trả gallery array [{url, caption}], frontend dùng photos array [string]
          photos: actorData.gallery?.map(g => g.url || g) || [],
          // Backend trả fullBio, frontend dùng biography
          biography: actorData.fullBio || ''
        };

        setActor(mappedActor);

        // Fetch phim đang chiếu từ API cho sidebar
        try {
          const moviesRes = await getNowShowingMoviesAPI(5);
          setOtherMovies(moviesRes?.data?.movies || []);
        } catch (err) {
          console.error('Lỗi tải phim đang chiếu:', err);
          setOtherMovies([]);
        }

      } catch (error) {
        console.error('Lỗi khi tải dữ liệu diễn viên:', error);
        setActor(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // LIKE HANDLER - Gọi API toggle like/unlike
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Khởi tạo trạng thái like từ localStorage
  useEffect(() => {
    if (actor?._id) {
      const likeKey = `actor_liked_${actor._id}`;
      setIsLiked(localStorage.getItem(likeKey) === 'true');
    }
  }, [actor?._id]);

  const handleToggleLike = async () => {
    if (!actor?._id) return;

    // Check đăng nhập
    if (!user) {
      alert('Vui lòng đăng nhập để thích diễn viên!');
      return;
    }

    // Chống spam click
    if (likeLoading) return;

    const currentLiked = isLiked;
    const prevCount = actor.likeCount || 0;

    // Set loading
    setLikeLoading(true);

    // Optimistic update
    const newLiked = !currentLiked;
    setIsLiked(newLiked);
    setActor(prev => ({
      ...prev,
      likeCount: currentLiked
        ? Math.max((prev.likeCount || 1) - 1, 0)
        : (prev.likeCount || 0) + 1
    }));

    // Call API (yêu cầu token)
    try {
      const res = await togglePersonLikeAPI(actor._id);
      // Sync từ response backend
      setIsLiked(res.liked);
      setActor(prev => ({
        ...prev,
        likeCount: res.likeCount ?? prev.likeCount
      }));
    } catch (error) {
      console.error('Lỗi toggle like:', error);
      const status = error.response?.status;
      // Nếu lỗi xác thực (token hết hạn) - logout ngay để tránh flicker
      if (status === 401 || status === 500) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        logout();
        return; // Không rollback vì đã logout
      }
      // Rollback on other errors
      setIsLiked(currentLiked);
      setActor(prev => ({
        ...prev,
        likeCount: prevCount
      }));
    } finally {
      setLikeLoading(false);
    }
  };

  //GALLERY HANDLERS
  const handleOpenGallery = (index) => {
    setCurrentImageIndex(index);
    setOpenGallery(true);
  };

  const handleNextImage = () => {
    if (actor?.photos) {
      setCurrentImageIndex((prev) => (prev + 1) % actor.photos.length);
    }
  };

  const handlePrevImage = () => {
    if (actor?.photos) {
      setCurrentImageIndex((prev) => (prev - 1 + actor.photos.length) % actor.photos.length);
    }
  };

  // Tự động chuyển ảnh
  useEffect(() => {
    let interval;
    if (openGallery && isAutoPlay && actor?.photos?.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % actor.photos.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [openGallery, isAutoPlay, actor?.photos?.length]);

  //LOADING SCREEN
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
          Chờ tôi xíu nhé
        </Typography>
      </Box>
    );
  }

  //NOT FOUND SCREEN
  if (!actor) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6" gutterBottom>Không tìm thấy diễn viên</Typography>
        <Button onClick={() => navigate('/dien-vien')} variant="outlined">
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  // Tính tuổi
  const age = calculateAge(actor.birthDate);

  //DETAIL ITEM COMPONENT
  const DetailItem = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
        <Icon sx={{ fontSize: 20, color: COLORS.primary, mt: 0.3 }} />
        <Box>
          <Typography sx={{ fontSize: '12px', color: COLORS.textMuted, mb: 0.25 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: COLORS.text, fontWeight: 500 }}>
            {value}
          </Typography>
        </Box>
      </Box>
    );
  };

  //MAIN RENDE
  return (
    <Box sx={{ bgcolor: COLORS.bgLight, minHeight: '100vh' }}>

      {/* NỘI DUNG CHÍNH */}
      <Box sx={{ bgcolor: COLORS.white, pb: 5 }}>
        <Container maxWidth="lg">

          {/*BREADCRUMBS */}
          <Box sx={{ py: 2 }}>
            <Breadcrumbs
              separator="/"
              sx={{ '& .MuiBreadcrumbs-separator': { color: COLORS.textMuted, mx: 1 } }}
            >
              <Link to="/" style={{ textDecoration: 'none', color: COLORS.textMuted, fontSize: isMobile ? '13px' : '14px' }}>
                Trang chủ
              </Link>
              <Link to="/dien-vien" style={{ textDecoration: 'none', color: COLORS.textMuted, fontSize: isMobile ? '13px' : '14px' }}>
                Diễn viên
              </Link>
              <Typography sx={{ color: COLORS.text, fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                {actor.name}
              </Typography>
            </Breadcrumbs>
          </Box>

          <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>

            {/*CỘT TRÁI: Nội dung chính */}
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
                        src={actor.photoUrl}
                        alt={actor.name}
                        onError={handleImageError}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center 20%',
                          display: 'block',
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>

                {/* Thông tin cá nhân - Responsive Layout */}
                <Grid item xs={12} md={8}>
                  {/* Tên diễn viên */}
                  <Typography sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.4rem', sm: '1.6rem', md: '2rem' },
                    color: COLORS.dark,
                    mb: 1.5,
                    lineHeight: 1.2,
                    textAlign: { xs: 'center', md: 'left' }
                  }}>
                    {actor.name}
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
                        backgroundColor: 'rgba(64,128,255,1)',
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
                          backgroundColor: 'rgba(64,128,255,1)',
                          boxShadow: 'none',
                        },
                        '&:active': {
                          backgroundColor: 'rgba(64,128,255,1)',
                          boxShadow: 'none',
                        },
                        '&:focus': {
                          backgroundColor: 'rgba(64,128,255,1)',
                        },
                        '&.Mui-focusVisible': {
                          backgroundColor: 'rgba(64,128,255,1)',
                          boxShadow: 'none',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(64,128,255,1)',
                          color: '#fff',
                          opacity: 0.7,
                        },
                      }}
                    >
                      {actor.likeCount?.toLocaleString() || 0}
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
                        {actor.viewCount?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Giới thiệu ngắn - Line clamp trên mobile */}
                  {actor.shortBio && (
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
                      {actor.shortBio}
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
                    {actor.birthDate && (
                      <Typography sx={{ fontSize: { xs: '13px', md: '14px' } }}>
                        <Box component="span" sx={{ color: '#888' }}>Ngày sinh: </Box>
                        <Box component="span" sx={{ color: '#333', fontWeight: 500 }}>
                          {formatDate(actor.birthDate)}
                        </Box>
                      </Typography>
                    )}

                    {/* Chiều cao */}
                    {actor.height && (
                      <Typography sx={{ fontSize: { xs: '13px', md: '14px' } }}>
                        <Box component="span" sx={{ color: '#888' }}>Chiều cao: </Box>
                        <Box component="span" sx={{ color: '#333', fontWeight: 500 }}>
                          {actor.height}
                        </Box>
                      </Typography>
                    )}

                    {/* Quốc tịch */}
                    {actor.nationality && (
                      <Typography sx={{ fontSize: { xs: '13px', md: '14px' } }}>
                        <Box component="span" sx={{ color: '#888' }}>Quốc tịch: </Box>
                        <Box component="span" sx={{ color: '#333', fontWeight: 500 }}>
                          {actor.nationality}
                        </Box>
                      </Typography>
                    )}

                    {/* Nơi sinh */}
                    {actor.birthPlace && (
                      <Typography sx={{ fontSize: { xs: '13px', md: '14px' } }}>
                        <Box component="span" sx={{ color: '#888' }}>Nơi sinh: </Box>
                        <Box component="span" sx={{ color: '#333', fontWeight: 500 }}>
                          {actor.birthPlace}
                        </Box>
                      </Typography>
                    )}

                    {/* Nghề nghiệp */}
                    {actor.occupation && (
                      <Typography sx={{ fontSize: { xs: '13px', md: '14px' } }}>
                        <Box component="span" sx={{ color: '#888' }}>Nghề nghiệp: </Box>
                        <Box component="span" sx={{ color: '#333', fontWeight: 500 }}>
                          {actor.occupation}
                        </Box>
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>

              {/*SECTION: HÌNH ẢNH */}
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
                  HÌNH ẢNH DIỄN VIÊN
                </Typography>

                {actor.photos && actor.photos.length > 0 ? (
                  <Box sx={{
                    display: { xs: 'flex', sm: 'grid' },
                    gridTemplateColumns: { sm: 'repeat(4, 1fr)' },
                    overflowX: { xs: 'auto', sm: 'visible' },
                    gap: 1.5,
                    pb: { xs: 1, sm: 0 },
                    '::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none'
                  }}>
                    {actor.photos.map((photo, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={photo}
                        alt={`${actor.name} - ${idx + 1}`}
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
                    Đang cập nhật
                  </Typography>
                )}
              </Box>

              {/*SECTION: PHIM ĐÃ THAM GIA */}
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

                {actor.filmography && actor.filmography.length > 0 ? (
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: { xs: 2, md: 2.5 }
                  }}>
                    {actor.filmography.map((movie) => (
                      <Box
                        key={movie._id}
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
                        {/* Poster phim - nhỏ ngang */}
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
                        {/* Thông tin phim - chỉ title + role */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            className="movie-title"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: '13px', md: '14px' },
                              color: COLORS.text,
                              transition: 'color 0.2s',
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
                            {movie.role || 'Đang cập nhật'}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: COLORS.textMuted, fontStyle: 'italic' }}>
                    Đang cập nhật
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
                  {actor.biography || 'Đang cập nhật tiểu sử.'}
                </Typography>
              </Box>

            </Grid>

            {/*CỘT PHẢI: SIDEBAR - PHIM ĐANG CHIẾU */}
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper
                sx={{
                  p: 2,
                  position: 'sticky',
                  top: 10,
                }}
                elevation={0}
              >
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#4A4A4A',
                  mb: 2,
                  textTransform: 'uppercase'
                }}>
                  Phim đang chiếu
                </Typography>

                {/* Danh sách phim */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {otherMovies.slice(0, 3).map((movie) => (
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
                          onError={handleImageError}
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

                {/* Xem thêm */}
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
                    '&:hover': { bgcolor: 'transparent' }
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

      {/*GALLERY MODAL */}
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
          {actor?.photos && (
            <Box
              component="img"
              src={actor.photos[currentImageIndex]}
              alt={`${actor.name} - ${currentImageIndex + 1}`}
              sx={{
                maxWidth: '85vw',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
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
          {actor?.photos?.map((photo, idx) => (
            <Box
              key={idx}
              component="img"
              src={photo}
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

export default ActorDetailPage;
