import { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress, Chip,
  CircularProgress, TextField, MenuItem, Avatar, Button
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InboxIcon from '@mui/icons-material/Inbox';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import {
  getRevenueTrendAPI, getPaymentMethodsAPI, getTopMoviesStatsAPI,
  getOrdersTableAPI, getPeakHoursAPI, getVoucherStatsAPI, getTopCombosStatsAPI
} from '../../../apis/statisticsApi';

/* ───── helpers ───── */
const fmtVND = (v) => {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)} tỷ`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)} tr`;
  if (v >= 1e3) return `${Math.round(v / 1e3)}K`;
  return `${v}`;
};
const fmtFull = (v) => v?.toLocaleString('vi-VN') || '0';

const getCardSx = (colors, darkMode) => ({
  borderRadius: { xs: 1.5, sm: 2 },
  boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard, height: '100%', transition: 'all 0.3s ease'
});

const EmptyPlaceholder = ({ message = 'Chưa có dữ liệu', height = 200, colors }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height, gap: 1 }}>
    <InboxIcon sx={{ fontSize: 40, color: colors?.textMuted || 'rgba(0,0,0,0.2)' }} />
    <Typography variant="body2" sx={{ color: colors?.textMuted, fontSize: '0.85rem' }}>{message}</Typography>
  </Box>
);

const STATUS_PROPS = {
  PAID: { label: 'Thành công', color: '#4caf50', bg: '#e8f5e9' },
  PENDING: { label: 'Chờ xử lý', color: '#ff9800', bg: '#fff3e0' },
  PROCESSING: { label: 'Đang xử lý', color: '#2196f3', bg: '#e3f2fd' },
  FAILED: { label: 'Thất bại', color: '#f44336', bg: '#ffebee' },
  CANCELLED: { label: 'Đã hủy', color: '#9e9e9e', bg: '#fafafa' },
  EXPIRED: { label: 'Hết hạn', color: '#795548', bg: '#efebe9' }
};

const getRange = (key) => {
  const now = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const from = new Date(now);
  switch (key) {
    case '7d': from.setDate(from.getDate() - 7); break;
    case '30d': from.setDate(from.getDate() - 30); break;
    case 'month': from.setDate(1); break;
    case 'lastMonth': {
      const m = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: fmt(m), to: fmt(e) };
    }
    case '90d': from.setDate(from.getDate() - 90); break;
    default: from.setDate(from.getDate() - 30);
  }
  return { from: fmt(from), to: fmt(now) };
};

/* ────── Change Badge ────── */
const ChangeBadge = ({ value }) => {
  if (value == null || value === 0) return null;
  const positive = value >= 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.5 }}>
      {positive ? <TrendingUpIcon sx={{ fontSize: 14, color: '#4caf50' }} /> : <TrendingDownIcon sx={{ fontSize: 14, color: '#f44336' }} />}
      <Typography variant="caption" sx={{ color: positive ? '#4caf50' : '#f44336', fontWeight: 600, fontSize: '0.7rem' }}>
        {positive ? '+' : ''}{value}% so với kỳ trước
      </Typography>
    </Box>
  );
};

