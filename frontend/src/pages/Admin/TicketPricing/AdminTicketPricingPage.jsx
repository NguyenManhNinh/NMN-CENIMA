import { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress,
  TextField, MenuItem, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  IconButton, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  getAllTicketPricingAdminAPI,
  updateTicketPricingAdminAPI
} from '../../../apis/ticketPricingApi';
import { useToast } from '../../../contexts/ToastContext';

// Card style
const getCardSx = (colors) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

// Status config
const STATUS_MAP = {
  active: { label: 'Đang hoạt động', color: '#2e7d32', bg: '#e8f5e9' },
  draft: { label: 'Bản nháp', color: '#757575', bg: '#f5f5f5' }
};

const EMPTY_TAB = { name: '', slug: '', imageUrl: '', sortOrder: 0 };

const EMPTY_FORM = {
  title: 'Giá Vé rạp NMN Cinema - Hà Nội',
  tabs: [{ ...EMPTY_TAB, name: 'GIÁ VÉ 2D', slug: '2D-price', sortOrder: 1 }],
  notes: '',
  status: 'active'
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
};

const AdminTicketPricingPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const { showToast } = useToast();
  const cardSx = getCardSx(colors);

  // State
  const [pricings, setPricings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM, tabs: [{ ...EMPTY_TAB }] });
  const [submitting, setSubmitting] = useState(false);

  // Fetch
  const fetchPricings = async () => {
    setLoading(true);
    try {
      const res = await getAllTicketPricingAdminAPI();
      setPricings(res.data || []);
    } catch (err) {
      console.error('Fetch ticket pricing error:', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPricings(); }, []);

  // Filtered
  const filtered = useMemo(() => {
    let list = [...pricings];
    if (filterStatus !== 'ALL') list = list.filter(p => p.status === filterStatus);
    return list;
  }, [pricings, filterStatus]);

  // Form helpers
  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const resetForm = () => {
    setForm({ ...EMPTY_FORM, tabs: [{ ...EMPTY_TAB, name: 'GIÁ VÉ 2D', slug: '2D-price', sortOrder: 1 }] });
    setIsEdit(false);
  };

  // Tab helpers
  const addTab = () => setForm(prev => ({
    ...prev,
    tabs: [...prev.tabs, { ...EMPTY_TAB, sortOrder: prev.tabs.length + 1 }]
  }));
  const removeTab = (idx) => setForm(prev => ({
    ...prev,
    tabs: prev.tabs.filter((_, i) => i !== idx)
  }));
  const updateTab = (idx, key, value) => {
    setForm(prev => ({
      ...prev,
      tabs: prev.tabs.map((tab, i) => i === idx ? { ...tab, [key]: value } : tab)
    }));
  };

  // Open add
  const handleAdd = () => {
    resetForm();
    setOpenDialog(true);
  };

  // Open edit
  const handleEdit = (pricing) => {
    setForm({
      title: pricing.title || '',
      tabs: pricing.tabs?.length > 0 ? pricing.tabs.map(t => ({
        name: t.name || '', slug: t.slug || '', imageUrl: t.imageUrl || '', sortOrder: t.sortOrder || 0
      })) : [{ ...EMPTY_TAB }],
      notes: (pricing.notes || '').replace(/<br\s*\/?>/gi, '\n'),
      status: pricing.status || 'active'
    });
    setIsEdit(true);
    setOpenDialog(true);
  };

  // Submit
  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showToast('Vui lòng nhập tiêu đề bảng giá', 'warning');
      return;
    }
    const validTabs = form.tabs.filter(t => t.name.trim() && t.imageUrl.trim());
    if (validTabs.length === 0) {
      showToast('Cần ít nhất 1 tab có tên và ảnh', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await updateTicketPricingAdminAPI({
        title: form.title.trim(),
        tabs: validTabs.map((t, i) => ({
          name: t.name.trim(),
          slug: t.slug.trim() || t.name.trim().replace(/\s+/g, '-'),
          imageUrl: t.imageUrl.trim(),
          sortOrder: t.sortOrder || i + 1
        })),
        notes: form.notes.replace(/\n/g, '<br>'),
        status: form.status
      });
      setOpenDialog(false);
      resetForm();
      fetchPricings();
    } catch (err) {
      console.error('Submit error:', err.response?.data || err);
      showToast(err.response?.data?.message || 'Lỗi khi lưu bảng giá!', 'error');
    } finally { setSubmitting(false); }
  };

  // Section helpers
  const SectionTitle = ({ children }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {children}
    </Typography>
  );
  const SectionDivider = () => <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />;

  const noOutlineSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, fontSize: '0.85rem',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
    }
  };

  // Render form
  const renderFormFields = () => (
    <Box sx={{
      display: 'flex', flexDirection: 'column', gap: 2, mt: 1,
      '& .MuiOutlinedInput-root': {
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
      }
    }}>

      {/* THÔNG TIN CƠ BẢN */}
      <SectionTitle>Thông tin cơ bản</SectionTitle>

      <TextField label="Tiêu đề bảng giá *" size="small" fullWidth value={form.title}
        onChange={e => updateForm('title', e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><LocalActivityIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
        sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />

      <SectionDivider />

      {/* DANH SÁCH TAB */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle>Danh sách Tab giá vé ({form.tabs.length} tab)</SectionTitle>
        <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={addTab}
          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#1565c0' }}>
          Thêm tab
        </Button>
      </Box>

      {form.tabs.map((tab, idx) => (
        <Box key={idx} sx={{
          border: `1px solid ${colors.borderSubtle}`, borderRadius: 2, p: 2,
          bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafbfc',
          position: 'relative'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1565c0' }}>
              Tab #{idx + 1}
            </Typography>
            {form.tabs.length > 1 && (
              <IconButton size="small" onClick={() => removeTab(idx)}
                sx={{ color: '#e53935', '&:hover': { bgcolor: '#ffebee' } }}>
                <RemoveCircleOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
            <TextField label="Tên tab *" size="small" fullWidth value={tab.name}
              onChange={e => updateTab(idx, 'name', e.target.value)}
              placeholder="VD: GIÁ VÉ 2D"
              sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />
            <TextField label="Slug" size="small" fullWidth value={tab.slug}
              onChange={e => updateTab(idx, 'slug', e.target.value)}
              placeholder="VD: 2D-price"
              sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />
            <TextField label="Thứ tự" size="small" type="number" value={tab.sortOrder}
              onChange={e => updateTab(idx, 'sortOrder', Number(e.target.value))}
              sx={{ width: 100, '& fieldset': { borderColor: colors.borderSubtle } }} />
          </Box>

          <TextField label="URL ảnh bảng giá *" size="small" fullWidth value={tab.imageUrl}
            onChange={e => updateTab(idx, 'imageUrl', e.target.value)}
            placeholder="https://..."
            sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />

          {/* Image preview */}
          {tab.imageUrl && (
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Box component="img" src={tab.imageUrl} alt={tab.name}
                sx={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 1, border: '1px solid #eee' }}
                onError={e => { e.target.style.display = 'none'; }} />
            </Box>
          )}
        </Box>
      ))}

      <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={addTab} fullWidth
        sx={{
          textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: colors.borderSubtle,
          color: colors.textSecondary, borderStyle: 'dashed', py: 1
        }}>
        + Thêm tab mới
      </Button>

      <SectionDivider />

      {/* GHI CHÚ */}
      <SectionTitle>Ghi chú (HTML)</SectionTitle>

      <TextField label="Nội dung ghi chú" size="small" fullWidth multiline rows={4} value={form.notes}
        onChange={e => updateForm('notes', e.target.value)}
        placeholder="Nhập ghi chú hiển thị bên dưới bảng giá (hỗ trợ HTML)..."
        sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />

      <SectionDivider />

      {/* TRẠNG THÁI */}
      <SectionTitle>Trạng thái</SectionTitle>

      <TextField select label="Trạng thái" size="small" value={form.status}
        onChange={e => updateForm('status', e.target.value)}
        sx={{ width: 200, '& fieldset': { borderColor: colors.borderSubtle } }}>
        <MenuItem value="active">Đang hoạt động</MenuItem>
        <MenuItem value="draft">Bản nháp</MenuItem>
      </TextField>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản lý Giá Vé
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Cập nhật bảng giá vé hiển thị trên toàn hệ thống
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Tải lại">
            <IconButton onClick={fetchPricings} sx={{ color: colors.textMuted }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}
            sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' } }}>
            Thêm bảng giá
          </Button>
        </Box>
      </Box>

      {/* MAIN CARD */}
      <Card sx={{ ...cardSx }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField select size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ minWidth: 160, ...noOutlineSx }}>
              <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="draft">Bản nháp</MenuItem>
            </TextField>

            <Chip label={`${filtered.length} kết quả`} size="small"
              sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#e3f2fd', color: '#1565c0' }} />
          </Box>

          {/* TABLE */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={36} sx={{ color: '#1B4F93' }} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1 }} />
              <Typography sx={{ color: colors.textMuted, fontSize: '0.85rem' }}>
                {filterStatus !== 'ALL' ? 'Không tìm thấy bảng giá phù hợp' : 'Chưa có bảng giá nào'}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', border: `1px solid ${colors.borderSubtle}`, borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem' }}>Tiêu đề</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 80 }}>Số tab</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 200 }}>Tên các tab</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 120 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Ngày tạo</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Cập nhật</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 80, whiteSpace: 'nowrap' }} align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((pricing, idx) => {
                    const statusStyle = STATUS_MAP[pricing.status] || STATUS_MAP.draft;
                    return (
                      <TableRow key={pricing._id} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafbfc' }, transition: 'background 0.15s' }}>
                        <TableCell sx={{ fontSize: '0.78rem', color: colors.textMuted }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: colors.textPrimary }}>
                            {pricing.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={pricing.tabs?.length || 0} size="small"
                            sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#e3f2fd', color: '#1565c0' }} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {pricing.tabs?.map((tab, i) => (
                              <Chip key={i} label={tab.name} size="small"
                                sx={{ height: 20, fontSize: '0.68rem', bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#f5f5f5', color: colors.textSecondary }} />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={statusStyle.label} size="small" sx={{
                            height: 22, fontSize: '0.7rem', fontWeight: 600,
                            bgcolor: darkMode ? 'transparent' : statusStyle.bg,
                            color: statusStyle.color,
                            border: darkMode ? `1px solid ${statusStyle.color}` : 'none',
                            '& .MuiChip-label': { px: 1 }
                          }} />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography sx={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                            {formatDate(pricing.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography sx={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                            {formatDate(pricing.updatedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Sửa">
                            <IconButton size="small" onClick={() => handleEdit(pricing)}
                              sx={{ color: '#1565c0', '&:hover': { bgcolor: '#e3f2fd' } }}>
                              <EditIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* ADD/EDIT DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          {isEdit ? 'Cập nhật Bảng Giá' : 'Thêm Bảng Giá Mới'}
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            {isEdit ? 'Chỉnh sửa bảng giá vé hiển thị trên trang giá vé' : 'Tạo bảng giá vé mới cho hệ thống'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important', maxHeight: '70vh' }}>
          {renderFormFields()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Huỷ</Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={submitting || !form.title.trim()}
            startIcon={submitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : isEdit ? <EditIcon /> : <AddIcon />}
            sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo bảng giá'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTicketPricingPage;
