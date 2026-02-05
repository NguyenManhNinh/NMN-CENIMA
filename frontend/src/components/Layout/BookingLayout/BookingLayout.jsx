import { Box, Container, Button } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import CloseIcon from '@mui/icons-material/Close';

// API - Release seat holds
import { releaseHoldAPI } from '../../../apis/seatHoldApi';

/**
 * BookingLayout - Layout đặc biệt cho flow đặt vé
 * Chỉ hiển thị:
 * - Logo
 * - Nút "Huỷ giao dịch X"
 *
 * Sử dụng cho các trang: ComboPage, PaymentConfirmPage
 */

// STYLES
const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    bgcolor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    py: 1.5,
    position: 'sticky',
    top: 0,
    zIndex: 1100,
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    height: { xs: 80, md: 100 },
    cursor: 'pointer',
  },
  cancelBtn: {
    color: '#666',
    fontWeight: 500,
    fontSize: { xs: '0.85rem', md: '0.95rem' },
    textTransform: 'none',
    '&:hover': {
      color: '#DC2626',
      bgcolor: 'transparent',
    },
  },
  main: {
    flexGrow: 1,
  },
};

function BookingLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu từ location state
  const showtimeId = location.state?.showtime?._id;
  const selectedSeats = location.state?.selectedSeats || [];

  // Huỷ giao dịch - giải phóng ghế và quay về trang đặt vé
  const handleCancelTransaction = useCallback(async () => {
    try {
      // Giải phóng tất cả ghế đang giữ
      if (showtimeId && selectedSeats.length > 0) {
        await Promise.all(
          selectedSeats.map(seat =>
            releaseHoldAPI(showtimeId, seat.seatCode).catch(() => { })
          )
        );
      }
      // Xóa timer khỏi sessionStorage
      sessionStorage.removeItem('reservationStartTime');
      // Redirect về trang đặt vé nhanh (Quick Booking)
      navigate('/dat-ve');
    } catch (error) {
      console.error('Lỗi huỷ giao dịch:', error);
      navigate('/dat-ve');
    }
  }, [showtimeId, selectedSeats, navigate]);

  return (
    <Box sx={styles.root}>
      {/* Header đơn giản - theo Galaxy Cinema */}
      <Box sx={styles.header}>
        <Container maxWidth="xl">
          <Box sx={styles.headerContent}>
            {/* Logo */}
            <Box
              component="img"
              src="/NMN_CENIMA_LOGO.png"
              alt="NMN Cinema"
              sx={styles.logo}
              onClick={() => navigate('/')}
            />

            {/* Nút Huỷ giao dịch */}
            <Button
              variant="text"
              onClick={handleCancelTransaction}
              sx={styles.cancelBtn}
              endIcon={<CloseIcon sx={{ fontSize: 18 }} />}
            >
              Huỷ giao dịch
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={styles.main}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default BookingLayout;
