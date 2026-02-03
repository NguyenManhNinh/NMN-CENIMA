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
// API - Verify seat hold
import { verifyHoldAPI } from '../../../apis/seatHoldApi';
// API - Order
import { createOrderAPI } from '../../../apis/orderApi';
// Auth Context
import { useAuth } from '../../../contexts/AuthContext';
// STYLES - Responsive theo layout Rio Cinemas
const styles = {
  // Container chính
  wrapper: {
    minHeight: '100vh',
    bgcolor: '#f5f5f5',
    py: { xs: 2, md: 4 },
    fontFamily: '"Nunito Sans", sans-serif'
  },
  // Tiêu đề bước
  stepTitle: {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: { xs: '1.2rem', md: '1.5rem' },
    color: '#1a3a5c',
    mb: 1
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
  }
};
// COMPONENT CHÍNH
function PaymentConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  // LẤY DỮ LIỆU TỪ TRANG TRƯỚC (ComboPage)
  const {
    showtime = {},      // Thông tin suất chiếu
    selectedSeats = [], // Danh sách ghế đã chọn
    seatPrice = 0,      // Tổng tiền vé
    combos = [],        // Danh sách combo đã chọn
    comboPrice = 0,     // Tổng tiền combo
    totalPrice = 0      // Tổng tiền (không dùng, tính lại ở đây)
  } = location.state || {};
  // THÔNG TIN NGƯỜI DÙNG - Từ AuthContext
  const userInfo = {
    name: user?.name || 'Khách',
    email: user?.email || '',
    phone: user?.phone || ''
  };
  // TIMER ĐẾM NGƯỢC GIỮ GHẾ (15 phút)
  const RESERVATION_TIME = 15 * 60; // 15 phút = 900 giây
  /**
   * Lấy thời điểm bắt đầu từ sessionStorage
   * Đảm bảo timer đồng bộ giữa các trang
   */
  const getStartTime = () => {
    const stored = sessionStorage.getItem('reservationStartTime');
    return stored ? parseInt(stored, 10) : Date.now();
  };
  const startTimeRef = useRef(getStartTime());
  const [timeLeft, setTimeLeft] = useState(RESERVATION_TIME);
  // STATE QUẢN LÝ VOUCHER
  const [voucherOpen, setVoucherOpen] = useState(false);        // Mở/đóng section nhập mã
  const [voucherCode, setVoucherCode] = useState('');           // Mã voucher đang nhập
  const [appliedVoucher, setAppliedVoucher] = useState(null);   // Voucher đã áp dụng
  const [voucherError, setVoucherError] = useState('');         // Thông báo lỗi voucher
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false); // Dialog chọn voucher
  const [availableVouchers, setAvailableVouchers] = useState([]); // Danh sách voucher từ API
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  // STATE THANH TOÁN
  const [paymentMethod, setPaymentMethod] = useState('vnpay');  // Phương thức thanh toán
  const [loading, setLoading] = useState(false);                // Đang xử lý thanh toán
  // STATE MODAL XÁC NHẬN THANH TOÁN
  const [confirmModalOpen, setConfirmModalOpen] = useState(false); // Mở/đóng modal xác nhận
  const [termsAccepted, setTermsAccepted] = useState(false);       // Checkbox đồng ý điều khoản
  // EFFECTS
  /**
   * Effect: Timer đếm ngược
   * - Tính thời gian còn lại dựa trên startTime
   * - Cập nhật mỗi giây
   * - Redirect về trang chủ khi hết giờ
   */
  useEffect(() => {
    const startTime = startTimeRef.current;
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = RESERVATION_TIME - elapsed;
      return remaining > 0 ? remaining : 0;
    };
    // Set giá trị ban đầu
    setTimeLeft(calculateTimeLeft());
    // Interval cập nhật mỗi giây
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      // Hết giờ → Alert và redirect
      if (remaining <= 0) {
        clearInterval(timer);
        alert('Hết thời gian giữ ghế! Vui lòng đặt vé lại.');
        sessionStorage.removeItem('reservationStartTime');
        navigate('/');
      }
    }, 1000);
    // Cleanup khi unmount
    return () => clearInterval(timer);
  }, [navigate]);

  /**
   * Effect: Fetch danh sách voucher từ API
   */
  useEffect(() => {
    const fetchVouchers = async () => {
      setLoadingVouchers(true);
      try {
        const response = await getAvailableVouchersAPI();
        setAvailableVouchers(response.data?.vouchers || []);
        console.log('[Voucher] Loaded vouchers:', response.data?.vouchers?.length);
      } catch (error) {
        console.error('[Voucher] Error loading vouchers:', error);
      } finally {
        setLoadingVouchers(false);
      }
    };
    fetchVouchers();
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

  /**
   * Effect: Verify hold với server khi mount (sync timer)
   * - Nếu còn valid → sync timer
   * - Nếu expired → chỉ log warning (backend có thể reuse PENDING order)
   */
  useEffect(() => {
    const verifyHoldWithServer = async () => {
      const showtimeId = showtime?._id;
      if (!showtimeId) return;

      try {
        const response = await verifyHoldAPI(showtimeId);
        const { valid, remainingSeconds } = response.data;

        if (valid && remainingSeconds > 0) {
          // Sync timer với server time
          setTimeLeft(remainingSeconds);
          console.log('[PaymentConfirmPage] Timer synced with server:', remainingSeconds, 'seconds');
        } else {
          // Hold đã hết hạn ở server - KHÔNG redirect
          // Backend có thể có PENDING order và cho phép thanh toán lại
          console.warn('[PaymentConfirmPage] Hold expired on server, but may have PENDING order');
        }
      } catch (error) {
        // Bỏ qua lỗi verify - cho phép tiếp tục
        // Backend sẽ validate và trả về lỗi rõ ràng nếu không hợp lệ
        if (error.response?.status !== 401) {
          console.warn('[PaymentConfirmPage] Verify hold failed, continuing anyway:', error.message);
        }
      }
    };

    verifyHoldWithServer();
  }, [showtime?._id]);
  // HELPER FUNCTIONS
  /**
   * Format thời gian dạng mm:ss
   * @param {number} seconds - Số giây
   * @returns {string} - Chuỗi thời gian "MM:SS"
   */
  const formatTime = (seconds) => {
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
  const grandTotal = (seatPrice + comboPrice) - discount;
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
  const handleRemoveVoucher = () => {
    console.log('[Voucher] Gỡ voucher:', appliedVoucher?.code);
    setAppliedVoucher(null);
    setVoucherError('');
  };
  // PAYMENT HANDLER - Mở modal xác nhận trước khi thanh toán
  // Verify hold trước khi mở modal - chỉ để sync timer, không block
  // Backend sẽ handle trường hợp reuse PENDING order
  const handleOpenConfirmModal = async () => {
    const showtimeId = showtime?._id;
    if (showtimeId) {
      try {
        const response = await verifyHoldAPI(showtimeId);
        const { valid, remainingSeconds } = response.data;

        if (!valid || remainingSeconds <= 0) {
          // Hold hết hạn - nhưng có thể có PENDING order ở backend
          // Cho phép tiếp tục, backend sẽ handle
          console.warn('[Payment] Hold expired, but may have PENDING order');
        } else {
          // Sync timer với server
          setTimeLeft(remainingSeconds);
        }
      } catch (error) {
        // Bỏ qua lỗi verify - cho phép tiếp tục thanh toán
        // Backend sẽ validate và trả về lỗi rõ ràng nếu không hợp lệ
        if (error.response?.status !== 401) {
          console.warn('[Payment] Verify hold failed, continuing anyway:', error.message);
        }
      }
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

  // RENDER
  return (
    <Box sx={styles.wrapper}>
      <Container maxWidth="lg">
        {/* TIÊU ĐỀ */}
        <Typography sx={styles.stepTitle}>
          Bước 3: Hình Thức Thanh Toán
        </Typography>
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
                {/*Dòng giảm giá (chỉ hiện khi có voucher)*/}
                {appliedVoucher && (
                  <Box sx={{ ...styles.paymentRow, color: '#4caf50', mt: 1 }}>
                    <Typography variant="body2">Giảm giá</Typography>
                    <Typography variant="body2">-{formatPrice(discount)} Đ</Typography>
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
