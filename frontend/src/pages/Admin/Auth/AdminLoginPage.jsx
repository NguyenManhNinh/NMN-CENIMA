import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import { adminLoginAPI } from '../../../apis/authApi';
import filmBg from '../../../assets/images/film-bg.png';

//Bảng màu
const COLORS = {
  cardBg: '#ffffff',       // Nền card đăng nhập
  text: '#1a1a2e',         // Chữ tiêu đề
  textSecondary: '#555',   // Chữ label
  border: '#ddd',          // Viền input
  primary: '#4285f4',      // Nút đăng nhập
  primaryHover: '#3367d6'  // Nút đăng nhập khi hover
};

//Trang đăng nhập Admin
function AdminLoginPage() {
  const navigate = useNavigate();

  // Trạng thái form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Xử lý đăng nhập — gọi API admin riêng (backend kiểm tra role)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Vui lòng nhập email'); return; }
    if (!password.trim()) { setError('Vui lòng nhập mật khẩu'); return; }

    setLoading(true);
    try {
      const response = await adminLoginAPI({ email, password });

      if (response.status === 'success') {
        // Xóa session cũ trước khi lưu mới (tránh đè dữ liệu user cũ)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        // Lưu token và thông tin user vào localStorage
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Chuyển đến trang quản trị
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      // Backend trả lỗi: 401 (sai pass), 403 (không có quyền admin), 423 (bị khóa)
      const message = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Nền toàn trang — ảnh film mờ tối
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
        // Lớp nền mờ phía sau (pseudo-element)
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${filmBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(6px) brightness(0.4)',
          transform: 'scale(1.05)',
          zIndex: 0
        }
      }}
    >
      {/* Khung chứa 2 panel (ảnh bên trái + form bên phải) */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          width: '100%',
          maxWidth: 1230,
          minHeight: 220,
          borderRadius: '5px',
          overflow: 'hidden',
          animation: 'adminFadeIn 0.5s ease-out',
          '@keyframes adminFadeIn': {
            from: { opacity: 0, transform: 'scale(0.97)' },
            to: { opacity: 1, transform: 'scale(1)' }
          },
          flexDirection: { xs: 'column', md: 'row' }
        }}
      >
        {/* Panel trái — Ảnh poster phim */}
        <Box
          sx={{
            flex: { xs: 'none', md: '1 1 65%' },
            minHeight: { xs: 180, md: 'auto' },
            backgroundImage: `url(${filmBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Panel phải — Form đăng nhập */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: { xs: 'none', md: '1 1 35%' },
            maxWidth: { md: 360 },
            backgroundColor: COLORS.cardBg,
            p: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* Tiêu đề */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: COLORS.text,
              mb: 3,
              textAlign: 'center',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: { xs: '1.4rem', sm: '1.6rem' }
            }}
          >
            Admin Đăng nhập
          </Typography>

          {/* Thông báo lỗi */}
          <Fade in={!!error}>
            <Box>
              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError('')}
                  sx={{ mb: 2, borderRadius: '8px' }}
                >
                  {error}
                </Alert>
              )}
            </Box>
          </Fade>

          {/* Ô nhập Email */}
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: COLORS.textSecondary,
              mb: 0.8
            }}
          >
            Email Address
          </Typography>
          <TextField
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@nmncinema.vn"
            size="small"
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '0.95rem',
                '& fieldset': { borderColor: COLORS.border },
                '&:hover fieldset': { borderColor: '#999' },
                '&.Mui-focused fieldset': { borderColor: 'transparent' },
                '&.Mui-focused': { boxShadow: 'none' }
              }
            }}
            autoComplete="email"
            autoFocus
          />

          {/* Ô nhập Mật khẩu */}
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: COLORS.textSecondary,
              mb: 0.8
            }}
          >
            Enter Password
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            size="small"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '0.95rem',
                '& fieldset': { borderColor: COLORS.border },
                '&:hover fieldset': { borderColor: '#999' },
                '&.Mui-focused fieldset': { borderColor: 'transparent' },
                '&.Mui-focused': { boxShadow: 'none' }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    sx={{ color: '#888' }}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            autoComplete="current-password"
          />

          {/* Nút đăng nhập */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.2,
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: COLORS.primary,
              boxShadow: '0 2px 8px rgba(66,133,244,0.3)',
              '&:hover': {
                backgroundColor: COLORS.primaryHover,
                boxShadow: '0 4px 12px rgba(66,133,244,0.4)'
              },
              '&.Mui-disabled': {
                backgroundColor: '#ccc'
              }
            }}
            startIcon={
              loading
                ? <CircularProgress size={18} color="inherit" />
                : <LockOpenIcon sx={{ fontSize: 18 }} />
            }
          >
            {loading ? 'Đang đăng nhập...' : 'Sign in'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default AdminLoginPage;
