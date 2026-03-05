import { useState } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, IconButton, Typography, CircularProgress, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { createGenreAPI } from '../../../apis/genreApi';

const INIT = {
  name: '', description: '', imageUrl: '', bannerUrl: '',
  category: [], country: 'Việt Nam', status: 'NOW', isActive: true,
  duration: '', releaseDate: '', ageRating: 'P',
  studio: '', director: '', trailerUrl: '',
  actors: [], stills: []
};

const AddGenreModal = ({ open, onClose, onSuccess }) => {
  const { colors } = useAdminTheme();
  const [form, setForm] = useState({ ...INIT });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [catInput, setCatInput] = useState('');
  const [stillInput, setStillInput] = useState('');

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setErrors({ name: 'Vui lòng nhập tên' }); return; }
    setSaving(true);
    try {
      // Auto-add any pending input
      const finalCategory = [...form.category];
      if (catInput.trim() && !finalCategory.includes(catInput.trim())) finalCategory.push(catInput.trim());
      const finalStills = [...form.stills];
      if (stillInput.trim()) finalStills.push(stillInput.trim());

      await createGenreAPI({
        ...form,
        category: finalCategory,
        stills: finalStills.filter(s => s.trim()),
        duration: form.duration ? Number(form.duration) : null,
        releaseDate: form.releaseDate || null,
        actors: form.actors.filter(a => a.name.trim()),
      });
      setForm({ ...INIT });
      setCatInput('');
      setStillInput('');
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrors({ name: err.response?.data?.message || 'Có lỗi xảy ra' });
    } finally { setSaving(false); }
  };

  const close = () => { if (!saving) { setForm({ ...INIT }); setErrors({}); onClose(); } };

  const sx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: colors.bgSubtle, fontSize: '0.85rem',
      '& fieldset': { borderColor: colors.borderSubtle }
    },
    '& .MuiInputLabel-root': { color: colors.textMuted, fontSize: '0.85rem' }
  };

  const label = (text) => (
    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textMuted, mt: 2, mb: 0.5 }}>{text}</Typography>
  );

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard, maxHeight: '90vh' } }}>

      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2.5 }}>
        Thêm thể loại phim
        <IconButton size="small" onClick={close}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, py: 0 }}>
        {/* Thông tin cơ bản */}
        {label('Thông tin cơ bản')}
        <TextField label="Tên *" size="small" fullWidth value={form.name} onChange={set('name')}
          error={!!errors.name} helperText={errors.name} sx={{ ...sx, mb: 1.5 }} />
        <TextField label="Mô tả" size="small" fullWidth multiline rows={2} value={form.description} onChange={set('description')} sx={{ ...sx, mb: 1.5 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <TextField label="Quốc gia" size="small" value={form.country} onChange={set('country')} sx={sx} />
          <TextField label="Thời lượng (phút)" size="small" type="number" value={form.duration} onChange={set('duration')} sx={sx} />
          <TextField select label="Trạng thái" size="small" value={form.status} onChange={set('status')} sx={sx}>
            <MenuItem value="NOW">Đang chiếu</MenuItem>
            <MenuItem value="COMING">Sắp chiếu</MenuItem>
            <MenuItem value="ARCHIVE">Lưu trữ</MenuItem>
          </TextField>
          <TextField select label="Độ tuổi" size="small" value={form.ageRating} onChange={set('ageRating')} sx={sx}>
            <MenuItem value="P">P</MenuItem><MenuItem value="C13">C13</MenuItem>
            <MenuItem value="C16">C16</MenuItem><MenuItem value="C18">C18</MenuItem><MenuItem value="K">K</MenuItem>
          </TextField>
          <TextField label="Ngày phát hành" size="small" type="date" value={form.releaseDate} onChange={set('releaseDate')}
            InputLabelProps={{ shrink: true }} sx={sx} />
          <TextField select label="Hiển thị" size="small" value={String(form.isActive)}
            onChange={(e) => setForm(p => ({ ...p, isActive: e.target.value === 'true' }))} sx={sx}>
            <MenuItem value="true">Hiện</MenuItem><MenuItem value="false">Ẩn</MenuItem>
          </TextField>
        </Box>

        {/* Hình ảnh & Trailer */}
        {label('Hình ảnh & Trailer')}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <TextField label="Link Poster" size="small" value={form.imageUrl} onChange={set('imageUrl')} sx={sx} />
          <TextField label="Link Banner" size="small" value={form.bannerUrl} onChange={set('bannerUrl')} sx={sx} />
        </Box>
        <TextField label="Link Trailer (YouTube)" size="small" fullWidth value={form.trailerUrl} onChange={set('trailerUrl')} sx={{ ...sx, mt: 1.5 }} />

        {/* Ekip */}
        {label('Ekip sản xuất')}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <TextField label="Nhà sản xuất" size="small" value={form.studio} onChange={set('studio')} sx={sx} />
          <TextField label="Đạo diễn" size="small" value={form.director} onChange={set('director')} sx={sx} />
        </Box>

        {/* Thể loại chips */}
        {label('Thể loại')}
        <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
          <TextField size="small" placeholder="Nhập thể loại, nhấn Enter" fullWidth value={catInput}
            onChange={(e) => setCatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const v = catInput.trim();
                if (v && !form.category.includes(v)) setForm(p => ({ ...p, category: [...p.category, v] }));
                setCatInput('');
              }
            }} sx={sx} />
        </Box>
        {form.category.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {form.category.map((c, i) => (
              <Chip key={i} label={c} size="small" onDelete={() => setForm(p => ({ ...p, category: p.category.filter((_, j) => j !== i) }))}
                sx={{ fontSize: '0.75rem', bgcolor: colors.bgSubtle }} />
            ))}
          </Box>
        )}

        {/* Diễn viên */}
        {label('Diễn viên')}
        {form.actors.map((a, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
            <TextField size="small" placeholder="Tên" value={a.name}
              onChange={(e) => { const arr = [...form.actors]; arr[i] = { ...arr[i], name: e.target.value }; setForm(p => ({ ...p, actors: arr })); }}
              sx={{ ...sx, flex: 1 }} />
            <TextField size="small" placeholder="Link ảnh" value={a.photoUrl}
              onChange={(e) => { const arr = [...form.actors]; arr[i] = { ...arr[i], photoUrl: e.target.value }; setForm(p => ({ ...p, actors: arr })); }}
              sx={{ ...sx, flex: 1 }} />
            <IconButton size="small" onClick={() => setForm(p => ({ ...p, actors: p.actors.filter((_, j) => j !== i) }))} sx={{ color: '#f44336' }}>
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        ))}
        <Button size="small" onClick={() => setForm(p => ({ ...p, actors: [...p.actors, { name: '', photoUrl: '' }] }))}
          sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#1565c0' }}>+ Thêm diễn viên</Button>

        {/* Hình trong phim */}
        {label('Hình trong phim')}
        <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
          <TextField size="small" placeholder="Nhập link ảnh, nhấn Enter" fullWidth value={stillInput}
            onChange={(e) => setStillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const v = stillInput.trim();
                if (v) setForm(p => ({ ...p, stills: [...p.stills, v] }));
                setStillInput('');
              }
            }} sx={sx} />
        </Box>
        {form.stills.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            {form.stills.map((url, i) => (
              <Box key={i} sx={{ position: 'relative', width: 80, height: 50 }}>
                <Box component="img" src={url} sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0.5 }} />
                <IconButton size="small" onClick={() => setForm(p => ({ ...p, stills: p.stills.filter((_, j) => j !== i) }))}
                  sx={{ position: 'absolute', top: -5, right: -5, bgcolor: '#f44336', color: '#fff', width: 16, height: 16, '&:hover': { bgcolor: '#d32f2f' } }}>
                  <CloseIcon sx={{ fontSize: 10 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button size="small" onClick={close} disabled={saving}
          sx={{ textTransform: 'none', color: colors.textMuted }}>Huỷ</Button>
        <Button variant="contained" size="small" onClick={handleSubmit} disabled={saving}
          sx={{ textTransform: 'none', bgcolor: '#1B4F93', '&:hover': { bgcolor: '#163f78' } }}>
          {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Tạo mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGenreModal;
