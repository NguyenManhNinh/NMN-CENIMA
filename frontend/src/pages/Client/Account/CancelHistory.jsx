import { useState, useEffect } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
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

export default function CancelHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#fff', p: 3 }}>
        {[1, 2].map((i) => (
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
          Không có lịch sử hủy.
        </Typography>
      </Box>
    );
  }

  return (
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
              minWidth: 900
            }}
          >
            <Typography sx={{ ...cellStyle, flex: 1, fontWeight: 600 }}>
              {order.orderNo?.replace('ORD-', '').slice(0, 10) || 'N/A'}
            </Typography>

            <Typography sx={{ ...cellStyle, flex: 1.2, fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)' }}>
              {orderDate}
            </Typography>

            <Typography sx={{ ...cellStyle, flex: 2, fontWeight: 600, color: 'rgba(0,0,0,0.8)' }}>
              {movieTitle}
            </Typography>

            <Typography sx={{ ...cellStyle, flex: 0.7 }}>
              {seatCodes}
            </Typography>

            <Typography sx={{ ...cellStyle, flex: 1.2, fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)' }}>
              {startAt}
            </Typography>

            <Typography sx={{ ...cellStyle, flex: 0.8 }}>
              {roomName}
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
          </Box>
        );
      })}
    </Box>
  );
}
