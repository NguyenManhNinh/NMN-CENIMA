import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  Skeleton,
  CircularProgress
} from '@mui/material';

// Components
import { MovieCard, TrailerModal } from '../../../components/Common';

// API
import { getNowShowingMoviesAPI, getComingSoonMoviesAPI } from '../../../apis/movieApi';

// Background image
import filmBackground from '../../../assets/images/film-bg.png';

// STYLES
const styles = {
  // Container chính
  wrapper: {
    py: { xs: 3, md: 5 },
    backgroundImage: `url(${filmBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '80vh'
  },
  // Header inline: PHIM | Đang chiếu | Sắp chiếu
  headerInline: {
    display: 'flex',
    alignItems: { xs: 'flex-start', md: 'center' },
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 2, md: 4 },
    mb: 3
  },
  // Tiêu đề section
  sectionTitle: {
    fontWeight: 700,
    fontSize: { xs: '1.5rem', md: '1.3rem' },
    color: '#F3C246',
    textTransform: 'uppercase',
    pl: 2,
    borderLeft: '4px solid #00405d',
    letterSpacing: 1
  },
  // Tabs
  tabs: {
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
  // Thông báo không có phim
  noMovies: {
    textAlign: 'center',
    py: 8,
    color: 'rgba(255,255,255,0.7)'
  },
  // Fullscreen loading
  loadingScreen: {
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
  },
  loadingLogo: {
    width: 200,
    height: 200,
    mb: 1.5,
    objectFit: 'contain'
  },
  loadingSpinner: {
    color: '#F5A623',
    mb: 2
  },
  loadingText: {
    color: '#FFA500',
    fontSize: '1.2rem',
    fontWeight: 600,
    fontFamily: '"Montserrat","Poppins", "Google Sans", sans-serif',
    letterSpacing: '0.5px'
  }
};

// Tab constants
const TAB_NOW_SHOWING = 0;
const TAB_COMING_SOON = 1;

function MoviesPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const statusParam = searchParams.get('status');

  // Xác định tab mặc định từ URL
  const getInitialTab = () => {
    if (location.pathname.includes('phim-sap-chieu')) return TAB_COMING_SOON;
    if (statusParam === 'coming-soon') return TAB_COMING_SOON;
    return TAB_NOW_SHOWING;
  };

  // State
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);         // Loading lần đầu (fullscreen)
  const [tabLoading, setTabLoading] = useState(false);  // Loading khi đổi tab (skeleton)
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Load phim lần đầu khi mount
  useEffect(() => {
    loadMovies(true);
  }, []);

  // Load phim khi đổi tab
  useEffect(() => {
    if (!loading) {
      loadMovies(false);
    }
  }, [activeTab]);

  // Tải phim từ API hoặc mock
  const loadMovies = async (isFirstLoad = false) => {
    if (isFirstLoad) {
      setLoading(true);
    } else {
      setTabLoading(true);
    }

    try {
      const api = activeTab === TAB_NOW_SHOWING
        ? getNowShowingMoviesAPI
        : getComingSoonMoviesAPI;

      const response = await api(50);

      // API response format: { status, data: { movies: [...] } }
      // movieApi.js đã return response.data nên ta nhận được { status, data: { movies } }
      const moviesData = response?.data?.movies || response?.movies || response?.data || [];

      console.log('Movies loaded:', moviesData.length);

      if (Array.isArray(moviesData) && moviesData.length > 0) {
        setMovies(moviesData);
      } else {
        // Không có dữ liệu từ API
        setMovies([]);
      }
    } catch (error) {
      console.error('Lỗi tải phim:', error);
      setMovies([]);
    } finally {
      setLoading(false);
      setTabLoading(false);
    }
  };

  // Đổi tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Mở/đóng trailer
  const handleOpenTrailer = (movie) => {
    setSelectedMovie(movie);
    setTrailerOpen(true);
  };

  const handleCloseTrailer = () => {
    setTrailerOpen(false);
    setSelectedMovie(null);
  };

  // Render skeleton loading (khi đổi tab)
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[...Array(8)].map((_, index) => (
        <Grid item xs={6} sm={4} md={3} key={index}>
          <Skeleton
            variant="rectangular"
            sx={{
              aspectRatio: '2/3',
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.1)'
            }}
          />
          <Skeleton variant="text" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Skeleton variant="text" width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        </Grid>
      ))}
    </Grid>
  );

  // Render grid phim
  const renderMovieGrid = () => {
    if (!movies || movies.length === 0) {
      return (
        <Box sx={styles.noMovies}>
          <Typography variant="h6">
            Hiện chưa có phim {activeTab === TAB_NOW_SHOWING ? 'đang chiếu' : 'sắp chiếu'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.5)' }}>
            Vui lòng quay lại sau
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3} sx={styles.movieGrid}>
        {movies.map((movie) => (
          <Grid item xs={6} sm={4} md={3} key={movie._id}>
            <MovieCard movie={movie} onTrailerClick={handleOpenTrailer} />
          </Grid>
        ))}
      </Grid>
    );
  };

  // Fullscreen loading screen (lần đầu vào trang)
  if (loading) {
    return (
      <Box sx={styles.loadingScreen}>
        {/* Logo */}
        <Box
          component="img"
          src="/NMN_CENIMA_LOGO.png"
          alt="NMN Cinema"
          sx={styles.loadingLogo}
        />

        {/* Spinning Loader */}
        <CircularProgress
          size={40}
          thickness={2}
          sx={styles.loadingSpinner}
        />

        {/* Loading Text */}
        <Typography sx={styles.loadingText}>
          Chờ tôi xíu nhé
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.wrapper}>
      <Container maxWidth="lg">
        {/* Header: PHIM | Đang chiếu | Sắp chiếu */}
        <Box sx={styles.headerInline}>
          <Typography variant="h5" component="h1" sx={styles.sectionTitle}>
            PHIM
          </Typography>

          <Tabs value={activeTab} onChange={handleTabChange} sx={styles.tabs}>
            <Tab label="Đang chiếu" id="tab-now-showing" disableRipple />
            <Tab label="Sắp chiếu" id="tab-coming-soon" disableRipple />
          </Tabs>
        </Box>

        {/* Danh sách phim - Loading skeleton hoặc Grid */}
        {tabLoading ? renderSkeletons() : renderMovieGrid()}
      </Container>

      {/* Modal trailer */}
      <TrailerModal
        open={trailerOpen}
        onClose={handleCloseTrailer}
        trailerUrl={selectedMovie?.trailerUrl}
        movieTitle={selectedMovie?.title}
      />
    </Box>
  );
}

export default MoviesPage;
