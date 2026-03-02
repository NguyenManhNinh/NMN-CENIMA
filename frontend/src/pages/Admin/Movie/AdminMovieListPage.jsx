import { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress,
  TextField, MenuItem, InputAdornment, IconButton, Tooltip, Button, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InboxIcon from '@mui/icons-material/Inbox';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getAllMoviesAPI, getYoutubeInfoAPI, deleteMovieAPI } from '../../../apis/movieApi';
import AddMovieModal from './AddMovieModal';
import EditMovieModal from './EditMovieModal';

// Cấu hình phân trang
const PER_PAGE = 10;

// Map trạng thái phim
const STATUS_MAP = {
  NOW: { label: 'Đang chiếu', color: '#4caf50', bg: '#e8f5e9' },
  COMING: { label: 'Sắp chiếu', color: '#1565c0', bg: '#e3f2fd' },
  STOP: { label: 'Ngưng chiếu', color: '#9e9e9e', bg: '#f5f5f5' }
};

// Map phân loại tuổi
const AGE_RATING_MAP = {
  P: { label: 'P', color: '#fff', bg: '#4caf50' },
  C13: { label: 'C13', color: '#fff', bg: '#2196f3' },
  C16: { label: 'C16', color: '#fff', bg: '#ff9800' },
  C18: { label: 'C18', color: '#fff', bg: '#f44336' }
};

// Định dạng ngày tháng
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Trích YouTube video ID từ URL
const getYoutubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
};

