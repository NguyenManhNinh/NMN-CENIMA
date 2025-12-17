/**
 * =============================================================================
 * APP.JSX - Component gốc của ứng dụng
 * =============================================================================
 * Vị trí: src/App.jsx
 *
 * Chức năng:
 * - Cấu hình Router cho toàn bộ ứng dụng
 * - Wrap các Provider (Theme, Redux, Toast...)
 * - Định nghĩa routes cho Client, Admin, Staff
 *
 * Dependencies: react-router-dom, @mui/material
 * =============================================================================
 */

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

// ============================================================================
// APP COMPONENT
// ============================================================================
function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Reset CSS mặc định */}
      <CssBaseline />

      {/* Router với future flags để tắt cảnh báo v7 */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* ========== CLIENT ROUTES ========== */}
          <Route path="/" element={<ClientLayout />}>
            {/* Trang chủ */}
            <Route index element={<HomePage />} />

            {/* TODO: Thêm các routes khác */}
            {/* <Route path="movies" element={<MoviesPage />} /> */}
            {/* <Route path="movie/:id" element={<MovieDetailPage />} /> */}
            {/* <Route path="movie/:id/showtimes" element={<ShowtimesPage />} /> */}
            {/* <Route path="booking/:showtimeId/seats" element={<SeatSelectionPage />} /> */}
            {/* <Route path="profile" element={<ProfilePage />} /> */}
            {/* <Route path="tickets" element={<TicketsPage />} /> */}
          </Route>

          {/* ========== AUTH ROUTES ========== */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}

          {/* ========== ADMIN ROUTES ========== */}
          {/* <Route path="/admin" element={<AdminLayout />}> */}
          {/*   <Route index element={<DashboardPage />} /> */}
          {/* </Route> */}

          {/* ========== STAFF ROUTES ========== */}
          {/* <Route path="/staff" element={<StaffLayout />}> */}
          {/*   <Route index element={<CheckinPage />} /> */}
          {/* </Route> */}

          {/* ========== 404 ========== */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
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
