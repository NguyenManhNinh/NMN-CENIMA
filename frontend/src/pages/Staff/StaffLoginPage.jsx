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
import { loginAPI } from '../../apis/authApi';
import filmBg from '../../assets/images/film-bg.png';

const COLORS = {
  cardBg: '#ffffff',
  text: '#1a1a2e',
  textSecondary: '#555',
  border: '#ddd',
  primary: '#4285f4',
  primaryHover: '#3367d6'
};

function StaffLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Vui lòng nhập email'); return; }
    if (!password.trim()) { setError('Vui lòng nhập mật khẩu'); return; }

    setLoading(true);
    try {
      const response = await loginAPI({ email, password });

      if (response.status === 'success') {
        const user = response.data.user;
        const role = user.role?.slug || user.role;
        if (!['staff', 'manager', 'admin'].includes(role)) {
          setError('Tài khoản không có quyền nhân viên');
          setLoading(false);
          return;
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('user', JSON.stringify(user));

        navigate('/staff', { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
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
          animation: 'staffFadeIn 0.5s ease-out',
          '@keyframes staffFadeIn': {
            from: { opacity: 0, transform: 'scale(0.97)' },
            to: { opacity: 1, transform: 'scale(1)' }
          },
          flexDirection: { xs: 'column', md: 'row' }
        }}
      >
        {/* Panel trái — Ảnh phim */}
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
            Staff Đăng nhập
          </Typography>

          <Fade in={!!error}>
            <Box>
              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError('')}
                  sx={{ mb: 2, borderRadius: '4px' }}
                >
                  {error}
                </Alert>
              )}
            </Box>
          </Fade>

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
            placeholder="staff@nmncinema.vn"
            size="small"
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
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
                borderRadius: '4px',
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.2,
              borderRadius: '4px',
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

export default StaffLoginPage;
