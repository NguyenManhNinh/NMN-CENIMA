import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  FormControl,
  Select,
  MenuItem,
  Button,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// API imports
import { getNowShowingMoviesAPI } from '../../../apis/movieApi';
import { getAllCinemasAPI } from '../../../apis/cinemaApi';
import { getShowtimesByFilterAPI } from '../../../apis/showtimeApi';

// STYLED COMPONENTS

// Custom Select với style Galaxy Cinema
const StyledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: 0,
  fontSize: '0.9rem',
  color: '#333',
  '& .MuiSelect-select': {
    padding: '12px 32px 12px 16px',
    minHeight: 'auto'
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  }
}));

// STYLES
const styles = {
  wrapper: {
    backgroundColor: '#fff',
    borderBottom: '3px solid #FF6A6A',
    py: 0,
    p: 1.5,
    // Mobile: cho phép scroll ngang
    overflowX: { xs: 'auto', md: 'visible' },
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    scrollbarWidth: 'none'
  },
  container: {
    display: 'flex',
    alignItems: 'stretch',
    height: 50,
    // Mobile: đảm bảo không bị co lại
    minWidth: { xs: 'max-content', md: 'auto' }
  },
  stepBox: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    borderRight: '1px solid #e0e0e0',
    position: 'relative',
    '&:last-of-type': {
      borderRight: 'none'
    }
  },
  stepNumber: {
    backgroundColor: '#00405d',
    color: '#fff',
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.93rem',
    fontWeight: 700,
    ml: 2,
    mr: 1,
    flexShrink: 0
  },
  selectWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center'
  },
  buyButton: {
    backgroundColor: '#F4A460',
    color: '#828282',
    fontWeight: 600,
    fontSize: '1rem',
    textTransform: 'none',
    px: 4,
    height: '100%',
    '&:hover': {
      backgroundColor: '#F4A460'
    },
    '&:disabled': {
      backgroundColor: '#F4A460',
      color: '#828282'
    }
  },
  buyButtonActive: {
    backgroundColor: '#FF8C00',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#FF7000'
    }
  },
  menuItem: {
    fontSize: '1rem',
    py: 1.5
  },
  placeholder: {
    color: '#1C1C1C',
    fontSize: '0.9rem'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: 2
  }
};

// Generate next 7 days
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

