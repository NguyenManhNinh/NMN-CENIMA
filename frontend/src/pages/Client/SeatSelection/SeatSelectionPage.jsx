import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Auth Context
import { useAuth } from '../../../contexts/AuthContext';
// Login Modal
import LoginModal from '../../../components/Common/AuthModals/LoginModal';

// API
import { getShowtimeByIdAPI } from '../../../apis/showtimeApi';
import { getHoldsByShowtimeAPI, createHoldAPI, releaseHoldAPI, verifyHoldAPI } from '../../../apis/seatHoldApi';

// Socket.io - Real-time seat updates
import {
  connectSocket,
  joinShowtime,
  leaveShowtime,
  onSeatHeld,
  onSeatReleased,
  offEvent
} from '../../../services/socketService';

// Ảnh màn hình
import screenImage from '../../../assets/images/manhinhled.png';

// Ảnh ghế
import gheThuong from '../../../assets/images/ghe-thuong.png';
import gheVip from '../../../assets/images/ghe-vip.png';
import gheDoi from '../../../assets/images/ghe-doi.png';
import gheDaBan from '../../../assets/images/ghe-da-ban.png';
import gheDangChon from '../../../assets/images/ghe-dang-chon.png';

// Styles - Responsive design
const styles = {
  wrapper: {
    minHeight: '100vh',
    bgcolor: '#fff',
    py: { xs: 2, md: 4 },
    px: { xs: 1, md: 0 },
    fontFamily: '"Nunito Sans", sans-serif'
  },
  screenTitle: {
    color: '#1a3a5c',
    fontWeight: 700,
    fontFamily: '"Nunito Sans", sans-serif',
    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
    fontStyle: 'italic',
    textAlign: 'center',
    mb: { xs: 1, md: 2 }
  },
  screenImage: {
    width: { xs: '100%', sm: '80%' },
    maxWidth: 650,
    mx: 'auto',
    display: 'block',
    mb: { xs: 2, md: 4 }
  },
  // Container cho sơ đồ ghế - cho phép cuộn ngang trên mobile
  seatContainer: {
    maxWidth: 700,
    mx: 'auto',
    px: { xs: 0.5, sm: 1, md: 2 },
    overflowX: { xs: 'auto', md: 'visible' },
    pb: { xs: 2, md: 0 }
  },
  // Row chứa các ghế
  seatRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: { xs: '2px', sm: '3px', md: '4px' },
    mb: { xs: '3px', sm: '5px', md: '6px' },
    minWidth: { xs: 'max-content', md: 'auto' }
  },
  // Container cho từng ghế (bao gồm ảnh + label)
  seatWrapper: {
    position: 'relative',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
    '&:hover': {
      transform: { xs: 'none', md: 'scale(1.1)' }
    },
    '&:active': {
      transform: 'scale(0.95)'
    }
  },
  // Ghế đã bán
  soldSeatWrapper: {
    cursor: 'not-allowed',
    '&:hover': {
      transform: 'none'
    }
  },
  // Ảnh ghế - responsive sizes
  seatImage: {
    width: { xs: 32, sm: 42, md: 55 },
    height: { xs: 28, sm: 38, md: 50 },
    objectFit: 'contain',
    display: 'block'
  },
  // Ghế đôi rộng hơn
  coupleSeatImage: {
    width: { xs: 64, sm: 84, md: 110 },
    height: { xs: 32, sm: 42, md: 55 }
  },
  // Label số ghế - căn giữa ghế
  seatLabel: {
    position: 'absolute',
    top: '55%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.7rem' },
    fontWeight: 600,
    color: '#ffffffff',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
    pointerEvents: 'none',
    userSelect: 'none',
    letterSpacing: '0.5px'
  },
  // Label ghế đôi
  coupleSeatLabel: {
    fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.85rem' },
    top: '50%'
  },
  // Legend - responsive
  legend: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: { xs: 1.5, sm: 2, md: 3 },
    mt: { xs: 2, md: 4 },
    pt: { xs: 2, md: 3 },
    px: { xs: 1, md: 0 }
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
  },
  legendImage: {
    width: { xs: 25, sm: 30, md: 35 },
    height: { xs: 20, sm: 25, md: 30 },
    objectFit: 'contain'
  },
  // Sidebar
  bookingInfo: {
    bgcolor: '#fff',
    borderRadius: 2,
    p: { xs: 2, md: 3 },
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    position: { xs: 'relative', md: 'sticky' },
    top: { md: 100 }
  },
  continueBtn: {
    mt: 3,
    py: 1.5,
    fontWeight: 700,
    fontSize: '1rem',
    bgcolor: '#F5A623',
    '&:hover': {
      bgcolor: '#E09612'
    }
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

// Hàm lấy ảnh ghế theo loại và trạng thái
const getSeatImage = (seat, isSelected) => {
  // Ghế đã bán hoặc đang được giữ bởi người khác
  if (seat.status === 'sold' || seat.status === 'reserved') return gheDaBan;
  if (isSelected) return gheDangChon;

  // Kiểm tra loại ghế (hỗ trợ cả lowercase từ DB và uppercase)
  const type = seat.type?.toLowerCase();
  switch (type) {
    case 'vip': return gheVip;
    case 'couple': return gheDoi;
    default: return gheThuong;
  }
};

function SeatSelectionPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showtime, setShowtime] = useState(null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false); // Modal đăng nhập

  // Timer đếm ngược (chỉ hiển thị khi có reservationStartTime từ trang combo)
  const RESERVATION_TIME = 15 * 60; // 15 phút
  const [timeLeft, setTimeLeft] = useState(RESERVATION_TIME);

  // Lấy từ sessionStorage hoặc location.state
  const getInitialStartTime = () => {
    const stored = sessionStorage.getItem('reservationStartTime');
    return stored ? parseInt(stored, 10) : null;
  };
  const [reservationStartTime, setReservationStartTime] = useState(getInitialStartTime);

  // Sync reservationStartTime từ location.state hoặc sessionStorage
  useEffect(() => {
    const stateData = location.state || {};

    // Ưu tiên từ location.state (khi navigate với state)
    if (stateData.reservationStartTime) {
      setReservationStartTime(stateData.reservationStartTime);
      sessionStorage.setItem('reservationStartTime', stateData.reservationStartTime.toString());
    } else if (!reservationStartTime) {
      // Fallback: lấy từ sessionStorage (khi back/forward browser)
      const stored = sessionStorage.getItem('reservationStartTime');
      if (stored) {
        setReservationStartTime(parseInt(stored, 10));
      }
    }
  }, [location.state]);

  const hasReservation = !!reservationStartTime;

  // Timer effect - chỉ chạy khi có reservation
  useEffect(() => {
    if (!reservationStartTime) return;

    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - reservationStartTime) / 1000);
      const remaining = RESERVATION_TIME - elapsed;
      return remaining > 0 ? remaining : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);

        // Giải phóng ghế đã giữ khi hết thời gian
        if (showtimeId && selectedSeats.length > 0) {
          Promise.all(
            selectedSeats.map(seat =>
              releaseHoldAPI(showtimeId, seat.seatCode).catch(() => { })
            )
          );
        }

        sessionStorage.removeItem('reservationStartTime');
        setReservationStartTime(null);
        setSelectedSeats([]);
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
  }, [reservationStartTime]);

  // Format thời gian mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load dữ liệu ghế và suất chiếu
  useEffect(() => {
    loadData();
  }, [showtimeId]);

  // Verify hold với server khi có reservationStartTime (sync timer)
  // Đảm bảo hold vẫn còn hiệu lực khi quay lại trang hoặc reload
  useEffect(() => {
    const verifyHoldWithServer = async () => {
      if (!reservationStartTime || !showtimeId) return;

      try {
        const response = await verifyHoldAPI(showtimeId);
        const { valid, remainingSeconds } = response.data;

        if (valid && remainingSeconds > 0) {
          // Sync timer với server time
          setTimeLeft(remainingSeconds);
          console.log('[SeatSelection] Timer synced with server:', remainingSeconds, 'seconds');
        } else {
          // Hold đã hết hạn ở server -> Clear session
          console.log('[SeatSelection] Hold expired on server, clearing session');
          sessionStorage.removeItem('reservationStartTime');
          setReservationStartTime(null);
          setSelectedSeats([]);
        }
      } catch (error) {
        // Lỗi 401 = chưa đăng nhập, bỏ qua
        if (error.response?.status !== 401) {
          console.error('[SeatSelection] Verify hold failed:', error);
        }
      }
    };

    verifyHoldWithServer();
  }, [showtimeId, reservationStartTime]);

  // REAL-TIME SOCKET.IO
  // Kết nối Socket.io để đồng bộ trạng thái ghế real-time
  useEffect(() => {
    if (!showtimeId) return;

    // 1. Kết nối socket và tham gia phòng
    connectSocket();
    joinShowtime(showtimeId);

    // Lấy userId hiện tại để phân biệt ghế của mình vs người khác
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser._id || currentUser.id;

    // 2. Lắng nghe khi ghế được giữ bởi NGƯỜI KHÁC
    onSeatHeld((data) => {
      // Bỏ qua nếu là ghế do chính mình giữ
      if (data.userId === currentUserId) {
        return;
      }

      // Đánh dấu ghế là reserved (người khác đang giữ)
      setSeats(prevSeats => prevSeats.map(seat => {
        if (seat.seatCode === data.seatCode) {
          return { ...seat, status: 'reserved' };
        }
        return seat;
      }));
    });

    // 3. Lắng nghe khi ghế được nhả bởi NGƯỜI KHÁC
    onSeatReleased((data) => {
      // Đánh dấu ghế là available (có thể chọn lại)
      setSeats(prevSeats => prevSeats.map(seat => {
        if (seat.seatCode === data.seatCode) {
          return { ...seat, status: 'available' };
        }
        return seat;
      }));
    });

    // 4. Cleanup khi rời trang - QUAN TRỌNG: Giải phóng ghế đã giữ
    return () => {
      leaveShowtime(showtimeId);
      offEvent('seat:held');
      offEvent('seat:released');
    };
  }, [showtimeId]);
  const loadData = async () => {
    setLoading(true);

    try {
      // 1. Lấy chi tiết suất chiếu (bao gồm thông tin phim, rạp, phòng)
      const showtimeResponse = await getShowtimeByIdAPI(showtimeId);
      const showtimeData = showtimeResponse.data.showtime;

      // 2. Lấy danh sách ghế đang được giữ VÀ ghế đã bán
      const holdsResponse = await getHoldsByShowtimeAPI(showtimeId);
      const heldSeats = holdsResponse.data?.holds || [];
      const heldSeatCodes = heldSeats.map(h => h.seatCode);
      const soldSeatCodes = holdsResponse.data?.soldSeats || []; // Ghế đã thanh toán

      // 3. Xử lý seatMap từ phòng thành danh sách ghế
      const room = showtimeData.roomId;
      const seatMap = room.seatMap || [];

      // Chuyển đổi seatMap thành danh sách phẳng
      const processedSeats = [];
      seatMap.forEach(rowData => {
        const row = rowData.row;
        rowData.seats.forEach(seat => {
          const seatCode = `${row}${seat.number.toString().padStart(2, '0')}`;

          // Xác định trạng thái ghế (Ưu tiên: sold > reserved > available)
          let status = 'available';
          if (seat.isBooked || soldSeatCodes.includes(seatCode)) {
            status = 'sold'; // Đã thanh toán/bán
          } else if (heldSeatCodes.includes(seatCode)) {
            status = 'reserved'; // Đang được giữ bởi người khác
          }

          // Tính giá theo loại ghế
          // Standard: giá gốc
          // VIP: giá gốc + phụ thu 5,000đ
          // Couple: (giá gốc + phụ thu 10,000đ) x 2 người
          const basePrice = showtimeData.basePrice || 75000;
          let price = basePrice;
          if (seat.type === 'vip') {
            price = basePrice + 5000; // VIP: +5,000đ phụ thu
          } else if (seat.type === 'couple') {
            price = (basePrice + 10000) * 2; // Couple: giá cho 2 người
          }

          processedSeats.push({
            id: seatCode,
            row: row,
            number: seat.number,
            type: seat.type || 'standard',
            status: status,
            price: Math.round(price),
            seatCode: seatCode
          });
        });
      });

      // 4. Format thông tin showtime để hiển thị
      const movie = showtimeData.movieId;
      const cinema = showtimeData.cinemaId;
      const startAt = new Date(showtimeData.startAt);

      const formattedShowtime = {
        _id: showtimeData._id,
        movieId: movie._id,
        movieTitle: movie.title,
        posterUrl: movie.posterUrl || '/placeholder-movie.jpg',
        ageRating: movie.ageRating || 'P',
        cinemaName: cinema.name,
        roomName: room.name,
        format: showtimeData.format || '2D',
        subtitle: showtimeData.subtitle || 'Phụ đề', // Phụ đề/Lồng tiếng
        date: startAt.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        time: startAt.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        basePrice: showtimeData.basePrice
      };

      setSeats(processedSeats);
      setShowtime(formattedShowtime);
      setLoading(false);

    } catch (error) {
      console.error('Lỗi tải dữ liệu ghế:', error);
      // Hiển thị thông báo lỗi
      alert('Không thể tải dữ liệu suất chiếu. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  const handleSeatClick = async (seat) => {
    // Không cho chọn ghế đã bán hoặc đang được giữ bởi người khác
    if (seat.status === 'sold' || seat.status === 'reserved') return;

    // Kiểm tra đăng nhập TRƯỚC khi gọi API
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }

    const isSelected = selectedSeats.find(s => s.id === seat.id);

    try {
      if (isSelected) {
        // BỎ CHỌN → Gọi API nhả ghế
        await releaseHoldAPI(showtimeId, seat.seatCode);
        setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
      } else {
        // CHỌN → Gọi API giữ ghế
        await createHoldAPI(showtimeId, seat.seatCode);
        setSelectedSeats(prev => [...prev, seat]);
      }
    } catch (error) {

      // Xử lý lỗi cụ thể
      if (error.response?.status === 409) {
        alert('Ghế này đã có người giữ! Vui lòng chọn ghế khác.');
        // Cập nhật lại trạng thái ghế
        setSeats(prevSeats => prevSeats.map(s => {
          if (s.id === seat.id) {
            return { ...s, status: 'reserved' };
          }
          return s;
        }));
      } else if (error.response?.status === 401) {
        alert('Vui lòng đăng nhập để chọn ghế!');
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại!');
      }
    }
  };

  const isSeatSelected = (seatId) => {
    return selectedSeats.some(s => s.id === seatId);
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Nhóm ghế theo hàng
  const getSeatsByRow = () => {
    const rows = {};
    seats.forEach(seat => {
      if (!rows[seat.row]) {
        rows[seat.row] = [];
      }
      rows[seat.row].push(seat);
    });

    // Sắp xếp ghế trong mỗi hàng theo số
    Object.keys(rows).forEach(row => {
      rows[row].sort((a, b) => a.number - b.number);
    });

    return rows;
  };

  const seatsByRow = getSeatsByRow();

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      setWarningOpen(true);
      return;
    }
    // Chuyển đến trang đặt combo trước khi thanh toán
    // Ghi nhận thời điểm bắt đầu giữ ghế (15 phút đếm ngược)
    const startTime = Date.now();
    sessionStorage.setItem('reservationStartTime', startTime.toString());
    navigate('/dat-ve-combo', {
      state: {
        showtime,
        selectedSeats,
        totalPrice,
        reservationStartTime: startTime
      }
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
          Đang tải sơ đồ ghế...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={styles.wrapper}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {/* Sơ đồ ghế */}
            <Grid item xs={12} md={8}>
              {/* Tiêu đề MÀN HÌNH */}
              <Typography sx={styles.screenTitle}>
                MÀN HÌNH
              </Typography>

              {/* Ảnh màn hình LED */}
              <Box
                component="img"
                src={screenImage}
                alt="Màn hình"
                sx={styles.screenImage}
              />

              {/* Sơ đồ ghế - dùng ảnh */}
              <Box sx={styles.seatContainer}>
                {Object.keys(seatsByRow).map(row => (
                  <Box key={row} sx={styles.seatRow}>
                    {seatsByRow[row].map(seat => (
                      <Box
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        sx={{
                          ...styles.seatWrapper,
                          ...(seat.status === 'sold' ? styles.soldSeatWrapper : {})
                        }}
                        title={`${seat.id} - ${formatPrice(seat.price)}`}
                      >
                        {/* Ảnh ghế */}
                        <Box
                          component="img"
                          src={getSeatImage(seat, isSeatSelected(seat.id))}
                          alt={seat.id}
                          sx={{
                            ...styles.seatImage,
                            ...(seat.type === 'COUPLE' ? styles.coupleSeatImage : {})
                          }}
                        />
                        {/* Label số ghế */}
                        <Typography
                          sx={{
                            ...styles.seatLabel,
                            ...(seat.type === 'COUPLE' ? styles.coupleSeatLabel : {})
                          }}
                        >
                          {seat.id}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ))}

                {/* Legend - Chú thích bằng ảnh */}
                <Box sx={styles.legend}>
                  <Box sx={styles.legendItem}>
                    <Box component="img" src={gheThuong} alt="Ghế thường" sx={styles.legendImage} />
                    <Typography variant="body2" color="text.secondary">Ghế thường</Typography>
                  </Box>
                  <Box sx={styles.legendItem}>
                    <Box component="img" src={gheDoi} alt="Ghế đôi" sx={styles.legendImage} />
                    <Typography variant="body2" color="text.secondary">Ghế đôi</Typography>
                  </Box>
                  <Box sx={styles.legendItem}>
                    <Box component="img" src={gheVip} alt="Ghế VIP" sx={styles.legendImage} />
                    <Typography variant="body2" color="text.secondary">Ghế VIP</Typography>
                  </Box>
                  <Box sx={styles.legendItem}>
                    <Box component="img" src={gheDaBan} alt="Ghế đã bán" sx={styles.legendImage} />
                    <Typography variant="body2" color="text.secondary">Ghế đã bán</Typography>
                  </Box>
                  <Box sx={styles.legendItem}>
                    <Box component="img" src={gheDangChon} alt="Ghế đang chọn" sx={styles.legendImage} />
                    <Typography variant="body2" color="text.secondary">Ghế đang chọn</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Thông tin đặt vé */}
            <Grid item xs={12} md={4}>
              {/* Thời gian giữ ghế - chỉ hiển thị khi quay lại từ trang combo */}
              {hasReservation && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography sx={{ color: '#666', fontSize: '1rem' }}>
                    Thời gian giữ ghế: {' '}
                    <Box component="span" sx={{
                      color: timeLeft <= 60 ? '#DC2626' : '#F5A623',
                      fontWeight: 700,
                      fontSize: '1.3rem'
                    }}>
                      {formatTime(timeLeft)}
                    </Box>
                  </Typography>
                </Box>
              )}

              <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {/* Nội dung */}
                <Box sx={{ p: 3 }}>
                  {/* Poster + Thông tin phim */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    {/* Poster phim */}
                    <Box
                      component="img"
                      src={showtime?.posterUrl || '/placeholder-movie.jpg'}
                      alt={showtime?.movieTitle}
                      sx={{
                        width: 130,
                        height: 180,
                        borderRadius: 1,
                        objectFit: 'cover',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    />
                    {/* Thông tin phim */}
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700} sx={{ color: '#333333', fontSize: '1.1rem', mb: 1 }}>
                        {showtime?.movieTitle}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          {showtime?.format}{showtime?.subtitle ? ` ${showtime.subtitle}` : ''}
                        </Typography>
                        {showtime?.ageRating && (
                          <Box sx={{
                            bgcolor: showtime.ageRating === 'P' ? '#4caf50' :
                              showtime.ageRating === 'C13' ? '#ff9800' :
                                showtime.ageRating === 'C16' ? '#f44336' :
                                  showtime.ageRating === 'C18' ? '#d32f2f' : '#757575',
                            color: '#fff',
                            px: 1,
                            py: 0.25,
                            borderRadius: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
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

                  {/* Chi tiết vé */}
                  {selectedSeats.length > 0 ? (
                    <Box sx={{ mb: 2 }}>
                      {/* Nhóm theo loại ghế */}
                      {(() => {
                        const grouped = selectedSeats.reduce((acc, seat) => {
                          const type = seat.type === 'STANDARD' ? 'Thường' : seat.type === 'VIP' ? 'VIP' : 'Đôi';
                          if (!acc[type]) acc[type] = { seats: [], price: seat.price, count: 0 };
                          acc[type].seats.push(seat.id);
                          acc[type].count++;
                          return acc;
                        }, {});

                        return Object.entries(grouped).map(([type, data]) => (
                          <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              {data.count}x Ghế {type}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#F5A623', fontWeight: 600 }}>
                              {formatPrice(data.price * data.count).replace('₫', 'đ')}
                            </Typography>
                          </Box>
                        ));
                      })()}

                      {/* Ghế đã chọn */}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Ghế: <strong style={{ color: '#333333' }}>{selectedSeats.map(s => s.id).join(', ')}</strong>
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Vui lòng chọn ghế
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Tổng cộng */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography fontWeight={700} sx={{ color: '#333333' }}>
                      Tổng cộng
                    </Typography>
                    <Typography fontWeight={700} sx={{ color: '#F5A623', fontSize: '1.2rem' }}>
                      {formatPrice(totalPrice).replace('₫', 'đ')}
                    </Typography>
                  </Box>

                  {/* Nút Quay lại + Tiếp tục */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="text"
                      onClick={() => navigate(-1)}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        color: '#F5A623',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: 'rgba(245,166,35,0.08)'
                        }
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
                        fontSize: '1rem',
                        bgcolor: '#F5A623',
                        borderRadius: 6,
                        textTransform: 'none',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: '#E09612'
                        }
                      }}
                    >
                      Tiếp tục
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Dialog cảnh báo chưa chọn ghế */}
        <Dialog
          open={warningOpen}
          onClose={() => setWarningOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 320,
              textAlign: 'center',
              p: 2
            }
          }}
        >
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <WarningAmberIcon sx={{ fontSize: 60, color: '#F5A623', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Thông báo
            </Typography>
            <Typography color="text.secondary">
              Vui lòng chọn ghế
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              variant="contained"
              onClick={() => setWarningOpen(false)}
              sx={{
                bgcolor: '#F5A623',
                color: '#fff',
                fontWeight: 600,
                px: 6,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#E09612'
                }
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Modal Đăng nhập khi chưa đăng nhập mà chọn ghế */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}

export default SeatSelectionPage;
