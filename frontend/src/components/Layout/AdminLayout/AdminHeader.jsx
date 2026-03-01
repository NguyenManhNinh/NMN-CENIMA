import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Typography, Avatar, IconButton,
  InputBase, Badge, Menu, MenuItem, ListItemIcon, ListItemText,
  Divider, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAdminTheme } from './AdminThemeContext';

// Map path → tên trang hiển thị
const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/movies': 'Quản lý phim',
  '/admin/showtimes': 'Suất chiếu',
  '/admin/customers': 'Khách hàng',
  '/admin/promotions': 'Khuyến mãi',
  '/admin/settings': 'Cài đặt'
};

/**
 * AdminHeader – Thanh header trên cùng trang quản trị
 * Chứa: Hamburger (mobile) | Tìm kiếm | Theme toggle | Thông báo | Avatar
 * Sử dụng AdminThemeContext để đồng bộ chế độ sáng/tối
 */
const AdminHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy chế độ sáng/tối và bảng màu từ context
  const { darkMode, toggleDarkMode, colors } = useAdminTheme();

  // Lấy thông tin user từ localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // State menu avatar
  const [anchorEl, setAnchorEl] = useState(null);

  // Tiêu đề trang hiện tại
  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      const { logoutAPI } = await import('../../../apis/authApi');
      await logoutAPI();
    } catch (error) {
      console.error('Lỗi khi gọi API logout:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setAnchorEl(null);
      navigate('/admin/dang-nhap', { replace: true });
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: colors.bgHeader,
        borderBottom: `1px solid ${colors.borderHeader}`,
        zIndex: 1100,
        transition: 'all 0.3s ease'
      }}
    >
      <Toolbar sx={{
        minHeight: { xs: 56, sm: 64 },
        px: { xs: 1.5, sm: 3 },
        gap: { xs: 0.5, sm: 1.5 }
      }}>
        {/* === Hamburger (chỉ hiện trên mobile) === */}
        <IconButton
          onClick={onMenuClick}
          sx={{ display: { xs: 'flex', md: 'none' }, color: colors.textPrimary, mr: 0.5 }}
          aria-label="Mở menu"
        >
          <MenuIcon />
        </IconButton>

        {/* === Ô tìm kiếm === */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: colors.bgInput,
          border: '1.5px solid transparent',
          borderRadius: 2,
          px: 1.5,
          py: 0.4,
          flex: { xs: 1, sm: 'none' },
          width: { sm: 280, md: 320 },
          transition: 'background-color 0.3s ease'
        }}>
          <SearchIcon sx={{ color: colors.textMuted, fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Tìm kiếm..."
            sx={{
              flex: 1,
              fontSize: '0.85rem',
              color: colors.textPrimary,
              '& ::placeholder': { color: colors.textPlaceholder, opacity: 1 },
              transition: 'color 0.3s ease'
            }}
          />
        </Box>

        {/* === Spacer === */}
        <Box sx={{ flex: 1 }} />

        {/* === Nút chuyển đổi Theme sáng/tối === */}
        <Tooltip title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}>
          <IconButton
            onClick={toggleDarkMode}
            sx={{
              color: colors.iconColor,
              bgcolor: 'transparent',
              width: 38, height: 38,
              '&:hover': { bgcolor: 'transparent' }
            }}
          >
            {darkMode
              ? <LightModeIcon sx={{ fontSize: 20 }} />
              : <DarkModeIcon sx={{ fontSize: 20 }} />
            }
          </IconButton>
        </Tooltip>

        {/* === Nút thông báo === */}
        <Tooltip title="Thông báo">
          <IconButton
            sx={{
              color: colors.iconColor,
              bgcolor: 'transparent',
              width: 38, height: 38,
              '&:hover': { bgcolor: 'transparent' }
            }}
          >
            <Badge
              badgeContent={3}
              color="error"
              sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 18, height: 18 } }}
            >
              <NotificationsNoneIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* === Divider dọc === */}
        <Divider orientation="vertical" flexItem sx={{
          mx: 0.5,
          display: { xs: 'none', sm: 'block' },
          borderColor: colors.divider
        }} />

        {/* === Avatar + Tên admin === */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            borderRadius: 2,
            px: 1,
            py: 0.5
          }}
        >
          <Avatar
            src={user?.avatar || ''}
            sx={{
              width: 34, height: 34,
              bgcolor: '#1B4F93',
              fontSize: 14,
              border: `2px solid ${colors.avatarBorder}`
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{
              color: colors.textPrimary, fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.3,
              transition: 'color 0.3s ease'
            }}>
              {user?.name || 'Admin'}
            </Typography>
            <Typography variant="caption" sx={{
              color: colors.textMuted, fontSize: '0.68rem', textTransform: 'capitalize'
            }}>
              {user?.role || 'Admin'}
            </Typography>
          </Box>
        </Box>

        {/* === Menu dropdown từ avatar === */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1, minWidth: 200, borderRadius: 2,
                bgcolor: colors.bgCard,
                boxShadow: darkMode
                  ? '0 4px 20px rgba(0,0,0,0.4)'
                  : '0 4px 20px rgba(0,0,0,0.12)'
              }
            }
          }}
        >
          {/* Thông tin user */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.textPrimary }}>
              {user?.name || 'Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textMuted }}>
              {user?.email || ''}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: colors.divider }} />
          {/* Hồ sơ */}
          <MenuItem sx={{ py: 1, gap: 1.5, color: colors.textSecondary }}>
            <ListItemIcon><PersonIcon fontSize="small" sx={{ color: colors.iconColor }} /></ListItemIcon>
            <ListItemText>Hồ sơ cá nhân</ListItemText>
          </MenuItem>
          {/* Cài đặt */}
          <MenuItem sx={{ py: 1, gap: 1.5, color: colors.textSecondary }}>
            <ListItemIcon><SettingsIcon fontSize="small" sx={{ color: colors.iconColor }} /></ListItemIcon>
            <ListItemText>Cài đặt</ListItemText>
          </MenuItem>
          <Divider sx={{ borderColor: colors.divider }} />
          {/* Đăng xuất */}
          <MenuItem
            onClick={handleLogout}
            sx={{ py: 1, color: '#d32f2f', '&:hover': { bgcolor: darkMode ? '#3a1a1a' : '#ffebee' } }}
          >
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} /></ListItemIcon>
            <ListItemText>Đăng xuất</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
