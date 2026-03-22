import { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress,
  TextField, MenuItem, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  IconButton, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getAllRoomsAPI, createRoomAPI, updateRoomAPI, deleteRoomAPI } from '../../../apis/roomApi';
import { getAllCinemasAPI } from '../../../apis/cinemaApi';
import { useToast } from '../../../contexts/ToastContext';

// Card style
const getCardSx = (colors) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

// Loại phòng chip colors
const TYPE_MAP = {
  '2D': { color: '#5C8EC6', bg: '#e3f2fd' },
  '3D': { color: '#F5A623', bg: '#fff8e1' },
  'IMAX': { color: '#e91e63', bg: '#fce4ec' }
};

const AdminRoomPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const { showToast } = useToast();
  const cardSx = getCardSx(colors);

  // State
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Add room modal
  const [openAddRoom, setOpenAddRoom] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const [newRoomCinema, setNewRoomCinema] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('2D');
  const [newRoomStatus, setNewRoomStatus] = useState('ACTIVE');
  const [creating, setCreating] = useState(false);

  // Edit room modal
  const [openEditRoom, setOpenEditRoom] = useState(false);
  const [editRoomId, setEditRoomId] = useState('');
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomType, setEditRoomType] = useState('2D');
  const [editRoomStatus, setEditRoomStatus] = useState('ACTIVE');
  const [editing, setEditing] = useState(false);

  // Delete confirm modal
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  // Fetch rooms
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await getAllRoomsAPI();
      setRooms(res.data?.rooms || []);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  // Fetch cinemas khi mở modal
  useEffect(() => {
    if (openAddRoom && cinemas.length === 0) {
      getAllCinemasAPI()
        .then(res => setCinemas(res.data?.cinemas || []))
        .catch(() => setCinemas([]));
    }
  }, [openAddRoom]);

  // Filter
  const filteredRooms = useMemo(() => {
    let result = rooms;
    if (filterType !== 'all') result = result.filter(r => r.type === filterType);
    if (filterStatus !== 'all') result = result.filter(r => r.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(q));
    }
    return result;
  }, [rooms, filterType, filterStatus, searchQuery]);

  // No-outline sx for TextFields
  const noOutlineSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, fontSize: '0.85rem',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
    }
  };

  // Tạo phòng mới
  const handleCreateRoom = async () => {
    if (!newRoomCinema || !newRoomName.trim()) return;
    setCreating(true);
    try {
      await createRoomAPI({
        cinemaId: newRoomCinema,
        name: newRoomName.trim(),
        type: newRoomType,
        status: newRoomStatus
      });
      setOpenAddRoom(false);
      setNewRoomCinema(''); setNewRoomName(''); setNewRoomType('2D'); setNewRoomStatus('ACTIVE');
      fetchRooms();
      showToast('Tạo phòng thành công!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi tạo phòng!', 'error');
    } finally {
      setCreating(false);
    }
  };

  // Mở modal sửa phòng
  const openEditModal = (room) => {
    setEditRoomId(room._id);
    setEditRoomName(room.name);
    setEditRoomType(room.type || '2D');
    setEditRoomStatus(room.status || 'ACTIVE');
    setOpenEditRoom(true);
  };

  // Sửa phòng
  const handleEditRoom = async () => {
    if (!editRoomName.trim()) return;
    setEditing(true);
    try {
      await updateRoomAPI(editRoomId, {
        name: editRoomName.trim(),
        type: editRoomType,
        status: editRoomStatus
      });
      setOpenEditRoom(false);
      fetchRooms();
      showToast('Cập nhật phòng thành công!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi sửa phòng!', 'error');
    } finally {
      setEditing(false);
    }
  };

  // Xóa phòng
  const handleDeleteRoom = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRoomAPI(deleteTarget.id);
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      fetchRooms();
      showToast('Xóa phòng thành công!', 'error');
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi xóa phòng!', 'error');
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* === HEADER === */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản lý Phòng Chiếu
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            {rooms.length} phòng
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddRoom(true)}
          sx={{
            bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5,
            '&:hover': { bgcolor: '#163f78' }
          }}
        >
          Thêm phòng
        </Button>
      </Box>

      {/* === MAIN CARD === */}
      <Card sx={{ ...cardSx }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>

          {/* Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: '1rem' }}>
              Danh Sách Phòng
            </Typography>
          </Box>

          <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}`, mb: 2 }} />

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              select size="small" value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ minWidth: 140, ...noOutlineSx }}
            >
              <MenuItem value="all">Tất cả loại</MenuItem>
              <MenuItem value="2D">2D</MenuItem>
              <MenuItem value="3D">3D</MenuItem>
              <MenuItem value="IMAX">IMAX</MenuItem>
            </TextField>

            <TextField
              select size="small" value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 160, ...noOutlineSx }}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="ACTIVE">Hoạt động</MenuItem>
              <MenuItem value="MAINTENANCE">Bảo trì</MenuItem>
            </TextField>

            <TextField
              size="small"
              placeholder="Tìm kiếm theo tên phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment>
              }}
              sx={{ flex: 1, minWidth: 200, ...noOutlineSx }}
            />
          </Box>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 600, tableLayout: 'fixed', '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1.2, verticalAlign: 'middle' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 50 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 130 }}>Tên Phòng</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 130 }}>Rạp</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Loại phòng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Tổng ghế</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Tình trạng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRooms.length > 0 ? filteredRooms.map((room, idx) => {
                    const typeStyle = TYPE_MAP[room.type] || TYPE_MAP['2D'];
                    return (
                      <TableRow key={room._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                        <TableCell sx={{ fontSize: '0.8rem', color: colors.textMuted }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{room.name}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{room.cinemaId?.name || '—'}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={room.type || '2D'}
                            size="small"
                            sx={{
                              height: 24, fontSize: '0.72rem', fontWeight: 600,
                              bgcolor: darkMode ? 'transparent' : typeStyle.bg,
                              color: typeStyle.color,
                              border: darkMode ? `1px solid ${typeStyle.color}` : 'none',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {room.totalSeats || 0}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={room.status === 'ACTIVE' ? 'Hoạt động' : 'Bảo trì'}
                            size="small"
                            sx={{
                              height: 24, fontSize: '0.72rem', fontWeight: 600,
                              bgcolor: room.status === 'ACTIVE'
                                ? (darkMode ? 'transparent' : '#e8f5e9')
                                : (darkMode ? 'transparent' : '#fff3e0'),
                              color: room.status === 'ACTIVE' ? '#4caf50' : '#ff9800',
                              border: darkMode ? `1px solid ${room.status === 'ACTIVE' ? '#4caf50' : '#ff9800'}` : 'none',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Sửa">
                              <IconButton size="small" onClick={() => openEditModal(room)} sx={{ color: '#1565c0' }}>
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton size="small" onClick={() => { setDeleteTarget({ id: room._id, name: room.name }); setOpenDeleteConfirm(true); }} sx={{ color: '#e53935' }}>
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ color: colors.textMuted }}>
                          Không tìm thấy phòng nào
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

      {/* === ADD ROOM DIALOG === */}
      <Dialog open={openAddRoom} onClose={() => setOpenAddRoom(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          Thêm Phòng Mới
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            Tạo phòng chiếu mới cho rạp
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

            {/* Chọn rạp */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Rạp chiếu
            </Typography>
            <TextField
              select label="Chọn rạp" size="small" fullWidth value={newRoomCinema}
              onChange={(e) => setNewRoomCinema(e.target.value)}
              sx={{ ...noOutlineSx }}
            >
              {cinemas.map(c => (
                <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
              ))}
            </TextField>

            <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />

            {/* Thông tin phòng */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Thông tin phòng
            </Typography>

            <TextField
              label="Tên phòng" size="small" fullWidth
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              sx={{ ...noOutlineSx }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select label="Loại phòng" size="small" fullWidth value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value)}
                sx={{ ...noOutlineSx }}
              >
                <MenuItem value="2D">
                  <Chip label="2D" size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#e3f2fd', color: '#5C8EC6', mr: 1 }} /> 2D
                </MenuItem>
                <MenuItem value="3D">
                  <Chip label="3D" size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#fff8e1', color: '#F5A623', mr: 1 }} /> 3D
                </MenuItem>
                <MenuItem value="IMAX">
                  <Chip label="IMAX" size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#fce4ec', color: '#e91e63', mr: 1 }} /> IMAX
                </MenuItem>
              </TextField>

              <TextField
                select label="Trạng thái" size="small" fullWidth value={newRoomStatus}
                onChange={(e) => setNewRoomStatus(e.target.value)}
                sx={{ ...noOutlineSx }}
              >
                <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                <MenuItem value="MAINTENANCE">Bảo trì</MenuItem>
              </TextField>
            </Box>

            {/* Preview */}
            {newRoomCinema && newRoomName.trim() && (
              <Box sx={{
                bgcolor: darkMode ? 'rgba(21,101,192,0.08)' : '#f0f7ff',
                borderRadius: 2, p: 1.5, border: `1px solid ${darkMode ? 'rgba(21,101,192,0.2)' : '#e3f2fd'}`
              }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                  Xem trước
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                    Phòng: <b>{newRoomName}</b>
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                    Rạp: <b>{cinemas.find(c => c._id === newRoomCinema)?.name || '—'}</b>
                  </Typography>
                  <Chip label={newRoomType} size="small" sx={{
                    height: 20, fontSize: '0.68rem', fontWeight: 600,
                    bgcolor: TYPE_MAP[newRoomType]?.bg, color: TYPE_MAP[newRoomType]?.color
                  }} />
                  <Chip label={newRoomStatus === 'ACTIVE' ? 'Hoạt động' : 'Bảo trì'} size="small" sx={{
                    height: 20, fontSize: '0.68rem', fontWeight: 600,
                    bgcolor: newRoomStatus === 'ACTIVE' ? '#e8f5e9' : '#fff3e0',
                    color: newRoomStatus === 'ACTIVE' ? '#4caf50' : '#ff9800'
                  }} />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setOpenAddRoom(false)}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}
          >
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateRoom}
            disabled={creating || !newRoomCinema || !newRoomName.trim()}
            startIcon={creating ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <AddIcon />}
            sx={{
              bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5,
              '&:hover': { bgcolor: '#163f78' },
              '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' }
            }}
          >
            {creating ? 'Đang tạo...' : 'Tạo phòng'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === EDIT ROOM DIALOG === */}
      <Dialog open={openEditRoom} onClose={() => setOpenEditRoom(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          Sửa Phòng
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Tên phòng" size="small" fullWidth
              value={editRoomName}
              onChange={(e) => setEditRoomName(e.target.value)}
              sx={{ ...noOutlineSx }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select label="Loại phòng" size="small" fullWidth value={editRoomType}
                onChange={(e) => setEditRoomType(e.target.value)}
                sx={{ ...noOutlineSx }}
              >
                <MenuItem value="2D">2D</MenuItem>
                <MenuItem value="3D">3D</MenuItem>
                <MenuItem value="IMAX">IMAX</MenuItem>
              </TextField>
              <TextField
                select label="Trạng thái" size="small" fullWidth value={editRoomStatus}
                onChange={(e) => setEditRoomStatus(e.target.value)}
                sx={{ ...noOutlineSx }}
              >
                <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                <MenuItem value="MAINTENANCE">Bảo trì</MenuItem>
              </TextField>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setOpenEditRoom(false)}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}
          >
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleEditRoom}
            disabled={editing || !editRoomName.trim()}
            startIcon={editing ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <EditIcon />}
            sx={{
              bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5,
              '&:hover': { bgcolor: '#163f78' },
              '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' }
            }}
          >
            {editing ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DELETE CONFIRM DIALOG === */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: '#e53935', pb: 0.5, fontSize: '1.15rem' }}>
          <WarningAmberIcon sx={{ color: '#ff9800', fontSize: 28 }} />
          Xác nhận xóa phòng
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: colors.textPrimary, mt: 1 }}>
            Bạn có chắc chắn muốn xóa phòng <b>"{deleteTarget?.name}"</b> không?
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, mt: 1 }}>
            Tất cả dữ liệu ghế và suất chiếu liên quan sẽ bị ảnh hưởng. Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setOpenDeleteConfirm(false)}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}
          >
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteRoom}
            startIcon={<DeleteIcon />}
            sx={{
              bgcolor: '#e53935', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5,
              '&:hover': { bgcolor: '#c62828' }
            }}
          >
            Xóa phòng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminRoomPage;
