import { useState, useEffect, useCallback } from 'react';
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
  DialogActions,
  useMediaQuery,
  useTheme
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Auth Context
import { useAuth } from '../../../contexts/AuthContext';
// Login Modal
import LoginModal from '../../../components/Common/AuthModals/LoginModal';

// API
import { getShowtimeByIdAPI } from '../../../apis/showtimeApi';
import { getHoldsByShowtimeAPI, createHoldAPI, releaseHoldAPI, verifyHoldAPI, releaseAllHoldsAPI } from '../../../apis/seatHoldApi';

// Socket.io - Real-time seat updates
import {
  connectSocket,
  joinShowtime,
  leaveShowtime,
  onSeatHeld,
  onSeatReleased,
  offEvent
} from '../../../services/socketService';

// Timer hook
import useSeatTimer from '../../../hooks/useSeatTimer';

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
  // Container cho sơ đồ ghế - không scroll ngang, chunk theo dòng
  seatContainer: {
    width: '100%',
    mx: 'auto',
    px: { xs: 0.5, sm: 1, md: 2 },
    overflowX: 'hidden',
    pb: { xs: 2, md: 0 }
  },
  // Row chứa các ghế - mỗi dòng tối đa 10 ghế, căn giữa
  seatRow: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: { xs: '2px', sm: '3px', md: '4px' },
    mb: { xs: '4px', sm: '6px', md: '8px' }
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
    width: { xs: 70, sm: 84, md: 110 },
    height: { xs: 40, sm: 42, md: 55 }
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
  // ƯU TIÊN 1: Ghế đang được chọn bởi user → hiện vàng (dù status gì)
  if (isSelected) return gheDangChon;
  // ƯU TIÊN 2: Ghế đã bán hoặc đang được giữ bởi người khác
  if (seat.status === 'sold' || seat.status === 'reserved') return gheDaBan;

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
  const { isAuthenticated, user } = useAuth(); // Lấy user để restore ghế đang giữ

  // Responsive: Desktop 12 ghế/dòng, Mobile 10 ghế/dòng
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const maxSeatsPerLine = isMobile ? 10 : 12;

  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showtime, setShowtime] = useState(null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false); // Modal đăng nhập
  const [maxSeatsWarningOpen, setMaxSeatsWarningOpen] = useState(false); // Modal cảnh báo vượt 8 ghế

  // Timer hook - đồng bộ với sessionStorage và persist qua các trang
  const {
    timeLeft,
    formattedTime,
    isExpired,
    hasExistingTimer,
    startNewTimer,
    initTimer
  } = useSeatTimer(showtimeId, {
    enabled: true,
    ignoreShowtimeId: true, // Timer persist qua các showtime khác nhau
    onExpire: () => {
      // Giải phóng ghế đã giữ khi hết thời gian
      if (showtimeId && selectedSeats.length > 0) {
        Promise.all(
          selectedSeats.map(seat =>
            releaseHoldAPI(showtimeId, seat.seatCode).catch(() => { })
          )
        );
      }
      setSelectedSeats([]);
      alert('Hết thời gian giữ ghế! Vui lòng chọn lại suất chiếu.');
      const movieSlug = showtime?.movie?.slug || showtime?.movieSlug;
      if (movieSlug) {
        navigate(`/dat-ve/${movieSlug}`);
      } else {
        navigate('/');
      }
    },
    redirectPath: '/'
  });

  // Kiểm tra có timer đang chạy không
  const hasReservation = hasExistingTimer() || (timeLeft !== null && timeLeft > 0);

  // Load dữ liệu ghế và suất chiếu
  // Re-run khi showtimeId thay đổi HOẶC auth state thay đổi (login/logout)
  useEffect(() => {
    loadData();
    // Xóa selectedSeats khi logout (vì ghế của user cũ không còn valid)
    if (!isAuthenticated) {
      setSelectedSeats([]);
    }
  }, [showtimeId, isAuthenticated]);

  // REAL-TIME SOCKET.IO
  // Kết nối Socket.io để đồng bộ trạng thái ghế real-time
  useEffect(() => {
    if (!showtimeId) return;

    // 1. Kết nối socket và tham gia phòng
    connectSocket();
    joinShowtime(showtimeId);

    // Helper: Lấy userId hiện tại (re-read mỗi lần để handle case login sau khi mount)
    const getCurrentUserId = () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      return storedUser._id || storedUser.id || null;
    };

    // 2. Lắng nghe khi ghế được giữ bởi NGƯỜI KHÁC
    onSeatHeld((data) => {
      // Re-read userId mỗi lần có event (vì user có thể login sau khi mount)
      const currentUserId = getCurrentUserId();

      // Bỏ qua nếu là ghế do chính mình giữ
      if (currentUserId && data.userId === currentUserId) {
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
      }))
    });

    // 4.1 Phát hiện F5/Reload: Set flag khi beforeunload
    const handleBeforeUnload = () => {
      sessionStorage.setItem('isPageReloading', 'true');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 4.2 Cleanup khi rời trang
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      leaveShowtime(showtimeId);
      offEvent('seat:held');
      offEvent('seat:released');

      // AUTO-RELEASE: Chỉ nhả ghế khi NAVIGATE AWAY (không phải F5/reload)
      const isReloading = sessionStorage.getItem('isPageReloading');
      const hasReservation = sessionStorage.getItem('reservationStartTime');

      // Xóa flag reload sau khi check
      sessionStorage.removeItem('isPageReloading');

      // Không release nếu: đang reload HOẶC đi đến combo
      if (isReloading || hasReservation) {
        console.log('[SeatSelection] Keeping holds (reload/combo)');
        return;
      }

      // Navigate away → release tất cả ghế
      if (showtimeId) {
        releaseAllHoldsAPI(showtimeId).catch((err) => {
          console.log('[SeatSelection] Release all holds on leave:', err?.message || 'failed');
        });
      }
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

      // 2.1 Lấy userId từ localStorage (vì useAuth context có thể chưa ready khi reload)
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = storedUser._id || storedUser.id || null;

      // 3. Xử lý seatMap từ phòng thành danh sách ghế
      const room = showtimeData.roomId;
      const seatMap = room.seatMap || [];

      // Helper: Normalize seat type để thống nhất uppercase
      const normalizeSeatType = (t) => {
        const v = String(t || 'standard').toLowerCase();
        if (v === 'vip') return 'VIP';
        if (v === 'couple') return 'COUPLE';
        return 'STANDARD';
      };

      // Duplicate detection
      const seatCodeSet = new Set();
      const duplicates = new Set();

      // Chuyển đổi seatMap thành danh sách phẳng
      const processedSeats = [];
      seatMap.forEach(rowData => {
        const row = rowData.row;
        rowData.seats.forEach(seat => {
          const seatCode = `${row}${seat.number.toString().padStart(2, '0')}`;

          // Check duplicate seatCode
          if (seatCodeSet.has(seatCode)) {
            duplicates.add(seatCode);
          } else {
            seatCodeSet.add(seatCode);
          }

          // Xác định trạng thái ghế (Ưu tiên: sold > reserved > available)
          // LƯU Ý: Ghế của CHÍNH USER đang giữ → không đánh dấu reserved
          const isMyHold = currentUserId && heldSeats.some(h => h.seatCode === seatCode && h.userId === currentUserId);
          const isOtherHold = heldSeatCodes.includes(seatCode) && !isMyHold;

          let status = 'available';
          if (seat.isBooked || soldSeatCodes.includes(seatCode)) {
            status = 'sold'; // Đã thanh toán/bán
          } else if (isOtherHold) {
            status = 'reserved'; // Đang được giữ bởi NGƯỜI KHÁC
          }
          // Ghế của user đang giữ → status = 'available' (sẽ được add vào selectedSeats ở bước sau)

          // Normalize seat type
          const seatType = normalizeSeatType(seat.type);

          // Tính giá theo loại ghế
          // Standard: giá gốc
          // VIP: giá gốc + phụ thu 5,000đ
          // Couple: (giá gốc + phụ thu 10,000đ) x 2 người
          const basePrice = showtimeData.basePrice || 75000;
          let price = basePrice;
          if (seatType === 'VIP') {
            price = basePrice + 5000; // VIP: +5,000đ phụ thu
          } else if (seatType === 'COUPLE') {
            price = (basePrice + 10000) * 2; // Couple: giá cho 2 người
          }

          processedSeats.push({
            id: seatCode,
            row: row,
            number: seat.number,
            type: seatType,
            status: status,
            price: Math.round(price),
            seatCode: seatCode
          });
        });
      });

      // Fail-fast: throw error nếu có duplicate seatCode
      if (duplicates.size > 0) {
        console.error('[SeatMap] DUPLICATE seatCodes detected:', Array.from(duplicates));
        throw new Error(`Lỗi dữ liệu: Trùng mã ghế (${Array.from(duplicates).join(', ')})`);
      }

      // 4. Format thông tin showtime để hiển thị
      const movie = showtimeData.movieId;
      const cinema = showtimeData.cinemaId;
      const startAt = new Date(showtimeData.startAt);

      const formattedShowtime = {
        _id: showtimeData._id,
        movieId: movie._id,
        movieSlug: movie.slug,
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
        basePrice: showtimeData.basePrice,
        rating: movie.rating || 0,
        ratingCount: movie.ratingCount || 0,
        viewCount: movie.viewCount || 0,
        duration: movie.duration,
        releaseDate: movie.releaseDate
      };

      setSeats(processedSeats);
      setShowtime(formattedShowtime);

      // 5. RESTORE: Khôi phục ghế của user đang giữ (khi F5/reload)
      if (currentUserId) {
        const myHeldSeatCodes = heldSeats
          .filter(h => h.userId === currentUserId)
          .map(h => h.seatCode);

        if (myHeldSeatCodes.length > 0) {
          const myHeldSeats = processedSeats.filter(s => myHeldSeatCodes.includes(s.seatCode));
          setSelectedSeats(myHeldSeats);
          console.log('[SeatSelection] Restored user\'s held seats:', myHeldSeatCodes);
        }
      }

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

    // CLIENT-SIDE CHECK: Giới hạn tối đa 8 ghế (check ngay lập tức, không chờ API)
    const MAX_SEATS = 8;
    if (!isSelected && selectedSeats.length >= MAX_SEATS) {
      setMaxSeatsWarningOpen(true);
      return; // Chặn ngay, không gọi API
    }

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
      } else if (error.response?.status === 400) {
        // Lỗi giới hạn số ghế - hiện modal cảnh báo
        setMaxSeatsWarningOpen(true);
      } else if (error.response?.status === 401) {
        setLoginModalOpen(true);
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
                  ...(index === 1 ? styles.stepperItemActive : {}) // Step 2 active
                }}
              >
                <Typography
                  sx={{
                    ...styles.stepText,
                    ...(index === 1 ? styles.stepTextActive : {})
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

              {/* Sơ đồ ghế - chunk 10 ghế / 1 dòng */}
              <Box sx={styles.seatContainer}>
                {(() => {
                  // Helper: chia mảng thành các chunk
                  const chunkArray = (arr, size) => {
                    const res = [];
                    for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
                    return res;
                  };
                  // Responsive: Desktop 12 ghế/dòng, Mobile 10 ghế/dòng
                  const maxPerLine = maxSeatsPerLine;

                  return Object.keys(seatsByRow).sort().map(row => {
                    const lines = chunkArray(seatsByRow[row], maxPerLine);

                    return (
                      <Box key={row} sx={{ mb: { xs: 0.5, md: 1 } }}>
                        {lines.map((lineSeats, idx) => (
                          <Box key={`${row}-${idx}`} sx={styles.seatRow}>
                            {lineSeats.map(seat => (
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
                                  sx={styles.seatImage}
                                />
                                {/* Label số ghế */}
                                <Typography sx={styles.seatLabel}>
                                  {seat.id}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    );
                  });
                })()}

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
                      color: (timeLeft || 0) <= 60 ? '#DC2626' : '#F5A623',
                      fontWeight: 700,
                      fontSize: '1.3rem'
                    }}>
                      {formattedTime}
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

                        {/* Rating */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ fontSize: 16, color: '#F5A623' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#333' }}>
                            {showtime?.rating}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({showtime?.ratingCount} đánh giá)
                          </Typography>
                        </Box>

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

      {/* Modal Cảnh báo vượt quá 8 ghế */}
      <Dialog
        open={maxSeatsWarningOpen}
        onClose={() => setMaxSeatsWarningOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: 300,
            textAlign: 'center',
            py: 2
          }
        }}
      >
        <DialogContent sx={{ px: 1, py: 3 }}>
          <WarningAmberIcon sx={{ fontSize: 60, color: '#F5A623', mb: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#333' }}>
            Thông báo
          </Typography>
          <Typography color="text.secondary">
            Số lượng ghế tối đa được đặt là 8 ghế
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => setMaxSeatsWarningOpen(false)}
            sx={{
              bgcolor: '#F5A623',
              color: '#fff',
              fontWeight: 600,
              px: 6,
              py: 1,
              borderRadius: 1,
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

      {/* Modal Đăng nhập khi chưa đăng nhập mà chọn ghế */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          // Reload data sau khi đăng nhập thành công để cập nhật trạng thái ghế
          loadData();
        }}
      />
    </>
  );
}

export default SeatSelectionPage;
