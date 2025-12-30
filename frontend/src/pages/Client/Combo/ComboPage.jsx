import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// Custom Hooks
import { useCombos } from '../../../hooks/useCombos';

// API - Release seat holds when timer expires
import { releaseHoldAPI } from '../../../apis/seatHoldApi';

// Styles - Responsive design
const styles = {
  wrapper: {
    minHeight: '100vh',
    bgcolor: '#f5f5f5',
    py: { xs: 2, md: 4 },
    pb: { xs: 10, md: 4 } // Extra padding bottom for mobile fixed footer
  },
  stepTitle: {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: { xs: '1.2rem', sm: '1.35rem', md: '1.5rem' },
    color: '#1a3a5c',
    mb: { xs: 2, md: 4 }
  },
  // Combo card - responsive layout
  comboCard: {
    display: 'flex',
    alignItems: { xs: 'flex-start', sm: 'center' },
    flexDirection: { xs: 'row', sm: 'row' },
    gap: { xs: 1.5, md: 2 },
    p: { xs: 1.5, md: 2 },
    border: '1px solid #e0e0e0',
    borderRadius: 2,
    bgcolor: '#fff',
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow: { xs: 'none', md: '0 2px 8px rgba(0,0,0,0.1)' }
    }
  },
  comboImage: {
    width: { xs: 70, sm: 85, md: 100 },
    height: { xs: 55, sm: 70, md: 80 },
    objectFit: 'contain',
    flexShrink: 0
  },
  comboInfo: {
    flex: 1,
    minWidth: 0 // Prevent text overflow
  },
  comboName: {
    fontWeight: 700,
    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
    color: '#DC2626',
    mb: 0.5
  },
  comboDesc: {
    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
    color: '#666',
    mb: 1,
    lineHeight: 1.4
  },
  comboPrice: {
    fontWeight: 700,
    color: '#DC2626',
    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
  },
  // Quantity controls - compact on mobile
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: 0.5, md: 1 },
    flexShrink: 0
  },
  quantityBtn: {
    width: { xs: 30, sm: 32, md: 36 },
    height: { xs: 30, sm: 32, md: 36 },
    minWidth: { xs: 30, sm: 32, md: 36 },
    bgcolor: '#DC2626',
    color: '#fff',
    '&:hover': {
      bgcolor: '#B91C1C'
    },
    '&:disabled': {
      bgcolor: '#DC2626',
      color: '#fff',
      opacity: 0.6
    }
  },
  quantityText: {
    width: { xs: 28, sm: 32, md: 40 },
    textAlign: 'center',
    fontWeight: 600,
    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }
  },
  // Booking info sidebar - becomes fixed footer on mobile
  bookingInfo: {
    bgcolor: '#fff',
    borderRadius: { xs: 0, md: 2 },
    p: { xs: 2, md: 3 },
    boxShadow: { xs: '0 -4px 12px rgba(0,0,0,0.1)', md: '0 2px 12px rgba(0,0,0,0.08)' },
    position: { xs: 'fixed', md: 'sticky' },
    bottom: { xs: 0, md: 'auto' },
    left: { xs: 0, md: 'auto' },
    right: { xs: 0, md: 'auto' },
    top: { md: 100 },
    zIndex: { xs: 1000, md: 1 },
    maxHeight: { xs: 'auto', md: 'calc(100vh - 120px)' },
    overflowY: { md: 'auto' }
  },
  // Movie poster - hide on mobile for space
  moviePoster: {
    display: { xs: 'none', md: 'block' }
  },
  // Timer badge
  timerBadge: {
    fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
  },
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

function ComboPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy dữ liệu từ trang chọn ghế (BẮT BUỘC - không có fallback)
  const stateData = location.state || {};
  const showtime = stateData.showtime;
  const selectedSeats = stateData.selectedSeats || [];
  const seatPrice = stateData.totalPrice || 0;

  // Lấy từ state, sessionStorage, hoặc tạo mới
  const getStartTime = () => {
    if (stateData.reservationStartTime) return stateData.reservationStartTime;
    const stored = sessionStorage.getItem('reservationStartTime');
    if (stored) return parseInt(stored, 10);
    return Date.now();
  };

  // Dùng useRef để cache thời điểm bắt đầu, tránh re-render
  const startTimeRef = useRef(getStartTime());

  // Lưu vào sessionStorage để giữ khi back/forward browser
  useEffect(() => {
    sessionStorage.setItem('reservationStartTime', startTimeRef.current.toString());
  }, []);

  // Custom hook lấy danh sách combo từ API
  const { combos, loading, error: comboError } = useCombos();
  const [selectedCombos, setSelectedCombos] = useState({});

  // Redirect về trang chủ nếu không có dữ liệu từ trang chọn ghế
  useEffect(() => {
    if (!showtime || selectedSeats.length === 0) {
      alert('Vui lòng chọn ghế trước khi đặt combo!');
      navigate('/');
    }
  }, [showtime, selectedSeats, navigate]);

  // Đếm ngược thời gian giữ ghế (15 phút = 900 giây)
  const RESERVATION_TIME = 15 * 60;
  const [timeLeft, setTimeLeft] = useState(RESERVATION_TIME);

  // Timer đếm ngược - dùng useRef để tránh dependency loop
  useEffect(() => {
    const startTime = startTimeRef.current;

    // Tính thời gian còn lại
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = RESERVATION_TIME - elapsed;
      return remaining > 0 ? remaining : 0;
    };

    // Set initial value
    setTimeLeft(calculateTimeLeft());

    // Interval mỗi giây
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);

        // Giải phóng tất cả ghế đang giữ khi hết thời gian
        const releaseAllSeats = async () => {
          try {
            const showtimeId = showtime?._id;
            if (showtimeId && selectedSeats.length > 0) {
              // Gọi API release cho từng ghế
              await Promise.all(
                selectedSeats.map(seat =>
                  releaseHoldAPI(showtimeId, seat.seatCode).catch(() => { })
                )
              );
            }
          } catch (error) {
            console.error('Lỗi giải phóng ghế:', error);
          }
        };

        releaseAllSeats();

        sessionStorage.removeItem('reservationStartTime');
        alert('Hết thời gian giữ ghế! Vui lòng chọn lại suất chiếu.');
        // Redirect về trang đặt vé của phim hoặc trang chủ
        const movieId = showtime?.movie?._id || showtime?.movieId;
        if (movieId) {
          navigate(`/dat-ve/${movieId}`);
        } else {
          navigate('/');
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, showtime?._id]);

  // Format thời gian mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tăng số lượng combo
  const handleIncrease = (comboId) => {
    setSelectedCombos(prev => ({
      ...prev,
      [comboId]: (prev[comboId] || 0) + 1
    }));
  };

  // Giảm số lượng combo
  const handleDecrease = (comboId) => {
    setSelectedCombos(prev => {
      const current = prev[comboId] || 0;
      if (current <= 0) return prev;
      return {
        ...prev,
        [comboId]: current - 1
      };
    });
  };

  // Tính tổng tiền combo
  const comboTotalPrice = combos.reduce((sum, combo) => {
    const quantity = selectedCombos[combo._id] || 0;
    return sum + (combo.price * quantity);
  }, 0);

  // Tổng tất cả
  const grandTotal = (seatPrice || 0) + comboTotalPrice;

  // Format giá
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  // Chuyển đến trang thanh toán
  const handleContinue = () => {
    const selectedComboItems = combos
      .filter(combo => selectedCombos[combo._id] > 0)
      .map(combo => ({
        ...combo,
        quantity: selectedCombos[combo._id]
      }));

    navigate('/thanh-toan', {
      state: {
        showtime,
        selectedSeats,
        seatPrice,
        combos: selectedComboItems,
        comboPrice: comboTotalPrice,
        totalPrice: grandTotal
      }
    });
  };

  // Quay lại trang chọn ghế
  const handleBack = () => {
    navigate(`/chon-ghe/${showtime?._id || 'test'}`, {
      state: { reservationStartTime: startTimeRef.current }
    });
  };

  // Loading screen
  if (loading) {
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
          Đang tải danh sách combo...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.wrapper}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Danh sách combo */}
          <Grid item xs={12} md={8}>

            {/* Tiêu đề */}
            <Typography sx={styles.stepTitle}>
              Bước 2: Chọn Combo
            </Typography>

            {/* Grid combo */}
            <Grid container spacing={2}>
              {combos.map(combo => (
                <Grid item xs={12} sm={6} key={combo._id}>
                  <Box sx={styles.comboCard}>
                    {/* Ảnh combo */}
                    <Box
                      component="img"
                      src={combo.imageUrl || 'https://www.galaxycine.vn/media/2020/5/19/combo-1-bap-2-nuoc_1589860340869.png'}
                      alt={combo.name}
                      sx={styles.comboImage}
                    />

                    {/* Thông tin combo */}
                    <Box sx={styles.comboInfo}>
                      <Typography sx={styles.comboName}>
                        {combo.name}
                      </Typography>
                      <Typography sx={styles.comboDesc}>
                        {combo.description}
                      </Typography>
                      <Typography sx={styles.comboPrice}>
                        {formatPrice(combo.price)}
                      </Typography>
                    </Box>

                    {/* Nút tăng/giảm số lượng */}
                    <Box sx={styles.quantityControl}>
                      <IconButton
                        sx={styles.quantityBtn}
                        onClick={() => handleDecrease(combo._id)}
                        disabled={!selectedCombos[combo._id]}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={styles.quantityText}>
                        {selectedCombos[combo._id] || 0}
                      </Typography>
                      <IconButton
                        sx={styles.quantityBtn}
                        onClick={() => handleIncrease(combo._id)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Sidebar thông tin đặt vé */}
          <Grid item xs={12} md={4}>
            {/* Thời gian giữ ghế - show above on desktop */}
            <Box sx={{ textAlign: 'center', mb: 2, display: { xs: 'none', md: 'block' } }}>
              <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
                Thời gian giữ ghế:{' '}
                <Box component="span" sx={{
                  color: timeLeft <= 60 ? '#DC2626' : '#F5A623',
                  fontWeight: 700,
                  fontSize: '1.2rem'
                }}>
                  {formatTime(timeLeft)}
                </Box>
              </Typography>
            </Box>

            <Box sx={styles.bookingInfo}>
              {/* Mobile: Compact view */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {/* Timer + Total on mobile */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>
                    <Box component="span" sx={{ color: timeLeft <= 60 ? '#DC2626' : '#F5A623', fontWeight: 700 }}>
                      {formatTime(timeLeft)}
                    </Box>
                  </Typography>
                  <Box>
                    <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Tổng cộng</Typography>
                    <Typography sx={{ color: '#F5A623', fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatPrice(grandTotal)}
                    </Typography>
                  </Box>
                </Box>
                {/* Buttons on mobile */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="text"
                    onClick={handleBack}
                    sx={{ flex: 1, color: '#F5A623', fontWeight: 600 }}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleContinue}
                    sx={{ flex: 2, bgcolor: '#F5A623', fontWeight: 700, '&:hover': { bgcolor: '#E09612' } }}
                  >
                    Tiếp tục
                  </Button>
                </Box>
              </Box>

              {/* Desktop: Full view */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                {/* Poster + Thông tin phim */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Box
                    component="img"
                    src={showtime?.posterUrl || '/placeholder-movie.jpg'}
                    alt={showtime?.movieTitle}
                    sx={{
                      width: 100,
                      height: 140,
                      borderRadius: 1,
                      objectFit: 'cover'
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} sx={{ color: '#1a3a5c', fontSize: '1rem', mb: 1 }}>
                      {showtime?.movieTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {showtime?.format}
                    </Typography>
                  </Box>
                </Box>

                {/* Rạp - Phòng */}
                <Typography sx={{ color: '#1a3a5c', mb: 1 }}>
                  <strong>{showtime?.cinemaName}</strong> - {showtime?.roomName}
                </Typography>

                {/* Suất chiếu */}
                <Typography sx={{ color: '#1a3a5c', mb: 2 }}>
                  Suất: <strong>{showtime?.time}</strong> - {showtime?.date}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Ghế đã chọn */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Ghế: {selectedSeats?.map(s => s.id).join(', ')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#F5A623', fontWeight: 600 }}>
                    {formatPrice(seatPrice || 0)}
                  </Typography>
                </Box>

                {/* Combo đã chọn */}
                {combos.filter(c => selectedCombos[c._id] > 0).map(combo => (
                  <Box key={combo._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {selectedCombos[combo._id]}x {combo.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#F5A623', fontWeight: 600 }}>
                      {formatPrice(combo.price * selectedCombos[combo._id])}
                    </Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* Tổng cộng */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography fontWeight={700} sx={{ color: '#1a3a5c' }}>
                    Tổng cộng
                  </Typography>
                  <Typography fontWeight={700} sx={{ color: '#F5A623', fontSize: '1.2rem' }}>
                    {formatPrice(grandTotal)}
                  </Typography>
                </Box>

                {/* Nút Quay lại + Tiếp tục */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="text"
                    onClick={() => navigate(`/chon-ghe/${showtime?._id || 'test'}`, {
                      state: { reservationStartTime: startTimeRef.current }
                    })}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      color: '#F5A623',
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleContinue}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      fontWeight: 700,
                      bgcolor: '#F5A623',
                      borderRadius: 6,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#E09612'
                      }
                    }}
                  >
                    Tiếp tục
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ComboPage;
