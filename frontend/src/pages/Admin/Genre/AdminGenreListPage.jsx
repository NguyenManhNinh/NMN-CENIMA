import { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  IconButton, Tooltip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Autocomplete, Checkbox, Chip,
  TablePagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import InboxIcon from '@mui/icons-material/Inbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {
  getAllMovieCategoriesAPI, createMovieCategoryAPI,
  updateMovieCategoryAPI, deleteMovieCategoryAPI, getMoviesByCategoryAPI
} from '../../../apis/movieCategoryApi';
import { getAllMoviesAPI } from '../../../apis/movieApi';
import { useToast } from '../../../contexts/ToastContext';

const AdminGenreListPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const { showToast } = useToast();

  // State danh sách
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State form
  const [formName, setFormName] = useState('');
  const [selectedMovies, setSelectedMovies] = useState([]); // Phim được chọn
  const [editingCategory, setEditingCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // State danh sách phim cho dropdown
  const [allMovies, setAllMovies] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(true);

  // State phân trang
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // State xóa
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(false);

  // Style chung
  const cardSx = {
    borderRadius: 2,
    boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
    border: `1px solid ${colors.borderCard}`,
    bgcolor: colors.bgCard,
    transition: 'all 0.3s ease'
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

  // Lấy danh sách thể loại
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllMovieCategoriesAPI();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Lỗi tải thể loại:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách phim cho dropdown
  const fetchMovies = useCallback(async () => {
    setMoviesLoading(true);
    try {
      const res = await getAllMoviesAPI({ limit: 200 });
      const movies = res.data?.movies || res.data || [];
      setAllMovies(movies);
    } catch (err) {
      console.error('Lỗi tải phim:', err);
    } finally {
      setMoviesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchMovies();
  }, [fetchCategories, fetchMovies]);

  // Gửi form (Thêm / Cập nhật)
  const handleSubmit = async () => {
    if (!formName.trim()) {
      setFormError('Vui lòng nhập tên thể loại');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      const data = {
        name: formName.trim(),
        movieIds: selectedMovies.map(m => m._id)
      };
      if (editingCategory) {
        await updateMovieCategoryAPI(editingCategory._id, data);
      } else {
        await createMovieCategoryAPI(data);
      }
      // Reset form
      setFormName('');
      setSelectedMovies([]);
      setEditingCategory(null);
      setFormError('');
      fetchCategories();
    } catch (err) {
      let msg = err.response?.data?.message || 'Có lỗi xảy ra!';
      if (msg.includes('duplicate') || msg.includes('E11000') || msg.includes('tồn tại')) {
        msg = 'Thể loại đã tồn tại trong hệ thống!';
      } else if (msg.includes('jwt expired') || err.response?.status === 401) {
        msg = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
      }
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // Chọn thể loại để sửa → đổ dữ liệu vào form
  const handleEdit = async (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name || '');
    setFormError('');
    // Lấy danh sách phim đã gán cho thể loại này
    try {
      const res = await getMoviesByCategoryAPI(cat._id);
      const assignedMovies = res.data || [];
      // Map lại theo allMovies để có đủ thông tin
      const matched = assignedMovies.map(am =>
        allMovies.find(m => m._id === am._id) || am
      );
      setSelectedMovies(matched);
    } catch {
      setSelectedMovies([]);
    }
  };

  // Hủy sửa
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormName('');
    setSelectedMovies([]);
    setFormError('');
  };

  // Xóa thể loại
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMovieCategoryAPI(deleteDialog.item._id);
      setDeleteDialog({ open: false, item: null });
      if (editingCategory?._id === deleteDialog.item._id) handleCancelEdit();
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Xóa thể loại thất bại!', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
          Quản lý Thể loại
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
          Thêm, sửa, xóa thể loại phim và gán cho phim trong hệ thống
        </Typography>
      </Box>

      {/* 2 cột: Form + Bảng */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>

        {/* Form thêm/sửa */}
        <Card sx={{ ...cardSx, width: { xs: '100%', md: 370 }, flexShrink: 0, height: 'fit-content' }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 2.5, fontSize: '1rem' }}>
              {editingCategory ? 'Cập nhật Thể Loại' : 'Thêm Thể Loại Mới'}
            </Typography>

            {/* Tên thể loại */}
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.85rem' }}>
              Tên Thể Loại *
            </Typography>
            <TextField
              fullWidth size="small"
              placeholder="VD: Hành động, Hài, Tình cảm..."
              value={formName}
              onChange={(e) => { setFormName(e.target.value); if (formError) setFormError(''); }}
              error={!!formError && !formName.trim()}
              sx={{ ...inputSx, mb: 2 }}
            />

            {/* Chọn phim */}
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5, fontWeight: 500, fontSize: '0.85rem' }}>
              Chọn Phim
            </Typography>
            <Autocomplete
              multiple
              options={allMovies}
              loading={moviesLoading}
              value={selectedMovies}
              onChange={(_, newVal) => setSelectedMovies(newVal)}
              getOptionLabel={(opt) => opt.title || ''}
              isOptionEqualToValue={(opt, val) => opt._id === val._id}
              disableCloseOnSelect
              renderOption={(props, option, { selected }) => {
                const { key, ...rest } = props;
                return (
                  <li key={key} {...rest}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      sx={{ mr: 1 }}
                      checked={selected}
                    />
                    <Typography variant="body2" noWrap sx={{ fontSize: '0.85rem' }}>
                      {option.title}
                    </Typography>
                  </li>
                );
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...rest } = getTagProps({ index });
                  return (
                    <Chip
                      key={key} {...rest}
                      label={option.title}
                      size="small"
                      sx={{ fontSize: '0.75rem', maxWidth: 180 }}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder={selectedMovies.length === 0 ? 'Tìm và chọn phim...' : ''}
                  sx={inputSx}
                />
              )}
              sx={{ mb: 2 }}
              noOptionsText="Không tìm thấy phim"
              loadingText="Đang tải..."
            />

            {/* Lỗi */}
            {formError && (
              <Typography variant="body2" sx={{ color: '#f44336', mb: 1.5, fontSize: '0.82rem' }}>
                {formError}
              </Typography>
            )}

            {/* Nút */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {editingCategory && (
                <Button variant="outlined" onClick={handleCancelEdit}
                  sx={{
                    flex: 1, textTransform: 'none', fontWeight: 600,
                    color: colors.textSecondary, borderColor: colors.borderSubtle,
                    '&:hover': { borderColor: colors.textMuted, bgcolor: colors.bgInput }
                  }}>
                  Hủy
                </Button>
              )}
              <Button variant="contained" onClick={handleSubmit} disabled={formLoading}
                sx={{
                  flex: 1, textTransform: 'none', fontWeight: 600,
                  bgcolor: editingCategory ? '#ff9800' : '#1B4F93',
                  '&:hover': { bgcolor: editingCategory ? '#f57c00' : '#163f78' }
                }}>
                {formLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : (editingCategory ? 'Cập Nhật' : 'Thêm Mới')}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Bảng danh sách */}
        <Card sx={{ ...cardSx, flex: 1 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 2, fontSize: '1rem' }}>
              Danh Sách Thể Loại
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={36} sx={{ color: colors.textMuted }} />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
                <Table size="small" sx={{
                  '& .MuiTableCell-root': {
                    color: colors.textPrimary, borderColor: colors.borderSubtle,
                    py: { xs: 1, sm: 1.2 }, verticalAlign: 'middle',
                    px: { xs: 1, sm: 2 }
                  }
                }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', width: 40 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Tên Thể Loại</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Số Phim</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', display: { xs: 'none', lg: 'table-cell' } }}>Tên Phim</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem', display: { xs: 'none', md: 'table-cell' }, whiteSpace: 'nowrap' }}>Ngày Tạo</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.8rem' }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.length > 0 ? categories
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((cat, idx) => (
                        <TableRow key={cat._id} sx={{
                          '&:hover': { bgcolor: colors.bgSubtle },
                          bgcolor: editingCategory?._id === cat._id ? (darkMode ? 'rgba(25,118,210,0.12)' : 'rgba(25,118,210,0.06)') : 'transparent',
                          transition: 'background-color 0.2s'
                        }}>
                          <TableCell sx={{ fontSize: '0.82rem', fontWeight: 500, color: colors.textMuted }}>{page * rowsPerPage + idx + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: colors.textPrimary }}>
                              {cat.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={cat.movieCount ?? 0}
                              size="small"
                              onClick={() => handleEdit(cat)}
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                minWidth: 36,
                                bgcolor: (cat.movieCount ?? 0) > 0 ? '#e3f2fd' : (darkMode ? 'rgba(255,255,255,0.08)' : '#f5f5f5'),
                                color: (cat.movieCount ?? 0) > 0 ? '#1565c0' : colors.textMuted,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#bbdefb' }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                            <Typography variant="body2" sx={{
                              fontSize: '0.82rem', color: colors.textSecondary,
                              display: '-webkit-box', WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden',
                              lineHeight: 1.5, maxWidth: 250
                            }}>
                              {cat.movieNames?.length > 0 ? cat.movieNames.join(', ') : <em style={{ color: colors.textMuted }}>Chưa gán</em>}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: colors.textMuted }}>
                              {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('vi-VN') : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                              {/* Icon-only on mobile, text on desktop */}
                              <Tooltip title="Cập nhật" arrow>
                                <IconButton size="small" onClick={() => handleEdit(cat)}
                                  sx={{
                                    display: { xs: 'inline-flex', sm: 'none' },
                                    color: '#2196f3', bgcolor: 'rgba(33,150,243,0.08)',
                                    '&:hover': { bgcolor: 'rgba(33,150,243,0.15)' }
                                  }}>
                                  <EditIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa" arrow>
                                <IconButton size="small"
                                  onClick={() => setDeleteDialog({ open: true, item: cat })}
                                  sx={{
                                    display: { xs: 'inline-flex', sm: 'none' },
                                    color: '#f44336', bgcolor: 'rgba(244,67,54,0.08)',
                                    '&:hover': { bgcolor: 'rgba(244,67,54,0.15)' }
                                  }}>
                                  <DeleteIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              {/* Text buttons on desktop */}
                              <Button size="small" variant="contained"
                                startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                                onClick={() => handleEdit(cat)}
                                sx={{
                                  display: { xs: 'none', sm: 'inline-flex' },
                                  bgcolor: '#2196f3', textTransform: 'none', fontWeight: 600,
                                  fontSize: '0.75rem', py: 0.5, px: 1.5, whiteSpace: 'nowrap',
                                  '&:hover': { bgcolor: '#1976d2' }
                                }}>
                                Cập Nhật
                              </Button>
                              <Button size="small" variant="contained"
                                startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                                onClick={() => setDeleteDialog({ open: true, item: cat })}
                                sx={{
                                  display: { xs: 'none', sm: 'inline-flex' },
                                  bgcolor: '#f44336', textTransform: 'none', fontWeight: 600,
                                  fontSize: '0.75rem', py: 0.5, px: 1.5,
                                  '&:hover': { bgcolor: '#d32f2f' }
                                }}>
                                Xóa
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                          <InboxIcon sx={{ fontSize: 42, color: colors.textMuted, mb: 1, display: 'block', mx: 'auto' }} />
                          <Typography variant="body2" sx={{ color: colors.textMuted }}>Chưa có thể loại nào</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {categories.length > rowsPerPage && (
                  <TablePagination
                    component="div"
                    count={categories.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[]}
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                    sx={{
                      color: colors.textSecondary,
                      '.MuiTablePagination-actions': { color: colors.textPrimary },
                      borderTop: `1px solid ${colors.borderSubtle}`,
                      mt: 1
                    }}
                  />
                )}
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleting && setDeleteDialog({ open: false, item: null })}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 380, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ color: colors.textPrimary, fontWeight: 600 }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.textSecondary }}>
            Bạn có chắc chắn muốn xóa thể loại <strong>{deleteDialog.item?.name}</strong> không?
          </Typography>
          <Typography variant="caption" sx={{ color: '#f44336', mt: 1, display: 'block' }}>
            Lưu ý: Thể loại sẽ bị gỡ khỏi tất cả phim đã gán!
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
    </Box>
  );
};

export default AdminGenreListPage;
