import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress,
  TextField, MenuItem, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, InputAdornment
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import InboxIcon from '@mui/icons-material/Inbox';
import CloseIcon from '@mui/icons-material/Close';
import { QRCodeSVG } from 'qrcode.react';
import { getAllOrdersAPI } from '../../../apis/orderApi';

// Status map
const STATUS_MAP = {
  PAID: { label: 'Đã thanh toán', color: '#4caf50', bg: '#e8f5e9' },
  PENDING: { label: 'Chờ thanh toán', color: '#ff9800', bg: '#fff3e0' },
  PROCESSING: { label: 'Đang xử lý', color: '#2196f3', bg: '#e3f2fd' },
  FAILED: { label: 'Thất bại', color: '#f44336', bg: '#ffebee' },
  CANCELLED: { label: 'Đã huỷ', color: '#f44336', bg: '#ffebee' },
  EXPIRED: { label: 'Hết hạn', color: '#795548', bg: '#efebe9' }
};

// Format helpers
const fmtPrice = (p) => {
  if (!p && p !== 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(p) + ' đ';
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fmtTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Card style
const getCardSx = (colors, darkMode) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

const AdminInvoicePage = () => {
  const { darkMode, colors } = useAdminTheme();
  const cardSx = getCardSx(colors, darkMode);

  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailDialog, setDetailDialog] = useState({ open: false, order: null });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrdersAPI();
      setOrders(res.data?.orders || []);
    } catch (err) {
      console.error('Lỗi tải hóa đơn:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(o =>
        o.orderNo?.toLowerCase().includes(q) ||
        o.userId?.name?.toLowerCase().includes(q) ||
        o.userId?.email?.toLowerCase().includes(q) ||
        o.showtimeId?.movieId?.title?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, statusFilter, searchQuery]);

  // Print invoice
  const handlePrint = (order) => {
    const movieTitle = order.showtimeId?.movieId?.title || '—';
    const cinemaName = order.showtimeId?.cinemaId?.name || '—';
    const roomName = order.showtimeId?.roomId?.name || '—';
    const showDate = fmtDate(order.showtimeId?.startAt);
    const showTime = fmtTime(order.showtimeId?.startAt);
    const seatCodes = order.seats?.map(s => s.seatCode).join(', ') || '—';
    const customerName = order.userId?.name || '—';
    const st = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
    const gateway = order.paymentInfo?.gateway || 'VNPay';
    const bankCode = order.paymentInfo?.bankCode || '';
    const totalDiscount = (order.discount || 0) + (order.pointDiscount || 0);

    const printContent = `
      <html>
      <head>
        <title>Vé - ${order.orderNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; max-width: 420px; margin: 0 auto; color: #000; }
          .header { text-align: center; padding-bottom: 12px; border-bottom: 2px dashed #000; }
          .logo { font-size: 20px; font-weight: 700; letter-spacing: 2px; }
          .subtitle { font-size: 10px; margin-top: 2px; }
          .movie { font-size: 16px; font-weight: 700; text-align: center; margin: 14px 0 10px; text-transform: uppercase; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
          .info-label { font-weight: 400; }
          .info-value { font-weight: 600; text-align: right; max-width: 55%; }
          .section-title { font-size: 12px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
          .seats { font-size: 18px; font-weight: 700; text-align: center; margin: 10px 0; letter-spacing: 3px; }
          .combo-item { font-size: 11px; padding: 2px 0; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0 4px; font-size: 16px; font-weight: 700; }
          .status-row { text-align: center; font-size: 12px; font-weight: 600; border: 1px solid #000; padding: 3px 14px; }
          .footer { text-align: center; font-size: 10px; margin-top: 14px; padding-top: 10px; border-top: 1px dashed #000; }
          .footer p { margin: 2px 0; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">NMN CINEMA</div>
          <div class="subtitle">Hệ thống rạp chiếu phim</div>
        </div>

        <div class="movie">${movieTitle}</div>
        <div class="divider"></div>

        <div class="section-title">Thông tin đơn hàng</div>
        <div class="info-row"><span class="info-label">Mã hóa đơn:</span><span class="info-value">${order.orderNo}</span></div>
        <div class="info-row"><span class="info-label">Khách hàng:</span><span class="info-value">${customerName}</span></div>
        <div class="info-row"><span class="info-label">Rạp:</span><span class="info-value">${cinemaName}</span></div>
        <div class="info-row"><span class="info-label">Phòng:</span><span class="info-value">${roomName}</span></div>
        <div class="info-row"><span class="info-label">Ngày chiếu:</span><span class="info-value">${showDate}</span></div>
        <div class="info-row"><span class="info-label">Giờ bắt đầu:</span><span class="info-value">${showTime}</span></div>

        <div class="divider"></div>
        <div class="section-title">Ghế</div>
        <div class="seats">${seatCodes}</div>

        ${order.combos?.length > 0 ? `
          <div class="divider"></div>
          <div class="section-title">Combo</div>
          ${order.combos.map(c => `<div class="combo-item">• ${c.name} x${c.quantity} — ${fmtPrice(c.totalPrice)}</div>`).join('')}
        ` : ''}

        <div class="divider"></div>
        <div class="section-title">Thanh toán</div>
        <div class="info-row"><span class="info-label">Phương thức:</span><span class="info-value">${gateway}</span></div>
        ${bankCode ? `<div class="info-row"><span class="info-label">Ngân hàng:</span><span class="info-value">${bankCode}</span></div>` : ''}
        <div class="info-row"><span class="info-label">Tạm tính:</span><span class="info-value">${fmtPrice(order.subTotal)}</span></div>
        ${totalDiscount > 0 ? `<div class="info-row"><span class="info-label">Giảm giá:</span><span class="info-value">-${fmtPrice(totalDiscount)}</span></div>` : ''}
        ${order.voucherCode ? `<div class="info-row"><span class="info-label">Voucher:</span><span class="info-value">${order.voucherCode}</span></div>` : ''}
        ${order.usedPoints > 0 ? `<div class="info-row"><span class="info-label">Điểm sử dụng:</span><span class="info-value">${order.usedPoints.toLocaleString()} điểm</span></div>` : ''}

        <div class="divider"></div>
        <div class="total-row"><span>Tổng cộng</span><span>${fmtPrice(order.totalAmount)}</span></div>

        <div style="text-align:center;margin-top:8px;">
          <span class="status-row">${st.label}</span>
        </div>

        <div class="footer">
          <p>Ngày in: ${new Date().toLocaleString('vi-VN')}</p>
          <p style="margin-top:4px;">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=450,height=700');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* === HEADER === */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản lý Hóa đơn
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Danh sách tất cả hóa đơn — {filteredOrders.length} hóa đơn
          </Typography>
        </Box>
        <Tooltip title="Làm mới">
          <IconButton onClick={fetchOrders} sx={{ color: colors.textMuted }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* === SEARCH + FILTER === */}
      <Card sx={{ ...cardSx, mb: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Tìm theo mã hóa đơn, tên khách hàng, phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: colors.textMuted }} /></InputAdornment>
              }}
              sx={{
                flex: 1, minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, bgcolor: colors.bgSubtle,
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' },
                  fontSize: '0.85rem'
                }
              }}
            />
            <TextField
              select size="small" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                minWidth: 170,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, fontSize: '0.85rem',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' }
                }
              }}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="PAID">Đã thanh toán</MenuItem>
              <MenuItem value="PENDING">Chờ thanh toán</MenuItem>
              <MenuItem value="CANCELLED">Đã huỷ</MenuItem>
              <MenuItem value="FAILED">Thất bại</MenuItem>
              <MenuItem value="EXPIRED">Hết hạn</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* === TABLE === */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1000, '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1.2, verticalAlign: 'middle', whiteSpace: 'nowrap' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.bgTableHead, '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', minWidth: 130 }}>Mã hóa đơn</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', minWidth: 130 }}>Tên khách hàng</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', minWidth: 100 }}>Tên nhân viên</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', minWidth: 150 }}>Phim</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Ngày chiếu</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 90 }}>Giờ bắt đầu</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Tổng tiền</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 120 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length > 0 ? filteredOrders.map((order, idx) => {
                    const st = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
                    return (
                      <TableRow key={order._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                        <TableCell sx={{ fontSize: '0.8rem', fontWeight: 500, color: colors.textMuted }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1B4F93', whiteSpace: 'nowrap' }}>
                            {order.orderNo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {order.userId?.name || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: colors.textMuted, whiteSpace: 'nowrap' }}>
                            Không có
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {order.showtimeId?.movieId?.title || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {fmtDate(order.showtimeId?.startAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {fmtTime(order.showtimeId?.startAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#d32f2f', whiteSpace: 'nowrap' }}>
                            {fmtPrice(order.totalAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={st.label}
                            size="small"
                            sx={{
                              height: 24, fontSize: '0.72rem', fontWeight: 600,
                              bgcolor: darkMode ? 'transparent' : st.bg, color: st.color,
                              border: darkMode ? `1px solid ${st.color}` : 'none',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Chi tiết">
                              <IconButton size="small" sx={{ color: '#1B4F93' }}
                                onClick={() => setDetailDialog({ open: true, order })}
                              >
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="In vé">
                              <IconButton size="small" sx={{ color: '#4caf50' }}
                                onClick={() => handlePrint(order)}
                              >
                                <PrintIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                        <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ color: colors.textMuted }}>
                          Không có hóa đơn nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* === DETAIL DIALOG === */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, order: null })}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        {detailDialog.order && (() => {
          const order = detailDialog.order;
          const st = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
          const totalDiscount = (order.discount || 0) + (order.pointDiscount || 0);
          return (
            <>
              <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                Chi tiết hóa đơn
                <IconButton size="small" onClick={() => setDetailDialog({ open: false, order: null })}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ px: 3, py: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mt: 1 }}>

                  {/* Mã + Trạng thái */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: colors.textPrimary }}>{order.orderNo}</Typography>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: st.color }}>{st.label}</Typography>
                  </Box>

                  {/* Thông tin khách */}
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: colors.textPrimary, mb: 0.5 }}>Thông tin khách hàng</Typography>
                  <SimpleRow label="Tên" value={order.userId?.name} colors={colors} />
                  <SimpleRow label="Email" value={order.userId?.email} colors={colors} />

                  <Box sx={{ borderTop: `1px solid ${colors.borderSubtle}`, my: 1.5 }} />

                  {/* Thông tin phim */}
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: colors.textPrimary, mb: 0.5 }}>Thông tin suất chiếu</Typography>
                  <SimpleRow label="Phim" value={order.showtimeId?.movieId?.title} colors={colors} />
                  <SimpleRow label="Rạp" value={order.showtimeId?.cinemaId?.name} colors={colors} />
                  <SimpleRow label="Phòng" value={order.showtimeId?.roomId?.name} colors={colors} />
                  <SimpleRow label="Ngày chiếu" value={fmtDate(order.showtimeId?.startAt)} colors={colors} />
                  <SimpleRow label="Giờ bắt đầu" value={fmtTime(order.showtimeId?.startAt)} colors={colors} />

                  <Box sx={{ borderTop: `1px solid ${colors.borderSubtle}`, my: 1.5 }} />

                  {/* Ghế */}
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: colors.textPrimary, mb: 0.5 }}>
                    Ghế ({order.seats?.length || 0})
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: colors.textSecondary }}>
                    {order.seats?.map(s => s.seatCode).join(', ') || '—'}
                  </Typography>

                  {/* Combo */}
                  {order.combos?.length > 0 && (
                    <>
                      <Box sx={{ borderTop: `1px solid ${colors.borderSubtle}`, my: 1.5 }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: colors.textPrimary, mb: 0.5 }}>Combo</Typography>
                      {order.combos.map((c, i) => (
                        <SimpleRow key={i} label={`${c.name} x${c.quantity}`} value={fmtPrice(c.totalPrice)} colors={colors} />
                      ))}
                    </>
                  )}

                  <Box sx={{ borderTop: `1px solid ${colors.borderSubtle}`, my: 1.5 }} />

                  {/* Thanh toán */}
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: colors.textPrimary, mb: 0.5 }}>Thanh toán</Typography>
                  <SimpleRow label="Phương thức" value={order.paymentInfo?.gateway || 'VNPay'} colors={colors} />
                  {order.paymentInfo?.bankCode && <SimpleRow label="Ngân hàng" value={order.paymentInfo.bankCode} colors={colors} />}
                  <SimpleRow label="Tạm tính" value={fmtPrice(order.subTotal)} colors={colors} />
                  {totalDiscount > 0 && <SimpleRow label="Giảm giá" value={`-${fmtPrice(totalDiscount)}`} colors={colors} />}
                  {order.voucherCode && <SimpleRow label="Voucher" value={order.voucherCode} colors={colors} />}
                  {order.usedPoints > 0 && <SimpleRow label="Điểm sử dụng" value={`${order.usedPoints.toLocaleString()} điểm`} colors={colors} />}
                  <Box sx={{ borderTop: `1px solid ${colors.borderSubtle}`, mt: 1, pt: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: colors.textPrimary }}>Tổng cộng</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: colors.textPrimary }}>{fmtPrice(order.totalAmount)}</Typography>
                  </Box>

                  {/* QR Code */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                    <QRCodeSVG value={order.orderNo} size={100} level="H" />
                    <Typography variant="caption" sx={{ color: colors.textMuted, mt: 0.5, fontSize: '0.7rem' }}>
                      Quét mã QR để xác nhận vé
                    </Typography>
                  </Box>

                  {/* Thời gian */}
                  <Typography variant="caption" sx={{ color: colors.textMuted, textAlign: 'center', mt: 1 }}>
                    Đặt lúc: {fmtDateTime(order.createdAt)}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${colors.borderSubtle}` }}>
                <Button
                  variant="outlined" size="small"
                  onClick={() => setDetailDialog({ open: false, order: null })}
                  sx={{ textTransform: 'none', borderRadius: 1.5, color: colors.textSecondary, borderColor: colors.borderSubtle }}
                >
                  Đóng
                </Button>
                <Button
                  variant="outlined" size="small"
                  startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
                  onClick={() => handlePrint(order)}
                  sx={{ textTransform: 'none', borderRadius: 1.5, color: colors.textPrimary, borderColor: colors.borderSubtle }}
                >
                  In vé
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
};

// Helper component for detail dialog info rows
const InfoRow = ({ label, value, colors, valueColor }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.2 }}>
    <Typography sx={{ fontSize: '0.82rem', color: colors.textMuted }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: valueColor || colors.textPrimary }}>{value || '—'}</Typography>
  </Box>
);

const SimpleRow = ({ label, value, colors }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.2 }}>
    <Typography sx={{ fontSize: '0.82rem', color: colors.textMuted }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: colors.textPrimary }}>{value || '—'}</Typography>
  </Box>
);

export default AdminInvoicePage;
