import { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  TextField, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Switch, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import InboxIcon from '@mui/icons-material/Inbox';
import CloseIcon from '@mui/icons-material/Close';
import { getAllBannersAPI, createBannerAPI, updateBannerAPI, deleteBannerAPI } from '../../../apis/cmsApi';

const AdminSlidePage = () => {
  const { colors } = useAdminTheme();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({ imageUrl: '', status: 'ACTIVE' });
  const [formLoading, setFormLoading] = useState(false);

  // Edit state
  const [editDialog, setEditDialog] = useState({ open: false, banner: null });
  const [editForm, setEditForm] = useState({ imageUrl: '', status: 'ACTIVE' });

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState({ open: false, banner: null });

  const cardSx = {
    bgcolor: colors.bgCard,
    borderRadius: 0,
    border: `1px solid ${colors.borderCard}`,
    boxShadow: 'none'
  };

  // Fetch banners
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllBannersAPI();
      setBanners(res.data?.banners || []);
    } catch (err) {
      console.error('Lỗi tải danh sách slide:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  // Create banner
  const handleCreate = async () => {
    if (!form.imageUrl.trim()) return;
    try {
      setFormLoading(true);
      await createBannerAPI({ imageUrl: form.imageUrl.trim(), status: form.status });
      setForm({ imageUrl: '', status: 'ACTIVE' });
      fetchBanners();
    } catch (err) {
      console.error('Lỗi thêm slide:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (banner) => {
    try {
      const newStatus = banner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateBannerAPI(banner._id, { status: newStatus });
      fetchBanners();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
    }
  };

  // Open edit dialog
  const openEdit = (banner) => {
    setEditForm({ imageUrl: banner.imageUrl, status: banner.status });
    setEditDialog({ open: true, banner });
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editForm.imageUrl.trim()) return;
    try {
      await updateBannerAPI(editDialog.banner._id, editForm);
      setEditDialog({ open: false, banner: null });
      fetchBanners();
    } catch (err) {
      console.error('Lỗi cập nhật slide:', err);
    }
  };

  // Delete banner
  const handleDelete = async () => {
    try {
      await deleteBannerAPI(deleteDialog.banner._id);
      setDeleteDialog({ open: false, banner: null });
      fetchBanners();
    } catch (err) {
      console.error('Lỗi xoá slide:', err);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary }}>
            Quản lý Slide
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Quản lý banner hiển thị trên trang chủ — {banners.length} slide
          </Typography>
        </Box>
        <Tooltip title="Làm mới">
          <IconButton onClick={fetchBanners} sx={{ color: colors.textMuted }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Layout: 2 cột */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>

        {/* === CỘT TRÁI: THÊM MỚI SLIDE === */}
        <Card sx={{ ...cardSx, width: { xs: '100%', md: 340 }, flexShrink: 0 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: colors.textPrimary, mb: 2 }}>
              Thêm Mới Slide
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, mb: 0.5 }}>Link Hình Ảnh</Typography>
                <TextField
                  fullWidth size="small"
                  placeholder="https://example.com/image.jpg"
                  value={form.imageUrl}
                  onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0, fontSize: '0.85rem',
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' },
                      bgcolor: colors.bgSubtle
                    }
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, mb: 0.5 }}>Tình Trạng</Typography>
                <TextField
                  select fullWidth size="small"
                  value={form.status}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0, fontSize: '0.85rem',
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' },
                      bgcolor: colors.bgSubtle
                    }
                  }}
                >
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
                </TextField>
              </Box>

              {/* Preview */}
              {form.imageUrl && (
                <Box sx={{ borderRadius: 0, overflow: 'hidden', border: `1px solid ${colors.borderCard}` }}>
                  <Box
                    component="img"
                    src={form.imageUrl}
                    alt="Preview"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                  />
                </Box>
              )}

              <Button
                variant="contained" fullWidth
                startIcon={formLoading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                disabled={!form.imageUrl.trim() || formLoading}
                onClick={handleCreate}
                sx={{
                  textTransform: 'none', borderRadius: 1.5, py: 1,
                  bgcolor: colors.textPrimary, color: colors.bgCard,
                  '&:hover': { bgcolor: colors.textSecondary },
                  fontWeight: 600, fontSize: '0.85rem'
                }}
              >
                Thêm Mới
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* === CỘT PHẢI: DANH SÁCH SLIDE === */}
        <Card sx={{ ...cardSx, flex: 1, minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: colors.textPrimary, p: 2.5, pb: 1 }}>
              Danh Sách Slide
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            ) : banners.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1 }} />
                <Typography sx={{ color: colors.textMuted }}>Chưa có slide nào</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
                <Table size="small" sx={{
                  minWidth: 600,
                  '& .MuiTableCell-root': {
                    color: colors.textPrimary, borderColor: colors.borderSubtle,
                    py: 1.5, verticalAlign: 'middle', whiteSpace: 'nowrap'
                  }
                }}>
                  <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 700, fontSize: '0.8rem', color: colors.textMuted } }}>
                      <TableCell width={40} align="center">#</TableCell>
                      <TableCell>Hình Ảnh</TableCell>
                      <TableCell width={100} align="center">Tình Trạng</TableCell>
                      <TableCell width={80} align="center">Hoạt Động</TableCell>
                      <TableCell width={100} align="center">Thao Tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {banners.map((b, idx) => (
                      <TableRow key={b._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Box
                            component="img"
                            src={b.imageUrl}
                            alt={`Slide ${idx + 1}`}
                            sx={{
                              width: { xs: 160, sm: 240, md: 280 },
                              height: { xs: 60, sm: 90, md: 110 },
                              objectFit: 'cover', display: 'block'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{
                            fontSize: '0.78rem', fontWeight: 600,
                            color: b.status === 'ACTIVE' ? '#4caf50' : '#f44336'
                          }}>
                            {b.status === 'ACTIVE' ? 'Hoạt Động' : 'Tắt'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={b.status === 'ACTIVE'}
                            onChange={() => handleToggleStatus(b)}
                            size="small"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#4caf50' }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Cập nhật">
                            <IconButton size="small" onClick={() => openEdit(b)} sx={{ color: '#2196f3', mr: 0.5 }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xoá bỏ">
                            <IconButton size="small" onClick={() => setDeleteDialog({ open: true, banner: b })} sx={{ color: '#f44336' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* === EDIT DIALOG === */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, banner: null })}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 }, bgcolor: colors.bgCard, m: { xs: 0, sm: 2 }, width: { xs: '100%', sm: 'auto' }, maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Cập nhật Slide
          <IconButton size="small" onClick={() => setEditDialog({ open: false, banner: null })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, mb: 0.5 }}>Link Hình Ảnh</Typography>
              <TextField
                fullWidth size="small"
                value={editForm.imageUrl}
                onChange={(e) => setEditForm(f => ({ ...f, imageUrl: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0, fontSize: '0.85rem',
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: 'none' },
                    bgcolor: colors.bgSubtle
                  }
                }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, mb: 0.5 }}>Tình Trạng</Typography>
              <TextField
                select fullWidth size="small"
                value={editForm.status}
                onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0, fontSize: '0.85rem',
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: 'none' },
                    bgcolor: colors.bgSubtle
                  }
                }}
              >
                <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
              </TextField>
            </Box>
            {editForm.imageUrl && (
              <Box sx={{ borderRadius: 1, overflow: 'hidden', border: `1px solid ${colors.borderCard}` }}>
                <Box
                  component="img"
                  src={editForm.imageUrl}
                  alt="Preview"
                  onError={(e) => { e.target.style.display = 'none'; }}
                  sx={{ width: '100%', height: { xs: 120, sm: 180 }, objectFit: 'cover', display: 'block' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined" size="small"
            onClick={() => setEditDialog({ open: false, banner: null })}
            sx={{ textTransform: 'none', borderRadius: 0, color: colors.textSecondary, borderColor: colors.borderSubtle }}
          >
            Huỷ
          </Button>
          <Button
            variant="contained" size="small"
            onClick={handleSaveEdit}
            disabled={!editForm.imageUrl.trim()}
            sx={{
              textTransform: 'none', borderRadius: 0,
              bgcolor: colors.textPrimary, color: colors.bgCard,
              '&:hover': { bgcolor: colors.textSecondary }
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DELETE CONFIRM DIALOG === */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, banner: null })}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 0, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary }}>
          Xác nhận xoá
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: colors.textSecondary }}>
            Bạn có chắc muốn xoá slide này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined" size="small"
            onClick={() => setDeleteDialog({ open: false, banner: null })}
            sx={{ textTransform: 'none', borderRadius: 0, color: colors.textSecondary, borderColor: colors.borderSubtle }}
          >
            Huỷ
          </Button>
          <Button
            variant="contained" size="small"
            onClick={handleDelete}
            sx={{
              textTransform: 'none', borderRadius: 0,
              bgcolor: '#f44336', color: '#fff',
              '&:hover': { bgcolor: '#d32f2f' }
            }}
          >
            Xoá Bỏ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSlidePage;
