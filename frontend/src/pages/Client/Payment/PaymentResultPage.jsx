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
import { getOrderByOrderNoAPI } from '../../../apis/orderApi';

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

// Map mã lỗi VNPay
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

  // Format ngày giờ
  const formatDate = (date) => {
    const d = date ? new Date(date) : new Date();
    const dateStr = d.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return `${dateStr} | ${timeStr}`;
  };

  // Format suất chiếu
  const formatShowtime = (startAt) => {
    if (!startAt) return '';
    const date = new Date(startAt);
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
    const weekday = date.toLocaleDateString('vi-VN', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' });
    const dateStr = date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    return `${time} - ${weekday}, ${dateStr}`;
  };

  useEffect(() => {
    const fetchOrderData = async () => {
      // Fetch order data for BOTH success and failed cases
      // Failed case needs data for "Thử lại" button
      if (!orderNo) {
        setLoading(false);
        return;
      }

      try {
        const result = await getOrderByOrderNoAPI(orderNo);
        setOrderData(result.data?.order);
      } catch (error) {
        console.error('[PaymentResult] Error fetching order:', error);
        // Fallback to sessionStorage if API fails
        const storedData = sessionStorage.getItem('lastBookingData');
        if (storedData) {
          setOrderData(JSON.parse(storedData));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderNo, isSuccess]);

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

  // Extract order info
  const order = orderData || {};
  const showtime = order.showtimeId || {};
  const movie = showtime.movieId || {};
  const room = showtime.roomId || {};
  const cinema = showtime.cinemaId || {};
  const user = order.userId || {};

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
                  {user.name || 'Khách hàng'}
                </TableCell>
              </TableRow>

              {/* Ngày đặt */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Ngày đặt
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {formatDate(order.createdAt)}
                </TableCell>
              </TableRow>

              {/* Phim */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Phim
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {movie.title || ''}
                </TableCell>
              </TableRow>

              {/* Ghế */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Ghế
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {order.seats?.map(s => s.seatCode).join(', ') || ''}
                </TableCell>
              </TableRow>

              {/* Suất chiếu */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Suất chiếu
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {formatShowtime(showtime.startAt)}
                </TableCell>
              </TableRow>

              {/* Rạp */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Rạp
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell }}>
                  {cinema.name} {room.name ? `- ${room.name}` : ''}
                </TableCell>
              </TableRow>

              {/* Giảm giá (nếu có) */}
              {order.discount > 0 && (
                <TableRow>
                  <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                    Giảm giá ({order.voucherCode})
                  </TableCell>
                  <TableCell sx={{ ...styles.tableCell, ...styles.valueCell, color: '#4caf50' }}>
                    -{formatPrice(order.discount)}
                  </TableCell>
                </TableRow>
              )}

              {/* Tổng tiền */}
              <TableRow>
                <TableCell sx={{ ...styles.tableCell, ...styles.labelCell }}>
                  Tổng tiền
                </TableCell>
                <TableCell sx={{ ...styles.tableCell, ...styles.valueCell, fontWeight: 700, color: '#DC2626' }}>
                  {formatPrice(order.totalAmount)}
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
                onClick={() => {
                  // Navigate to PaymentConfirmPage with order data
                  // This allows user to retry payment without re-selecting seats
                  if (orderData && showtime?._id) {
                    console.log('[PaymentResult] Retry - reconstructing data from order:', order);

                    // Reconstruct state for PaymentConfirmPage
                    const selectedSeats = order.seats?.map(s => ({
                      id: s.seatCode,
                      seatCode: s.seatCode,
                      price: s.price || 0,
                      type: s.isVip ? 'vip' : 'standard'
                    })) || [];

                    const seatPrice = order.seats?.reduce((sum, s) => sum + (s.price || 0), 0) || 0;

                    // Reconstruct combos - NOTE: Order schema uses "unitPrice", not "price"
                    const combos = order.combos?.map(c => ({
                      _id: c.comboId || c._id,
                      name: c.name,
                      price: c.unitPrice || c.price || 0, // Order schema uses unitPrice
                      quantity: c.quantity || 1
                    })) || [];
                    const comboPrice = combos.reduce((sum, c) => sum + ((c.price || 0) * (c.quantity || 0)), 0);

                    // Build showtime info
                    const showtimeInfo = {
                      _id: showtime._id,
                      movieTitle: movie.title,
                      posterUrl: movie.posterUrl,
                      cinemaName: cinema.name,
                      roomName: room.name,
                      time: new Date(showtime.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }),
                      date: new Date(showtime.startAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                      ageRating: movie.ageRating,
                      format: movie.format
                    };

                    // Use order.totalAmount directly to avoid recalculation issues
                    const totalPrice = order.totalAmount || (seatPrice + comboPrice);

                    // Tính reservationStartTime từ order.createdAt
                    // Timer 15 phút bắt đầu từ khi tạo order
                    const orderCreatedAt = new Date(order.createdAt).getTime();
                    const reservationStartTime = orderCreatedAt;
                    const elapsed = Math.floor((Date.now() - reservationStartTime) / 1000);
                    const remaining = 900 - elapsed;

                    console.log('🟠 [PaymentResultPage] RETRY - calculating timer:');
                    console.log('   - order.createdAt:', order.createdAt);
                    console.log('   - reservationStartTime:', reservationStartTime, '| Date:', new Date(reservationStartTime).toLocaleTimeString());
                    console.log('   - elapsed:', elapsed, 's | remaining:', remaining, 's');

                    // Cũng update sessionStorage để các effect khác có thể đọc
                    sessionStorage.setItem('reservationStartTime', reservationStartTime.toString());
                    console.log('🟠 [PaymentResultPage] Saved to sessionStorage:', reservationStartTime);

                    console.log('[PaymentResult] Retry state:', { seatPrice, comboPrice, totalPrice, selectedSeats, combos, reservationStartTime });

                    navigate('/thanh-toan', {
                      state: {
                        showtime: showtimeInfo,
                        selectedSeats,
                        seatPrice,
                        combos,
                        comboPrice,
                        totalPrice,
                        forceTimerSync: true, // Flag để force sync timer với server
                        reservationStartTime // Truyền startTime đúng từ order
                      }
                    });
                  } else {
                    // Fallback to seat selection if no order data
                    const showtimeId = showtime?._id;
                    if (showtimeId) {
                      navigate(`/chon-ghe/${showtimeId}`);
                    } else {
                      navigate('/');
                    }
                  }
                }}
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
