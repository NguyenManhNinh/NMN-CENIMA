import { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  IconButton, Tooltip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Avatar, Chip, TablePagination,
  InputAdornment, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  getActorsAPI, getDirectorsAPI, createPersonAPI, updatePersonAPI, deletePersonAPI
} from '../../../apis/personApi';

const ROLES = [
  { value: 'actor', label: 'Diễn viên' },
  { value: 'director', label: 'Đạo diễn' },
  { value: 'both', label: 'Cả hai' }
];
const getRoleLabel = (role) => ROLES.find(r => r.value === role)?.label || role;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const EMPTY_FORM = {
  name: '', nameEn: '', role: 'actor', photoUrl: '', posterUrl: '',
  birthDate: '', birthPlace: '', nationality: '', height: '',
  shortBio: '', fullBio: '', isActive: true,
  gallery: [], filmography: []
};

const AdminActorListPage = ({
  personRole = 'actor',
  pageTitle = 'Quản lý Diễn viên',
  pageSubtitle = 'Thêm, sửa, xóa diễn viên trong hệ thống',
  fetchAPI = getActorsAPI
}) => {
  const { darkMode, colors } = useAdminTheme();

  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const rowsPerPage = 10;

  // Modal thêm/sửa
  const [formDialog, setFormDialog] = useState({ open: false, editItem: null });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Dialog xóa
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(false);

  // Dialog chi tiết
  const [detailDialog, setDetailDialog] = useState({ open: false, person: null });
  // Dialog hình ảnh
  const [galleryDialog, setGalleryDialog] = useState({ open: false, images: [], name: '' });
  // Dialog phim đã tham gia
  const [filmoDialog, setFilmoDialog] = useState({ open: false, films: [], name: '' });

  const cardSx = {
    bgcolor: colors.bgCard, borderRadius: 2,
    border: `1px solid ${colors.borderCard}`, boxShadow: 'none'
  };
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: colors.bgInput, color: colors.textPrimary,
      '& fieldset': { borderColor: colors.borderSubtle },
      '&:hover fieldset': { borderColor: colors.borderSubtle },
      '&.Mui-focused fieldset': { borderColor: colors.borderSubtle, borderWidth: 1 }
    },
    '& .MuiInputLabel-root': { color: colors.textMuted },
    '& .MuiInputLabel-root.Mui-focused': { color: colors.textMuted }
  };

  // Fetch
  const fetchPersons = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: rowsPerPage, sort: '-createdAt' };
      if (search) params.search = search;
      const res = await fetchAPI(params);
      setPersons(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Lỗi tải danh sách:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchPersons(); }, [fetchPersons]);

  // Mở modal thêm
  const openAddModal = () => {
    setFormData({ ...EMPTY_FORM, role: personRole });
    setFormError('');
    setFormDialog({ open: true, editItem: null });
  };

  // Mở modal sửa
  const openEditModal = (person) => {
    setFormData({
      name: person.name || '',
      nameEn: person.nameEn || '',
      role: person.role || 'actor',
      photoUrl: person.photoUrl || '',
      posterUrl: person.posterUrl || '',
      birthDate: person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : '',
      birthPlace: person.birthPlace || '',
      nationality: person.nationality || '',
      height: person.height || '',
      shortBio: person.shortBio || '',
      fullBio: person.fullBio || '',
      isActive: person.isActive !== false,
      gallery: person.gallery || [],
      filmography: person.filmography || []
    });
    setFormError('');
    setFormDialog({ open: true, editItem: person });
  };

  const closeFormDialog = () => {
    setFormDialog({ open: false, editItem: null });
    setFormError('');
  };

  // Submit
  const handleSubmit = async () => {
    if (!formData.name.trim()) { setFormError('Vui lòng nhập tên'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      const data = { ...formData, name: formData.name.trim() };
      if (data.birthDate) data.birthDate = new Date(data.birthDate).toISOString();
      else delete data.birthDate;

      // Xóa các field rỗng để không ghi đè dữ liệu cũ
      const optionalFields = ['nameEn', 'photoUrl', 'posterUrl', 'birthPlace', 'nationality', 'height', 'shortBio', 'fullBio'];
      optionalFields.forEach(key => {
        if (data[key] === '' || data[key] === null || data[key] === undefined) delete data[key];
      });

      // Lọc gallery/filmography rỗng
      if (data.gallery) data.gallery = data.gallery.filter(g => g.url?.trim());
      if (data.filmography) data.filmography = data.filmography.filter(f => f.title?.trim());

      if (formDialog.editItem) {
        await updatePersonAPI(formDialog.editItem._id, data);
      } else {
        await createPersonAPI(data);
      }
      closeFormDialog();
      fetchPersons();
    } catch (err) {
      let msg = err.response?.data?.message || 'Có lỗi xảy ra!';
      if (msg.includes('duplicate') || msg.includes('E11000')) msg = 'Tên đã tồn tại!';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePersonAPI(deleteDialog.item._id);
      setDeleteDialog({ open: false, item: null });
      fetchPersons();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại!');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            {pageTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            {pageSubtitle}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Làm mới">
            <IconButton onClick={fetchPersons} sx={{ color: colors.textMuted }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAddModal}
            sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#1B4F93', '&:hover': { bgcolor: '#163f78' } }}>
            Thêm mới
          </Button>
        </Box>
      </Box>

      {/* Bộ lọc */}
      <Card sx={{ ...cardSx, mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField size="small" placeholder="Tìm kiếm theo tên..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment>
              }}
              sx={{ ...inputSx, minWidth: 250 }}
            />

            <Chip label={`${total} kết quả`} size="small"
              sx={{ fontSize: '0.75rem', bgcolor: 'rgba(25,118,210,0.1)', color: '#1976d2', fontWeight: 600 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Bảng */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={36} sx={{ color: colors.textMuted }} />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
              <Table size="small" sx={{
                '& .MuiTableCell-root': {
                  color: colors.textPrimary, borderColor: colors.borderSubtle,
                  py: 1.2, verticalAlign: 'middle', px: 2
                }
              }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', width: 56 }}>Ảnh</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Tên</TableCell>

                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', display: { xs: 'none', md: 'table-cell', whiteSpace: 'nowrap' } }}>Quốc tịch</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', display: { xs: 'none', lg: 'table-cell' } }}>Ngày sinh</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', display: { xs: 'none', lg: 'table-cell', whiteSpace: 'nowrap' } }}>Chiều cao</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', display: { xs: 'none', lg: 'table-cell' }, minWidth: 140 }}>Nơi sinh</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{personRole === 'director' ? 'Hình ảnh đạo diễn' : 'Hình ảnh diễn viên'}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Phim đã tham gia</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      Thích
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      Xem
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {persons.length > 0 ? persons.map((p, idx) => (
                    <TableRow key={p._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle }, transition: 'background-color 0.2s' }}>
                      <TableCell sx={{ fontSize: '0.82rem', fontWeight: 500, color: colors.textMuted }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Avatar src={p.photoUrl} sx={{ width: 36, height: 36 }}>{p.name?.[0]}</Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: colors.textPrimary, whiteSpace: 'nowrap' }}>{p.name}</Typography>
                        {p.nameEn && <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted, whiteSpace: 'nowrap' }}>{p.nameEn}</Typography>}
                      </TableCell>

                      <TableCell sx={{ fontSize: '0.82rem', display: { xs: 'none', md: 'table-cell' } }}>{p.nationality || '—'}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.82rem', display: { xs: 'none', lg: 'table-cell' } }}>{p.birthDate ? fmtDate(p.birthDate) : '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', display: { xs: 'none', lg: 'table-cell' } }}>{p.height || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', display: { xs: 'none', lg: 'table-cell' } }}>{p.birthPlace || '—'}</TableCell>
                      <TableCell align="center">
                        <Typography
                          onClick={() => p.gallery?.length > 0 && setGalleryDialog({ open: true, images: p.gallery, name: p.name })}
                          sx={{
                            fontWeight: 600, fontSize: '0.82rem',
                            color: (p.gallery?.length || 0) > 0 ? '#1565c0' : colors.textMuted,
                            cursor: (p.gallery?.length || 0) > 0 ? 'pointer' : 'default',
                            '&:hover': (p.gallery?.length || 0) > 0 ? { textDecoration: 'underline' } : {}
                          }}
                        >
                          {p.gallery?.length || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          onClick={() => p.filmography?.length > 0 && setFilmoDialog({ open: true, films: p.filmography, name: p.name })}
                          sx={{
                            fontWeight: 600, fontSize: '0.82rem',
                            color: (p.filmography?.length || 0) > 0 ? '#1565c0' : colors.textMuted,
                            cursor: (p.filmography?.length || 0) > 0 ? 'pointer' : 'default',
                            '&:hover': (p.filmography?.length || 0) > 0 ? { textDecoration: 'underline' } : {}
                          }}
                        >
                          {p.filmography?.length || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.82rem' }}>{p.likeCount || 0}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.82rem' }}>{p.viewCount || 0}</TableCell>
                      <TableCell align="center">
                        <Chip label={p.isActive !== false ? 'Hoạt động' : 'Ẩn'} size="small"
                          sx={{
                            fontWeight: 600, fontSize: '0.72rem',
                            bgcolor: p.isActive !== false ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)',
                            color: p.isActive !== false ? '#2e7d32' : '#d32f2f'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.3, whiteSpace: 'nowrap' }}>
                          <Tooltip title="Chi tiết">
                            <IconButton size="small" onClick={() => setDetailDialog({ open: true, person: p })}
                              sx={{ color: '#9c27b0' }}>
                              <VisibilityIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sửa">
                            <IconButton size="small" onClick={() => openEditModal(p)}
                              sx={{ color: '#2196f3' }}>
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton size="small" onClick={() => setDeleteDialog({ open: true, item: p })}
                              sx={{ color: '#f44336' }}>
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={13} align="center" sx={{ py: 5 }}>
                        <InboxIcon sx={{ fontSize: 42, color: colors.textMuted, mb: 1, display: 'block', mx: 'auto' }} />
                        <Typography sx={{ color: colors.textMuted }}>Chưa có dữ liệu</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {total > rowsPerPage && (
                <TablePagination component="div" count={total} page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage} rowsPerPageOptions={[]}
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                  sx={{
                    color: colors.textSecondary,
                    '.MuiTablePagination-actions': { color: colors.textPrimary },
                    borderTop: `1px solid ${colors.borderSubtle}`
                  }}
                />
              )}
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* === MODAL THÊM/SỬA === */}
      <Dialog open={formDialog.open} onClose={closeFormDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 2, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {formDialog.editItem ? `Cập nhật ${personRole === 'director' ? 'đạo diễn' : 'diễn viên'}` : `Thêm ${personRole === 'director' ? 'đạo diễn' : 'diễn viên'} mới`}
          <IconButton size="small" onClick={closeFormDialog}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 2.5, pt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1 }}>
            {/* Tên */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.82rem' }}>Tên *</Typography>
              <TextField fullWidth size="small" placeholder={personRole === 'director' ? 'Tên đạo diễn' : 'Tên diễn viên'}
                value={formData.name}
                onChange={(e) => { setFormData(p => ({ ...p, name: e.target.value })); if (formError) setFormError(''); }}
                error={!!formError && !formData.name.trim()}
                sx={inputSx}
              />
            </Box>

            {/* Ảnh đại diện */}
            <Box>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.82rem' }}>Ảnh đại diện (danh sách)</Typography>
              <TextField fullWidth size="small" placeholder="https://..."
                value={formData.photoUrl}
                onChange={(e) => setFormData(p => ({ ...p, photoUrl: e.target.value }))}
                sx={inputSx}
              />
            </Box>
            {/* Ảnh poster */}
            <Box>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.82rem' }}>Ảnh poster (chi tiết)</Typography>
              <TextField fullWidth size="small" placeholder="https://..."
                value={formData.posterUrl}
                onChange={(e) => setFormData(p => ({ ...p, posterUrl: e.target.value }))}
                sx={inputSx}
              />
            </Box>
            {/* Ngày sinh */}
            <Box>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.82rem' }}>Ngày sinh</Typography>
              <TextField fullWidth size="small" type="date" value={formData.birthDate}
                onChange={(e) => setFormData(p => ({ ...p, birthDate: e.target.value }))}
                sx={inputSx} InputLabelProps={{ shrink: true }}
              />
            </Box>
            {/* Quốc tịch */}
            <Box>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.82rem' }}>Quốc tịch</Typography>
              <TextField fullWidth size="small" placeholder="Quốc tịch"
                value={formData.nationality}
                onChange={(e) => setFormData(p => ({ ...p, nationality: e.target.value }))}
                sx={inputSx}
              />
            </Box>
            {/* Nơi sinh */}
            <Box>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.82rem' }}>Nơi sinh</Typography>
              <TextField fullWidth size="small" placeholder="Nơi sinh"
                value={formData.birthPlace}
                onChange={(e) => setFormData(p => ({ ...p, birthPlace: e.target.value }))}
                sx={inputSx}
              />
            </Box>
            {/* Chiều cao */}
            <Box>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.82rem' }}>Chiều cao</Typography>
              <TextField fullWidth size="small" placeholder="Chiều cao"
                value={formData.height}
                onChange={(e) => setFormData(p => ({ ...p, height: e.target.value }))}
                sx={inputSx}
              />
            </Box>
            {/* Trạng thái */}
            <Box>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.82rem' }}>Trạng thái</Typography>
              <TextField select fullWidth size="small"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.value === 'true' }))}
                sx={inputSx}
              >
                <MenuItem value="true">Hoạt động</MenuItem>
                <MenuItem value="false">Ẩn</MenuItem>
              </TextField>
            </Box>
            {/* Mô tả */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.82rem' }}>Mô tả ngắn</Typography>
              <TextField fullWidth size="small" multiline rows={2} placeholder="Mô tả ngắn về diễn viên..."
                value={formData.shortBio}
                onChange={(e) => setFormData(p => ({ ...p, shortBio: e.target.value }))}
                sx={inputSx}
              />
            </Box>
            {/* Tiểu sử */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.82rem' }}>Tiểu sử</Typography>
              <TextField fullWidth size="small" multiline rows={4} placeholder="Tiểu sử đầy đủ..."
                value={formData.fullBio}
                onChange={(e) => setFormData(p => ({ ...p, fullBio: e.target.value }))}
                sx={inputSx}
              />
            </Box>
          </Box>

          {/* === HÌNH ẢNH DIỄN VIÊN === */}
          <Divider sx={{ my: 2, borderColor: colors.borderSubtle }} />
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.85rem' }}>
                {personRole === 'director' ? 'Hình ảnh đạo diễn' : 'Hình ảnh diễn viên'} ({formData.gallery.length})
              </Typography>
              <Button size="small" startIcon={<AddIcon />}
                onClick={() => setFormData(p => ({ ...p, gallery: [...p.gallery, { url: '', caption: '' }] }))}
                sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#1565c0' }}>
                Thêm ảnh
              </Button>
            </Box>
            {formData.gallery.map((img, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField size="small" placeholder="URL ảnh" value={img.url}
                  onChange={(e) => {
                    const g = [...formData.gallery];
                    g[i] = { ...g[i], url: e.target.value };
                    setFormData(p => ({ ...p, gallery: g }));
                  }}
                  sx={{ ...inputSx, flex: 2 }}
                />
                <TextField size="small" placeholder="Caption" value={img.caption || ''}
                  onChange={(e) => {
                    const g = [...formData.gallery];
                    g[i] = { ...g[i], caption: e.target.value };
                    setFormData(p => ({ ...p, gallery: g }));
                  }}
                  sx={{ ...inputSx, flex: 1 }}
                />
                <IconButton size="small" onClick={() => setFormData(p => ({ ...p, gallery: p.gallery.filter((_, idx) => idx !== i) }))}
                  sx={{ color: '#f44336' }}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ))}
          </Box>

          {/* === PHIM ĐÃ THAM GIA === */}
          <Divider sx={{ my: 2, borderColor: colors.borderSubtle }} />
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.85rem' }}>
                Phim đã tham gia ({formData.filmography.length})
              </Typography>
              <Button size="small" startIcon={<AddIcon />}
                onClick={() => setFormData(p => ({ ...p, filmography: [...p.filmography, { title: '', role: '', posterUrl: '', releaseDate: '' }] }))}
                sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#1565c0' }}>
                Thêm phim
              </Button>
            </Box>
            {formData.filmography.map((f, i) => (
              <Box key={i} sx={{ p: 1.5, mb: 1, borderRadius: 1, border: `1px solid ${colors.borderSubtle}` }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 0.5 }}>
                  <TextField size="small" placeholder="Tên phim *" value={f.title}
                    onChange={(e) => {
                      const fm = [...formData.filmography];
                      fm[i] = { ...fm[i], title: e.target.value };
                      setFormData(p => ({ ...p, filmography: fm }));
                    }}
                    sx={inputSx}
                  />
                  <TextField size="small" placeholder="Vai diễn" value={f.role || ''}
                    onChange={(e) => {
                      const fm = [...formData.filmography];
                      fm[i] = { ...fm[i], role: e.target.value };
                      setFormData(p => ({ ...p, filmography: fm }));
                    }}
                    sx={inputSx}
                  />
                  <TextField size="small" placeholder="URL Poster" value={f.posterUrl || ''}
                    onChange={(e) => {
                      const fm = [...formData.filmography];
                      fm[i] = { ...fm[i], posterUrl: e.target.value };
                      setFormData(p => ({ ...p, filmography: fm }));
                    }}
                    sx={inputSx}
                  />
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <TextField size="small" type="date" placeholder="Ngày phát hành" value={f.releaseDate ? (typeof f.releaseDate === 'string' && f.releaseDate.includes('T') ? f.releaseDate.split('T')[0] : f.releaseDate) : ''}
                      onChange={(e) => {
                        const fm = [...formData.filmography];
                        fm[i] = { ...fm[i], releaseDate: e.target.value };
                        setFormData(p => ({ ...p, filmography: fm }));
                      }}
                      sx={{ ...inputSx, flex: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <IconButton size="small" onClick={() => setFormData(p => ({ ...p, filmography: p.filmography.filter((_, idx) => idx !== i) }))}
                      sx={{ color: '#f44336' }}>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          {formError && (
            <Typography sx={{ color: '#f44336', mt: 1.5, fontSize: '0.82rem' }}>{formError}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={closeFormDialog} sx={{ textTransform: 'none', color: colors.textMuted }}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={formLoading}
            sx={{
              textTransform: 'none', fontWeight: 600,
              bgcolor: formDialog.editItem ? '#ff9800' : '#1B4F93',
              '&:hover': { bgcolor: formDialog.editItem ? '#f57c00' : '#163f78' }
            }}>
            {formLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : (formDialog.editItem ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG XÓA === */}
      <Dialog open={deleteDialog.open} onClose={() => !deleting && setDeleteDialog({ open: false, item: null })}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 380, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ color: colors.textPrimary, fontWeight: 600 }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.textSecondary }}>
            Bạn có chắc chắn muốn xóa <strong>{deleteDialog.item?.name}</strong> không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, item: null })} disabled={deleting}
            sx={{ color: colors.textSecondary, textTransform: 'none' }}>Hủy</Button>
          <Button variant="contained" disabled={deleting} onClick={handleDelete}
            sx={{ bgcolor: '#f44336', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#d32f2f' } }}>
            {deleting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DIALOG CHI TIẾT === */}
      <Dialog open={detailDialog.open} onClose={() => setDetailDialog({ open: false, person: null })}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Chi tiết
          <IconButton size="small" onClick={() => setDetailDialog({ open: false, person: null })}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          {detailDialog.person && (() => {
            const p = detailDialog.person;
            return (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Avatar src={p.photoUrl} sx={{ width: 80, height: 80, borderRadius: 1 }}>{p.name?.[0]}</Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{p.name}</Typography>
                    {p.nameEn && <Typography sx={{ fontSize: '0.82rem', color: colors.textMuted }}>{p.nameEn}</Typography>}
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.78rem', color: colors.textMuted }}>
                        <ThumbUpIcon sx={{ fontSize: 14 }} /> {p.likeCount || 0}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.78rem', color: colors.textMuted }}>
                        <VisibilityIcon sx={{ fontSize: 14 }} /> {p.viewCount || 0}
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {[
                    ['Ngày sinh', p.birthDate ? fmtDate(p.birthDate) : '—'],
                    ['Quốc tịch', p.nationality || '—'],
                    ['Nơi sinh', p.birthPlace || '—'],
                    ['Chiều cao', p.height || '—'],
                    ['Lượt thích', p.likeCount || 0],
                    ['Lượt xem', p.viewCount || 0],
                    ['Trạng thái', p.isActive !== false ? 'Hoạt động' : 'Ẩn'],
                    ['Ngày tạo', fmtDate(p.createdAt)]
                  ].map(([label, val]) => (
                    <Box key={label}>
                      <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 600 }}>{label}</Typography>
                      <Typography sx={{ fontSize: '0.85rem' }}>{val}</Typography>
                    </Box>
                  ))}
                </Box>
                {/* Gallery */}
                {p.gallery?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 600, mb: 0.5 }}>Hình ảnh ({p.gallery.length})</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {p.gallery.map((img, i) => (
                        <Box key={i} component="img" src={img.url} alt={img.caption || ''}
                          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, border: `1px solid ${colors.borderSubtle}` }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                {/* Filmography */}
                {p.filmography?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 600, mb: 0.5 }}>Phim đã tham gia ({p.filmography.length})</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {p.filmography.map((f, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {f.posterUrl && <Box component="img" src={f.posterUrl} sx={{ width: 28, height: 40, objectFit: 'cover', borderRadius: 0.5 }} />}
                          <Box>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{f.title}</Typography>
                            {f.role && <Typography sx={{ fontSize: '0.7rem', color: colors.textMuted }}>{f.role}</Typography>}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                {/* Mô tả */}
                {p.shortBio && (
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 600, mb: 0.3 }}>Mô tả</Typography>
                    <Typography sx={{ fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>{p.shortBio}</Typography>
                  </Box>
                )}
                {/* Tiểu sử */}
                {p.fullBio && (
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 600, mb: 0.3 }}>Tiểu sử</Typography>
                    <Typography sx={{ fontSize: '0.82rem', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{p.fullBio}</Typography>
                  </Box>
                )}
              </Box>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* === DIALOG HÌNH ẢNH === */}
      <Dialog open={galleryDialog.open} onClose={() => setGalleryDialog({ open: false, images: [], name: '' })}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Hình ảnh - {galleryDialog.name}
          <IconButton size="small" onClick={() => setGalleryDialog({ open: false, images: [], name: '' })}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {galleryDialog.images.map((img, i) => (
              <Box key={i}>
                <Box component="img" src={img.url} alt={img.caption || ''}
                  sx={{ width: '100%', borderRadius: 1.5, objectFit: 'cover' }}
                />
                {img.caption && (
                  <Typography sx={{ fontSize: '0.82rem', color: colors.textSecondary, mt: 0.5, textAlign: 'center' }}>
                    {img.caption}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* === DIALOG PHIM ĐÃ THAM GIA === */}
      <Dialog open={filmoDialog.open} onClose={() => setFilmoDialog({ open: false, films: [], name: '' })}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Phim đã tham gia - {filmoDialog.name}
          <IconButton size="small" onClick={() => setFilmoDialog({ open: false, films: [], name: '' })}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filmoDialog.films.map((f, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 1, border: `1px solid ${colors.borderSubtle}` }}>
                {f.posterUrl ? (
                  <Box component="img" src={f.posterUrl} sx={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 0.5 }} />
                ) : (
                  <Box sx={{ width: 36, height: 50, bgcolor: colors.bgInput, borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: colors.textMuted }}>N/A</Typography>
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{f.title}</Typography>
                  {f.role && <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>{f.role}</Typography>}
                </Box>
                {f.releaseDate && <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>{fmtDate(f.releaseDate)}</Typography>}
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminActorListPage;
