import { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';
import { getMyOrdersAPI } from '../../../apis/orderApi';

const STATUS_MAP = {
  FAILED: { label: 'Đặt vé không thành công', color: '#d32f2f' },
  CANCELLED: { label: 'Đã hủy', color: '#d32f2f' },
  EXPIRED: { label: 'Đã hủy', color: '#9e9e9e' }
};

const COLUMNS = [
  { key: 'orderNo', label: 'Mã đơn', flex: 1 },
  { key: 'orderDate', label: 'Ngày đặt', flex: 1.2 },
  { key: 'movie', label: 'Phim', flex: 2 },
  { key: 'seats', label: 'Ghế', flex: 0.7 },
  { key: 'showtime', label: 'Suất chiếu', flex: 1.2 },
  { key: 'room', label: 'Phòng', flex: 0.8 },
  { key: 'total', label: 'Tổng tiền', flex: 1 },
  { key: 'status', label: 'Trạng thái', flex: 1.2 }
];

const cellStyle = {
  fontSize: '0.78rem',
  color: 'rgba(0,0,0,0.7)',
  fontFamily: '"Nunito Sans", sans-serif',
  textAlign: 'center'
};

const font = '"Nunito Sans", sans-serif';

export default function CancelHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyOrdersAPI();
        const cancelledOrders = (res.data?.orders || []).filter(
          o => o.status === 'CANCELLED' || o.status === 'FAILED' || o.status === 'EXPIRED'
        );
        setOrders(cancelledOrders);
      } catch (error) {
        console.error('Lỗi lấy lịch sử hủy:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Helper: extract order display data
  const getOrderDisplayData = (order) => {
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

    const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#9e9e9e' };

    return { movieTitle, roomName, seatCodes, startAt, orderDate, statusInfo };
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#fff', p: 3 }}>
        {[1, 2].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 120 : 60} sx={{ mb: 1.5, borderRadius: 1 }} />
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
          fontFamily: font
        }}>
          Không có lịch sử hủy.
        </Typography>
      </Box>
    );
  }

  // ======================== MOBILE CARD LAYOUT ========================
  const renderMobileCards = () => (
    <Box sx={{ bgcolor: '#fff', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {orders.map((order, idx) => {
        const d = getOrderDisplayData(order);
        return (
          <Box
            key={order._id || idx}
            sx={{
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '10px',
              overflow: 'hidden',
              bgcolor: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}
          >
            {/* Card Header - Movie + Status */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2, py: 1.3,
              bgcolor: '#fafafa',
              borderBottom: '1px solid rgba(0,0,0,0.06)'
            }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#1a2332',
                  fontFamily: font,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {d.movieTitle}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.45)', fontFamily: font }}>
                  Mã: {order.orderNo?.replace('ORD-', '').slice(0, 10)}
                </Typography>
              </Box>
              <Typography sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: d.statusInfo.color,
                bgcolor: `${d.statusInfo.color}12`,
                px: 1, py: 0.3,
                borderRadius: '10px',
                whiteSpace: 'nowrap',
                fontFamily: font,
                ml: 1
              }}>
                {d.statusInfo.label}
              </Typography>
            </Box>

            {/* Card Body */}
            <Box sx={{ px: 2, py: 1.5 }}>
              {/* Row 1: Suất chiếu + Phòng */}
              <Box sx={{ display: 'flex', mb: 0.8 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)', fontFamily: font, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Suất chiếu
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.75)', fontFamily: font, fontWeight: 500 }}>
                    {d.startAt}
                  </Typography>
                </Box>
                <Box sx={{ width: 90, textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)', fontFamily: font, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Phòng
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.75)', fontFamily: font, fontWeight: 500 }}>
                    {d.roomName}
                  </Typography>
                </Box>
              </Box>

              {/* Row 2: Ghế + Ngày đặt */}
              <Box sx={{ display: 'flex', mb: 0.8 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)', fontFamily: font, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Ghế
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.75)', fontFamily: font, fontWeight: 600 }}>
                    {d.seatCodes}
                  </Typography>
                </Box>
                <Box sx={{ width: 140, textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)', fontFamily: font, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Ngày đặt
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.6)', fontFamily: font }}>
                    {d.orderDate}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Card Footer - Total */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2, py: 1.2,
              borderTop: '1px solid rgba(0,0,0,0.06)',
              bgcolor: '#fafbfc'
            }}>
              <Box>
                <Typography sx={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)', fontFamily: font, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                  Tổng tiền
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', color: '#ea3b92', fontWeight: 700, fontFamily: font }}>
                  {order.totalAmount?.toLocaleString('vi-VN')} đ
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  // ======================== DESKTOP TABLE LAYOUT ========================
  const renderDesktopTable = () => (
    <Box sx={{ bgcolor: '#fff', overflow: 'auto' }}>
      {/* Table Header */}
      <Box sx={{
        display: 'flex',
        bgcolor: '#f5f5f5',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        px: 2,
        py: 1.2,
        minWidth: 900
      }}>
        {COLUMNS.map((col) => (
          <Typography key={col.key} sx={{
            flex: col.flex,
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'rgba(0,0,0,0.65)',
            fontFamily: font,
            textAlign: 'center'
          }}>
            {col.label}
          </Typography>
        ))}
      </Box>

      {/* Table Rows */}
      {orders.map((order, idx) => {
        const d = getOrderDisplayData(order);

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
              minWidth: 900
            }}
          >
            <Typography sx={{ ...cellStyle, flex: 1, fontWeight: 600 }}>
              {order.orderNo?.replace('ORD-', '').slice(0, 10) || 'N/A'}
            </Typography>

            <Typography sx={{ ...cellStyle, flex: 1.2, fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)' }}>
              {d.orderDate}
            </Typography>

            <Typography sx={{ ...cellStyle, flex: 2, fontWeight: 600, color: 'rgba(0,0,0,0.8)' }}>
              {d.movieTitle}
            </Typography>

            <Typography sx={{ ...cellStyle, flex: 0.7 }}>
              {d.seatCodes}
            </Typography>

            <Typography sx={{ ...cellStyle, flex: 1.2, fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)' }}>
              {d.startAt}
            </Typography>

            <Typography sx={{ ...cellStyle, flex: 0.8 }}>
              {d.roomName}
            </Typography>

            <Typography sx={{
              ...cellStyle,
              flex: 1,
              fontSize: '0.8rem',
              color: '#ea3b92',
              fontWeight: 700
            }}>
              {order.totalAmount?.toLocaleString('vi-VN')} đ
            </Typography>

            <Box sx={{ flex: 1.2, display: 'flex', justifyContent: 'center' }}>
              <Typography sx={{
                fontSize: '0.72rem',
                color: d.statusInfo.color,
                fontFamily: font,
                fontWeight: 700,
                bgcolor: `${d.statusInfo.color}15`,
                px: 1.2,
                py: 0.3,
                borderRadius: '12px',
                whiteSpace: 'nowrap'
              }}>
                {d.statusInfo.label}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  return isMobile ? renderMobileCards() : renderDesktopTable();
}