// QUICK BOOKING BAR COMPONENT
function QuickBookingBar() {
  const navigate = useNavigate();

  // State for data
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [dates, setDates] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  // State for selections
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState('');

  // Loading states
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  // Load initial data - Movies
  useEffect(() => {
    const loadMovies = async () => {
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
    };

    loadMovies();
    // Generate dates
    setDates(generateDates());
  }, []);

  // When movie changes, load cinemas
  useEffect(() => {
    const loadCinemas = async () => {
      if (!selectedMovie) {
        setCinemas([]);
        return;
      }

      setLoadingCinemas(true);
      setSelectedCinema('');
      setSelectedDate('');
      setSelectedShowtime('');
      setShowtimes([]);

      try {
        // Load all cinemas (có thể filter theo movie nếu API hỗ trợ)
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
  }, [selectedMovie]);

  // When cinema changes, reset date and showtime
  useEffect(() => {
    if (selectedCinema) {
      setSelectedDate('');
      setSelectedShowtime('');
      setShowtimes([]);
    }
  }, [selectedCinema]);

  // When date changes, load showtimes
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
          // Format showtimes với thông tin time và format
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

  // Handle buy ticket
  const handleBuyTicket = () => {
    if (selectedMovie && selectedCinema && selectedDate && selectedShowtime) {
      // Navigate to seat selection page with showtime ID
      navigate(`/dat-ve/${selectedShowtime}`);
    }
  };

  // Check if can buy
  const canBuy = selectedMovie && selectedCinema && selectedDate && selectedShowtime;

  // RENDER
  return (
    <Box sx={styles.wrapper}>
      <Container maxWidth="lg" disableGutters>
        <Box sx={styles.container}>

          {/* Step 1: Chọn Phim */}
          <Box sx={styles.stepBox}>
            <Box sx={styles.stepNumber}>1</Box>
            <FormControl sx={styles.selectWrapper} size="small">
              {loadingMovies ? (
                <Box sx={styles.loading}><CircularProgress size={20} /></Box>
              ) : (
                <StyledSelect
                  value={selectedMovie}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  displayEmpty
                  renderValue={(value) => {
                    if (!value) return <span style={styles.placeholder}>Chọn Phim</span>;
                    const movie = movies.find(m => m._id === value);
                    return movie?.title || value;
                  }}
                >
                  {movies.map((movie) => (
                    <MenuItem key={movie._id} value={movie._id} sx={styles.menuItem}>
                      {movie.title}
                    </MenuItem>
                  ))}
                </StyledSelect>
              )}
            </FormControl>
          </Box>

          {/* Step 2: Chọn Rạp */}
          <Box sx={styles.stepBox}>
            <Box sx={styles.stepNumber}>2</Box>
            <FormControl sx={styles.selectWrapper} size="small">
              {loadingCinemas ? (
                <Box sx={styles.loading}><CircularProgress size={20} /></Box>
              ) : (
                <StyledSelect
                  value={selectedCinema}
                  onChange={(e) => setSelectedCinema(e.target.value)}
                  displayEmpty
                  disabled={!selectedMovie}
                  renderValue={(value) => {
                    if (!value) return <span style={styles.placeholder}>Chọn Rạp</span>;
                    const cinema = cinemas.find(c => c._id === value);
                    return cinema?.name || value;
                  }}
                >
                  {cinemas.map((cinema) => (
                    <MenuItem key={cinema._id} value={cinema._id} sx={styles.menuItem}>
                      {cinema.name}
                    </MenuItem>
                  ))}
                </StyledSelect>
              )}
            </FormControl>
          </Box>

          {/* Step 3: Chọn Ngày */}
          <Box sx={styles.stepBox}>
            <Box sx={styles.stepNumber}>3</Box>
            <FormControl sx={styles.selectWrapper} size="small">
              <StyledSelect
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                displayEmpty
                disabled={!selectedCinema}
                renderValue={(value) => {
                  if (!value) return <span style={styles.placeholder}>Chọn Ngày</span>;
                  const date = dates.find(d => d.id === value);
                  return date?.label || value;
                }}
              >
                {dates.map((date) => (
                  <MenuItem key={date.id} value={date.id} sx={styles.menuItem}>
                    {date.label}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Box>

          {/* Step 4: Chọn Suất */}
          <Box sx={styles.stepBox}>
            <Box sx={styles.stepNumber}>4</Box>
            <FormControl sx={styles.selectWrapper} size="small">
              {loadingShowtimes ? (
                <Box sx={styles.loading}><CircularProgress size={20} /></Box>
              ) : (
                <StyledSelect
                  value={selectedShowtime}
                  onChange={(e) => setSelectedShowtime(e.target.value)}
                  displayEmpty
                  disabled={!selectedDate || showtimes.length === 0}
                  renderValue={(value) => {
                    if (!value) return <span style={styles.placeholder}>Chọn Suất</span>;
                    const showtime = showtimes.find(s => s._id === value);
                    return showtime ? `${showtime.time} - ${showtime.format}` : value;
                  }}
                >
                  {showtimes.length === 0 && selectedDate ? (
                    <MenuItem disabled sx={styles.menuItem}>
                      Không có suất chiếu
                    </MenuItem>
                  ) : (
                    showtimes.map((showtime) => (
                      <MenuItem key={showtime._id} value={showtime._id} sx={styles.menuItem}>
                        {showtime.time} - {showtime.format} {showtime.roomName && `(${showtime.roomName})`}
                      </MenuItem>
                    ))
                  )}
                </StyledSelect>
              )}
            </FormControl>
          </Box>

          {/* Buy Button */}
          <Button
            variant="contained"
            sx={{
              ...styles.buyButton,
              ...(canBuy ? styles.buyButtonActive : {})
            }}
            onClick={handleBuyTicket}
            disabled={!canBuy}
          >
            Mua vé nhanh
          </Button>

        </Box>
      </Container>
    </Box>
  );
}

export default QuickBookingBar;
