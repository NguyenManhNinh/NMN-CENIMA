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
import { FeaturedPage, FeaturedDetailPage } from './pages/Client/Featured';
import TicketPricingPage from './pages/Client/TicketPricing/TicketPricingPage';
import MembershipPage from './pages/Client/Membership/MembershipPage';
import AccountPage from './pages/Client/Account/AccountPage';

// Pages - Admin
import AdminLoginPage from './pages/Admin/Auth/AdminLoginPage';
import AdminDashboardPage from './pages/Admin/Dashboard/AdminDashboardPage';
import AdminMovieListPage from './pages/Admin/Movie/AdminMovieListPage';
import AdminGenreListPage from './pages/Admin/Genre/AdminGenreListPage';
import AdminShowtimePage from './pages/Admin/Showtime/AdminShowtimePage';
import AdminSeatPage from './pages/Admin/Seat/AdminSeatPage';
import AdminRoomPage from './pages/Admin/Room/AdminRoomPage';
import AdminCinemaPage from './pages/Admin/Cinema/AdminCinemaPage';
import AdminComboPage from './pages/Admin/Combo/AdminComboPage';
import AdminStatisticsPage from './pages/Admin/Statistics/AdminStatisticsPage';
import AdminRolePage from './pages/Admin/Role/AdminRolePage';
import AdminCustomerPage from './pages/Admin/User/AdminCustomerPage';
import AdminStaffPage from './pages/Admin/User/AdminStaffPage';
import AdminInvoicePage from './pages/Admin/Invoice/AdminInvoicePage';
import AdminSlidePage from './pages/Admin/Slide/AdminSlidePage';
import AdminGenreCinemaPage from './pages/Admin/GenreCinema/AdminGenreCinemaPage';
import AdminGenreCommentsPage from './pages/Admin/GenreCinema/AdminGenreCommentsPage';
import AdminActorListPage from './pages/Admin/Actor/AdminActorListPage';
import AdminDirectorListPage from './pages/Admin/Director/AdminDirectorListPage';
import AdminPromotionPage from './pages/Admin/Promotion/AdminPromotionPage';
import AdminFeaturedPage from './pages/Admin/Featured/AdminFeaturedPage';
import AdminTicketPricingPage from './pages/Admin/TicketPricing/AdminTicketPricingPage';
import AdminMembershipPage from './pages/Admin/Membership/AdminMembershipPage';
import AdminPermissionPage from './pages/Admin/Permission/AdminPermissionPage';

// Layouts - Admin
import AdminLayout from './components/Layout/AdminLayout/AdminLayout';

// Permission System
import { PermissionProvider, usePermission } from './contexts/PermissionContext';
import { Navigate } from 'react-router-dom';

// Route Guard: chặn truy cập trang không có quyền
function PermissionRoute({ permissionKey, children }) {
  const { hasAnyPermission, isMaster } = usePermission();
  if (isMaster || permissionKey === 'dashboard' || hasAnyPermission(permissionKey)) {
    return children;
  }
  return <Navigate to="/admin/dashboard" replace />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Reset CSS mặc định */}
      <CssBaseline />

      {/* Router với future flags để tắt cảnh báo v7 */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* ═══════ ADMIN ROUTES ═══════ */}
          {/* Trang đăng nhập admin – không dùng layout */}
          <Route path="admin/dang-nhap" element={<AdminLoginPage />} />

          {/* Các trang quản trị – dùng AdminLayout (có header) */}
          <Route path="admin" element={<PermissionProvider><AdminLayout /></PermissionProvider>}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="phim" element={<PermissionRoute permissionKey="phim"><AdminMovieListPage /></PermissionRoute>} />
            <Route path="the-loai" element={<PermissionRoute permissionKey="the-loai"><AdminGenreListPage /></PermissionRoute>} />
            <Route path="suat-chieu" element={<PermissionRoute permissionKey="suat-chieu"><AdminShowtimePage /></PermissionRoute>} />
            <Route path="ghe" element={<PermissionRoute permissionKey="ghe"><AdminSeatPage /></PermissionRoute>} />
            <Route path="rap" element={<PermissionRoute permissionKey="rap"><AdminCinemaPage /></PermissionRoute>} />
            <Route path="phong" element={<PermissionRoute permissionKey="phong"><AdminRoomPage /></PermissionRoute>} />
            <Route path="combo" element={<PermissionRoute permissionKey="combo"><AdminComboPage /></PermissionRoute>} />
            <Route path="thong-ke" element={<PermissionRoute permissionKey="thong-ke"><AdminStatisticsPage /></PermissionRoute>} />
            <Route path="chuc-vu" element={<PermissionRoute permissionKey="chuc-vu"><AdminRolePage /></PermissionRoute>} />
            <Route path="khach-hang" element={<PermissionRoute permissionKey="khach-hang"><AdminCustomerPage /></PermissionRoute>} />
            <Route path="nhan-vien" element={<PermissionRoute permissionKey="nhan-vien"><AdminStaffPage /></PermissionRoute>} />
            <Route path="hoa-don" element={<PermissionRoute permissionKey="hoa-don"><AdminInvoicePage /></PermissionRoute>} />
            <Route path="slide" element={<PermissionRoute permissionKey="slide"><AdminSlidePage /></PermissionRoute>} />
            <Route path="the-loai-phim" element={<PermissionRoute permissionKey="the-loai-phim"><AdminGenreCinemaPage /></PermissionRoute>} />
            <Route path="binh-luan-the-loai" element={<PermissionRoute permissionKey="binh-luan"><AdminGenreCommentsPage /></PermissionRoute>} />
            <Route path="dien-vien" element={<PermissionRoute permissionKey="dien-vien"><AdminActorListPage /></PermissionRoute>} />
            <Route path="dao-dien" element={<PermissionRoute permissionKey="dao-dien"><AdminDirectorListPage /></PermissionRoute>} />
            <Route path="uu-dai" element={<PermissionRoute permissionKey="uu-dai"><AdminPromotionPage /></PermissionRoute>} />
            <Route path="phim-hay-thang" element={<PermissionRoute permissionKey="phim-hay"><AdminFeaturedPage /></PermissionRoute>} />
            <Route path="gia-ve" element={<PermissionRoute permissionKey="gia-ve"><AdminTicketPricingPage /></PermissionRoute>} />
            <Route path="thanh-vien" element={<PermissionRoute permissionKey="thanh-vien"><AdminMembershipPage /></PermissionRoute>} />
            <Route path="phan-quyen" element={<PermissionRoute permissionKey="phan-quyen"><AdminPermissionPage /></PermissionRoute>} />
          </Route>

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

            {/* Phim hay tháng */}
            <Route path="phim-hay" element={<FeaturedPage />} />
            <Route path="phim-hay/:slug" element={<FeaturedDetailPage />} />

            {/* Giá vé */}
            <Route path="gia-ve" element={<TicketPricingPage />} />

            {/* Thành viên */}
            <Route path="thanh-vien" element={<MembershipPage />} />

            {/* Tài khoản */}
            <Route path="tai-khoan" element={<AccountPage />} />
            <Route path="tai-khoan/:slug" element={<AccountPage />} />
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

