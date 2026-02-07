import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MovieIcon from '@mui/icons-material/Movie';

// Import các API
import { getNowShowingMoviesAPI } from '../../../apis/movieApi';
import { getAllCinemasAPI, getCitiesAPI } from '../../../apis/cinemaApi';
import { getShowtimesByFilterAPI } from '../../../apis/showtimeApi';

// Import các component
import MoviePickerAccordion from './MoviePickerAccordion';
import ShowtimePickerAccordion from './ShowtimePickerAccordion';

// Component Select tùy chỉnh
const StyledSelect = styled(Select)(() => ({
  backgroundColor: '#fff',
  borderRadius: 4,
  fontSize: '0.95rem',
  color: '#333',
  '& .MuiSelect-select': {
    padding: '12px 32px 12px 16px',
    minHeight: 'auto'
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#F5A623'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#F5A623'
  }
}));

const styles = {
  wrapper: {
    minHeight: '100vh',
    bgcolor: '#f5f5f5',
    pt: 1,
    pb: { xs: 2, md: 4 },
    fontFamily: '"Nunito Sans", sans-serif'
  },
  // Thanh stepper hiển thị các bước
  stepperContainer: {
    display: 'flex',
    justifyContent: 'center',
    bgcolor: '#fff',
    py: { xs: 1.5, md: 2 },
    mb: 3,
    boxShadow: 'none',
    // Full viewport width
    width: '100vw',
    ml: 'calc(-50vw + 50%)',
    position: 'relative',
    // Mobile: cho phép scroll ngang
    overflowX: { xs: 'auto', md: 'visible' },
    '&::-webkit-scrollbar': { display: 'none' },
    scrollbarWidth: 'none'
  },
  stepperInner: {
    display: 'inline-flex',
    gap: { xs: 0, md: 3 },
    flexWrap: 'nowrap', // Không wrap xuống dòng
    borderBottom: '2px solid #e0e0e0',
    pb: 0,
    px: { xs: 1, md: 0 } // Padding cho mobile
  },
  stepperItem: {
    display: 'flex',
    alignItems: 'center',
    px: { xs: 1.5, md: 2 },
    py: { xs: 1, md: 1.5 },
    borderBottom: '3px solid transparent',
    mb: '-1px',
    cursor: 'default',
    flexShrink: 0 // Không co lại
  },
  stepperItemActive: {
    borderBottomColor: '#00405d'
  },
  stepText: {
    fontSize: { xs: '0.7rem', md: '0.9rem' },
    color: '#999',
    whiteSpace: 'nowrap',
    fontWeight: 500
  },
  stepTextActive: {
    color: '#00405d',
    fontWeight: 700
  },
  // Style cho accordion card
  accordionCard: {
    bgcolor: '#fff',
    borderRadius: 0,
    mb: 2,
    overflow: 'hidden',
    boxShadow: 'none'
  },
  accordionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    cursor: 'pointer',
    '&:hover': {
      bgcolor: '#fafafa'
    }
  },
  accordionHeaderDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      bgcolor: '#fff'
    }
  },
  accordionTitle: {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#0e0d0dff'
  },
  accordionSubtitle: {
    fontSize: '0.85rem',
    color: '#666',
    mt: 0.5
  },
  accordionSelectedText: {
    fontSize: '0.85rem',
    color: '#F5A623',
    fontWeight: 500,
    mt: 0.5
  },
  accordionIconBtn: {
    bgcolor: '#00405d',
    color: '#fff',
    width: 36,
    height: 36,
    '&:hover': {
      bgcolor: '#003249'
    },
    '&.Mui-disabled': {
      bgcolor: '#ccc',
      color: '#fff'
    }
  },
  accordionContent: {
    p: 2,
  },
  // Các chip chọn vị trí
  locationChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1.5
  },
  locationChip: {
    px: 2.5,
    py: 1,
    borderRadius: 0,
    fontSize: '0.9rem',
    border: '1px solid #e0e0e0',
    bgcolor: '#fff',
    cursor: 'pointer',
    transition: 'none',
    '&:hover': {
      bgcolor: '#fff',
      borderColor: '#e0e0e0'
    },
    '&:focus': {
      outline: 'none'
    }
  },
  locationChipSelected: {
    borderColor: '#F5A623',
    bgcolor: '#F5A623',
    color: '#fff',
    '&:hover': {
      bgcolor: '#F5A623',
      borderColor: '#F5A623'
    }
  },
  // Sidebar bên phải
  sidebar: {
    bgcolor: '#fff',
    borderRadius: 2,
    p: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 100
  },
  moviePoster: {
    width: '100%',
    height: 200,
    bgcolor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 1,
    mb: 2
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    py: 1.5,
    borderBottom: '1px solid #f0f0f0'
  },
  totalPrice: {
    fontWeight: 700,
    color: '#F5A623',
    fontSize: '1.2rem'
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    mt: 3,
    gap: 2
  },
  backBtn: {
    color: '#F5A623',
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.95rem'
  },
  continueBtn: {
    bgcolor: '#F5A623',
    color: '#fff',
    fontWeight: 600,
    px: 4,
    py: 1.5,
    textTransform: 'none',
    fontSize: '0.95rem',
    '&:hover': {
      bgcolor: '#e09520'
    },
    '&:disabled': {
      bgcolor: '#ddd',
      color: '#999'
    }
  },
  // Style cho dropdown
  formLabel: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#333',
    mb: 1,
    display: 'block'
  },
  menuItem: {
    fontSize: '0.95rem',
    py: 1.5
  },
  placeholder: {
    color: '#999',
    fontSize: '0.95rem'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    py: 2
  },
  // Loading overlay toàn trang (giống ComboPage)
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
  }
};

