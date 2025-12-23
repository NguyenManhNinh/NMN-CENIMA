import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  FormControl,
  Select,
  MenuItem,
  Button,
  Typography,
  InputBase
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Mock data - sẽ thay bằng API
import { getNowShowingMovies } from '../../../mocks/mockMovies';

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
    p: 1.5
  },
  container: {
    display: 'flex',
    alignItems: 'stretch',
    height: 50
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
  menuItem: {
    fontSize: '1rem',
    py: 1.5
  },
  placeholder: {
    color: '#1C1C1C',
    fontSize: '0.9rem'
  }
};

// MOCK DATA - Cinemas, Dates, Showtimes (sẽ thay bằng API)
const mockCinemas = [
  { id: 'c1', name: 'NMN Cinema Hà Nội' },
  { id: 'c2', name: 'NMN Cinema Hồ Chí Minh' },
  { id: 'c3', name: 'NMN Cinema Đà Nẵng' }
];

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

const mockShowtimes = [
  { id: 's1', time: '09:00', type: '2D' },
  { id: 's2', time: '11:30', type: '2D' },
  { id: 's3', time: '14:00', type: '3D' },
  { id: 's4', time: '16:30', type: '2D' },
  { id: 's5', time: '19:00', type: '3D' },
  { id: 's6', time: '21:30', type: '2D' }
];

// QUICK BOOKING BAR COMPONENT
function QuickBookingBar() {
  const navigate = useNavigate();

  // State
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [dates, setDates] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState('');

  // Load initial data
  useEffect(() => {
    // Load movies
    const nowShowing = getNowShowingMovies();
    setMovies(nowShowing);

    // Generate dates
    setDates(generateDates());
  }, []);

  // Cascading logic: When movie changes, load cinemas
  useEffect(() => {
    if (selectedMovie) {
      // TODO: API call to get cinemas showing this movie
      setCinemas(mockCinemas);
      setSelectedCinema('');
      setSelectedDate('');
      setSelectedShowtime('');
      setShowtimes([]);
    }
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
    if (selectedDate) {
      // TODO: API call to get showtimes for movie, cinema, date
      setShowtimes(mockShowtimes);
      setSelectedShowtime('');
    }
  }, [selectedDate]);

  // Handle buy ticket
  const handleBuyTicket = () => {
    if (selectedMovie && selectedCinema && selectedDate && selectedShowtime) {
      // Navigate to seat selection page
      navigate(`/dat-ve/?phim=${selectedMovie}&rap=${selectedCinema}&ngay=${selectedDate}&gio=${selectedShowtime}`);
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
            </FormControl>
          </Box>

          {/* Step 2: Chọn Rạp */}
          <Box sx={styles.stepBox}>
            <Box sx={styles.stepNumber}>2</Box>
            <FormControl sx={styles.selectWrapper} size="small">
              <StyledSelect
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
                displayEmpty
                disabled={!selectedMovie}
                renderValue={(value) => {
                  if (!value) return <span style={styles.placeholder}>Chọn Rạp</span>;
                  const cinema = cinemas.find(c => c.id === value);
                  return cinema?.name || value;
                }}
              >
                {cinemas.map((cinema) => (
                  <MenuItem key={cinema.id} value={cinema.id} sx={styles.menuItem}>
                    {cinema.name}
                  </MenuItem>
                ))}
              </StyledSelect>
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
              <StyledSelect
                value={selectedShowtime}
                onChange={(e) => setSelectedShowtime(e.target.value)}
                displayEmpty
                disabled={!selectedDate}
                renderValue={(value) => {
                  if (!value) return <span style={styles.placeholder}>Chọn Suất</span>;
                  const showtime = showtimes.find(s => s.id === value);
                  return showtime ? `${showtime.time} - ${showtime.type}` : value;
                }}
              >
                {showtimes.map((showtime) => (
                  <MenuItem key={showtime.id} value={showtime.id} sx={styles.menuItem}>
                    {showtime.time} - {showtime.type}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Box>

          {/* Buy Button */}
          <Button
            variant="contained"
            sx={styles.buyButton}
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
