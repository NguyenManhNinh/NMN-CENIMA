import { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Avatar, CircularProgress,
  TextField, MenuItem, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  IconButton, Tooltip, FormControl, InputLabel, Select, OutlinedInput,
  Checkbox, ListItemText, FormControlLabel, Switch
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  getAllPromotionsAdminAPI,
  createPromotionAPI,
  updatePromotionAPI,
  deletePromotionAPI
} from '../../../apis/promotionApi';
import { getAllVouchersAdminAPI, createVoucherAdminAPI } from '../../../apis/voucherApi';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Card style
const getCardSx = (colors) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

// Status chip config
const STATUS_MAP = {
  DRAFT: { label: 'Bản nháp', color: '#757575', bg: '#f5f5f5' },
  ACTIVE: { label: 'Hoạt động', color: '#2e7d32', bg: '#e8f5e9' },
  INACTIVE: { label: 'Ngừng', color: '#c62828', bg: '#ffebee' },
  EXPIRED: { label: 'Hết hạn', color: '#e65100', bg: '#fff3e0' }
};

const TYPE_MAP = {
  PROMOTION: { label: 'Khuyến mãi', color: '#1565c0', bg: '#e3f2fd' },
  EVENT: { label: 'Sự kiện', color: '#7b1fa2', bg: '#f3e5f5' }
};

const APPLY_MODE_MAP = {
  ONLINE_VOUCHER: { label: 'Voucher Online', color: '#00796b', bg: '#e0f2f1' },
  OFFLINE_ONLY: { label: 'Tại quầy', color: '#ef6c00', bg: '#fff3e0' },
  PAYMENT_METHOD_ONLY: { label: 'PT Thanh toán', color: '#5d4037', bg: '#efebe9' }
};

const DISPLAY_POSITION_MAP = {
  LIST: 'Danh sách',
  BOTTOM_BANNER: 'Banner dưới'
};

const RANKS = ['MEMBER', 'VIP', 'DIAMOND'];
const RANK_LABELS = { MEMBER: 'Thành viên', VIP: 'VIP', DIAMOND: 'Diamond' };

// Empty form
const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  thumbnailUrl: '',
  coverUrl: '',
  status: 'DRAFT',
  type: 'PROMOTION',
  applyMode: 'ONLINE_VOUCHER',
  displayPosition: 'LIST',
  bannerOrder: 0,
  isFeatured: false,
  priority: 0,
  startAt: '',
  endAt: '',
  voucherId: '',
  quantityPerUser: 1,
  offlineMode: 'QR_REDEEM',
  totalRedeemsLimit: '',
  allowedUserRanks: [],
  notes: '',
  sendNotification: false
};

// Format date for display
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
};

// Format date for input[type=date]
const toInputDate = (d) => {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
};

const AdminPromotionPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const cardSx = getCardSx(colors);

  const noOutlineSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, fontSize: '0.85rem',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
    }
  };

  // State
  const [promotions, setPromotions] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Delete dialog
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Inline voucher creation
  const [showNewVoucherForm, setShowNewVoucherForm] = useState(false);
  const [creatingVoucher, setCreatingVoucher] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: '', type: 'PERCENT', value: '', maxDiscount: '', validFrom: '', validTo: '', usageLimit: 100
  });
  const updateNewVoucher = (field, value) => setNewVoucher(prev => ({ ...prev, [field]: value }));
  const resetNewVoucher = () => {
    setNewVoucher({ code: '', type: 'PERCENT', value: '', maxDiscount: '', validFrom: '', validTo: '', usageLimit: 100 });
    setShowNewVoucherForm(false);
  };

  // Fetch
  useEffect(() => { fetchPromotions(); fetchVouchers(); }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await getAllPromotionsAdminAPI({ limit: 100 });
      setPromotions(Array.isArray(res) ? res : []);
    } catch { setPromotions([]); }
    finally { setLoading(false); }
  };

  const fetchVouchers = async () => {
    try {
      const res = await getAllVouchersAdminAPI();
      const list = res?.data?.vouchers || res?.vouchers || res?.data || [];
      setVouchers(Array.isArray(list) ? list : []);
    } catch { setVouchers([]); }
  };

  // Filter
  const filteredPromotions = useMemo(() => {
    let result = promotions;
    if (filterStatus !== 'all') result = result.filter(p => p.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(p => p.title?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q));
    }
    return result;
  }, [promotions, filterStatus, searchQuery]);

  // Form helpers
  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setIsEdit(false);
    setCurrentId(null);
    resetNewVoucher();
  };

  // Create voucher inline
  const handleCreateVoucher = async () => {
    if (!newVoucher.code.trim() || !newVoucher.value || !newVoucher.validFrom || !newVoucher.validTo) {
      alert('Vui lòng điền đủ: Mã, Giá trị, Ngày bắt đầu, Ngày kết thúc');
      return;
    }
    setCreatingVoucher(true);
    try {
      const payload = {
        code: newVoucher.code.trim().toUpperCase(),
        type: newVoucher.type,
        value: Number(newVoucher.value),
        maxDiscount: Number(newVoucher.maxDiscount) || 0,
        validFrom: new Date(newVoucher.validFrom).toISOString(),
        validTo: new Date(newVoucher.validTo).toISOString(),
        usageLimit: Number(newVoucher.usageLimit) || 100,
        status: 'ACTIVE'
      };
      const res = await createVoucherAdminAPI(payload);
      const created = res?.data?.voucher || res?.voucher;
      if (created) {
        await fetchVouchers();
        updateForm('voucherId', created._id);
      }
      resetNewVoucher();
    } catch (err) {
      console.error('Create voucher error:', err.response?.data || err);
      alert(err.response?.data?.message || 'Lỗi khi tạo voucher!');
    } finally { setCreatingVoucher(false); }
  };

  // Open add
  const handleOpenAdd = () => { resetForm(); setOpenDialog(true); };

  // Open edit
  const handleOpenEdit = (p) => {
    setForm({
      title: p.title || '',
      excerpt: p.excerpt || '',
      content: p.content || '',
      thumbnailUrl: p.thumbnailUrl || '',
      coverUrl: p.coverUrl || '',
      status: p.status || 'DRAFT',
      type: p.type || 'PROMOTION',
      applyMode: p.applyMode || 'ONLINE_VOUCHER',
      displayPosition: p.displayPosition || 'LIST',
      bannerOrder: p.bannerOrder || 0,
      isFeatured: p.isFeatured || false,
      priority: p.priority || 0,
      startAt: toInputDate(p.startAt),
      endAt: toInputDate(p.endAt),
      voucherId: p.voucherId?._id || p.voucherId || '',
      quantityPerUser: p.quantityPerUser || 1,
      offlineMode: p.offlineMode || 'QR_REDEEM',
      totalRedeemsLimit: p.totalRedeemsLimit ?? '',
      allowedUserRanks: p.allowedUserRanks || [],
      notes: p.notes || '',
      sendNotification: false
    });
    setCurrentId(p._id);
    setIsEdit(true);
    setOpenDialog(true);
  };

  // Submit
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.startAt || !form.endAt) {
      alert('Vui lòng điền đủ: Tiêu đề, Nội dung, Ngày bắt đầu, Ngày kết thúc');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        thumbnailUrl: form.thumbnailUrl.trim(),
        coverUrl: form.coverUrl.trim(),
        status: form.status,
        type: form.type,
        applyMode: form.applyMode,
        displayPosition: form.displayPosition,
        bannerOrder: Number(form.bannerOrder) || 0,
        isFeatured: form.isFeatured,
        priority: Number(form.priority) || 0,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        quantityPerUser: Number(form.quantityPerUser) || 1,
        offlineMode: form.offlineMode,
        allowedUserRanks: form.allowedUserRanks,
        notes: form.notes.trim()
      };

      // Conditional fields
      if (form.applyMode === 'ONLINE_VOUCHER' && form.voucherId) {
        payload.voucherId = form.voucherId;
      } else {
        payload.voucherId = null;
      }

      if (form.totalRedeemsLimit !== '' && form.totalRedeemsLimit !== null) {
        payload.totalRedeemsLimit = Number(form.totalRedeemsLimit);
      } else {
        payload.totalRedeemsLimit = null;
      }

      // Remove empty optional fields
      if (!payload.thumbnailUrl) delete payload.thumbnailUrl;
      if (!payload.coverUrl) delete payload.coverUrl;
      if (!payload.excerpt) delete payload.excerpt;
      if (!payload.notes) delete payload.notes;

      if (isEdit) {
        await updatePromotionAPI(currentId, payload);
      } else {
        payload.sendNotification = form.sendNotification;
        await createPromotionAPI(payload);
      }

      setOpenDialog(false);
      resetForm();
      fetchPromotions();
    } catch (err) {
      console.error('Submit error:', err.response?.data || err);
      alert(err.response?.data?.message || 'Lỗi khi lưu ưu đãi!');
    } finally { setSubmitting(false); }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePromotionAPI(deleteTarget.id);
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      fetchPromotions();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xóa ưu đãi!');
    }
  };

  // Section header helper
  const SectionTitle = ({ children }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {children}
    </Typography>
  );

  const SectionDivider = () => <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />;

  // Render form
  const renderFormFields = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

      {/* ═══ THÔNG TIN CƠ BẢN ═══ */}
      <SectionTitle>Thông tin cơ bản</SectionTitle>

      <TextField label="Tiêu đề ưu đãi *" size="small" fullWidth value={form.title}
        onChange={e => updateForm('title', e.target.value)} placeholder="Nhập tiêu đề ưu đãi"
        InputProps={{ startAdornment: <InputAdornment position="start"><LocalOfferIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
        sx={{ ...noOutlineSx }} />

      <TextField label="Mô tả ngắn" size="small" fullWidth multiline rows={2} value={form.excerpt}
        onChange={e => updateForm('excerpt', e.target.value)} placeholder="Tóm tắt ngắn gọn về ưu đãi..."
        sx={{ ...noOutlineSx }} />

      <TextField label="Nội dung chi tiết *" size="small" fullWidth multiline rows={5} value={form.content}
        onChange={e => updateForm('content', e.target.value)} placeholder="Nhập nội dung ưu đãi (hỗ trợ HTML)"
        sx={{ ...noOutlineSx }} />

      <SectionDivider />

      {/* ═══ HÌNH ẢNH ═══ */}
      <SectionTitle>Hình ảnh</SectionTitle>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Ảnh Thumbnail (URL)" size="small" fullWidth value={form.thumbnailUrl}
          onChange={e => updateForm('thumbnailUrl', e.target.value)} placeholder="https://..."
          sx={{ ...noOutlineSx }} />
        <TextField label="Ảnh Cover (URL)" size="small" fullWidth value={form.coverUrl}
          onChange={e => updateForm('coverUrl', e.target.value)} placeholder="https://..."
          sx={{ ...noOutlineSx }} />
      </Box>

      <SectionDivider />

      {/* ═══ PHÂN LOẠI & THỜI GIAN ═══ */}
      <SectionTitle>Phân loại & Thời gian</SectionTitle>

      {/* Row 1: Loại + Chế độ áp dụng + Trạng thái */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField select label="Loại" size="small" fullWidth value={form.type}
          onChange={e => updateForm('type', e.target.value)} sx={{ ...noOutlineSx }}>
          <MenuItem value="PROMOTION">Khuyến mãi</MenuItem>
          <MenuItem value="EVENT">Sự kiện</MenuItem>
        </TextField>
        <TextField select label="Chế độ áp dụng" size="small" fullWidth value={form.applyMode}
          onChange={e => updateForm('applyMode', e.target.value)} sx={{ ...noOutlineSx }}>
          <MenuItem value="ONLINE_VOUCHER">Voucher Online</MenuItem>
          <MenuItem value="OFFLINE_ONLY">Tại quầy</MenuItem>
          <MenuItem value="PAYMENT_METHOD_ONLY">PT Thanh toán</MenuItem>
        </TextField>
        <TextField select label="Trạng thái" size="small" fullWidth value={form.status}
          onChange={e => updateForm('status', e.target.value)} sx={{ ...noOutlineSx }}>
          <MenuItem value="DRAFT">Bản nháp</MenuItem>
          <MenuItem value="ACTIVE">Hoạt động</MenuItem>
          <MenuItem value="INACTIVE">Ngừng</MenuItem>
          <MenuItem value="EXPIRED">Hết hạn</MenuItem>
        </TextField>
      </Box>

      {/* Row 2: Ngày bắt đầu + Ngày kết thúc */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Ngày bắt đầu *" size="small" fullWidth type="date" value={form.startAt}
          onChange={e => updateForm('startAt', e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ ...noOutlineSx }} />
        <TextField label="Ngày kết thúc *" size="small" fullWidth type="date" value={form.endAt}
          onChange={e => updateForm('endAt', e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ ...noOutlineSx }} />
      </Box>

      {/* Row 3: Vị trí hiển thị + Banner (nếu có) */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField select label="Vị trí hiển thị" size="small" fullWidth value={form.displayPosition}
          onChange={e => updateForm('displayPosition', e.target.value)} sx={{ ...noOutlineSx }}>
          <MenuItem value="LIST">Danh sách</MenuItem>
          <MenuItem value="BOTTOM_BANNER">Banner dưới</MenuItem>
        </TextField>
        {form.displayPosition === 'BOTTOM_BANNER' && (
          <TextField label="Thứ tự Banner" size="small" fullWidth type="number" value={form.bannerOrder}
            onChange={e => updateForm('bannerOrder', e.target.value)} sx={{ ...noOutlineSx }} />
        )}
      </Box>

      <SectionDivider />

      {/* ═══ CẤU HÌNH ƯU ĐÃI ═══ */}
      <SectionTitle>Cấu hình ưu đãi</SectionTitle>

      {form.applyMode === 'ONLINE_VOUCHER' && (
        <>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select label="Liên kết Voucher" size="small" fullWidth value={form.voucherId}
              onChange={e => updateForm('voucherId', e.target.value)} sx={{ ...noOutlineSx }}>
              <MenuItem value="">— Không liên kết —</MenuItem>
              {vouchers.map(v => (
                <MenuItem key={v._id} value={v._id}>
                  {v.code} ({v.type === 'PERCENT' ? `${v.value}%` : `${v.value?.toLocaleString('vi-VN')}đ`})
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Lượt/user" size="small" type="number" value={form.quantityPerUser}
              onChange={e => updateForm('quantityPerUser', e.target.value)}
              sx={{ minWidth: 120, ...noOutlineSx }} />
          </Box>

          {/* Inline voucher creation */}
          {!showNewVoucherForm ? (
            <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />}
              onClick={() => setShowNewVoucherForm(true)}
              sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#1565c0', color: '#1565c0', fontSize: '0.8rem' }}>
              Tạo voucher mới
            </Button>
          ) : (
            <Box sx={{ border: `1px solid ${colors.borderSubtle}`, borderRadius: 2, p: 2.5, bgcolor: darkMode ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00796b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}>
                Tạo Voucher mới
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField label="Mã voucher *" size="small" fullWidth value={newVoucher.code}
                  onChange={e => updateNewVoucher('code', e.target.value.toUpperCase())} placeholder="VD: SUMMER2026"
                  sx={{ ...noOutlineSx }} />
                <TextField select label="Loại giảm" size="small" sx={{ minWidth: 180, ...noOutlineSx }}
                  value={newVoucher.type} onChange={e => updateNewVoucher('type', e.target.value)}>
                  <MenuItem value="PERCENT">Phần trăm (%)</MenuItem>
                  <MenuItem value="FIXED">Cố định (VNĐ)</MenuItem>
                </TextField>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField label={newVoucher.type === 'PERCENT' ? 'Giá trị (%) *' : 'Giá trị (VNĐ) *'}
                  size="small" fullWidth type="number" value={newVoucher.value}
                  onChange={e => updateNewVoucher('value', e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end">{newVoucher.type === 'PERCENT' ? '%' : 'đ'}</InputAdornment> }}
                  sx={{ ...noOutlineSx }} />
                {newVoucher.type === 'PERCENT' && (
                  <TextField label="Giảm tối đa (VNĐ)" size="small" fullWidth type="number" value={newVoucher.maxDiscount}
                    onChange={e => updateNewVoucher('maxDiscount', e.target.value)}
                    InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment> }}
                    sx={{ ...noOutlineSx }} />
                )}
                <TextField label="Giới hạn lượt" size="small" type="number" value={newVoucher.usageLimit}
                  onChange={e => updateNewVoucher('usageLimit', e.target.value)}
                  sx={{ minWidth: 140, ...noOutlineSx }} />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField label="Hiệu lực từ *" size="small" fullWidth type="date" value={newVoucher.validFrom}
                  onChange={e => updateNewVoucher('validFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }} sx={{ ...noOutlineSx }} />
                <TextField label="Hiệu lực đến *" size="small" fullWidth type="date" value={newVoucher.validTo}
                  onChange={e => updateNewVoucher('validTo', e.target.value)}
                  InputLabelProps={{ shrink: true }} sx={{ ...noOutlineSx }} />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button size="small" onClick={resetNewVoucher}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, color: colors.textMuted, fontSize: '0.8rem', px: 2 }}>
                  Huỷ
                </Button>
                <Button variant="contained" size="small" onClick={handleCreateVoucher}
                  disabled={creatingVoucher || !newVoucher.code.trim() || !newVoucher.value || !newVoucher.validFrom || !newVoucher.validTo}
                  startIcon={creatingVoucher ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <AddCircleOutlineIcon />}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#00796b', fontSize: '0.8rem', px: 2, '&:hover': { bgcolor: '#004d40' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}>
                  {creatingVoucher ? 'Đang tạo...' : 'Tạo voucher'}
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}

      {form.applyMode === 'OFFLINE_ONLY' && (
        <TextField select label="Chế độ offline" size="small" fullWidth value={form.offlineMode}
          onChange={e => updateForm('offlineMode', e.target.value)} sx={{ ...noOutlineSx }}>
          <MenuItem value="QR_REDEEM">Quét QR tại quầy</MenuItem>
          <MenuItem value="INFO_ONLY">Chỉ thông tin</MenuItem>
        </TextField>
      )}

      {/* Giới hạn + Hạng thành viên */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Giới hạn tổng lượt (trống = không giới hạn)" size="small" fullWidth
          type="number" value={form.totalRedeemsLimit}
          onChange={e => updateForm('totalRedeemsLimit', e.target.value)}
          sx={{ ...noOutlineSx }} />

        <FormControl fullWidth size="small" sx={{ ...noOutlineSx }}>
          <InputLabel>Hạng thành viên</InputLabel>
          <Select
            multiple
            value={form.allowedUserRanks}
            onChange={e => updateForm('allowedUserRanks', e.target.value)}
            input={<OutlinedInput label="Hạng thành viên" />}
            renderValue={(selected) => selected.map(r => RANK_LABELS[r] || r).join(', ')}
          >
            {RANKS.map(rank => (
              <MenuItem key={rank} value={rank}>
                <Checkbox checked={form.allowedUserRanks.includes(rank)} size="small" />
                <ListItemText primary={RANK_LABELS[rank]} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <SectionDivider />

      {/* ═══ TUỲ CHỌN NÂNG CAO ═══ */}
      <SectionTitle>Tuỳ chọn nâng cao</SectionTitle>

      <TextField label="Ghi chú hiển thị cho khách hàng" size="small" fullWidth multiline rows={2} value={form.notes}
        onChange={e => updateForm('notes', e.target.value)} placeholder="Lưu ý dành cho khách hàng..."
        sx={{ ...noOutlineSx }} />

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField label="Độ ưu tiên" size="small" type="number" value={form.priority}
          onChange={e => updateForm('priority', e.target.value)} sx={{ width: 130, ...noOutlineSx }} />
        <FormControlLabel
          control={<Switch checked={form.isFeatured} onChange={e => updateForm('isFeatured', e.target.checked)} size="small" />}
          label={<Typography sx={{ fontSize: '0.85rem' }}>Nổi bật</Typography>}
        />
        {!isEdit && (
          <FormControlLabel
            control={<Switch checked={form.sendNotification} onChange={e => updateForm('sendNotification', e.target.checked)} size="small" />}
            label={<Typography sx={{ fontSize: '0.85rem' }}>Gửi email thông báo</Typography>}
          />
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản lý Ưu đãi
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Thêm, sửa, xóa ưu đãi khuyến mãi trong hệ thống
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Tải lại">
            <IconButton onClick={fetchPromotions} sx={{ color: colors.textMuted }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}
            sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' } }}>
            Thêm mới
          </Button>
        </Box>
      </Box>

      {/* MAIN CARD */}
      <Card sx={{ ...cardSx }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField select size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ minWidth: 160, ...noOutlineSx }}>
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="DRAFT">Bản nháp</MenuItem>
              <MenuItem value="ACTIVE">Hoạt động</MenuItem>
              <MenuItem value="INACTIVE">Ngừng</MenuItem>
              <MenuItem value="EXPIRED">Hết hạn</MenuItem>
            </TextField>

            <TextField size="small" placeholder="Tìm kiếm theo tiêu đề..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
              sx={{ flex: 1, minWidth: 200, ...noOutlineSx }}
            />

            <Chip label={`${filteredPromotions.length} kết quả`} size="small"
              sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#e3f2fd', color: '#1565c0' }} />
          </Box>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={36} /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1100, '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1.2, verticalAlign: 'middle' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 60 }}>Ảnh</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 220 }}>Tiêu đề</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Loại</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 120 }}>Chế độ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 90 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 150 }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Voucher</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 80 }}>Thống kê</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 80 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPromotions.length > 0 ? filteredPromotions.map((promo, idx) => {
                    const statusStyle = STATUS_MAP[promo.status] || STATUS_MAP.DRAFT;
                    const typeStyle = TYPE_MAP[promo.type] || TYPE_MAP.PROMOTION;
                    const modeStyle = APPLY_MODE_MAP[promo.applyMode] || APPLY_MODE_MAP.ONLINE_VOUCHER;

                    return (
                      <TableRow key={promo._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                        <TableCell sx={{ fontSize: '0.8rem', color: colors.textMuted }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Avatar src={promo.thumbnailUrl} variant="rounded"
                            sx={{ width: 44, height: 44, bgcolor: 'transparent', fontSize: '0.7rem' }}>
                            <LocalOfferIcon sx={{ fontSize: 22, color: colors.textMuted }} />
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: colors.textPrimary }}>{promo.title}</Typography>
                          {promo.excerpt && (
                            <Typography variant="caption" sx={{
                              color: colors.textMuted, display: '-webkit-box', WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 0.2, lineHeight: 1.3
                            }}>
                              {promo.excerpt}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={typeStyle.label} size="small" sx={{
                            height: 22, fontSize: '0.7rem', fontWeight: 600,
                            bgcolor: darkMode ? 'transparent' : typeStyle.bg,
                            color: typeStyle.color,
                            border: darkMode ? `1px solid ${typeStyle.color}` : 'none',
                            '& .MuiChip-label': { px: 0.8 }
                          }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={modeStyle.label} size="small" sx={{
                            height: 22, fontSize: '0.7rem', fontWeight: 600,
                            bgcolor: darkMode ? 'transparent' : modeStyle.bg,
                            color: modeStyle.color,
                            border: darkMode ? `1px solid ${modeStyle.color}` : 'none',
                            '& .MuiChip-label': { px: 0.8 }
                          }} />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={statusStyle.label} size="small" sx={{
                            height: 24, fontSize: '0.72rem', fontWeight: 600,
                            bgcolor: darkMode ? 'transparent' : statusStyle.bg,
                            color: statusStyle.color,
                            border: darkMode ? `1px solid ${statusStyle.color}` : 'none',
                            '& .MuiChip-label': { px: 1 }
                          }} />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography sx={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                            {formatDate(promo.startAt)} <span style={{ color: colors.textMuted }}>→ {formatDate(promo.endAt)}</span>
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {promo.voucherId ? (
                            <Chip label={promo.voucherId.code || 'Có'} size="small" sx={{
                              height: 22, fontSize: '0.7rem', fontWeight: 600,
                              bgcolor: '#e8f5e9', color: '#2e7d32', '& .MuiChip-label': { px: 0.8 }
                            }} />
                          ) : (
                            <Typography sx={{ fontSize: '0.78rem', color: colors.textMuted }}>—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                              <VisibilityIcon sx={{ fontSize: 14, color: colors.textMuted }} />
                              <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>{promo.viewCount || 0}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                              <FavoriteIcon sx={{ fontSize: 14, color: '#e57373' }} />
                              <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>{promo.claimCount || 0}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Sửa">
                              <IconButton size="small" onClick={() => handleOpenEdit(promo)} sx={{ color: '#1565c0' }}>
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton size="small" onClick={() => { setDeleteTarget({ id: promo._id, title: promo.title }); setOpenDeleteConfirm(true); }} sx={{ color: '#e53935' }}>
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                        <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ color: colors.textMuted }}>Chưa có ưu đãi nào</Typography>
                      </TableCell>
                    </TableRow>
                  )}
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
          {isEdit ? 'Cập nhật Ưu đãi' : 'Thêm Ưu đãi Mới'}
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            {isEdit ? 'Chỉnh sửa thông tin ưu đãi' : 'Tạo ưu đãi khuyến mãi mới'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important', maxHeight: '70vh' }}>
          {renderFormFields()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Huỷ</Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={submitting || !form.title.trim() || !form.content.trim() || !form.startAt || !form.endAt}
            startIcon={submitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : isEdit ? <EditIcon /> : <AddIcon />}
            sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo ưu đãi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: '#e53935', pb: 0.5, fontSize: '1.15rem' }}>
          <WarningAmberIcon sx={{ color: '#ff9800', fontSize: 28 }} />
          Xác nhận xóa ưu đãi
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: colors.textPrimary, mt: 1 }}>
            Bạn có chắc chắn muốn xóa ưu đãi <b>"{deleteTarget?.title}"</b> không?
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, mt: 1 }}>
            Ưu đãi sẽ chuyển sang trạng thái Ngừng hoạt động (soft delete).
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Huỷ</Button>
          <Button variant="contained" onClick={handleDelete} startIcon={<DeleteIcon />}
            sx={{ bgcolor: '#e53935', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#c62828' } }}>
            Xóa ưu đãi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPromotionPage;
