import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  Skeleton,
  CircularProgress
} from '@mui/material';
import { Movie as MovieIcon } from '@mui/icons-material';

// Components
import { BannerSlider, MovieCard, TrailerModal, QuickBookingBar, BlogSection } from '../../../components/Common';
import { PromotionSection } from '../../../components/Common';
import { Link } from 'react-router-dom';

// API
import { getNowShowingMoviesAPI, getComingSoonMoviesAPI } from '../../../apis/movieApi';
import { getAllBannersAPI } from '../../../apis/cmsApi';

// Mock data fallback
import mockBanners from '../../../mocks/mockBanners';

// Background image
import filmBackground from '../../../assets/images/film-bg.png';

// STYLES
const styles = {
  // Section phim
  movieSection: {
    py: 5,
    backgroundImage: `url(${filmBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  },
  // Header của section -
  sectionHeader: {
    display: 'flex',
    alignItems: { xs: 'flex-start', md: 'center' },
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 2, md: 4 },
    mb: 3
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: { xs: '1.5rem', md: '1.3rem' },
    color: '#F3C246',
    textTransform: 'uppercase',
    pl: 2,
    borderLeft: '4px solid #00405d',
    letterSpacing: 1
  },
  // Tabs inline với title
  tabsInline: {
    minHeight: 'auto',
    '& .MuiTab-root': {
      fontWeight: 600,
      fontSize: '1rem',
      textTransform: 'none',
      color: '#858e8fff',
      minHeight: 'auto',
      py: 0.5,
      px: 2,
      '&:hover': {
        backgroundColor: 'transparent'
      },
      '&:focus': {
        outline: 'none'
      },
      '&.Mui-focusVisible': {
        outline: 'none'
      }
    },
    '& .Mui-selected': {
      color: '#F9F400 !important'
    },
    '& .MuiTabs-indicator': {
      display: 'none'
    }
  },
  // Grid phim
  movieGrid: {
    mt: 2
  },
  // Nút xem thêm
  loadMoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    mt: 4
  },
  loadMoreButton: {
    px: 4,
    py: 1,
    fontWeight: 600,
    textTransform: 'none',
    borderColor: '#FFFF33',
    color: '#FFFF33',
    '&:hover': {
      borderColor: '#FFFF33',
      backgroundColor: 'rgba(255, 255, 51, 0.1)',
      color: '#FFFF33'
    }
  }
};

// CONSTANTS
const MOVIES_PER_PAGE = 8; // Số phim hiển thị mỗi hàng

// Tab values
const TAB_NOW_SHOWING = 0;
const TAB_COMING_SOON = 1;

// HOMEPAGE COMPONENT
function HomePage() {
  // STATE
  const [activeTab, setActiveTab] = useState(TAB_NOW_SHOWING);
  const [visibleCount, setVisibleCount] = useState(MOVIES_PER_PAGE);
  const [loading, setLoading] = useState(true);  // Loading từ API (chỉ dùng lần đầu)
  const [tabLoading, setTabLoading] = useState(false);  // Loading khi đổi tab (không hiện skeleton)
  const [movies, setMovies] = useState([]);  // Init rỗng, sẽ load từ API
  const [banners, setBanners] = useState([]);  // Init rỗng, sẽ load từ API

  // State cho trailer modal
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // EFFECTS
  // Load dữ liệu khi component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load lại danh sách phim khi đổi tab
  useEffect(() => {
    loadMoviesByTab();
  }, [activeTab]);

  // DATA LOADING
  // Load tất cả dữ liệu ban đầu
  const loadData = async () => {
    setLoading(true);
    try {
      // Gọi API - dùng Promise.allSettled để không fail toàn bộ nếu 1 API lỗi
      const [moviesResult, bannersResult] = await Promise.allSettled([
        getNowShowingMoviesAPI(8),
        getAllBannersAPI()
      ]);

      // Set movies từ API
      if (moviesResult.status === 'fulfilled') {
        const moviesData = moviesResult.value?.data?.movies || moviesResult.value?.data;
        if (Array.isArray(moviesData)) {
          setMovies(moviesData);
        }
      } else {
        console.error('Lỗi tải phim:', moviesResult.reason);
      }

      // Set banners từ API hoặc fallback mock
      if (bannersResult.status === 'fulfilled') {
        const bannersData = bannersResult.value?.data?.banners || bannersResult.value?.data;
        if (Array.isArray(bannersData) && bannersData.length > 0) {
          setBanners(bannersData);
        } else {
          setBanners(mockBanners);
        }
      } else {
        console.error('Lỗi tải banners:', bannersResult.reason);
        setBanners(mockBanners);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      setBanners(mockBanners);
    } finally {
      setLoading(false);
    }
  };

  // Load phim theo tab (không hiện skeleton, chỉ cập nhật data)
  const loadMoviesByTab = async () => {
    // Không set loading để tránh flash
    setTabLoading(true);
    setVisibleCount(MOVIES_PER_PAGE); // Reset số lượng hiển thị

    try {
      let response;
      if (activeTab === TAB_NOW_SHOWING) {
        response = await getNowShowingMoviesAPI(8);
      } else {
        response = await getComingSoonMoviesAPI(8);
      }

      // Xử lý response - check nhiều format có thể
      const moviesData = response?.data?.movies || response?.data;
      if (Array.isArray(moviesData) && moviesData.length > 0) {
        setMovies(moviesData);
      } else if (Array.isArray(moviesData)) {
        // API trả về mảng rỗng - hiển thị empty state
        setMovies([]);
      }
      // Nếu không có data hợp lệ, giữ nguyên movies cũ
    } catch (error) {
      console.error('Lỗi khi tải phim:', error);
      // Giữ nguyên data cũ khi có lỗi, không reset về []
    } finally {
      setTabLoading(false);
    }
  };

  // HANDLERS
  // Đổi tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Xem thêm phim
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + MOVIES_PER_PAGE);
  };

  // Mở trailer modal
  const handleOpenTrailer = (movie) => {
    setSelectedMovie(movie);
    setTrailerOpen(true);
  };

  // Đóng trailer modal
  const handleCloseTrailer = () => {
    setTrailerOpen(false);
    setSelectedMovie(null);
  };

  // RENDER - Skeleton loading
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[...Array(8)].map((_, index) => (
        <Grid item xs={6} sm={4} md={3} key={index}>
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
          <Skeleton width="80%" sx={{ mt: 1 }} />
          <Skeleton width="40%" />
        </Grid>
      ))}
    </Grid>
  );

  // RENDER - Danh sách phim
  const renderMovieGrid = () => {
    // Nếu không có phim, hiển thị thông báo
    if (!movies || movies.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MovieIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Hiện chưa có phim {activeTab === TAB_NOW_SHOWING ? 'đang chiếu' : 'sắp chiếu'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>
            Vui lòng quay lại sau
          </Typography>
        </Box>
      );
    }

    const visibleMovies = movies.slice(0, visibleCount);

    return (
      <>
        <Grid container spacing={3} sx={styles.movieGrid}>
          {visibleMovies.map((movie) => (
            <Grid item xs={6} sm={4} md={3} key={movie._id}>
              <MovieCard
                movie={movie}
                onTrailerClick={handleOpenTrailer}
              />
            </Grid>
          ))}
        </Grid>

        {/* Nút Xem thêm - Link đến trang movies */}
        <Box sx={styles.loadMoreContainer}>
          <Button
            component={Link}
            to={activeTab === TAB_NOW_SHOWING ? '/phim-dang-chieu?status=now-showing' : '/phim-sap-chieu?status=coming-soon'}
            variant="outlined"
            sx={{
              ...styles.loadMoreButton,
              fontSize: '1rem',
              color: '#FFFF33',
            }}>
            Xem thêm
          </Button>
        </Box>
      </>
    );
  };

  // RENDER CHÍNH
  // Loading screen - fullscreen
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

  return (
    <Box>
      {/* BANNER SLIDER */}
      <BannerSlider banners={banners} />

      {/* QUICK BOOKING BAR - Đặt vé nhanh */}
      <QuickBookingBar />

      {/* MOVIE SECTION */}
      <Box sx={styles.movieSection}>
        <Container maxWidth="lg">
          {/* Header + Tabs inline - */}
          <Box sx={styles.sectionHeader}>
            <Typography variant="h5" component="h2" sx={styles.sectionTitle}>
              PHIM
            </Typography>

            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={styles.tabsInline}
            >
              <Tab label="Đang chiếu" id="tab-now" disableRipple disableFocusRipple />
              <Tab label="Sắp chiếu" id="tab-coming" disableRipple disableFocusRipple />
            </Tabs>
          </Box>

          {/* Danh sách phim */}
          {renderMovieGrid()}
        </Container>
      </Box>

      {/* PROMOTION SECTION - Tạm thời ẩn-Ưu đãi */}
      <PromotionSection />

      {/* BLOG SECTION - Góc điện ảnh */}
      <BlogSection />

      {/* TRAILER MODAL */}
      <TrailerModal
        open={trailerOpen}
        onClose={handleCloseTrailer}
        trailerUrl={selectedMovie?.trailerUrl}
        movieTitle={selectedMovie?.title}
      />
    </Box>
  );
}

export default HomePage;
