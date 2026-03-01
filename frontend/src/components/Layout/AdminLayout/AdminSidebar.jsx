import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Drawer } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MovieIcon from '@mui/icons-material/Movie';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SettingsIcon from '@mui/icons-material/Settings';
import logo from '../../../assets/images/NMN_CENIMA_LOGO.png';

// Chiều rộng sidebar
const SIDEBAR_WIDTH = 260;

// Danh sách menu điều hướng (phân nhóm)
const MENU_GROUPS = [
  {
    label: 'TỔNG QUAN',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> }
    ]
  },
  {
    label: 'QUẢN LÝ',
    items: [
      { label: 'Phim', path: '/admin/movies', icon: <MovieIcon /> },
      { label: 'Suất chiếu', path: '/admin/showtimes', icon: <ConfirmationNumberIcon /> },
      { label: 'Khách hàng', path: '/admin/customers', icon: <PeopleIcon /> },
      { label: 'Khuyến mãi', path: '/admin/promotions', icon: <LocalOfferIcon /> }
    ]
  },
  {
    label: 'HỆ THỐNG',
    items: [
      { label: 'Cài đặt', path: '/admin/settings', icon: <SettingsIcon /> }
    ]
  }
];

// Style cho mỗi menu item
const menuItemSx = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  px: 2,
  py: 1,
  mx: 1.5,
  borderRadius: 1.5,
  cursor: 'pointer',
  position: 'relative',
  transition: 'color 0.2s ease',
  bgcolor: 'transparent',
  color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
  fontWeight: isActive ? 600 : 400,
  '&:hover': {
    bgcolor: 'transparent',
    color: '#fff'
  }
});

/**
 * AdminSidebar – Thanh điều hướng bên trái trang quản trị
 * - Logo NMN Cinema ở trên cùng
 * - Menu nhóm: Tổng quan, Quản lý, Hệ thống
 * - Mobile: dùng Drawer mở/đóng
 */
const AdminSidebar = ({ mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Xử lý click menu item
  const handleNavClick = (path) => {
    navigate(path);
    if (onMobileClose) onMobileClose();
  };

  // Nội dung sidebar
  const sidebarContent = (
    <Box sx={{
      width: SIDEBAR_WIDTH,
      height: '100vh',
      bgcolor: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Logo */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 2,
        px: 2,
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <Box
          component="img"
          src={logo}
          alt="NMN Cinema"
          sx={{ height: 60, objectFit: 'contain', cursor: 'pointer' }}
          onClick={() => handleNavClick('/admin/dashboard')}
        />
      </Box>

      {/* Danh sách menu */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        {MENU_GROUPS.map((group) => (
          <Box key={group.label} sx={{ mb: 1 }}>
            {/* Tên nhóm */}
            <Typography variant="overline" sx={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: 1.5,
              px: 3,
              py: 0.8,
              display: 'block'
            }}>
              {group.label}
            </Typography>

            {/* Các mục trong nhóm */}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path
                || location.pathname.startsWith(item.path + '/');
              return (
                <Box
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  sx={menuItemSx(isActive)}
                >
                  <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    '& .MuiSvgIcon-root': { fontSize: 20 }
                  }}>
                    {item.icon}
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 'inherit' }}>
                    {item.label}
                  </Typography>
                  {/* Thanh active bên trái */}
                  {isActive && (
                    <Box sx={{
                      position: 'absolute',
                      left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 20,
                      borderRadius: '0 4px 4px 0',
                      bgcolor: '#4fc3f7'
                    }} />
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* Phiên bản ứng dụng */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem' }}>
          NMN Cinema Admin v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop: sidebar cố định */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, width: SIDEBAR_WIDTH, flexShrink: 0 }}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 1200 }}>
          {sidebarContent}
        </Box>
      </Box>

      {/* Mobile: Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, border: 'none' }
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export { SIDEBAR_WIDTH };
export default AdminSidebar;
