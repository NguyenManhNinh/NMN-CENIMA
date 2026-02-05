import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyHoldAPI } from '../apis/seatHoldApi';

const RESERVATION_TIME = 900; // 15 minutes in seconds
const POLL_INTERVAL = 30000; // Poll server every 30 seconds

/**
 * Hook quản lý timer đồng bộ với server
 * @param {string} showtimeId - ID của suất chiếu
 * @param {object} options - Các tùy chọn
 * @param {boolean} options.enabled - Bật/tắt timer (default: true)
 * @param {boolean} options.shouldVerifyOnMount - Verify với server khi mount
 * @param {boolean} options.forceSync - Bắt buộc sync với server (bỏ qua sessionStorage)
 * @param {function} options.onExpire - Callback khi hết giờ
 * @param {string} options.redirectPath - Đường dẫn redirect khi hết giờ
 * @param {boolean} options.enablePolling - Bật polling định kỳ (default: false)
 */
const useSeatTimer = (showtimeId, options = {}) => {
  const {
    enabled = true,
    shouldVerifyOnMount = false,
    forceSync = false,
    onExpire = null,
    redirectPath = '/',
    enablePolling = false
  } = options;

  const [timeLeft, setTimeLeft] = useState(null); // null = chưa init
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(shouldVerifyOnMount);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const startTimeRef = useRef(null);

  // Lấy startTime từ sessionStorage hoặc tính từ remainingSeconds
  const getStoredStartTime = useCallback(() => {
    const stored = sessionStorage.getItem('reservationStartTime');
    if (stored) {
      return parseInt(stored, 10);
    }
    return null;
  }, []);

  // Lưu startTime vào sessionStorage
  const saveStartTime = useCallback((startTime) => {
    startTimeRef.current = startTime;
    sessionStorage.setItem('reservationStartTime', startTime.toString());
  }, []);

  // Tính remainingSeconds từ startTime
  const calculateRemainingFromStartTime = useCallback((startTime) => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, RESERVATION_TIME - elapsed);
  }, []);

  // Xử lý khi hết giờ
  const handleExpire = useCallback(() => {
    setIsExpired(true);
    setTimeLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);

    if (onExpire && typeof onExpire === 'function') {
      onExpire();
    } else {
      alert('Hết thời gian giữ ghế! Vui lòng chọn lại.');
      sessionStorage.removeItem('reservationStartTime');
      navigate(redirectPath);
    }
  }, [onExpire, navigate, redirectPath]);

  // Sync timer với server
  const syncWithServer = useCallback(async (force = false) => {
    if (!showtimeId || !enabled) return null;

    try {
      const response = await verifyHoldAPI(showtimeId);
      const { valid, remainingSeconds } = response.data;

      if (valid && remainingSeconds > 0) {
        // Tính startTime từ server's remainingSeconds
        const serverStartTime = Date.now() - ((RESERVATION_TIME - remainingSeconds) * 1000);
        const storedStartTime = getStoredStartTime();

        // Quyết định có sync hay không
        const shouldSync = force || forceSync || !storedStartTime;

        if (shouldSync) {
          console.log('[useSeatTimer] Synced with server:', remainingSeconds, 's');
          saveStartTime(serverStartTime);
          setTimeLeft(remainingSeconds);
          setLastSyncTime(Date.now());
          return remainingSeconds;
        } else {
          // Dùng local startTime
          const localRemaining = calculateRemainingFromStartTime(storedStartTime);
          console.log('[useSeatTimer] Using local timer:', localRemaining, 's (server:', remainingSeconds, 's)');

          // Chỉ sync nếu chênh lệch > 30 giây
          if (Math.abs(localRemaining - remainingSeconds) > 30) {
            console.log('[useSeatTimer] Drift detected, syncing...');
            saveStartTime(serverStartTime);
            setTimeLeft(remainingSeconds);
            setLastSyncTime(Date.now());
            return remainingSeconds;
          }

          return localRemaining;
        }
      } else {
        // Hold expired
        console.warn('[useSeatTimer] Hold expired on server');
        return 0;
      }
    } catch (error) {
      console.error('[useSeatTimer] Sync failed:', error.message);
      // Fallback to local timer on error
      const storedStartTime = getStoredStartTime();
      if (storedStartTime) {
        return calculateRemainingFromStartTime(storedStartTime);
      }
      return null;
    }
  }, [showtimeId, enabled, forceSync, getStoredStartTime, saveStartTime, calculateRemainingFromStartTime]);

  // Verify hold với server (full verify including expiration)
  const verifyHold = useCallback(async () => {
    if (!showtimeId || !enabled) return;

    setIsLoading(true);
    try {
      const remaining = await syncWithServer(true);

      if (remaining !== null && remaining > 0) {
        setTimeLeft(remaining);
        setIsExpired(false);
      } else if (remaining === 0) {
        handleExpire();
      }
    } catch (error) {
      console.error('[useSeatTimer] Verify hold failed:', error);
      if (error.response?.status !== 401) {
        handleExpire();
      }
    } finally {
      setIsLoading(false);
    }
  }, [showtimeId, enabled, syncWithServer, handleExpire]);

  // Initialize timer từ sessionStorage hoặc server
  useEffect(() => {
    if (!enabled || !showtimeId) return;

    const initializeTimer = async () => {
      setIsLoading(true);

      // Thử lấy từ sessionStorage trước
      const storedStartTime = getStoredStartTime();

      if (storedStartTime && !forceSync) {
        const remaining = calculateRemainingFromStartTime(storedStartTime);
        if (remaining > 0) {
          console.log('[useSeatTimer] Initialized from sessionStorage:', remaining, 's');
          startTimeRef.current = storedStartTime;
          setTimeLeft(remaining);
          setIsLoading(false);

          // Background sync với server (không block UI)
          if (shouldVerifyOnMount) {
            syncWithServer(false);
          }
          return;
        }
      }

      // Nếu không có hoặc forceSync → sync với server
      if (shouldVerifyOnMount || forceSync) {
        await verifyHold();
      }

      setIsLoading(false);
    };

    initializeTimer();
  }, [enabled, showtimeId, forceSync, shouldVerifyOnMount]);

  // Periodic polling (if enabled)
  useEffect(() => {
    if (!enabled || !enablePolling || !showtimeId) return;

    pollRef.current = setInterval(() => {
      syncWithServer(false);
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [enabled, enablePolling, showtimeId, syncWithServer]);

  // Countdown logic
  useEffect(() => {
    if (!enabled || timeLeft === null || timeLeft <= 0) return;

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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, timeLeft > 0, handleExpire]);

  // Format time mm:ss
  const formatTime = useCallback(() => {
    if (timeLeft === null) return '--:--';
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Set time từ bên ngoài (khi tạo hold mới)
  const initTimer = useCallback((seconds) => {
    const startTime = Date.now();
    saveStartTime(startTime);
    setTimeLeft(seconds);
    setIsExpired(false);
    setIsLoading(false);
  }, [saveStartTime]);

  return {
    timeLeft,
    formattedTime: formatTime(),
    formatTime, // Legacy support
    isExpired,
    isLoading,
    lastSyncTime,
    initTimer,
    verifyHold,
    syncWithServer: () => syncWithServer(true) // Force sync
  };
};

export default useSeatTimer;
