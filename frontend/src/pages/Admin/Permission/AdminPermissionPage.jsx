import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress,
  Button, IconButton, Tooltip, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getAllRolesAPI, updateRolePermissionsAPI } from '../../../apis/roleApi';

// Mapping tên chức vụ sang tiếng Việt
const ROLE_DISPLAY_NAMES = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  staff: 'Nhân viên',
  user: 'Khách hàng'
};
const getRoleDisplayName = (name) => ROLE_DISPLAY_NAMES[name] || name;

// Card style
const getCardSx = (colors) => ({
  borderRadius: 0,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

// Danh sách tất cả quyền chi tiết (per-action)
const ALL_FEATURES = [
  // Dashboard
  { key: 'dashboard.xem', label: 'Xem Dashboard', group: 'Dashboard' },

  // Phim
  { key: 'phim.xem', label: 'Xem danh sách phim', group: 'Phim' },
  { key: 'phim.them', label: 'Thêm phim', group: 'Phim' },
  { key: 'phim.sua', label: 'Sửa phim', group: 'Phim' },
  { key: 'phim.xoa', label: 'Xóa phim', group: 'Phim' },

  // Thể loại
  { key: 'the-loai.xem', label: 'Xem thể loại', group: 'Thể loại' },
  { key: 'the-loai.them', label: 'Thêm thể loại', group: 'Thể loại' },
  { key: 'the-loai.sua', label: 'Sửa thể loại', group: 'Thể loại' },
  { key: 'the-loai.xoa', label: 'Xóa thể loại', group: 'Thể loại' },

  // Ghế
  { key: 'ghe.xem', label: 'Xem danh sách ghế', group: 'Ghế' },
  { key: 'ghe.them', label: 'Thêm ghế', group: 'Ghế' },
  { key: 'ghe.sua', label: 'Sửa ghế', group: 'Ghế' },
  { key: 'ghe.xoa', label: 'Xóa ghế', group: 'Ghế' },

  // Rạp
  { key: 'rap.xem', label: 'Xem danh sách rạp', group: 'Rạp' },
  { key: 'rap.them', label: 'Thêm rạp', group: 'Rạp' },
  { key: 'rap.sua', label: 'Sửa rạp', group: 'Rạp' },
  { key: 'rap.xoa', label: 'Xóa rạp', group: 'Rạp' },

  // Phòng
  { key: 'phong.xem', label: 'Xem danh sách phòng', group: 'Phòng' },
  { key: 'phong.them', label: 'Thêm phòng', group: 'Phòng' },
  { key: 'phong.sua', label: 'Sửa phòng', group: 'Phòng' },
  { key: 'phong.xoa', label: 'Xóa phòng', group: 'Phòng' },

  // Suất chiếu
  { key: 'suat-chieu.xem', label: 'Xem suất chiếu', group: 'Suất chiếu' },
  { key: 'suat-chieu.them', label: 'Thêm suất chiếu', group: 'Suất chiếu' },
  { key: 'suat-chieu.sua', label: 'Sửa suất chiếu', group: 'Suất chiếu' },
  { key: 'suat-chieu.xoa', label: 'Xóa suất chiếu', group: 'Suất chiếu' },

  // Combo
  { key: 'combo.xem', label: 'Xem danh sách combo', group: 'Combo' },
  { key: 'combo.them', label: 'Thêm combo', group: 'Combo' },
  { key: 'combo.sua', label: 'Sửa combo', group: 'Combo' },
  { key: 'combo.xoa', label: 'Xóa combo', group: 'Combo' },

  // Thống kê
  { key: 'thong-ke.xem', label: 'Xem thống kê', group: 'Thống kê' },

  // Hóa đơn
  { key: 'hoa-don.xem', label: 'Xem hóa đơn', group: 'Hóa đơn' },
  { key: 'hoa-don.sua', label: 'Cập nhật hóa đơn', group: 'Hóa đơn' },

  // Slide
  { key: 'slide.xem', label: 'Xem slide', group: 'Slide' },
  { key: 'slide.them', label: 'Thêm slide', group: 'Slide' },
  { key: 'slide.sua', label: 'Sửa slide', group: 'Slide' },
  { key: 'slide.xoa', label: 'Xóa slide', group: 'Slide' },

  // Thể loại phim (Góc điện ảnh)
  { key: 'the-loai-phim.xem', label: 'Xem thể loại phim', group: 'Thể loại phim' },
  { key: 'the-loai-phim.them', label: 'Thêm thể loại phim', group: 'Thể loại phim' },
  { key: 'the-loai-phim.sua', label: 'Sửa thể loại phim', group: 'Thể loại phim' },
  { key: 'the-loai-phim.xoa', label: 'Xóa thể loại phim', group: 'Thể loại phim' },

  // Bình luận
  { key: 'binh-luan.xem', label: 'Xem bình luận', group: 'Bình luận' },
  { key: 'binh-luan.xoa', label: 'Xóa bình luận', group: 'Bình luận' },

  // Diễn viên
  { key: 'dien-vien.xem', label: 'Xem diễn viên', group: 'Diễn viên' },
  { key: 'dien-vien.them', label: 'Thêm diễn viên', group: 'Diễn viên' },
  { key: 'dien-vien.sua', label: 'Sửa diễn viên', group: 'Diễn viên' },
  { key: 'dien-vien.xoa', label: 'Xóa diễn viên', group: 'Diễn viên' },

  // Đạo diễn
  { key: 'dao-dien.xem', label: 'Xem đạo diễn', group: 'Đạo diễn' },
  { key: 'dao-dien.them', label: 'Thêm đạo diễn', group: 'Đạo diễn' },
  { key: 'dao-dien.sua', label: 'Sửa đạo diễn', group: 'Đạo diễn' },
  { key: 'dao-dien.xoa', label: 'Xóa đạo diễn', group: 'Đạo diễn' },

  // Ưu đãi
  { key: 'uu-dai.xem', label: 'Xem ưu đãi', group: 'Ưu đãi' },
  { key: 'uu-dai.them', label: 'Thêm ưu đãi', group: 'Ưu đãi' },
  { key: 'uu-dai.sua', label: 'Sửa ưu đãi', group: 'Ưu đãi' },

  // Phim hay hàng tháng
  { key: 'phim-hay.xem', label: 'Xem phim hay tháng', group: 'Phim hay tháng' },
  { key: 'phim-hay.them', label: 'Thêm bài viết', group: 'Phim hay tháng' },
  { key: 'phim-hay.sua', label: 'Sửa bài viết', group: 'Phim hay tháng' },
  { key: 'phim-hay.xoa', label: 'Xóa bài viết', group: 'Phim hay tháng' },

  // Giá vé
  { key: 'gia-ve.xem', label: 'Xem bảng giá vé', group: 'Giá vé' },
  { key: 'gia-ve.them', label: 'Thêm bảng giá', group: 'Giá vé' },
  { key: 'gia-ve.sua', label: 'Sửa bảng giá', group: 'Giá vé' },

  // Thành viên
  { key: 'thanh-vien.xem', label: 'Xem thành viên', group: 'Thành viên' },
  { key: 'thanh-vien.sua', label: 'Sửa nội dung thành viên', group: 'Thành viên' },

  // Khách hàng
  { key: 'khach-hang.xem', label: 'Xem khách hàng', group: 'Khách hàng' },
  { key: 'khach-hang.sua', label: 'Sửa khách hàng', group: 'Khách hàng' },
  { key: 'khach-hang.xoa', label: 'Xóa khách hàng', group: 'Khách hàng' },

  // Nhân viên
  { key: 'nhan-vien.xem', label: 'Xem nhân viên', group: 'Nhân viên' },
  { key: 'nhan-vien.them', label: 'Thêm nhân viên', group: 'Nhân viên' },
  { key: 'nhan-vien.sua', label: 'Sửa nhân viên', group: 'Nhân viên' },
  { key: 'nhan-vien.xoa', label: 'Xóa nhân viên', group: 'Nhân viên' },

  // Chức vụ
  { key: 'chuc-vu.xem', label: 'Xem chức vụ', group: 'Chức vụ' },
  { key: 'chuc-vu.them', label: 'Thêm chức vụ', group: 'Chức vụ' },
  { key: 'chuc-vu.sua', label: 'Sửa chức vụ', group: 'Chức vụ' },
  { key: 'chuc-vu.xoa', label: 'Xóa chức vụ', group: 'Chức vụ' },

  // Phân quyền
  { key: 'phan-quyen.xem', label: 'Xem phân quyền', group: 'Phân quyền' },
  { key: 'phan-quyen.sua', label: 'Sửa phân quyền', group: 'Phân quyền' }
];

const AdminPermissionPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const cardSx = getCardSx(colors);

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchFeature, setSearchFeature] = useState('');
  const [searchAssigned, setSearchAssigned] = useState('');

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllRolesAPI();
      // Loại bỏ chức vụ "user" (khách hàng) khỏi danh sách phân quyền
      const allRoles = res.data?.data || [];
      setRoles(allRoles.filter(r => r.name?.toLowerCase() !== 'user'));
    } catch (err) {
      console.error('Fetch roles error:', err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  // Chọn role để phân quyền
  const handleSelectRole = (role) => {
    setSelectedRole({ ...role, permissions: role.permissions || [] });
  };

  // Thêm quyền
  const handleAddPermission = async (featureKey) => {
    if (!selectedRole) return;
    const updated = [...(selectedRole.permissions || []), featureKey];
    setSelectedRole(prev => ({ ...prev, permissions: updated }));
    setSaving(true);
    try {
      await updateRolePermissionsAPI(selectedRole._id, updated);
      setRoles(prev => prev.map(r => r._id === selectedRole._id ? { ...r, permissions: updated } : r));
    } catch (err) {
      console.error('Add permission error:', err);
      // Revert
      setSelectedRole(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== featureKey) }));
    } finally { setSaving(false); }
  };

  // Xóa quyền
  const handleRemovePermission = async (featureKey) => {
    if (!selectedRole) return;
    const updated = (selectedRole.permissions || []).filter(p => p !== featureKey);
    setSelectedRole(prev => ({ ...prev, permissions: updated }));
    setSaving(true);
    try {
      await updateRolePermissionsAPI(selectedRole._id, updated);
      setRoles(prev => prev.map(r => r._id === selectedRole._id ? { ...r, permissions: updated } : r));
    } catch (err) {
      console.error('Remove permission error:', err);
      setSelectedRole(prev => ({ ...prev, permissions: [...prev.permissions, featureKey] }));
    } finally { setSaving(false); }
  };

  // Toggle tất cả
  const handleToggleAll = async () => {
    if (!selectedRole) return;
    const allKeys = ALL_FEATURES.map(f => f.key);
    const hasAll = allKeys.every(k => (selectedRole.permissions || []).includes(k));
    const updated = hasAll ? [] : allKeys;
    setSelectedRole(prev => ({ ...prev, permissions: updated }));
    setSaving(true);
    try {
      await updateRolePermissionsAPI(selectedRole._id, updated);
      setRoles(prev => prev.map(r => r._id === selectedRole._id ? { ...r, permissions: updated } : r));
    } catch (err) {
      console.error('Toggle all error:', err);
    } finally { setSaving(false); }
  };

  // Check if feature is assigned
  const isAssigned = (key) => (selectedRole?.permissions || []).includes(key);

  // Filtered features (search)
  const filteredFeatures = useMemo(() => {
    if (!searchFeature.trim()) return ALL_FEATURES;
    const q = searchFeature.toLowerCase();
    return ALL_FEATURES.filter(f =>
      f.label.toLowerCase().includes(q) || f.group.toLowerCase().includes(q)
    );
  }, [searchFeature]);

  // Features đã được gán
  const assignedFeatures = ALL_FEATURES.filter(f => isAssigned(f.key));

  // Filtered assigned features (search Panel 3)
  const filteredAssigned = useMemo(() => {
    if (!searchAssigned.trim()) return assignedFeatures;
    const q = searchAssigned.toLowerCase();
    return assignedFeatures.filter(f =>
      f.label.toLowerCase().includes(q) || f.group.toLowerCase().includes(q)
    );
  }, [assignedFeatures, searchAssigned]);

  const tableCellSx = { fontSize: '0.78rem', color: colors.textSecondary };
  const tableHeadSx = { fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem' };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Phân Quyền
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Quản lý quyền truy cập chức năng cho từng chức vụ
          </Typography>
        </Box>
        <Tooltip title="Tải lại">
          <IconButton onClick={fetchRoles} sx={{ color: colors.textMuted }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 3-PANEL LAYOUT */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>

        {/* ═══ PANEL 1: Danh sách Chức Vụ ═══ */}
        <Card sx={{ ...cardSx }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: colors.textPrimary, mb: 1.5 }}>
              Danh Sách Chức Vụ
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: '#1B4F93' }} />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', border: `1px solid ${colors.borderSubtle}`, borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                      <TableCell sx={{ ...tableHeadSx, width: 30 }}>#</TableCell>
                      <TableCell sx={tableHeadSx}>Tên Chức vụ</TableCell>
                      <TableCell sx={{ ...tableHeadSx, whiteSpace: 'nowrap' }} align="center">Cấp Quyền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((role, idx) => {
                      const isSelected = selectedRole?._id === role._id;
                      return (
                        <TableRow key={role._id} sx={{
                          bgcolor: isSelected ? (darkMode ? 'rgba(21,101,192,0.15)' : '#e3f2fd') : 'transparent',
                          '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafbfc' },
                          transition: 'background 0.15s'
                        }}>
                          <TableCell sx={tableCellSx}>{idx + 1}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: colors.textPrimary }}>
                                {getRoleDisplayName(role.name)}
                              </Typography>
                              {role.isMaster && (
                                <Chip label="Master" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#fff3e0', color: '#e65100' }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Button size="small" variant={isSelected ? 'contained' : 'outlined'}
                              onClick={() => handleSelectRole(role)}
                              sx={{
                                textTransform: 'none', fontWeight: 600, fontSize: '0.7rem',
                                borderRadius: 0.5, minWidth: 80, py: 0.3,
                                bgcolor: isSelected ? '#00BFFF' : 'transparent',
                                borderColor: '#00BFFF', color: isSelected ? '#fff' : '#42a5f5',
                                '&:hover': { bgcolor: isSelected ? '#00BFFF' : 'rgba(66,165,245,0.1)' }
                              }}>
                              Phân Quyền
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* ═══ PANEL 2: Danh sách Chức Năng ═══ */}
        <Card sx={{ ...cardSx }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: colors.textPrimary }}>
                Danh Sách Chức Năng
              </Typography>
              {selectedRole && (
                <Button size="small" onClick={handleToggleAll} disabled={saving}
                  sx={{ textTransform: 'none', fontSize: '0.68rem', fontWeight: 600, color: '#1565c0' }}>
                  {ALL_FEATURES.every(f => isAssigned(f.key)) ? 'Bỏ tất cả' : 'Chọn tất cả'}
                </Button>
              )}
            </Box>

            {!selectedRole ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SecurityIcon sx={{ fontSize: 40, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
                <Typography sx={{ color: colors.textMuted, fontSize: '0.8rem' }}>
                  Chọn chức vụ để phân quyền
                </Typography>
              </Box>
            ) : (
              <>
                {/* Search */}
                <TextField size="small" fullWidth placeholder="Tìm kiếm quyền..." value={searchFeature}
                  onChange={e => setSearchFeature(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: colors.textMuted }} /></InputAdornment> }}
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2, fontSize: '0.8rem',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
                    }
                  }} />
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', border: `1px solid ${colors.borderSubtle}`, borderRadius: 2, maxHeight: 450, overflow: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: darkMode ? '#2a2a3e' : '#f8fafc' } }}>
                        <TableCell sx={{ ...tableHeadSx, width: 30 }}>#</TableCell>
                        <TableCell sx={tableHeadSx}>Tên Chức Năng</TableCell>
                        <TableCell sx={tableHeadSx} align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredFeatures.map((feature, idx) => {
                        const assigned = isAssigned(feature.key);
                        return (
                          <TableRow key={feature.key} sx={{
                            bgcolor: assigned ? (darkMode ? 'rgba(46,125,50,0.1)' : '#e8f5e9') : 'transparent',
                            '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafbfc' },
                            transition: 'background 0.15s'
                          }}>
                            <TableCell sx={tableCellSx}>{idx + 1}</TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: colors.textPrimary }}>
                                {feature.label}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {assigned ? (
                                <Tooltip title="Đã cấp quyền">
                                  <span>
                                    <IconButton size="small" onClick={() => handleRemovePermission(feature.key)} disabled={saving}
                                      sx={{ color: '#2e7d32' }}>
                                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Thêm quyền">
                                  <span>
                                    <IconButton size="small" onClick={() => handleAddPermission(feature.key)} disabled={saving}
                                      sx={{ color: '#42a5f5', '&:hover': { bgcolor: '#e3f2fd' } }}>
                                      <AddIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </CardContent>
        </Card>

        {/* ═══ PANEL 3: Đang Phân Quyền Cho ═══ */}
        <Card sx={{ ...cardSx }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: colors.textPrimary, mb: 1.5 }}>
              Đang Phân Quyền Cho
              {selectedRole && (
                <Chip label={getRoleDisplayName(selectedRole.name)} size="small" sx={{ ml: 1, height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#e3f2fd', color: '#1565c0' }} />
              )}
            </Typography>

            {!selectedRole ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SecurityIcon sx={{ fontSize: 40, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
                <Typography sx={{ color: colors.textMuted, fontSize: '0.8rem' }}>
                  Chọn chức vụ để xem quyền
                </Typography>
              </Box>
            ) : assignedFeatures.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: colors.textMuted, fontSize: '0.8rem' }}>
                  Chưa có quyền nào được gán
                </Typography>
              </Box>
            ) : (
              <>
                {/* Search assigned */}
                <TextField size="small" fullWidth placeholder="Tìm kiếm quyền đã gán..." value={searchAssigned}
                  onChange={e => setSearchAssigned(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: colors.textMuted }} /></InputAdornment> }}
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2, fontSize: '0.8rem',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
                    }
                  }} />
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', border: `1px solid ${colors.borderSubtle}`, borderRadius: 2, maxHeight: 450, overflow: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: darkMode ? '#2a2a3e' : '#f8fafc' } }}>
                        <TableCell sx={{ ...tableHeadSx, width: 30 }}>#</TableCell>
                        <TableCell sx={{ ...tableHeadSx, whiteSpace: 'nowrap' }}>Tên chức vụ</TableCell>
                        <TableCell sx={tableHeadSx}>Tên chức năng</TableCell>
                        <TableCell sx={tableHeadSx} align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAssigned.map((feature, idx) => (
                        <TableRow key={feature.key} sx={{
                          '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafbfc' },
                          transition: 'background 0.15s'
                        }}>
                          <TableCell sx={tableCellSx}>{idx + 1}</TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textPrimary }}>
                              {getRoleDisplayName(selectedRole.name)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.8rem', color: colors.textPrimary }}>
                              {feature.label}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Xoá quyền">
                              <span>
                                <IconButton size="small" onClick={() => handleRemovePermission(feature.key)} disabled={saving}
                                  sx={{ color: '#e53935', '&:hover': { bgcolor: '#ffebee' } }}>
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Saving indicator */}
            {saving && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, justifyContent: 'center' }}>
                <CircularProgress size={14} sx={{ color: '#1565c0' }} />
                <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>Đang lưu...</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminPermissionPage;
