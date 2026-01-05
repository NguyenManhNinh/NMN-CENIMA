import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import { getOrderByIdAPI } from '../../../apis/orderApi';

// Styles
const styles = {
  wrapper: {
    minHeight: '100vh',
    bgcolor: '#f5f5f5',
    py: 4,
    fontFamily: '"Nunito Sans", sans-serif'
  },
  title: {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: { xs: '1.3rem', md: '1.6rem' },
    color: '#1a3a5c',
    mb: 3
  },
  tableHeader: {
    bgcolor: '#1a3a5c',
    color: '#fff',
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '1.1rem',
    py: 1.5
  },
  tableCell: {
    borderBottom: '1px solid #e0e0e0',
    py: 1.5,
    px: 2
  },
  labelCell: {
    fontWeight: 600,
    color: '#333',
    width: '30%',
    bgcolor: '#fafafa'
  },
  valueCell: {
    color: '#333'
  },
  statusSuccess: {
    color: '#4caf50',
    fontWeight: 600
  },
  statusFailed: {
    color: '#DC2626',
    fontWeight: 600
  },
  btnContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 2,
    mt: 3
  },
  btnPrimary: {
    py: 1.2,
    px: 4,
    fontWeight: 700,
    bgcolor: '#F5A623',
    '&:hover': { bgcolor: '#E09612' }
  },
  btnSecondary: {
    py: 1.2,
    px: 4,
    fontWeight: 600,
    color: '#666',
    borderColor: '#ccc',
    '&:hover': { borderColor: '#999' }
  }
};

// Map mã lỗi VNPay sang thông báo tiếng Việt
const ERROR_MESSAGES = {
  '24': 'Đặt vé không thành công. Vui lòng kiểm tra lại thông tin hoặc liên hệ hotline để được hỗ trợ.',
  '07': 'Giao dịch bị nghi ngờ gian lận.',
  '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.',
  '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
  '11': 'Hết hạn chờ thanh toán.',
  '12': 'Thẻ/Tài khoản bị khóa.',
  '13': 'Nhập sai mật khẩu OTP.',
  '51': 'Tài khoản không đủ số dư.',
  '65': 'Tài khoản đã vượt hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
  '99': 'Lỗi không xác định.'
};

function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);

  const status = searchParams.get('status');
  const orderNo = searchParams.get('orderNo');
  const code = searchParams.get('code');

  const isSuccess = status === 'success';

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + ' vnđ';
  };

  // Format ngày
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('vi-VN');
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Format giờ chiếu
  const formatShowtime = (startAt) => {
    if (!startAt) return '';
    const date = new Date(startAt);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchOrderData = async () => {
      // Trong trường hợp thực tế, bạn có thể cần API để lấy thông tin đơn hàng
      // Tạm thời để mock data hoặc lấy từ sessionStorage
      setLoading(false);
    };

    fetchOrderData();
  }, [orderNo]);

  const getStatusMessage = () => {
    if (isSuccess) {
      return 'Đặt vé thành công. Vé điện tử đã được gửi qua email của bạn.';
    }
    if (code && ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code];
    }
    return 'Đặt vé không thành công. Vui lòng thử lại sau.';
  };

  if (loading) {
    return (
      <Box sx={{ ...styles.wrapper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Lấy thông tin từ sessionStorage (được lưu từ trang thanh toán)
  const storedData = sessionStorage.getItem('lastBookingData');
  const bookingData = storedData ? JSON.parse(storedData) : {};

  return (
    <Box sx={styles.wrapper}>
      <Container maxWidth="md">
        {/* Tiêu đề */}
        <Typography sx={styles.title}>
          Bước 4: Kết thúc đặt vé
        </Typography>

        {/* Bảng thông tin đặt vé */}
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
          {/* Header */}
          <Box sx={styles.tableHeader}>
            Thông tin đặt vé
          </Box>

          <Table>
            <TableBody>
              {/* Người đặt */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Người đặt
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {bookingData.userName || 'Nguyễn Mạnh Ninh'}
                </TableCell>
              </TableRow>

              {/* Ngày đặt */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Ngày đặt
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {formatDate(new Date())}
                </TableCell>
              </TableRow>

              {/* Phim */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Phim
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {bookingData.movieTitle || ''}
                </TableCell>
              </TableRow>

              {/* Ghế */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Ghế
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {bookingData.seats || ''}
                </TableCell>
              </TableRow>

              {/* Suất chiếu */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Suất chiếu
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {bookingData.showtime || ''}
                </TableCell>
              </TableRow>

              {/* Rạp */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Rạp
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {bookingData.cinema || ''}
                </TableCell>
              </TableRow>

              {/* Tổng tiền */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Tổng tiền
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {formatPrice(bookingData.totalAmount)}
                </TableCell>
              </TableRow>

              {/* Trạng thái */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Trạng Thái
                </TableCell>
                <TableCell sx={{
                  ...styles.tableCell,
                  ...(isSuccess ? styles.statusSuccess : styles.statusFailed)
                }}>
                  {getStatusMessage()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Buttons */}
        <Box sx={styles.btnContainer}>
          {isSuccess ? (
            <>
              <Button
                variant="contained"
                sx={styles.btnPrimary}
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </Button>
              <Button
                variant="outlined"
                sx={styles.btnSecondary}
                onClick={() => navigate('/lich-su-dat-ve')}
              >
                Xem vé của tôi
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                sx={styles.btnPrimary}
                onClick={() => navigate(-3)}
              >
                Thử lại
              </Button>
              <Button
                variant="outlined"
                sx={styles.btnSecondary}
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </Button>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default PaymentResultPage;
