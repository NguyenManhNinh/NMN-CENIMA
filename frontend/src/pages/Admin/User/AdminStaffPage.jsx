import { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, MenuItem, InputAdornment, IconButton, Tooltip, Avatar, Pagination,
  Tabs, Tab, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import InboxIcon from '@mui/icons-material/Inbox';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BadgeIcon from '@mui/icons-material/Badge';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  getAdminUserListAPI, adminCreateUserAPI, adminUpdateUserAPI,
  toggleUserActiveAPI, adminDeleteUserAPI, searchUserByEmailAPI, changeUserRoleAPI
} from '../../../apis/userManagementApi';
import { getAllRolesAPI } from '../../../apis/roleApi';

// Màu cho role — cycle nếu nhiều role
const ROLE_COLORS = [
  { color: '#c62828', bg: '#ffebee' },
  { color: '#e65100', bg: '#fff3e0' },
  { color: '#1565c0', bg: '#e3f2fd' },
  { color: '#6a1b9a', bg: '#f3e5f5' },
  { color: '#00695c', bg: '#e0f2f1' },
  { color: '#4e342e', bg: '#efebe9' },
];

const getRoleColor = (role, staffRoles) => {
  const idx = staffRoles.findIndex(r => r.name === role);
  return ROLE_COLORS[idx >= 0 ? idx % ROLE_COLORS.length : ROLE_COLORS.length - 1];
};

const getCardSx = (colors) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

