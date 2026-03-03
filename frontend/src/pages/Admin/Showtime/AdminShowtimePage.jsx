import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress,
  TextField, MenuItem, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, InputAdornment, Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InboxIcon from '@mui/icons-material/Inbox';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getAllShowtimesAPI, createShowtimeAPI, deleteShowtimeAPI, updateShowtimeAPI } from '../../../apis/showtimeApi';
import { getAllRoomsAPI, getRoomByIdAPI } from '../../../apis/roomApi';
import { getAllMoviesAPI } from '../../../apis/movieApi';
import { getAllCinemasAPI } from '../../../apis/cinemaApi';

// Status map
const STATUS_MAP = {
  OPEN: { label: 'Đang mở', color: '#4caf50', bg: '#e8f5e9' },
  CLOSED: { label: 'Đã đóng', color: '#9e9e9e', bg: '#f5f5f5' },
  CANCELED: { label: 'Đã huỷ', color: '#f44336', bg: '#ffebee' }
};

// Format time HH:mm
const fmtTime = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// Format date
const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// Format price
const fmtPrice = (p) => {
  if (!p && p !== 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(p) + 'đ';
};

// Card style
const getCardSx = (colors, darkMode) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard} `,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

const AdminShowtimePage = () => {
  const { darkMode, colors } = useAdminTheme();
  const cardSx = getCardSx(colors, darkMode);

  // State
  const [showtimes, setShowtimes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const localD = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return localD.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  // Dialog states
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(false);

  // Create form
  const [formMovie, setFormMovie] = useState('');
  const [formCinema, setFormCinema] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formPriceStandard, setFormPriceStandard] = useState('');
  const [formPriceVip, setFormPriceVip] = useState('');
  const [formPriceCouple, setFormPriceCouple] = useState('');
  const [formFormat, setFormFormat] = useState('2D');
  const [formSubtitle, setFormSubtitle] = useState('Phụ đề');
  const [formStatus, setFormStatus] = useState('COMING');
  const [formMaintenanceSeats, setFormMaintenanceSeats] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [loadingRoomDetail, setLoadingRoomDetail] = useState(false);

  // Tính thời gian kết thúc tự động
  const computedEndAt = useMemo(() => {
    if (!formMovie || !formDate || !formTime || movies.length === 0) return null;
    const movie = movies.find(m => (m._id || m.id) === formMovie);
    if (!movie?.duration) return null;
    const start = new Date(`${formDate}T${formTime}`);
    if (isNaN(start.getTime())) return null;
    const endMs = start.getTime() + (movie.duration + 30) * 60 * 1000;
    return new Date(endMs);
  }, [formMovie, formDate, formTime, movies]);

  // Danh sách tất cả ghế trong phòng (cho maintenanceSeats)
  const allSeatsInRoom = useMemo(() => {
    if (!selectedRoomDetail?.seatMap) return [];
    const seats = [];
    selectedRoomDetail.seatMap.forEach(row => {
      row.seats?.forEach(s => {
        seats.push({ name: `${row.row}${s.number}`, type: s.type });
      });
    });
    return seats;
  }, [selectedRoomDetail]);

  // Fetch rooms
  useEffect(() => {
    getAllRoomsAPI()
      .then(res => setRooms(res.data?.rooms || []))
      .catch(() => setRooms([]));
  }, []);

  // Fetch cinemas
  useEffect(() => {
    getAllCinemasAPI()
      .then(res => setCinemas(res.data?.cinemas || []))
      .catch(() => setCinemas([]));
  }, []);

  // Fetch movies for dropdown
  useEffect(() => {
    getAllMoviesAPI({ limit: 100 })
      .then(res => setMovies(res.data?.movies || []))
      .catch(() => setMovies([]));
  }, []);

  // Filter rooms by selected cinema
  const filteredFormRooms = useMemo(() => {
    if (!formCinema) return rooms;
    return rooms.filter(r => {
      const cId = typeof r.cinemaId === 'object' ? r.cinemaId?._id : r.cinemaId;
      return cId === formCinema;
    });
  }, [rooms, formCinema]);

  // Fetch room detail when room selected
  useEffect(() => {
    if (!formRoom) { setSelectedRoomDetail(null); return; }
    setLoadingRoomDetail(true);
    getRoomByIdAPI(formRoom)
      .then(res => {
        const room = res.data?.room || null;
        setSelectedRoomDetail(room);
        if (room?.type) setFormFormat(room.type);
      })
      .catch(() => setSelectedRoomDetail(null))
      .finally(() => setLoadingRoomDetail(false));
  }, [formRoom]);

  // Reset room when cinema changes
  useEffect(() => { setFormRoom(''); setSelectedRoomDetail(null); }, [formCinema]);

  // Fetch showtimes
  const fetchShowtimes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { date: selectedDate, includePast: 'true' };
      if (selectedRoom !== 'all') params.roomId = selectedRoom;
      const res = await getAllShowtimesAPI(params);
      setShowtimes(res.data?.showtimes || []);
    } catch (err) {
      console.error('Lỗi tải suất chiếu:', err);
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedRoom]);

  useEffect(() => { fetchShowtimes(); }, [fetchShowtimes]);

  // Date navigation
  const changeDate = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    const localD = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    setSelectedDate(localD.toISOString().split('T')[0]);
  };

  // Create showtime
  const handleCreate = async () => {
    if (!formMovie || !formRoom || !formDate || !formTime || !formPrice) return;
    setCreating(true);
    try {
      const startAt = new Date(`${formDate}T${formTime}:00`);
      if (isNaN(startAt.getTime())) {
        alert('Ngày/giờ không hợp lệ!');
        setCreating(false);
        return;
      }
      const payload = {
        movieId: formMovie,
        roomId: formRoom,
        startAt: startAt.toISOString(),
        basePrice: Number(formPrice),
        seatPrices: {
          standard: Number(formPriceStandard) || Number(formPrice),
          vip: Number(formPriceVip) || Number(formPrice),
          couple: Number(formPriceCouple) || Number(formPrice)
        },
        format: formFormat,
        subtitle: formSubtitle,
        status: formStatus
      };
      if (formMaintenanceSeats.length > 0) payload.maintenanceSeats = formMaintenanceSeats;
      await createShowtimeAPI(payload);
      setOpenCreate(false);
      setFormMovie(''); setFormCinema(''); setFormRoom(''); setFormDate(''); setFormTime('');
      setFormPrice(''); setFormPriceStandard(''); setFormPriceVip(''); setFormPriceCouple('');
      setFormFormat('2D'); setFormSubtitle('Phụ đề'); setFormStatus('COMING'); setFormMaintenanceSeats([]);
      setSelectedRoomDetail(null);
      fetchShowtimes();
    } catch (err) {
      console.error('Create showtime error:', err.response?.data || err);
      alert(err.response?.data?.message || 'Lỗi tạo suất chiếu!');
    } finally {
      setCreating(false);
    }
  };

  // Delete showtime
  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await deleteShowtimeAPI(deleteDialog.item._id);
      setDeleteDialog({ open: false, item: null });
      fetchShowtimes();
    } catch (err) {
      alert('Lỗi xóa suất chiếu!');
    } finally {
      setDeleting(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (showtime) => {
    const nextStatus = showtime.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await updateShowtimeAPI(showtime._id, { status: nextStatus });
      fetchShowtimes();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái!');
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* === HEADER === */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản lý Suất Chiếu
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            {fmtDate(selectedDate)} — {showtimes.length} suất chiếu
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormDate(selectedDate);
            setOpenCreate(true);
          }}
          sx={{
            bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5,
            '&:hover': { bgcolor: '#163f78' }
          }}
        >
          Tạo Mới Suất Chiếu
        </Button>
      </Box>

      {/* === TABS + DATE NAV + TABLE (chung 1 card) === */}
      <Card sx={{ ...cardSx }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>
          {/* Tabs phòng */}
          <Tabs
            value={selectedRoom}
            onChange={(_, v) => setSelectedRoom(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36, mb: 2,
              '& .MuiTab-root': {
                minHeight: 36, textTransform: 'none', fontWeight: 600,
                fontSize: '0.82rem', color: colors.textMuted,
                '&.Mui-selected': { color: '#1565c0' }
              },
              '& .MuiTabs-indicator': { bgcolor: '#1565c0' }
            }}
          >
            <Tab label="Tất cả" value="all" icon={<EventSeatIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
            {rooms.map(room => (
              <Tab key={room._id} label={room.name} value={room._id} icon={<EventSeatIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
            ))}
          </Tabs>

          {/* Đường phân cách */}
          <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle} `, mb: 2 }} />

          {/* Date navigator */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
              Danh Sách Suất Chiếu
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" onClick={() => changeDate(-1)} sx={{ color: colors.textSecondary }}>
                <ChevronLeftIcon />
              </IconButton>
              <TextField
                type="date"
                size="small"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2, bgcolor: colors.bgSubtle,
                    '& fieldset': { borderColor: colors.borderCard },
                    '&:hover fieldset': { borderColor: colors.borderCard },
                    '&.Mui-focused fieldset': { borderColor: colors.borderCard, borderWidth: 1 },
                    fontSize: '0.82rem', height: 34
                  }
                }}
              />
              <IconButton size="small" onClick={() => changeDate(1)} sx={{ color: colors.textSecondary }}>
                <ChevronRightIcon />
              </IconButton>
              <Tooltip title="Làm mới">
                <IconButton size="small" onClick={fetchShowtimes} sx={{ color: colors.textMuted, ml: 0.5 }}>
                  <RefreshIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 900, '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1, verticalAlign: 'middle' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.bgTableHead, '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', minWidth: 180 }}>Phim</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 80 }}>Rạp</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 90 }}>Phòng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 90 }}>Giờ bắt đầu</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 90 }}>Giờ kết thúc</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 70 }}>Định dạng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 90 }}>Giá vé</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 80 }}>Ghế trống</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 80 }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {showtimes.length > 0 ? showtimes.map((s, idx) => {
                    const st = STATUS_MAP[s.status] || STATUS_MAP.OPEN;
                    return (
                      <TableRow key={s._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                        <TableCell sx={{ fontSize: '0.8rem', fontWeight: 500, color: colors.textMuted }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {s.movieId?.posterUrl && (
                              <Box
                                component="img"
                                src={s.movieId.posterUrl}
                                alt={s.movieId?.title}
                                sx={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                              />
                            )}
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: colors.textPrimary, whiteSpace: 'nowrap' }}>
                                {s.movieId?.title || '—'}
                              </Typography>
                              {s.subtitle && (
                                <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.68rem' }}>
                                  {s.subtitle}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{s.cinemaId?.name || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{s.roomId?.name || '—'}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1565c0' }}>
                            {fmtTime(s.startAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{fmtTime(s.endAt)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={s.format || '2D'}
                            size="small"
                            sx={{
                              height: 22, fontSize: '0.68rem', fontWeight: 700,
                              bgcolor: s.format === 'IMAX' ? '#e8eaf6' : s.format === '3D' ? '#fff3e0' : '#e3f2fd',
                              color: s.format === 'IMAX' ? '#283593' : s.format === '3D' ? '#e65100' : '#1565c0',
                              '& .MuiChip-label': { px: 0.8 }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{fmtPrice(s.basePrice)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: s.availableSeats > 0 ? '#4caf50' : '#f44336' }}>
                            {s.availableSeats}/{s.roomId?.totalSeats || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={st.label}
                            size="small"
                            onClick={() => handleToggleStatus(s)}
                            sx={{
                              height: 22, fontSize: '0.68rem', fontWeight: 600,
                              bgcolor: darkMode ? 'transparent' : st.bg,
                              color: st.color,
                              border: darkMode ? `1px solid ${st.color} ` : 'none',
                              cursor: 'pointer',
                              '& .MuiChip-label': { px: 0.8 }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.3 }}>
                            <Tooltip title="Xóa">
                              <IconButton size="small" sx={{ color: '#f44336' }}
                                onClick={() => setDeleteDialog({ open: true, item: s })}
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                        <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ color: colors.textMuted }}>
                          Không có suất chiếu trong ngày này
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

      {/* === CREATE DIALOG === */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          Tạo Mới Suất Chiếu
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            Vui lòng điền đầy đủ thông tin bên dưới
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

            {/* === Section 1: Thông tin phim === */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Thông tin phim
            </Typography>
            <TextField
              select label="Chọn phim" size="small" fullWidth value={formMovie}
              onChange={(e) => setFormMovie(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
            >
              {movies.map(m => (
                <MenuItem key={m._id} value={m._id}>
                  {m.title} ({m.duration} phút)
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select label="Định dạng" size="small" fullWidth value={formFormat}
                onChange={(e) => setFormFormat(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
              >
                <MenuItem value="2D">2D</MenuItem>
                <MenuItem value="3D">3D</MenuItem>
                <MenuItem value="IMAX">IMAX</MenuItem>
              </TextField>
              <TextField
                select label="Ngôn ngữ" size="small" fullWidth value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
              >
                <MenuItem value="Phụ đề">Phụ đề</MenuItem>
                <MenuItem value="Lồng tiếng">Lồng tiếng</MenuItem>
                <MenuItem value="Thuyết minh">Thuyết minh</MenuItem>
              </TextField>
            </Box>

            {/* Divider */}
            <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />

            {/* === Section 2: Phòng & Lịch chiếu === */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Phòng & Lịch chiếu
            </Typography>

            {/* Chọn rạp */}
            <TextField
              select label="Chọn rạp" size="small" fullWidth value={formCinema}
              onChange={(e) => setFormCinema(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
            >
              <MenuItem value="">Tất cả rạp</MenuItem>
              {cinemas.map(c => (
                <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
              ))}
            </TextField>

            {/* Chọn phòng */}
            <TextField
              select label="Chọn phòng" size="small" fullWidth value={formRoom}
              onChange={(e) => setFormRoom(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
            >
              {filteredFormRooms.length > 0 ? filteredFormRooms.map(r => (
                <MenuItem key={r._id} value={r._id}>
                  {r.name} ({r.type} — {r.totalSeats} ghế)
                </MenuItem>
              )) : (
                <MenuItem disabled>Không có phòng nào</MenuItem>
              )}
            </TextField>

            {/* Thông tin phòng & ghế */}
            {formRoom && (
              <Box sx={{
                bgcolor: darkMode ? 'rgba(21,101,192,0.08)' : '#f0f7ff',
                borderRadius: 2, p: 1.5, border: `1px solid ${darkMode ? 'rgba(21,101,192,0.2)' : '#e3f2fd'}`
              }}>
                {loadingRoomDetail ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : selectedRoomDetail ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EventSeatIcon sx={{ fontSize: 18, color: '#1565c0' }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: colors.textPrimary }}>
                        Thông tin phòng: {selectedRoomDetail.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                        Loại: <b>{selectedRoomDetail.type}</b>
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                        Tổng ghế: <b>{selectedRoomDetail.totalSeats}</b>
                      </Typography>
                    </Box>
                    {selectedRoomDetail.seatMap && (
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.8, flexWrap: 'wrap' }}>
                        {(() => {
                          let standard = 0, vip = 0, couple = 0;
                          selectedRoomDetail.seatMap.forEach(row => {
                            row.seats.forEach(s => {
                              if (s.type === 'vip') vip++;
                              else if (s.type === 'couple') couple++;
                              else standard++;
                            });
                          });
                          return (
                            <>
                              <Chip label={`Thường: ${standard}`} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#e3f2fd', color: '#5C8EC6', fontWeight: 600 }} />
                              <Chip label={`VIP: ${vip}`} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#fff8e1', color: '#F5A623', fontWeight: 600 }} />
                              <Chip label={`Đôi: ${couple}`} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#e0f7fa', color: '#4DD0C8', fontWeight: 600 }} />
                            </>
                          );
                        })()}
                      </Box>
                    )}
                  </>
                ) : null}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Ngày chiếu" type="date" size="small" fullWidth
                value={formDate} onChange={(e) => setFormDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
              />
              <TextField
                label="Giờ bắt đầu" type="time" size="small" fullWidth
                value={formTime} onChange={(e) => setFormTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
              />
            </Box>

            {/* Giờ kết thúc (tự tính) */}
            {computedEndAt && (
              <Box sx={{ bgcolor: darkMode ? 'rgba(21,101,192,0.08)' : '#f0f7ff', borderRadius: 2, p: 1.5, border: `1px solid ${darkMode ? 'rgba(21,101,192,0.2)' : '#e3f2fd'}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AccessTimeIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                <Box>
                  <Typography sx={{ fontSize: '0.78rem', color: colors.textMuted }}>Giờ kết thúc (tự tính = thời lượng phim + 30 phút dọn phòng)</Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1565c0' }}>
                    {computedEndAt.toLocaleDateString('vi-VN')} — {computedEndAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Divider */}
            <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle} ` }} />

            {/* === Section 3: Giá vé & Ghế === */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Giá vé & thông tin ghế
            </Typography>
            <TextField
              label="Giá vé cơ bản (VNĐ)" type="number" size="small" fullWidth
              value={formPrice} onChange={(e) => setFormPrice(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">đ</InputAdornment>
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
            />

            {/* Giá theo loại ghế + số lượng */}
            <Box sx={{
              bgcolor: darkMode ? 'rgba(21,101,192,0.05)' : '#fafbfc',
              borderRadius: 2, p: 1.5, border: `1px solid ${colors.borderSubtle}`
            }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: colors.textSecondary, mb: 1.5 }}>
                Giá vé theo loại ghế (để trống = giá cơ bản)
              </Typography>
              {(() => {
                let standard = 0, vip = 0, couple = 0;
                if (selectedRoomDetail?.seatMap) {
                  selectedRoomDetail.seatMap.forEach(row => {
                    row.seats.forEach(s => {
                      if (s.type === 'vip') vip++;
                      else if (s.type === 'couple') couple++;
                      else standard++;
                    });
                  });
                }
                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Ghế Thường */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 120 }}>
                        <Chip label="Thường" size="small" sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#e3f2fd', color: '#5C8EC6' }} />
                        {selectedRoomDetail && (
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#5C8EC6' }}>
                            ({standard} ghế)
                          </Typography>
                        )}
                      </Box>
                      <TextField
                        type="number" size="small" fullWidth
                        value={formPriceStandard} onChange={(e) => setFormPriceStandard(e.target.value)}
                        placeholder={formPrice || 'VD: 75000'}
                        InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment> }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
                      />
                    </Box>
                    {/* Ghế VIP */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 120 }}>
                        <Chip label="VIP" size="small" sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#fff8e1', color: '#F5A623' }} />
                        {selectedRoomDetail && (
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#F5A623' }}>
                            ({vip} ghế)
                          </Typography>
                        )}
                      </Box>
                      <TextField
                        type="number" size="small" fullWidth
                        value={formPriceVip} onChange={(e) => setFormPriceVip(e.target.value)}
                        placeholder={formPrice ? String(Math.round(Number(formPrice) * 1.5)) : 'VD: 100000'}
                        InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment> }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
                      />
                    </Box>
                    {/* Ghế Đôi */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 120 }}>
                        <Chip label="Đôi" size="small" sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#e0f7fa', color: '#4DD0C8' }} />
                        {selectedRoomDetail && (
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#4DD0C8' }}>
                            ({couple} ghế)
                          </Typography>
                        )}
                      </Box>
                      <TextField
                        type="number" size="small" fullWidth
                        value={formPriceCouple} onChange={(e) => setFormPriceCouple(e.target.value)}
                        placeholder={formPrice ? String(Math.round(Number(formPrice) * 2)) : 'VD: 150000'}
                        InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment> }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
                      />
                    </Box>
                  </Box>
                );
              })()}
            </Box>

            {/* Divider */}
            <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />

            {/* === Section 4: Trạng thái === */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Trạng thái & Ghế bảo trì
            </Typography>
            <TextField
              select label="Trạng thái suất chiếu" size="small" fullWidth
              value={formStatus} onChange={(e) => setFormStatus(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
            >
              <MenuItem value="NOW">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Đang chiếu" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#e8f5e9', color: '#4caf50' }} /> Đang chiếu
                </Box>
              </MenuItem>
              <MenuItem value="COMING">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Sắp chiếu" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#e3f2fd', color: '#1565c0' }} /> Sắp chiếu
                </Box>
              </MenuItem>
              <MenuItem value="STOP">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Ngưng chiếu" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#ffebee', color: '#f44336' }} /> Ngưng chiếu
                </Box>
              </MenuItem>
            </TextField>

            {/* Ghế bảo trì */}
            {allSeatsInRoom.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: colors.textPrimary, mb: 1 }}>
                  Ghế bảo trì / hỏng ({formMaintenanceSeats.length} ghế đã chọn)
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted, mb: 1 }}>
                  Click để chọn / bỏ chọn ghế hỏng cho suất chiếu này
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 160, overflowY: 'auto', p: 1, borderRadius: 2, border: `1px solid ${colors.borderSubtle}`, bgcolor: darkMode ? 'rgba(0,0,0,0.1)' : '#fafafa' }}>
                  {allSeatsInRoom.map(seat => {
                    const isSelected = formMaintenanceSeats.includes(seat.name);
                    return (
                      <Chip
                        key={seat.name}
                        label={seat.name}
                        size="small"
                        onClick={() => {
                          setFormMaintenanceSeats(prev =>
                            isSelected ? prev.filter(s => s !== seat.name) : [...prev, seat.name]
                          );
                        }}
                        sx={{
                          height: 26, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                          bgcolor: isSelected ? '#ffebee' : (darkMode ? 'rgba(255,255,255,0.08)' : '#fff'),
                          color: isSelected ? '#e53935' : colors.textSecondary,
                          border: `1px solid ${isSelected ? '#e53935' : colors.borderSubtle}`,
                          '&:hover': { bgcolor: isSelected ? '#ffcdd2' : (darkMode ? 'rgba(255,255,255,0.12)' : '#f5f5f5') }
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setOpenCreate(false)}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}
          >
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating || !formMovie || !formRoom || !formDate || !formTime || !formPrice}
            startIcon={creating ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <AddIcon />}
            sx={{
              bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5,
              '&:hover': { bgcolor: '#163f78' },
              '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' }
            }}
          >
            {creating ? 'Đang tạo...' : 'Tạo suất chiếu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DELETE DIALOG === */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })}
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary }}>
          Xóa suất chiếu?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.textSecondary }}>
            Bạn có chắc muốn xóa suất chiếu
            {deleteDialog.item && ` "${deleteDialog.item.movieId?.title}" lúc ${fmtTime(deleteDialog.item.startAt)} `}?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, item: null })} sx={{ color: colors.textMuted, textTransform: 'none' }}>
            Huỷ
          </Button>
          <Button
            variant="contained" color="error"
            onClick={handleDelete}
            disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            {deleting ? <CircularProgress size={20} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminShowtimePage;
