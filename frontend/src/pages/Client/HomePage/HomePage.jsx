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
import { BannerSlider, MovieCard, TrailerModal, QuickBookingBar } from '../../../components/Common';

// Mock data (sẽ thay bằng API sau)
import { mockMovies, getNowShowingMovies, getComingSoonMovies } from '../../../mocks/mockMovies';
import mockBanners from '../../../mocks/mockBanners';

// STYLES
const styles = {
  // Section phim
  movieSection: {
    py: 5
  },
  // Header của section - Galaxy style
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    mb: 3
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: { xs: '1.25rem', md: '1.5rem' },
    color: '#1a3a5c',
    textTransform: 'uppercase',
    pl: 2,
    borderLeft: '4px solid #1a3a5c',
    letterSpacing: 1
  },
  // Tabs inline với title
  tabsInline: {
    minHeight: 'auto',
    '& .MuiTab-root': {
      fontWeight: 600,
      fontSize: '1rem',
      textTransform: 'none',
      color: '#666',
      minHeight: 'auto',
      py: 0.5,
      px: 2,
      '&:focus': {
        outline: 'none'
      },
      '&.Mui-focusVisible': {
        outline: 'none'
      }
    },
    '& .Mui-selected': {
      color: '#1a3a5c !important'
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
    borderColor: '#f9a825',
    color: '#f9a825',
    '&:hover': {
      borderColor: '#f57f17',
      backgroundColor: 'rgba(249, 168, 37, 0.1)'
    }
  }
};

// CONSTANTS
const MOVIES_PER_PAGE = 8; // Số phim hiển thị mỗi lần

// Tab values
const TAB_NOW_SHOWING = 0;
const TAB_COMING_SOON = 1;

// HOMEPAGE COMPONENT
function HomePage() {
  // STATE
  const [activeTab, setActiveTab] = useState(TAB_NOW_SHOWING);
  const [visibleCount, setVisibleCount] = useState(MOVIES_PER_PAGE);
  const [loading, setLoading] = useState(false);  // Không loading vì dùng mock data
  const [movies, setMovies] = useState(getNowShowingMovies());  // Init với data
  const [banners, setBanners] = useState(mockBanners);  // Init với data

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
      // TODO: Thay bằng API call thực tế
      // const [moviesRes, bannersRes] = await Promise.all([
      //   movieApi.getNowShowing(),
      //   cmsApi.getBanners()
      // ]);

      // Sử dụng mock data
      setBanners(mockBanners);
      setMovies(getNowShowingMovies());
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load phim theo tab
  const loadMoviesByTab = () => {
    setVisibleCount(MOVIES_PER_PAGE); // Reset số lượng hiển thị

    if (activeTab === TAB_NOW_SHOWING) {
      setMovies(getNowShowingMovies());
    } else {
      setMovies(getComingSoonMovies());
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
    const visibleMovies = movies.slice(0, visibleCount);
    const hasMore = visibleCount < movies.length;

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

        {/* Nút Xem thêm */}
        {hasMore && (
          <Box sx={styles.loadMoreContainer}>
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              sx={styles.loadMoreButton}
            >
              Xem thêm ({movies.length - visibleCount} phim)
            </Button>
          </Box>
        )}
      </>
    );
  };

  // RENDER CHÍNH
  return (
    <Box>
      {/* BANNER SLIDER */}
      <BannerSlider banners={banners} />

      {/* QUICK BOOKING BAR - Đặt vé nhanh */}
      <QuickBookingBar />

      {/* MOVIE SECTION */}
      <Box sx={styles.movieSection}>
        <Container maxWidth="lg">
          {/* Header + Tabs inline - Galaxy style */}
          <Box sx={styles.sectionHeader}>
            <Typography variant="h5" component="h2" sx={styles.sectionTitle}>
              PHIM
            </Typography>

            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={styles.tabsInline}
            >
              <Tab label="Đang chiếu" id="tab-now" />
              <Tab label="Sắp chiếu" id="tab-coming" />
            </Tabs>
          </Box>

          {/* Danh sách phim */}
          {loading ? renderSkeletons() : renderMovieGrid()}
        </Container>
      </Box>

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
