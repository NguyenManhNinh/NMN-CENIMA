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
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { forgotPasswordAPI, resetPasswordAPI } from '../../../apis/authApi';

// Mascot image
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
  backButton: {
    position: 'absolute',
    top: 8,
    left: 8,
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
    mt: -6,
    mb: 2
  },
  mascot: {
    width: 180,
    height: 130,
    objectFit: 'contain'
  },
  title: {
    fontWeight: 700,
    fontSize: '1.5rem',
    color: '#1a3a5c',
    textAlign: 'center',
    mb: 1
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#666',
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
          borderColor: '#1a3a5c',
          borderWidth: 1
        }
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
  otpContainer: {
    display: 'flex',
    gap: 1,
    justifyContent: 'center',
    mb: 3
  },
  otpInput: {
    width: 60,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      '& input': {
        textAlign: 'center',
        fontSize: '1.5rem',
        fontWeight: 700,
        padding: '12px'
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1a3a5c',
        borderWidth: 1
      }
    }
  },
  resendLink: {
    color: '#1a3a5c',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:hover': {
      color: '#1a3a5c'
    },
    '&:focus': {
      outline: 'none'
    }
  }
};

function ForgotPasswordModal({ open, onClose, onBackToLogin }) {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: New password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp(['', '', '', '']);
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  const handleBack = () => {
    if (step === 1) {
      handleClose();
      onBackToLogin();
    } else {
      setStep(step - 1);
      setError('');
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`forgot-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`forgot-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Step 1: Submit email
  const handleSubmitEmail = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Vui lòng nhập email!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await forgotPasswordAPI({ email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP and new password
  const handleSubmitReset = async (e) => {
    e.preventDefault();

    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setError('Vui lòng nhập đầy đủ mã OTP!');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu mới!');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPasswordAPI({ email, otp: otpCode, password });
      setSuccess('Đặt lại mật khẩu thành công!');
      setTimeout(() => {
        handleClose();
        onBackToLogin();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  // Render Step 1: Enter email
  const renderEmailStep = () => (
    <Box component="form" onSubmit={handleSubmitEmail}>
      <Typography sx={styles.inputLabel}>Email</Typography>
      <TextField
        fullWidth
        placeholder="Nhập Email đăng ký"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={styles.input}
        type="email"
        autoFocus
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={styles.submitButton}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'GỬI MÃ XÁC NHẬN'}
      </Button>
    </Box>
  );

  // Render Step 2: Enter OTP and new password
  const renderResetStep = () => (
    <Box component="form" onSubmit={handleSubmitReset}>
      <Typography sx={{ textAlign: 'center', mb: 2, color: '#666' }}>
        Mã xác thực OTP đã được gửi đến email<br />
        <strong>{email}</strong>
      </Typography>

      {/* OTP Inputs */}
      <Typography sx={styles.inputLabel}>Mã OTP</Typography>
      <Box sx={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextField
            key={index}
            id={`forgot-otp-${index}`}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            sx={styles.otpInput}
            inputProps={{ maxLength: 1 }}
            autoFocus={index === 0}
          />
        ))}
      </Box>

      {/* New Password */}
      <Typography sx={styles.inputLabel}>Mật khẩu mới</Typography>
      <TextField
        fullWidth
        placeholder="Nhập mật khẩu mới"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={styles.input}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {/* Confirm Password */}
      <Typography sx={styles.inputLabel}>Xác nhận mật khẩu</Typography>
      <TextField
        fullWidth
        placeholder="Nhập lại mật khẩu mới"
        type={showConfirmPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={styles.input}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={styles.submitButton}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'ĐẶT LẠI MẬT KHẨU'}
      </Button>

      {/* Resend OTP */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Không nhận được mã?{' '}
          <Link
            component="button"
            type="button"
            sx={styles.resendLink}
            onClick={handleSubmitEmail}
          >
            Gửi lại
          </Link>
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={styles.dialog}
    >
      <IconButton sx={styles.backButton} onClick={handleBack}>
        <ArrowBackIcon />
      </IconButton>
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
          Quên Mật Khẩu
        </Typography>

        <Typography sx={styles.subtitle}>
          {step === 1
            ? 'Nhập email đăng ký để nhận mã xác thực OTP'
            : 'Nhập mã OTP và mật khẩu mới'
          }
        </Typography>

        {/* Error/Success Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Content */}
        {step === 1 ? renderEmailStep() : renderResetStep()}
      </DialogContent>
    </Dialog>
  );
}

export default ForgotPasswordModal;
