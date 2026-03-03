import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, MenuItem, InputAdornment, IconButton, Tooltip, Avatar, Pagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import InboxIcon from '@mui/icons-material/Inbox';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import {
  getAdminUserListAPI, adminCreateUserAPI, adminUpdateUserAPI,
  toggleUserActiveAPI, adminDeleteUserAPI
} from '../../../apis/userManagementApi';
import VIETNAM_LOCATIONS from '../../../utils/vietnamLocations';

// Card style — giống AdminComboPage
const getCardSx = (colors) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

const AdminCustomerPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const cardSx = getCardSx(colors);

  const noOutlineSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, fontSize: '0.85rem',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
    }
  };

  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');

  // Add/Edit dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGender, setFormGender] = useState('');
  const [formBirthday, setFormBirthday] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formDistrict, setFormDistrict] = useState('');

  // Delete dialog
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Tick — force re-render mỗi 60s để cập nhật trạng thái Online/Offline
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounce(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUserListAPI({
        role: 'user',
        page,
        limit: 20,
        search: searchDebounce || undefined
      });
      setUsers(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Lỗi tải danh sách khách hàng:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchDebounce]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Auto-refresh mỗi 60s để cập nhật trạng thái online
  useEffect(() => {
    const interval = setInterval(() => { fetchUsers(); }, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Reset form
  const resetForm = () => {
    setFormName(''); setFormEmail(''); setFormPassword('');
    setFormPhone(''); setFormGender(''); setFormBirthday('');
    setFormAddress(''); setFormCity(''); setFormDistrict('');
    setIsEdit(false); setCurrentId(null);
  };

  // Open add
  const handleOpenAdd = () => { resetForm(); setOpenDialog(true); };

  // Open edit
  const handleOpenEdit = (user) => {
    setFormName(user.name || '');
    setFormEmail(user.email || '');
    setFormPassword('');
    setFormPhone(user.phone || '');
    setFormGender(user.gender || '');
    setFormBirthday(user.birthday ? user.birthday.slice(0, 10) : '');
    setFormAddress(user.address || '');
    setFormCity(user.city || '');
    setFormDistrict(user.district || '');
    setCurrentId(user._id);
    setIsEdit(true);
    setOpenDialog(true);
  };

  // Submit
  const handleSubmit = async () => {
    if (!formName.trim() || !formEmail.trim()) return;
    if (!isEdit && !formPassword.trim()) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        const payload = {
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          gender: formGender || undefined,
          birthday: formBirthday || undefined,
          address: formAddress.trim() || undefined,
          city: formCity.trim() || undefined,
          district: formDistrict.trim() || undefined
        };
        await adminUpdateUserAPI(currentId, payload);
      } else {
        await adminCreateUserAPI({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword,
          phone: formPhone.trim(),
          role: 'user',
          gender: formGender || undefined,
          birthday: formBirthday || undefined,
          address: formAddress.trim() || undefined,
          city: formCity.trim() || undefined,
          district: formDistrict.trim() || undefined
        });
      }
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally { setSubmitting(false); }
  };

  // Toggle active (Tình trạng)
  const handleToggleActive = async (user) => {
    try {
      await toggleUserActiveAPI(user._id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật thất bại!');
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminDeleteUserAPI(deleteTarget._id);
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại!');
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản Lý Khách Hàng
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Quản lý danh sách tài khoản khách hàng trong hệ thống
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpenAdd}
          sx={{
            bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
            px: 2.5, py: 1, borderRadius: 2,
            '&:hover': { bgcolor: '#163f78' }
          }}>
          Thêm tài khoản
        </Button>
      </Box>

      {/* Main Card */}
      <Card sx={{ ...cardSx }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>
          {/* Title + Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: '1rem' }}>
              Danh Sách Khách Hàng ({total})
            </Typography>
            <TextField
              size="small" placeholder="Tìm tên, email, SĐT..."
              value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment>
              }}
              sx={{ ...noOutlineSx, width: { xs: '100%', sm: 260 } }}
            />
          </Box>
          <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}`, mb: 2 }} />

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={36} /></Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 1200, tableLayout: 'fixed', '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1.2, verticalAlign: 'middle' } }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 40 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 180 }}>Họ và tên</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 220 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 120 }}>Số điện thoại</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Ngày sinh</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 160 }}>Địa chỉ</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 130 }}>Trạng thái</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 120 }}>Tình trạng</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 80 }}>Online</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 90 }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length > 0 ? users.map((user, idx) => (
                      <TableRow key={user._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                        <TableCell sx={{ fontSize: '0.8rem', color: colors.textMuted }}>{(page - 1) * 20 + idx + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={user.avatar !== 'default.jpg' ? user.avatar : undefined}
                              sx={{ width: 30, height: 30, fontSize: '0.7rem', bgcolor: ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a'][idx % 4] }}>
                              {user.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: colors.textPrimary, whiteSpace: 'nowrap' }}>{user.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.82rem', color: colors.textSecondary }}>{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.82rem', color: colors.textSecondary }}>{user.phone || '—'}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: '0.78rem', color: colors.textMuted }}>
                            {user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.78rem', color: colors.textMuted }}>
                            {[user.address, user.district, user.city].filter(Boolean).join(', ') || '—'}
                          </Typography>
                        </TableCell>
                        {/* Trạng thái: verified (isActive từ OTP) */}
                        <TableCell align="center">
                          <Chip
                            icon={user.isActive ? <VerifiedIcon sx={{ fontSize: 14 }} /> : <BlockIcon sx={{ fontSize: 14 }} />}
                            label={user.isActive ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                            size="small"
                            sx={{
                              height: 24, fontWeight: 600, fontSize: '0.68rem',
                              bgcolor: darkMode ? 'transparent' : (user.isActive ? '#e8f5e9' : '#fff3e0'),
                              color: user.isActive ? '#2e7d32' : '#e65100',
                              border: darkMode ? `1px solid ${user.isActive ? '#2e7d32' : '#e65100'}` : 'none',
                              '& .MuiChip-icon': { color: user.isActive ? '#2e7d32' : '#e65100' },
                              '& .MuiChip-label': { px: 0.8, whiteSpace: 'nowrap' }
                            }}
                          />
                        </TableCell>
                        {/* Tình trạng: Hoạt động / Tắt — controls login */}
                        <TableCell align="center">
                          <Chip
                            label={user.isActive ? 'Hoạt động' : 'Tắt'}
                            size="small"
                            onClick={() => handleToggleActive(user)}
                            sx={{
                              height: 24, fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer',
                              bgcolor: darkMode ? 'transparent' : (user.isActive ? '#e8f5e9' : '#ffebee'),
                              color: user.isActive ? '#2e7d32' : '#c62828',
                              border: darkMode ? `1px solid ${user.isActive ? '#2e7d32' : '#c62828'}` : 'none',
                              '&:hover': { opacity: 0.85 },
                              '& .MuiChip-label': { px: 1, whiteSpace: 'nowrap' }
                            }}
                          />
                        </TableCell>
                        {/* Online / Offline */}
                        <TableCell align="center">
                          {(() => {
                            const isOnline = user.lastActiveAt && (Date.now() - new Date(user.lastActiveAt).getTime()) < 5 * 60 * 1000;
                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isOnline ? '#4caf50' : '#bdbdbd' }} />
                                <Typography sx={{ fontSize: '0.72rem', color: isOnline ? '#2e7d32' : colors.textMuted, fontWeight: 600 }}>
                                  {isOnline ? 'Online' : 'Offline'}
                                </Typography>
                              </Box>
                            );
                          })()}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Sửa">
                              <IconButton size="small" onClick={() => handleOpenEdit(user)} sx={{ color: '#1565c0' }}>
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton size="small"
                                onClick={() => { setDeleteTarget(user); setOpenDeleteConfirm(true); }}
                                sx={{ color: '#e53935' }}>
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                          <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
                          <Typography variant="body2" sx={{ color: colors.textMuted }}>Không tìm thấy khách hàng nào</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={totalPages} page={page}
                    onChange={(_, v) => setPage(v)}
                    color="primary" size="small"
                    sx={{ '& .MuiPaginationItem-root': { color: colors.textSecondary } }}
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* === ADD/EDIT DIALOG === */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          {isEdit ? 'Cập nhật Khách Hàng' : 'Thêm Tài Khoản Mới'}
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            {isEdit ? 'Chỉnh sửa thông tin khách hàng' : 'Tạo tài khoản khách hàng mới (đã kích hoạt sẵn)'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Thông tin cơ bản
            </Typography>

            <TextField label="Họ và tên *" size="small" fullWidth value={formName}
              onChange={e => setFormName(e.target.value)}
              sx={{ ...noOutlineSx }} />

            <TextField label="Email *" size="small" fullWidth value={formEmail}
              onChange={e => setFormEmail(e.target.value)} placeholder="email@gmail.com"
              disabled={isEdit}
              sx={{ ...noOutlineSx }} />

            {!isEdit && (
              <TextField label="Mật khẩu *" size="small" fullWidth type="password" value={formPassword}
                onChange={e => setFormPassword(e.target.value)} placeholder="Tối thiểu 8 ký tự"
                sx={{ ...noOutlineSx }} />
            )}

            <TextField label="Số điện thoại" size="small" fullWidth value={formPhone}
              onChange={e => setFormPhone(e.target.value)} placeholder="0xxxxxxxxx"
              sx={{ ...noOutlineSx }} />

            <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Thông tin thêm
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Giới tính" size="small" fullWidth value={formGender}
                onChange={e => setFormGender(e.target.value)} sx={{ ...noOutlineSx }}>
                <MenuItem value="">Chưa chọn</MenuItem>
                <MenuItem value="male">Nam</MenuItem>
                <MenuItem value="female">Nữ</MenuItem>
                <MenuItem value="other">Khác</MenuItem>
              </TextField>

              <TextField label="Ngày sinh" size="small" fullWidth type="date" value={formBirthday}
                onChange={e => setFormBirthday(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ ...noOutlineSx }} />
            </Box>

            <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Địa chỉ
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Thành phố" size="small" fullWidth value={formCity}
                onChange={e => { setFormCity(e.target.value); setFormDistrict(''); }}
                sx={{ ...noOutlineSx }}>
                <MenuItem value="">Chọn thành phố/tỉnh</MenuItem>
                {Object.keys(VIETNAM_LOCATIONS).map(city => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Quận/Huyện" size="small" fullWidth value={formDistrict}
                onChange={e => setFormDistrict(e.target.value)}
                disabled={!formCity}
                sx={{ ...noOutlineSx }}>
                <MenuItem value="">Chọn quận/huyện</MenuItem>
                {(VIETNAM_LOCATIONS[formCity] || []).map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField label="Địa chỉ chi tiết" size="small" fullWidth value={formAddress}
              onChange={e => setFormAddress(e.target.value)} placeholder="Số nhà, đường, phường..."
              sx={{ ...noOutlineSx }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={submitting}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={submitting || !formName.trim() || !formEmail.trim() || (!isEdit && !formPassword.trim())}
            startIcon={submitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : isEdit ? <EditIcon /> : <AddIcon />}
            sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DELETE CONFIRM DIALOG === */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: '#e53935', pb: 0.5, fontSize: '1.15rem' }}>
          <WarningAmberIcon sx={{ color: '#ff9800', fontSize: 28 }} />
          Xác nhận xóa tài khoản
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: colors.textPrimary, mt: 1 }}>
            Bạn có chắc chắn muốn xóa tài khoản <b>"{deleteTarget?.name}"</b> ({deleteTarget?.email}) không?
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, mt: 1 }}>
            Tài khoản sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Hủy</Button>
          <Button variant="contained" onClick={handleDelete} startIcon={<DeleteIcon />}
            sx={{ bgcolor: '#e53935', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#c62828' } }}>
            Xóa tài khoản
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCustomerPage;