// AREAS sẽ được load từ API thay vì hardcode

// Hàm tạo danh sách 7 ngày tiếp theo
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      id: date.toISOString().split('T')[0],
      label: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' :
        date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
    });
  }
  return dates;
};

// Các key để quản lý accordion
const ACCORDION_KEYS = {
  LOCATION: 'location',
  MOVIE: 'movie',
  SHOWTIME: 'showtime'
};

function QuickBookingPage() {
  const navigate = useNavigate();

  // Controlled accordion - chỉ 1 mở tại 1 thời điểm
  const [expandedKey, setExpandedKey] = useState(ACCORDION_KEYS.LOCATION);

  // State for data
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [cities, setCities] = useState([]); // Load từ API
  const [dates, setDates] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  // State for selections
  const [selectedArea, setSelectedArea] = useState(''); // Sẽ set sau khi load cities
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState('');
  const [selectedMovieData, setSelectedMovieData] = useState(null);
  const [selectedShowtimeData, setSelectedShowtimeData] = useState(null); // Lưu full showtime object

  // Các trạng thái loading
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Loading ban đầu

  // Load movies and cities on mount
  useEffect(() => {
    // Thêm các entry vào history để khi back browser sẽ hoạt động đúng:
    // home → fallback → dat-ve
    const currentPath = window.location.pathname;
    if (currentPath === '/dat-ve') {
      // Push: home → fallback → dat-ve (hiện tại)
      window.history.pushState(null, '', '/');
      window.history.pushState(null, '', '/dat-ve-fallback');
      window.history.pushState(null, '', '/dat-ve');
    }

    const loadInitialData = async () => {
      // Load movies
      setLoadingMovies(true);
      try {
        const response = await getNowShowingMoviesAPI(50);
        if (response?.data?.movies) {
          setMovies(response.data.movies);
        } else if (Array.isArray(response?.data)) {
          setMovies(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách phim:', error);
        setMovies([]);
      } finally {
        setLoadingMovies(false);
      }

      // Load cities từ API
      try {
        const citiesRes = await getCitiesAPI();
        const citiesList = citiesRes?.data?.cities || [];
        setCities(citiesList);
        // Set default là city đầu tiên
        if (citiesList.length > 0 && !selectedArea) {
          setSelectedArea(citiesList[0]);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách thành phố:', error);
        setCities([]);
      }
    };

    loadInitialData().finally(() => setInitialLoading(false));
    setDates(generateDates());
  }, []);

  // Khi khu vực thay đổi, load danh sách rạp và reset các lựa chọn sau
  useEffect(() => {
    if (!selectedArea) return;

    const loadCinemas = async () => {
      setLoadingCinemas(true);
      // Reset các lựa chọn tiếp theo
      setSelectedMovie('');
      setSelectedCinema('');
      setSelectedDate('');
      setSelectedShowtime('');
      setShowtimes([]);
      setSelectedMovieData(null);

      try {
        const response = await getAllCinemasAPI();
        if (response?.data?.cinemas) {
          setCinemas(response.data.cinemas);
        } else if (Array.isArray(response?.data)) {
          setCinemas(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách rạp:', error);
        setCinemas([]);
      } finally {
        setLoadingCinemas(false);
      }
    };

    loadCinemas();
  }, [selectedArea]);

  // Khi phim thay đổi, cập nhật data phim và reset các lựa chọn sau
  useEffect(() => {
    if (selectedMovie) {
      const movie = movies.find(m => m._id === selectedMovie);
      setSelectedMovieData(movie);
    } else {
      setSelectedMovieData(null);
    }
    // Reset các lựa chọn tiếp theo
    setSelectedDate('');
    setSelectedShowtime('');
    setShowtimes([]);
  }, [selectedMovie, movies]);

  // Khi rạp hoặc ngày thay đổi, load suất chiếu
  useEffect(() => {
    const loadShowtimes = async () => {
      if (!selectedMovie || !selectedCinema || !selectedDate) {
        setShowtimes([]);
        return;
      }

      setLoadingShowtimes(true);
      setSelectedShowtime('');

      try {
        const response = await getShowtimesByFilterAPI(selectedMovie, selectedCinema, selectedDate);
        if (response?.data?.showtimes) {
          const formattedShowtimes = response.data.showtimes.map(s => ({
            _id: s._id,
            time: new Date(s.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            format: s.format || '2D',
            roomName: s.roomId?.name || ''
          }));
          setShowtimes(formattedShowtimes);
        } else {
          setShowtimes([]);
        }
      } catch (error) {
        console.error('Lỗi khi tải lịch chiếu:', error);
        setShowtimes([]);
      } finally {
        setLoadingShowtimes(false);
      }
    };

    loadShowtimes();
  }, [selectedMovie, selectedCinema, selectedDate]);

  // CÁC HÀM XỬ LÝ SỰ KIỆN
  const handleToggleAccordion = (key) => {
    // Kiểm tra điều kiện cho phép mở accordion
    if (key === ACCORDION_KEYS.MOVIE && !selectedArea) return;
    if (key === ACCORDION_KEYS.SHOWTIME && !selectedMovie) return;

    setExpandedKey(expandedKey === key ? null : key);
  };

  const handleSelectLocation = (areaId) => {
    setSelectedArea(areaId);
    // Tự động mở accordion tiếp theo
    setTimeout(() => setExpandedKey(ACCORDION_KEYS.MOVIE), 200);
  };

  const handleSelectMovie = (movieId) => {
    setSelectedMovie(movieId);
    // Tự động mở accordion tiếp theo
    setTimeout(() => setExpandedKey(ACCORDION_KEYS.SHOWTIME), 200);
  };

  const handleContinue = () => {
    if (selectedShowtime) {
      navigate(`/chon-ghe/${selectedShowtime}`);
    }
  };

  // Check if can continue - chỉ cần chọn vị trí, phim và suất chiếu
  const canContinue = selectedArea && selectedMovie && selectedShowtime;

  // Get selected area name - selectedArea giờ đã là tên thành phố trực tiếp
  const selectedAreaName = selectedArea || '';

  // RENDER: Loading state
  if (initialLoading) {
    return (
      <Box sx={styles.loadingScreen}>
        <Box
          component="img"
          src="/NMN_CENIMA_LOGO.png"
          alt="NMN Cinema"
          sx={{ width: 200, height: 200, mb: 1.5, objectFit: 'contain' }}
        />
        <CircularProgress size={40} thickness={2} sx={{ color: '#F5A623', mb: 2 }} />
        <Typography sx={{ color: '#FFA500', fontSize: '1.2rem', fontWeight: 600 }}>
          Chờ tôi xíu nhé
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.wrapper}>
      <Container maxWidth="lg">
        {/* THANH STEPPER */}
        <Box sx={styles.stepperContainer}>
          <Box sx={styles.stepperInner}>
            {[
              { id: 1, label: 'Chọn phim / Rạp / Suất', mobileLabel: 'Phim/Rạp' },
              { id: 2, label: 'Chọn ghế', mobileLabel: 'Ghế' },
              { id: 3, label: 'Chọn thức ăn', mobileLabel: 'Đồ ăn' },
              { id: 4, label: 'Thanh toán', mobileLabel: 'Thanh toán' },
              { id: 5, label: 'Xác nhận', mobileLabel: 'Xác nhận' }
            ].map((step, index) => (
              <Box
                key={step.id}
                sx={{
                  ...styles.stepperItem,
                  ...(index === 0 ? styles.stepperItemActive : {})
                }}
              >
                <Typography
                  sx={{
                    ...styles.stepText,
                    ...(index === 0 ? styles.stepTextActive : {})
                  }}
                >
                  {/* Hiển thị label ngắn trên mobile */}
                  <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                    {step.label}
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                    {step.mobileLabel}
                  </Box>
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* CỘT TRÁI - Các accordion */}
          <Grid item xs={12} md={8}>

            {/* ACCORDION 1: Chọn khu vực/thành phố */}
            <Paper sx={styles.accordionCard}>
              <Box
                sx={styles.accordionHeader}
                onClick={() => handleToggleAccordion(ACCORDION_KEYS.LOCATION)}
              >
                <Box>
                  <Typography sx={{ ...styles.accordionTitle, fontSize: '1.2rem' }}>
                    Chọn vị trí{selectedArea ? ` - ${selectedArea}` : ''}
                  </Typography>

                </Box>
                <IconButton
                  sx={{
                    ...styles.accordionIconBtn,
                    transform: expandedKey === ACCORDION_KEYS.LOCATION ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }}
                >
                  <KeyboardArrowDownIcon />
                </IconButton>
              </Box>
              <Collapse in={expandedKey === ACCORDION_KEYS.LOCATION}>
                <Box sx={styles.accordionContent}>
                  <Box sx={styles.locationChips}>
                    {cities.map(city => (
                      <Box
                        key={city}
                        onClick={() => handleSelectLocation(city)}
                        sx={{
                          ...styles.locationChip,
                          ...(selectedArea === city ? styles.locationChipSelected : {})
                        }}
                      >
                        {city}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </Paper>

            {/* ACCORDION 2: Chọn phim */}
            <MoviePickerAccordion
              movies={movies}
              selectedMovie={selectedMovie}
              onSelectMovie={handleSelectMovie}
              disabled={!selectedArea}
              expanded={expandedKey === ACCORDION_KEYS.MOVIE && !!selectedArea}
              onToggle={() => handleToggleAccordion(ACCORDION_KEYS.MOVIE)}
              loading={loadingMovies}
            />

            {/* ACCORDION 3: Chọn suất chiếu */}
            <ShowtimePickerAccordion
              movieId={selectedMovie}
              disabled={!selectedMovie}
              expanded={expandedKey === ACCORDION_KEYS.SHOWTIME && !!selectedMovie}
              onToggle={() => handleToggleAccordion(ACCORDION_KEYS.SHOWTIME)}
              onSelectShowtime={(showtime) => {
                setSelectedShowtime(showtime._id);
                setSelectedShowtimeData(showtime); // Lưu full data để hiển thị sidebar
                // Không navigate tự động - user sẽ bấm Tiếp tục
              }}
            />

          </Grid>

          {/* CỘT PHẢI - Sidebar thông tin */}
          <Grid item xs={12} md={4}>
            <Paper sx={styles.sidebar}>
              {/* Thông tin phim đã chọn */}
              {selectedMovieData ? (
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  {/* Ảnh poster nhỏ bên trái */}
                  <Box
                    component="img"
                    src={selectedMovieData.posterUrl || '/placeholder-movie.png'}
                    alt={selectedMovieData.title}
                    sx={{
                      width: 100,
                      height: 140,
                      objectFit: 'cover',
                      borderRadius: 1,
                      flexShrink: 0
                    }}
                  />
                  {/* Thông tin phim bên phải */}
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
                      {selectedMovieData.title}
                    </Typography>
                    {/* Format + Subtitle + Rating + AgeRating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        {selectedMovieData.format || '2D'}{selectedMovieData.subtitle ? ` ${selectedMovieData.subtitle}` : ' Phụ đề'}
                      </Typography>
                      {/* Star Rating */}
                      {selectedMovieData.rating > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <Box component="span" sx={{ color: '#F5A623', fontSize: '0.85rem' }}>★</Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {selectedMovieData.rating?.toFixed(1) || '0.0'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({selectedMovieData.ratingCount || 0} đánh giá)
                          </Typography>
                        </Box>
                      )}
                      {/* Age Rating */}
                      {selectedMovieData.ageRating && (
                        <Box
                          sx={{
                            bgcolor: selectedMovieData.ageRating === 'P' ? '#4caf50' :
                              selectedMovieData.ageRating === 'C13' ? '#ff9800' :
                                selectedMovieData.ageRating === 'C16' ? '#f44336' :
                                  selectedMovieData.ageRating === 'C18' ? '#d32f2f' : '#757575',
                            color: '#fff',
                            px: 1,
                            py: 0.25,
                            borderRadius: 0.5,
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}
                        >
                          {selectedMovieData.ageRating}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box sx={styles.moviePoster}>
                  <MovieIcon sx={{ fontSize: 80, color: '#ccc' }} />
                </Box>
              )}

              {/* Showtime Info - hiển thị khi đã chọn suất */}
              {selectedShowtimeData && (
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#333', mb: 0.5 }}>
                    {selectedShowtimeData.cinemaId?.name || 'NMN Cinema'}
                    {selectedShowtimeData.format && ` - ${selectedShowtimeData.format}`}
                    {selectedShowtimeData.subtitle && ` ${selectedShowtimeData.subtitle}`}
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                    Suất: <strong>
                      {selectedShowtimeData.startAt
                        ? new Date(selectedShowtimeData.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : selectedShowtimeData.time || '--:--'}
                    </strong>
                    {selectedShowtimeData.startAt && (
                      <span> - {new Date(selectedShowtimeData.startAt).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}</span>
                    )}
                  </Typography>
                </Box>
              )}

              {/* Tổng tiền */}
              <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 2, mt: 2 }}>
                <Box sx={styles.totalRow}>
                  <Typography>Tổng cộng</Typography>
                  <Typography sx={styles.totalPrice}>0 đ</Typography>
                </Box>
              </Box>

              {/* Các nút hành động */}
              <Box sx={styles.actionButtons}>
                <Button sx={styles.backBtn} onClick={() => navigate('/')}>
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  sx={styles.continueBtn}
                  onClick={handleContinue}
                  disabled={!canContinue}
                >
                  Tiếp tục
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default QuickBookingPage;
