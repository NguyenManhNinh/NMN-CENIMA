import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Rating,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Skeleton,
  Collapse,
  Divider,
  LinearProgress,
  Tooltip,
  Menu,
  CircularProgress
} from '@mui/material';
import {
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Reply as ReplyIcon,
  MoreVert as MoreVertIcon,
  Verified as VerifiedIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  Flag as FlagIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  getReviewsByMovieAPI,
  getReviewSummaryAPI,
  createReviewAPI,
  likeReviewAPI
} from '../../apis/reviewApi';

// Color palette matching the site
const COLORS = {
  primary: '#1976D2',
  primaryLight: '#42A5F5',
  orange: '#F5A623',
  white: '#FFFFFF',
  border: '#E9EDF3',
  text: '#333333',
  textMuted: '#666666',
  bgLight: '#F8F9FA',
  success: '#4CAF50',
  error: '#F44336'
};

// Rating text mapping
const RATING_TEXT = {
  5: 'Tuyệt vời',
  4: 'Rất ốn',
  3: 'Ốn',
  2: 'Chưa đã',
  1: 'Thất vọng'
};

// Section header style matching other sections
const sectionTitleStyle = {
  fontWeight: 700,
  fontSize: '18px',
  color: COLORS.primary,
  mb: 2,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  textTransform: 'uppercase',
  '&::before': {
    content: '""',
    width: 4,
    height: 20,
    bgcolor: COLORS.primary,
    borderRadius: 1
  }
};

// Card style
const cardStyle = {
  p: 2.5,
  bgcolor: COLORS.white,
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
};

// Input style - no focus outline
const inputStyle = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: COLORS.border,
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.border,
      borderWidth: '1px',
    },
  },
};

/**
 * CommentSection - Main component for movie reviews
 * @param {string} movieId - ID của phim
 * @param {object} user - User hiện tại (null nếu chưa đăng nhập)
 */
