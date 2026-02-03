import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { getGoogleAuthURL } from '../../../apis/authApi';

// // Mascot image
import mascotImage from '../../../assets/images/NMN_CENIMA_LOGO.png';

// STYLES
const styles = {
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: 3,
      maxWidth: 420,
      width: '100%',
      margin: 2,
      overflow: 'visible',
      maxHeight: '90vh',
      '&::-webkit-scrollbar': {
        display: 'none'
      },
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    },
    '& .MuiDialogContent-root': {
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        display: 'none'
      },
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    color: '#666',
    '&:focus': {
      outline: 'none'
    },
    '&.Mui-focusVisible': {
      outline: 'none'
    }
  },
  mascotContainer: {
    display: 'flex',
    justifyContent: 'center',
    mt: { xs: -4, sm: -6 },
    mb: 2
  },
  mascot: {
    width: { xs: 140, sm: 180 },
    height: { xs: 100, sm: 130 },
    objectFit: 'contain'
  },
  title: {
    fontWeight: 700,
    fontSize: '1.5rem',
    color: '#1a3a5c',
    textAlign: 'center',
    mb: 3
  },
  input: {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      backgroundColor: '#f9f9f9',
      '&:hover': {
        backgroundColor: '#f5f5f5'
      },
      '&.Mui-focused': {
        backgroundColor: 'white',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#1a3a5c'
        }
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderWidth: 1
      }
    }
  },
  inputLabel: {
    fontSize: '0.85rem',
    color: '#666',
    mb: 0.5,
    fontWeight: 500
  },
  submitButton: {
    mt: 1,
    py: 1.5,
    borderRadius: 1.5,
    backgroundColor: '#1a3a5c',
    fontWeight: 600,
    fontSize: '1rem',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#1a3a5c'
    },
    '&:focus': {
      outline: 'none'
    },
    '&.Mui-focusVisible': {
      outline: 'none'
    }
  },
  forgotPassword: {
    color: '#141313ff',
    fontSize: '0.9rem',
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover': {
      color: '#1a3a5c'
    },
    '&:focus': {
      outline: 'none'
    }
  },
  registerPrompt: {
    textAlign: 'center',
    mt: 2,
    color: '#070606ff',
    fontSize: '0.9rem'
  },
  registerLink: {
    color: '#1a3a5c',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    border: '1px solid #1a3a5c',
    borderRadius: 1.5,
    px: 4,
    py: 1,
    display: 'inline-block',
    mt: 1,
    '&:hover': {
      backgroundColor: 'rgba(242, 107, 56, 0.1)'
    },
    '&:focus': {
      outline: 'none'
    }
  },
  socialDivider: {
    my: 2,
    '& .MuiDivider-wrapper': {
      fontSize: '0.95rem',
      color: '#999'
    }
  },
  socialButton: {
    flex: 1,
    py: 1,
    borderRadius: 1.5,
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.9rem',
    '&:focus': {
      outline: 'none'
    },
    '&.Mui-focusVisible': {
      outline: 'none'
    }
  },
  googleButton: {
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #ddd',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      border: '1px solid #ccc'
    }
  }
};

function LoginModal({ open, onClose, onSwitchToRegister, onForgotPassword, onSuccess }) {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setLocalError('');
    clearError();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setLocalError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    setLoading(true);
    setLocalError('');

    const result = await login(email, password);

    setLoading(false);

    if (result.success) {
      onSuccess?.(); // Callback để parent reload data nếu cần
      handleClose();
    } else {
      setLocalError(result.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthURL();
  };

  const handleFacebookLogin = () => {
    window.location.href = getFacebookAuthURL();
  };

  const handleSwitchToRegister = () => {
    handleClose();
    onSwitchToRegister();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={styles.dialog}
    >
      <IconButton sx={styles.closeButton} onClick={handleClose}>
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ pt: 8, pb: 4, px: 4 }}>
        {/* Mascot */}
        <Box sx={styles.mascotContainer}>
          <Box
            component="img"
            src={mascotImage}
            alt="NMN Cinema"
            sx={styles.mascot}
          />
        </Box>

        {/* Title */}
        <Typography sx={styles.title}>
          Đăng Nhập Tài Khoản
        </Typography>

        {/* Error Alert */}
        {(localError || error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {localError || error}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Email */}
          <Typography sx={styles.inputLabel}>Email</Typography>
          <TextField
            fullWidth
            placeholder="Nhập Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={styles.input}
            type="email"
            autoComplete="email"
          />

          {/* Password */}
          <Typography sx={styles.inputLabel}>Mật khẩu</Typography>
          <TextField
            fullWidth
            placeholder="Nhập Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={styles.input}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    sx={{
                      '&:focus': {
                        outline: 'none'
                      },
                      '&.Mui-focusVisible': {
                        outline: 'none'
                      }
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={styles.submitButton}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'ĐĂNG NHẬP'}
          </Button>
        </Box>

        {/* Forgot Password */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link
            component="button"
            type="button"
            sx={styles.forgotPassword}
            onClick={onForgotPassword}
          >
            Quên mật khẩu?
          </Link>
        </Box>

        {/* Social Login */}
        <Divider sx={styles.socialDivider}>hoặc đăng nhập với</Divider>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleGoogleLogin}
            sx={{ ...styles.socialButton, ...styles.googleButton, flex: 1, maxWidth: 300 }}
            startIcon={
              <Box
                component="img"
                src="https://www.google.com/favicon.ico"
                alt="Google"
                sx={{ width: 20, height: 20 }}
              />
            }
          >
            Google
          </Button>
        </Box>

        {/* Register Prompt */}
        <Box sx={styles.registerPrompt}>
          <Typography variant="body2" color="textSecondary">
            Bạn chưa có tài khoản?
          </Typography>
          <Link
            component="button"
            type="button"
            sx={styles.registerLink}
            onClick={handleSwitchToRegister}
          >
            Đăng ký
          </Link>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;