const AdminStaffPage = () => {
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
  const [filterRole, setFilterRole] = useState('');

  // Dynamic roles từ Role collection (trừ 'user')
  const [staffRoles, setStaffRoles] = useState([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  // Dialog — tab 0 = Tạo mới, tab 1 = Thăng chức
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTab, setDialogTab] = useState(0);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form — Tạo mới / Sửa
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGender, setFormGender] = useState('');
  const [formBirthday, setFormBirthday] = useState('');
  const [formRole, setFormRole] = useState('staff');

  // Form — Thăng chức
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteUser, setPromoteUser] = useState(null);
  const [promoteRole, setPromoteRole] = useState('staff');
  const [promoteSearching, setPromoteSearching] = useState(false);
  const [promoteError, setPromoteError] = useState('');

  // Delete dialog
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounce(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch roles từ Role collection
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getAllRolesAPI();
        const roles = (res.data?.data || res.data || []).filter(r => r.name !== 'user' && r.isActive);
        setStaffRoles(roles);
        if (roles.length > 0) {
          setFormRole(roles[0].name);
          setPromoteRole(roles[0].name);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách chức vụ:', err);
      } finally {
        setRolesLoaded(true);
      }
    };
    fetchRoles();
  }, []);

  // Fetch staff
  const fetchStaff = useCallback(async () => {
    if (!rolesLoaded || staffRoles.length === 0) return;
    setLoading(true);
    try {
      const rolesToFetch = filterRole ? [filterRole] : staffRoles.map(r => r.name);
      const promises = rolesToFetch.map(r =>
        getAdminUserListAPI({ role: r, page: 1, limit: 100, search: searchDebounce || undefined })
      );
      const results = await Promise.all(promises);
      let allUsers = [];
      results.forEach(res => { allUsers = allUsers.concat(res.data || []); });
      allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const start = (page - 1) * 20;
      const paged = allUsers.slice(start, start + 20);
      setUsers(paged);
      setTotal(allUsers.length);
      setTotalPages(Math.ceil(allUsers.length / 20));
    } catch (err) {
      console.error('Lỗi tải danh sách nhân viên:', err);
    } finally { setLoading(false); }
  }, [page, searchDebounce, filterRole, staffRoles, rolesLoaded]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  // Reset
  const resetForm = () => {
    setFormName(''); setFormEmail(''); setFormPassword('');
    setFormPhone(''); setFormGender(''); setFormBirthday('');
    setFormRole(staffRoles.length > 0 ? staffRoles[0].name : ''); setIsEdit(false); setCurrentId(null);
    setPromoteEmail(''); setPromoteUser(null); setPromoteRole(staffRoles.length > 0 ? staffRoles[0].name : ''); setPromoteError('');
  };

  const handleOpenAdd = () => { resetForm(); setDialogTab(0); setOpenDialog(true); };

  const handleOpenEdit = (user) => {
    setFormName(user.name || '');
    setFormEmail(user.email || '');
    setFormPassword('');
    setFormPhone(user.phone || '');
    setFormGender(user.gender || '');
    setFormBirthday(user.birthday ? user.birthday.slice(0, 10) : '');
    setFormRole(user.role || 'staff');
    setCurrentId(user._id);
    setIsEdit(true);
    setDialogTab(0);
    setOpenDialog(true);
  };

  // Submit tạo mới / sửa
  const handleSubmit = async () => {
    if (!formName.trim() || !formEmail.trim()) return;
    if (!isEdit && !formPassword.trim()) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await adminUpdateUserAPI(currentId, {
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          role: formRole,
          gender: formGender || undefined,
          birthday: formBirthday || undefined
        });
      } else {
        await adminCreateUserAPI({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword,
          phone: formPhone.trim(),
          role: formRole,
          gender: formGender || undefined,
          birthday: formBirthday || undefined
        });
      }
      setOpenDialog(false);
      resetForm();
      // Reset bộ lọc để hiện đầy đủ danh sách sau khi thay đổi
      setSearch('');
      setSearchDebounce('');
      setFilterRole('');
      setPage(1);
      // Delay nhỏ để state cập nhật trước khi fetch
      setTimeout(() => fetchStaff(), 100);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally { setSubmitting(false); }
  };

  // Tìm user theo email (thăng chức)
  const handleSearchEmail = async () => {
    if (!promoteEmail.trim()) return;
    setPromoteSearching(true);
    setPromoteError('');
    setPromoteUser(null);
    try {
      const res = await searchUserByEmailAPI(promoteEmail.trim());
      const user = res.data;
      if (user.role !== 'user') {
        setPromoteError(`Tài khoản này đã là "${user.role}" rồi. Bạn có thể đổi chức vụ ở bảng danh sách.`);
      } else {
        setPromoteUser(user);
      }
    } catch (err) {
      setPromoteError(err.response?.data?.message || 'Không tìm thấy tài khoản!');
    } finally { setPromoteSearching(false); }
  };

  // Submit thăng chức
  const handlePromoteSubmit = async () => {
    if (!promoteUser || !promoteRole) return;
    setSubmitting(true);
    try {
      await changeUserRoleAPI(promoteUser._id, promoteRole);
      setOpenDialog(false);
      resetForm();
      setSearch(''); setSearchDebounce(''); setFilterRole(''); setPage(1);
      setTimeout(() => fetchStaff(), 100);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally { setSubmitting(false); }
  };

  const handleToggleActive = async (user) => {
    try {
      await toggleUserActiveAPI(user._id);
      fetchStaff();
    } catch (err) { alert(err.response?.data?.message || 'Cập nhật thất bại!'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminDeleteUserAPI(deleteTarget._id);
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      fetchStaff();
    } catch (err) { alert(err.response?.data?.message || 'Xóa thất bại!'); }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản Lý Nhân Viên
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Quản lý danh sách nhân viên, quản lý và admin trong hệ thống
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpenAdd}
          sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', px: 2.5, py: 1, borderRadius: 2, '&:hover': { bgcolor: '#163f78' } }}>
          Thêm nhân viên
        </Button>
      </Box>

      {/* Main Card */}
      <Card sx={{ ...cardSx }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: '1rem' }}>
                Danh sách nhân viên ({total})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <TextField select size="small" value={filterRole}
                onChange={e => { setFilterRole(e.target.value); setPage(1); }}
                SelectProps={{ displayEmpty: true, renderValue: (v) => v || 'Tất cả chức vụ' }}
                sx={{ ...noOutlineSx, width: 160 }}>
                <MenuItem value="">Tất cả chức vụ</MenuItem>
                {staffRoles.map(r => <MenuItem key={r.name} value={r.name}>{r.name}</MenuItem>)}
              </TextField>
              <TextField size="small" placeholder="Tìm tên, email, SĐT..."
                value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
                sx={{ ...noOutlineSx, width: { xs: '100%', sm: 220 } }}
              />
            </Box>
          </Box>
          <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}`, mb: 2 }} />

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={36} /></Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 1000, tableLayout: 'fixed', '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1.2, verticalAlign: 'middle' } }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 40 }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 170 }}>Họ và tên</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 95 }}>Ngày sinh</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Số điện thoại</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 200 }}>Email</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Ngày bắt đầu</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Chức vụ</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Tình trạng</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 80 }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length > 0 ? users.map((user, idx) => {
                      const rc = getRoleColor(user.role, staffRoles);
                      return (
                        <TableRow key={user._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                          <TableCell sx={{ fontSize: '0.8rem', color: colors.textMuted }}>{(page - 1) * 20 + idx + 1}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar src={user.avatar !== 'default.jpg' ? user.avatar : undefined}
                                sx={{ width: 32, height: 32, fontSize: '0.7rem', bgcolor: ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a'][idx % 4] }}>
                                {user.name?.charAt(0)?.toUpperCase()}
                              </Avatar>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: colors.textPrimary, whiteSpace: 'nowrap' }}>{user.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography sx={{ fontSize: '0.78rem', color: colors.textMuted }}>
                              {user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.82rem', color: colors.textSecondary }}>{user.phone || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.82rem', color: colors.textSecondary }}>{user.email}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography sx={{ fontSize: '0.78rem', color: colors.textMuted }}>
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={user.role} size="small"
                              sx={{
                                height: 24, fontWeight: 600, fontSize: '0.7rem',
                                bgcolor: darkMode ? 'transparent' : rc.bg,
                                color: rc.color,
                                border: darkMode ? `1px solid ${rc.color}` : 'none',
                                '& .MuiChip-label': { px: 1, whiteSpace: 'nowrap' }
                              }}
                            />
                          </TableCell>
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
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                          <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
                          <Typography variant="body2" sx={{ color: colors.textMuted }}>Không tìm thấy nhân viên nào</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small"
                    sx={{ '& .MuiPaginationItem-root': { color: colors.textSecondary } }} />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* === ADD / EDIT / PROMOTE DIALOG === */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0, fontSize: '1.2rem' }}>
          {isEdit ? 'Cập nhật Nhân Viên' : 'Thêm Nhân Viên'}
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            {isEdit ? 'Chỉnh sửa thông tin nhân viên' : 'Tạo tài khoản mới hoặc thăng chức từ khách hàng'}
          </Typography>
        </DialogTitle>

        {/* Tabs — chỉ hiện khi không phải edit */}
        {!isEdit && (
          <Tabs value={dialogTab} onChange={(_, v) => { setDialogTab(v); setPromoteUser(null); setPromoteError(''); }}
            sx={{ px: 3, mt: 1, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', minHeight: 40 } }}>
            <Tab icon={<AddIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Tạo mới" />
            <Tab icon={<UpgradeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Thăng chức" />
          </Tabs>
        )}

        <DialogContent sx={{ pt: '12px !important' }}>
          {/* === TAB 0: Tạo mới / Sửa === */}
          {(dialogTab === 0 || isEdit) && (
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
                Chức vụ & Thông tin thêm
              </Typography>

              <TextField select label="Chức vụ *" size="small" fullWidth value={formRole}
                onChange={e => setFormRole(e.target.value)} sx={{ ...noOutlineSx }}>
                {staffRoles.map(r => <MenuItem key={r.name} value={r.name}>{r.name}</MenuItem>)}
              </TextField>

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
            </Box>
          )}

          {/* === TAB 1: Thăng chức === */}
          {dialogTab === 1 && !isEdit && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
                Tìm tài khoản khách hàng
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField label="Nhập email khách hàng" size="small" fullWidth value={promoteEmail}
                  onChange={e => setPromoteEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  onKeyDown={e => e.key === 'Enter' && handleSearchEmail()}
                  sx={{ ...noOutlineSx }} />
                <Button variant="contained" onClick={handleSearchEmail} disabled={promoteSearching || !promoteEmail.trim()}
                  sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, px: 3, borderRadius: 2, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#163f78' } }}>
                  {promoteSearching ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Tìm kiếm'}
                </Button>
              </Box>

              {promoteError && (
                <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.85rem' }}>{promoteError}</Alert>
              )}

              {promoteUser && (
                <>
                  <Alert icon={<CheckCircleIcon />} severity="success" sx={{ borderRadius: 2, fontSize: '0.85rem', py: 0.5 }}>
                    <b>{promoteUser.name}</b> — {promoteUser.email} — Vai trò: <b>{promoteUser.role}</b>
                  </Alert>

                  <TextField select label="Chức vụ mới *" size="small" fullWidth value={promoteRole}
                    onChange={e => setPromoteRole(e.target.value)} sx={{ ...noOutlineSx }}>
                    {staffRoles.map(r => <MenuItem key={r.name} value={r.name}>{r.name}</MenuItem>)}
                  </TextField>
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={submitting}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Hủy</Button>

          {/* Nút Submit cho tab Tạo mới / Sửa */}
          {(dialogTab === 0 || isEdit) && (
            <Button variant="contained" onClick={handleSubmit}
              disabled={submitting || !formName.trim() || !formEmail.trim() || (!isEdit && !formPassword.trim())}
              startIcon={submitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : isEdit ? <EditIcon /> : <AddIcon />}
              sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}>
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo nhân viên'}
            </Button>
          )}

          {/* Nút Submit cho tab Thăng chức */}
          {dialogTab === 1 && !isEdit && (
            <Button variant="contained" onClick={handlePromoteSubmit}
              disabled={submitting || !promoteUser}
              startIcon={submitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <UpgradeIcon />}
              sx={{ bgcolor: '#2e7d32', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#1b5e20' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận thăng chức'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* === DELETE CONFIRM DIALOG === */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: '#e53935', pb: 0.5, fontSize: '1.15rem' }}>
          <WarningAmberIcon sx={{ color: '#ff9800', fontSize: 28 }} />
          Xác nhận xóa nhân viên
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: colors.textPrimary, mt: 1 }}>
            Bạn có chắc chắn muốn xóa nhân viên <b>"{deleteTarget?.name}"</b> ({deleteTarget?.email}) không?
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
            Xóa nhân viên
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminStaffPage;