function CommentSection({ movieId, user }) {
  const navigate = useNavigate();

  // States
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avgRating: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [sortBy, setSortBy] = useState('newest');
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterNoSpoiler, setFilterNoSpoiler] = useState(false);
  const [hideSpoilers, setHideSpoilers] = useState(true);

  // Composer states
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  // Spoiler reveal states (per review)
  const [revealedSpoilers, setRevealedSpoilers] = useState(new Set());

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuReviewId, setMenuReviewId] = useState(null);

  // Fetch reviews and summary
  const fetchData = async (resetPage = true) => {
    try {
      if (resetPage) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const params = {
        sort: sortBy,
        page: resetPage ? 1 : page,
        limit: 10
      };
      if (filterVerified) params.verified = '1';
      if (filterNoSpoiler) params.noSpoiler = '1';

      const [reviewsRes, summaryRes] = await Promise.all([
        getReviewsByMovieAPI(movieId, params),
        resetPage ? getReviewSummaryAPI(movieId) : Promise.resolve(null)
      ]);

      if (reviewsRes.status === 'success') {
        if (resetPage) {
          setReviews(reviewsRes.data.reviews);
        } else {
          setReviews(prev => [...prev, ...reviewsRes.data.reviews]);
        }
        setTotalPages(reviewsRes.data.pagination.totalPages);
      }

      if (summaryRes?.status === 'success') {
        setSummary(summaryRes.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Không thể tải bình luận');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchData(true);
    }
  }, [movieId, sortBy, filterVerified, filterNoSpoiler]);

  // Submit review
  const handleSubmitReview = async () => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để bình luận');
      navigate('/dang-nhap');
      return;
    }

    if (rating === 0) {
      toast.warning('Vui lòng chọn số sao');
      return;
    }

    if (content.length < 20) {
      toast.warning('Vui lòng nhập tối thiểu 20 ký tự');
      return;
    }

    try {
      setSubmitting(true);
      const response = await createReviewAPI(movieId, {
        rating,
        title,
        content,
        hasSpoiler
      });

      if (response.status === 'success') {
        toast.success('Đã đăng bình luận. Cảm ơn bạn!');
        // Reset form
        setRating(0);
        setTitle('');
        setContent('');
        setHasSpoiler(false);
        setShowComposer(false);
        // Refresh data
        fetchData(true);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gửi thất bại. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle like
  const handleLikeReview = async (reviewId) => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để vote hữu ích');
      return;
    }

    try {
      const response = await likeReviewAPI(movieId, reviewId);
      if (response.status === 'success') {
        // Update local state
        setReviews(prev => prev.map(r => {
          if (r._id === reviewId) {
            return {
              ...r,
              likesCount: response.data.likesCount,
              likes: response.data.liked
                ? [...(r.likes || []), user._id]
                : (r.likes || []).filter(id => id !== user._id)
            };
          }
          return r;
        }));
      }
    } catch (error) {
      toast.error('Không thể vote');
    }
  };

  // Toggle spoiler reveal
  const toggleSpoilerReveal = (reviewId) => {
    setRevealedSpoilers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  // Load more
  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
      fetchData(false);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Calculate percentage for distribution bar
  const getDistributionPercent = (starCount) => {
    if (summary.total === 0) return 0;
    return Math.round((starCount / summary.total) * 100);
  };

  // Check if user liked this review
  const isLiked = (review) => {
    if (!user) return false;
    return (review.likes || []).some(id => String(id) === String(user._id));
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Section Title */}
      <Typography sx={sectionTitleStyle}>
        BÌNH LUẬN PHIM
      </Typography>

      <Typography sx={{ color: COLORS.textMuted, mb: 3, fontSize: '14px' }}>
        Chia sẻ cảm nhận để giúp người khác chọn phim phù hợp.
      </Typography>

      {/* Comment Composer */}
      {!user ? (
        // State: Chưa đăng nhập
        <Paper sx={{ ...cardStyle, mb: 3 }}>
          <TextField
            fullWidth
            disabled
            placeholder="Đăng nhập để viết bình luận và chấm điểm phim này…"
            sx={{ mb: 2, ...inputStyle }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/dang-nhap')}
              sx={{ bgcolor: COLORS.primary }}
            >
              Đăng nhập
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/dang-ky')}
              sx={{ color: COLORS.primary }}
            >
              Tạo tài khoản
            </Button>
          </Box>
          <Typography sx={{ color: COLORS.textMuted, fontSize: '12px', mt: 1 }}>
            Bạn chỉ mất 10 giây để bắt đầu bình luận.
          </Typography>
        </Paper>
      ) : (
        // State: Đã đăng nhập
        <Paper sx={{ ...cardStyle, mb: 3 }}>
          {/* User info row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{ width: 40, height: 40 }}
            />
            <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>
              {user.name}
            </Typography>
          </Box>

          {/* Rating row */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '14px', color: COLORS.textMuted, mb: 0.5 }}>
              Bạn chấm phim này mấy sao?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating
                value={rating}
                onChange={(e, newValue) => setRating(newValue)}
                size="large"
                sx={{
                  '& .MuiRating-iconFilled': { color: COLORS.orange },
                  '& .MuiRating-iconHover': { color: COLORS.orange }
                }}
              />
              {rating > 0 && (
                <Chip
                  label={RATING_TEXT[rating]}
                  size="small"
                  sx={{
                    bgcolor: COLORS.orange,
                    color: COLORS.white,
                    fontWeight: 600
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Title input (optional) */}
          <TextField
            fullWidth
            placeholder="Tiêu đề ngắn (ví dụ: Hành động đã mắt, nhịp nhanh)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            inputProps={{ maxLength: 100 }}
            sx={{ mb: 2, ...inputStyle }}
            size="small"
          />

          {/* Content textarea */}
          <TextField
            fullWidth
            multiline
            minRows={4}
            placeholder="Chia sẻ cảm nhận của bạn về nội dung, diễn xuất, âm thanh, hình ảnh… (tối thiểu 20 ký tự)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2, ...inputStyle }}
            helperText={`${content.length}/20 ký tự tối thiểu`}
          />

          {/* Spoiler toggle */}
          <FormControlLabel
            control={
              <Checkbox
                checked={hasSpoiler}
                onChange={(e) => setHasSpoiler(e.target.checked)}
                sx={{ '&.Mui-checked': { color: COLORS.primary } }}
              />
            }
            label={
              <Box>
                <Typography sx={{ fontSize: '14px' }}>Bình luận có spoiler</Typography>
                <Typography sx={{ fontSize: '12px', color: COLORS.textMuted }}>
                  Nếu có tiết lộ nội dung quan trọng, hãy bật spoiler để người khác không bị lộ.
                </Typography>
              </Box>
            }
          />

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmitReview}
              disabled={rating === 0 || content.length < 20 || submitting}
              sx={{
                bgcolor: COLORS.primary,
                '&:disabled': { bgcolor: '#ccc' }
              }}
            >
              {submitting ? <CircularProgress size={20} /> : 'Gửi đánh giá'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setRating(0);
                setTitle('');
                setContent('');
                setHasSpoiler(false);
              }}
              sx={{
                '&:focus': { outline: 'none' },
                '&:hover': { borderColor: COLORS.border }
              }}
            >
              Hủy
            </Button>
          </Box>
        </Paper>
      )}

      {/* Review Summary */}
      {!loading && summary.total > 0 && (
        <Paper sx={{ ...cardStyle, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {/* Average rating */}
            <Box sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography sx={{ fontSize: '42px', fontWeight: 700, color: COLORS.text }}>
                {summary.avgRating}
                <Typography component="span" sx={{ fontSize: '20px', color: COLORS.textMuted }}>/5</Typography>
              </Typography>
              <Rating value={summary.avgRating} precision={0.1} readOnly size="small" />
              <Typography sx={{ fontSize: '13px', color: COLORS.textMuted, mt: 0.5 }}>
                {summary.total} đánh giá
              </Typography>
            </Box>

            {/* Distribution bars */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              {[5, 4, 3, 2, 1].map((star) => (
                <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: '13px', minWidth: 45 }}>{star} sao</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getDistributionPercent(summary.distribution[star])}
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#eee',
                      '& .MuiLinearProgress-bar': { bgcolor: COLORS.orange }
                    }}
                  />
                  <Typography sx={{ fontSize: '12px', color: COLORS.textMuted, minWidth: 35 }}>
                    {getDistributionPercent(summary.distribution[star])}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      )}

      {/* Sort & Filter bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150, ...inputStyle }}>
          <InputLabel>Sắp xếp</InputLabel>
          <Select
            value={sortBy}
            label="Sắp xếp"
            onChange={(e) => setSortBy(e.target.value)}
            sx={{
              '&:focus': { outline: 'none' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.border,
                borderWidth: '1px'
              }
            }}
          >
            <MenuItem value="newest">Mới nhất</MenuItem>
            <MenuItem value="helpful">Hữu ích nhất</MenuItem>
            <MenuItem value="high">Điểm cao</MenuItem>
            <MenuItem value="low">Điểm thấp</MenuItem>
          </Select>
        </FormControl>

        <Chip
          label="Đã mua vé"
          icon={<VerifiedIcon />}
          variant={filterVerified ? 'filled' : 'outlined'}
          onClick={() => setFilterVerified(!filterVerified)}
          sx={{
            bgcolor: filterVerified ? COLORS.primary : 'transparent',
            color: filterVerified ? COLORS.white : COLORS.text,
            borderColor: COLORS.border
          }}
        />

        <Chip
          label="Không spoiler"
          variant={filterNoSpoiler ? 'filled' : 'outlined'}
          onClick={() => setFilterNoSpoiler(!filterNoSpoiler)}
          sx={{
            bgcolor: filterNoSpoiler ? COLORS.primary : 'transparent',
            color: filterNoSpoiler ? COLORS.white : COLORS.text,
            borderColor: COLORS.border
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={hideSpoilers}
              onChange={(e) => setHideSpoilers(e.target.checked)}
              size="small"
            />
          }
          label={<Typography sx={{ fontSize: '13px' }}>Ẩn toàn bộ spoiler</Typography>}
        />
      </Box>

      {/* Reviews List */}
      {loading ? (
        // Loading skeletons
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Paper key={i} sx={{ ...cardStyle }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="text" width="20%" />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="80%" />
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : reviews.length === 0 ? (
        // Empty state
        <Paper sx={{ ...cardStyle, textAlign: 'center', py: 5 }}>
          <Typography sx={{ fontSize: '16px', color: COLORS.textMuted, mb: 1 }}>
            Chưa có bình luận nào.
          </Typography>
          <Typography sx={{ fontSize: '14px', color: COLORS.textMuted, mb: 2 }}>
            Hãy là người đầu tiên đánh giá phim này nhé!
          </Typography>
          {user && (
            <Button
              variant="contained"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{ bgcolor: COLORS.primary }}
            >
              Viết bình luận
            </Button>
          )}
        </Paper>
      ) : (
        // Review cards
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.map((review) => (
            <Paper key={review._id} sx={{ ...cardStyle }}>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                <Avatar
                  src={review.user?.avatar}
                  alt={review.user?.name}
                  sx={{ width: 40, height: 40 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>
                      {review.user?.name || 'Ẩn danh'}
                    </Typography>
                    {review.isVerified && (
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                        label="Đã mua vé"
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '11px',
                          bgcolor: '#E3F2FD',
                          color: COLORS.primary
                        }}
                      />
                    )}
                    <Typography sx={{ fontSize: '12px', color: COLORS.textMuted }}>
                      {formatRelativeTime(review.createdAt)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography sx={{ fontSize: '13px', color: COLORS.orange, fontWeight: 600 }}>
                      {RATING_TEXT[review.rating]}
                    </Typography>
                  </Box>
                </Box>

                {/* Menu */}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    setMenuAnchorEl(e.currentTarget);
                    setMenuReviewId(review._id);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Title */}
              {review.title && (
                <Typography sx={{ fontWeight: 600, fontSize: '15px', mb: 1 }}>
                  {review.title}
                </Typography>
              )}

              {/* Content */}
              {review.hasSpoiler && hideSpoilers && !revealedSpoilers.has(review._id) ? (
                // Spoiler hidden
                <Box
                  sx={{
                    bgcolor: '#f5f5f5',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    border: '1px dashed #ddd'
                  }}
                >
                  <VisibilityOffIcon sx={{ color: COLORS.textMuted, mb: 1 }} />
                  <Typography sx={{ fontSize: '14px', color: COLORS.textMuted, mb: 1 }}>
                    Bình luận có tiết lộ nội dung.
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => toggleSpoilerReveal(review._id)}
                  >
                    Hiện spoiler
                  </Button>
                </Box>
              ) : (
                <Typography sx={{ fontSize: '14px', lineHeight: 1.6, color: COLORS.text }}>
                  {review.hasSpoiler && (
                    <Chip
                      label="SPOILER"
                      size="small"
                      sx={{
                        mr: 1,
                        height: 20,
                        fontSize: '10px',
                        bgcolor: COLORS.error,
                        color: COLORS.white
                      }}
                    />
                  )}
                  {review.content}
                </Typography>
              )}

              {/* Footer actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Button
                  size="small"
                  startIcon={isLiked(review) ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                  onClick={() => handleLikeReview(review._id)}
                  sx={{
                    color: isLiked(review) ? COLORS.primary : COLORS.textMuted,
                    textTransform: 'none'
                  }}
                >
                  Hữu ích ({review.likesCount || 0})
                </Button>
              </Box>
            </Paper>
          ))}

          {/* Load more */}
          {page < totalPages && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? <CircularProgress size={20} /> : 'Xem thêm bình luận'}
              </Button>
            </Box>
          )}

          {page >= totalPages && reviews.length > 0 && (
            <Typography sx={{ textAlign: 'center', color: COLORS.textMuted, fontSize: '13px', mt: 2 }}>
              Bạn đã xem hết bình luận.
            </Typography>
          )}
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          navigator.clipboard.writeText(`${window.location.href}#review-${menuReviewId}`);
          toast.success('Đã copy link');
          setMenuAnchorEl(null);
        }}>
          <ShareIcon sx={{ mr: 1, fontSize: 18 }} /> Chia sẻ
        </MenuItem>
        <MenuItem onClick={() => {
          toast.info('Đã báo cáo bình luận');
          setMenuAnchorEl(null);
        }}>
          <FlagIcon sx={{ mr: 1, fontSize: 18 }} /> Báo cáo
        </MenuItem>
        <MenuItem onClick={() => {
          setMenuAnchorEl(null);
        }}>
          <BlockIcon sx={{ mr: 1, fontSize: 18 }} /> Ẩn bình luận này
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default CommentSection;
