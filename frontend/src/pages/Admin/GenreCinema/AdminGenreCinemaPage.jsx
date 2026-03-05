import { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  TextField, MenuItem, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Chip, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import InboxIcon from '@mui/icons-material/Inbox';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getAllGenresAPI, deleteGenreAPI } from '../../../apis/genreApi';
import { getYoutubeInfoAPI } from '../../../apis/movieApi';
import AddGenreModal from './AddGenreModal';
import EditGenreModal from './EditGenreModal';

// Status map
const STATUS_MAP = {
  NOW: { label: 'Đang chiếu', color: '#4caf50' },
  COMING: { label: 'Sắp chiếu', color: '#ff9800' },
  ARCHIVE: { label: 'Lưu trữ', color: '#9e9e9e' }
};

// Age rating colors
const AGE_COLORS = {
  P: '#4caf50', C13: '#ff9800', C16: '#f44336', C18: '#d32f2f', K: '#9e9e9e'
};

// YouTube ID extractor
const getYoutubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
};

const AdminGenreCinemaPage = () => {
  const { colors } = useAdminTheme();
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail dialog
  const [detailDialog, setDetailDialog] = useState({ open: false, genre: null });
  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState({ open: false, genre: null });
  // YouTube info
  const [ytInfoMap, setYtInfoMap] = useState({});
  // Stills gallery
  const [stillsDialog, setStillsDialog] = useState({ open: false, images: [], name: '' });
  // Actors gallery
  const [actorsDialog, setActorsDialog] = useState({ open: false, actors: [] });
  // Add modal
  const [openAddModal, setOpenAddModal] = useState(false);
  // Edit modal
  const [editGenre, setEditGenre] = useState(null);

  const cardSx = {
    bgcolor: colors.bgCard,
    borderRadius: 3,
    border: `1px solid ${colors.borderCard}`,
    boxShadow: 'none'
  };

  // Fetch genres
  const fetchGenres = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllGenresAPI({ limit: 100 });
      setGenres(res.data?.genres || []);
    } catch (err) {
      console.error('Lỗi tải danh sách thể loại:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGenres(); }, [fetchGenres]);

  // Fetch YouTube info for trailers
  useEffect(() => {
    if (genres.length === 0) return;
    genres.forEach((g) => {
      const ytId = getYoutubeId(g.trailerUrl);
      if (!ytId || ytInfoMap[ytId]) return;
      getYoutubeInfoAPI(ytId)
        .then(res => {
          const d = res.data;
          if (d) {
            setYtInfoMap(prev => ({ ...prev, [ytId]: { title: d.title, channel: d.channel, avatar: d.avatar } }));
          }
        })
        .catch(() => { });
    });
  }, [genres]);

  // Filter
  const filteredGenres = genres.filter(g => {
    const matchSearch = !searchQuery ||
      g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.country?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Delete
  const handleDelete = async () => {
    try {
      await deleteGenreAPI(deleteDialog.genre._id);
      setDeleteDialog({ open: false, genre: null });
      fetchGenres();
    } catch (err) {
      console.error('Lỗi xoá:', err);
    }
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN');
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary }}>
            Quản lý Thể loại phim
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Góc điện ảnh — {filteredGenres.length} bài viết
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained" size="small"
            onClick={() => setOpenAddModal(true)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5, bgcolor: '#1B4F93', '&:hover': { bgcolor: '#163f78' } }}
          >
            Thêm mới
          </Button>
          <Tooltip title="Làm mới">
            <IconButton onClick={fetchGenres} sx={{ color: colors.textMuted }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search + Filter */}
      <Card sx={{ ...cardSx, mb: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Tìm theo tên, quốc gia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: colors.textMuted }} /></InputAdornment>
              }}
              sx={{
                flex: 1, minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, bgcolor: colors.bgSubtle, fontSize: '0.85rem',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' }
                }
              }}
            />
            <TextField
              select size="small" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                minWidth: 170,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, fontSize: '0.85rem',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' }
                }
              }}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="NOW">Đang chiếu</MenuItem>
              <MenuItem value="COMING">Sắp chiếu</MenuItem>
              <MenuItem value="ARCHIVE">Lưu trữ</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ ...cardSx, overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredGenres.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1 }} />
              <Typography sx={{ color: colors.textMuted }}>Không có dữ liệu</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
              <Table size="small" sx={{
                minWidth: 2200,
                '& .MuiTableCell-root': {
                  color: colors.textPrimary, borderColor: colors.borderSubtle,
                  py: 1.5, verticalAlign: 'middle', whiteSpace: 'nowrap'
                }
              }}>
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 700, fontSize: '0.8rem', color: colors.textMuted } }}>
                    <TableCell width={40} align="center">#</TableCell>
                    <TableCell>Hình ảnh</TableCell>
                    <TableCell>Tên bài viết</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell align="center">Thể loại</TableCell>
                    <TableCell align="center">Quốc gia</TableCell>
                    <TableCell align="center">Năm</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                    <TableCell align="center">Hiển thị</TableCell>
                    <TableCell align="center">Độ tuổi</TableCell>
                    <TableCell align="center">Thời lượng</TableCell>
                    <TableCell align="center">Ngày phát hành</TableCell>
                    <TableCell>Nhà SX</TableCell>
                    <TableCell>Đạo diễn</TableCell>
                    <TableCell>Diễn viên</TableCell>
                    <TableCell align="center">Trailer</TableCell>
                    <TableCell align="center">Banner</TableCell>
                    <TableCell align="center">Hình trong phim</TableCell>
                    <TableCell align="center">Hình diễn viên</TableCell>
                    <TableCell align="center">Lượt xem</TableCell>
                    <TableCell align="center">Lượt thích</TableCell>
                    <TableCell align="center">Đánh giá</TableCell>
                    <TableCell align="center">Ngày tạo</TableCell>
                    <TableCell align="center" width={100}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGenres.map((g, idx) => {
                    const st = STATUS_MAP[g.status] || STATUS_MAP.NOW;
                    return (
                      <TableRow key={g._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>{idx + 1}</TableCell>
                        <TableCell>
                          {g.imageUrl ? (
                            <Box
                              component="img"
                              src={g.imageUrl}
                              alt={g.name}
                              sx={{ width: 70, height: 100, objectFit: 'cover' }}
                            />
                          ) : (
                            <Box sx={{ width: 70, height: 100, bgcolor: colors.bgSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography sx={{ fontSize: '0.65rem', color: colors.textMuted }}>N/A</Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{g.name}</Typography>
                          {g.nameEn && <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>{g.nameEn}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>{g.slug || '—'}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap', justifyContent: 'center' }}>
                            {g.category?.slice(0, 2).map((cat, i) => (
                              <Chip key={i} label={cat} size="small" sx={{ fontSize: '0.68rem', height: 20, bgcolor: colors.bgSubtle }} />
                            ))}
                            {g.category?.length > 2 && (
                              <Chip label={`+${g.category.length - 2}`} size="small" sx={{ fontSize: '0.68rem', height: 20 }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{g.country || '—'}</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{g.year || '—'}</TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: st.color }}>{st.label}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={g.isActive === false ? 'Ẩn' : 'Hiện'}
                            size="small"
                            sx={{
                              fontSize: '0.7rem', height: 22, fontWeight: 600,
                              bgcolor: g.isActive === false ? 'rgba(244,67,54,0.1)' : 'rgba(76,175,80,0.1)',
                              color: g.isActive === false ? '#f44336' : '#4caf50'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{
                            fontSize: '0.72rem', fontWeight: 700,
                            color: AGE_COLORS[g.ageRating] || '#666',
                            border: `1px solid ${AGE_COLORS[g.ageRating] || '#ccc'}`,
                            borderRadius: 0.5, px: 0.8, py: 0.1, display: 'inline-block'
                          }}>
                            {g.ageRating || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{g.duration ? `${g.duration}p` : '—'}</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{fmtDate(g.releaseDate)}</TableCell>
                        <TableCell sx={{ fontSize: '0.78rem' }}>{g.studio || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.78rem', whiteSpace: 'normal' }}>{g.director || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.78rem', whiteSpace: 'normal' }}>{g.actors?.map(a => a.name).join(', ') || '—'}</TableCell>
                        <TableCell>
                          {(() => {
                            const ytId = getYoutubeId(g.trailerUrl);
                            const ytInfo = ytId ? ytInfoMap[ytId] : null;
                            return ytId ? (
                              <Box
                                component="a"
                                href={g.trailerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ display: 'block', position: 'relative', width: 190, aspectRatio: '16/9', overflow: 'hidden', borderRadius: '8px', textDecoration: 'none', '&:hover': { opacity: 0.92 } }}
                              >
                                <Box
                                  component="img"
                                  src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                  alt="Trailer"
                                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', gap: 0.5, p: '5px 6px', background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)' }}>
                                  {ytInfo?.avatar ? (
                                    <Box
                                      component="img"
                                      src={ytInfo.avatar}
                                      sx={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.3)' }}
                                    />
                                  ) : (
                                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#f44336', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.6rem', color: '#fff', fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)' }}>
                                      {ytInfo?.channel?.charAt(0) || 'Y'}
                                    </Box>
                                  )}
                                  <Typography sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                    {ytInfo?.title || 'Đang tải...'}
                                  </Typography>
                                  <MoreVertIcon sx={{ fontSize: 14, color: '#fff', flexShrink: 0, opacity: 0.8 }} />
                                </Box>
                                <Box sx={{ position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)', width: 40, height: 28, bgcolor: 'rgba(255,0,0,0.9)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Box sx={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #fff', ml: '2px' }} />
                                </Box>
                              </Box>
                            ) : (
                              <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>—</Typography>
                            );
                          })()}
                        </TableCell>
                        <TableCell align="center">
                          {g.bannerUrl ? (
                            <Box
                              component="img"
                              src={g.bannerUrl}
                              alt="Banner"
                              sx={{ width: 190, aspectRatio: '16/9', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                            />
                          ) : (
                            <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {g.stills?.length ? (
                            <Typography
                              onClick={() => setStillsDialog({ open: true, images: g.stills, name: g.name })}
                              sx={{ fontSize: '0.78rem', color: '#1565c0', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            >
                              {g.stills.length} ảnh
                            </Typography>
                          ) : (
                            <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {(() => {
                            const withPhoto = g.actors?.filter(a => a.photoUrl) || [];
                            return withPhoto.length ? (
                              <Typography
                                onClick={() => setActorsDialog({ open: true, actors: g.actors })}
                                sx={{ fontSize: '0.78rem', color: '#1565c0', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                              >
                                {withPhoto.length} ảnh
                              </Typography>
                            ) : (
                              <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>—</Typography>
                            );
                          })()}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                            <VisibilityIcon sx={{ fontSize: 14, color: colors.textMuted }} />
                            <Typography sx={{ fontSize: '0.78rem' }}>{(g.viewCount || 0).toLocaleString()}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                            <ThumbUpIcon sx={{ fontSize: 14, color: '#2196f3' }} />
                            <Typography sx={{ fontSize: '0.78rem' }}>{(g.likeCount || 0).toLocaleString()}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                            <StarIcon sx={{ fontSize: 14, color: '#ff9800' }} />
                            <Typography sx={{ fontSize: '0.78rem' }}>{g.rating || 0}</Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: colors.textMuted }}>({g.ratingCount || 0})</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.78rem' }}>{fmtDate(g.createdAt)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Chi tiết">
                            <IconButton size="small" onClick={() => setDetailDialog({ open: true, genre: g })} sx={{ color: colors.textMuted, mr: 0.3 }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sửa">
                            <IconButton size="small" onClick={() => setEditGenre(g)} sx={{ color: '#ff9800', mr: 0.3 }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xoá">
                            <IconButton size="small" onClick={() => setDeleteDialog({ open: true, genre: g })} sx={{ color: '#f44336' }}>
                              <DeleteIcon fontSize="small" />
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

      {/* === DETAIL DIALOG === */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, genre: null })}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 }, bgcolor: colors.bgCard } }}
      >
        {detailDialog.genre && (() => {
          const g = detailDialog.genre;
          const st = STATUS_MAP[g.status] || STATUS_MAP.NOW;
          const rows = [
            ['Tên', g.name],
            ['Tên tiếng Anh', g.nameEn || '—'],
            ['Slug', g.slug || '—'],
            ['Thể loại', g.category?.join(', ') || '—'],
            ['Quốc gia', g.country || '—'],
            ['Năm', g.year || '—'],
            ['Trạng thái', st.label],
            ['Hiển thị', g.isActive === false ? 'Ẩn' : 'Hiển thị'],
            ['Thứ tự', g.order ?? '—'],
            ['Phân loại', g.ageRating || '—'],
            ['Thời lượng', g.duration ? `${g.duration} phút` : '—'],
            ['Ngày phát hành', fmtDate(g.releaseDate)],
            ['Nhà sản xuất', g.studio || '—'],
            ['Đạo diễn', g.director || '—'],
            ['Diễn viên', g.actors?.map(a => a.name).join(', ') || '—'],
            ['Trailer', g.trailerUrl ? 'Có' : '—'],
            ['Banner', g.bannerUrl ? 'Có' : '—'],
            ['Hình ảnh bài viết', g.stills?.length ? `${g.stills.length} ảnh` : '—'],
            ['Lượt xem', (g.viewCount || 0).toLocaleString()],
            ['Lượt thích', (g.likeCount || 0).toLocaleString()],
            ['Đánh giá', `${g.rating || 0}/10 (${g.ratingCount || 0})`],
            ['Ngày tạo', fmtDate(g.createdAt)],
            ['Cập nhật', fmtDate(g.updatedAt)],
          ];
          return (
            <>
              <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2.5 }}>
                Chi tiết bài viết
                <IconButton size="small" onClick={() => setDetailDialog({ open: false, genre: null })}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ px: 2.5, py: 0 }}>
                {rows.map(([label, value], i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: i < rows.length - 1 ? `1px dashed ${colors.borderSubtle}` : 'none' }}>
                    <Typography sx={{ fontSize: '0.82rem', color: colors.textMuted, flexShrink: 0 }}>{label}</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: colors.textPrimary, textAlign: 'right', ml: 2, wordBreak: 'break-word' }}>{value}</Typography>
                  </Box>
                ))}
                {g.description && (
                  <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${colors.borderSubtle}` }}>
                    <Typography sx={{ fontSize: '0.78rem', color: colors.textMuted, mb: 0.5 }}>Mô tả</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: colors.textSecondary, lineHeight: 1.5 }}>{g.description}</Typography>
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 2.5, py: 1.5 }}>
                <Button
                  variant="outlined" size="small"
                  onClick={() => setDetailDialog({ open: false, genre: null })}
                  sx={{ textTransform: 'none', borderRadius: 1.5, color: colors.textSecondary, borderColor: colors.borderSubtle, fontSize: '0.82rem' }}
                >
                  Đóng
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* === DELETE CONFIRM === */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, genre: null })}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary }}>Xác nhận xoá</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: colors.textSecondary }}>
            Bạn có chắc muốn xoá bài viết "<strong>{deleteDialog.genre?.name}</strong>"? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined" size="small"
            onClick={() => setDeleteDialog({ open: false, genre: null })}
            sx={{ textTransform: 'none', borderRadius: 1.5, color: colors.textSecondary, borderColor: colors.borderSubtle }}
          >
            Huỷ
          </Button>
          <Button
            variant="contained" size="small"
            onClick={handleDelete}
            sx={{ textTransform: 'none', borderRadius: 1.5, bgcolor: '#f44336', color: '#fff', '&:hover': { bgcolor: '#d32f2f' } }}
          >
            Xoá Bỏ
          </Button>
        </DialogActions>
      </Dialog>

      {/* === STILLS GALLERY === */}
      <Dialog
        open={stillsDialog.open}
        onClose={() => setStillsDialog({ open: false, images: [], name: '' })}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2 }}>
          Hình trong phim
          <IconButton size="small" onClick={() => setStillsDialog({ open: false, images: [], name: '' })}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {stillsDialog.images.map((img, i) => (
              <Box
                key={i}
                component="img"
                src={typeof img === 'string' ? img : img.url || img.imageUrl}
                alt={`${i + 1}`}
                sx={{ width: '100%', objectFit: 'cover', borderRadius: 1 }}
              />
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* === ACTORS GALLERY === */}
      <Dialog
        open={actorsDialog.open}
        onClose={() => setActorsDialog({ open: false, actors: [] })}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2 }}>
          Hình diễn viên
          <IconButton size="small" onClick={() => setActorsDialog({ open: false, actors: [] })}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {actorsDialog.actors.filter(a => a.photoUrl).map((a, i) => (
              <Box key={i}>
                <Box component="img" src={a.photoUrl} alt={a.name} sx={{ width: '100%', objectFit: 'cover', borderRadius: 1 }} />
                <Typography sx={{ fontSize: '0.82rem', color: colors.textPrimary, mt: 0.5, textAlign: 'center' }}>{a.name}</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* === ADD MODAL === */}
      <AddGenreModal open={openAddModal} onClose={() => setOpenAddModal(false)} onSuccess={fetchGenres} />

      {/* === EDIT MODAL === */}
      <EditGenreModal open={!!editGenre} onClose={() => setEditGenre(null)} onSuccess={fetchGenres} genre={editGenre} />
    </Box>
  );
};

export default AdminGenreCinemaPage;
