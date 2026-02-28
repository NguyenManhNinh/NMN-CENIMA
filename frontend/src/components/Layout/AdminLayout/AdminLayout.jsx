import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminHeader from './AdminHeader';
import AdminNavbar from './AdminNavbar';

/**
 * AdminLayout – Layout chung cho các trang quản trị
 * - AdminHeader: thanh trên cùng (logo + avatar)
 * - AdminNavbar: thanh điều hướng tab (Trang chủ, ...)
 * - Outlet: nội dung trang con
 */
const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header cố định + Navbar liền bên dưới */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <AdminHeader />
        <AdminNavbar />
      </Box>

      {/* Vùng nội dung chính – margin-top bù cho header + navbar */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: { xs: '100px', sm: '108px' },
          backgroundColor: '#f5f7fa',
          minHeight: 'calc(100vh - 108px)'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
