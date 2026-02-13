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
  TextField,
  IconButton,
  Collapse,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Alert,
  Checkbox
} from '@mui/material';
// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
// API - Vouchers
import { getAvailableVouchersAPI, applyVoucherAPI } from '../../../apis/voucherApi';
// API - Loyalty (Cinema Coin)
import { getMyLoyaltyAPI } from '../../../apis/loyaltyApi';
// API - Order
import { createOrderAPI } from '../../../apis/orderApi';
// Auth Context
import { useAuth } from '../../../contexts/AuthContext';
// Timer Hook
import useSeatTimer from '../../../hooks/useSeatTimer';
// STYLES - Responsive theo layout Rio Cinemas
const styles = {
  // Container chính
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
  // Timer đếm ngược
  timer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    mb: 3
  },
  timerText: {
    fontSize: { xs: '1.2rem', md: '1.5rem' },
    fontWeight: 700
  },
  // Cột trái - Các section thông tin
  infoSection: {
    mb: 2
  },
  sectionHeader: {
    bgcolor: '#333333B5',
    color: '#fff',
    py: 1,
    px: 2,
    fontWeight: 600,
    fontSize: '0.9rem'
  },
  sectionContent: {
    bgcolor: '#fff',
    p: 2
  },
  // Cột phải - Box thanh toán
  paymentBox: {
    bgcolor: '#fff',
    borderRadius: 1,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  paymentHeader: {
    bgcolor: '#333333B5',
    color: '#fff',
    py: 1.5,
    px: 2,
    fontWeight: 600,
    textAlign: 'center'
  },
  paymentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    py: 0.5
  },
  // Section voucher/mã giảm giá
  voucherSection: {
    mt: 2,
    p: 2,
    bgcolor: '#fff8e1',
    borderRadius: 1,
    border: '1px dashed #ffc107'
  },
  // Section Cinema Coin
  coinSection: {
    mt: 2,
    p: 2,
    bgcolor: '#e3f2fd',
    borderRadius: 1,
    border: '1px dashed #1976d2'
  },
  coinApplied: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    bgcolor: '#e8f5e9',
    p: 1.5,
    borderRadius: 1,
    mt: 1
  },
  voucherApplied: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    bgcolor: '#e8f5e9',
    p: 1.5,
    borderRadius: 1,
    mt: 1
  },
  // Tổng thanh toán
  paymentTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    py: 1.5,
    borderTop: '2px solid #1a3a5c',
    mt: 2
  },
  // Nút thanh toán
  payBtn: {
    width: '100%',
    py: 1.5,
    fontWeight: 700,
    fontSize: '1rem',
    bgcolor: '#DC2626',
    '&:hover': { bgcolor: '#B91C1C' }
  },
  // Loading screen
  loadingOverlay: {
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
  },
  loadingLogo: {
    width: 200,
    height: 200,
    mb: 1.5,
    objectFit: 'contain'
  },
  loadingSpinner: {
    color: '#F5A623',
    mb: 2
  },
  loadingText: {
    color: '#FFA500',
    fontSize: '1.2rem',
    fontWeight: 600
  }
};
// COMPONENT CHÍNH
function PaymentConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  // LẤY DỮ LIỆU TỪ TRANG TRƯỚC (ComboPage hoặc PaymentResultPage retry)
  const {
    showtime = {},      // Thông tin suất chiếu
    selectedSeats = [], // Danh sách ghế đã chọn
    seatPrice = 0,      // Tổng tiền vé
    combos = [],        // Danh sách combo đã chọn
    comboPrice = 0,     // Tổng tiền combo
    totalPrice = 0,     // Tổng tiền (không dùng, tính lại ở đây)
    forceTimerSync = false, // Flag từ PaymentResultPage retry
    reservationStartTime: stateStartTime // Timer start time từ ComboPage
  } = location.state || {};
  // THÔNG TIN NGƯỜI DÙNG - Từ AuthContext
  const userInfo = {
    name: user?.name || 'Khách',
    email: user?.email || '',
    phone: user?.phone || ''
  };

  // TIMER HOOK - Sử dụng useSeatTimer thay vì logic thủ công
  // Khi retry từ VNPay (forceTimerSync=true): KHÔNG verify với server vì SeatHold đã bị xóa khi tạo order
  // Backend sẽ reuse PENDING order cũ nên không cần SeatHold
  const {
    timeLeft,
    formattedTime,
    isExpired,
    isLoading: timerLoading
  } = useSeatTimer(showtime?._id, {
    enabled: !!showtime?._id,
    shouldVerifyOnMount: !forceTimerSync, // Skip verify khi retry từ VNPay
    forceSync: false, // Không force sync vì SeatHold đã bị xóa
    redirectPath: '/dat-ve',
    onExpire: () => {
      alert('Hết thời gian giữ ghế! Vui lòng đặt vé lại.');
      navigate('/dat-ve');
    }
  });

  // STATE QUẢN LÝ VOUCHER
  const [voucherOpen, setVoucherOpen] = useState(false);        // Mở/đóng section nhập mã
  const [voucherCode, setVoucherCode] = useState('');           // Mã voucher đang nhập
  const [appliedVoucher, setAppliedVoucher] = useState(null);   // Voucher đã áp dụng
  const [voucherError, setVoucherError] = useState('');         // Thông báo lỗi voucher
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false); // Dialog chọn voucher
  const [availableVouchers, setAvailableVouchers] = useState([]); // Danh sách voucher từ API
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  // STATE CINEMA COIN
  const [coinOpen, setCoinOpen] = useState(false);              // Mở/đóng section Cinema Coin
  const [coinInput, setCoinInput] = useState('');               // Số điểm nhập
  const [coinApplied, setCoinApplied] = useState(0);            // Điểm đã áp dụng
  const [coinError, setCoinError] = useState('');               // Lỗi validate coin
  const [userPoints, setUserPoints] = useState(0);              // Điểm hiện có của user
  // STATE THANH TOÁN
  const [paymentMethod, setPaymentMethod] = useState('vnpay');  // Phương thức thanh toán
  const [loading, setLoading] = useState(false);                // Đang xử lý thanh toán
  const [isPageLoading, setIsPageLoading] = useState(true);     // Loading khi vào trang
  // STATE MODAL XÁC NHẬN THANH TOÁN
  const [confirmModalOpen, setConfirmModalOpen] = useState(false); // Mở/đóng modal xác nhận
  const [termsAccepted, setTermsAccepted] = useState(false);       // Checkbox đồng ý điều khoản

  // EFFECTS
  /**
   * Effect: Fetch danh sách voucher từ API
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoadingVouchers(true);
      try {
        // Fetch vouchers
        const voucherRes = await getAvailableVouchersAPI();
        setAvailableVouchers(voucherRes.data?.vouchers || []);
        console.log('[Voucher] Loaded vouchers:', voucherRes.data?.vouchers?.length);

        // Fetch Cinema Coin (user points)
        try {
          const loyaltyRes = await getMyLoyaltyAPI();
          setUserPoints(loyaltyRes.data?.points || 0);
          console.log('[CinemaCoin] User points:', loyaltyRes.data?.points);
        } catch (loyaltyErr) {
          console.error('[CinemaCoin] Error loading points:', loyaltyErr);
        }
      } catch (error) {
        console.error('[Voucher] Error loading vouchers:', error);
      } finally {
        setLoadingVouchers(false);
        setIsPageLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Effect: Kiểm tra dữ liệu đầu vào
   * - Redirect về trang chủ nếu không có dữ liệu từ trang trước
   */
  useEffect(() => {
    if (!location.state || selectedSeats.length === 0) {
      console.warn('[PaymentConfirmPage] Không có dữ liệu đặt vé, redirect về trang chủ');
      navigate('/');
    }
  }, [location.state, selectedSeats, navigate]);

  // HELPER FUNCTIONS
  /**
   * Format thời gian dạng mm:ss (fallback, hook có sẵn formattedTime)
   * @param {number} seconds - Số giây
   * @returns {string} - Chuỗi thời gian "MM:SS"
   */
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  /**
   * Format giá tiền theo định dạng Việt Nam
   * @param {number} price - Số tiền
   * @returns {string} - Chuỗi tiền tệ "1.000.000"
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };
  // TÍNH TOÁN GIÁ
  /**
   * Tính số tiền giảm giá từ voucher
   * - Nếu API đã trả về discountAmount thì dùng luôn
   * - Nếu không thì tính theo type/value
   */
  const calculateDiscount = () => {
    if (!appliedVoucher) return 0;

    // Nếu có discountAmount từ API thì dùng luôn
    if (appliedVoucher.discountAmount !== undefined) {
      return appliedVoucher.discountAmount;
    }

    // Tính từ type/value (cho trường hợp chọn từ dialog)
    const subtotal = seatPrice + comboPrice;
    if (appliedVoucher.type === 'PERCENT') {
      const discount = (subtotal * appliedVoucher.value) / 100;
      return Math.min(discount, appliedVoucher.maxDiscount || discount);
    } else {
      // FIXED
      return appliedVoucher.value || 0;
    }
  };
  const discount = calculateDiscount();
  const coinDiscount = coinApplied; // 1 điểm = 1 VND
  const grandTotal = Math.max(0, (seatPrice + comboPrice) - discount - coinDiscount);
  // VOUCHER HANDLERS
  /**
   * Xử lý áp dụng voucher từ input nhập mã
   * - Gọi API applyVoucher trên server
   * - Server validate và trả về discountAmount
   */
  const handleApplyVoucher = async () => {
    setVoucherError('');

    // Validate: Mã không được rỗng
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      const totalAmount = seatPrice + comboPrice;
      const result = await applyVoucherAPI(voucherCode, totalAmount);
      // result = { status: 'success', data: { code, discountAmount, ... } }
      const { code, discountAmount, type, value } = result.data;

      // Áp dụng thành công
      setAppliedVoucher({
        code,
        discountAmount,
        type,
        value
      });
      setVoucherCode('');
      setVoucherOpen(false);
      console.log('[Voucher] Áp dụng thành công:', code, 'Giảm:', discountAmount);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Mã giảm giá không hợp lệ';
      setVoucherError(errorMessage);
    }
  };

  /**
   * Xử lý chọn voucher từ dialog danh sách
   * - Cũng cần gọi API để validate (check user đã dùng chưa)
   */
  const handleSelectVoucher = async (voucher) => {
    setVoucherError('');
    setVoucherDialogOpen(false);

    try {
      const totalAmount = seatPrice + comboPrice;
      const result = await applyVoucherAPI(voucher.code, totalAmount);
      // result = { status: 'success', data: { code, discountAmount, ... } }
      const { code, discountAmount, type, value } = result.data;

      setAppliedVoucher({
        code,
        discountAmount,
        type,
        value
      });
      console.log('[Voucher] Chọn từ danh sách thành công:', code, 'Giảm:', discountAmount);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Mã giảm giá không hợp lệ';
      setVoucherError(errorMessage);
      console.error('[Voucher] Lỗi chọn từ danh sách:', errorMessage);
    }
  };

  /**
   * Xử lý gỡ voucher đã áp dụng
   */
  // CINEMA COIN HANDLERS
  const MIN_COIN = 1000; // Tối thiểu 1,000 điểm

  const handleApplyCoin = () => {
    setCoinError('');
    const points = parseInt(coinInput);

    if (!points || isNaN(points) || points <= 0) {
      setCoinError('Vui lòng nhập số điểm hợp lệ');
      return;
    }
    if (points < MIN_COIN) {
      setCoinError(`Tối thiểu ${MIN_COIN.toLocaleString()} điểm để sử dụng Cinema Coin`);
      return;
    }
    if (points > userPoints) {
      setCoinError(`Bạn chỉ có ${userPoints.toLocaleString()} điểm`);
      return;
    }

    // Không giảm quá tổng đơn hàng (sau voucher)
    const afterVoucher = (seatPrice + comboPrice) - discount;
    if (points > afterVoucher) {
      setCoinError(`Không thể dùng quá ${afterVoucher.toLocaleString()} điểm (tổng đơn hàng sau giảm giá)`);
      return;
    }

    setCoinApplied(points);
    setCoinInput('');
    setCoinOpen(false);
    console.log('[CinemaCoin] Applied:', points, 'points');
  };

  const handleRemoveCoin = () => {
    console.log('[CinemaCoin] Removed:', coinApplied, 'points');
    setCoinApplied(0);
    setCoinError('');
  };

  const handleRemoveVoucher = () => {
    console.log('[Voucher] Gỡ voucher:', appliedVoucher?.code);
    setAppliedVoucher(null);
    setVoucherError('');
  };
  // PAYMENT HANDLER - Mở modal xác nhận trước khi thanh toán
  // Timer đã được sync bởi useSeatTimer hook
  const handleOpenConfirmModal = () => {
    // Kiểm tra timer - nếu đã expired thì không cho phép
    if (isExpired) {
      alert('Hết thời gian giữ ghế! Vui lòng đặt vé lại.');
      return;
    }
    setConfirmModalOpen(true);
    setTermsAccepted(false); // Reset checkbox mỗi lần mở
  };

  /**
   * Xử lý thanh toán (sau khi xác nhận modal)
   * - Gọi API tạo Order
   * - Redirect sang VNPay
   */
  const handlePayment = async () => {
    if (!termsAccepted) return;
    setConfirmModalOpen(false);
    setLoading(true);
    console.log('[Payment] Bắt đầu thanh toán:', {
      method: paymentMethod,
      total: grandTotal,
      seats: selectedSeats.length,
      combos: combos.length,
      voucher: appliedVoucher?.code
    });

    try {
      // DEBUG: Log raw combos data
      console.log('[Payment] Raw combos from ComboPage:', combos);
      console.log('[Payment] Combos with quantity > 0:', combos.filter(c => c.quantity > 0));

      // Chuẩn bị dữ liệu cho API
      const orderData = {
        showtimeId: showtime?._id,
        seats: selectedSeats.map(s => s.seatCode), // Array of seat codes
        combos: combos
          .filter(c => c.quantity > 0) // Chỉ gửi combo có quantity > 0
          .map(c => {
            console.log('[Payment] Processing combo:', c.name, 'ID:', c._id, 'quantity:', c.quantity);
            return {
              id: c._id || c.id,
              quantity: c.quantity
            };
          })
      };

      // Chỉ thêm voucherCode nếu có giá trị
      if (appliedVoucher?.code) {
        orderData.voucherCode = appliedVoucher.code;
      }

      // Thêm Cinema Coin nếu có
      if (coinApplied > 0) {
        orderData.usedPoints = coinApplied;
      }

      console.log('[Payment] Order data to send:', JSON.stringify(orderData, null, 2));

      // Gọi API tạo Order và lấy VNPay URL
      const response = await createOrderAPI(orderData);

      if (response.status === 'success' && response.data.paymentUrl) {
        console.log('[Payment] Redirect to VNPay:', response.data.paymentUrl);

        // Lưu thông tin booking vào sessionStorage để hiển thị ở trang kết quả
        const bookingData = {
          userName: userInfo.name,
          movieTitle: showtime?.movieTitle,
          seats: selectedSeats.map(s => s.seatCode).join(', '),
          showtime: `${showtime?.time || ''} - ${showtime?.date || ''}`, // Fix: combine time + date
          cinema: `${showtime?.cinemaName} - ${showtime?.roomName}`,
          totalAmount: grandTotal
        };
        sessionStorage.setItem('lastBookingData', JSON.stringify(bookingData));

        // Clear reservation timer
        sessionStorage.removeItem('reservationStartTime');
        // Redirect sang VNPay
        window.location.href = response.data.paymentUrl;
      } else {
        alert('Không thể tạo đơn hàng. Vui lòng thử lại!');
        setLoading(false);
      }
    } catch (error) {
      console.error('[Payment] Error:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!';

      // Xử lý các lỗi cụ thể
      if (errorMessage.includes('hết hạn') || errorMessage.includes('chọn lại ghế')) {
        // Đơn hàng/hold đã hết hạn → redirect về trang chọn ghế
        alert(errorMessage);
        sessionStorage.removeItem('reservationStartTime');
        const showtimeId = showtime?._id;
        if (showtimeId) {
          navigate(`/chon-ghe/${showtimeId}`);
        } else {
          navigate('/');
        }
        return;
      }

      // Lỗi khác → hiện message
      alert(errorMessage);
      console.error('[Payment] Backend error message:', errorMessage);
      setLoading(false);
    }
  };

  // RENDER: Loading state khi vào trang
  if (isPageLoading) {
    return (
      <Box sx={styles.loadingOverlay}>
        <Box
          component="img"
          src="/NMN_CENIMA_LOGO.png"
          alt="NMN Cinema"
          sx={styles.loadingLogo}
        />
        <CircularProgress size={40} thickness={2} sx={styles.loadingSpinner} />
        <Typography sx={styles.loadingText}>
          Chờ tôi xíu nhé
        </Typography>
      </Box>
    );
  }

  // RENDER: Main content
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
                ...(index === 3 ? styles.stepperItemActive : {}) // Step 4 active (Thanh toán)
              }}
            >
              <Typography
                sx={{
                  ...styles.stepText,
                  ...(index === 3 ? styles.stepTextActive : {})
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

      <Container maxWidth="lg">
        {/* TIMER ĐẾM NGƯỢC */}
        <Box sx={styles.timer}>
          <AccessTimeIcon sx={{ color: timeLeft <= 60 ? '#DC2626' : '#666' }} />
          <Typography sx={{
            ...styles.timerText,
            color: timeLeft <= 60 ? '#DC2626' : '#F5A623'
          }}>
            {formatTime(timeLeft)}
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {/* CỘT TRÁI - THÔNG TIN  */}
          <Grid item xs={12} md={7}>
            {/* Thông tin phim*/}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, bgcolor: '#fff', p: 2, borderRadius: 1 }}>
              <Box
                component="img"
                src={showtime?.posterUrl || '/placeholder-movie.jpg'}
                alt={showtime?.movieTitle}
                sx={{ width: 100, height: 140, borderRadius: 1, objectFit: 'cover' }}
              />
              <Box>
                <Typography fontWeight={700} sx={{ color: '#1a3a5c', mb: 0.5 }}>
                  {showtime?.movieTitle || 'Tên phim'}
                </Typography>
                {/* Format + Độ tuổi */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {showtime?.format || '2D'}{showtime?.subtitle ? ` ${showtime.subtitle}` : ''}
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
                <Typography variant="body2" color="text.secondary">
                  {showtime?.cinemaName || 'NMN Cinema'} - {showtime?.roomName || 'Phòng 01'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Suất chiếu: {showtime?.time || '20:00'} - {showtime?.date || '05/01/2026'}
                </Typography>
              </Box>
            </Box>
            {/*Thông tin người mua*/}
            <Box sx={styles.infoSection}>
              <Typography sx={styles.sectionHeader}>THÔNG TIN NGƯỜI MUA</Typography>
              <Box sx={styles.sectionContent}>
                <Typography variant="body2"><strong>Họ tên:</strong> {userInfo.name}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {userInfo.email}</Typography>
                <Typography variant="body2"><strong>SĐT:</strong> {userInfo.phone}</Typography>
              </Box>
            </Box>
            {/*Thông tin vé*/}
            <Box sx={styles.infoSection}>
              <Typography sx={styles.sectionHeader}>THÔNG TIN VÉ</Typography>
              <Box sx={styles.sectionContent}>
                {/* Hiển thị các ghế đã chọn */}
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                  {selectedSeats.map(seat => seat.id || seat.seatCode).join(', ')}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">Số lượng</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedSeats.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Tổng</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatPrice(seatPrice)}</Typography>
                </Box>
              </Box>
            </Box>
            {/* Thông tin bắp nước (nếu có) */}
            {combos.length > 0 && (
              <Box sx={styles.infoSection}>
                <Typography sx={styles.sectionHeader}>THÔNG TIN BẮP NƯỚC</Typography>
                <Box sx={styles.sectionContent}>
                  {combos.map((combo, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#DC2626' }}>
                        {combo.name}
                      </Typography>
                      <Typography variant="body2">{combo.quantity}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Tổng</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatPrice(comboPrice)}</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Grid>
          {/*CỘT PHẢI - THANH TOÁN*/}
          <Grid item xs={12} md={5}>
            <Paper sx={styles.paymentBox}>
              <Typography sx={styles.paymentHeader}>THÔNG TIN THANH TOÁN</Typography>
              <Box sx={{ p: 2 }}>
                {/*Chi tiết giá*/}
                {combos.length > 0 && (
                  <Box sx={styles.paymentRow}>
                    <Typography variant="body2">COMBO</Typography>
                    <Typography variant="body2">{formatPrice(comboPrice)} Đ</Typography>
                  </Box>
                )}
                <Box sx={styles.paymentRow}>
                  <Typography variant="body2">VÉ</Typography>
                  <Typography variant="body2">{formatPrice(seatPrice)} Đ</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                {/* --- Tạm tính --- */}
                <Box sx={styles.paymentRow}>
                  <Typography variant="body2" fontWeight={600}>Tạm tính</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatPrice(seatPrice + comboPrice)} Đ
                  </Typography>
                </Box>
                {/*SECTION VOUCHER*/}
                <Box sx={styles.voucherSection}>
                  {/* Header - Toggle mở/đóng */}
                  <Box
                    onClick={() => setVoucherOpen(!voucherOpen)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalOfferIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600}>
                        Bạn có mã giảm giá?
                      </Typography>
                    </Box>
                    {voucherOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                  {/* Form nhập mã voucher */}
                  <Collapse in={voucherOpen}>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          placeholder="Nhập mã giảm giá"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              '&:focus-within': {
                                outline: 'none'
                              },
                              '& fieldset': {
                                borderColor: '#ddd'
                              },
                              '&:hover fieldset': {
                                borderColor: '#aaa'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#F5A623',
                                borderWidth: 1
                              }
                            }
                          }}
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleApplyVoucher}
                          sx={{ bgcolor: '#F5A623', '&:hover': { bgcolor: '#E09612' } }}
                        >
                          Áp dụng
                        </Button>
                      </Box>
                      {/* Link mở dialog chọn voucher */}
                      <Button
                        size="small"
                        onClick={() => setVoucherDialogOpen(true)}
                        sx={{ mt: 1, color: '#F5A623' }}
                      >
                        Hoặc chọn voucher có sẵn →
                      </Button>
                      {/* Thông báo lỗi */}
                      {voucherError && (
                        <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                          {voucherError}
                        </Alert>
                      )}
                    </Box>
                  </Collapse>
                  {/* Hiển thị voucher đã áp dụng */}
                  {appliedVoucher && (
                    <Box sx={styles.voucherApplied}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {appliedVoucher.code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            -{formatPrice(discount)}đ
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={handleRemoveVoucher}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                {/* SECTION CINEMA COIN */}
                <Box sx={styles.coinSection}>
                  {/* Header - Toggle mở/đóng */}
                  <Box
                    onClick={() => setCoinOpen(!coinOpen)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: 18 }}>🪙</Typography>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Cinema Coin
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Bạn có {userPoints.toLocaleString()} điểm
                        </Typography>
                      </Box>
                    </Box>
                    {coinOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                  {/* Form nhập điểm */}
                  <Collapse in={coinOpen}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Tối thiểu 1,000 điểm • 1 điểm = 1 VND
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          placeholder="Nhập số điểm"
                          value={coinInput}
                          onChange={(e) => setCoinInput(e.target.value)}
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#90caf9' },
                              '&:hover fieldset': { borderColor: '#42a5f5' },
                              '&.Mui-focused fieldset': {
                                borderColor: '#1976d2',
                                borderWidth: 1
                              }
                            }
                          }}
                          inputProps={{ min: 1000, step: 1 }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleApplyCoin}
                          disabled={userPoints < 1000}
                          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                        >
                          Áp dụng
                        </Button>
                      </Box>
                      {coinError && (
                        <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                          {coinError}
                        </Alert>
                      )}
                    </Box>
                  </Collapse>
                  {/* Hiển thị coin đã áp dụng */}
                  {coinApplied > 0 && (
                    <Box sx={styles.coinApplied}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {coinApplied.toLocaleString()} điểm
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            -{formatPrice(coinDiscount)}đ
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={handleRemoveCoin}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                {/*Dòng giảm giá (chỉ hiện khi có voucher)*/}
                {appliedVoucher && (
                  <Box sx={{ ...styles.paymentRow, color: '#4caf50', mt: 1 }}>
                    <Typography variant="body2">Giảm giá (voucher)</Typography>
                    <Typography variant="body2">-{formatPrice(discount)} Đ</Typography>
                  </Box>
                )}
                {/*Dòng Cinema Coin (chỉ hiện khi đã áp dụng)*/}
                {coinApplied > 0 && (
                  <Box sx={{ ...styles.paymentRow, color: '#1976d2', mt: 0.5 }}>
                    <Typography variant="body2">Cinema Coin</Typography>
                    <Typography variant="body2">-{formatPrice(coinDiscount)} Đ</Typography>
                  </Box>
                )}
                {/*TỔNG THANH TOÁN*/}
                <Box sx={styles.paymentTotal}>
                  <Typography fontWeight={700}>TỔNG</Typography>
                  <Typography fontWeight={700} sx={{ color: '#DC2626', fontSize: '1.2rem' }}>
                    {formatPrice(grandTotal)} Đ
                  </Typography>
                </Box>
                {/*PHƯƠNG THỨC THANH TOÁN*/}
                <Typography variant="body2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                  Chọn phương thức thanh toán
                </Typography>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="vnpay"
                    control={<Radio size="small" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          component="img"
                          src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
                          sx={{ height: 20 }}
                        />
                        <Typography variant="body2">VNPay</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
                {/*Nút thanh toán - mở modal xác nhận*/}
                <Button
                  variant="contained"
                  sx={styles.payBtn}
                  onClick={handleOpenConfirmModal}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Thanh Toán'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        {/* DIALOG CHỌN VOUCHER */}
        <Dialog
          open={voucherDialogOpen}
          onClose={() => setVoucherDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Chọn Voucher
            <IconButton onClick={() => setVoucherDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <List>
              {availableVouchers.map((voucher) => (
                <ListItem key={voucher._id} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectVoucher(voucher)}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: '#fff8e1' }
                    }}
                  >
                    <LocalOfferIcon sx={{ color: '#f59e0b', mr: 2 }} />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={600}>{voucher.code}</Typography>
                          {voucher.remainingUses !== undefined && (
                            <Chip
                              label={`Còn ${voucher.remainingUses} lượt`}
                              size="small"
                              color={voucher.remainingUses > 1 ? 'success' : 'warning'}
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {voucher.type === 'PERCENT'
                            ? `Giảm ${voucher.value}%${voucher.maxDiscount > 0 ? ` tối đa ${formatPrice(voucher.maxDiscount)}đ` : ''}`
                            : `Giảm ${formatPrice(voucher.value)}đ`
                          }
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>

        {/* MODAL XÁC NHẬN THANH TOÁN */}
        <Dialog
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              overflow: 'hidden', maxWidth: 430
            }
          }}
        >
          {/* Header */}
          <Box sx={{ py: 1.5, px: 2, textAlign: 'center', position: 'relative' }}>
            <Typography variant="h6" fontWeight={600} sx={{ letterSpacing: 1 }}>THÔNG TIN ĐẶT VÉ</Typography>
            <IconButton
              onClick={() => setConfirmModalOpen(false)}
              sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'hsla(0, 5%, 41%, 1.00)' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <DialogContent sx={{ p: 0 }}>
            {/* Thông tin phim */}
            <Box sx={{ display: 'flex', gap: 2, p: 2.5, borderBottom: '1px solid #e0e0e0' }}>
              <Box
                component="img"
                src={showtime?.posterUrl || '/placeholder-movie.jpg'}
                alt={showtime?.movieTitle}
                sx={{ width: 90, height: 130, objectFit: 'cover', borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography fontWeight={700} fontSize="1.1rem" sx={{ mb: 0.5, color: '#1A1A2E' }}>
                  {showtime?.movieTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {showtime?.format || '2D'} - {showtime?.language || 'Tiếng Việt'}
                </Typography>
                {showtime?.ageRating && (
                  <Chip
                    label={showtime.ageRating}
                    size="small"
                    sx={{
                      width: 'fit-content',
                      bgcolor: showtime.ageRating === 'C18' ? '#e53935' : '#ff9800',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Thông tin rạp + suất chiếu */}
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Typography sx={{ width: 90, color: 'text.secondary', fontSize: '0.9rem' }}>Rạp</Typography>
                <Typography sx={{ flex: 1, fontWeight: 600, color: '#1A1A2E', fontSize: '0.9rem' }}>
                  {showtime?.cinemaName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ width: 90, color: 'text.secondary', fontSize: '0.9rem' }}>Suất chiếu</Typography>
                <Typography sx={{ flex: 1, fontWeight: 500, fontSize: '0.9rem' }}>
                  {showtime?.time} - {showtime?.date}
                </Typography>
              </Box>
            </Box>

            {/* Thông tin phòng + ghế + combo */}
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Typography sx={{ width: 90, color: 'text.secondary', fontSize: '0.9rem' }}>Phòng</Typography>
                <Typography sx={{ flex: 1, fontSize: '0.9rem' }}>{showtime?.roomName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Typography sx={{ width: 90, color: 'text.secondary', fontSize: '0.9rem' }}>Ghế</Typography>
                <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                  {selectedSeats.map(s => s.seatCode).join(', ')}
                </Typography>
              </Box>
              {combos.filter(c => c.quantity > 0).length > 0 && (
                <Box sx={{ display: 'flex' }}>
                  <Typography sx={{ width: 90, color: 'text.secondary', fontSize: '0.9rem' }}>Combo</Typography>
                  <Typography sx={{ flex: 1, fontSize: '0.9rem' }}>
                    {combos.filter(c => c.quantity > 0).map(c => `${c.quantity}x ${c.name}`).join(', ')}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Tổng tiền - Style Galaxy Cinema */}
            <Box sx={{ px: 2.5, py: 2, bgcolor: '#fafafa' }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '2px dashed #e0e0e0',
                borderRadius: 1,
                p: 1.5
              }}>
                <Typography fontWeight={600} fontSize="1rem">Tổng</Typography>
                <Typography
                  sx={{
                    bgcolor: '#f5a623',
                    color: '#fff',
                    px: 2.5,
                    py: 0.75,
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}
                >
                  {formatPrice(grandTotal)} VNĐ
                </Typography>
              </Box>
            </Box>

            {/* Checkbox đồng ý điều khoản */}
            <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5, borderTop: '1px solid #e0e0e0' }}>
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                sx={{ p: 0, mt: 0.3, color: '#1a73e8', '&.Mui-checked': { color: '#1a73e8' } }}
              />
              <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.6, color: '#555' }}>
                Tôi xác nhận các thông tin đặt vé đã chính xác.
                Tôi đồng ý với{' '}
                <Typography
                  component="a"
                  href="/dieu-khoan"
                  target="_blank"
                  sx={{ color: '#1a73e8', textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                >
                  Điều khoản dịch vụ
                </Typography>
                {' '}và{' '}
                <Typography
                  component="a"
                  href="/chinh-sach-bao-mat"
                  target="_blank"
                  sx={{ color: '#1a73e8', textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                >
                  Chính sách bảo mật
                </Typography>
                {' '}của NMN Cinema.
              </Typography>
            </Box>
          </DialogContent>

          {/* Footer buttons */}
          <Box sx={{ display: 'flex', gap: 2, px: 2.5, py: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button
              variant="outlined"
              onClick={() => setConfirmModalOpen(false)}
              sx={{
                flex: 1,
                borderColor: '#ccc',
                color: '#666',
                py: 1.2,
                fontWeight: 600,
                '&:hover': { borderColor: '#999', bgcolor: '#f5f5f5' }
              }}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={!termsAccepted || loading}
              sx={{
                flex: 1,
                py: 1.2,
                fontWeight: 600,
                bgcolor: termsAccepted ? '#f5a623' : '#e0e0e0',
                color: termsAccepted ? '#fff' : '#999',
                '&:hover': { bgcolor: termsAccepted ? '#e09612' : '#e0e0e0' },
                '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#999' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Thanh Toán'}
            </Button>
          </Box>
        </Dialog>
      </Container>
    </Box >
  );
}
export default PaymentConfirmPage;
