import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, TextField, MenuItem, Button, Typography, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { updateMovieAPI } from '../../../apis/movieApi';
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

// Chuyển đổi ngày sang dạng YYYY-MM-DD cho input[type=date]
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
};

const EditMovieModal = ({ open, onClose, onSuccess, movie }) => {
  const { colors, darkMode } = useAdminTheme();
  const [form, setForm] = useState({});
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Điền dữ liệu form khi movie thay đổi
  useEffect(() => {
    if (movie && open) {
      setForm({
        title: movie.title || '',
        description: movie.description || '',
        duration: movie.duration || '',
        ageRating: movie.ageRating || 'P',
        directorName: movie.director || '',
        actorNames: Array.isArray(movie.actors) ? movie.actors.join(', ') : '',
        trailerUrl: movie.trailerUrl || '',
        studio: movie.studio || '',
        country: movie.country || 'Việt Nam',
        releaseDate: formatDateForInput(movie.releaseDate),
        endDate: formatDateForInput(movie.endDate),
        status: movie.status || 'COMING',
        bannerUrl: movie.bannerUrl || ''
      });
      setPosterPreview(movie.posterUrl || null);
      setPosterFile(null);
      setErrors({});
    }
  }, [movie, open]);

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gửi form cập nhật phim
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
      formData.append('actorNames', form.actorNames.trim());
      if (form.studio.trim()) formData.append('studio', form.studio.trim());
      if (form.country.trim()) formData.append('country', form.country.trim());
      if (form.endDate) formData.append('endDate', form.endDate);
      formData.append('bannerUrl', form.bannerUrl.trim());
      if (posterFile) formData.append('poster', posterFile);

      await updateMovieAPI(movie._id, formData);
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      let msg = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật phim!';
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
    setForm({});
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
          Sửa phim: {movie?.title}
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
                border: `2px dashed ${colors.borderSubtle}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: colors.bgInput, cursor: 'pointer', position: 'relative',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: colors.textMuted }
              }}
              onClick={() => document.getElementById('edit-poster-upload').click()}
            >
              {posterPreview ? (
                <img src={posterPreview} alt="Poster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <CloudUploadIcon sx={{ fontSize: 40, color: colors.textMuted, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: colors.textMuted, fontSize: 13 }}>
                    Nhấn để thay poster
                  </Typography>
                </Box>
              )}
            </Box>
            <input
              id="edit-poster-upload"
              type="file"
              accept="image/*"
              hidden
              onChange={handlePosterChange}
            />

            {/* Banner URL */}
            <TextField
              fullWidth
              size="small"
              label="Banner URL"
              value={form.bannerUrl || ''}
              onChange={handleChange('bannerUrl')}
              sx={{ ...inputSx, mt: 1 }}
            />
          </Box>

          {/* === CỘT PHẢI: Form Fields === */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Tên phim */}
            <TextField
              fullWidth size="small" label="Tên phim *"
              value={form.title || ''} onChange={handleChange('title')}
              error={!!errors.title} helperText={errors.title}
              sx={inputSx}
            />

            {/* Mô tả */}
            <TextField
              fullWidth size="small" label="Mô tả *"
              value={form.description || ''} onChange={handleChange('description')}
              multiline rows={3}
              error={!!errors.description} helperText={errors.description}
              sx={inputSx}
            />

            {/* Row: Thời lượng + Tuổi + Trạng thái */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                size="small" label="Thời lượng (phút) *"
                type="number"
                value={form.duration || ''} onChange={handleChange('duration')}
                error={!!errors.duration} helperText={errors.duration}
                sx={{ ...inputSx, flex: 1 }}
                inputProps={{ min: 1 }}
              />
              <TextField
                select size="small" label="Phân loại tuổi"
                value={form.ageRating || 'P'} onChange={handleChange('ageRating')}
                sx={{ ...inputSx, flex: 1 }}
              >
                {AGE_RATINGS.map(r => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select size="small" label="Trạng thái"
                value={form.status || 'COMING'} onChange={handleChange('status')}
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
                value={form.directorName || ''} onChange={handleChange('directorName')}
                sx={{ ...inputSx, flex: 1 }}
              />
              <TextField
                size="small" label="Diễn viên"
                value={form.actorNames || ''} onChange={handleChange('actorNames')}
                sx={{ ...inputSx, flex: 1 }}
              />
            </Box>

            {/* Trailer URL */}
            <TextField
              fullWidth size="small" label="Trailer URL (YouTube) *"
              value={form.trailerUrl || ''} onChange={handleChange('trailerUrl')}
              error={!!errors.trailerUrl} helperText={errors.trailerUrl}
              sx={inputSx}
            />

            {/* Row: Nhà sản xuất + Quốc gia */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                size="small" label="Nhà sản xuất"
                value={form.studio || ''} onChange={handleChange('studio')}
                sx={{ ...inputSx, flex: 1 }}
              />
              <TextField
                size="small" label="Quốc gia"
                value={form.country || ''} onChange={handleChange('country')}
                sx={{ ...inputSx, flex: 1 }}
              />
            </Box>

            {/* Row: Ngày khởi chiếu + Ngày kết thúc */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                size="small" label="Ngày khởi chiếu *"
                type="date" value={form.releaseDate || ''}
                onChange={handleChange('releaseDate')}
                error={!!errors.releaseDate} helperText={errors.releaseDate}
                InputLabelProps={{ shrink: true }}
                sx={{ ...inputSx, flex: 1 }}
              />
              <TextField
                size="small" label="Ngày kết thúc"
                type="date" value={form.endDate || ''}
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
            bgcolor: '#ff9800',
            '&:hover': { bgcolor: '#f57c00' },
            fontWeight: 600,
            px: 3
          }}
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMovieModal;
