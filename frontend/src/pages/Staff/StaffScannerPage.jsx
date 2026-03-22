import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import ReplayIcon from '@mui/icons-material/Replay';
import { Html5Qrcode } from 'html5-qrcode';
import { scanTicketAPI } from '../../apis/checkinApi';

const SCAN_STATE = {
  IDLE: 'IDLE',
  SCANNING: 'SCANNING',
  SUCCESS: 'SUCCESS',
  USED: 'USED',
  EXPIRED: 'EXPIRED',
  ERROR: 'ERROR'
};

function StaffScannerPage() {
  const [scanState, setScanState] = useState(SCAN_STATE.IDLE);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(() => {});
      html5QrCodeRef.current.clear().catch(() => {});
      html5QrCodeRef.current = null;
    }
  };

  const startScanner = async () => {
    setScanState(SCAN_STATE.SCANNING);
    setResult(null);
    setErrorMsg('');

    try {
      const html5QrCode = new Html5Qrcode('staff-qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1
        },
        async (decodedText) => {
          // QR decoded — stop camera and process
          await html5QrCode.stop().catch(() => {});
          html5QrCodeRef.current = null;
          handleQrResult(decodedText);
        },
        () => {
          // scan error (no QR found yet) — ignore
        }
      );
    } catch (err) {
      console.error('Camera error:', err);
      setScanState(SCAN_STATE.ERROR);
      setErrorMsg('Không thể mở camera. Vui lòng cấp quyền truy cập camera.');
    }
  };

  const handleQrResult = async (qrData) => {
    setLoading(true);
    try {
      // QR có thể là JSON hoặc string ticketCode
      let payload = {};
      try {
        const parsed = JSON.parse(qrData);
        if (parsed.qrChecksum) payload.qrChecksum = parsed.qrChecksum;
        else if (parsed.ticketCode) payload.ticketCode = parsed.ticketCode;
        else payload.ticketCode = qrData;
      } catch {
        payload.ticketCode = qrData;
      }

      const response = await scanTicketAPI(payload);

      if (response.status === 'success') {
        setScanState(SCAN_STATE.SUCCESS);
        setResult(response.data);
      } else if (response.status === 'fail') {
        // Vé đã sử dụng
        setScanState(SCAN_STATE.USED);
        setResult(response.data);
        setErrorMsg(response.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi không xác định';
      if (msg.includes('hết hiệu lực') || msg.includes('hết hạn') || msg.includes('quá thời gian') || msg.includes('bị hủy')) {
        setScanState(SCAN_STATE.EXPIRED);
      } else {
        setScanState(SCAN_STATE.ERROR);
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    stopScanner();
    setScanState(SCAN_STATE.IDLE);
    setResult(null);
    setErrorMsg('');
  };

  // Result card colors
  const getResultStyle = () => {
    switch (scanState) {
      case SCAN_STATE.SUCCESS:
        return { bg: '#e8f5e9', border: '#4caf50', icon: <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50' }} />, title: 'Check-in thành công!' };
      case SCAN_STATE.USED:
        return { bg: '#ffebee', border: '#f44336', icon: <CancelIcon sx={{ fontSize: 48, color: '#f44336' }} />, title: 'Vé đã được sử dụng!' };
      case SCAN_STATE.EXPIRED:
        return { bg: '#fff3e0', border: '#ff9800', icon: <WarningIcon sx={{ fontSize: 48, color: '#ff9800' }} />, title: 'Vé hết hiệu lực!' };
      case SCAN_STATE.ERROR:
        return { bg: '#ffebee', border: '#f44336', icon: <CancelIcon sx={{ fontSize: 48, color: '#f44336' }} />, title: 'Lỗi!' };
      default:
        return { bg: '#fff', border: '#ddd', icon: null, title: '' };
    }
  };

  const style = getResultStyle();

  return (
    <Box sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
      {/* Header */}
      <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#1a1a2e', textAlign: 'center', mb: 2 }}>
        Quét mã QR vé
      </Typography>

      {/* IDLE — Show button to start scanning */}
      {scanState === SCAN_STATE.IDLE && (
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: '100%',
              aspectRatio: '1',
              maxWidth: 300,
              mx: 'auto',
              border: '2px dashed #ccc',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
              bgcolor: '#f9f9f9',
              mb: 2
            }}
          >
            <QrCodeScannerIcon sx={{ fontSize: 80, color: '#aaa' }} />
            <Typography sx={{ color: '#888', fontSize: '0.9rem' }}>
              Nhấn nút bên dưới để quét
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<QrCodeScannerIcon />}
            onClick={startScanner}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: '#1B4F93',
              '&:hover': { bgcolor: '#163f78' }
            }}
          >
            Quét mã QR
          </Button>
        </Box>
      )}

      {/* SCANNING — Camera feed */}
      {scanState === SCAN_STATE.SCANNING && (
        <Box sx={{ textAlign: 'center' }}>
          <Box
            id="staff-qr-reader"
            ref={scannerRef}
            sx={{
              width: '100%',
              maxWidth: 350,
              mx: 'auto',
              mb: 2,
              borderRadius: '4px',
              overflow: 'hidden',
              '& video': { borderRadius: '4px' }
            }}
          />
          <Typography sx={{ color: '#555', fontSize: '0.85rem', mb: 2 }}>
            Đưa mã QR vào khung hình...
          </Typography>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{
              borderRadius: '4px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#999',
              color: '#555'
            }}
          >
            Hủy
          </Button>
        </Box>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2, color: '#555' }}>Đang kiểm tra vé...</Typography>
        </Box>
      )}

      {/* RESULT */}
      {!loading && [SCAN_STATE.SUCCESS, SCAN_STATE.USED, SCAN_STATE.EXPIRED, SCAN_STATE.ERROR].includes(scanState) && (
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              border: `2px solid ${style.border}`,
              borderRadius: '4px',
              bgcolor: style.bg,
              p: 3,
              mb: 2
            }}
          >
            {style.icon}
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: style.border, mt: 1, mb: 1 }}>
              {style.title}
            </Typography>

            {errorMsg && scanState !== SCAN_STATE.SUCCESS && (
              <Typography sx={{ fontSize: '0.85rem', color: '#555', mb: 2 }}>
                {errorMsg}
              </Typography>
            )}

            {/* Ticket info */}
            {result && (
              <Box sx={{ textAlign: 'left', mt: 2, bgcolor: '#fff', borderRadius: '4px', p: 2, border: '1px solid #eee' }}>
                {result.movie && (
                  <Box sx={{ display: 'flex', gap: 2, mb: 1.5, alignItems: 'center' }}>
                    {result.poster && (
                      <Box
                        component="img"
                        src={result.poster}
                        alt={result.movie}
                        sx={{ width: 50, height: 70, objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                      />
                    )}
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>
                      {result.movie}
                    </Typography>
                  </Box>
                )}
                <InfoRow label="Mã vé" value={result.ticketCode} />
                <InfoRow label="Ghế" value={result.seatCode} />
                <InfoRow label="Phòng" value={result.room} />
                <InfoRow label="Khách hàng" value={result.customer} />
                {result.showtime && (
                  <InfoRow
                    label="Suất chiếu"
                    value={new Date(result.showtime).toLocaleString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  />
                )}
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            startIcon={<ReplayIcon />}
            onClick={handleReset}
            sx={{
              py: 1.2,
              px: 4,
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: '#1B4F93',
              '&:hover': { bgcolor: '#163f78' }
            }}
          >
            Quét tiếp
          </Button>
        </Box>
      )}
    </Box>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
      <Typography sx={{ fontSize: '0.82rem', color: '#888' }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#333' }}>{value}</Typography>
    </Box>
  );
}

export default StaffScannerPage;
