import { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, Dialog, DialogContent, IconButton } from '@mui/material';
import {
  ErrorOutline as ErrorOutlineIcon,
  CheckCircleOutline as CheckIcon,
  HourglassEmpty as PendingIcon,
  Cancel as CancelIcon,
  QrCode2 as QrCodeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import QRCode from 'qrcode';
import { getMyOrdersAPI } from '../../../apis/orderApi';
import { getMyTicketsAPI } from '../../../apis/ticketApi';

const STATUS_MAP = {
  PAID: { label: 'Đã thanh toán', color: '#2e7d32' },
  PENDING: { label: 'Chờ thanh toán', color: '#ed6c02' },
  PROCESSING: { label: 'Đang xử lý', color: '#0288d1' },
  FAILED: { label: 'Thất bại', color: '#d32f2f' },
  CANCELLED: { label: 'Đã hủy', color: '#d32f2f' },
  EXPIRED: { label: 'Hết hạn', color: '#9e9e9e' }
};

const TICKET_STATUS = {
  VALID: { label: 'Còn hiệu lực', color: '#2e7d32' },
  USED: { label: 'Đã sử dụng', color: '#9e9e9e' },
  VOID: { label: 'Đã hủy', color: '#d32f2f' },
  EXPIRED: { label: 'Hết hiệu lực', color: '#ed6c02' }
};

const COLUMNS = [
  { key: 'orderNo', label: 'Mã đơn', flex: 1 },
  { key: 'orderDate', label: 'Ngày đặt', flex: 1 },
  { key: 'movie', label: 'Phim', flex: 1.8 },
  { key: 'seats', label: 'Ghế', flex: 0.6 },
  { key: 'showtime', label: 'Suất chiếu', flex: 1 },
  { key: 'room', label: 'Phòng', flex: 0.7 },
  { key: 'combo', label: 'Combo', flex: 1.2 },
  { key: 'voucher', label: 'Giảm giá', flex: 0.8 },
  { key: 'total', label: 'Tổng tiền', flex: 0.9 },
  { key: 'status', label: 'Trạng thái', flex: 0.8 },
  { key: 'action', label: 'Xem vé', flex: 0.6 }
];

const cellStyle = {
  fontSize: '0.78rem',
  color: 'rgba(0,0,0,0.7)',
  fontFamily: '"Nunito Sans", sans-serif',
  textAlign: 'center'
};

export default function TicketHistory() {
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, ticketRes] = await Promise.all([
          getMyOrdersAPI(),
          getMyTicketsAPI()
        ]);
        const paidOrders = (orderRes.data?.orders || []).filter(o => o.status === 'PAID');
        setOrders(paidOrders);
        setTickets(ticketRes.data?.tickets || []);
      } catch (error) {
        console.error('Lỗi lấy lịch sử mua vé:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Tìm tickets thuộc 1 order
  const getTicketsForOrder = (orderId) => {
    return tickets.filter(t => t.orderId === orderId || t.orderId?._id === orderId);
  };

  // Mở modal QR
  const handleShowQR = async (order) => {
    const orderTickets = getTicketsForOrder(order._id);
    const showtime = order.showtimeId;
    const movieTitle = showtime?.movieId?.title || 'Phim';
    const roomName = showtime?.roomId?.name || 'Phòng';

    const showtimeStr = showtime?.startAt
      ? new Date(showtime.startAt).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
      : 'Chưa xác định';

    // Build QR data giống backend
    const qrPayload = orderTickets.length > 0
      ? {
        ticketCode: orderTickets[0].ticketCode,
        seatCode: orderTickets.map(t => t.seatCode).join(', '),
        orderId: order._id,
        showtimeId: order.showtimeId?._id || order.showtimeId,
        movie: movieTitle,
        showtime: showtimeStr,
        cinema: `${roomName}`,
        checksum: orderTickets[0].qrChecksum?.substring(0, 16) || ''
      }
      : {
        orderNo: order.orderNo,
        movie: movieTitle,
        seats: order.seats?.map(s => s.seatCode).join(', '),
        showtime: showtimeStr
      };

    // Tính trạng thái thực tế dựa trên thời gian suất chiếu
    let realTicketStatus = orderTickets.length > 0 ? orderTickets[0].status : null;
    if (realTicketStatus === 'VALID' && showtime?.startAt) {
      const now = new Date();
      const startAt = new Date(showtime.startAt);
      const thirtyMinutesAfter = new Date(startAt.getTime() + 30 * 60 * 1000);
      if (now > thirtyMinutesAfter) {
        realTicketStatus = 'EXPIRED';
      }
    }

    setQrData({
      movieTitle,
      seats: order.seats?.map(s => s.seatCode).join(', ') || '',
      showtime: showtimeStr,
      room: roomName,
      orderNo: order.orderNo,
      ticketStatus: realTicketStatus,
      ticketCode: orderTickets.length > 0 ? orderTickets[0].ticketCode : null
    });

    // Generate QR image
    try {
      const url = await QRCode.toDataURL(JSON.stringify(qrPayload), {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 250
      });
      setQrImageUrl(url);
    } catch (err) {
      console.error('Lỗi tạo QR:', err);
    }

    setQrOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#fff', p: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        py: 6,
        bgcolor: '#fff',
        mt: 0
      }}>
        <ErrorOutlineIcon sx={{ fontSize: 20, color: 'rgba(0,0,0,0.35)' }} />
        <Typography sx={{
          fontSize: '1.2rem',
          color: 'rgba(0,0,0,0.45)',
          fontFamily: '"Nunito Sans", sans-serif'
        }}>
          Không có lịch sử đặt mua / mua.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ bgcolor: '#fff', overflow: 'auto' }}>
        {/* Table Header */}
        <Box sx={{
          display: 'flex',
          bgcolor: '#f5f5f5',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          px: 2,
          py: 1.2,
          minWidth: 1100
        }}>
          {COLUMNS.map((col) => (
            <Typography key={col.key} sx={{
              flex: col.flex,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'rgba(0,0,0,0.65)',
              fontFamily: '"Nunito Sans", sans-serif',
              textAlign: 'center'
            }}>
              {col.label}
            </Typography>
          ))}
        </Box>

        {/* Table Rows */}
        {orders.map((order, idx) => {
          const showtime = order.showtimeId;
          const movieTitle = showtime?.movieId?.title || 'N/A';
          const roomName = showtime?.roomId?.name || 'N/A';
          const seatCodes = order.seats?.map(s => s.seatCode).join(', ') || 'N/A';

          const startAt = showtime?.startAt
            ? new Date(showtime.startAt).toLocaleString('vi-VN', {
              hour: '2-digit', minute: '2-digit',
              day: '2-digit', month: '2-digit', year: 'numeric'
            })
            : 'N/A';

          const orderDate = order.createdAt
            ? new Date(order.createdAt).toLocaleString('vi-VN', {
              hour: '2-digit', minute: '2-digit',
              day: '2-digit', month: '2-digit', year: 'numeric'
            })
            : 'N/A';

          const comboText = order.combos && order.combos.length > 0
            ? order.combos.map(c => `${c.name} x${c.quantity}`).join(', ')
            : '—';

          const discountParts = [];
          if (order.voucherCode) discountParts.push(order.voucherCode);
          if (order.discount > 0) discountParts.push(`-${order.discount.toLocaleString('vi-VN')}đ`);
          if (order.pointDiscount > 0) discountParts.push(`Điểm: -${order.pointDiscount.toLocaleString('vi-VN')}đ`);
          const discountText = discountParts.length > 0 ? discountParts.join(' | ') : '—';

          const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#9e9e9e' };

          return (
            <Box
              key={order._id || idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1.5,
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                transition: 'background 0.15s',
                minWidth: 1100
              }}
            >
              <Typography sx={{ ...cellStyle, flex: 1, fontWeight: 600 }}>
                {order.orderNo?.replace('ORD-', '').slice(0, 10) || 'N/A'}
              </Typography>

              <Typography sx={{ ...cellStyle, flex: 1, fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)' }}>
                {orderDate}
              </Typography>

              <Typography sx={{ ...cellStyle, flex: 1.8, fontWeight: 600, color: 'rgba(0,0,0,0.8)' }}>
                {movieTitle}
              </Typography>

              <Typography sx={{ ...cellStyle, flex: 0.6 }}>
                {seatCodes}
              </Typography>

              <Typography sx={{ ...cellStyle, flex: 1, fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)' }}>
                {startAt}
              </Typography>

              <Typography sx={{ ...cellStyle, flex: 0.7 }}>
                {roomName}
              </Typography>

              <Typography sx={{ ...cellStyle, flex: 1.2, fontSize: '0.73rem', color: 'rgba(0,0,0,0.55)' }}>
                {comboText}
              </Typography>

              <Typography sx={{
                ...cellStyle,
                flex: 0.8,
                fontSize: '0.73rem',
                color: order.discount > 0 || order.pointDiscount > 0 ? '#2e7d32' : 'rgba(0,0,0,0.35)'
              }}>
                {discountText}
              </Typography>

              <Typography sx={{
                ...cellStyle,
                flex: 0.9,
                fontSize: '0.8rem',
                color: '#ea3b92',
                fontWeight: 700
              }}>
                {order.totalAmount?.toLocaleString('vi-VN')} đ
              </Typography>

              <Box sx={{ flex: 0.8, display: 'flex', justifyContent: 'center' }}>
                <Typography sx={{
                  fontSize: '0.72rem',
                  color: statusInfo.color,
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontWeight: 700,
                  bgcolor: `${statusInfo.color}15`,
                  px: 1.2,
                  py: 0.3,
                  borderRadius: '12px',
                  whiteSpace: 'nowrap'
                }}>
                  {statusInfo.label}
                </Typography>
              </Box>

              {/* Action - QR Button */}
              <Box sx={{ flex: 0.6, display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  onClick={() => handleShowQR(order)}
                  size="small"
                  sx={{
                    color: '#ea3b92',
                    '&:hover': { bgcolor: 'rgba(234,59,146,0.08)' }
                  }}
                  title="Xem mã QR"
                >
                  <QrCodeIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* QR Code Modal */}
      <Dialog
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 0, overflow: 'hidden' }
        }}
      >
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          bgcolor: '#1a2332',
          color: '#fff'
        }}>
          <Typography sx={{
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: '"Nunito Sans", sans-serif'
          }}>
            Mã QR Check-in
          </Typography>
          <IconButton onClick={() => setQrOpen(false)} size="small" sx={{ color: '#fff' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          {qrData && (
            <>
              {/* Movie Title */}
              <Typography sx={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#1a2332',
                fontFamily: '"Nunito Sans", sans-serif',
                mb: 0.5
              }}>
                {qrData.movieTitle}
              </Typography>

              {/* Info */}
              <Typography sx={{
                fontSize: '0.82rem',
                color: 'rgba(0,0,0,0.55)',
                fontFamily: '"Nunito Sans", sans-serif',
                mb: 2
              }}>
                Ghế: {qrData.seats} • {qrData.room}
              </Typography>

              {/* QR Image */}
              {qrImageUrl && (
                <Box sx={{ my: 2 }}>
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    style={{ width: 220, height: 220 }}
                  />
                </Box>
              )}

              {/* Ticket Status */}
              {qrData.ticketStatus && (
                <Typography sx={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: TICKET_STATUS[qrData.ticketStatus]?.color || '#9e9e9e',
                  fontFamily: '"Nunito Sans", sans-serif',
                  mb: 1
                }}>
                  {TICKET_STATUS[qrData.ticketStatus]?.label || qrData.ticketStatus}
                </Typography>
              )}

              {/* Ticket Code */}
              {qrData.ticketCode && (
                <Typography sx={{
                  fontSize: '0.72rem',
                  color: 'rgba(0,0,0,0.4)',
                  fontFamily: 'monospace',
                  mb: 1.5
                }}>
                  {qrData.ticketCode}
                </Typography>
              )}

              {/* Footer note */}
              <Typography sx={{
                fontSize: '0.8rem',
                color: 'rgba(0,0,0,0.45)',
                fontFamily: '"Nunito Sans", sans-serif',
                fontStyle: 'italic'
              }}>
                Vui lòng xuất trình mã QR này tại quầy để nhận vé.
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
