import { useState, useEffect } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress, Chip,
  CircularProgress, Avatar
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import {
  getDashboardStatsAPI,
  getRevenue7DaysAPI,
  getRevenue30DaysAPI,
  getGenreStatsAPI,
  getTopMoviesAPI,
  getTodayShowtimesAPI,
  getRecentOrdersAPI,
  getOccupancyRateAPI,
  getTopCombosAPI,
  getMembershipStatsAPI,
  getActivePromotionsAPI,
  getTodaySummaryAPI
} from '../../../apis/dashboardApi';

// Ánh xạ tên icon (string) sang component MUI
const ICON_MAP = {
  AttachMoney: AttachMoneyIcon,
  ConfirmationNumber: ConfirmationNumberIcon,
  MovieFilter: MovieFilterIcon,
  PersonAdd: PersonAddIcon
};

// Định dạng tiền tệ VNĐ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Lấy nhãn và màu cho trạng thái đơn hàng
const getStatusProps = (status) => {
  switch (status) {
    case 'PAID':
      return { label: 'Thành công', color: 'success' };
    case 'PENDING':
      return { label: 'Đang chờ', color: 'warning' };
    case 'PROCESSING':
      return { label: 'Đang xử lý', color: 'info' };
    case 'CANCELLED':
      return { label: 'Đã hủy', color: 'error' };
    case 'FAILED':
      return { label: 'Thất bại', color: 'error' };
    case 'EXPIRED':
      return { label: 'Hết hạn', color: 'default' };
    default:
      return { label: status, color: 'default' };
  }
};

// Kiểu dáng chung cho Card (nhận bảng màu từ context)
const getCardSx = (colors, darkMode) => ({
  borderRadius: { xs: 1.5, sm: 2 },
  boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  height: '100%',
  transition: 'all 0.3s ease'
});

// Số lượng mục hiển thị mỗi trang
const SHOWTIME_PER_PAGE = 10;
const ORDER_PER_PAGE = 10;

