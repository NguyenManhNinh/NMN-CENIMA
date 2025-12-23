import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

// Logo
import LogoImage from '../../../assets/images/NMN_CENIMA_LOGO.png';

/**
 * OAuth Callback Page
 * Xử lý redirect từ Google/Facebook OAuth
 * Lưu token và user vào localStorage, sau đó redirect về home
 */
function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth Error:', error);
      navigate('/?error=auth_failed');
      return;
    }

    if (token && userParam) {
      try {
        // Decode và parse user data
        const userData = JSON.parse(decodeURIComponent(userParam));

        // Lưu vào localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Cập nhật AuthContext
        setUser(userData);

        // Delay nhẹ để hiệu ứng loading mượt hơn
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 800);
      } catch (err) {
        console.error('Error parsing OAuth data:', err);
        navigate('/?error=parse_failed');
      }
    } else {
      navigate('/?error=missing_data');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%)',
        zIndex: 9999
      }}
    >
      {/* Logo */}
      <Box
        component="img"
        src={LogoImage}
        alt="NMN Cinema"
        sx={{
          width: 150,
          height: 'auto',
          mb: 4,
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' }
          }
        }}
      />

      {/* Loading Spinner */}
      <Box sx={{ position: 'relative', mb: 3 }}>
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: '#F9F400',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }}
        />
      </Box>

      {/* Text */}
      <Typography
        variant="h6"
        sx={{
          color: 'white',
          fontWeight: 500,
          fontSize: '1.1rem',
          textAlign: 'center',
          animation: 'fadeInOut 1.5s ease-in-out infinite',
          '@keyframes fadeInOut': {
            '0%': { opacity: 0.5 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.5 }
          }
        }}
      >
        Đang xử lý đăng nhập...
      </Typography>

      <Typography
        sx={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.85rem',
          mt: 1
        }}
      >
        Vui lòng chờ trong giây lát
      </Typography>
    </Box>
  );
}

export default OAuthCallback;
