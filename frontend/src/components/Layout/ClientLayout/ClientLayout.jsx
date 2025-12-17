import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// STYLES
const styles = {
  // Container chính (flex column để Footer luôn ở cuối)
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  // Nội dung chính (flex-grow để đẩy Footer xuống)
  main: {
    flexGrow: 1
  }
};

// CLIENT LAYOUT COMPONENT
function ClientLayout() {
  return (
    <Box sx={styles.root}>
      {/* Header - Thanh điều hướng */}
      <Header />

      {/* Main Content - Nội dung trang */}
      <Box component="main" sx={styles.main}>
        <Outlet />
      </Box>

      {/* Footer - Chân trang */}
      <Footer />
    </Box>
  );
}

export default ClientLayout;
