import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction, Typography } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PersonIcon from '@mui/icons-material/Person';

function StaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/staff/dang-nhap', { replace: true });
      return;
    }
    try {
      setUser(JSON.parse(userData));
    } catch {
      navigate('/staff/dang-nhap', { replace: true });
    }
  }, [navigate]);

  // Current tab
  const getTabValue = () => {
    if (location.pathname.includes('/ho-so')) return 1;
    return 0;
  };

  const handleTabChange = (_, newValue) => {
    if (newValue === 0) navigate('/staff');
    else if (newValue === 1) navigate('/staff/ho-so');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Top bar */}
      <Box sx={{
        bgcolor: '#1B4F93',
        color: '#fff',
        px: 2,
        py: 1.2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
          NMN Cinema
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', opacity: 0.8 }}>
          {user?.name || 'Staff'}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', pb: '56px' }}>
        <Outlet />
      </Box>

      {/* Bottom navigation */}
      <BottomNavigation
        value={getTabValue()}
        onChange={handleTabChange}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid #e0e0e0',
          bgcolor: '#fff',
          height: 56,
          '& .MuiBottomNavigationAction-root': {
            color: '#999',
            minWidth: 0,
            '&.Mui-selected': { color: '#1B4F93' }
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 600
          }
        }}
      >
        <BottomNavigationAction label="Quét mã" icon={<QrCodeScannerIcon />} />
        <BottomNavigationAction label="Hồ sơ" icon={<PersonIcon />} />
      </BottomNavigation>
    </Box>
  );
}

export default StaffLayout;
