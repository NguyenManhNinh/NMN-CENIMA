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
import { MoviesPage } from './pages/Client/Movie';
import SeatSelectionPage from './pages/Client/SeatSelection';
import ComboPage from './pages/Client/Combo';
import PaymentConfirmPage from './pages/Client/Payment';
import PaymentResultPage from './pages/Client/Payment/PaymentResultPage';
import OAuthCallback from './pages/Client/OAuthCallback/OAuthCallback';
import { GenresPage, GenresDetailPage } from './pages/Client/Genre';

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
            {/* Chọn ghế */}
            <Route path="chon-ghe/:showtimeId" element={<SeatSelectionPage />} />
            {/* Đặt combo */}
            <Route path="dat-ve-combo" element={<ComboPage />} />
            {/* Thanh toán */}
            <Route path="thanh-toan" element={<PaymentConfirmPage />} />
            {/* Kết quả thanh toán */}
            <Route path="ket-qua-thanh-toan" element={<PaymentResultPage />} />

            {/* GÓC ĐIỆN ẢNH - Thể loại phim */}
            <Route path="the-loai-phim" element={<GenresPage />} />
            <Route path="the-loai-phim/:genreSlug" element={<GenresPage />} />


            {/* Chi tiết phim */}
            {/* Chi tiết bài viết Góc điện ảnh (Genre) */}
            <Route path="phim/:slug" element={<GenresDetailPage />} />
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

