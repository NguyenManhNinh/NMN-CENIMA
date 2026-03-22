import { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress,
  TextField, MenuItem, InputAdornment, Tabs, Tab, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  IconButton, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { getAdminUserListAPI } from '../../../apis/userManagementApi';
import {
  getAllMembershipInfoAdminAPI,
  updateMembershipInfoAdminAPI
} from '../../../apis/membershipInfoApi';
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

// Rank config
const RANK_MAP = {
  MEMBER: { label: 'Member', color: '#616161', bg: '#f5f5f5', icon: <CardMembershipIcon sx={{ fontSize: 14 }} /> },
  VIP: { label: 'VIP', color: '#e65100', bg: '#fff3e0', icon: <StarIcon sx={{ fontSize: 14 }} /> },
  DIAMOND: { label: 'Diamond', color: '#1565c0', bg: '#e3f2fd', icon: <DiamondIcon sx={{ fontSize: 14 }} /> }
};

const EMPTY_SECTION = { title: '', slug: '', imageUrl: '', content: '', sortOrder: 0 };

const EMPTY_FORM = {
  title: 'Chương trình Thành viên NMN Cinema Membership | Tích điểm và đổi thưởng',
  sections: [{ ...EMPTY_SECTION }],
  status: 'active'
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
};

const formatNumber = (n) => {
  if (!n && n !== 0) return '0';
  return n.toLocaleString('vi-VN');
};

const noOutlineSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.85rem',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
  }
};

const AdminMembershipPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const { showToast } = useToast();
  const cardSx = getCardSx(colors);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // ═══ TAB 1: User membership list ═══
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRank, setFilterRank] = useState('ALL');

  // ═══ TAB 2: Content management ═══
  const [infos, setInfos] = useState([]);
  const [infosLoading, setInfosLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM, sections: [{ ...EMPTY_SECTION }] });
  const [submitting, setSubmitting] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await getAdminUserListAPI({ limit: 500 });
      setUsers(res.data?.users || res.data || []);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally { setUsersLoading(false); }
  };

  // Fetch membership infos
  const fetchInfos = async () => {
    setInfosLoading(true);
    try {
      const res = await getAllMembershipInfoAdminAPI();
      setInfos(res.data || []);
    } catch (err) {
      console.error('Fetch membership info error:', err);
    } finally { setInfosLoading(false); }
  };

  useEffect(() => { fetchUsers(); fetchInfos(); }, []);

  // Filtered users
  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (filterRank !== 'ALL') list = list.filter(u => u.rank === filterRank);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
      );
    }
    // Sort by points descending
    list.sort((a, b) => (b.points || 0) - (a.points || 0));
    return list;
  }, [users, filterRank, searchQuery]);

  // Filtered infos
  const filteredInfos = useMemo(() => {
    let list = [...infos];
    if (filterStatus !== 'ALL') list = list.filter(i => i.status === filterStatus);
    return list;
  }, [infos, filterStatus]);

  // Form helpers
  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const resetForm = () => { setForm({ ...EMPTY_FORM, sections: [{ ...EMPTY_SECTION }] }); setIsEdit(false); };

  // Section helpers
  const addSection = () => setForm(prev => ({
    ...prev,
    sections: [...prev.sections, { ...EMPTY_SECTION, sortOrder: prev.sections.length + 1 }]
  }));
  const removeSection = (idx) => setForm(prev => ({
    ...prev,
    sections: prev.sections.filter((_, i) => i !== idx)
  }));
  const updateSection = (idx, key, value) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i === idx ? { ...s, [key]: value } : s)
    }));
  };

  // Open add
  const handleAdd = () => { resetForm(); setOpenDialog(true); };

  // Open edit
  const handleEditInfo = (info) => {
    setForm({
      title: info.title || '',
      sections: info.sections?.length > 0 ? info.sections.map(s => ({
        title: s.title || '', slug: s.slug || '', imageUrl: s.imageUrl || '',
        content: (s.content || '').replace(/<br\s*\/?>/gi, '\n'), sortOrder: s.sortOrder || 0
      })) : [{ ...EMPTY_SECTION }],
      status: info.status || 'active'
    });
    setIsEdit(true);
    setOpenDialog(true);
  };

  // Submit
  const handleSubmit = async () => {
    if (!form.title.trim()) { showToast('Vui lòng nhập tiêu đề', 'warning'); return; }
    const validSections = form.sections.filter(s => s.title.trim());
    if (validSections.length === 0) { showToast('Cần ít nhất 1 section có tiêu đề', 'warning'); return; }
    setSubmitting(true);
    try {
      await updateMembershipInfoAdminAPI({
        title: form.title.trim(),
        sections: validSections.map((s, i) => ({
          title: s.title.trim(),
          slug: s.slug.trim() || s.title.trim().toLowerCase().replace(/\s+/g, '-'),
          imageUrl: s.imageUrl.trim(),
          content: s.content.replace(/\n/g, '<br>'),
          sortOrder: s.sortOrder || i + 1
        })),
        status: form.status
      });
      setOpenDialog(false);
      resetForm();
      fetchInfos();
    } catch (err) {
      console.error('Submit error:', err.response?.data || err);
      showToast(err.response?.data?.message || 'Lỗi khi lưu!', 'error');
    } finally { setSubmitting(false); }
  };

  // Section title helper
  const FormSectionTitle = ({ children }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {children}
    </Typography>
  );
  const SectionDivider = () => <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />;

  // ═══ Render content form ═══
  const renderFormFields = () => (
    <Box sx={{
      display: 'flex', flexDirection: 'column', gap: 2, mt: 1,
      '& .MuiOutlinedInput-root': {
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 }
      }
    }}>
      <FormSectionTitle>Thông tin cơ bản</FormSectionTitle>
      <TextField label="Tiêu đề trang *" size="small" fullWidth value={form.title}
        onChange={e => updateForm('title', e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><ArticleIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
        sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />

      <SectionDivider />

      {/* SECTIONS */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormSectionTitle>Danh sách Section ({form.sections.length} mục)</FormSectionTitle>
        <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={addSection}
          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#1565c0' }}>
          Thêm section
        </Button>
      </Box>

      {form.sections.map((section, idx) => (
        <Box key={idx} sx={{
          border: `1px solid ${colors.borderSubtle}`, borderRadius: 2, p: 2,
          bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafbfc'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1565c0' }}>
              Section #{idx + 1}
            </Typography>
            {form.sections.length > 1 && (
              <IconButton size="small" onClick={() => removeSection(idx)}
                sx={{ color: '#e53935', '&:hover': { bgcolor: '#ffebee' } }}>
                <RemoveCircleOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
            <TextField label="Tiêu đề section *" size="small" fullWidth value={section.title}
              onChange={e => updateSection(idx, 'title', e.target.value)}
              sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />
            <TextField label="Slug" size="small" fullWidth value={section.slug}
              onChange={e => updateSection(idx, 'slug', e.target.value)}
              placeholder="VD: the-le-quy-dinh"
              sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />
            <TextField label="Thứ tự" size="small" type="number" value={section.sortOrder}
              onChange={e => updateSection(idx, 'sortOrder', Number(e.target.value))}
              sx={{ width: 100, '& fieldset': { borderColor: colors.borderSubtle } }} />
          </Box>

          <TextField label="URL ảnh minh họa" size="small" fullWidth value={section.imageUrl}
            onChange={e => updateSection(idx, 'imageUrl', e.target.value)}
            placeholder="https://..."
            sx={{ mb: 1.5, '& fieldset': { borderColor: colors.borderSubtle } }} />

          {section.imageUrl && (
            <Box sx={{ mb: 1.5, textAlign: 'center' }}>
              <Box component="img" src={section.imageUrl} alt={section.title}
                sx={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 1, border: '1px solid #eee' }}
                onError={e => { e.target.style.display = 'none'; }} />
            </Box>
          )}

          <TextField label="Nội dung (HTML)" size="small" fullWidth multiline rows={4} value={section.content}
            onChange={e => updateSection(idx, 'content', e.target.value)}
            placeholder="Nhập nội dung HTML cho section..."
            sx={{ '& fieldset': { borderColor: colors.borderSubtle } }} />
        </Box>
      ))}

      <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={addSection} fullWidth
        sx={{
          textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: colors.borderSubtle,
          color: colors.textSecondary, borderStyle: 'dashed', py: 1
        }}>
        + Thêm section mới
      </Button>

      <SectionDivider />

      <FormSectionTitle>Trạng thái</FormSectionTitle>
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
            Quản lý Thành Viên
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Quản lý thành viên và nội dung trang chương trình thành viên
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Tải lại">
            <IconButton onClick={() => { fetchUsers(); fetchInfos(); }} sx={{ color: colors.textMuted }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {activeTab === 1 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}
              sx={{ bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, '&:hover': { bgcolor: '#163f78' } }}>
              Thêm nội dung
            </Button>
          )}
        </Box>
      </Box>

      {/* TABs */}
      <Card sx={{ ...cardSx }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
          sx={{
            borderBottom: `1px solid ${colors.borderSubtle}`, px: 2,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', minHeight: 48 },
            '& .Mui-selected': { color: '#1565c0' },
            '& .MuiTabs-indicator': { backgroundColor: '#1565c0' }
          }}>
          <Tab icon={<PeopleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Danh sách thành viên" />
          <Tab icon={<ArticleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Nội dung trang" />
        </Tabs>

        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>

          {/* ═══ TAB 0: User List ═══ */}
          {activeTab === 0 && (
            <>
              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField select size="small" value={filterRank} onChange={e => setFilterRank(e.target.value)} sx={{ minWidth: 140, ...noOutlineSx }}>
                  <MenuItem value="ALL">Tất cả hạng</MenuItem>
                  <MenuItem value="MEMBER">Member</MenuItem>
                  <MenuItem value="VIP">VIP</MenuItem>
                  <MenuItem value="DIAMOND">Diamond</MenuItem>
                </TextField>

                <TextField size="small" placeholder="Tìm tên, email, SĐT..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment> }}
                  sx={{ minWidth: 220, ...noOutlineSx }} />

                <Chip label={`${filteredUsers.length} thành viên`} size="small"
                  sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#e3f2fd', color: '#1565c0' }} />
              </Box>

              {/* Users Table */}
              {usersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={36} sx={{ color: '#1B4F93' }} />
                </Box>
              ) : filteredUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1 }} />
                  <Typography sx={{ color: colors.textMuted, fontSize: '0.85rem' }}>Không tìm thấy thành viên</Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', border: `1px solid ${colors.borderSubtle}`, borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 40 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem' }}>Thành viên</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>SĐT</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 120 }} align="center">Điểm tích lũy</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }} align="center">Hạng</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110, whiteSpace: 'nowrap' }}>Ngày tham gia</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((user, idx) => {
                        const rankStyle = RANK_MAP[user.rank] || RANK_MAP.MEMBER;
                        return (
                          <TableRow key={user._id} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafbfc' }, transition: 'background 0.15s' }}>
                            <TableCell sx={{ fontSize: '0.78rem', color: colors.textMuted }}>{idx + 1}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <Avatar src={user.avatar} alt={user.name} sx={{ width: 30, height: 30, fontSize: '0.7rem', bgcolor: '#1565c0' }}>
                                  {(user.name || '?')[0]}
                                </Avatar>
                                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: colors.textPrimary }}>
                                  {user.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: '0.78rem', color: colors.textSecondary }}>{user.email}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: '0.78rem', color: colors.textSecondary }}>{user.phone || '—'}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={formatNumber(user.points || 0)} size="small"
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 700, bgcolor: (user.points || 0) > 0 ? '#fff3e0' : '#f5f5f5', color: (user.points || 0) > 0 ? '#e65100' : '#9e9e9e' }} />
                            </TableCell>
                            <TableCell align="center">
                              <Chip icon={rankStyle.icon} label={rankStyle.label} size="small" sx={{
                                height: 22, fontSize: '0.7rem', fontWeight: 600,
                                bgcolor: darkMode ? 'transparent' : rankStyle.bg,
                                color: rankStyle.color,
                                border: darkMode ? `1px solid ${rankStyle.color}` : 'none',
                                '& .MuiChip-icon': { ml: 0.5 }, '& .MuiChip-label': { px: 0.8 }
                              }} />
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography sx={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                                {formatDate(user.createdAt)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}

          {/* ═══ TAB 1: Content Management ═══ */}
          {activeTab === 1 && (
            <>
              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField select size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ minWidth: 160, ...noOutlineSx }}>
                  <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                </TextField>
                <Chip label={`${filteredInfos.length} kết quả`} size="small"
                  sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#e3f2fd', color: '#1565c0' }} />
              </Box>

              {/* Infos Table */}
              {infosLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={36} sx={{ color: '#1B4F93' }} />
                </Box>
              ) : filteredInfos.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1 }} />
                  <Typography sx={{ color: colors.textMuted, fontSize: '0.85rem' }}>
                    {filterStatus !== 'ALL' ? 'Không tìm thấy nội dung phù hợp' : 'Chưa có nội dung nào'}
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', border: `1px solid ${colors.borderSubtle}`, borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 40 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem' }}>Tiêu đề</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100, whiteSpace: 'nowrap' }}>Số section</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 200 }}>Tên các section</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 120 }}>Trạng thái</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 110 }}>Cập nhật</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 80, whiteSpace: 'nowrap' }} align="center">Hành động</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredInfos.map((info, idx) => {
                        const statusStyle = STATUS_MAP[info.status] || STATUS_MAP.draft;
                        return (
                          <TableRow key={info._id} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafbfc' }, transition: 'background 0.15s' }}>
                            <TableCell sx={{ fontSize: '0.78rem', color: colors.textMuted }}>{idx + 1}</TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: colors.textPrimary, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {info.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={info.sections?.length || 0} size="small"
                                sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#e3f2fd', color: '#1565c0' }} />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {info.sections?.map((s, i) => (
                                  <Chip key={i} label={s.title} size="small"
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
                                {formatDate(info.updatedAt)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Sửa">
                                <IconButton size="small" onClick={() => handleEditInfo(info)}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* ADD/EDIT DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          {isEdit ? 'Cập nhật Nội dung Thành viên' : 'Thêm Nội dung Mới'}
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            {isEdit ? 'Chỉnh sửa nội dung trang thành viên' : 'Tạo nội dung trang thành viên mới'}
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
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminMembershipPage;
