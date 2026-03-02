import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, TextField, MenuItem, Button, Typography, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { createMovieAPI } from '../../../apis/movieApi';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';

// Phân loại tuổi
const AGE_RATINGS = [
  { value: 'P', label: 'P - Phổ biến' },
  { value: 'C13', label: 'C13 - Trên 13 tuổi' },
  { value: 'C16', label: 'C16 - Trên 16 tuổi' },
  { value: 'C18', label: 'C18 - Trên 18 tuổi' }
];

const STATUS_OPTIONS = [
  { value: 'COMING', label: 'Sắp chiếu' },
  { value: 'NOW', label: 'Đang chiếu' },
  { value: 'STOP', label: 'Ngưng chiếu' }
];

// Trạng thái ban đầu của form
const INITIAL_FORM = {
  title: '',
  description: '',
  duration: '',
  ageRating: 'P',
  directorName: '',
  actorNames: '',
  trailerUrl: '',
  studio: '',
  country: 'Việt Nam',
  releaseDate: '',
  endDate: '',
  status: 'COMING',
  bannerUrl: ''
};

const AddMovieModal = ({ open, onClose, onSuccess }) => {
  const { colors, darkMode } = useAdminTheme();
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Xử lý thay đổi input
  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Xử lý chọn file poster
  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
      if (errors.poster) setErrors(prev => ({ ...prev, poster: '' }));
    }
  };

  // Kiểm tra dữ liệu form
  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Vui lòng nhập tên phim';
    if (!form.description.trim()) newErrors.description = 'Vui lòng nhập mô tả';
    if (!form.duration || Number(form.duration) <= 0) newErrors.duration = 'Thời lượng phải > 0';
    if (!form.trailerUrl.trim()) newErrors.trailerUrl = 'Vui lòng nhập link trailer';
    if (!form.releaseDate) newErrors.releaseDate = 'Vui lòng chọn ngày khởi chiếu';
    if (!posterFile) newErrors.poster = 'Vui lòng upload poster';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gửi form tạo phim
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('duration', Number(form.duration));
      formData.append('ageRating', form.ageRating);
      formData.append('trailerUrl', form.trailerUrl.trim());
      formData.append('releaseDate', form.releaseDate);
      formData.append('status', form.status);
      formData.append('directorName', form.directorName.trim());
      if (form.actorNames.trim()) formData.append('actorNames', form.actorNames.trim());
      if (form.studio.trim()) formData.append('studio', form.studio.trim());
      if (form.country.trim()) formData.append('country', form.country.trim());
      if (form.endDate) formData.append('endDate', form.endDate);
      if (form.bannerUrl.trim()) formData.append('bannerUrl', form.bannerUrl.trim());
      if (posterFile) formData.append('poster', posterFile);

      await createMovieAPI(formData);
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      let msg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo phim!';
      // Thông báo dễ hiểu cho lỗi phổ biến
      if (msg.includes('jwt expired') || msg.includes('jwt') || err.response?.status === 401) {
        msg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!';
      } else if (msg.includes('tồn tại') || msg.includes('duplicate') || msg.includes('E11000')) {
        msg = 'Tên phim đã tồn tại trong hệ thống! Vui lòng chọn tên khác.';
      }
      setErrors(prev => ({ ...prev, submit: msg }));
    } finally {
      setLoading(false);
    }
  };

  // Đặt lại form & đóng modal
  const handleClose = () => {
    setForm({ ...INITIAL_FORM });
    setPosterFile(null);
    setPosterPreview(null);
    setErrors({});
    setLoading(false);
    onClose();
  };

  // Style chung cho TextField
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: colors.bgInput,
      color: colors.textPrimary,
      '& fieldset': { borderColor: colors.borderSubtle },
      '&:hover fieldset': { borderColor: colors.borderSubtle },
      '&.Mui-focused fieldset': { borderColor: colors.borderSubtle, borderWidth: 1 }
    },
    '& .MuiInputLabel-root': { color: colors.textMuted },
    '& .MuiInputLabel-root.Mui-focused': { color: colors.textMuted }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colors.bgCard,
          borderRadius: 3,
          border: `1px solid ${colors.borderCard}`,
          boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.divider}`, pb: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary }}>
          Thêm phim mới
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: colors.textMuted }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 3 }, mt: 1 }}>

          {/* === CỘT TRÁI: Poster Upload === */}
          <Box sx={{ width: { xs: '100%', sm: 220 }, flexShrink: 0, display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, alignItems: 'center', gap: 1.5 }}>
            {/* Poster preview */}
            <Box
              sx={{
                width: { xs: 130, sm: 200 }, height: { xs: 185, sm: 290 }, borderRadius: 2, overflow: 'hidden',
                border: `2px dashed ${errors.poster ? '#f44336' : colors.borderSubtle}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: colors.bgInput, cursor: 'pointer', position: 'relative',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: colors.textMuted }
              }}
              onClick={() => document.getElementById('poster-upload').click()}
            >
              {posterPreview ? (
                <img src={posterPreview} alt="Poster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <CloudUploadIcon sx={{ fontSize: 40, color: colors.textMuted, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: colors.textMuted, fontSize: 13 }}>
                    Nhấn để upload poster
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textPlaceholder }}>
                    (Bắt buộc)
                  </Typography>
                </Box>
              )}
            </Box>
            <input
              id="poster-upload"
              type="file"
              accept="image/*"
              hidden
              onChange={handlePosterChange}
            />
            {errors.poster && (
              <Typography variant="caption" sx={{ color: '#f44336' }}>{errors.poster}</Typography>
            )}

            {/* Banner URL */}
            <TextField
              fullWidth
              size="small"
              label="Banner URL"
              placeholder="https://..."
              value={form.bannerUrl}
              onChange={handleChange('bannerUrl')}
              sx={{ ...inputSx, mt: 1 }}
            />
          </Box>

          {/* === CỘT PHẢI: Form Fields === */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Tên phim */}
            <TextField
              fullWidth size="small" label="Tên phim *"
              placeholder="Nhập tên phim..."
              value={form.title} onChange={handleChange('title')}
              error={!!errors.title} helperText={errors.title}
              sx={inputSx}
            />

            {/* Mô tả */}
            <TextField
              fullWidth size="small" label="Mô tả *"
              placeholder="Nhập nội dung mô tả phim..."
              value={form.description} onChange={handleChange('description')}
              multiline rows={3}
              error={!!errors.description} helperText={errors.description}
              sx={inputSx}
            />

            {/* Row: Thời lượng + Tuổi + Trạng thái */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                size="small" label="Thời lượng (phút) *"
                type="number" placeholder="120"
                value={form.duration} onChange={handleChange('duration')}
                error={!!errors.duration} helperText={errors.duration}
                sx={{ ...inputSx, flex: 1 }}
                inputProps={{ min: 1 }}
              />
              <TextField
                select size="small" label="Phân loại tuổi"
                value={form.ageRating} onChange={handleChange('ageRating')}
                sx={{ ...inputSx, flex: 1 }}
              >
                {AGE_RATINGS.map(r => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select size="small" label="Trạng thái"
                value={form.status} onChange={handleChange('status')}
                sx={{ ...inputSx, flex: 1 }}
              >
                {STATUS_OPTIONS.map(s => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Row: Đạo diễn + Diễn viên */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                size="small" label="Đạo diễn"
                value={form.directorName} onChange={handleChange('directorName')}
                error={!!errors.directorName} helperText={errors.directorName}
                sx={{ ...inputSx, flex: 1 }}
              />
              <TextField
                size="small" label="Diễn viên"
                value={form.actorNames} onChange={handleChange('actorNames')}
                sx={{ ...inputSx, flex: 1 }}
              />
            </Box>

            {/* Trailer URL */}
            <TextField
              fullWidth size="small" label="Trailer URL (YouTube) *"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.trailerUrl} onChange={handleChange('trailerUrl')}
              error={!!errors.trailerUrl} helperText={errors.trailerUrl}
              sx={inputSx}
            />

            {/* Row: Nhà sản xuất + Quốc gia */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                size="small" label="Nhà sản xuất"
                value={form.studio} onChange={handleChange('studio')}
                sx={{ ...inputSx, flex: 1 }}
              />
              <TextField
                size="small" label="Quốc gia"
                value={form.country} onChange={handleChange('country')}
                sx={{ ...inputSx, flex: 1 }}
              />
            </Box>

            {/* Row: Ngày khởi chiếu + Ngày kết thúc */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                size="small" label="Ngày khởi chiếu *"
                type="date" value={form.releaseDate}
                onChange={handleChange('releaseDate')}
                error={!!errors.releaseDate} helperText={errors.releaseDate}
                InputLabelProps={{ shrink: true }}
                sx={{ ...inputSx, flex: 1 }}
              />
              <TextField
                size="small" label="Ngày kết thúc"
                type="date" value={form.endDate}
                onChange={handleChange('endDate')}
                InputLabelProps={{ shrink: true }}
                sx={{ ...inputSx, flex: 1 }}
              />
            </Box>

            {/* Error submit */}
            {errors.submit && (
              <Typography variant="body2" sx={{ color: '#f44336', mt: 0.5 }}>
                {errors.submit}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${colors.divider}`, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            color: colors.textSecondary,
            borderColor: colors.borderSubtle,
            '&:hover': { borderColor: colors.textMuted, bgcolor: colors.bgInput }
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#1565c0',
            '&:hover': { bgcolor: '#0d47a1' },
            fontWeight: 600,
            px: 3
          }}
        >
          {loading ? 'Đang tạo...' : 'Tạo phim'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMovieModal;
