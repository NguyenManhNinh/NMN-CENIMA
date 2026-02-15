import { useState, useEffect } from 'react';
import {
  Box, Typography, Dialog, DialogContent,
  TextField, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel,
  Select, MenuItem, InputLabel, Snackbar, Alert,
  CircularProgress, IconButton, InputAdornment
} from '@mui/material';
import {
  Settings as SettingsIcon,
  VpnKey as KeyIcon,
  ExitToApp as LogoutIcon,
  Visibility, VisibilityOff,
  CheckCircleOutline as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { updateMeAPI, updatePasswordAPI, deleteMeAPI } from '../../../apis/userApi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const font = '"Nunito Sans", sans-serif';

const PROVINCES_API = 'https://provinces.open-api.vn/api';

const ITEMS = [
  { key: 'info', label: 'Thay đổi thông tin thành viên', icon: SettingsIcon },
  { key: 'password', label: 'Thay đổi mật khẩu', icon: KeyIcon },
  { key: 'logout', label: 'Ly Khai', icon: LogoutIcon }
];

// Style cho input dạng underline
const underlineInput = {
  '& .MuiInput-underline:before': { borderBottomColor: '#ccc' },
  '& .MuiInput-underline:hover:before': { borderBottomColor: '#999' },
  '& .MuiInput-underline:after': { borderBottomColor: '#C9A86A' },
  '& .MuiInputLabel-root': {
    fontFamily: font, fontSize: '0.82rem', color: '#888',
    '&.Mui-focused': { color: '#C9A86A' }
  },
  '& .MuiInputBase-input': {
    fontFamily: font, fontSize: '0.95rem', fontWeight: 600, color: '#222'
  }
};

const selectSx = {
  fontFamily: font,
  fontSize: '0.95rem',
  fontWeight: 600,
  '&:before': { borderBottomColor: '#ccc' },
  '&:after': { borderBottomColor: '#C9A86A' }
};

const selectLabelSx = {
  fontFamily: font, fontSize: '0.82rem', color: '#888',
  '&.Mui-focused': { color: '#C9A86A' }
};

export default function AccountInfo() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // Trạng thái modal
  const [infoModal, setInfoModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Trạng thái xóa tài khoản
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePw, setShowDeletePw] = useState(false);

  // Trạng thái form đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: '', password: '', passwordConfirm: ''
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Trạng thái form thông tin
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    gender: 'male', birthday: '',
    address: '', city: '', district: ''
  });

  // Trạng thái API tỉnh/thành phố
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Load provinces khi mở modal
  useEffect(() => {
    if (infoModal && provinces.length === 0) {
      setLoadingProvinces(true);
      axios.get(`${PROVINCES_API}/?depth=1`)
        .then(res => setProvinces(res.data))
        .catch(err => console.error('Load provinces failed:', err))
        .finally(() => setLoadingProvinces(false));
    }
  }, [infoModal]);

  // Load districts khi chọn city
  useEffect(() => {
    if (formData.city) {
      // Tìm province code từ tên
      const province = provinces.find(p => p.name === formData.city);
      if (province) {
        setLoadingDistricts(true);
        axios.get(`${PROVINCES_API}/p/${province.code}?depth=2`)
          .then(res => setDistricts(res.data.districts || []))
          .catch(err => console.error('Load districts failed:', err))
          .finally(() => setLoadingDistricts(false));
      }
    } else {
      setDistricts([]);
    }
  }, [formData.city, provinces]);

  const handleChange = (field) => (e) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: e.target.value };
      // Reset district khi đổi city
      if (field === 'city') updated.district = '';
      return updated;
    });
  };

  const handleOpenInfoModal = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender || 'male',
      birthday: user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
      address: user?.address || '',
      city: user?.city || '',
      district: user?.district || ''
    });
    setInfoModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        birthday: formData.birthday || undefined,
        address: formData.address,
        city: formData.city,
        district: formData.district
      };
      const res = await updateMeAPI(payload);
      const updatedUser = res.data?.user || { ...user, ...payload };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSnackbar({ open: true, message: 'Cập nhật thông tin thành công!', severity: 'success' });
      setInfoModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Cập nhật thất bại!';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  //PASSWORD MODAL
  const handleOpenPasswordModal = () => {
    setPasswordData({ passwordCurrent: '', password: '', passwordConfirm: '' });
    setShowPw({ current: false, new: false, confirm: false });
    setPasswordModal(true);
  };

  // Quy tắc xác thực mật khẩu
  const pwRules = [
    { label: 'Có 8 đến 16 ký tự', valid: passwordData.password.length >= 8 && passwordData.password.length <= 16 },
    { label: 'Ít nhất 1 chữ in hoa', valid: /[A-Z]/.test(passwordData.password) },
    { label: 'Ít nhất 1 chữ số, kí tự đặc biệt', valid: /[0-9]/.test(passwordData.password) && /[^A-Za-z0-9]/.test(passwordData.password) }
  ];

  const handleChangePassword = async () => {
    if (passwordData.password !== passwordData.passwordConfirm) {
      setSnackbar({ open: true, message: 'Mật khẩu xác nhận không khớp!', severity: 'error' });
      return;
    }
    if (!pwRules.every(r => r.valid)) {
      setSnackbar({ open: true, message: 'Mật khẩu mới chưa đạt yêu cầu!', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await updatePasswordAPI(passwordData);
      if (res.token) localStorage.setItem('accessToken', res.token);
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      setSnackbar({ open: true, message: 'Đổi mật khẩu thành công!', severity: 'success' });
      setPasswordModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại!';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ========== LY KHAI (XÓA TÀI KHOẢN) ==========
  const handleOpenDeleteModal = () => {
    setDeletePassword('');
    setShowDeletePw(false);
    setDeleteModal(true);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setSnackbar({ open: true, message: 'Vui lòng nhập mật khẩu!', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      await deleteMeAPI({ password: deletePassword });
      setDeleteModal(false);
      await logout();
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Xóa tài khoản thất bại!';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#fff' }}>
      {/* 3 mục chức năng */}
      <Box sx={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        {ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Box
              key={item.key}
              onClick={() => {
                if (item.key === 'info') handleOpenInfoModal();
                if (item.key === 'password') handleOpenPasswordModal();
                if (item.key === 'logout') handleOpenDeleteModal();
              }}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                px: 2,
                py: 1.8,
                cursor: 'pointer',
                borderRight: idx < ITEMS.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
              }}
            >
              <Icon sx={{ fontSize: 20, color: 'rgba(0,0,0,0.4)' }} />
              <Typography sx={{
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'rgba(0,0,0,0.6)',
                fontFamily: font,
                whiteSpace: 'nowrap'
              }}>
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* ==================== MODAL: Thay đổi thông tin thành viên ==================== */}
      <Dialog
        open={infoModal}
        onClose={() => setInfoModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            px: { xs: 2, sm: 4 },
            py: 3,
            maxWidth: 580
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Tiêu đề */}
          <Typography sx={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#1a2332',
            fontFamily: font,
            mb: 3
          }}>
            Thay đổi thông tin thành viên
          </Typography>

          {/* Số điện thoại - readonly */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth variant="standard" label="Số điện thoại"
              value={formData.phone}
              InputProps={{ readOnly: true }}
              sx={underlineInput}
            />
          </Box>

          {/* Row: Họ tên + Email */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <TextField
              fullWidth variant="standard" label="Họ tên"
              value={formData.name}
              onChange={handleChange('name')}
              sx={{ ...underlineInput, flex: 1 }}
            />
            <TextField
              fullWidth variant="standard" label="Email"
              value={formData.email}
              InputProps={{ readOnly: true }}
              sx={{
                ...underlineInput, flex: 1,
                '& .MuiInputBase-input': { ...underlineInput['& .MuiInputBase-input'], color: '#888' }
              }}
            />
          </Box>

          {/* Row: Giới tính + Ngày sinh */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'flex-end' }}>
            <Box sx={{ flex: 1 }}>
              <FormControl>
                <FormLabel sx={{
                  fontFamily: font, fontSize: '0.82rem', color: '#888', mb: 0.5,
                  '&.Mui-focused': { color: '#C9A86A' }
                }}>
                  Giới tính:
                </FormLabel>
                <RadioGroup row value={formData.gender} onChange={handleChange('gender')}>
                  {[
                    { value: 'male', label: 'Nam' },
                    { value: 'female', label: 'Nữ' },
                    { value: 'other', label: 'Khác' }
                  ].map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      value={opt.value}
                      control={<Radio size="small" sx={{ color: '#ccc', '&.Mui-checked': { color: '#C9A86A' } }} />}
                      label={
                        <Typography sx={{ fontFamily: font, fontSize: '0.88rem', fontWeight: 500, color: '#333' }}>
                          {opt.label}
                        </Typography>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth variant="standard" label="Ngày sinh" type="date"
                value={formData.birthday}
                onChange={handleChange('birthday')}
                InputLabelProps={{ shrink: true }}
                sx={underlineInput}
              />
            </Box>
          </Box>

          {/* Hàng: Thành phố + Quận/huyện — dữ liệu từ API */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <FormControl variant="standard" fullWidth sx={{ flex: 1 }}>
              <InputLabel sx={selectLabelSx}>Thành phố</InputLabel>
              <Select
                value={formData.city}
                onChange={handleChange('city')}
                sx={selectSx}
                endAdornment={loadingProvinces ? <CircularProgress size={16} sx={{ mr: 2 }} /> : null}
              >
                <MenuItem value="">
                  <em>Chọn tỉnh/thành phố</em>
                </MenuItem>
                {provinces.map((p) => (
                  <MenuItem key={p.code} value={p.name}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="standard" fullWidth sx={{ flex: 1 }}>
              <InputLabel sx={selectLabelSx}>Quận/huyện</InputLabel>
              <Select
                value={formData.district}
                onChange={handleChange('district')}
                sx={selectSx}
                disabled={!formData.city || loadingDistricts}
                endAdornment={loadingDistricts ? <CircularProgress size={16} sx={{ mr: 2 }} /> : null}
              >
                <MenuItem value="">
                  <em>Chọn quận/huyện</em>
                </MenuItem>
                {districts.map((d) => (
                  <MenuItem key={d.code} value={d.name}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Địa chỉ */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth variant="standard" label="Địa chỉ"
              value={formData.address}
              onChange={handleChange('address')}
              sx={underlineInput}
            />
          </Box>

          {/* Nút bấm */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setInfoModal(false)}
              sx={{
                fontFamily: font, fontSize: '0.9rem', fontWeight: 700,
                textTransform: 'none', px: 5, py: 1.2, borderRadius: 1,
                borderColor: '#333', color: '#333',
                '&:hover': { borderColor: '#111', bgcolor: 'rgba(0,0,0,0.02)' }
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{
                fontFamily: font, fontSize: '0.9rem', fontWeight: 700,
                textTransform: 'none', px: 5, py: 1.2, borderRadius: 1,
                bgcolor: '#1a2332', color: '#fff',
                '&:hover': { bgcolor: '#0f1720' }
              }}
            >
              {saving ? 'Đang lưu...' : 'Thay đổi'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ==================== MODAL: Thay đổi mật khẩu ==================== */}
      <Dialog
        open={passwordModal}
        onClose={() => setPasswordModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            px: { xs: 2, sm: 4 },
            py: 3,
            maxWidth: 440
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Typography sx={{
            fontSize: '1.2rem', fontWeight: 800,
            color: '#1a2332', fontFamily: font, mb: 3, textAlign: 'center'
          }}>
            Thay đổi mật khẩu
          </Typography>

          {/* Mật khẩu hiện tại */}
          <Box sx={{ mb: 2.5 }}>
            <TextField
              fullWidth variant="standard" label="Mật khẩu hiện tại"
              type={showPw.current ? 'text' : 'password'}
              value={passwordData.passwordCurrent}
              onChange={(e) => setPasswordData(p => ({ ...p, passwordCurrent: e.target.value }))}
              sx={underlineInput}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
                      {showPw.current ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Mật khẩu mới */}
          <Box sx={{ mb: 1 }}>
            <TextField
              fullWidth variant="standard" label="Mật khẩu mới"
              type={showPw.new ? 'text' : 'password'}
              value={passwordData.password}
              onChange={(e) => setPasswordData(p => ({ ...p, password: e.target.value }))}
              sx={underlineInput}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}>
                      {showPw.new ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Quy tắc xác thực */}
          <Box sx={{ mb: 2.5, pl: 0.5 }}>
            {pwRules.map((rule, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.3 }}>
                <CheckIcon sx={{ fontSize: 18, color: rule.valid ? '#C9A86A' : '#ccc' }} />
                <Typography sx={{
                  fontFamily: font, fontSize: '0.78rem',
                  color: rule.valid ? '#333' : '#999'
                }}>
                  {rule.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Nhập lại mật khẩu */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth variant="standard" label="Nhập lại mật khẩu"
              type={showPw.confirm ? 'text' : 'password'}
              value={passwordData.passwordConfirm}
              onChange={(e) => setPasswordData(p => ({ ...p, passwordConfirm: e.target.value }))}
              sx={underlineInput}
              error={passwordData.passwordConfirm.length > 0 && passwordData.password !== passwordData.passwordConfirm}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                      {showPw.confirm ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Nút bấm */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setPasswordModal(false)}
              sx={{
                fontFamily: font, fontSize: '0.9rem', fontWeight: 700,
                textTransform: 'none', px: 5, py: 1.2, borderRadius: 1,
                borderColor: '#333', color: '#333',
                '&:hover': { borderColor: '#111', bgcolor: 'rgba(0,0,0,0.02)' }
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={saving || !passwordData.passwordCurrent || !passwordData.password || !passwordData.passwordConfirm}
              sx={{
                fontFamily: font, fontSize: '0.9rem', fontWeight: 700,
                textTransform: 'none', px: 5, py: 1.2, borderRadius: 1,
                bgcolor: '#1a2332', color: '#fff',
                '&:hover': { bgcolor: '#0f1720' }
              }}
            >
              {saving ? 'Đang xử lý...' : 'Thay đổi'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ==================== MODAL: Ly Khai (Xóa tài khoản) ==================== */}
      <Dialog
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden', maxWidth: 480 }
        }}
      >
        {/* Thanh tiêu đề */}
        <Box sx={{
          bgcolor: '#f5f0e8',
          borderBottom: '2px solid #C9A86A',
          py: 2, px: 3, textAlign: 'center'
        }}>
          <Typography sx={{
            fontSize: '1.15rem', fontWeight: 800,
            color: '#1a2332', fontFamily: font
          }}>
            Xóa tài khoản
          </Typography>
        </Box>

        <DialogContent sx={{ px: 3, pt: 3, pb: 2 }}>
          {/* Danh sách cảnh báo */}
          <Box component="ul" sx={{ pl: 2.5, mt: 0, mb: 2.5, '& li': { mb: 1.5 } }}>
            <li>
              <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: '#333', lineHeight: 1.6 }}>
                Bằng việc bấm nút xác nhận hủy đăng ký hội viên, quý khách đồng ý
                và hiểu rõ rằng toàn bộ thông tin thành viên, lịch sử giao dịch, điểm
                thưởng tích lũy, voucher quà tặng, cấp độ thành viên của quý khách
                sẽ bị xóa vĩnh viễn và <strong>không thể khôi phục lại</strong>.
              </Typography>
            </li>
            <li>
              <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: '#333', lineHeight: 1.6 }}>
                Quý khách vui lòng kiểm tra lại điểm tích lũy và voucher quà tặng còn
                hạn sử dụng, NMN Cinema mong rằng quý khách sử dụng hết trước
                khi hủy bỏ tài khoản hội viên này để đảm bảo quyền lợi tốt nhất cho
                quý khách
              </Typography>
            </li>
            <li>
              <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: '#333', lineHeight: 1.6 }}>
                Để được hỗ trợ thêm, vui lòng liên hệ{' '}
                <Box component="span" sx={{ color: '#d32f2f', fontWeight: 600 }}>support@nmncinema.vn</Box>
                {' '}hoặc{' '}
                <Box component="span" sx={{ color: '#d32f2f', fontWeight: 600 }}>0849045706</Box>
              </Typography>
            </li>
          </Box>

          {/* Nhập mật khẩu xác nhận */}
          <TextField
            fullWidth
            variant="standard"
            label="Mật khẩu"
            type={showDeletePw ? 'text' : 'password'}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            sx={{ ...underlineInput, mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowDeletePw(!showDeletePw)}>
                    {showDeletePw ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Nút bấm */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
            <Button
              variant="contained"
              onClick={() => setDeleteModal(false)}
              sx={{
                fontFamily: font, fontSize: '0.9rem', fontWeight: 700,
                textTransform: 'none', px: 4, py: 1.2, borderRadius: 1,
                bgcolor: '#C9A86A', color: '#fff',
                '&:hover': { bgcolor: '#b5944f' }
              }}
            >
              Hủy Thao Tác
            </Button>
            <Button
              variant="outlined"
              onClick={handleDeleteAccount}
              disabled={saving || !deletePassword}
              sx={{
                fontFamily: font, fontSize: '0.9rem', fontWeight: 700,
                textTransform: 'none', px: 4, py: 1.2, borderRadius: 1,
                borderColor: '#333', color: '#333',
                '&:hover': { borderColor: '#111', bgcolor: 'rgba(0,0,0,0.02)' }
              }}
            >
              {saving ? 'Đang xử lý...' : 'Xóa Tài Khoản'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ fontFamily: font }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
