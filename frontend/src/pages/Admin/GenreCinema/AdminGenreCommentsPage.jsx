import { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, MenuItem, IconButton, Tooltip, Chip,
  Avatar, Rating, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Pagination, LinearProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  Close as CloseIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getAllGenresAPI } from '../../../apis/genreApi';
import { getReviewsByGenreAPI, deleteReviewAPI, getGenreRepliesAPI, getGenreReviewSummaryAPI } from '../../../apis/reviewApi';
import { adminChatBanAPI } from '../../../apis/adminReportApi';

// Reaction emoji map
const REACTION_ICONS = {
  LIKE: '👍', LOVE: '❤️', HAHA: '😂', WOW: '😮', SAD: '😢', ANGRY: '😡'
};

const AdminGenreCommentsPage = () => {
  const { colors } = useAdminTheme();

  // State
  const [genres, setGenres] = useState([]);
  const [selectedGenreId, setSelectedGenreId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [summary, setSummary] = useState(null);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, review: null });
  // Replies dialog
  const [repliesDialog, setRepliesDialog] = useState({ open: false, review: null, replies: [], loading: false });
  // Reactions dialog
  const [reactionsDialog, setReactionsDialog] = useState({ open: false, reactions: [], replies: [], loading: false });
  // Ban dialog
  const [banDialog, setBanDialog] = useState({ open: false, user: null, banMinutes: 60, reason: '' });

  // Ban duration presets
  const BAN_PRESETS = [
    { label: '30 phút', value: 30 },
    { label: '1 giờ', value: 60 },
    { label: '6 giờ', value: 360 },
    { label: '24 giờ', value: 1440 },
    { label: '7 ngày', value: 10080 },
    { label: '30 ngày', value: 43200 }
  ];

  // Card style
  const cardSx = {
    bgcolor: colors.bgCard, borderRadius: 1.5,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: `1px solid ${colors.borderSubtle}`
  };

  // Fetch genres list
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const res = await getAllGenresAPI({ isActive: 'all' });
        const list = res.data?.genres || res.genres || res.data || [];
        setGenres(list);
        if (list.length > 0) setSelectedGenreId(list[0]._id);
      } catch (err) {
        console.error(err);
        toast.error('Không tải được danh sách thể loại');
      } finally {
        setLoadingGenres(false);
      }
    };
    fetchGenres();
  }, []);

  // Fetch reviews when genre or page changes
  const fetchReviews = useCallback(async (genreId, pageNum = 1) => {
    if (!genreId) return;
    setLoading(true);
    try {
      const res = await getReviewsByGenreAPI(genreId, { page: pageNum, limit: 15, sort: 'newest' });
      if (res.status === 'success') {
        setReviews(res.data.reviews || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalReviews(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch summary + reset page when genre changes
  useEffect(() => {
    if (selectedGenreId) {
      setPage(1);
      getGenreReviewSummaryAPI(selectedGenreId).then(res => {
        if (res.status === 'success') setSummary(res.data);
      }).catch(() => setSummary(null));
    }
  }, [selectedGenreId]);

  // Fetch reviews when genre or page changes
  useEffect(() => {
    if (selectedGenreId) fetchReviews(selectedGenreId, page);
  }, [selectedGenreId, page, fetchReviews]);

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    fetchReviews(selectedGenreId, newPage);
  };

  // Delete review
  const handleDelete = async () => {
    const review = deleteDialog.review;
    if (!review) return;
    try {
      await deleteReviewAPI(selectedGenreId, review._id);
      toast.success('Đã xóa bình luận');
      setDeleteDialog({ open: false, review: null });
      fetchReviews(selectedGenreId, page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  // Ban user chat
  const handleBanUser = async () => {
    const { user, banMinutes, reason } = banDialog;
    if (!user?._id) return;
    try {
      const res = await adminChatBanAPI(user._id, { banMinutes, reason });
      toast.success(res.message);
      setBanDialog({ open: false, user: null, banMinutes: 60, reason: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  // Open reactions dialog + fetch replies for cross-reference
  const handleViewReactions = async (review) => {
    setReactionsDialog({ open: true, reactions: review.reactions || [], replies: [], loading: true });
    try {
      const res = await getGenreRepliesAPI(selectedGenreId, review._id);
      if (res.status === 'success') {
        setReactionsDialog(p => ({ ...p, replies: res.data.replies || [], loading: false }));
      }
    } catch {
      setReactionsDialog(p => ({ ...p, loading: false }));
    }
  };

  // Load replies
  const handleViewReplies = async (review) => {
    setRepliesDialog({ open: true, review, replies: [], loading: true });
    try {
      const res = await getGenreRepliesAPI(selectedGenreId, review._id);
      if (res.status === 'success') {
        setRepliesDialog(p => ({ ...p, replies: res.data.replies || [], loading: false }));
      }
    } catch {
      setRepliesDialog(p => ({ ...p, loading: false }));
    }
  };

  // Format date
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const selectedGenre = genres.find(g => g._id === selectedGenreId);

  // Get reaction breakdown { LIKE: 2, LOVE: 1, ... }
  const getReactionBreakdown = (reactions) => {
    if (!reactions?.length) return {};
    const counts = {};
    reactions.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
    return counts;
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: colors.bgMain }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: colors.textPrimary }}>
            Bình luận thể loại phim
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: colors.textMuted, mt: 0.3 }}>
            Quản lý bình luận & đánh giá theo từng bài viết thể loại
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Làm mới">
            <IconButton onClick={() => fetchReviews(selectedGenreId, page)}
              sx={{ bgcolor: colors.bgSubtle, '&:hover': { bgcolor: colors.bgHover } }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Genre Selector */}
      <Card sx={{ ...cardSx, mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.textMuted, whiteSpace: 'nowrap' }}>
              Chọn bài viết:
            </Typography>
            <TextField
              select size="small" fullWidth
              value={selectedGenreId}
              onChange={(e) => setSelectedGenreId(e.target.value)}
              disabled={loadingGenres}
              sx={{
                maxWidth: 400,
                '& .MuiOutlinedInput-root': {
                  bgcolor: colors.bgSubtle, fontSize: '0.85rem',
                  '& fieldset': { borderColor: colors.borderSubtle },
                  '&:hover fieldset': { borderColor: colors.borderSubtle },
                  '&.Mui-focused fieldset': { borderColor: colors.borderSubtle, borderWidth: 1 }
                }
              }}
            >
              {genres.map((g) => (
                <MenuItem key={g._id} value={g._id}>{g.name}</MenuItem>
              ))}
            </TextField>
            {selectedGenre && (
              <Chip
                label={`${totalReviews} bình luận`}
                size="small"
                icon={<CommentIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: '0.75rem', bgcolor: 'rgba(25,118,210,0.1)', color: '#1976d2' }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Rating Summary */}
      {summary && summary.total > 0 && (
        <Card sx={{ ...cardSx, mb: 2 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {/* Average */}
              <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: colors.textPrimary }}>
                  {summary.avgRating}<Typography component="span" sx={{ fontSize: '1rem', fontWeight: 400, color: colors.textMuted }}>/5</Typography>
                </Typography>
                <Rating value={summary.avgRating} precision={0.1} readOnly size="small" sx={{ mt: 0.3 }} />
                <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted }}>{summary.total} đánh giá</Typography>
              </Box>
              {/* Distribution bars */}
              <Box sx={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = summary.distribution?.[star] || 0;
                  const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
                  return (
                    <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                      <Typography sx={{ fontSize: '0.72rem', minWidth: 36, color: colors.textMuted }}>{star} sao</Typography>
                      <LinearProgress
                        variant="determinate" value={pct}
                        sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: colors.bgSubtle, '& .MuiLinearProgress-bar': { bgcolor: '#ff9800', borderRadius: 3 } }}
                      />
                      <Typography sx={{ fontSize: '0.72rem', minWidth: 28, textAlign: 'right', color: colors.textMuted }}>{pct}%</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Reviews Table */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : reviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CommentIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1 }} />
              <Typography sx={{ color: colors.textMuted, fontSize: '0.9rem' }}>
                {selectedGenreId ? 'Chưa có bình luận nào' : 'Vui lòng chọn bài viết'}
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small" sx={{
                  '& .MuiTableCell-root': { borderColor: colors.borderSubtle, fontSize: '0.8rem', py: 1.5, px: 1.5 }
                }}>
                  <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 700, color: colors.textMuted, bgcolor: colors.bgSubtle } }}>
                      <TableCell width={40} align="center">#</TableCell>
                      <TableCell>Người dùng</TableCell>
                      <TableCell align="center" width={100}>Đánh giá</TableCell>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell width={300}>Nội dung</TableCell>
                      <TableCell align="center" width={70}>Spoiler</TableCell>
                      <TableCell align="center" width={80}>Reactions</TableCell>
                      <TableCell align="center" width={130}>Ngày tạo</TableCell>
                      <TableCell align="center" width={100}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reviews.map((r, idx) => (
                      <TableRow key={r._id} hover sx={{ '&:hover': { bgcolor: colors.bgHover } }}>
                        <TableCell align="center">{(page - 1) * 15 + idx + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={r.user?.avatar} sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                              {r.user?.name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.user?.name || 'Ẩn danh'}</Typography>
                              {r.isVerified && (
                                <Chip label="Đã xác thực" size="small"
                                  sx={{ fontSize: '0.6rem', height: 16, bgcolor: 'rgba(76,175,80,0.1)', color: '#4caf50' }} />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {r.rating ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                              <StarIcon sx={{ fontSize: 14, color: '#ff9800' }} />
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{r.rating}</Typography>
                            </Box>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: r.title ? 600 : 400, color: r.title ? colors.textPrimary : colors.textMuted }}>
                            {r.title || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{
                            fontSize: '0.78rem', whiteSpace: 'normal',
                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                          }}>
                            {r.content}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {r.hasSpoiler ? (
                            <Chip label="Spoiler" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }} />
                          ) : '—'}
                        </TableCell>
                        <TableCell align="center">
                          {(r.reactions?.length || r.likesCount) ? (
                            <Tooltip title="Nhấn để xem chi tiết">
                              <Box
                                onClick={() => handleViewReactions(r)}
                                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3, '&:hover': { opacity: 0.7 } }}
                              >
                                {(() => {
                                  const breakdown = getReactionBreakdown(r.reactions);
                                  const entries = Object.entries(breakdown);
                                  if (entries.length === 0) return <Typography sx={{ fontSize: '0.8rem' }}>{r.likesCount || 0}</Typography>;
                                  return entries.map(([type, count]) => (
                                    <Typography key={type} sx={{ fontSize: '0.75rem' }}>
                                      {REACTION_ICONS[type]}{count}
                                    </Typography>
                                  ));
                                })()}
                              </Box>
                            </Tooltip>
                          ) : (
                            <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted }}>0</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.75rem' }}>
                          {fmtDate(r.createdAt)}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="Xem phản hồi">
                            <IconButton size="small" onClick={() => handleViewReplies(r)} sx={{ color: '#1976d2', mr: 0.3 }}>
                              <VisibilityIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cấm chat">
                            <IconButton size="small" onClick={() => setBanDialog({ open: true, user: r.user, banMinutes: 60, reason: '' })} sx={{ color: '#ff9800', mr: 0.3 }}>
                              <BlockIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton size="small" onClick={() => setDeleteDialog({ open: true, review: r })} sx={{ color: '#f44336' }}>
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <Pagination count={totalPages} page={page} onChange={handlePageChange}
                    size="small" color="primary" />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* === DELETE DIALOG === */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, review: null })}
        PaperProps={{ sx: { borderRadius: 2, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: colors.textPrimary }}>
          Xác nhận xóa bình luận
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.85rem', color: colors.textMuted }}>
            Bạn có chắc muốn xóa bình luận của <strong>{deleteDialog.review?.user?.name}</strong>?
          </Typography>
          {deleteDialog.review?.content && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: colors.bgSubtle, borderRadius: 1, fontSize: '0.8rem', fontStyle: 'italic' }}>
              "{deleteDialog.review.content.slice(0, 150)}{deleteDialog.review.content.length > 150 ? '...' : ''}"
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button size="small" onClick={() => setDeleteDialog({ open: false, review: null })}
            sx={{ textTransform: 'none', color: colors.textMuted }}>Huỷ</Button>
          <Button variant="contained" size="small" onClick={handleDelete}
            sx={{ textTransform: 'none', bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}>Xóa</Button>
        </DialogActions>
      </Dialog>

      {/* === REPLIES DIALOG === */}
      <Dialog open={repliesDialog.open} onClose={() => setRepliesDialog({ open: false, review: null, replies: [], loading: false })}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 2, bgcolor: colors.bgCard, maxHeight: '80vh' } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Phản hồi bình luận
          <IconButton size="small" onClick={() => setRepliesDialog({ open: false, review: null, replies: [], loading: false })}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 2.5 }}>
          {/* Original comment */}
          {repliesDialog.review && (
            <Box sx={{ p: 1.5, bgcolor: colors.bgSubtle, borderRadius: 1, mb: 2, borderLeft: '3px solid #1976d2' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Avatar src={repliesDialog.review.user?.avatar} sx={{ width: 24, height: 24, fontSize: '0.65rem' }}>
                  {repliesDialog.review.user?.name?.[0]}
                </Avatar>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{repliesDialog.review.user?.name}</Typography>
                {repliesDialog.review.rating && (
                  <Rating value={repliesDialog.review.rating} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#ff9800' } }} />
                )}
              </Box>
              {repliesDialog.review.title && (
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, mb: 0.3 }}>{repliesDialog.review.title}</Typography>
              )}
              <Typography sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{repliesDialog.review.content}</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: colors.textMuted, mt: 0.5 }}>{fmtDate(repliesDialog.review.createdAt)}</Typography>
            </Box>
          )}

          {/* Replies */}
          {repliesDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
          ) : repliesDialog.replies.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: colors.textMuted, fontSize: '0.85rem', py: 2 }}>
              Chưa có phản hồi nào
            </Typography>
          ) : (
            repliesDialog.replies.map((reply) => (
              <Box key={reply._id} sx={{ display: 'flex', gap: 1, mb: 1.5, pl: 2 }}>
                <Avatar src={reply.user?.avatar} sx={{ width: 24, height: 24, fontSize: '0.65rem', mt: 0.3 }}>
                  {reply.user?.name?.[0]}
                </Avatar>
                <Box sx={{ flex: 1, p: 1, bgcolor: colors.bgSubtle, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{reply.user?.name}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: colors.textMuted }}>{fmtDate(reply.createdAt)}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', mt: 0.3, whiteSpace: 'pre-wrap' }}>{reply.content}</Typography>
                </Box>
              </Box>
            ))
          )}
        </DialogContent>
      </Dialog>

      {/* === REACTIONS DIALOG === */}
      <Dialog open={reactionsDialog.open} onClose={() => setReactionsDialog({ open: false, reactions: [], replies: [], loading: false })}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 2, bgcolor: colors.bgCard, maxHeight: '80vh' } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: colors.textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
          Chi tiết Reactions ({reactionsDialog.reactions.length})
          <IconButton size="small" onClick={() => setReactionsDialog({ open: false, reactions: [], replies: [], loading: false })}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 2.5, py: 0 }}>
          {/* === REACTIONS SECTION === */}
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
            Biểu cảm ({reactionsDialog.reactions.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            {Object.entries(getReactionBreakdown(reactionsDialog.reactions)).map(([type, count]) => (
              <Chip
                key={type}
                label={`${REACTION_ICONS[type]} ${type} (${count})`}
                size="small"
                sx={{ fontSize: '0.78rem', bgcolor: colors.bgSubtle }}
              />
            ))}
          </Box>
          {reactionsDialog.reactions.map((reaction, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.6, borderBottom: `1px solid ${colors.borderSubtle}` }}>
              <Typography sx={{ fontSize: '1rem' }}>{REACTION_ICONS[reaction.type]}</Typography>
              <Avatar src={reaction.user?.avatar} sx={{ width: 22, height: 22, fontSize: '0.6rem' }}>
                {reaction.user?.name?.[0]}
              </Avatar>
              <Typography sx={{ fontSize: '0.8rem', flex: 1, fontWeight: 500 }}>
                {reaction.user?.name || 'Ẩn danh'}
              </Typography>
              <Chip label={reaction.type} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
            </Box>
          ))}
          {reactionsDialog.reactions.length === 0 && (
            <Typography sx={{ color: colors.textMuted, fontSize: '0.8rem', py: 1 }}>Chưa có reaction</Typography>
          )}

          {/* === REPLIES / CONVERSATION SECTION === */}
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: colors.textPrimary, mt: 2.5, mb: 1 }}>
            Cuộc trò chuyện ({reactionsDialog.replies.length})
          </Typography>
          {reactionsDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={22} /></Box>
          ) : reactionsDialog.replies.length === 0 ? (
            <Typography sx={{ color: colors.textMuted, fontSize: '0.8rem', py: 1 }}>Chưa có phản hồi nào</Typography>
          ) : (
            reactionsDialog.replies.map((reply) => {
              // Check if this replier also reacted
              const rpUserId = typeof reply.user === 'string' ? reply.user : reply.user?._id;
              const userReaction = reactionsDialog.reactions.find(rc => {
                const rcUserId = typeof rc.user === 'string' ? rc.user : rc.user?._id;
                return rcUserId === rpUserId;
              });
              return (
                <Box key={reply._id} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <Avatar src={reply.user?.avatar} sx={{ width: 26, height: 26, fontSize: '0.65rem', mt: 0.3 }}>
                    {reply.user?.name?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, p: 1, bgcolor: colors.bgSubtle, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{reply.user?.name}</Typography>
                      {userReaction && (
                        <Typography sx={{ fontSize: '0.85rem' }} title={userReaction.type}>
                          {REACTION_ICONS[userReaction.type]}
                        </Typography>
                      )}
                      <Typography sx={{ fontSize: '0.65rem', color: colors.textMuted, ml: 'auto' }}>{fmtDate(reply.createdAt)}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.78rem', mt: 0.3, whiteSpace: 'pre-wrap' }}>{reply.content}</Typography>
                  </Box>
                  <Tooltip title="Cấm chat">
                    <IconButton size="small" onClick={() => setBanDialog({ open: true, user: reply.user, banMinutes: 60, reason: '' })} sx={{ color: '#ff9800', mt: 0.3 }}>
                      <BlockIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              );
            })
          )}
        </DialogContent>
      </Dialog>

      {/* === BAN DIALOG === */}
      <Dialog open={banDialog.open} onClose={() => setBanDialog({ open: false, user: null, banMinutes: 60, reason: '' })}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 2, bgcolor: colors.bgCard } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: colors.textPrimary }}>
          Cấm chat người dùng
        </DialogTitle>
        <DialogContent>
          {banDialog.user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: colors.bgSubtle, borderRadius: 1 }}>
              <Avatar src={banDialog.user.avatar} sx={{ width: 32, height: 32 }}>
                {banDialog.user.name?.[0]}
              </Avatar>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{banDialog.user.name}</Typography>
            </Box>
          )}
          <TextField
            select fullWidth size="small" label="Thời gian cấm"
            value={banDialog.banMinutes}
            onChange={(e) => setBanDialog(p => ({ ...p, banMinutes: Number(e.target.value) }))}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
          >
            {BAN_PRESETS.map(p => (
              <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth size="small" label="Lý do (tùy chọn)"
            multiline rows={2}
            value={banDialog.reason}
            onChange={(e) => setBanDialog(p => ({ ...p, reason: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.85rem' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button size="small" onClick={() => setBanDialog({ open: false, user: null, banMinutes: 60, reason: '' })}
            sx={{ textTransform: 'none', color: colors.textMuted }}>Hủy</Button>
          <Button variant="contained" size="small" onClick={handleBanUser}
            sx={{ textTransform: 'none', bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}>Cấm chat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminGenreCommentsPage;
