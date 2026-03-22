import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { AdminThemeProvider, useAdminTheme } from './AdminThemeContext';
import { ToastProvider } from '../../../contexts/ToastContext';

/**
 * AdminContent – Nội dung bên trong Provider
 * Dùng useAdminTheme để lấy bảng màu
 */
const AdminContent = () => {
  const { colors } = useAdminTheme();

  // State điều khiển mở/đóng sidebar trên mobile
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.bgPage, transition: 'background-color 0.3s ease' }}>
      {/* Sidebar điều hướng */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Vùng nội dung chính (bên phải sidebar) */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
        {/* Header: tìm kiếm, thông báo, theme toggle, avatar */}
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />

        {/* Nội dung trang con */}
        <Box component="main" sx={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

/**
 * AdminLayout – Layout chung cho các trang quản trị
 * Bọc AdminThemeProvider để tất cả component con truy cập chế độ sáng/tối
 */
const AdminLayout = () => {
  return (
    <AdminThemeProvider>
      <ToastProvider>
        <AdminContent />
      </ToastProvider>
    </AdminThemeProvider>
  );
};

export default AdminLayout;
