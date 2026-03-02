import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Drawer, Collapse } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MovieIcon from '@mui/icons-material/Movie';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import logo from '../../../assets/images/NMN_CENIMA_LOGO.png';

// Chiều rộng sidebar
const SIDEBAR_WIDTH = 260;

// Danh sách menu điều hướng (phân nhóm)
// - item có `path` → click navigate
// - item có `children` → click mở/đóng dropdown (không navigate)
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
      {
        label: 'Quản lý Phim',
        icon: <MovieIcon />,
        children: [
          { label: 'Phim', path: '/admin/phim' }
        ]
      }
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

// Style cho child item (thụt vào)
const childItemSx = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  pl: 5.5,
  pr: 2,
  py: 0.7,
  mx: 1.5,
  borderRadius: 1.5,
  cursor: 'pointer',
  position: 'relative',
  transition: 'color 0.2s ease',
  bgcolor: 'transparent',
  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
  fontWeight: isActive ? 600 : 400,
  '&:hover': {
    bgcolor: 'transparent',
    color: '#fff'
  }
});

/**
 * AdminSidebar – Thanh điều hướng bên trái trang quản trị
 * - Hỗ trợ menu cha-con (dropdown expand/collapse)
 * - Menu cha có `children` → toggle dropdown
 * - Menu cha có `path` → navigate trực tiếp
 */
const AdminSidebar = ({ mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState({});

  // Toggle expand/collapse cho parent item
  const handleToggle = (label) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Navigate cho item đơn hoặc child item
  const handleNavClick = (path) => {
    navigate(path);
    if (onMobileClose) onMobileClose();
  };

  // Kiểm tra item cha có child nào đang active không
  const isParentActive = (item) => {
    if (item.children && item.children.length > 0) {
      return item.children.some(c => location.pathname === c.path || location.pathname.startsWith(c.path + '/'));
    }
    return false;
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
              const hasChildren = item.children && item.children.length >= 0 && !item.path;
              const isOpen = expanded[item.label] || false;
              const parentActive = isParentActive(item);

              if (hasChildren) {
                // === PARENT ITEM (dropdown) ===
                return (
                  <Box key={item.label}>
                    <Box
                      onClick={() => handleToggle(item.label)}
                      sx={menuItemSx(parentActive)}
                    >
                      <Box sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        '& .MuiSvgIcon-root': { fontSize: 20 }
                      }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 'inherit', flex: 1 }}>
                        {item.label}
                      </Typography>
                      {/* Mũi tên expand/collapse */}
                      <Box sx={{ '& .MuiSvgIcon-root': { fontSize: 16, transition: 'transform 0.2s' } }}>
                        {isOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                      </Box>
                      {/* Thanh active bên trái */}
                      {parentActive && (
                        <Box sx={{
                          position: 'absolute',
                          left: 0, top: '50%', transform: 'translateY(-50%)',
                          width: 3, height: 20,
                          borderRadius: '0 4px 4px 0',
                          bgcolor: '#4fc3f7'
                        }} />
                      )}
                    </Box>

                    {/* Children dropdown */}
                    <Collapse in={isOpen} timeout="auto">
                      {item.children.length > 0 ? (
                        item.children.map((child) => {
                          const isChildActive = location.pathname === child.path
                            || location.pathname.startsWith(child.path + '/');
                          return (
                            <Box
                              key={child.path}
                              onClick={() => handleNavClick(child.path)}
                              sx={childItemSx(isChildActive)}
                            >
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'inherit' }}>
                                {child.label}
                              </Typography>
                            </Box>
                          );
                        })
                      ) : (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', pl: 5.5, py: 0.5, display: 'block', fontSize: '0.72rem' }}>
                        </Typography>
                      )}
                    </Collapse>
                  </Box>
                );
              }

              // === SIMPLE ITEM (navigate) ===
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
