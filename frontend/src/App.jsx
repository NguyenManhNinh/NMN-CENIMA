import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Theme
import theme from './theme';

// Layouts
import ClientLayout from './components/Layout/ClientLayout';

// Pages - Client
import HomePage from './pages/Client/HomePage';
import BookingPage from './pages/Client/Booking';
import MoviesPage from './pages/Client/Movie';
import OAuthCallback from './pages/Client/OAuthCallback/OAuthCallback';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Reset CSS mặc định */}
      <CssBaseline />

      {/* Router với future flags để tắt cảnh báo v7 */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* OAuth Callback - không cần layout */}
          <Route path="/oauth-callback" element={<OAuthCallback />} />

          {/* CLIENT ROUTES*/}
          <Route path="/" element={<ClientLayout />}>
            {/* Trang chủ */}
            <Route index element={<HomePage />} />
            {/* Phim đang chiếu */}
            <Route path="phim-dang-chieu" element={<MoviesPage />} />
            {/* Phim sắp chiếu */}
            <Route path="phim-sap-chieu" element={<MoviesPage />} />
            {/* Đặt vé */}
            <Route path="dat-ve/:movieId" element={<BookingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </ThemeProvider>
  );
}

export default App;