/* ────── Export Excel helper (HTML table → .xls) ────── */
const exportToExcel = (ordersData, timeRange) => {
  if (!ordersData?.orders?.length) return;
  const rangeLabels = { '7d': '7 ngày gần đây', '30d': '30 ngày gần đây', 'month': 'Tháng này', 'lastMonth': 'Tháng trước', '90d': '90 ngày' };
  const fmtMoney = (v) => v ? v.toLocaleString('vi-VN') : '0';
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const headers = ['STT', 'Mã đơn', 'Khách hàng', 'Email', 'Phim', 'Phòng', 'Suất chiếu', 'Ghế', 'Mã ghế', 'Combo', 'Tạm tính', 'Giảm giá', 'Voucher', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày'];
  const thStyle = 'style="background:#1B4F93;color:#fff;font-weight:bold;padding:8px 12px;border:1px solid #ccc;text-align:center;font-size:13px;white-space:nowrap"';
  const tdStyle = 'style="padding:6px 10px;border:1px solid #ddd;font-size:12px;white-space:nowrap"';
  const tdRight = 'style="padding:6px 10px;border:1px solid #ddd;font-size:12px;text-align:right;white-space:nowrap"';
  const tdCenter = 'style="padding:6px 10px;border:1px solid #ddd;font-size:12px;text-align:center;white-space:nowrap"';

  let totalRevenue = 0, totalDiscount = 0;
  const rows = ordersData.orders.map((o, i) => {
    const sp = STATUS_PROPS[o.status] || STATUS_PROPS.PENDING;
    const discount = (o.discount || 0) + (o.pointDiscount || 0);
    totalRevenue += o.totalAmount || 0;
    totalDiscount += discount;
    const bgColor = i % 2 === 0 ? '#fff' : '#f8f9fa';
    return `<tr style="background:${bgColor}">
      <td ${tdCenter}>${i + 1}</td>
      <td ${tdStyle}>${o.orderNo}</td>
      <td ${tdStyle}>${o.customer}</td>
      <td ${tdStyle}>${o.email || ''}</td>
      <td ${tdStyle}>${o.movie}</td>
      <td ${tdCenter}>${o.room || '—'}</td>
      <td ${tdCenter}>${o.showtime || '—'}</td>
      <td ${tdCenter}>${o.seats}</td>
      <td ${tdStyle}>${o.seatCodes || ''}</td>
      <td ${tdStyle}>${o.comboNames || '—'}</td>
      <td ${tdRight}>${fmtMoney(o.subTotal)}</td>
      <td ${tdRight}>${discount > 0 ? '-' + fmtMoney(discount) : '0'}</td>
      <td ${tdCenter}>${o.voucherCode || '—'}</td>
      <td ${tdRight}><b>${fmtMoney(o.totalAmount)}</b></td>
      <td ${tdCenter}>${o.bankCode || 'VNPay'}</td>
      <td ${tdCenter}><span style="color:${sp.color};font-weight:600">${sp.label}</span></td>
      <td ${tdCenter}>${o.createdAt}</td>
    </tr>`;
  }).join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="UTF-8">
    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
    <x:Name>Báo cáo</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
    </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    </head><body>
    <table style="border-collapse:collapse;font-family:Arial,sans-serif">
      <tr><td colspan="${headers.length}" style="font-size:18px;font-weight:bold;padding:12px 0;color:#1B4F93;text-align:center">BÁO CÁO DOANH THU - ĐƠN HÀNG</td></tr>
      <tr><td colspan="${headers.length}" style="font-size:12px;padding:4px 0;text-align:center;color:#666">Hệ thống NMN Cinema — ${rangeLabels[timeRange] || timeRange} — Xuất lúc: ${dateStr}</td></tr>
      <tr><td colspan="${headers.length}" style="padding:8px 0"></td></tr>
      <tr>${headers.map(h => `<th ${thStyle}>${h}</th>`).join('')}</tr>
      ${rows}
      <tr style="background:#e8eaf6;font-weight:bold">
        <td colspan="10" style="padding:8px 12px;border:1px solid #ccc;font-size:13px;text-align:right">TỔNG CỘNG (${ordersData.orders.length} đơn)</td>
        <td ${tdRight}></td>
        <td ${tdRight} style="color:#e91e63;font-weight:bold;padding:8px 10px;border:1px solid #ccc;font-size:13px;text-align:right;white-space:nowrap">${totalDiscount > 0 ? '-' + fmtMoney(totalDiscount) : '0'}</td>
        <td ${tdCenter}></td>
        <td style="padding:8px 10px;border:1px solid #ccc;font-size:14px;text-align:right;font-weight:bold;color:#d32f2f;white-space:nowrap">${fmtMoney(totalRevenue)} VNĐ</td>
        <td colspan="3" ${tdStyle}></td>
      </tr>
    </table>
    </body></html>`;

  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `bao-cao-doanh-thu-${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
};

/* ═══════════════════════════════════════ */
const AdminStatisticsPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const cardSx = getCardSx(colors, darkMode);
  const chartTextSx = {
    '& text': { fill: `${darkMode ? '#fff' : '#555'} !important` },
    '& tspan': { fill: `${darkMode ? '#fff' : '#555'} !important` },
    '& span': { color: `${darkMode ? '#fff' : '#555'} !important` },
    '& p': { color: `${darkMode ? '#fff' : '#555'} !important` }
  };

  /* ── state ── */
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [revenueTrend, setRevenueTrend] = useState({ daily: [], summary: {}, statusBreakdown: [] });
  const [paymentMethods, setPaymentMethods] = useState({ pieData: [], barData: [] });
  const [topMovies, setTopMovies] = useState([]);
  const [ordersData, setOrdersData] = useState({ orders: [], pagination: {} });
  const [orderPage, setOrderPage] = useState(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [peakHours, setPeakHours] = useState({ hourly: [], peakHour: '', peakOrders: 0 });
  const [voucherStats, setVoucherStats] = useState({ summary: {}, topVouchers: [] });
  const [topCombos, setTopCombos] = useState([]);

  /* ── fetch ── */
  const fetchAll = useCallback(async (range) => {
    setLoading(true);
    try {
      const [trendRes, payRes, movRes, peakRes, voucherRes, comboRes] = await Promise.allSettled([
        getRevenueTrendAPI(range),
        getPaymentMethodsAPI(range),
        getTopMoviesStatsAPI({ ...range, limit: 10 }),
        getPeakHoursAPI(range),
        getVoucherStatsAPI(range),
        getTopCombosStatsAPI(range)
      ]);
      if (trendRes.status === 'fulfilled') setRevenueTrend(trendRes.value.data);
      if (payRes.status === 'fulfilled') setPaymentMethods(payRes.value.data);
      if (movRes.status === 'fulfilled') setTopMovies(movRes.value.data.movies);
      if (peakRes.status === 'fulfilled') setPeakHours(peakRes.value.data);
      if (voucherRes.status === 'fulfilled') setVoucherStats(voucherRes.value.data);
      if (comboRes.status === 'fulfilled') setTopCombos(comboRes.value.data.combos);
    } catch (e) { console.error('Statistics fetch error:', e); }
    finally { setLoading(false); }
  }, []);

  const fetchOrders = useCallback(async (range, page, status) => {
    try {
      const res = await getOrdersTableAPI({ ...range, page, limit: 20, status });
      setOrdersData(res.data);
    } catch (e) { console.error('Orders fetch error:', e); }
  }, []);

  useEffect(() => {
    const range = getRange(timeRange);
    fetchAll(range);
    setOrderPage(1);
    fetchOrders(range, 1, orderStatusFilter);
  }, [timeRange, fetchAll, fetchOrders, orderStatusFilter]);

  useEffect(() => {
    const range = getRange(timeRange);
    fetchOrders(range, orderPage, orderStatusFilter);
  }, [orderPage, timeRange, fetchOrders, orderStatusFilter]);

  const { summary, daily, statusBreakdown } = revenueTrend;

  /* ═══ RENDER ═══ */
  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* ═══ HEADER + TIME FILTER ═══ */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
              Thống kê
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
              Báo cáo doanh thu, đơn hàng và hiệu suất
            </Typography>
          </Box>
        </Box>
        <TextField select size="small" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
          sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }}>
          <MenuItem value="7d">7 ngày gần đây</MenuItem>
          <MenuItem value="30d">30 ngày gần đây</MenuItem>
          <MenuItem value="month">Tháng này</MenuItem>
          <MenuItem value="lastMonth">Tháng trước</MenuItem>
          <MenuItem value="90d">90 ngày</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={48} sx={{ color: colors.textPrimary }} />
        </Box>
      ) : (<>

        {/* ═══ 4 SUMMARY CARDS (with % change) ═══ */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
          {[
            { label: 'Tổng doanh thu', value: fmtVND(summary.totalRevenue || 0), icon: <AttachMoneyIcon />, color: '#4caf50', sub: `${fmtFull(summary.totalRevenue)} VNĐ`, change: summary.revenueChange },
            { label: 'Tổng đơn hàng', value: fmtFull(summary.totalOrders || 0), icon: <ShoppingCartIcon />, color: '#1B4F93', sub: 'đơn thành công', change: summary.ordersChange },
            { label: 'Vé đã bán', value: fmtFull(summary.totalTickets || 0), icon: <ConfirmationNumberIcon />, color: '#ff9800', sub: 'vé', change: summary.ticketsChange },
            { label: 'Giá trị đơn TB', value: fmtVND(summary.avgOrderValue || 0), icon: <TrendingUpIcon />, color: '#9c27b0', sub: `${fmtFull(summary.avgOrderValue)} VNĐ/đơn`, change: summary.avgChange }
          ].map((card, i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: `${card.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ color: card.color, '& .MuiSvgIcon-root': { fontSize: 22 } }}>{card.icon}</Box>
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' }, mb: 0.3 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.78rem' }}>{card.label}</Typography>
                  <ChangeBadge value={card.change} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ═══ REVENUE LINE CHART ═══ */}
        <Card sx={{ ...cardSx, mb: 3 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
              Doanh thu theo thời gian
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1 }}>Đơn vị: VNĐ</Typography>
            <Box sx={{ ...chartTextSx, width: '100%', overflowX: 'auto' }}>
              {daily.length > 0 ? (
                <LineChart
                  xAxis={[{ scaleType: 'band', data: daily.map(d => d.day), tickLabelStyle: { fontSize: 10, fill: colors.textSecondary } }]}
                  yAxis={[{ valueFormatter: (v) => fmtVND(v), tickLabelStyle: { fill: colors.textSecondary } }]}
                  series={[{ data: daily.map(d => d.revenue), label: 'Doanh thu', color: '#1B4F93', area: true, valueFormatter: (v) => v != null ? `${fmtFull(v)} VNĐ` : '' }]}
                  height={280} margin={{ top: 20, right: 20, bottom: 30, left: 55 }}
                  slotProps={{ legend: { hidden: true } }}
                  sx={{ '& .MuiChartsAxis-line': { stroke: colors.borderSubtle }, '& .MuiChartsAxis-tick': { stroke: colors.borderSubtle }, minWidth: 400 }}
                />
              ) : <EmptyPlaceholder message="Chưa có dữ liệu doanh thu" height={280} colors={colors} />}
            </Box>
          </CardContent>
        </Card>

        {/* ═══ PEAK HOURS (BarChart) ═══ */}
        <Card sx={{ ...cardSx, mb: 3 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  Giờ cao điểm
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted }}>Phân bổ đơn hàng theo giờ trong ngày</Typography>
              </Box>
              {peakHours.peakHour && (
                <Chip label={`Cao điểm: ${peakHours.peakHour} (${peakHours.peakOrders} đơn)`} size="small"
                  sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, fontSize: '0.72rem' }} />
              )}
            </Box>
            <Box sx={{ ...chartTextSx, width: '100%', overflowX: 'auto' }}>
              {peakHours.hourly.some(h => h.orders > 0) ? (
                <BarChart
                  xAxis={[{ scaleType: 'band', data: peakHours.hourly.map(h => h.hour), tickLabelStyle: { fontSize: 9, fill: colors.textSecondary } }]}
                  yAxis={[{ tickLabelStyle: { fill: colors.textSecondary } }]}
                  series={[{ data: peakHours.hourly.map(h => h.orders), label: 'Đơn hàng', color: '#ff9800', valueFormatter: (v) => `${v} đơn` }]}
                  height={220} margin={{ top: 15, right: 10, bottom: 30, left: 35 }}
                  slotProps={{ legend: { hidden: true } }}
                  sx={{ '& .MuiChartsAxis-line': { stroke: colors.borderSubtle }, minWidth: 600 }}
                />
              ) : <EmptyPlaceholder message="Chưa có dữ liệu giờ cao điểm" height={220} colors={colors} />}
            </Box>
          </CardContent>
        </Card>

        {/* ═══ PAYMENT METHODS (PIE + BAR) ═══ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={5}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
                  Phân bổ đơn hàng theo ngân hàng
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1 }}>Số lượng đơn theo phương thức thanh toán</Typography>
                {paymentMethods.pieData.length > 0 ? (
                  <>
                    <Box sx={chartTextSx}>
                      <PieChart
                        series={[{ data: paymentMethods.pieData, innerRadius: 40, outerRadius: 80, paddingAngle: 2, cornerRadius: 4, valueFormatter: (item) => `${item.value} đơn` }]}
                        height={200} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                        slotProps={{ legend: { hidden: true } }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                      {paymentMethods.pieData.map(d => (
                        <Box key={d.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color }} />
                          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.72rem' }}>{d.label} ({d.value})</Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                ) : <EmptyPlaceholder message="Chưa có dữ liệu thanh toán" height={200} colors={colors} />}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
                  Doanh thu theo ngân hàng
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1 }}>So sánh doanh thu mỗi phương thức</Typography>
                {paymentMethods.barData.length > 0 ? (
                  <Box sx={chartTextSx}>
                    <BarChart layout="horizontal"
                      yAxis={[{ scaleType: 'band', data: paymentMethods.barData.map(d => d.bank), tickLabelStyle: { fill: colors.textSecondary } }]}
                      xAxis={[{ valueFormatter: (v) => fmtVND(v), tickLabelStyle: { fill: colors.textSecondary } }]}
                      series={[{ data: paymentMethods.barData.map(d => d.amount), label: 'Doanh thu', color: '#1B4F93', valueFormatter: (v) => v != null ? `${fmtFull(v)} VNĐ` : '' }]}
                      height={250} margin={{ top: 10, right: 20, bottom: 30, left: 80 }}
                      slotProps={{ legend: { hidden: true } }}
                      sx={{ '& .MuiChartsAxis-line': { stroke: colors.borderSubtle }, minWidth: 300 }}
                    />
                  </Box>
                ) : <EmptyPlaceholder message="Chưa có dữ liệu doanh thu" height={250} colors={colors} />}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ═══ TOP MOVIES + STATUS BREAKDOWN ═══ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 2 }}>
                  Top 10 phim doanh thu cao nhất
                </Typography>
                {topMovies.length > 0 ? (
                  <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                    <Table size="small" sx={{ '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1 } }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 35 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Phim</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', width: 80 }}>Vé bán</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', width: 100 }}>Đơn hàng</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', width: 120 }}>Doanh thu</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 150 }}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topMovies.map((m) => (
                          <TableRow key={m.rank} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                            <TableCell>
                              <Chip label={m.rank} size="small" sx={{
                                height: 22, width: 22, fontSize: '0.7rem', fontWeight: 700,
                                bgcolor: m.rank <= 3 ? '#1B4F93' : colors.bgSubtle, color: m.rank <= 3 ? '#fff' : colors.textSecondary, '& .MuiChip-label': { px: 0 }
                              }} />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar src={m.posterUrl} variant="rounded" sx={{ width: 32, height: 44, bgcolor: 'transparent' }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: colors.textPrimary }}>{m.title}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#ff9800', fontSize: '0.82rem' }}>{m.ticketsSold}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.82rem' }}>{m.orders}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#d32f2f', fontSize: '0.82rem' }}>{fmtVND(m.revenue)}</TableCell>
                            <TableCell>
                              <LinearProgress variant="determinate" value={m.percent}
                                sx={{ height: 6, borderRadius: 3, bgcolor: colors.bgProgressTrack, '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: m.rank <= 3 ? '#1B4F93' : '#90caf9' } }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : <EmptyPlaceholder message="Chưa có dữ liệu phim" height={200} colors={colors} />}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
                  Trạng thái đơn hàng
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1 }}>Phân bổ theo trạng thái thanh toán</Typography>
                {statusBreakdown.length > 0 ? (
                  <>
                    <Box sx={chartTextSx}>
                      <PieChart
                        series={[{
                          data: statusBreakdown, innerRadius: 45, outerRadius: 75, paddingAngle: 3, cornerRadius: 4,
                          valueFormatter: (item) => { const total = statusBreakdown.reduce((s, d) => s + d.value, 0); return `${item.value} đơn (${Math.round((item.value / total) * 100)}%)`; }
                        }]}
                        height={180} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                        slotProps={{ legend: { hidden: true } }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mt: 1.5 }}>
                      {statusBreakdown.map(s => {
                        const total = statusBreakdown.reduce((sum, d) => sum + d.value, 0);
                        const pct = Math.round((s.value / total) * 100);
                        return (
                          <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ flex: 1, fontSize: '0.78rem', color: colors.textPrimary }}>{s.label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', color: colors.textPrimary }}>{s.value}</Typography>
                            <Typography variant="caption" sx={{ color: colors.textMuted, width: 35, textAlign: 'right' }}>{pct}%</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </>
                ) : <EmptyPlaceholder message="Chưa có dữ liệu" height={200} colors={colors} />}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ═══ TOP COMBOS + VOUCHER STATS ═══ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Top Combos */}
          <Grid item xs={12} md={7}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  Combo bán chạy
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 2 }}>Thống kê F&B trong khoảng thời gian</Typography>
                {topCombos.length > 0 ? (() => {
                  const maxSold = Math.max(...topCombos.map(c => c.sold));
                  const totalRevenue = topCombos.reduce((s, c) => s + c.revenue, 0);
                  return (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', px: 1, mb: 1 }}>
                        <Typography variant="caption" sx={{ flex: 2, fontWeight: 700, color: colors.textMuted, fontSize: '0.7rem' }}>TÊN COMBO</Typography>
                        <Typography variant="caption" sx={{ width: 70, fontWeight: 700, color: colors.textMuted, fontSize: '0.7rem', textAlign: 'right' }}>GIÁ</Typography>
                        <Typography variant="caption" sx={{ width: 60, fontWeight: 700, color: colors.textMuted, fontSize: '0.7rem', textAlign: 'right' }}>ĐÃ BÁN</Typography>
                        <Typography variant="caption" sx={{ width: 90, fontWeight: 700, color: colors.textMuted, fontSize: '0.7rem', textAlign: 'right' }}>DOANH THU</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {topCombos.map((combo, idx) => (
                          <Box key={idx} sx={{ p: 1, borderRadius: 1.5, bgcolor: colors.bgSubtle, '&:hover': { bgcolor: colors.bgSubtleHover } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: combo.color, flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary, fontSize: '0.82rem' }}>{combo.name}</Typography>
                              </Box>
                              <Typography variant="body2" sx={{ width: 70, textAlign: 'right', color: colors.textSecondary, fontSize: '0.78rem' }}>{Math.round(combo.price / 1000)}K</Typography>
                              <Typography variant="body2" sx={{ width: 60, textAlign: 'right', fontWeight: 600, color: '#1B4F93', fontSize: '0.82rem' }}>{combo.sold}</Typography>
                              <Typography variant="body2" sx={{ width: 90, textAlign: 'right', fontWeight: 600, color: colors.textPrimary, fontSize: '0.78rem' }}>{fmtVND(combo.revenue)}</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={Math.round((combo.sold / maxSold) * 100)}
                              sx={{ height: 4, borderRadius: 2, bgcolor: colors.bgProgressTrack, '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: combo.color } }} />
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 1.5, borderTop: `1px solid ${colors.borderSubtle}` }}>
                        <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 500 }}>
                          Tổng: {topCombos.reduce((s, c) => s + c.sold, 0)} combo đã bán
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1B4F93' }}>
                          {fmtVND(totalRevenue)} VNĐ
                        </Typography>
                      </Box>
                    </>
                  );
                })() : <EmptyPlaceholder message="Chưa có dữ liệu combo" height={200} colors={colors} />}
              </CardContent>
            </Card>
          </Grid>

          {/* Voucher Stats */}
          <Grid item xs={12} md={5}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <LocalOfferIcon sx={{ fontSize: 20 }} /> Voucher & Khuyến mãi
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 2 }}>Thống kê sử dụng mã giảm giá</Typography>

                {/* Summary cards */}
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {[
                    { label: 'Đơn dùng voucher', value: voucherStats.summary?.ordersWithVoucher || 0, color: '#e91e63' },
                    { label: 'Tỷ lệ sử dụng', value: `${voucherStats.summary?.voucherRate || 0}%`, color: '#9c27b0' },
                    { label: 'Tổng giảm giá', value: fmtVND(voucherStats.summary?.totalDiscount || 0), color: '#f44336' },
                    { label: 'Voucher đang hoạt động', value: voucherStats.summary?.activeVouchers || 0, color: '#4caf50' }
                  ].map((item, i) => (
                    <Grid item xs={6} key={i}>
                      <Box sx={{ p: 1.2, bgcolor: colors.bgSubtle, borderRadius: 1.5, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: item.color, fontSize: '1rem' }}>{item.value}</Typography>
                        <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.68rem' }}>{item.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Đơn dùng điểm */}
                {(voucherStats.summary?.ordersWithPoints > 0) && (
                  <Box sx={{ p: 1.2, bgcolor: colors.bgSubtle, borderRadius: 1.5, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.78rem', color: colors.textPrimary }}>Đơn dùng điểm thưởng</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#ff9800', fontSize: '0.82rem' }}>{voucherStats.summary.ordersWithPoints} đơn</Typography>
                      <Typography variant="caption" sx={{ color: colors.textMuted }}>{fmtVND(voucherStats.summary.totalPointDiscount)} giảm</Typography>
                    </Box>
                  </Box>
                )}

                {/* Top vouchers */}
                {voucherStats.topVouchers?.length > 0 && (
                  <>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: colors.textMuted, mb: 1, display: 'block', fontSize: '0.7rem' }}>TOP VOUCHER SỬ DỤNG</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      {voucherStats.topVouchers.map(v => (
                        <Box key={v.rank} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.8, bgcolor: colors.bgSubtle, borderRadius: 1 }}>
                          <Chip label={v.rank} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: v.rank <= 3 ? '#e91e63' : colors.bgSubtle, color: v.rank <= 3 ? '#fff' : colors.textSecondary, '& .MuiChip-label': { px: 0.5 } }} />
                          <Typography variant="body2" sx={{ flex: 1, fontWeight: 600, fontSize: '0.78rem', color: colors.textPrimary }}>{v.code}</Typography>
                          <Typography variant="caption" sx={{ color: '#e91e63', fontWeight: 600 }}>{v.used}x</Typography>
                          <Typography variant="caption" sx={{ color: colors.textMuted }}>{fmtVND(v.totalDiscount)}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ═══ ORDERS TABLE ═══ */}
        <Card sx={{ ...cardSx, mb: 3 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary }}>Chi tiết đơn hàng</Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted }}>{ordersData.pagination.total || 0} đơn hàng trong khoảng thời gian</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button variant="outlined" size="small" startIcon={<FileDownloadIcon />}
                  onClick={() => exportToExcel(ordersData, timeRange)}
                  sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.78rem', borderColor: colors.borderSubtle, color: colors.textSecondary }}>
                  Xuất Excel
                </Button>
                <TextField select size="small" value={orderStatusFilter}
                  onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
                  sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem' } }}>
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  <MenuItem value="PAID">Thành công</MenuItem>
                  <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                  <MenuItem value="FAILED">Thất bại</MenuItem>
                  <MenuItem value="EXPIRED">Hết hạn</MenuItem>
                  <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                </TextField>
              </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1200, '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1, verticalAlign: 'middle', whiteSpace: 'nowrap' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.73rem', width: 110 }}>Mã đơn</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.73rem', width: 120 }}>Khách hàng</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.73rem' }}>Phim</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.73rem', width: 70 }}>Phòng</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.73rem', width: 90 }}>Suất chiếu</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.73rem', width: 45 }}>Ghế</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.73rem', width: 80 }}>Mã ghế</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.73rem', width: 110 }}>Combo</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.73rem', width: 80 }}>Giảm giá</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.73rem', width: 90 }}>Tổng tiền</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.73rem', width: 70 }}>Thanh toán</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.73rem', width: 90 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.73rem', width: 75 }}>Ngày</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ordersData.orders?.length > 0 ? ordersData.orders.map((o, idx) => {
                    const sp = STATUS_PROPS[o.status] || STATUS_PROPS.PENDING;
                    const totalDiscount = (o.discount || 0) + (o.pointDiscount || 0);
                    return (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1B4F93' }}>{o.orderNo}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 500 }}>{o.customer}</Typography>
                          {o.email && <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.65rem', display: 'block' }}>{o.email}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{o.movie}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.78rem', fontWeight: 500 }}>{o.room || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.72rem', color: colors.textMuted }}>{o.showtime || '—'}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{o.seats}</TableCell>
                        <TableCell><Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.68rem' }}>{o.seatCodes}</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.68rem' }}>{o.comboNames || '—'}</Typography></TableCell>
                        <TableCell align="right">
                          {totalDiscount > 0 ? (
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#e91e63' }}>-{fmtVND(totalDiscount)}</Typography>
                              {o.voucherCode && <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6rem', display: 'block' }}>{o.voucherCode}</Typography>}
                            </Box>
                          ) : <Typography variant="caption" sx={{ color: colors.textMuted }}>—</Typography>}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#d32f2f' }}>{fmtVND(o.totalAmount)}</TableCell>
                        <TableCell align="center">
                          <Chip label={o.bankCode || 'VNPay'} size="small" sx={{
                            height: 20, fontSize: '0.65rem', fontWeight: 600,
                            bgcolor: '#e3f2fd', color: '#1565c0', '& .MuiChip-label': { px: 0.8 }
                          }} />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={sp.label} size="small" sx={{
                            height: 22, fontSize: '0.68rem', fontWeight: 600,
                            bgcolor: darkMode ? 'transparent' : sp.bg, color: sp.color,
                            border: darkMode ? `1px solid ${sp.color}` : 'none', '& .MuiChip-label': { px: 1 }
                          }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.72rem', color: colors.textMuted }}>{o.createdAt}</TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow><TableCell colSpan={13} align="center" sx={{ py: 4 }}><EmptyPlaceholder message="Không có đơn hàng nào" height={80} colors={colors} /></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Phân trang */}
            {ordersData.pagination.totalPages > 1 && (() => {
              const totalPages = ordersData.pagination.totalPages;
              const currentPage = orderPage;
              const handlePageChange = (p) => setOrderPage(p);
              return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 3, mb: 2 }}>
                  <Box onClick={() => handlePageChange(1)} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'default' : 'pointer', color: currentPage === 1 ? '#ccc' : colors.textSecondary, fontSize: '14px' }}>«</Box>
                  <Box onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'default' : 'pointer', color: currentPage === 1 ? '#ccc' : colors.textSecondary, fontSize: '14px' }}>‹</Box>
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = idx + 1;
                    else if (currentPage <= 3) pageNum = idx + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + idx;
                    else pageNum = currentPage - 2 + idx;
                    return (
                      <Box key={pageNum} onClick={() => handlePageChange(pageNum)} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', bgcolor: currentPage === pageNum ? '#1B4F93' : 'transparent', color: currentPage === pageNum ? '#fff' : colors.textSecondary, borderRadius: '4px', fontSize: '14px', fontWeight: currentPage === pageNum ? 600 : 400, '&:hover': { bgcolor: currentPage === pageNum ? '#1B4F93' : colors.bgSubtle } }}>{pageNum}</Box>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && <Box sx={{ px: 1, color: colors.textSecondary }}>...</Box>}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <Box onClick={() => handlePageChange(totalPages)} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.textSecondary, borderRadius: '4px', fontSize: '14px', '&:hover': { bgcolor: colors.bgSubtle } }}>{totalPages}</Box>
                  )}
                  <Box onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'default' : 'pointer', color: currentPage === totalPages ? '#ccc' : colors.textSecondary, fontSize: '14px' }}>›</Box>
                  <Box onClick={() => handlePageChange(totalPages)} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'default' : 'pointer', color: currentPage === totalPages ? '#ccc' : colors.textSecondary, fontSize: '14px' }}>»</Box>
                </Box>
              );
            })()}
          </CardContent>
        </Card>

      </>)}
    </Box>
  );
};

export default AdminStatisticsPage;
