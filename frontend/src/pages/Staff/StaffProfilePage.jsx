import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, Button, CircularProgress } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import { getMeAPI } from '../../apis/authApi';

function StaffProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMeAPI();
        setUser(res.data?.user || null);
      } catch {
        // If token invalid, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/staff/dang-nhap', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/staff/dang-nhap', { replace: true });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#1a1a2e', textAlign: 'center', mb: 3 }}>
        Thông tin cá nhân
      </Typography>

      {/* Avatar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar
          src={user?.avatar}
          sx={{ width: 80, height: 80, bgcolor: '#1B4F93', fontSize: '2rem' }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'S'}
        </Avatar>
      </Box>

      {/* Info card */}
      <Box sx={{ bgcolor: '#fff', border: '1px solid #eee', borderRadius: '4px', p: 2, mb: 3 }}>
        <InfoItem icon={<PersonIcon sx={{ fontSize: 20, color: '#1B4F93' }} />} label="Họ tên" value={user?.name || '—'} />
        <InfoItem icon={<EmailIcon sx={{ fontSize: 20, color: '#1B4F93' }} />} label="Email" value={user?.email || '—'} />
        <InfoItem icon={<BadgeIcon sx={{ fontSize: 20, color: '#1B4F93' }} />} label="Chức vụ" value={user?.role?.name || user?.role || '—'} last />
      </Box>

      {/* Logout button */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{
          py: 1.2,
          borderRadius: '4px',
          fontSize: '0.95rem',
          fontWeight: 600,
          textTransform: 'none',
          borderColor: '#e53935',
          color: '#e53935',
          '&:hover': {
            bgcolor: '#ffebee',
            borderColor: '#c62828'
          }
        }}
      >
        Đăng xuất
      </Button>
    </Box>
  );
}

function InfoItem({ icon, label, value, last }) {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      py: 1.5,
      borderBottom: last ? 'none' : '1px solid #f5f5f5'
    }}>
      {icon}
      <Box>
        <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>{value}</Typography>
      </Box>
    </Box>
  );
}

export default StaffProfilePage;
