import { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Avatar, CircularProgress,
  TextField, MenuItem, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  IconButton, Tooltip, FormControl, InputLabel, Select, OutlinedInput
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { getAllCombosAPI, createComboAPI, updateComboAPI, deleteComboAPI } from '../../../apis/comboApi';
import { getAllMoviesAPI } from '../../../apis/movieApi';

// Card style — giống AdminCinemaPage / AdminRoomPage
const getCardSx = (colors) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

// Status chip colors
const STATUS_MAP = {
  ACTIVE: { label: 'Đang bán', color: '#2e7d32', bg: '#e8f5e9' },
  INACTIVE: { label: 'Ngừng bán', color: '#c62828', bg: '#ffebee' }
};

const AdminComboPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const cardSx = getCardSx(colors);

  // No-outline input sx — giống Cinema/Room
  const noOutlineSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, fontSize: '0.85rem',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
    }
  };

  // State
  const [combos, setCombos] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Add/Edit dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [formMovieIds, setFormMovieIds] = useState([]);
  const [formItems, setFormItems] = useState([{ name: '', quantity: 1 }]);

  // Fetch
  useEffect(() => { fetchCombos(); fetchMovies(); }, []);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const res = await getAllCombosAPI();
      setCombos(res.data?.combos || []);
    } catch { setCombos([]); }
    finally { setLoading(false); }
  };

  const fetchMovies = async () => {
    try {
      const res = await getAllMoviesAPI({ limit: 200 });
      setMovies(res.data?.movies || []);
    } catch { setMovies([]); }
  };

  // Filter
  const filteredCombos = useMemo(() => {
    let result = combos;
    if (filterStatus !== 'all') result = result.filter(c => c.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [combos, filterStatus, searchQuery]);

  // Reset form
  const resetForm = () => {
    setFormName(''); setFormDescription(''); setFormPrice('');
    setFormImageUrl(''); setFormStatus('ACTIVE'); setFormMovieIds([]);
    setFormItems([{ name: '', quantity: 1 }]);
    setIsEdit(false); setCurrentId(null);
  };

  // Open add
  const handleOpenAdd = () => { resetForm(); setOpenDialog(true); };

  // Open edit
  const handleOpenEdit = (c) => {
    setFormName(c.name || '');
    setFormDescription(c.description || '');
    setFormPrice(c.price || '');
    setFormImageUrl(c.imageUrl || '');
    setFormStatus(c.status || 'ACTIVE');
    setFormMovieIds(c.movieIds?.map(m => m._id || m) || []);
    setFormItems(c.items?.length > 0 ? c.items.map(i => ({ name: i.name, quantity: i.quantity })) : [{ name: '', quantity: 1 }]);
    setCurrentId(c._id);
    setIsEdit(true);
    setOpenDialog(true);
  };

  // Items management
  const handleItemChange = (idx, field, val) => {
    const newItems = [...formItems];
    newItems[idx][field] = field === 'quantity' ? Number(val) : val;
    setFormItems(newItems);
  };
  const handleAddItem = () => setFormItems([...formItems, { name: '', quantity: 1 }]);
  const handleRemoveItem = (idx) => {
    const newItems = formItems.filter((_, i) => i !== idx);
    setFormItems(newItems.length > 0 ? newItems : [{ name: '', quantity: 1 }]);
  };

  // Submit
  const handleSubmit = async () => {
    if (!formName.trim() || !formPrice) return;
    setSubmitting(true);
    try {
      const validItems = formItems.filter(i => i.name.trim() !== '');
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        price: Number(formPrice),
        imageUrl: formImageUrl.trim(),
        status: formStatus,
        movieIds: formMovieIds,
        items: validItems
      };
      console.log('=== COMBO SUBMIT ===');
      console.log('isEdit:', isEdit, 'currentId:', currentId);
      console.log('payload:', JSON.stringify(payload, null, 2));
      let result;
      if (isEdit) result = await updateComboAPI(currentId, payload);
      else result = await createComboAPI(payload);
      console.log('API response:', JSON.stringify(result, null, 2));
      setOpenDialog(false);
      resetForm();
      fetchCombos();
    } catch (err) {
      console.error('Submit error:', err.response?.data || err);
      alert(err.response?.data?.message || 'Lỗi khi lưu combo!');
    } finally { setSubmitting(false); }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteComboAPI(deleteTarget.id);
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      fetchCombos();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xóa combo!');
    }
  };

  // Reusable form fields
  const renderFormFields = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

      {/* Section: Thông tin cơ bản */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
        Thông tin cơ bản
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Tên Combo *" size="small" fullWidth value={formName}
          onChange={e => setFormName(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><FastfoodIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
          sx={{ ...noOutlineSx }} />
        <TextField label="Giá tiền (VNĐ) *" size="small" fullWidth type="number" value={formPrice}
          onChange={e => setFormPrice(e.target.value)}
          InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment> }}
          sx={{ ...noOutlineSx }} />
      </Box>

      <TextField label="Mô tả" size="small" fullWidth multiline rows={2} value={formDescription}
        onChange={e => setFormDescription(e.target.value)} placeholder="Mô tả ngắn về combo..."
        sx={{ ...noOutlineSx }} />

      <TextField label="Link Ảnh (URL)" size="small" fullWidth value={formImageUrl}
        onChange={e => setFormImageUrl(e.target.value)} placeholder="https://example.com/image.jpg"
        sx={{ ...noOutlineSx }} />

      <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />

      {/* Section: Phim áp dụng & Trạng thái */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
        Phim áp dụng & Trạng thái
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl fullWidth size="small" sx={{ ...noOutlineSx }}>
          <InputLabel id="movie-select-label">Phim áp dụng (Trống = Tất cả phim)</InputLabel>
          <Select
            labelId="movie-select-label"
            multiple
            value={formMovieIds}
            onChange={(e) => setFormMovieIds(e.target.value)}
            input={<OutlinedInput label="Phim áp dụng (Trống = Tất cả phim)" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const movie = movies.find(m => (m._id || m.id) === value);
                  return <Chip key={value} label={movie?.title || value} size="small"
                    sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#e3f2fd', color: '#1565c0' }} />;
                })}
              </Box>
            )}
          >
            {movies.map((movie) => (
              <MenuItem key={movie._id} value={movie._id} sx={{ fontSize: '0.85rem' }}>
                {movie.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField select label="Trạng thái" size="small" fullWidth value={formStatus}
          onChange={e => setFormStatus(e.target.value)} sx={{ ...noOutlineSx }}>
          <MenuItem value="ACTIVE">Đang bán</MenuItem>
          <MenuItem value="INACTIVE">Ngừng bán</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />

      {/* Section: Các món trong Combo */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
        Các món trong Combo
      </Typography>

      <Box sx={{ border: `1px solid ${colors.borderSubtle}`, borderRadius: 2, p: 2, bgcolor: darkMode ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
        {formItems.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
            <TextField label={`Tên món ${index + 1}`} size="small" fullWidth
              value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)}
              sx={{ ...noOutlineSx }} />
            <TextField label="SL" type="number" size="small" value={item.quantity}
              onChange={e => handleItemChange(index, 'quantity', e.target.value)}
              sx={{ width: 80, ...noOutlineSx }} />
            <Tooltip title="Xóa món">
              <IconButton size="small" onClick={() => handleRemoveItem(index)} sx={{ color: '#e53935' }}>
                <RemoveCircleOutlineIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddItem}
          sx={{ mt: 0.5, textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#1565c0', color: '#1565c0', fontSize: '0.78rem' }}>
          Thêm món
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* === HEADER === */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản lý Đồ ăn / Combo
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            {combos.length} combo — Danh sách đồ ăn, nước uống cho các bộ phim
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}
          sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' } }}>
          Thêm Combo
        </Button>
      </Box>

      {/* === MAIN CARD === */}
      <Card sx={{ ...cardSx }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: '1rem' }}>Danh Sách Combo</Typography>
          </Box>
          <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}`, mb: 2 }} />

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField select size="small" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 160, ...noOutlineSx }}>
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="ACTIVE">Đang bán</MenuItem>
              <MenuItem value="INACTIVE">Ngừng bán</MenuItem>
            </TextField>

            <TextField size="small" placeholder="Tìm kiếm theo tên combo..." value={searchQuery}
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
              <Table size="small" sx={{ minWidth: 800, tableLayout: 'fixed', '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1.2, verticalAlign: 'middle' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 45 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 60 }}>Ảnh</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 180 }}>Tên Combo</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Giá</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 200 }}>Các món</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 160 }}>Phim áp dụng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 90 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCombos.length > 0 ? filteredCombos.map((combo, idx) => {
                    const statusStyle = STATUS_MAP[combo.status] || STATUS_MAP.ACTIVE;
                    return (
                      <TableRow key={combo._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                        <TableCell sx={{ fontSize: '0.8rem', color: colors.textMuted }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Avatar src={combo.imageUrl} variant="rounded"
                            sx={{ width: 44, height: 44, bgcolor: 'transparent', fontSize: '0.7rem' }}>
                            <FastfoodIcon sx={{ fontSize: 22, color: colors.textMuted }} />
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: colors.textPrimary }}>{combo.name}</Typography>
                          {combo.description && (
                            <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mt: 0.2, lineHeight: 1.3 }}>
                              {combo.description.length > 50 ? combo.description.substring(0, 50) + '...' : combo.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#d32f2f' }}>
                          {combo.price?.toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell>
                          {combo.items?.map((item, i) => (
                            <Typography key={i} variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.78rem', lineHeight: 1.5 }}>
                              • {item.quantity} x {item.name}
                            </Typography>
                          ))}
                        </TableCell>
                        <TableCell>
                          {combo.movieIds?.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                              {combo.movieIds.slice(0, 2).map(m => (
                                <Typography key={m._id || m} variant="body2" sx={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                                  {m.title || 'Phim'}
                                </Typography>
                              ))}
                              {combo.movieIds.length > 2 && (
                                <Typography variant="body2" sx={{ fontSize: '0.78rem', color: colors.textMuted }}>
                                  +{combo.movieIds.length - 2} phim khác
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ fontSize: '0.78rem', color: colors.textMuted }}>
                              Tất cả phim
                            </Typography>
                          )}
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
                              <IconButton size="small" onClick={() => handleOpenEdit(combo)} sx={{ color: '#1565c0' }}>
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton size="small" onClick={() => { setDeleteTarget({ id: combo._id, name: combo.name }); setOpenDeleteConfirm(true); }} sx={{ color: '#e53935' }}>
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
                        <Typography variant="body2" sx={{ color: colors.textMuted }}>Chưa có combo nào</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* === ADD/EDIT DIALOG === */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          {isEdit ? 'Cập nhật Combo' : 'Thêm Combo Mới'}
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            {isEdit ? 'Chỉnh sửa thông tin combo' : 'Thêm combo đồ ăn / nước uống mới'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {renderFormFields()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Huỷ</Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={submitting || !formName.trim() || !formPrice}
            startIcon={submitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : isEdit ? <EditIcon /> : <AddIcon />}
            sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo combo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DELETE CONFIRM DIALOG === */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: '#e53935', pb: 0.5, fontSize: '1.15rem' }}>
          <WarningAmberIcon sx={{ color: '#ff9800', fontSize: 28 }} />
          Xác nhận xóa combo
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: colors.textPrimary, mt: 1 }}>
            Bạn có chắc chắn muốn xóa combo <b>"{deleteTarget?.name}"</b> không?
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, mt: 1 }}>
            Combo sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Huỷ</Button>
          <Button variant="contained" onClick={handleDelete} startIcon={<DeleteIcon />}
            sx={{ bgcolor: '#e53935', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#c62828' } }}>
            Xóa combo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminComboPage;
