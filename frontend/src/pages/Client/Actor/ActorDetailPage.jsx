// ActorDetailPage.jsx - Trang chi tiết diễn viên
// Dựa trên cấu trúc GenresDetailPage với các điều chỉnh phù hợp

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

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

// ==================== CONSTANTS ====================
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

// ==================== MOCK DATA ====================
const MOCK_ACTOR = {
  _id: 'actor-001',
  name: 'Chris Evans',
  slug: 'chris-evans',
  photoUrl: 'https://image.tmdb.org/t/p/w500/3bOGNsHlrswhyW79uvIHH1V43JI.jpg',
  bannerUrl: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
  birthDate: '1981-06-13',
  birthPlace: 'Boston, Massachusetts, Hoa Kỳ',
  nationality: 'Mỹ',
  height: '1.83m',
  occupation: 'Diễn viên, Đạo diễn',
  // Giới thiệu ngắn về bản thân (hiển thị ở header)
  shortBio: 'Chris Evans là một diễn viên và đạo diễn người Mỹ. Anh được biết đến rộng rãi với vai diễn Captain America trong các bộ phim thuộc Vũ trụ Điện ảnh Marvel (MCU). Evans bắt đầu sự nghiệp diễn xuất vào cuối những năm 1990, xuất hiện trong nhiều bộ phim truyền hình và điện ảnh.',

  // Tiểu sử chi tiết - Lịch sử hoạt động, thành tựu (hiển thị ở section riêng)
  biography: `Vai diễn đáng chú ý đầu tiên của anh là Johnny Storm / Human Torch trong các phim Fantastic Four (2005) và Fantastic Four: Rise of the Silver Surfer (2007).

Năm 2011, Evans được chọn đóng vai Steve Rogers / Captain America trong Captain America: The First Avenger. Vai diễn này đã đưa anh trở thành một trong những ngôi sao điện ảnh hàng đầu Hollywood. Anh tiếp tục thể hiện nhân vật này trong nhiều phim MCU bao gồm The Avengers (2012), Captain America: The Winter Soldier (2014), Avengers: Age of Ultron (2015), Captain America: Civil War (2016), Avengers: Infinity War (2018) và Avengers: Endgame (2019).

Ngoài MCU, Evans còn tham gia các phim như Snowpiercer (2013), Gifted (2017), Knives Out (2019), và The Gray Man (2022). Anh cũng lấn sân sang lĩnh vực đạo diễn với bộ phim Before We Go (2014).

Các giải thưởng và đề cử:
• 2015: MTV Movie Award - Best Fight (Captain America: The Winter Soldier)
• 2016: People's Choice Award - Favorite Action Movie Actor
• 2019: MTV Movie Award - Best Hero (Avengers: Endgame)
• 2019: Teen Choice Award - Choice Action Movie Actor`,
  viewCount: 125890,
  likeCount: 154307,
  // Gallery ảnh
  photos: [
    'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    'https://image.tmdb.org/t/p/original/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg',
    'https://image.tmdb.org/t/p/original/5TbtcmRySXPAEXj5Guq3SFejZ5T.jpg',
    'https://image.tmdb.org/t/p/original/orjiB3oUIsyz60hoEqkiGpy5CeO.jpg'
  ],
  // Phim đã tham gia
  filmography: [
    {
      _id: 'movie-001',
      title: 'Avengers: Endgame',
      slug: 'avengers-endgame',
      posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      releaseDate: '2019-04-26',

      rating: 9.2
    },
    {
      _id: 'movie-002',
      title: 'Avengers: Infinity War',
      slug: 'avengers-infinity-war',
      posterUrl: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
      releaseDate: '2018-04-27',
      role: 'Steve Rogers / Captain America',
      rating: 8.9
    },
    {
      _id: 'movie-003',
      title: 'Captain America: Civil War',
      slug: 'captain-america-civil-war',
      posterUrl: 'https://image.tmdb.org/t/p/w500/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg',
      releaseDate: '2016-05-06',
      role: 'Steve Rogers / Captain America',
      rating: 8.7
    },
    {
      _id: 'movie-004',
      title: 'Knives Out',
      slug: 'knives-out',
      posterUrl: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
      releaseDate: '2019-11-27',
      role: 'Ransom Drysdale',
      rating: 8.5
    },
    {
      _id: 'movie-005',
      title: 'The Gray Man',
      slug: 'the-gray-man',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8cXbitsS6dWQ5gfMTZdorpW5Pgi.jpg',
      releaseDate: '2022-07-22',
      role: 'Lloyd Hansen',
      rating: 7.8
    },
    {
      _id: 'movie-006',
      title: 'Lightyear',
      slug: 'lightyear',
      posterUrl: 'https://image.tmdb.org/t/p/w500/vpILbP9eOQEtdQgl4vgjZUNY07r.jpg',
      releaseDate: '2022-06-17',
      role: 'Buzz Lightyear (voice)',
      rating: 7.2
    }
  ]
};

// Mock phim đang chiếu cho sidebar
const MOCK_NOW_SHOWING = [
  {
    _id: 'now-001',
    title: 'Lật Mặt 7',
    slug: 'lat-mat-7',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    ageRating: 'T18',
    rating: 8.5
  },
  {
    _id: 'now-002',
    title: 'Công Tử Bạc Liêu',
    slug: 'cong-tu-bac-lieu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qtXqj3vp2LqO48sQFBOcT1609xq.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/qtXqj3vp2LqO48sQFBOcT1609xq.jpg',
    ageRating: 'T13',
    rating: 7.8
  },
  {
    _id: 'now-003',
    title: 'Deadpool & Wolverine',
    slug: 'deadpool-wolverine',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    ageRating: 'T18',
    rating: 9.0
  }
];

//HELPER FUNCTIONS
// Format ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return 'Chưa cập nhật';
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
  const VIEW_COOLDOWN_MS = 30 * 60 * 1000; // 30 phút

  //FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // TODO: Thay bằng API call thực tế
        // const actorRes = await getActorBySlugAPI(slug);

        // Sử dụng mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập delay
        const actorData = MOCK_ACTOR;

        // Tăng view count (với cooldown)
        if (actorData?._id && !viewIncrementedRef.current[actorData._id]) {
          viewIncrementedRef.current[actorData._id] = true;

          const viewKey = `actor_view_${actorData._id}`;
          const lastViewTime = localStorage.getItem(viewKey);
          const now = Date.now();

          if (!lastViewTime || (now - parseInt(lastViewTime, 10)) > VIEW_COOLDOWN_MS) {
            localStorage.setItem(viewKey, now.toString());
            // TODO: Call API incrementActorViewAPI(actorData._id)
            actorData.viewCount = (actorData.viewCount || 0) + 1;
          }
        }

        setActor(actorData);
        setOtherMovies(MOCK_NOW_SHOWING);

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
                      startIcon={<ThumbUpIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        bgcolor: 'rgba(64,128,255,1)',
                        color: '#fff',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: { xs: '12px', md: '13px' },
                        px: { xs: 2, md: 2.4 },
                        py: 0.5,
                        minWidth: 'auto',
                        height: { xs: '30px', md: '32px' },
                        borderRadius: '4px',
                        '&:hover': { bgcolor: 'rgba(64,128,255,0.8)' }
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
              {actor.photos && actor.photos.length > 0 && (
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
                </Box>
              )}

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
                        to={`/dat-ve/${movie.slug}`}
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
                  {actor.biography || 'Chưa cập nhật tiểu sử.'}
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
                          src={movie.posterUrl}
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
