import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button
} from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';

// Styles - sao chép từ QuickBookingPage để đồng bộ UI
const styles = {
  wrapper: {
    minHeight: '100vh',
    bgcolor: '#f5f5f5',
    pt: 1,
    pb: { xs: 2, md: 4 },
    fontFamily: '"Nunito Sans", sans-serif'
  },
  // Thanh stepper - giống QuickBookingPage
  stepperContainer: {
    display: 'flex',
    justifyContent: 'center',
    bgcolor: '#fff',
    py: 2,
    mb: 3,
    boxShadow: 'none',
    width: '100vw',
    ml: 'calc(-50vw + 50%)',
    position: 'relative'
  },
  stepperInner: {
    display: 'inline-flex',
    gap: { xs: 2, md: 3 },
    flexWrap: 'wrap',
    borderBottom: '2px solid #e0e0e0',
    pb: 0
  },
  stepperItem: {
    display: 'flex',
    alignItems: 'center',
    px: { xs: 1, md: 2 },
    py: 1.5,
    borderBottom: '3px solid transparent',
    mb: '-1px',
    cursor: 'default'
  },
  stepperItemActive: {
    borderBottomColor: '#00405d'
  },
  stepText: {
    fontSize: { xs: '0.75rem', md: '0.9rem' },
    color: '#999',
    whiteSpace: 'nowrap',
    fontWeight: 500
  },
  stepTextActive: {
    color: '#00405d',
    fontWeight: 700
  },
  // Sidebar - giống QuickBookingPage
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
    bgcolor: '#ddd',
    color: '#999',
    fontWeight: 600,
    px: 4,
    py: 1.5,
    textTransform: 'none',
    fontSize: '0.95rem',
    '&:hover': {
      bgcolor: '#ddd'
    }
  }
};

// Trang fallback khi quay lại bằng browser back
function BookingFallbackPage() {
  const navigate = useNavigate();

  // Khi ấn back browser từ trang này → về trang chủ
  useEffect(() => {
    const handlePopState = () => {
      // Khi back browser → redirect về home
      window.location.href = '/';
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <Box sx={styles.wrapper}>
      <Container maxWidth="lg">
        {/* THANH STEPPER - giống QuickBookingPage */}
        <Box sx={styles.stepperContainer}>
          <Box sx={styles.stepperInner}>
            {[
              { id: 1, label: 'Chọn phim / Rạp / Suất' },
              { id: 2, label: 'Chọn ghế' },
              { id: 3, label: 'Chọn thức ăn' },
              { id: 4, label: 'Thanh toán' },
              { id: 5, label: 'Xác nhận' }
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
                  {step.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* CỘT TRÁI - Nội dung trống */}
          <Grid item xs={12} md={8}>
            {/* Không có nội dung - giống ảnh mẫu */}
          </Grid>

          {/* CỘT PHẢI - Sidebar giống QuickBookingPage */}
          <Grid item xs={12} md={4}>
            <Paper sx={styles.sidebar}>
              {/* Poster placeholder với icon */}
              <Box sx={{
                width: '100%',
                height: 200,
                bgcolor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                mb: 2
              }}>
                <MovieIcon sx={{ fontSize: 64, color: '#ccc' }} />
              </Box>

              {/* Tổng tiền */}
              <Box sx={styles.totalRow}>
                <Typography>Tổng cộng</Typography>
                <Typography sx={styles.totalPrice}>0 đ</Typography>
              </Box>

              {/* Các nút hành động */}
              <Box sx={styles.actionButtons}>
                <Button sx={styles.backBtn} onClick={() => navigate('/')}>
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  sx={styles.continueBtn}
                  disabled
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

export default BookingFallbackPage;
