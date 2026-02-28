import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

// Danh sách các tab điều hướng
const NAV_ITEMS = [
  { label: 'Trang chủ', path: '/admin/dashboard', icon: <HomeIcon /> }
];

/**
 * AdminNavbar – Thanh điều hướng phụ nằm dưới Header
 * Chứa các tab chức năng quản trị
 */
const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định tab đang active dựa trên URL hiện tại
  const currentTab = NAV_ITEMS.findIndex(
    (item) => location.pathname.startsWith(item.path)
  );

  // Xử lý chuyển tab
  const handleTabChange = (_event, newValue) => {
    navigate(NAV_ITEMS[newValue].path);
  };

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '3px solid #1a1a2e'
      }}
    >
      <Tabs
        value={currentTab >= 0 ? currentTab : 0}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 44,
          px: { xs: 1, sm: 2 },
          '& .MuiTabs-indicator': {
            display: 'none'
          },
          '& .MuiTab-root': {
            color: '#333333',
            fontWeight: 500,
            fontSize: '0.85rem',
            minHeight: 44,
            textTransform: 'none',
            px: 2,
            gap: 0.8,
            '&.Mui-selected': {
              color: '#060606ff',
              fontWeight: 600
            },
            '&:hover': {
              color: '#1B4F93'
            }
          }
        }}
      >
        {NAV_ITEMS.map((item) => (
          <Tab
            key={item.path}
            label={item.label}
            icon={item.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default AdminNavbar;