// Card style chung
const getCardSx = (colors, darkMode) => ({
  borderRadius: 2,
  boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

const AdminMovieListPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const cardSx = getCardSx(colors, darkMode);

  // State
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalMovies, setTotalMovies] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [ytInfoMap, setYtInfoMap] = useState({}); // { videoId: { title, channel } }
  const [openAddModal, setOpenAddModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, movie: null });
  const [deleting, setDeleting] = useState(false);
  const [editMovie, setEditMovie] = useState(null);

  // Fetch movies
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PER_PAGE };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await getAllMoviesAPI(params);
      setMovies(res.data?.movies || []);
      setTotalMovies(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Lỗi khi tải danh sách phim:', err);
      setMovies([]);
      setTotalMovies(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  // Lấy thông tin YouTube (title, channel, avatar kênh) qua backend proxy
  useEffect(() => {
    if (movies.length === 0) return;
    movies.forEach((movie) => {
      const ytId = getYoutubeId(movie.trailerUrl);
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
  }, [movies]);

  // Tìm kiếm khi nhấn Enter
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = searchInput.trim();
      setSearchQuery(trimmed);
      setSearchInput('');
      setPage(1);
    }
  };

  // Đổi filter status
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* === HEADER === */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản lý phim
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Tổng cộng {totalMovies} phim trong hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddModal(true)}
          sx={{
            bgcolor: '#1B4F93',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            '&:hover': { bgcolor: '#163f78' }
          }}
        >
          Thêm phim
        </Button>
      </Box>

      {/* === BỘ LỌC === */}
      <Card sx={{ ...cardSx, mb: 2.5 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Tìm kiếm */}
            <TextField
              size="small"
              placeholder="Tìm theo tên phim..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: colors.textMuted }} />
                  </InputAdornment>
                )
              }}
              sx={{
                flex: 1, minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  bgcolor: colors.bgInput,
                  color: colors.textPrimary,
                  '& fieldset': { borderColor: colors.borderSubtle },
                  '&:hover fieldset': { borderColor: colors.borderSubtle },
                  '&.Mui-focused fieldset': { borderColor: colors.borderSubtle, borderWidth: 1 }
                }
              }}
            />

            {/* Lọc trạng thái */}
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={handleStatusChange}
              label="Trạng thái"
              sx={{
                minWidth: 160,
                '& .MuiOutlinedInput-root': {
                  bgcolor: colors.bgInput,
                  color: colors.textPrimary,
                  '& fieldset': { borderColor: colors.borderSubtle },
                  '&:hover fieldset': { borderColor: colors.borderSubtle },
                  '&.Mui-focused fieldset': { borderColor: colors.borderSubtle, borderWidth: 1 }
                },
                '& .MuiInputLabel-root': { color: colors.textMuted },
                '& .MuiInputLabel-root.Mui-focused': { color: colors.textMuted }
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="NOW">Đang chiếu</MenuItem>
              <MenuItem value="COMING">Sắp chiếu</MenuItem>
              <MenuItem value="STOP">Ngưng chiếu</MenuItem>
            </TextField>

            {/* Refresh */}
            <Tooltip title="Làm mới">
              <IconButton onClick={() => { setSearchQuery(''); setSearchInput(''); setStatusFilter(''); setPage(1); }} sx={{ color: colors.textMuted }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* === BẢNG DANH SÁCH === */}
      <Card sx={cardSx}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={40} sx={{ color: colors.textMuted }} />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1300, '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1, verticalAlign: 'middle' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.bgTableHead, '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 40 }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 50 }}>Poster</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', minWidth: 220 }}>Tên phim</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 200 }}>Trailer</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', minWidth: 150 }}>Thể loại</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', minWidth: 90 }}>Đạo diễn</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', minWidth: 120 }}>Diễn viên</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', minWidth: 100 }}>Nhà sản xuất</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 65 }}>Thời lượng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 50 }}>Tuổi</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 85 }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 85 }}>Ngày chiếu</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 60 }}>Quốc gia</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 55 }}>Đánh giá</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 95 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movies.length > 0 ? movies.map((movie, idx) => {
                    const stt = (page - 1) * PER_PAGE + idx + 1;
                    const status = STATUS_MAP[movie.status] || STATUS_MAP.COMING;
                    const age = AGE_RATING_MAP[movie.ageRating] || AGE_RATING_MAP.P;
                    const genres = movie.genres?.length > 0
                      ? [...new Set(movie.genres.flatMap(g => g.category || []))].join(', ') || '—'
                      : '—';
                    // Giới hạn tối đa 2 dòng, dòng thừa hiện "..."
                    const clamp2 = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 };
                    return (
                      <TableRow key={movie._id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                        {/* STT */}
                        <TableCell sx={{ fontSize: '0.8rem', fontWeight: 500, color: colors.textMuted }}>{stt}</TableCell>

                        {/* Poster */}
                        <TableCell>
                          <Box
                            component="img"
                            src={movie.posterUrl}
                            alt={movie.title}
                            sx={{ width: 36, height: 50, borderRadius: 0.5, objectFit: 'cover', display: 'block' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </TableCell>

                        {/* Tên phim */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: colors.textPrimary, ...clamp2 }}>
                            {movie.title}
                          </Typography>
                        </TableCell>

                        {/* Trailer */}
                        <TableCell>
                          {(() => {
                            const ytId = getYoutubeId(movie.trailerUrl);
                            const ytInfo = ytId ? ytInfoMap[ytId] : null;
                            return ytId ? (
                              <Box
                                component="a"
                                href={movie.trailerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ display: 'block', position: 'relative', width: 190, aspectRatio: '16/9', overflow: 'hidden', borderRadius: '8px', textDecoration: 'none', '&:hover': { opacity: 0.92 } }}
                              >
                                {/* Thumbnail */}
                                <Box
                                  component="img"
                                  src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                  alt="Trailer"
                                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                                {/* Overlay trên: avatar kênh + title YouTube + 3 chấm */}
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
                                {/* Nút play đỏ YouTube ở giữa dưới */}
                                <Box sx={{ position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)', width: 40, height: 28, bgcolor: 'rgba(255,0,0,0.9)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Box sx={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #fff', ml: '2px' }} />
                                </Box>
                              </Box>
                            ) : (
                              <Typography variant="caption" sx={{ color: colors.textMuted }}>—</Typography>
                            );
                          })()}
                        </TableCell>

                        {/* Thể loại */}
                        <TableCell>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.73rem', ...clamp2 }}>
                            {genres}
                          </Typography>
                        </TableCell>

                        {/* Đạo diễn */}
                        <TableCell>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {movie.director || '—'}
                          </Typography>
                        </TableCell>

                        {/* Diễn viên */}
                        <TableCell>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {movie.actors?.length > 0 ? movie.actors.join(', ') : '—'}
                          </Typography>
                        </TableCell>

                        {/* Nhà sản xuất */}
                        <TableCell>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.73rem', whiteSpace: 'nowrap' }}>
                            {movie.studio || '—'}
                          </Typography>
                        </TableCell>

                        {/* Thời lượng */}
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{movie.duration} phút</Typography>
                        </TableCell>

                        {/* Phân loại tuổi */}
                        <TableCell align="center">
                          <Chip
                            label={age.label}
                            size="small"
                            sx={{
                              height: 22, fontSize: '0.68rem', fontWeight: 700,
                              bgcolor: age.bg, color: age.color,
                              '& .MuiChip-label': { px: 0.8 }
                            }}
                          />
                        </TableCell>

                        {/* Trạng thái */}
                        <TableCell align="center">
                          <Chip
                            label={status.label}
                            size="small"
                            sx={{
                              height: 22, fontSize: '0.68rem', fontWeight: 600,
                              bgcolor: darkMode ? 'transparent' : status.bg,
                              color: status.color,
                              border: darkMode ? `1px solid ${status.color}` : 'none',
                              '& .MuiChip-label': { px: 0.8 }
                            }}
                          />
                        </TableCell>

                        {/* Ngày chiếu */}
                        <TableCell align="center">
                          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>{formatDate(movie.releaseDate)}</Typography>
                        </TableCell>

                        {/* Quốc gia */}
                        <TableCell align="center">
                          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>{movie.country || '—'}</Typography>
                        </TableCell>

                        {/* Đánh giá */}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: movie.rating >= 7 ? '#4caf50' : movie.rating >= 5 ? '#ff9800' : colors.textMuted }}>
                              {movie.rating > 0 ? movie.rating.toFixed(1) : '—'}
                            </Typography>
                            {movie.ratingCount > 0 && (
                              <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.65rem' }}>
                                ({movie.ratingCount})
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {/* Thao tác */}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.3 }}>
                            <Tooltip title="Xem trang đặt vé">
                              <IconButton size="small" sx={{ color: '#1565c0' }}
                                onClick={() => window.open(`/dat-ve/${movie.slug}`, '_blank')}
                              >
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sửa">
                              <IconButton size="small" sx={{ color: '#ff9800' }}
                                onClick={() => setEditMovie(movie)}
                              >
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton size="small" sx={{ color: '#f44336' }}
                                onClick={() => setDeleteDialog({ open: true, movie })}
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={15} align="center" sx={{ py: 6 }}>
                        <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1, display: 'block', mx: 'auto' }} />
                        <Typography variant="body2" sx={{ color: colors.textMuted }}>
                          Chưa có phim nào trong hệ thống
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* === PHÂN TRANG === */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, p: 2 }}>
                <Box
                  onClick={() => page > 1 && setPage(1)}
                  sx={{
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: page === 1 ? 'default' : 'pointer',
                    color: page === 1 ? colors.textDisabled : colors.textSecondary,
                    fontSize: '14px', borderRadius: 1, '&:hover': page > 1 ? { bgcolor: colors.bgSubtle } : {}
                  }}
                >«</Box>
                <Box
                  onClick={() => page > 1 && setPage(page - 1)}
                  sx={{
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: page === 1 ? 'default' : 'pointer',
                    color: page === 1 ? colors.textDisabled : colors.textSecondary,
                    fontSize: '14px', borderRadius: 1, '&:hover': page > 1 ? { bgcolor: colors.bgSubtle } : {}
                  }}
                >‹</Box>
                {[...Array(totalPages)].map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <Box
                      key={p}
                      onClick={() => setPage(p)}
                      sx={{
                        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', borderRadius: 1, fontSize: '14px',
                        bgcolor: page === p ? '#1B4F93' : 'transparent',
                        color: page === p ? '#fff' : colors.textSecondary,
                        fontWeight: page === p ? 600 : 400,
                        '&:hover': { bgcolor: page === p ? '#1B4F93' : colors.bgSubtle }
                      }}
                    >{p}</Box>
                  );
                })}
                <Box
                  onClick={() => page < totalPages && setPage(page + 1)}
                  sx={{
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: page === totalPages ? 'default' : 'pointer',
                    color: page === totalPages ? colors.textDisabled : colors.textSecondary,
                    fontSize: '14px', borderRadius: 1, '&:hover': page < totalPages ? { bgcolor: colors.bgSubtle } : {}
                  }}
                >›</Box>
                <Box
                  onClick={() => page < totalPages && setPage(totalPages)}
                  sx={{
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: page === totalPages ? 'default' : 'pointer',
                    color: page === totalPages ? colors.textDisabled : colors.textSecondary,
                    fontSize: '14px', borderRadius: 1, '&:hover': page < totalPages ? { bgcolor: colors.bgSubtle } : {}
                  }}
                >»</Box>
              </Box>
            )}

            {/* Thông tin phân trang */}
            <Box sx={{ px: 2.5, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: colors.textMuted }}>
                Hiển thị {movies.length > 0 ? (page - 1) * PER_PAGE + 1 : 0}–{Math.min(page * PER_PAGE, totalMovies)} / {totalMovies} phim
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textMuted }}>
                Trang {page}/{totalPages}
              </Typography>
            </Box>
          </>
        )}
      </Card>

      {/* Modal thêm phim */}
      <AddMovieModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSuccess={fetchMovies}
      />

      {/* Dialog xác nhận xóa phim */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleting && setDeleteDialog({ open: false, movie: null })}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 400, bgcolor: colors.bgCard }
        }}
      >
        <DialogTitle sx={{ color: colors.textPrimary, fontWeight: 600 }}>
          Xác nhận xóa phim
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.textSecondary }}>
            Bạn có chắc chắn muốn xóa phim <strong>{deleteDialog.movie?.title}</strong> không?
          </Typography>
          <Typography variant="caption" sx={{ color: '#f44336', mt: 1, display: 'block' }}>
            Lưu ý: Hành động này không thể hoàn tác!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, movie: null })}
            disabled={deleting}
            sx={{ color: colors.textSecondary, textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              try {
                await deleteMovieAPI(deleteDialog.movie._id);
                setDeleteDialog({ open: false, movie: null });
                fetchMovies();
              } catch (err) {
                alert(err.response?.data?.message || 'Xóa phim thất bại!');
              } finally {
                setDeleting(false);
              }
            }}
            sx={{
              bgcolor: '#f44336', textTransform: 'none', fontWeight: 600,
              '&:hover': { bgcolor: '#d32f2f' }
            }}
          >
            {deleting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Xóa phim'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal sửa phim */}
      <EditMovieModal
        open={!!editMovie}
        onClose={() => setEditMovie(null)}
        onSuccess={fetchMovies}
        movie={editMovie}
      />
    </Box>
  );
};

export default AdminMovieListPage;
