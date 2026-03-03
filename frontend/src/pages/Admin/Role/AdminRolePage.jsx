import { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, MenuItem, InputAdornment, IconButton, Tooltip, Avatar, List, ListItem,
  ListItemAvatar, ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import InboxIcon from '@mui/icons-material/Inbox';
import BadgeIcon from '@mui/icons-material/Badge';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PeopleIcon from '@mui/icons-material/People';
import { getAllRolesAPI, createRoleAPI, updateRoleAPI, deleteRoleAPI } from '../../../apis/roleApi';

// Card style — giống AdminComboPage / AdminCinemaPage
const getCardSx = (colors) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

const AdminRolePage = () => {
  const { darkMode, colors } = useAdminTheme();
  const cardSx = getCardSx(colors);

  // No-outline input sx — giống Combo/Cinema/Room
  const noOutlineSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, fontSize: '0.85rem',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
    }
  };

  // State
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIsMaster, setFormIsMaster] = useState('no');

  // Delete dialog
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Users dialog — xem danh sách user của role
  const [openUsersDialog, setOpenUsersDialog] = useState(false);
  const [usersDialogRole, setUsersDialogRole] = useState(null);

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllRolesAPI();
      setRoles(res.data?.data || []);
    } catch (err) {
      console.error('Lỗi tải chức vụ:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  // Reset form
  const resetForm = () => {
    setFormName(''); setFormDesc(''); setFormIsMaster('no');
    setIsEdit(false); setCurrentId(null);
  };

  // Open add
  const handleOpenAdd = () => { resetForm(); setOpenDialog(true); };

  // Open edit
  const handleOpenEdit = (role) => {
    setFormName(role.name || '');
    setFormDesc(role.description || '');
    setFormIsMaster(role.isMaster ? 'yes' : 'no');
    setCurrentId(role._id);
    setIsEdit(true);
    setOpenDialog(true);
  };

  // Submit
  const handleSubmit = async () => {
    if (!formName.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        description: formDesc.trim(),
        isMaster: formIsMaster === 'yes'
      };
      if (isEdit) await updateRoleAPI(currentId, payload);
      else await createRoleAPI(payload);
      setOpenDialog(false);
      resetForm();
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally { setSubmitting(false); }
  };

  // Toggle active
  const handleToggleActive = async (role) => {
    try {
      await updateRoleAPI(role._id, { isActive: !role.isActive });
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật thất bại!');
    }
  };

  // Xem user của role
  const handleViewUsers = (role) => {
    setUsersDialogRole(role);
    setOpenUsersDialog(true);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRoleAPI(deleteTarget._id);
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa chức vụ thất bại!');
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1100, mx: 'auto' }}>
      {/* Header — giống Combo */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản lý tài khoản chức vụ
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Thêm, sửa, xóa chức vụ trong hệ thống rạp chiếu phim
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}
          sx={{
            bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
            px: 2.5, py: 1, borderRadius: 2,
            '&:hover': { bgcolor: '#163f78' }
          }}>
          Thêm Chức Vụ
        </Button>
      </Box>

      {/* === MAIN CARD — giống Combo === */}
      <Card sx={{ ...cardSx }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: '1rem' }}>Danh Sách Chức Vụ</Typography>
          </Box>
          <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}`, mb: 2 }} />

          {/* Table — giống Combo */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={36} /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 700, tableLayout: 'fixed', '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1.2, verticalAlign: 'middle' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 45 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 200 }}>Tên chức vụ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 80 }}>Master</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 220 }}>Tài khoản sử dụng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Tình trạng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 90 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.length > 0 ? roles.map((role, idx) => (
                    <TableRow key={role._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                      <TableCell sx={{ fontSize: '0.8rem', color: colors.textMuted }}>{idx + 1}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: colors.textPrimary }}>{role.name}</Typography>
                        {role.description && (
                          <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mt: 0.2, lineHeight: 1.3 }}>
                            {role.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={role.isMaster ? 'Yes' : 'No'} size="small" sx={{
                          height: 24, fontWeight: 600, fontSize: '0.72rem',
                          bgcolor: role.isMaster ? '#4caf50' : '#2196f3',
                          color: '#fff',
                          '& .MuiChip-label': { px: 1 }
                        }} />
                      </TableCell>
                      {/* Cột Tài khoản sử dụng — hiển thị avatar + tên users */}
                      <TableCell>
                        {role.users && role.users.length > 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleViewUsers(role)}>
                            {/* Hiển thị tối đa 3 avatar */}
                            <Box sx={{ display: 'flex', ml: 0.5 }}>
                              {role.users.slice(0, 3).map((u, i) => (
                                <Avatar key={u._id} src={u.avatar !== 'default.jpg' ? u.avatar : undefined}
                                  sx={{
                                    width: 26, height: 26, fontSize: '0.65rem',
                                    border: '2px solid #fff', ml: i > 0 ? -0.8 : 0,
                                    bgcolor: ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a'][i % 4]
                                  }}>
                                  {u.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                              ))}
                            </Box>
                            {/* Hiển thị tên */}
                            <Typography variant="body2" sx={{ fontSize: '0.78rem', color: colors.textSecondary, ml: 0.5 }}>
                              {role.users.slice(0, 2).map(u => u.name).join(', ')}
                              {role.users.length > 2 && <span style={{ color: colors.textMuted }}> +{role.users.length - 2}</span>}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: '0.78rem', color: colors.textMuted, fontStyle: 'italic' }}>
                            Chưa có
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={role.isActive ? 'Hoạt động' : 'Tắt'} size="small"
                          onClick={() => handleToggleActive(role)}
                          sx={{
                            height: 24, fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer',
                            bgcolor: darkMode ? 'transparent' : (role.isActive ? '#e8f5e9' : '#ffebee'),
                            color: role.isActive ? '#2e7d32' : '#c62828',
                            border: darkMode ? `1px solid ${role.isActive ? '#2e7d32' : '#c62828'}` : 'none',
                            '&:hover': { opacity: 0.85 },
                            '& .MuiChip-label': { px: 1 }
                          }} />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Sửa">
                            <IconButton size="small" onClick={() => handleOpenEdit(role)} sx={{ color: '#1565c0' }}>
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={role.isMaster ? 'Không thể xóa Master' : 'Xóa'}>
                            <span>
                              <IconButton size="small" disabled={role.isMaster}
                                onClick={() => { setDeleteTarget(role); setOpenDeleteConfirm(true); }}
                                sx={{ color: '#e53935' }}>
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ color: colors.textMuted }}>Chưa có chức vụ nào</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* === DIALOG XEM DANH SÁCH USER CỦA ROLE === */}
      <Dialog open={openUsersDialog} onClose={() => setOpenUsersDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Tài khoản chức vụ: {usersDialogRole?.name}</Typography>
            <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
              {usersDialogRole?.userCount || 0} người dùng đang giữ chức vụ này
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {usersDialogRole?.users?.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
              <Table size="small" sx={{ '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1 } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem' }}>Tên</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem' }}>Email</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Ngày tạo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersDialogRole.users.map((u, idx) => (
                    <TableRow key={u._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                      <TableCell sx={{ fontSize: '0.8rem', color: colors.textMuted }}>{idx + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={u.avatar !== 'default.jpg' ? u.avatar : undefined}
                            sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a'][idx % 4] }}>
                            {u.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.82rem', color: colors.textSecondary }}>{u.email}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: '0.78rem', color: colors.textMuted }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <InboxIcon sx={{ fontSize: 42, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
              <Typography variant="body2" sx={{ color: colors.textMuted }}>Chưa có tài khoản nào giữ chức vụ này</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenUsersDialog(false)}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* === ADD/EDIT DIALOG — giống Combo === */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          {isEdit ? 'Cập nhật Chức Vụ' : 'Thêm Chức Vụ Mới'}
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            {isEdit ? 'Chỉnh sửa thông tin chức vụ' : 'Thêm chức vụ mới cho hệ thống rạp chiếu'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            {/* Section: Thông tin cơ bản */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Thông tin cơ bản
            </Typography>

            <TextField label="Tên Chức Vụ *" size="small" fullWidth value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="VD: Quản lý, Nhân viên, Kế toán..."
              InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
              sx={{ ...noOutlineSx }} />

            <TextField label="Mô tả" size="small" fullWidth multiline rows={2} value={formDesc}
              onChange={e => setFormDesc(e.target.value)} placeholder="Mô tả ngắn về chức vụ này..."
              sx={{ ...noOutlineSx }} />

            <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />

            {/* Section: Cấu hình */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Cấu hình
            </Typography>

            <TextField select label="Quyền Master" size="small" fullWidth value={formIsMaster}
              onChange={e => setFormIsMaster(e.target.value)} sx={{ ...noOutlineSx }}>
              <MenuItem value="yes">Yes — Toàn quyền hệ thống</MenuItem>
              <MenuItem value="no">No — Quyền giới hạn</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={submitting}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={submitting || !formName.trim()}
            startIcon={submitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : isEdit ? <EditIcon /> : <AddIcon />}
            sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo chức vụ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DELETE CONFIRM DIALOG — giống Combo === */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: '#e53935', pb: 0.5, fontSize: '1.15rem' }}>
          <WarningAmberIcon sx={{ color: '#ff9800', fontSize: 28 }} />
          Xác nhận xóa chức vụ
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: colors.textPrimary, mt: 1 }}>
            Bạn có chắc chắn muốn xóa chức vụ <b>"{deleteTarget?.name}"</b> không?
          </Typography>
          {deleteTarget?.userCount > 0 && (
            <Typography sx={{ fontSize: '0.8rem', color: '#f44336', mt: 1 }}>
              ⚠️ Có {deleteTarget.userCount} người dùng đang giữ chức vụ này!
            </Typography>
          )}
          <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, mt: 1 }}>
            Chức vụ sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Hủy</Button>
          <Button variant="contained" onClick={handleDelete} startIcon={<DeleteIcon />}
            sx={{ bgcolor: '#e53935', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#c62828' } }}>
            Xóa chức vụ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminRolePage;
