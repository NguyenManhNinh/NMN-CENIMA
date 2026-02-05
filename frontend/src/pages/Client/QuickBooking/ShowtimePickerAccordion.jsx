import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Collapse,
  FormControl,
  Select,
  MenuItem,
  Button,
  CircularProgress
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { styled } from '@mui/material/styles';

// Import API
import { getAllShowtimesAPI } from '../../../apis/showtimeApi';
import { getAllCinemasAPI, getCitiesAPI } from '../../../apis/cinemaApi';

// Màu sắc chủ đạo
const COLORS = {
  primary: '#034EA2',
  orange: '#F5A623',
  text: '#333333',
  textLight: '#666666',
  white: '#FFFFFF',
  border: '#E5E5E5',
  bgLight: '#F8F9FA'
};

// Component Select tùy chỉnh - bỏ focus outline
const StyledSelect = styled(Select)(() => ({
  backgroundColor: '#fff',
  borderRadius: 4,
  fontSize: '0.9rem',
  color: '#333',
  '& .MuiSelect-select': {
    padding: '10px 32px 10px 12px',
    minHeight: 'auto'
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0',
    borderWidth: 1
  }
}));

// Hàm helper: Tạo danh sách 7 ngày tiếp theo
const getNextDays = (count = 7) => {
  const days = [];
  const today = new Date();
  const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    days.push({
      date: dateString,
      dayOfWeek: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      month: date.getMonth() + 1,
      isToday: i === 0
    });
  }
  return days;
};

// Định nghĩa styles
const styles = {
  accordionCard: {
    bgcolor: '#fff',
    borderRadius: 0,
    mb: 2,
    overflow: 'visible',
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
      bgcolor: 'transparent'
    }
  },
  accordionTitle: {
    fontWeight: 500,
    color: '#0c0d0dff',
    fontSize: '1.2rem',
    fontFamily: '"Nunito Sans", sans-serif'
  },
  accordionIconBtn: {
    bgcolor: '#1a2c50',
    color: '#fff',
    width: 36,
    height: 36,
    '&:hover': {
      bgcolor: '#0f1d38'
    },
    '&.Mui-disabled': {
      bgcolor: '#ccc',
      color: '#999'
    }
  },
  accordionContent: {
    px: 2,
    pb: 2,
    pt: 1
  },

  // Hàng các thẻ ngày
  dateCardsContainer: {
    display: 'flex',
    gap: 1.5,
    overflowX: 'auto',
    pb: 1,
    mb: 2,
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  },
  dateCard: {
    minWidth: 70,
    textAlign: 'center',
    py: 1,
    px: 1.5,
    borderRadius: 1.5,
    border: '1px solid',
    borderColor: COLORS.border,
    bgcolor: COLORS.bgLight,
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
    outline: 'none',
    '&:hover': {
      bgcolor: '#f0f0f0'
    },
    '&:focus': {
      outline: 'none'
    }
  },
  dateCardActive: {
    bgcolor: COLORS.primary,
    borderColor: COLORS.primary,
    '&:hover': {
      bgcolor: COLORS.primary,
      borderColor: COLORS.primary
    }
  },
  dateCardBadge: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: COLORS.orange,
    mb: 0.25
  },
  dateCardDay: {
    fontSize: '0.75rem',
    color: COLORS.textLight,
    fontWeight: 500
  },
  dateCardNumber: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: COLORS.text,
    lineHeight: 1.2
  },
  dateCardMonth: {
    fontSize: '0.7rem',
    color: COLORS.textLight
  },
  dateCardActiveText: {
    color: COLORS.white
  },

  // Hàng bộ lọc
  filtersRow: {
    display: 'flex',
    gap: 2,
    mb: 2,
    flexWrap: 'wrap'
  },
  filterControl: {
    minWidth: 160,
    flex: 1,
    maxWidth: 220
  },

  // Nhóm suất chiếu theo rạp
  cinemaGroup: {
    mb: 2.5
  },
  cinemaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    mb: 1.5
  },
  cinemaIcon: {
    color: COLORS.primary,
    fontSize: 20
  },
  cinemaName: {
    fontWeight: 600,
    fontSize: '1rem',
    color: COLORS.text,
    fontFamily: '"Nunito Sans", sans-serif'
  },
  formatGroup: {
    mb: 1.5
  },
  formatLabel: {
    fontSize: '0.85rem',
    color: COLORS.textLight,
    mb: 0.75,
    fontFamily: '"Nunito Sans", sans-serif'
  },
  showtimeButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1
  },
  showtimeBtn: {
    minWidth: 70,
    py: 0.75,
    px: 1.5,
    fontSize: '0.85rem',
    fontWeight: 500,
    color: COLORS.text,
    borderColor: COLORS.border,
    borderRadius: 1,
    textTransform: 'none',
    '&:hover': {
      bgcolor: COLORS.primary,
      borderColor: COLORS.primary,
      color: COLORS.white
    }
  },

  // Trạng thái rỗng
  emptyState: {
    textAlign: 'center',
    py: 4
  },
  emptyIcon: {
    fontSize: 48,
    color: '#ccc',
    mb: 1.5
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: '0.95rem'
  },

  // Trạng thái đang tải
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    py: 4
  }
};