const AdminDashboardPage = () => {
  // Lấy chế độ sáng/tối và bảng màu từ context
  const { darkMode, colors } = useAdminTheme();
  const cardSx = getCardSx(colors, darkMode);

  // ===== STATE: Dashboard data =====
  const [loading, setLoading] = useState(true);
  const [statCards, setStatCards] = useState([]);
  const [revenue7Days, setRevenue7Days] = useState([]);
  const [genreDistribution, setGenreDistribution] = useState([]);
  const [revenue30Days, setRevenue30Days] = useState([]);
  const [revenue30DaysRange, setRevenue30DaysRange] = useState({ startDate: '', endDate: '' });
  const [topMovies, setTopMovies] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [todayShowtimes, setTodayShowtimes] = useState([]);
  const [seatOccupancy, setSeatOccupancy] = useState({ occupancyRate: 0, bookedSeats: 0, totalCapacity: 0, availableSeats: 0, totalShowtimes: 0 });
  const [topCombos, setTopCombos] = useState([]);
  const [membershipDistribution, setMembershipDistribution] = useState([]);
  const [activePromotions, setActivePromotions] = useState({ totalPromotions: 0, totalVouchers: 0, voucherUsageRate: 0, promotionList: [] });
  const [todaySummary, setTodaySummary] = useState({ todayLabel: '', revenue: { value: 0, display: '0', change: 0 }, orders: { value: 0, change: 0 }, reviews: { count: 0, avgRating: 0 }, newMembers: 0 });

  // ===== FETCH DATA =====
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [
          statsRes, rev7Res, rev30Res, genreRes, topMovieRes,
          showtimeRes, ordersRes, occupancyRes, combosRes,
          memberRes, promoRes, summaryRes
        ] = await Promise.allSettled([
          getDashboardStatsAPI(),
          getRevenue7DaysAPI(),
          getRevenue30DaysAPI(),
          getGenreStatsAPI(),
          getTopMoviesAPI(),
          getTodayShowtimesAPI(),
          getRecentOrdersAPI(),
          getOccupancyRateAPI(),
          getTopCombosAPI(),
          getMembershipStatsAPI(),
          getActivePromotionsAPI(),
          getTodaySummaryAPI()
        ]);

        if (statsRes.status === 'fulfilled') setStatCards(statsRes.value.data.stats);
        if (rev7Res.status === 'fulfilled') setRevenue7Days(rev7Res.value.data.revenue);
        if (rev30Res.status === 'fulfilled') {
          setRevenue30Days(rev30Res.value.data.revenue);
          setRevenue30DaysRange({ startDate: rev30Res.value.data.startDate, endDate: rev30Res.value.data.endDate });
        }
        if (genreRes.status === 'fulfilled') setGenreDistribution(genreRes.value.data.genres);
        if (topMovieRes.status === 'fulfilled') setTopMovies(topMovieRes.value.data.stats);
        if (showtimeRes.status === 'fulfilled') setTodayShowtimes(showtimeRes.value.data.showtimes);
        if (ordersRes.status === 'fulfilled') setRecentOrders(ordersRes.value.data.orders);
        if (occupancyRes.status === 'fulfilled') setSeatOccupancy(occupancyRes.value.data);
        if (combosRes.status === 'fulfilled') setTopCombos(combosRes.value.data.combos);
        if (memberRes.status === 'fulfilled') setMembershipDistribution(memberRes.value.data.membership);
        if (promoRes.status === 'fulfilled') setActivePromotions(promoRes.value.data.promotions);
        if (summaryRes.status === 'fulfilled') setTodaySummary(summaryRes.value.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Phân trang suất chiếu
  const [showtimePage, setShowtimePage] = useState(1);
  const totalShowtimePages = Math.ceil(todayShowtimes.length / SHOWTIME_PER_PAGE);
  const pagedShowtimes = todayShowtimes.slice(
    (showtimePage - 1) * SHOWTIME_PER_PAGE,
    showtimePage * SHOWTIME_PER_PAGE
  );

  // Phân trang đơn hàng
  const [orderPage, setOrderPage] = useState(1);
  const totalOrderPages = Math.ceil(recentOrders.length / ORDER_PER_PAGE);
  const pagedOrders = recentOrders.slice(
    (orderPage - 1) * ORDER_PER_PAGE,
    orderPage * ORDER_PER_PAGE
  );

  // Animation tuần tự khi load trang
  const [visibleSections, setVisibleSections] = useState(0);
  useEffect(() => {
    const timers = [];
    for (let i = 1; i <= 7; i++) {
      timers.push(setTimeout(() => setVisibleSections(i), i * 300));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  // Style animation cho mỗi section
  const sectionAnim = (index) => ({
    opacity: visibleSections >= index ? 1 : 0,
    transform: visibleSections >= index ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto', transition: 'all 0.3s ease' }}>

      {/* Loading overlay */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
          <CircularProgress size={48} sx={{ color: colors.textPrimary }} />
        </Box>
      )}

      {!loading && (<>

        {/* ===== HÀNG 1: THẺ THỐNG KÊ ===== */}
        <Box sx={sectionAnim(1)}>
          <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
            {statCards.map((card) => {
              const IconComp = ICON_MAP[card.icon] || Box;
              const isPositive = card.change >= 0;
              return (
                <Grid item xs={6} sm={6} md={3} key={card.id}>
                  <Card sx={cardSx}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: { xs: 0.8, sm: 1.5 } }}>
                        <Box sx={{
                          width: { xs: 36, sm: 44 }, height: { xs: 36, sm: 44 }, borderRadius: 1.5,
                          bgcolor: `${card.color}14`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <IconComp sx={{ fontSize: { xs: 18, sm: 24 }, color: card.color }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          {isPositive
                            ? <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                            : <TrendingDownIcon sx={{ fontSize: 16, color: '#f44336' }} />
                          }
                          <Typography variant="caption" sx={{ color: isPositive ? '#4caf50' : '#f44336', fontWeight: 600, fontSize: '0.75rem' }}>
                            {isPositive ? '+' : ''}{card.change}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.3, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                        {card.displayValue}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: { xs: '0.7rem', sm: '0.82rem' } }}>
                        {card.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* ===== HÀNG 2: BIỂU ĐỒ CỘT + BIỂU ĐỒ TRÒN ===== */}
        <Box sx={sectionAnim(2)}>
          <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
            <Grid item xs={12} md={8}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    Doanh thu 7 ngày gần nhất
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1 }}>
                    Đơn vị: triệu VNĐ
                  </Typography>
                  <Box sx={{
                    width: '100%', overflowX: 'auto',
                    '& text': { fill: `${darkMode ? '#fff' : '#555'} !important` },
                    '& tspan': { fill: `${darkMode ? '#fff' : '#555'} !important` },
                    '& span': { color: `${darkMode ? '#fff' : '#555'} !important` },
                    '& p': { color: `${darkMode ? '#fff' : '#555'} !important` }
                  }}>
                    <BarChart
                      xAxis={[{ scaleType: 'band', data: revenue7Days.map(d => d.day), tickLabelStyle: { fill: colors.textSecondary } }]}
                      yAxis={[{ label: 'VNĐ', valueFormatter: (v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}tr` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : `${v}`, tickLabelStyle: { fill: colors.textSecondary }, labelStyle: { fill: colors.textMuted } }]}
                      series={[
                        { data: revenue7Days.map(d => d.tickets), label: 'Doanh thu vé', color: '#1B4F93', valueFormatter: (v) => v != null ? `${v.toLocaleString('vi-VN')} VNĐ` : '' },
                        { data: revenue7Days.map(d => d.combos), label: 'Doanh thu combo', color: '#ff9800', valueFormatter: (v) => v != null ? `${v.toLocaleString('vi-VN')} VNĐ` : '' }
                      ]}
                      height={220}
                      margin={{ top: 20, right: 10, bottom: 30, left: 45 }}
                      slotProps={{
                        legend: {
                          position: { vertical: 'top', horizontal: 'right' },
                          itemMarkWidth: 10, itemMarkHeight: 10,
                          labelStyle: { color: darkMode ? '#fff' : '#555', fill: darkMode ? '#fff' : '#555' }
                        }
                      }}
                      sx={{
                        '& .MuiChartsAxisHighlight-root': { fill: 'transparent' },
                        '& .MuiChartsAxis-line': { stroke: colors.borderSubtle },
                        '& .MuiChartsAxis-tick': { stroke: colors.borderSubtle },
                        minWidth: 300
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
                    Thể loại phim phổ biến
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1 }}>
                    Số vé bán theo thể loại trong tháng (Top 5)
                  </Typography>
                  {(() => {
                    // Gom thể loại: top 5 + còn lại thành "Khác"
                    const sorted = [...genreDistribution].sort((a, b) => b.value - a.value);
                    const top5 = sorted.slice(0, 5);
                    const others = sorted.slice(5);
                    const othersTotal = others.reduce((s, d) => s + d.value, 0);
                    const chartData = othersTotal > 0
                      ? [...top5, { id: 99, value: othersTotal, label: 'Khác', color: '#bdbdbd' }]
                      : top5;
                    const total = chartData.reduce((s, d) => s + d.value, 0);
                    return (
                      <>
                        <Box sx={{
                          '& text': { fill: `${darkMode ? '#fff' : '#555'} !important` },
                          '& tspan': { fill: `${darkMode ? '#fff' : '#555'} !important` }
                        }}>
                          <PieChart
                            series={[{
                              data: chartData,
                              innerRadius: 40,
                              outerRadius: 80,
                              paddingAngle: 2,
                              cornerRadius: 4,
                              valueFormatter: (item) => {
                                const percent = Math.round((item.value / total) * 100);
                                return `${item.value} vé (${percent}%)`;
                              }
                            }]}
                            height={200}
                            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                            slotProps={{ legend: { hidden: true } }}
                          />
                        </Box>
                        {/* Custom compact legend */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                          {chartData.map((d) => (
                            <Box key={d.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color, flexShrink: 0 }} />
                              <span style={{ color: darkMode ? '#ffffff' : '#555555', fontSize: '0.72rem' }}>
                                {d.label} ({Math.round((d.value / total) * 100)}%)
                              </span>
                            </Box>
                          ))}
                        </Box>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* ===== HÀNG 3: BIỂU ĐỒ ĐƯỜNG + TOP PHIM ===== */}
        <Box sx={sectionAnim(3)}>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
                    Xu hướng doanh thu 30 ngày
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1 }}>
                    {revenue30DaysRange.startDate} — {revenue30DaysRange.endDate}
                  </Typography>
                  <Box sx={{
                    '& text': { fill: `${darkMode ? '#fff' : '#555'} !important` },
                    '& tspan': { fill: `${darkMode ? '#fff' : '#555'} !important` },
                    '& span': { color: `${darkMode ? '#fff' : '#555'} !important` },
                    '& p': { color: `${darkMode ? '#fff' : '#555'} !important` }
                  }}>
                    <LineChart
                      xAxis={[{
                        scaleType: 'band',
                        data: revenue30Days.map(d => d.day),
                        tickLabelStyle: { fontSize: 10, fill: colors.textSecondary }
                      }]}
                      yAxis={[{ label: 'VNĐ', valueFormatter: (v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}tr` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : `${v}`, tickLabelStyle: { fill: colors.textSecondary }, labelStyle: { fill: colors.textMuted } }]}
                      series={[{
                        data: revenue30Days.map(d => d.value),
                        label: 'Doanh thu',
                        color: '#ff9800',
                        area: true,
                        valueFormatter: (v) => v != null ? `${v.toLocaleString('vi-VN')} VNĐ` : ''
                      }]}
                      height={260}
                      margin={{ top: 20, right: 20, bottom: 30, left: 55 }}
                      slotProps={{ legend: { hidden: true } }}
                      sx={{
                        '& .MuiChartsAxisHighlight-root': { fill: 'transparent' },
                        '& .MuiChartsAxis-line': { stroke: colors.borderSubtle },
                        '& .MuiChartsAxis-tick': { stroke: colors.borderSubtle }
                      }}
                    />
                  </Box>
                  {/* === Summary Stats === */}
                  {(() => {
                    const values = revenue30Days.map(d => d.value);
                    const total = values.reduce((s, v) => s + v, 0);
                    const avg = Math.round(total / 30);
                    const max = Math.max(...values);
                    const min = Math.min(...values);
                    const peakDay = revenue30Days.find(d => d.value === max)?.day;
                    const lowDay = revenue30Days.find(d => d.value === min)?.day;
                    const fmtVND = (v) => v >= 1e9 ? `${(v / 1e9).toFixed(1)} tỷ` : v >= 1e6 ? `${(v / 1e6).toFixed(1)} tr` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : `${v}`;
                    return (
                      <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, minWidth: 100, p: 1.5, bgcolor: colors.bgWarm, borderRadius: 1.5, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#e65100' }}>{fmtVND(total)}</Typography>
                          <Typography variant="caption" sx={{ color: colors.textMuted }}>Tổng 30 ngày</Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 100, p: 1.5, bgcolor: colors.bgBlue, borderRadius: 1.5, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565c0' }}>~{fmtVND(avg)}/ngày</Typography>
                          <Typography variant="caption" sx={{ color: colors.textMuted }}>Trung bình</Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 100, p: 1.5, bgcolor: colors.bgGreen, borderRadius: 1.5, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2e7d32' }}>{fmtVND(max)} ({peakDay})</Typography>
                          <Typography variant="caption" sx={{ color: colors.textMuted }}>Cao nhất</Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 100, p: 1.5, bgcolor: colors.bgRed, borderRadius: 1.5, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#c62828' }}>{fmtVND(min)} ({lowDay})</Typography>
                          <Typography variant="caption" sx={{ color: colors.textMuted }}>Thấp nhất</Typography>
                        </Box>
                      </Box>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 2 }}>
                    Top 5 phim bán chạy
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {topMovies.map((movie, index) => {
                      const rank = index + 1;
                      const maxRevenue = topMovies[0]?.revenue || 1;
                      const percentage = Math.round((movie.revenue / maxRevenue) * 100);
                      const ageColor = movie.ageRating === 'P' ? '#4caf50'
                        : movie.ageRating === 'C13' ? '#2196f3'
                          : movie.ageRating === 'C16' ? '#ff9800' : '#f44336';
                      return (
                        <Box key={movie._id} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          {/* Poster */}
                          <Box sx={{ position: 'relative', flexShrink: 0 }}>
                            <Box
                              component="img"
                              src={movie.posterUrl}
                              alt={movie.title}
                              sx={{ width: 40, height: 56, borderRadius: 1, objectFit: 'cover', display: 'block' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            {/* Rank badge */}
                            <Box sx={{
                              position: 'absolute', top: -4, left: -4,
                              width: 18, height: 18, borderRadius: '50%',
                              bgcolor: rank <= 3 ? '#1B4F93' : '#bdbdbd',
                              color: '#fff', fontSize: '0.6rem', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '2px solid currentColor'
                            }}>
                              {rank}
                            </Box>
                          </Box>
                          {/* Info */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {movie.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, flexShrink: 0, ml: 1 }}>
                                {movie.ticketsSold} vé
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <Chip
                                label={movie.ageRating}
                                size="small"
                                sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: ageColor, color: '#fff', '& .MuiChip-label': { px: 0.8 } }}
                              />
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={{
                                height: 5, borderRadius: 3, bgcolor: colors.bgProgressTrack,
                                '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: rank <= 3 ? '#1B4F93' : '#90caf9' }
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* ===== HÀNG 4: COMBO BÁN CHẠY + PHÂN BỔ THÀNH VIÊN ===== */}
        <Box sx={sectionAnim(4)}>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {/* Combo bán chạy */}
            <Grid item xs={12} md={8}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
                    Combo bán chạy
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 2 }}>
                    Thống kê F&B trong tháng
                  </Typography>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', px: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ flex: 2, fontWeight: 700, color: colors.textMuted, fontSize: '0.7rem' }}>TÊN COMBO</Typography>
                    <Typography variant="caption" sx={{ width: 70, fontWeight: 700, color: colors.textMuted, fontSize: '0.7rem', textAlign: 'right' }}>GIÁ</Typography>
                    <Typography variant="caption" sx={{ width: 60, fontWeight: 700, color: colors.textMuted, fontSize: '0.7rem', textAlign: 'right' }}>ĐÃ BÁN</Typography>
                    <Typography variant="caption" sx={{ width: 90, fontWeight: 700, color: colors.textMuted, fontSize: '0.7rem', textAlign: 'right' }}>DOANH THU</Typography>
                  </Box>
                  {/* Items */}
                  {(() => {
                    const maxSold = Math.max(...topCombos.map(c => c.sold));
                    const totalRevenue = topCombos.reduce((s, c) => s + c.revenue, 0);
                    return (
                      <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {topCombos.map((combo, idx) => (
                            <Box key={idx} sx={{ p: 1, borderRadius: 1.5, bgcolor: colors.bgSubtle, '&:hover': { bgcolor: colors.bgSubtleHover } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: combo.color, flexShrink: 0 }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary, fontSize: '0.82rem' }}>
                                    {combo.name}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ width: 70, textAlign: 'right', color: colors.textSecondary, fontSize: '0.78rem' }}>
                                  {Math.round(combo.price / 1000)}K
                                </Typography>
                                <Typography variant="body2" sx={{ width: 60, textAlign: 'right', fontWeight: 600, color: '#1B4F93', fontSize: '0.82rem' }}>
                                  {combo.sold}
                                </Typography>
                                <Typography variant="body2" sx={{ width: 90, textAlign: 'right', fontWeight: 600, color: colors.textPrimary, fontSize: '0.78rem' }}>
                                  {combo.revenue >= 1e6 ? `${(combo.revenue / 1e6).toFixed(1)}tr` : `${Math.round(combo.revenue / 1e3)}K`}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={Math.round((combo.sold / maxSold) * 100)}
                                sx={{
                                  height: 4, borderRadius: 2, bgcolor: colors.bgProgressTrack,
                                  '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: combo.color }
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                        {/* Total */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 1.5, borderTop: `1px solid ${colors.borderSubtle}` }}>
                          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 500 }}>
                            Tổng cộng: {topCombos.reduce((s, c) => s + c.sold, 0)} combo đã bán
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1B4F93' }}>
                            {totalRevenue >= 1e9 ? `${(totalRevenue / 1e9).toFixed(1)} tỷ VNĐ` : `${(totalRevenue / 1e6).toFixed(1)} triệu VNĐ`}
                          </Typography>
                        </Box>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>

            {/* Phân bổ thành viên */}
            <Grid item xs={12} md={4}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
                    Phân bổ thành viên
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1 }}>
                    Tổng quan hạng thành viên
                  </Typography>
                  {(() => {
                    const total = membershipDistribution.reduce((s, m) => s + m.value, 0);
                    return (
                      <>
                        <Box sx={{
                          '& text': { fill: `${darkMode ? '#fff' : '#555'} !important` },
                          '& tspan': { fill: `${darkMode ? '#fff' : '#555'} !important` }
                        }}>
                          <PieChart
                            series={[{
                              data: membershipDistribution,
                              innerRadius: 45,
                              outerRadius: 75,
                              paddingAngle: 3,
                              cornerRadius: 4,
                              valueFormatter: (item) => {
                                const percent = Math.round((item.value / total) * 100);
                                return `${item.value.toLocaleString()} người (${percent}%)`;
                              }
                            }]}
                            height={170}
                            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                            slotProps={{ legend: { hidden: true } }}
                          />
                        </Box>
                        {/* Tổng */}
                        <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2 }}>
                            {total.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.textMuted }}>Tổng thành viên</Typography>
                        </Box>
                        {/* Tier breakdown */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {membershipDistribution.map((tier) => {
                            const percent = Math.round((tier.value / total) * 100);
                            return (
                              <Box key={tier.id} sx={{ p: 1, bgcolor: colors.bgSubtle, borderRadius: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: tier.color }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary, fontSize: '0.82rem' }}>
                                      {tier.label}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary, fontSize: '0.82rem' }}>
                                    {tier.value.toLocaleString()} ({percent}%)
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={percent}
                                  sx={{
                                    height: 4, borderRadius: 2, bgcolor: colors.bgProgressTrack,
                                    '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: tier.color }
                                  }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* ===== HÀNG 5: TỶ LỆ GHẾ + KHUYẾN MÃI + TỔNG QUAN ===== */}
        <Box sx={sectionAnim(5)}>
          <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
            {/* Tỷ lệ lấp đầy ghế */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5, alignSelf: 'flex-start' }}>
                    Tỷ lệ lấp đầy ghế hôm nay
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1.5 }}>
                    Tổng hợp tất cả phòng chiếu
                  </Typography>
                  {/* Circular gauge + stats */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                      <CircularProgress
                        variant="determinate"
                        value={Math.round(seatOccupancy.occupancyRate)}
                        size={90}
                        thickness={6}
                        sx={{ color: seatOccupancy.occupancyRate >= 70 ? '#4caf50' : '#ff9800' }}
                      />
                      <Box sx={{
                        position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, lineHeight: 1 }}>
                          {Math.round(seatOccupancy.occupancyRate)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>Đã đặt</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#4caf50' }}>{seatOccupancy.bookedSeats}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>Còn trống</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#ff9800' }}>{seatOccupancy.availableSeats}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>Tổng ghế</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: colors.textPrimary }}>{seatOccupancy.totalCapacity}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>Suất chiếu</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B4F93' }}>{seatOccupancy.totalShowtimes}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Khuyến mãi đang hoạt động */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                      Khuyến mãi đang hoạt động
                    </Typography>
                    <Chip label={`${activePromotions.totalPromotions} KM`} size="small" sx={{ bgcolor: '#e91e63', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1.5 }}>
                    {activePromotions.totalVouchers} voucher đang lưu hành
                  </Typography>
                  {/* Promotion list */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {activePromotions.promotionList.map((promo, idx) => {
                      const usePct = promo.hasQuota && promo.total > 0 ? Math.round((promo.used / promo.total) * 100) : 0;
                      // Màu chip theo loại KM
                      const chipColor = promo.applyMode === 'ONLINE_VOUCHER'
                        ? { bg: colors.bgBlue, color: '#1565c0' }
                        : promo.applyMode === 'OFFLINE_ONLY'
                          ? { bg: '#fff3e0', color: '#e65100' }
                          : { bg: '#f3e5f5', color: '#7b1fa2' };
                      return (
                        <Box key={idx} sx={{ p: 1, bgcolor: colors.bgSubtle, borderRadius: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary, fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, mr: 0.5 }}>
                              {promo.name}
                            </Typography>
                            <Chip label={promo.applyLabel || promo.type} size="small"
                              sx={{ height: 16, fontSize: '0.58rem', fontWeight: 600, bgcolor: chipColor.bg, color: chipColor.color, '& .MuiChip-label': { px: 0.6 }, flexShrink: 0 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                            <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.68rem' }}>
                              HSD: {promo.endDate} • {promo.hasQuota ? `Đã dùng: ${promo.used}/${promo.total}` : 'Không giới hạn'}
                            </Typography>
                            {promo.hasQuota && (
                              <Typography variant="caption" sx={{ fontWeight: 600, color: usePct >= 80 ? '#f44336' : '#1B4F93', fontSize: '0.68rem' }}>
                                {usePct}%
                              </Typography>
                            )}
                          </Box>
                          {promo.hasQuota && (
                            <LinearProgress variant="determinate" value={usePct}
                              sx={{ height: 3, borderRadius: 2, bgcolor: colors.bgProgressTrack, '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: usePct >= 80 ? '#f44336' : '#4caf50' } }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Tổng quan nhanh */}
            <Grid item xs={12} md={4}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
                    Tổng quan nhanh
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1.5 }}>
                    Dữ liệu hôm nay — {todaySummary.todayLabel}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* Suất chiếu */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, bgcolor: colors.bgBlue, borderRadius: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ConfirmationNumberIcon sx={{ color: '#1565c0', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: colors.textPrimary, fontSize: '0.82rem' }}>Suất chiếu</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565c0' }}>{todayShowtimes.length} suất</Typography>
                    </Box>
                    {/* Doanh thu */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, bgcolor: colors.bgGreen, borderRadius: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoneyIcon sx={{ color: '#2e7d32', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: colors.textPrimary, fontSize: '0.82rem' }}>Doanh thu</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#2e7d32' }}>{todaySummary.revenue.display}</Typography>
                        {todaySummary.revenue.change !== 0 && (
                          <Typography variant="caption" sx={{ color: todaySummary.revenue.change >= 0 ? '#4caf50' : '#f44336', fontSize: '0.65rem' }}>
                            {todaySummary.revenue.change >= 0 ? '↑' : '↓'} {Math.abs(todaySummary.revenue.change)}% vs hôm qua
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {/* Đơn hàng */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, bgcolor: colors.bgWarm, borderRadius: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingCartIcon sx={{ color: '#e65100', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: colors.textPrimary, fontSize: '0.82rem' }}>Đơn hàng</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#e65100' }}>{todaySummary.orders.value} đơn</Typography>
                        {todaySummary.orders.change !== 0 && (
                          <Typography variant="caption" sx={{ color: todaySummary.orders.change >= 0 ? '#4caf50' : '#f44336', fontSize: '0.65rem' }}>
                            {todaySummary.orders.change >= 0 ? '↑' : '↓'} {Math.abs(todaySummary.orders.change)}% vs hôm qua
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {/* Review mới */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, bgcolor: colors.bgPurple, borderRadius: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ color: '#7b1fa2', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: colors.textPrimary, fontSize: '0.82rem' }}>Review mới</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#7b1fa2' }}>{todaySummary.reviews.count} đánh giá</Typography>
                        {todaySummary.reviews.avgRating > 0 && (
                          <Typography variant="caption" sx={{ color: '#4caf50', fontSize: '0.65rem' }}>⭐ TB: {todaySummary.reviews.avgRating}/5</Typography>
                        )}
                      </Box>
                    </Box>
                    {/* Thành viên mới */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, bgcolor: colors.bgRed, borderRadius: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon sx={{ color: '#c62828', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: colors.textPrimary, fontSize: '0.82rem' }}>Thành viên mới</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#c62828' }}>{todaySummary.newMembers} người</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* ===== HÀNG 6: SUẤT CHIẾU HÔM NAY ===== */}
        <Box sx={sectionAnim(6)}>
          <Card sx={{ ...cardSx, mb: { xs: 2, sm: 3 } }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                  Suất chiếu hôm nay
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted }}>
                  Tổng: {todayShowtimes.length} suất • Trang {showtimePage}/{totalShowtimePages}
                </Typography>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.borderTable}`, borderRadius: 1.5, overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 800, '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle } }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Giờ chiếu</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Phim</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Phòng</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Định dạng</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Ngôn ngữ</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Giá vé</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Ghế đặt</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedShowtimes.map((show, idx) => {
                      const [booked, total] = show.seatStatus.split('/').map(Number);
                      const fillRate = Math.round((booked / total) * 100);
                      const statusMap = { OPEN: { label: 'Đang mở', color: '#e8f5e9', textColor: '#2e7d32' }, CLOSED: { label: 'Đã đóng', color: '#f5f5f5', textColor: '#888' }, CANCELED: { label: 'Đã hủy', color: '#ffebee', textColor: '#c62828' } };
                      const st = statusMap[show.status] || statusMap.OPEN;
                      return (
                        <TableRow key={idx} sx={{ '&:hover': { bgcolor: colors.bgSubtle }, opacity: show.status === 'CANCELED' ? 0.5 : 1 }}>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textPrimary }}>
                            {show.time} <Typography component="span" sx={{ color: colors.textMuted, fontSize: '0.7rem' }}>- {show.endTime}</Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                component="img"
                                src={show.poster}
                                alt={show.movie}
                                sx={{ width: 36, height: 50, borderRadius: 0.5, objectFit: 'cover', flexShrink: 0 }}
                              />
                              <Box>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.3 }}>{show.movie}</Typography>
                                <Chip
                                  label={show.ageRating}
                                  size="small"
                                  sx={{
                                    height: 16, fontSize: '0.55rem', fontWeight: 700, mt: 0.3,
                                    bgcolor: show.ageRating === 'P' ? '#e8f5e9' : show.ageRating === 'T13' ? '#e3f2fd' : show.ageRating === 'T16' ? '#fff3e0' : '#ffebee',
                                    color: show.ageRating === 'P' ? '#2e7d32' : show.ageRating === 'T13' ? '#1565c0' : show.ageRating === 'T16' ? '#e65100' : '#c62828',
                                    '& .MuiChip-label': { px: 0.5 }
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>{show.room}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={show.format}
                              size="small"
                              sx={{
                                fontSize: '0.7rem', height: 22, fontWeight: 600,
                                bgcolor: show.format === 'IMAX' ? '#9c27b0' : show.format === '3D' ? '#1B4F93' : show.format === 'VIP' ? '#e65100' : '#eee',
                                color: show.format === '2D' ? '#333' : '#fff'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={show.subtitle}
                              size="small"
                              sx={{
                                fontSize: '0.65rem', height: 20, fontWeight: 500,
                                bgcolor: show.subtitle === 'Lồng tiếng' ? '#fff3e0' : '#e3f2fd',
                                color: show.subtitle === 'Lồng tiếng' ? '#e65100' : '#1565c0'
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            {new Intl.NumberFormat('vi-VN').format(show.basePrice)}đ
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                {show.seatStatus}
                              </Typography>
                              <Chip
                                label={`${fillRate}%`}
                                size="small"
                                sx={{
                                  fontSize: '0.65rem', height: 20, fontWeight: 600,
                                  bgcolor: fillRate >= 80 ? '#ffebee' : fillRate >= 50 ? '#fff3e0' : '#e8f5e9',
                                  color: fillRate >= 80 ? '#c62828' : fillRate >= 50 ? '#e65100' : '#2e7d32'
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={st.label} size="small" sx={{ fontSize: '0.65rem', height: 20, fontWeight: 600, bgcolor: st.color, color: st.textColor }} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Phân trang */}
              {totalShowtimePages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 2 }}>
                  <Box onClick={() => setShowtimePage(1)}
                    sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: showtimePage === 1 ? 'default' : 'pointer', color: showtimePage === 1 ? colors.textDisabled : colors.paginationText, fontSize: '14px' }}>«</Box>
                  <Box onClick={() => showtimePage > 1 && setShowtimePage(showtimePage - 1)}
                    sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: showtimePage === 1 ? 'default' : 'pointer', color: showtimePage === 1 ? colors.textDisabled : colors.paginationText, fontSize: '14px' }}>‹</Box>
                  {[...Array(totalShowtimePages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <Box key={pageNum} onClick={() => setShowtimePage(pageNum)}
                        sx={{
                          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          bgcolor: showtimePage === pageNum ? '#f5a623' : 'transparent',
                          color: showtimePage === pageNum ? '#fff' : colors.paginationText,
                          borderRadius: '4px', fontSize: '14px', fontWeight: showtimePage === pageNum ? 600 : 400,
                          '&:hover': { bgcolor: showtimePage === pageNum ? '#f5a623' : colors.paginationHover }
                        }}>{pageNum}</Box>
                    );
                  })}
                  <Box onClick={() => showtimePage < totalShowtimePages && setShowtimePage(showtimePage + 1)}
                    sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: showtimePage === totalShowtimePages ? 'default' : 'pointer', color: showtimePage === totalShowtimePages ? colors.textDisabled : colors.paginationText, fontSize: '14px' }}>›</Box>
                  <Box onClick={() => setShowtimePage(totalShowtimePages)}
                    sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: showtimePage === totalShowtimePages ? 'default' : 'pointer', color: showtimePage === totalShowtimePages ? colors.textDisabled : colors.paginationText, fontSize: '14px' }}>»</Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* ===== HÀNG 7: ĐƠN HÀNG GẦN ĐÂY ===== */}
        <Box sx={sectionAnim(7)}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                  Đơn hàng gần đây
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted }}>
                  Tổng: {recentOrders.length} đơn • Trang {orderPage}/{totalOrderPages}
                </Typography>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.borderTable}`, borderRadius: 1.5, overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 750, '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle } }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Mã đơn</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Thời gian</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Khách hàng</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Phim</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Ghế</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Combo</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Giảm giá</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Tổng tiền</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedOrders.map((order) => {
                      const statusProps = getStatusProps(order.status);
                      return (
                        <TableRow key={order.orderNo} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#1B4F93' }}>{order.orderNo}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: colors.textMuted }}>{order.createdAt}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 28, height: 28, fontSize: '0.75rem', fontWeight: 700,
                                  bgcolor: ['#1B4F93', '#e91e63', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#f44336', '#3f51b5'][order.customer.charCodeAt(0) % 8]
                                }}
                              >
                                {order.customer.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{order.customer}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box component="img" src={order.poster} alt={order.movie}
                                sx={{ width: 30, height: 42, borderRadius: 0.5, objectFit: 'cover', flexShrink: 0 }} />
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>{order.movie}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{order.seats}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{order.combos > 0 ? order.combos : '-'}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>
                            {order.discount > 0 ? (
                              <Box>
                                <Typography variant="caption" sx={{ color: '#c62828', fontWeight: 600, fontSize: '0.75rem' }}>-{new Intl.NumberFormat('vi-VN').format(order.discount)}đ</Typography>
                                {order.voucherCode && (
                                  <Chip label={order.voucherCode} size="small" sx={{ ml: 0.5, height: 16, fontSize: '0.55rem', fontWeight: 600, bgcolor: '#e3f2fd', color: '#1565c0', '& .MuiChip-label': { px: 0.5 } }} />
                                )}
                              </Box>
                            ) : (
                              <Typography variant="caption" sx={{ color: '#ccc' }}>-</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell align="center">
                            <Chip label={statusProps.label} color={statusProps.color} size="small" sx={{ fontSize: '0.7rem', height: 24 }} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Phân trang */}
              {totalOrderPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 2 }}>
                  <Box onClick={() => setOrderPage(1)}
                    sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: orderPage === 1 ? 'default' : 'pointer', color: orderPage === 1 ? colors.textDisabled : colors.paginationText, fontSize: '14px' }}>«</Box>
                  <Box onClick={() => orderPage > 1 && setOrderPage(orderPage - 1)}
                    sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: orderPage === 1 ? 'default' : 'pointer', color: orderPage === 1 ? colors.textDisabled : colors.paginationText, fontSize: '14px' }}>‹</Box>
                  {[...Array(totalOrderPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <Box key={pageNum} onClick={() => setOrderPage(pageNum)}
                        sx={{
                          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          bgcolor: orderPage === pageNum ? '#f5a623' : 'transparent',
                          color: orderPage === pageNum ? '#fff' : colors.paginationText,
                          borderRadius: '4px', fontSize: '14px', fontWeight: orderPage === pageNum ? 600 : 400,
                          '&:hover': { bgcolor: orderPage === pageNum ? '#f5a623' : colors.paginationHover }
                        }}>{pageNum}</Box>
                    );
                  })}
                  <Box onClick={() => orderPage < totalOrderPages && setOrderPage(orderPage + 1)}
                    sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: orderPage === totalOrderPages ? 'default' : 'pointer', color: orderPage === totalOrderPages ? colors.textDisabled : colors.paginationText, fontSize: '14px' }}>›</Box>
                  <Box onClick={() => setOrderPage(totalOrderPages)}
                    sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: orderPage === totalOrderPages ? 'default' : 'pointer', color: orderPage === totalOrderPages ? colors.textDisabled : colors.paginationText, fontSize: '14px' }}>»</Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

      </>)}

    </Box>
  );
};

export default AdminDashboardPage;
