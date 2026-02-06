import { useState, useEffect } from 'react';
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
  CircularProgress,
  Dialog,
  DialogContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// Custom Hooks
import { useCombos } from '../../../hooks/useCombos';
import useSeatTimer from '../../../hooks/useSeatTimer';

// API - Release seat holds when timer expires
import { releaseHoldAPI } from '../../../apis/seatHoldApi';

// Styles - Responsive design
const styles = {
  wrapper: {
    minHeight: '100vh',
    bgcolor: '#f5f5f5',
    pt: 1,
    pb: { xs: 10, md: 4 },
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
    width: '100vw',
    ml: 'calc(-50vw + 50%)',
    position: 'relative',
    overflowX: { xs: 'auto', md: 'visible' },
    '&::-webkit-scrollbar': { display: 'none' },
    scrollbarWidth: 'none'
  },
  stepperInner: {
    display: 'inline-flex',
    gap: { xs: 0, md: 3 },
    flexWrap: 'nowrap',
    borderBottom: '2px solid #e0e0e0',
    pb: 0,
    px: { xs: 1, md: 0 }
  },
  stepperItem: {
    display: 'flex',
    alignItems: 'center',
    px: { xs: 1.5, md: 2 },
    py: { xs: 1, md: 1.5 },
    borderBottom: '3px solid transparent',
    mb: '-1px',
    cursor: 'default',
    flexShrink: 0
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

  // Custom hook lấy danh sách combo từ API
  const { combos, loading, error: comboError } = useCombos();
  const [selectedCombos, setSelectedCombos] = useState({});

  // Modal xác nhận độ tuổi
  const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);

  // Timer hook - tự động sync với sessionStorage và server
  const {
    timeLeft,
    formattedTime,
    isExpired
  } = useSeatTimer(showtime?._id, {
    enabled: !!showtime?._id,
    shouldVerifyOnMount: true,
    redirectPath: showtime?.movie?.slug ? `/dat-ve/${showtime.movie.slug}` : '/',
    onExpire: () => {
      // Giải phóng ghế khi hết thời gian
      const releaseAllSeats = async () => {
        try {
          if (showtime?._id && selectedSeats.length > 0) {
            await Promise.all(
              selectedSeats.map(seat =>
                releaseHoldAPI(showtime._id, seat.seatCode).catch(() => { })
              )
            );
          }
        } catch (error) {
          console.error('Lỗi giải phóng ghế:', error);
        }
      };
      releaseAllSeats();
    }
  });

  // Redirect về trang chủ nếu không có dữ liệu từ trang chọn ghế
  useEffect(() => {
    if (!showtime || selectedSeats.length === 0) {
      alert('Vui lòng chọn ghế trước khi đặt combo!');
      navigate('/');
    }
  }, [showtime, selectedSeats, navigate]);

  // Format thời gian mm:ss (dùng cho hiển thị, hook đã có formattedTime)
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
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

  // Xử lý khi bấm nút Tiếp tục
  const handleContinue = () => {
    // Nếu phim có giới hạn độ tuổi (C13, C16, C18) → hiện modal xác nhận
    const ageRating = showtime?.ageRating;
    if (ageRating && ageRating !== 'P') {
      setAgeConfirmOpen(true);
    } else {
      // Phim phổ biến (P) → chuyển thẳng sang thanh toán
      confirmAndContinue();
    }
  };

  // Xác nhận độ tuổi và chuyển đến trang thanh toán
  const confirmAndContinue = () => {
    const selectedComboItems = combos
      .filter(combo => selectedCombos[combo._id] > 0)
      .map(combo => ({
        ...combo,
        quantity: selectedCombos[combo._id]
      }));

    setAgeConfirmOpen(false); // Đóng modal
    // Timer đã được lưu trong sessionStorage bởi hook
    navigate('/thanh-toan', {
      state: {
        showtime,
        selectedSeats,
        seatPrice,
        combos: selectedComboItems,
        comboPrice: comboTotalPrice,
        totalPrice: grandTotal
        // reservationStartTime giờ được lấy từ sessionStorage bởi useSeatTimer
      }
    });
  };

  // Quay lại trang chọn ghế
  const handleBack = () => {
    // Timer đã được lưu trong sessionStorage bởi hook
    navigate(`/chon-ghe/${showtime?._id || 'test'}`);
  };

  // Lấy thông tin độ tuổi để hiển thị trong modal
  const getAgeInfo = () => {
    const ageRating = showtime?.ageRating;
    switch (ageRating) {
      case 'C13': return { age: 13, label: 'C13' };
      case 'C16': return { age: 16, label: 'C16' };
      case 'C18': return { age: 18, label: 'C18' };
      default: return { age: 0, label: 'P' };
    }
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
                ...(index === 2 ? styles.stepperItemActive : {}) // Step 3 active
              }}
            >
              <Typography
                sx={{
                  ...styles.stepText,
                  ...(index === 2 ? styles.stepTextActive : {})
                }}
              >
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

      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Danh sách combo */}
          <Grid item xs={12} md={8}>

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
                    <Typography fontWeight={700} sx={{ color: '#333333', fontSize: '1rem', mb: 1 }}>
                      {showtime?.movieTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {showtime?.format}{showtime?.subtitle ? ` ${showtime.subtitle}` : ''}
                      </Typography>
                      {showtime?.ageRating && (
                        <Box
                          sx={{
                            bgcolor: showtime.ageRating === 'P' ? '#4caf50' :
                              showtime.ageRating === 'C13' ? '#ff9800' :
                                showtime.ageRating === 'C16' ? '#f44336' :
                                  showtime.ageRating === 'C18' ? '#d32f2f' : '#757575',
                            color: '#fff',
                            px: 1,
                            py: 0.25,
                            borderRadius: 0.5,
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}
                        >
                          {showtime.ageRating}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Rạp - Phòng */}
                <Typography sx={{ color: '#333333', mb: 1 }}>
                  <strong>{showtime?.cinemaName}</strong> - {showtime?.roomName}
                </Typography>

                {/* Suất chiếu */}
                <Typography sx={{ color: '#333333', mb: 2 }}>
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
                  <Typography fontWeight={700} sx={{ color: '#333333' }}>
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
                    onClick={() => navigate(`/chon-ghe/${showtime?._id || 'test'}`)}
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

      {/* Modal Xác nhận Độ tuổi */}
      <Dialog
        open={ageConfirmOpen}
        onClose={() => setAgeConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, p: 2 }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          {/* Badge độ tuổi */}
          <Box
            sx={{
              display: 'inline-block',
              bgcolor: showtime?.ageRating === 'C13' ? '#ff9800' :
                showtime?.ageRating === 'C16' ? '#f44336' :
                  showtime?.ageRating === 'C18' ? '#d32f2f' : '#757575',
              color: '#fff',
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontSize: '1rem',
              fontWeight: 700,
              mb: 2
            }}
          >
            {showtime?.ageRating}
          </Box>

          {/* Tiêu đề */}
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#333' }}>
            Xác nhận mua vé cho người có độ tuổi phù hợp
          </Typography>

          {/* Nội dung */}
          <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
            Tôi xác nhận mua vé phim này cho người có độ tuổi từ {getAgeInfo().age} tuổi trở lên
            và đồng ý cung cấp giấy tờ tùy thân để xác minh độ tuổi.
          </Typography>

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setAgeConfirmOpen(false)}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 2,
                borderColor: '#ccc',
                color: '#666',
                fontWeight: 600,
                '&:hover': { borderColor: '#999', bgcolor: '#f5f5f5' }
              }}
            >
              Từ chối
            </Button>
            <Button
              variant="contained"
              onClick={confirmAndContinue}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 2,
                bgcolor: '#F5A623',
                fontWeight: 700,
                '&:hover': { bgcolor: '#E09612' }
              }}
            >
              Xác nhận
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ComboPage;
