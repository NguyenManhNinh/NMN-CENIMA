import { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Avatar, CircularProgress,
  TextField, MenuItem, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  IconButton, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArticleIcon from '@mui/icons-material/Article';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  getAllFeaturedAdminAPI,
  createFeaturedAdminAPI,
  updateFeaturedAdminAPI,
  deleteFeaturedAdminAPI
} from '../../../apis/featuredApi';
import { useToast } from '../../../contexts/ToastContext';

// Card style
const getCardSx = (colors) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

// Status chip config
const STATUS_MAP = {
  draft: { label: 'Bản nháp', color: '#757575', bg: '#f5f5f5' },
  published: { label: 'Đã xuất bản', color: '#2e7d32', bg: '#e8f5e9' }
};

// Empty form
const EMPTY_FORM = {
  title: '',
  thumbnail: '',
  excerpt: '',
  videoUrl: '',
  status: 'published'
};

const EMPTY_MOVIE_ITEM = { title: '', descriptionAbove: '', imageUrl: '', descriptionBelow: '' };

// Format date for display
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
};

// ═══ Build HTML from movie items ═══
// Format: Tiêu đề → Mô tả trên → Ảnh → Mô tả dưới
const buildContentHTML = (items) => {
  if (!items || items.length === 0) return '';
  return items.map((item, idx) => {
    const num = idx + 1;
    let html = '';
    if (item.title) {
      html += `<h2>${num}. ${item.title}</h2>\n`;
    }
    if (item.descriptionAbove) {
      html += `<p>${item.descriptionAbove}</p>\n`;
    }
    if (item.imageUrl) {
      html += `<img src="${item.imageUrl}" alt="${item.title || `Phim ${num}`}" />\n`;
    }
    if (item.descriptionBelow) {
      html += `<p>${item.descriptionBelow}</p>\n`;
    }
    return html;
  }).join('\n');
};

// ═══ Parse HTML content back to movie items (for edit mode) ═══
// Format: <h2>N. Title</h2> <p>above</p> <img .../> <p>below</p>
const parseContentToItems = (html) => {
  if (!html || !html.trim()) return [];
  const items = [];
  const regex = /<h2>\s*(\d+)\.\s*(.*?)<\/h2>([\s\S]*?)(?=<h2>|$)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const title = match[2].trim();
    const body = match[3];

    // Extract image position to split descriptions
    const imgMatch = body.match(/<img[^>]*src=["']([^"']+)["']/i);
    const imageUrl = imgMatch ? imgMatch[1] : '';

    let descriptionAbove = '';
    let descriptionBelow = '';

    if (imgMatch) {
      // Split body at image tag
      const imgIdx = body.indexOf(imgMatch[0]);
      const beforeImg = body.substring(0, imgIdx);
      const afterImg = body.substring(imgIdx + imgMatch[0].length);

      // Get all <p> content before image
      const pBefore = [...beforeImg.matchAll(/<p>([\s\S]*?)<\/p>/gi)];
      descriptionAbove = pBefore.map(m => m[1].trim()).filter(Boolean).join('\n');

      // Get all <p> content after image
      const pAfter = [...afterImg.matchAll(/<p>([\s\S]*?)<\/p>/gi)];
      descriptionBelow = pAfter.map(m => m[1].trim()).filter(Boolean).join('\n');
    } else {
      // No image — all <p> goes to descriptionAbove
      const pAll = [...body.matchAll(/<p>([\s\S]*?)<\/p>/gi)];
      descriptionAbove = pAll.map(m => m[1].trim()).filter(Boolean).join('\n');
    }

    items.push({ title, descriptionAbove, imageUrl, descriptionBelow });
  }
  // If no structured items found, return one item with raw content
  if (items.length === 0 && html.trim()) {
    items.push({ title: '', descriptionAbove: html.replace(/<[^>]+>/g, '').trim(), imageUrl: '', descriptionBelow: '' });
  }
  return items;
};

const AdminFeaturedPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const { showToast } = useToast();
  const cardSx = getCardSx(colors);

  // State
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [movieItems, setMovieItems] = useState([{ ...EMPTY_MOVIE_ITEM }]);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch data
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await getAllFeaturedAdminAPI({ limit: 100 });
      setArticles(res.data || []);
    } catch (err) {
      console.error('Fetch featured articles error:', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchArticles(); }, []);

  // Filtered list
  const filtered = useMemo(() => {
    let list = [...articles];
    if (filterStatus !== 'ALL') list = list.filter(a => a.status === filterStatus);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(a => a.title?.toLowerCase().includes(q));
    }
    return list;
  }, [articles, filterStatus, search]);

  // Form helpers
  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setMovieItems([{ ...EMPTY_MOVIE_ITEM }]);
    setIsEdit(false);
    setCurrentId(null);
  };

  // Movie items helpers
  const addMovieItem = () => setMovieItems(prev => [...prev, { ...EMPTY_MOVIE_ITEM }]);
  const removeMovieItem = (idx) => setMovieItems(prev => prev.filter((_, i) => i !== idx));
  const updateMovieItem = (idx, key, value) => {
    setMovieItems(prev => prev.map((item, i) => i === idx ? { ...item, [key]: value } : item));
  };

  // Open add dialog
  const handleAdd = () => {
    resetForm();
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleEdit = (article) => {
    setForm({
      title: article.title || '',
      thumbnail: article.thumbnail || '',
      excerpt: article.excerpt || '',
      videoUrl: article.videoUrl || '',
      status: article.status || 'published'
    });
    // Parse existing content into movie items
    const parsed = parseContentToItems(article.content || '');
    setMovieItems(parsed.length > 0 ? parsed : [{ ...EMPTY_MOVIE_ITEM }]);
    setCurrentId(article._id);
    setIsEdit(true);
    setOpenDialog(true);
  };

  // Submit
  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showToast('Vui lòng nhập tiêu đề bài viết', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      // Build HTML content from movie items
      const contentHTML = buildContentHTML(movieItems.filter(m => m.title || m.description || m.imageUrl));

      const payload = {
        title: form.title.trim(),
        thumbnail: form.thumbnail.trim(),
        excerpt: form.excerpt.trim(),
        content: contentHTML,
        videoUrl: form.videoUrl.trim(),
        status: form.status
      };

      // Remove empty optional fields
      if (!payload.thumbnail) delete payload.thumbnail;
      if (!payload.excerpt) delete payload.excerpt;
      if (!payload.videoUrl) delete payload.videoUrl;

      if (isEdit) {
        await updateFeaturedAdminAPI(currentId, payload);
      } else {
        await createFeaturedAdminAPI(payload);
      }

      setOpenDialog(false);
      resetForm();
      fetchArticles();
    } catch (err) {
      console.error('Submit error:', err.response?.data || err);
      showToast(err.response?.data?.message || 'Lỗi khi lưu bài viết!', 'error');
    } finally { setSubmitting(false); }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFeaturedAdminAPI(deleteTarget.id);
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      fetchArticles();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi xóa bài viết!', 'error');
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
    <Box sx={{
      display: 'flex', flexDirection: 'column', gap: 2, mt: 1,
      '& .MuiOutlinedInput-root': {
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
      }
    }}>

      {/* ═══ THÔNG TIN CƠ BẢN ═══ */}
      <SectionTitle>Thông tin cơ bản</SectionTitle>

      <TextField label="Tiêu đề bài viết *" size="small" fullWidth value={form.title}
        onChange={e => updateForm('title', e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><ArticleIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
        sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />

      <TextField label="Mô tả ngắn" size="small" fullWidth multiline rows={2} value={form.excerpt}
        onChange={e => updateForm('excerpt', e.target.value)} placeholder="Tóm tắt ngắn gọn bài viết  "
        sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />

      <SectionDivider />

      {/* ═══ HÌNH ẢNH & VIDEO ═══ */}
      <SectionTitle>Ảnh bìa & Video giới thiệu</SectionTitle>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Ảnh Thumbnail (URL) *" size="small" fullWidth value={form.thumbnail}
          onChange={e => updateForm('thumbnail', e.target.value)} placeholder="https://..."
          sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />
        <TextField label="Video YouTube (URL)" size="small" fullWidth value={form.videoUrl}
          onChange={e => updateForm('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=... hoặc embed URL"
          sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />
      </Box>

      <SectionDivider />

      {/* ═══ DANH SÁCH PHIM ═══ */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle>Danh sách phim ({movieItems.length} mục)</SectionTitle>
        <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={addMovieItem}
          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#1565c0' }}>
          Thêm phim
        </Button>
      </Box>

      {movieItems.map((item, idx) => (
        <Box key={idx} sx={{
          border: `1px solid ${colors.borderSubtle}`, borderRadius: 2, p: 2,
          bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafbfc',
          position: 'relative'
        }}>
          {/* Header: number + remove button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1565c0' }}>
              Phim #{idx + 1}
            </Typography>
            {movieItems.length > 1 && (
              <IconButton size="small" onClick={() => removeMovieItem(idx)}
                sx={{ color: '#e53935', '&:hover': { bgcolor: '#ffebee' } }}>
                <RemoveCircleOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>

          {/* Title */}
          <TextField label={`Tên phim #${idx + 1}`} size="small" fullWidth value={item.title}
            onChange={e => updateMovieItem(idx, 'title', e.target.value)}
            sx={{ mb: 1.5, '& fieldset': { borderColor: colors.borderSubtle } }} />

          {/* Description Above Image */}
          <TextField label="Mô tả trên ảnh" size="small" fullWidth multiline rows={2} value={item.descriptionAbove}
            onChange={e => updateMovieItem(idx, 'descriptionAbove', e.target.value)}
            placeholder="Nội dung hiển thị phía trên ảnh..."
            sx={{ mb: 1.5, '& fieldset': { borderColor: colors.borderSubtle } }} />

          {/* Image URL */}
          <TextField label="Ảnh phim (URL)" size="small" fullWidth value={item.imageUrl}
            onChange={e => updateMovieItem(idx, 'imageUrl', e.target.value)}
            placeholder="https://..."
            sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />

          {/* Image preview */}
          {item.imageUrl && (
            <Box sx={{ mt: 1, mb: 1.5, textAlign: 'center' }}>
              <Box component="img" src={item.imageUrl} alt={item.title}
                sx={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }}
                onError={e => { e.target.style.display = 'none'; }} />
            </Box>
          )}

          {/* Description Below Image */}
          <TextField label="Mô tả dưới ảnh" size="small" fullWidth multiline rows={2} value={item.descriptionBelow}
            onChange={e => updateMovieItem(idx, 'descriptionBelow', e.target.value)}
            placeholder="Nội dung hiển thị phía dưới ảnh..."
            sx={{ mt: 1.5, '& fieldset': { borderColor: colors.borderSubtle } }} />
        </Box>
      ))}

      <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={addMovieItem} fullWidth
        sx={{
          textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: colors.borderSubtle,
          color: colors.textSecondary, borderStyle: 'dashed', py: 1
        }}>
        + Thêm phim mới
      </Button>

      <SectionDivider />

      {/* ═══ TRẠNG THÁI ═══ */}
      <SectionTitle>Trạng thái</SectionTitle>

      <TextField select label="Trạng thái" size="small" value={form.status}
        onChange={e => updateForm('status', e.target.value)}
        sx={{ width: 200, '& fieldset': { borderColor: colors.borderSubtle } }}>
        <MenuItem value="published">Đã xuất bản</MenuItem>
        <MenuItem value="draft">Bản nháp</MenuItem>
      </TextField>
    </Box>
  );

  const noOutlineSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, fontSize: '0.85rem',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* HEADER — outside card */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Phim Hay Hàng Tháng
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Quản lý bài viết giới thiệu phim hay hàng tháng
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Tải lại">
            <IconButton onClick={fetchArticles} sx={{ color: colors.textMuted }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}
            sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' } }}>
            Thêm bài viết
          </Button>
        </Box>
      </Box>

      {/* MAIN CARD — filters + table */}
      <Card sx={{ ...cardSx }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField select size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ minWidth: 160, ...noOutlineSx }}>
              <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
              <MenuItem value="published">Đã xuất bản</MenuItem>
              <MenuItem value="draft">Bản nháp</MenuItem>
            </TextField>

            <TextField size="small" placeholder="Tìm kiếm theo tiêu đề..." value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
              sx={{ flex: 1, minWidth: 200, ...noOutlineSx }}
            />

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
                {search || filterStatus !== 'ALL' ? 'Không tìm thấy bài viết phù hợp' : 'Chưa có bài viết nào'}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', border: `1px solid ${colors.borderSubtle}`, borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 60 }}>Ảnh</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem' }}>Tiêu đề</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Ngày tạo</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Thống kê</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }} align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((article, idx) => {
                    const statusStyle = STATUS_MAP[article.status] || STATUS_MAP.draft;
                    return (
                      <TableRow key={article._id} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafbfc' }, transition: 'background 0.15s' }}>
                        <TableCell sx={{ fontSize: '0.78rem', color: colors.textMuted }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Avatar variant="rounded" src={article.thumbnail} sx={{ width: 48, height: 32, bgcolor: '#e0e0e0', fontSize: '0.6rem' }}>
                            {!article.thumbnail && <ArticleIcon sx={{ fontSize: 16 }} />}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: colors.textPrimary }}>
                            {article.title}
                          </Typography>
                          {article.excerpt && (
                            <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted, mt: 0.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {article.excerpt}
                            </Typography>
                          )}
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
                            {formatDate(article.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                              <VisibilityIcon sx={{ fontSize: 14, color: colors.textMuted }} />
                              <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>{article.viewCount || 0}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                              <FavoriteIcon sx={{ fontSize: 14, color: '#e57373' }} />
                              <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>{article.likeCount || 0}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Sửa">
                              <IconButton size="small" onClick={() => handleEdit(article)}
                                sx={{ color: '#1565c0', '&:hover': { bgcolor: '#e3f2fd' } }}>
                                <EditIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xoá">
                              <IconButton size="small"
                                onClick={() => { setDeleteTarget({ id: article._id, title: article.title }); setOpenDeleteConfirm(true); }}
                                sx={{ color: '#e53935', '&:hover': { bgcolor: '#ffebee' } }}>
                                <DeleteIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
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
          {isEdit ? 'Cập nhật Bài viết' : 'Thêm Bài viết Mới'}
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            {isEdit ? 'Chỉnh sửa thông tin bài viết phim hay hàng tháng' : 'Tạo bài viết phim hay hàng tháng mới'}
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
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo bài viết'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: '#e53935', pb: 0.5, fontSize: '1.15rem' }}>
          <WarningAmberIcon sx={{ color: '#e53935' }} /> Xác nhận xoá
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.textSecondary, fontSize: '0.88rem', lineHeight: 1.6 }}>
            Bạn có chắc muốn xoá bài viết <strong>"{deleteTarget?.title}"</strong>?
          </Typography>
          <Typography sx={{ color: colors.textMuted, fontSize: '0.78rem', mt: 1 }}>
            Hành động này sẽ xoá vĩnh viễn bài viết và không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}>Huỷ</Button>
          <Button variant="contained" onClick={handleDelete}
            sx={{ bgcolor: '#e53935', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#c62828' } }}>
            Xoá bài viết
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminFeaturedPage;
