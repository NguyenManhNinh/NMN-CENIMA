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
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

// Mascot image
import mascotImage from '../../../assets/images/NMN_CENIMA_LOGO.png';

// STYLES
const styles = {
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: 3,
      maxWidth: 450,
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
  genderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 2
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
  termsContainer: {
    mb: 2
  },
  termsLink: {
    color: '#1E88E5',
    textDecoration: 'underline',
    cursor: 'pointer',
    '&:focus': {
      outline: 'none'
    }
  },
  loginPrompt: {
    textAlign: 'center',
    mt: 2,
    color: '#666',
    fontSize: '0.9rem'
  },
  loginLink: {
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
      }
    }
  }
};

function RegisterModal({ open, onClose, onSwitchToLogin }) {
  const { register, verifyOTP, error, clearError } = useAuth();

  // Form state
  const [step, setStep] = useState(1); // 1: Register form, 2: OTP verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    birthday: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      birthday: '',
      password: '',
      confirmPassword: ''
    });
    setOtp(['', '', '', '']);
    setLocalError('');
    setAcceptTerms(false);
    clearError();
    onClose();
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Move to previous on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setLocalError('Vui lòng nhập họ và tên!');
      return false;
    }
    if (!formData.email.trim()) {
      setLocalError('Vui lòng nhập email!');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('Email không hợp lệ!');
      return false;
    }
    if (!formData.password) {
      setLocalError('Vui lòng nhập mật khẩu!');
      return false;
    }
    if (formData.password.length < 8) {
      setLocalError('Mật khẩu phải có ít nhất 8 ký tự!');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp!');
      return false;
    }
    if (!acceptTerms) {
      setLocalError('Vui lòng đồng ý với điều khoản dịch vụ!');
      return false;
    }
    return true;
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setLocalError('');

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
      gender: formData.gender,
      birthday: formData.birthday || undefined
    });

    setLoading(false);

    if (result.success) {
      // Move to OTP verification step
      setStep(2);
    } else {
      setLocalError(result.message);
    }
  };

  const handleSubmitOTP = async (e) => {
    e.preventDefault();

    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setLocalError('Vui lòng nhập đầy đủ mã OTP!');
      return;
    }

    setLoading(true);
    setLocalError('');

    const result = await verifyOTP(formData.email, otpCode);

    setLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setLocalError(result.message);
    }
  };

  const handleSwitchToLogin = () => {
    handleClose();
    onSwitchToLogin();
  };

  // Render OTP Step
  const renderOTPStep = () => (
    <Box component="form" onSubmit={handleSubmitOTP}>
      <Typography sx={{ textAlign: 'center', mb: 3, color: '#666' }}>
        Mã xác thực OTP đã được gửi đến email<br />
        <strong>{formData.email}</strong>
      </Typography>

      {/* OTP Inputs */}
      <Box sx={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextField
            key={index}
            id={`otp-${index}`}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            sx={styles.otpInput}
            inputProps={{ maxLength: 1 }}
            autoFocus={index === 0}
          />
        ))}
      </Box>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={styles.submitButton}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'XÁC NHẬN'}
      </Button>

      {/* Resend OTP */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Không nhận được mã?{' '}
          <Link
            component="button"
            type="button"
            sx={styles.loginLink}
            onClick={() => {/* TODO: Resend OTP */ }}
          >
            Gửi lại
          </Link>
        </Typography>
      </Box>
    </Box>
  );

  // Render Register Form
  const renderRegisterForm = () => (
    <Box component="form" onSubmit={handleSubmitRegister}>
      {/* Name */}
      <Typography sx={styles.inputLabel}>Họ và tên</Typography>
      <TextField
        fullWidth
        placeholder="Nhập Họ và tên"
        value={formData.name}
        onChange={handleChange('name')}
        sx={styles.input}
      />

      {/* Email */}
      <Typography sx={styles.inputLabel}>Email</Typography>
      <TextField
        fullWidth
        placeholder="Nhập Email"
        value={formData.email}
        onChange={handleChange('email')}
        sx={styles.input}
        type="email"
      />

      {/* Phone */}
      <Typography sx={styles.inputLabel}>Số điện thoại</Typography>
      <TextField
        fullWidth
        placeholder="Nhập Số điện thoại"
        value={formData.phone}
        onChange={handleChange('phone')}
        sx={styles.input}
      />

      {/* Gender */}
      <Box sx={styles.genderContainer}>
        <RadioGroup
          row
          value={formData.gender}
          onChange={handleChange('gender')}
        >
          <FormControlLabel value="male" control={<Radio />} label="Nam" />
          <FormControlLabel value="female" control={<Radio />} label="Nữ" />
        </RadioGroup>
      </Box>

      {/* Birthday */}
      <Typography sx={styles.inputLabel}>Ngày sinh</Typography>
      <TextField
        fullWidth
        placeholder="Ngày/Tháng/Năm"
        value={formData.birthday}
        onChange={handleChange('birthday')}
        sx={styles.input}
        type="date"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <CalendarIcon />
            </InputAdornment>
          )
        }}
        InputLabelProps={{ shrink: true }}
      />

      {/* Password */}
      <Typography sx={styles.inputLabel}>Mật khẩu</Typography>
      <TextField
        fullWidth
        placeholder="Nhập Mật khẩu"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange('password')}
        sx={styles.input}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end"
                sx={{
                  '&:focus': {
                    outline: 'none'
                  },
                  '&.Mui-focusVisible': {
                    outline: 'none'
                  }
                }}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {/* Confirm Password */}
      <Typography sx={styles.inputLabel}>Nhập lại mật khẩu</Typography>
      <TextField
        fullWidth
        placeholder="Nhập lại mật khẩu"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        sx={styles.input}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end"
                sx={{
                  '&:focus': {
                    outline: 'none'
                  },
                  '&.Mui-focusVisible': {
                    outline: 'none'
                  }
                }}>
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {/* Terms */}
      <Box sx={styles.termsContainer}>
        <FormControlLabel
          control={
            <Checkbox
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2" color="textSecondary">
              Bằng việc đăng ký tài khoản, tôi đồng ý với{' '}
              <Link sx={styles.termsLink}>Điều khoản dịch vụ</Link>
              {' '}và{' '}
              <Link sx={styles.termsLink}>Chính sách bảo mật</Link>
              {' '}của NMN Cinema.
            </Typography>
          }
        />
      </Box>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={styles.submitButton}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'HOÀN THÀNH'}
      </Button>

      {/* Login Prompt */}
      <Box sx={styles.loginPrompt}>
        <Typography variant="body2" color="textSecondary">
          Đã có tài khoản?{' '}
          <Link
            component="button"
            type="button"
            sx={styles.loginLink}
            onClick={handleSwitchToLogin}
          >
            Đăng nhập
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
          {step === 1 ? 'Đăng Ký Tài Khoản' : 'Xác Thực OTP'}
        </Typography>

        {/* Error Alert */}
        {(localError || error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {localError || error}
          </Alert>
        )}

        {/* Content */}
        {step === 1 ? renderRegisterForm() : renderOTPStep()}
      </DialogContent>
    </Dialog>
  );
}

export default RegisterModal;
