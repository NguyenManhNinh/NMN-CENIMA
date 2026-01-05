import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyHoldAPI } from '../apis/seatHoldApi';

const useSeatTimer = (showtimeId, options = {}) => {
  const {
    shouldVerifyOnMount = false,
    onExpire = null, // Callback khi hết giờ
    redirectPath = '/' // Đường dẫn redirect khi hết giờ
  } = options;

  const [timeLeft, setTimeLeft] = useState(null); // null = chưa init
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(shouldVerifyOnMount);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Xử lý khi hết giờ
  const handleExpire = useCallback(() => {
    setIsExpired(true);
    setTimeLeft(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Callback custom nếu có
    if (onExpire && typeof onExpire === 'function') {
      onExpire();
    } else {
      // Mặc định: alert và redirect
      alert('Hết thời gian giữ ghế! Vui lòng chọn lại.');
      sessionStorage.removeItem('reservationStartTime');
      navigate(redirectPath);
    }
  }, [onExpire, navigate, redirectPath]);

  // Verify hold với server
  const verifyHold = useCallback(async () => {
    if (!showtimeId) return;

    setIsLoading(true);
    try {
      const response = await verifyHoldAPI(showtimeId);
      const { valid, remainingSeconds } = response.data;

      if (valid && remainingSeconds > 0) {
        setTimeLeft(remainingSeconds);
        setIsExpired(false);
      } else {
        handleExpire();
      }
    } catch (error) {
      console.error('[useSeatTimer] Verify hold failed:', error);
      // Nếu lỗi 401 (chưa đăng nhập) -> không xử lý expire
      if (error.response?.status !== 401) {
        handleExpire();
      }
    } finally {
      setIsLoading(false);
    }
  }, [showtimeId, handleExpire]);

  // Verify on mount (dùng cho Combo/Payment page)
  useEffect(() => {
    if (shouldVerifyOnMount && showtimeId) {
      verifyHold();
    }
  }, [shouldVerifyOnMount, showtimeId, verifyHold]);

  // Countdown logic
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, handleExpire]);

  // Format time mm:ss
  const formatTime = useCallback(() => {
    if (timeLeft === null) return '--:--';
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Set time từ bên ngoài (khi tạo hold mới)
  const initTimer = useCallback((seconds) => {
    setTimeLeft(seconds);
    setIsExpired(false);
    setIsLoading(false);
  }, []);

  return {
    timeLeft,
    formatTime,
    isExpired,
    isLoading,
    initTimer,      // Dùng khi createHold xong
    verifyHold      // Dùng khi cần verify thủ công
  };
};

export default useSeatTimer;
