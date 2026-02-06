import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Theme
import theme from './theme';

// Layouts
import ClientLayout from './components/Layout/ClientLayout';
import BookingLayout from './components/Layout/BookingLayout/BookingLayout';

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
import { ActorsPage, ActorDetailPage } from './pages/Client/Actor';
import { FilmDirectorPage, FilmDirectorDetailPage } from './pages/Client/FilmDirector';
import { PromotionListPage, PromotionDetailPage } from './pages/Client/Promotion';
import QuickBookingPage from './pages/Client/QuickBooking';
import { BookingFallbackPage } from './pages/Client/BookingFallback';

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

          {/* BOOKING FLOW - Layout đặc biệt (chỉ logo + timer + cancel) */}
          <Route element={<BookingLayout />}>
            {/* Đặt combo */}
            <Route path="dat-ve-combo" element={<ComboPage />} />
            {/* Thanh toán */}
            <Route path="thanh-toan" element={<PaymentConfirmPage />} />
          </Route>

          {/* CLIENT ROUTES - Layout đầy đủ với navigation */}
          <Route path="/" element={<ClientLayout />}>
            {/* Kết quả thanh toán - Dùng full header */}
            <Route path="ket-qua-thanh-toan" element={<PaymentResultPage />} />
            {/* Trang chủ */}
            <Route index element={<HomePage />} />
            {/* Phim đang chiếu */}
            <Route path="phim-dang-chieu" element={<MoviesPage />} />
            {/* Phim sắp chiếu */}
            <Route path="phim-sap-chieu" element={<MoviesPage />} />
            {/* Đặt vé - trang quick booking (dropdown) */}
            <Route path="dat-ve" element={<QuickBookingPage />} />
            {/* Trang fallback khi back browser */}
            <Route path="dat-ve-fallback" element={<BookingFallbackPage />} />
            {/* Đặt vé - sử dụng slug để xem chi tiết phim */}
            <Route path="dat-ve/:slug" element={<BookingPage />} />
            {/* Chọn ghế */}
            <Route path="chon-ghe/:showtimeId" element={<SeatSelectionPage />} />

            {/* GÓC ĐIỆN ẢNH - Thể loại phim */}
            <Route path="the-loai-phim" element={<GenresPage />} />
            <Route path="the-loai-phim/:genreSlug" element={<GenresPage />} />

            {/* GÓC ĐIỆN ẢNH - Diễn viên */}
            <Route path="dien-vien" element={<ActorsPage />} />
            <Route path="dien-vien/:actorSlug" element={<ActorsPage />} />

            {/* Chi tiết phim */}
            {/* Chi tiết bài viết Góc điện ảnh (Genre) */}
            <Route path="phim/:slug" element={<GenresDetailPage />} />

            {/* Chi tiết diễn viên */}
            <Route path="dien-vien-chi-tiet/:slug" element={<ActorDetailPage />} />

            {/* GÓC ĐIỆN ẢNH - Đạo diễn */}
            <Route path="dao-dien" element={<FilmDirectorPage />} />
            <Route path="dao-dien-chi-tiet/:slug" element={<FilmDirectorDetailPage />} />

            {/* Ưu đãi - Sự kiện */}
            <Route path="uu-dai" element={<PromotionListPage />} />
            <Route path="uu-dai/:slug" element={<PromotionDetailPage />} />
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

