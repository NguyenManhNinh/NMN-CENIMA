import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ChatbotWidget from '../../ChatbotWidget/ChatbotWidget';

// STYLES
const styles = {
  // Container chính (flex column để Footer luôn ở cuối)
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    overflowX: 'hidden' // Ngăn scroll ngang và khoảng trắng
  },
  // Nội dung chính (flex-grow để đẩy Footer xuống)
  main: {
    flexGrow: 1,
    overflowX: 'hidden' // Ngăn overflow từ children
  }
};

//CLIENT LAYOUT COMPONENT
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

      {/* Chatbot AI - Trợ lý ảo */}
      <ChatbotWidget />
    </Box>
  );
}

export default ClientLayout;
