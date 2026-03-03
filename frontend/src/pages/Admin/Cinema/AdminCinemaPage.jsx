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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { getAllCinemasAPI, createCinemaAPI, updateCinemaAPI, deleteCinemaAPI } from '../../../apis/cinemaApi';

// Card style
const getCardSx = (colors) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

// Status chip config
const STATUS_MAP = {
  OPEN: { label: 'Đang mở', color: '#4caf50', bg: '#e8f5e9' },
  CLOSED: { label: 'Đã đóng', color: '#f44336', bg: '#ffebee' },
  MAINTENANCE: { label: 'Bảo trì', color: '#ff9800', bg: '#fff3e0' }
};

const AdminCinemaPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const cardSx = getCardSx(colors);

  // State
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('all');

  // Add cinema modal
  const [openAdd, setOpenAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Hà Nội');
  const [newPhone, setNewPhone] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState('OPEN');
  const [creating, setCreating] = useState(false);

  // Edit cinema modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('OPEN');
  const [editing, setEditing] = useState(false);

  // Delete confirm
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // No-outline sx
  const noOutlineSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, fontSize: '0.85rem',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
    }
  };

  // Fetch
  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const res = await getAllCinemasAPI();
      setCinemas(res.data?.cinemas || []);
    } catch {
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCinemas(); }, []);

  // Cities list
  const cityList = useMemo(() => {
    const cities = [...new Set(cinemas.map(c => c.city).filter(Boolean))];
    return cities.sort();
  }, [cinemas]);

  // Filter
  const filteredCinemas = useMemo(() => {
    let result = cinemas;
    if (filterStatus !== 'all') result = result.filter(c => c.status === filterStatus);
    if (filterCity !== 'all') result = result.filter(c => c.city === filterCity);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [cinemas, filterStatus, filterCity, searchQuery]);

  // Create
  const handleCreate = async () => {
    if (!newName.trim() || !newAddress.trim() || !newPhone.trim()) return;
    setCreating(true);
    try {
      await createCinemaAPI({
        name: newName.trim(),
        address: newAddress.trim(),
        city: newCity.trim(),
        phone: newPhone.trim(),
        description: newDescription.trim(),
        status: newStatus
      });
      setOpenAdd(false);
      setNewName(''); setNewAddress(''); setNewCity('Hà Nội'); setNewPhone(''); setNewDescription(''); setNewStatus('OPEN');
      fetchCinemas();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi tạo rạp!');
    } finally {
      setCreating(false);
    }
  };

  // Open edit
  const openEditModal = (cinema) => {
    setEditId(cinema._id);
    setEditName(cinema.name);
    setEditAddress(cinema.address || '');
    setEditCity(cinema.city || '');
    setEditPhone(cinema.phone || '');
    setEditDescription(cinema.description || '');
    setEditStatus(cinema.status || 'OPEN');
    setOpenEdit(true);
  };

  // Edit
  const handleEdit = async () => {
    if (!editName.trim() || !editAddress.trim() || !editPhone.trim()) return;
    setEditing(true);
    try {
      await updateCinemaAPI(editId, {
        name: editName.trim(),
        address: editAddress.trim(),
        city: editCity.trim(),
        phone: editPhone.trim(),
        description: editDescription.trim(),
        status: editStatus
      });
      setOpenEdit(false);
      fetchCinemas();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi sửa rạp!');
    } finally {
      setEditing(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCinemaAPI(deleteTarget.id);
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      fetchCinemas();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xóa rạp!');
    }
  };

  // Form fields component (reuse for add/edit)
  const renderFormFields = (name, setName, address, setAddress, city, setCity, phone, setPhone, description, setDescription, status, setStatus) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
        Thông tin rạp
      </Typography>

      <TextField label="Tên rạp *" size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)}
        placeholder="VD: NMN Cinema Hà Nội" sx={{ ...noOutlineSx }} />

      <TextField label="Địa chỉ *" size="small" fullWidth value={address} onChange={(e) => setAddress(e.target.value)}
        placeholder="VD: 123 Đường ABC, Quận XYZ"
        InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
        sx={{ ...noOutlineSx }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Thành phố *" size="small" fullWidth value={city} onChange={(e) => setCity(e.target.value)}
          placeholder="VD: Hà Nội" sx={{ ...noOutlineSx }} />
        <TextField label="Hotline *" size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="VD: 0123456789"
          InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
          sx={{ ...noOutlineSx }} />
      </Box>

      <TextField label="Mô tả" size="small" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
        placeholder="Mô tả ngắn về rạp..." sx={{ ...noOutlineSx }} />

      <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
        Trạng thái
      </Typography>
      <TextField select label="Trạng thái" size="small" fullWidth value={status} onChange={(e) => setStatus(e.target.value)} sx={{ ...noOutlineSx }}>
        <MenuItem value="OPEN">Đang mở</MenuItem>
        <MenuItem value="CLOSED">Đã đóng</MenuItem>
        <MenuItem value="MAINTENANCE">Bảo trì</MenuItem>
      </TextField>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* === HEADER === */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản lý Rạp Chiếu Phim
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            {cinemas.length} rạp
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAdd(true)}
          sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' } }}>
          Thêm rạp
        </Button>
      </Box>

      {/* === MAIN CARD === */}
      <Card sx={{ ...cardSx }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: '1rem' }}>Danh Sách Rạp</Typography>
          </Box>
          <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}`, mb: 2 }} />

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField select size="small" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 160, ...noOutlineSx }}>
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="OPEN">Đang mở</MenuItem>
              <MenuItem value="CLOSED">Đã đóng</MenuItem>
              <MenuItem value="MAINTENANCE">Bảo trì</MenuItem>
            </TextField>

            <TextField select size="small" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} sx={{ minWidth: 150, ...noOutlineSx }}>
              <MenuItem value="all">Tất cả thành phố</MenuItem>
              {cityList.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>

            <TextField size="small" placeholder="Tìm kiếm theo tên hoặc địa chỉ..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
              sx={{ flex: 1, minWidth: 200, ...noOutlineSx }}
            />
          </Box>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={36} /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 700, tableLayout: 'fixed', '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1.2, verticalAlign: 'middle' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 45 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 160 }}>Tên Rạp</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 200 }}>Địa chỉ</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Thành phố</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Hotline</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 70 }}>Phòng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 90 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCinemas.length > 0 ? filteredCinemas.map((cinema, idx) => {
                    const statusStyle = STATUS_MAP[cinema.status] || STATUS_MAP.OPEN;
                    return (
                      <TableRow key={cinema._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                        <TableCell sx={{ fontSize: '0.8rem', color: colors.textMuted }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{cinema.name}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>{cinema.address || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{cinema.city || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{cinema.phone || '—'}</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {cinema.rooms?.length || 0}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={statusStyle.label} size="small" sx={{
                            height: 24, fontSize: '0.72rem', fontWeight: 600,
                            bgcolor: darkMode ? 'transparent' : statusStyle.bg,
                            color: statusStyle.color,
                            border: darkMode ? `1px solid ${statusStyle.color}` : 'none',
                            '& .MuiChip-label': { px: 1 }
                          }} />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Sửa">
                              <IconButton size="small" onClick={() => openEditModal(cinema)} sx={{ color: '#1565c0' }}>
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton size="small" onClick={() => { setDeleteTarget({ id: cinema._id, name: cinema.name }); setOpenDeleteConfirm(true); }} sx={{ color: '#e53935' }}>
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ color: colors.textMuted }}>Không tìm thấy rạp nào</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* === ADD CINEMA DIALOG === */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          Thêm Rạp Mới
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            Tạo rạp chiếu phim mới
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {renderFormFields(newName, setNewName, newAddress, setNewAddress, newCity, setNewCity, newPhone, setNewPhone, newDescription, setNewDescription, newStatus, setNewStatus)}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenAdd(false)} sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Huỷ</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={creating || !newName.trim() || !newAddress.trim() || !newPhone.trim()}
            startIcon={creating ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <AddIcon />}
            sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}>
            {creating ? 'Đang tạo...' : 'Tạo rạp'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === EDIT CINEMA DIALOG === */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          Sửa Rạp
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {renderFormFields(editName, setEditName, editAddress, setEditAddress, editCity, setEditCity, editPhone, setEditPhone, editDescription, setEditDescription, editStatus, setEditStatus)}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenEdit(false)} sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Huỷ</Button>
          <Button variant="contained" onClick={handleEdit}
            disabled={editing || !editName.trim() || !editAddress.trim() || !editPhone.trim()}
            startIcon={editing ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <EditIcon />}
            sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}>
            {editing ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DELETE CONFIRM DIALOG === */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: '#e53935', pb: 0.5, fontSize: '1.15rem' }}>
          <WarningAmberIcon sx={{ color: '#ff9800', fontSize: 28 }} />
          Xác nhận xóa rạp
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: colors.textPrimary, mt: 1 }}>
            Bạn có chắc chắn muốn xóa rạp <b>"{deleteTarget?.name}"</b> không?
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, mt: 1 }}>
            Tất cả phòng chiếu, ghế, và suất chiếu thuộc rạp này sẽ bị ảnh hưởng. Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Huỷ</Button>
          <Button variant="contained" onClick={handleDelete} startIcon={<DeleteIcon />}
            sx={{ bgcolor: '#e53935', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#c62828' } }}>
            Xóa rạp
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCinemaPage;
