import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { logoutAPI } from '../../../apis/authApi';
import logo from '../../../assets/images/NMN_CENIMA_LOGO.png';

// Màu nền header admin
const HEADER_BG = '#1B4F93';

/**
 * AdminHeader – Thanh header trang quản trị
 * - Bên trái: Logo rạp
 * - Bên phải: Avatar + tên admin, menu đăng xuất
 */
const AdminHeader = () => {
  const navigate = useNavigate();

  // Lấy thông tin user từ localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // State điều khiển menu avatar
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // Mở menu khi click avatar
  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Đóng menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      // Gọi API revoke refresh token ở backend
      await logoutAPI();
    } catch (error) {
      console.error('Lỗi khi gọi API logout:', error);
    } finally {
      // Xóa dữ liệu phiên đăng nhập khỏi localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // Đóng menu và chuyển về trang đăng nhập admin
      setAnchorEl(null);
      navigate('/admin/dang-nhap', { replace: true });
    }
  };

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        backgroundColor: HEADER_BG
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 2, sm: 3 }
        }}
      >
        {/* === BÊN TRÁI: Logo === */}
        <Box
          component="img"
          src={logo}
          alt="NMN Cinema Dashboard"
          sx={{
            height: { xs: 50, sm: 85 },
            objectFit: 'contain',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/admin/dashboard')}
        />

        {/* === BÊN PHẢI: Avatar + Tên === */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            transition: 'background-color 0.2s',

          }}
          onClick={handleAvatarClick}
        >
          {/* Avatar người dùng */}
          <Avatar
            src={user?.avatar || ''}
            alt={user?.name || 'Admin'}
            sx={{
              width: 36,
              height: 36,
              border: '2px solid rgba(255,255,255,0.6)',
              fontSize: 16,
              backgroundColor: '#e3f2fd',
              color: HEADER_BG
            }}
          >
            {/* Nếu không có avatar, hiển thị chữ cái đầu */}
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </Avatar>

          {/* Tên + role */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="body2"
              sx={{
                color: '#fff',
                fontWeight: 600,
                lineHeight: 1.3,
                fontSize: '0.875rem'
              }}
            >
              {user?.name || 'Admin'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.2,
                fontSize: '0.75rem',
                textTransform: 'capitalize'
              }}
            >
              {user?.role || 'Admin'}
            </Typography>
          </Box>
        </Box>

        {/* === MENU DROPDOWN khi click avatar === */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }
            }
          }}
        >
          {/* Thông tin user trong menu */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.name || 'Admin'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || ''}
            </Typography>
          </Box>

          <Divider />

          {/* Nút đăng xuất */}
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.2,
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: '#ffebee'
              }
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} />
            </ListItemIcon>
            <ListItemText>Đăng xuất</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