function ShowtimePickerAccordion({
  movieId,
  disabled = false,
  expanded = false,
  onToggle,
  onSelectShowtime
}) {
  // Danh sách ngày khả dụng
  const availableDates = useMemo(() => getNextDays(7), []);

  // Các state nội bộ
  const [selectedDate, setSelectedDate] = useState(availableDates[0]?.date || '');
  const [showtimes, setShowtimes] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [loading, setLoading] = useState(false);

  // Load danh sách rạp và thành phố khi mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cinemasRes, citiesRes] = await Promise.all([
          getAllCinemasAPI(),
          getCitiesAPI()
        ]);
        setCinemas(cinemasRes?.data?.cinemas || []);
        setCities(citiesRes?.data?.cities || []);
      } catch (error) {
        console.error('Error fetching cinemas/cities:', error);
      }
    };
    fetchData();
  }, []);

  // Load suất chiếu khi movieId hoặc ngày thay đổi
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!movieId || !selectedDate) return;
      setLoading(true);
      try {
        const res = await getAllShowtimesAPI({ movieId, date: selectedDate });
        setShowtimes(res?.data?.showtimes || []);
      } catch (error) {
        console.error('Error fetching showtimes:', error);
        setShowtimes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShowtimes();
  }, [movieId, selectedDate]);

  // Reset rạp khi khu vực thay đổi
  useEffect(() => {
    if (selectedArea !== 'all') {
      const cinemasInArea = cinemas.filter(c => c.city === selectedArea);
      if (!cinemasInArea.find(c => c._id === selectedCinema)) {
        setSelectedCinema('all');
      }
    }
  }, [selectedArea, cinemas, selectedCinema]);

  // Lọc rạp theo khu vực
  const filteredCinemas = useMemo(() => {
    if (selectedArea === 'all') return cinemas;
    return cinemas.filter(c => c.city === selectedArea);
  }, [cinemas, selectedArea]);

  // Nhóm suất chiếu theo rạp và định dạng
  const groupedShowtimes = useMemo(() => {
    const grouped = {};
    const cinemaIds = [...new Set(showtimes.map(st => st.cinemaId?._id || st.cinemaId))];

    cinemaIds.forEach(cinemaId => {
      // Lọc theo rạp đã chọn
      if (selectedCinema !== 'all' && cinemaId !== selectedCinema) return;

      // Lọc theo khu vực đã chọn
      const cinema = cinemas.find(c => c._id === cinemaId);
      if (selectedArea !== 'all' && cinema?.city !== selectedArea) return;

      const cinemaShowtimes = showtimes.filter(st =>
        (st.cinemaId?._id || st.cinemaId) === cinemaId
      );

      if (cinemaShowtimes.length > 0) {
        const cinemaInfo = cinemaShowtimes[0]?.cinemaId ||
          cinemas.find(c => c._id === cinemaId) ||
          { _id: cinemaId, name: 'Cinema' };

        const byFormat = {};
        cinemaShowtimes.forEach(st => {
          const format = st.format || '2D';
          const language = st.language || 'Phụ đề';
          const key = `${format} ${language}`;
          if (!byFormat[key]) byFormat[key] = [];
          byFormat[key].push(st);
        });
        grouped[cinemaId] = { cinema: cinemaInfo, formats: byFormat };
      }
    });
    return grouped;
  }, [showtimes, selectedCinema, selectedArea, cinemas]);

  // Format time - xử lý các trường khác nhau từ API
  const formatTime = useCallback((showtime) => {
    // Nếu có trường time (string như "12:00")
    if (showtime.time) {
      return showtime.time;
    }
    // Nếu có trường startAt (ISO date - backend dùng tên này)
    if (showtime.startAt) {
      const date = new Date(showtime.startAt);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
    }
    // Fallback startTime
    if (showtime.startTime) {
      const date = new Date(showtime.startTime);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
    }
    return '--:--';
  }, []);

  // Xử lý khi click vào suất chiếu
  const handleShowtimeClick = (showtime) => {
    if (onSelectShowtime) {
      onSelectShowtime(showtime);
    }
  };

  // Render các thẻ ngày
  const renderDateCards = () => (
    <Box sx={styles.dateCardsContainer}>
      {availableDates.map((d) => (
        <Box
          key={d.date}
          onClick={() => setSelectedDate(d.date)}
          sx={{
            ...styles.dateCard,
            ...(selectedDate === d.date ? styles.dateCardActive : {})
          }}
        >
          {d.isToday && (
            <Typography sx={styles.dateCardBadge}>Hôm Nay</Typography>
          )}
          <Typography sx={{
            ...styles.dateCardDay,
            ...(selectedDate === d.date ? styles.dateCardActiveText : {})
          }}>
            {d.dayOfWeek}
          </Typography>
          <Typography sx={{
            ...styles.dateCardNumber,
            ...(selectedDate === d.date ? styles.dateCardActiveText : {})
          }}>
            {d.dayNumber}
          </Typography>
          <Typography sx={{
            ...styles.dateCardMonth,
            ...(selectedDate === d.date ? styles.dateCardActiveText : {})
          }}>
            Th{d.month}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  // Render bộ lọc - chỉ giữ filter rạp
  const renderFilters = () => (
    <Box sx={styles.filtersRow}>
      <FormControl sx={{ ...styles.filterControl, maxWidth: 280 }}>
        <StyledSelect
          value={selectedCinema}
          onChange={(e) => setSelectedCinema(e.target.value)}
          displayEmpty
        >
          <MenuItem value="all">Tất cả rạp</MenuItem>
          {cinemas.map((cinema) => (
            <MenuItem key={cinema._id} value={cinema._id}>{cinema.name}</MenuItem>
          ))}
        </StyledSelect>
      </FormControl>
    </Box>
  );

  // Render danh sách suất chiếu
  const renderShowtimes = () => {
    if (loading) {
      return (
        <Box sx={styles.loadingContainer}>
          <CircularProgress size={32} sx={{ color: COLORS.primary }} />
        </Box>
      );
    }

    const cinemaIds = Object.keys(groupedShowtimes);
    if (cinemaIds.length === 0) {
      return (
        <Box sx={styles.emptyState}>
          <CalendarMonthIcon sx={styles.emptyIcon} />
          <Typography sx={styles.emptyText}>
            Không có suất chiếu trong ngày này
          </Typography>
        </Box>
      );
    }

    return cinemaIds.map((cinemaId) => {
      const { cinema, formats } = groupedShowtimes[cinemaId];
      return (
        <Box key={cinemaId} sx={styles.cinemaGroup}>
          {/* Header tên rạp */}
          <Box sx={styles.cinemaHeader}>
            <LocationOnIcon sx={styles.cinemaIcon} />
            <Typography sx={styles.cinemaName}>
              {cinema.name || cinema}
            </Typography>
          </Box>

          {/* Nhóm theo định dạng (2D, 3D, IMAX) */}
          {Object.entries(formats).map(([formatKey, times]) => (
            <Box key={formatKey} sx={styles.formatGroup}>
              <Typography sx={styles.formatLabel}>{formatKey}</Typography>
              <Box sx={styles.showtimeButtons}>
                {times.map((st) => (
                  <Button
                    key={st._id}
                    variant="outlined"
                    sx={styles.showtimeBtn}
                    onClick={() => handleShowtimeClick(st)}
                  >
                    {formatTime(st)}
                  </Button>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      );
    });
  };

  return (
    <Paper sx={styles.accordionCard}>
      {/* Phần header của accordion */}
      <Box
        sx={{
          ...styles.accordionHeader,
          ...(disabled ? styles.accordionHeaderDisabled : {})
        }}
        onClick={() => !disabled && onToggle && onToggle()}
      >
        <Box>
          <Typography sx={styles.accordionTitle}>Chọn suất</Typography>
        </Box>
        <IconButton
          sx={{
            ...styles.accordionIconBtn,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s'
          }}
          disabled={disabled}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </Box>

      {/* Nội dung accordion */}
      <Collapse in={expanded && !disabled}>
        <Box sx={styles.accordionContent}>
          {renderDateCards()}
          {renderFilters()}
          {renderShowtimes()}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default ShowtimePickerAccordion;
