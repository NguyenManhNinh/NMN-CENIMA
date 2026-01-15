import { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio
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
  Block as BlockIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Undo as UndoIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { LoginModal, RegisterModal, ForgotPasswordModal } from '../Common';
import {
  getReviewsByMovieAPI,
  getReviewSummaryAPI,
  createReviewAPI,
  likeReviewAPI,
  getRepliesAPI,
  replyToReviewAPI,
  // Genre Review APIs
  getReviewsByGenreAPI,
  getGenreReviewSummaryAPI,
  createGenreReviewAPI,
  likeGenreReviewAPI,
  getGenreRepliesAPI,
  replyToGenreReviewAPI,
  // Report API
  reportReviewAPI
} from '../../apis/reviewApi';

// Bảng màu đồng bộ với website
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

// Danh sách biểu cảm (Reaction)
const REACTIONS = {
  LIKE: { label: 'Thích', icon: '👍', color: '#2196F3' },
  LOVE: { label: 'Yêu thích', icon: '❤️', color: '#F44336' },
  HAHA: { label: 'Haha', icon: '😂', color: '#FFC107' },
  WOW: { label: 'Wow', icon: '😮', color: '#FFC107' },
  SAD: { label: 'Buồn', icon: '😢', color: '#FFC107' },
  ANGRY: { label: 'Phẫn nộ', icon: '😡', color: '#FF5722' }
};


// Map điểm đánh giá với text
const RATING_TEXT = {
  5: 'Tuyệt vời',
  4: 'Rất ốn',
  3: 'Ốn',
  2: 'Chưa đã',
  1: 'Thất vọng'
};

// Style tiêu đề
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

// Style khung thẻ
const cardStyle = {
  p: 2.5,
  bgcolor: COLORS.white,
  borderRadius: '12px',
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
};

// Style ô nhập liệu - bỏ outline khi focus
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

// Component phụ: Nút Reaction
const ReactionAction = ({ item, user, onReact }) => {
  const getMyReaction = () => {
    if (item.myReaction) return item.myReaction;
    if (!user || !item.reactions) return null;
    const r = item.reactions.find(x => x.user?._id === user._id || x.user === user._id);
    return r ? r.type : null;
  };
  const myReaction = getMyReaction();
  const count = item.likesCount ?? item.reactions?.length ?? 0;

  return (
    <Tooltip
      title={
        <Box sx={{ display: 'flex', gap: 1, p: 0.5, bgcolor: '#fff', borderRadius: 20 }}>
          {Object.entries(REACTIONS).map(([type, { icon, label }]) => (
            <Box
              key={type}
              component="span"
              onClick={(e) => {
                e.stopPropagation();
                onReact(type);
              }}
              sx={{
                cursor: 'pointer',
                fontSize: '24px',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.3)' }
              }}
              title={label}
            >
              {icon}
            </Box>
          ))}
        </Box>
      }
      placement="top"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'transparent',
            color: 'inherit',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            p: 0
          }
        }
      }}
    >
      <Button
        size="small"
        startIcon={
          myReaction
            ? <span style={{ fontSize: '18px' }}>{REACTIONS[myReaction].icon}</span>
            : <ThumbUpOutlinedIcon />
        }
        onClick={() => onReact('LIKE')}
        sx={{
          color: myReaction ? REACTIONS[myReaction].color : COLORS.textMuted,
          textTransform: 'none',
          fontWeight: myReaction ? 600 : 400
        }}
      >
        {myReaction ? REACTIONS[myReaction].label : 'Thích'} ({count})
      </Button>
    </Tooltip>
  );
};

/**
 * CommentSection - Component chính cho bình luận
 * @param {string} movieId - ID của phim (optional)
 * @param {string} genreId - ID của bài viết/genre (optional)
 * @param {object} user - User hiện tại (null nếu chưa đăng nhập)
 */
function CommentSection({ movieId, genreId, user }) {
  // Xác định targetId và isGenre
  const targetId = genreId || movieId;
  const isGenre = !!genreId;

  // State cho Auth Modals
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

  // Các State
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avgRating: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State bộ lọc
  const [sortBy, setSortBy] = useState('newest');
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterNoSpoiler, setFilterNoSpoiler] = useState(false);
  const [hideSpoilers, setHideSpoilers] = useState(true);

  // State soạn thảo bình luận
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  // State hiển thị nội dung Spoiler (từng review)
  const [revealedSpoilers, setRevealedSpoilers] = useState(new Set());

  // State Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuReviewId, setMenuReviewId] = useState(null);

  // State phản hồi
  const [replyingTo, setReplyingTo] = useState(null); // ID của bình luận đang được trả lời
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState({}); // { reviewId: [replies] }
  const [loadingReplies, setLoadingReplies] = useState({}); // { reviewId: boolean }
  const [submittingReply, setSubmittingReply] = useState(false);
  const [hiddenReplies, setHiddenReplies] = useState({}); // { reviewId: boolean }
  const reviewRefs = useRef({});

  // State Report Dialog
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('toxic');
  const [reportNote, setReportNote] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportedReviews, setReportedReviews] = useState(new Set()); // Lưu ID các review đã report trong phiên này

  // State cho ẩn bình luận local (chỉ user này thấy)
  const [hiddenByUser, setHiddenByUser] = useState(new Set());

  // Load hidden reviews từ localStorage khi targetId thay đổi
  useEffect(() => {
    if (targetId) {
      const key = `hidden_reviews_${targetId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHiddenByUser(new Set(parsed));
          }
        } catch (e) {
          console.error('Error parsing hidden reviews:', e);
        }
      }
    }
  }, [targetId]);

  // Helper function để lưu vào localStorage
  const saveHiddenToStorage = (newSet) => {
    if (targetId) {
      const key = `hidden_reviews_${targetId}`;
      localStorage.setItem(key, JSON.stringify(Array.from(newSet)));
    }
  };

  // Helper functions cho ẩn bình luận
  const hideReviewForMe = (reviewId) => {
    setHiddenByUser(prev => {
      const newSet = new Set(prev).add(reviewId);
      saveHiddenToStorage(newSet);
      return newSet;
    });
  };

  const unhideReviewForMe = (reviewId) => {
    setHiddenByUser(prev => {
      const newSet = new Set(prev);
      newSet.delete(reviewId);
      saveHiddenToStorage(newSet);
      return newSet;
    });
  };

  const clearAllHidden = () => {
    const newSet = new Set();
    setHiddenByUser(newSet);
    saveHiddenToStorage(newSet);
    toast.success('Đã hiện lại tất cả bình luận');
  };


  // Lấy dữ liệu đánh giá
  const fetchData = async (pageNum = 1, fetchSummary = true) => {
    if (!targetId) return; // No target ID, skip
    try {
      setLoading(true);

      const params = {
        sort: sortBy,
        page: pageNum,
        limit: 10
      };
      if (filterVerified) params.verified = '1';
      if (filterNoSpoiler) params.noSpoiler = '1';

      // Gọi đúng API dựa trên isGenre
      const [reviewsRes, summaryRes] = await Promise.all([
        isGenre
          ? getReviewsByGenreAPI(targetId, params)
          : getReviewsByMovieAPI(targetId, params),
        fetchSummary
          ? (isGenre ? getGenreReviewSummaryAPI(targetId) : getReviewSummaryAPI(targetId))
          : Promise.resolve(null)
      ]);

      if (reviewsRes.status === 'success') {
        setReviews(reviewsRes.data.reviews);
        setTotalPages(reviewsRes.data.pagination?.totalPages || 1);
        setPage(pageNum);
      }

      if (summaryRes?.status === 'success') {
        setSummary(summaryRes.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Không hiển thị toast error nếu chưa có reviews
      if (error.response?.status !== 404) {
        toast.error('Không thể tải bình luận');
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (pageNum) => {
    if (pageNum === page || pageNum < 1 || pageNum > totalPages) return;
    fetchData(pageNum, false);
    // Scroll to top of comments section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (targetId) {
      fetchData(1, true);
    }
  }, [targetId, sortBy, filterVerified, filterNoSpoiler]);

  // Gửi báo cáo
  const handleReportReview = async () => {
    if (!menuReviewId) return;

    if (!reportReason) {
      toast.error('Vui lòng chọn lý do báo cáo');
      return;
    }

    setSubmittingReport(true);
    try {
      await reportReviewAPI(targetId, menuReviewId, {
        reason: reportReason,
        note: reportNote
      });

      toast.success('Báo cáo thành công. Cảm ơn bạn đã đóng góp!');
      setReportDialogOpen(false);
      setReportedReviews(prev => new Set(prev).add(menuReviewId));

      // Reset form
      setReportReason('toxic');
      setReportNote('');
    } catch (error) {
      console.error('Report error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi báo cáo');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Gửi đánh giá
  const handleSubmitReview = async () => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để bình luận');
      setLoginModalOpen(true);
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
      const response = isGenre
        ? await createGenreReviewAPI(targetId, { rating, title, content, hasSpoiler })
        : await createReviewAPI(targetId, { rating, title, content, hasSpoiler });

      if (response.status === 'success') {
        toast.success('Đã đăng bình luận. Cảm ơn bạn!');
        // Reset form
        setRating(0);
        setTitle('');
        setContent('');
        setHasSpoiler(false);
        setShowComposer(false);
        // Refresh data
        fetchData(1, true);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gửi thất bại. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý Reaction
  const handleReaction = async (reviewId, type = 'LIKE') => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để bày tỏ cảm xúc');
      setLoginModalOpen(true);
      return;
    }

    try {
      const response = isGenre
        ? await likeGenreReviewAPI(targetId, reviewId, type)
        : await likeReviewAPI(targetId, reviewId, type);
      if (response.status === 'success') {
        const { likesCount, myReaction, reactions } = response.data;

        // Update local state
        setReviews(prev => prev.map(r => {
          if (r._id === reviewId) {
            return {
              ...r,
              likesCount,
              myReaction, // Update myReaction specifically
              reactions // Update full reactions array
            };
          }
          return r;
        }));
      }
    } catch (error) {
      toast.error('Không thể thực hiện hành động');
    }
  };

  // Xử lý Reaction cho phản hồi
  const handleReplyReaction = async (parentId, replyId, type = 'LIKE') => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để bày tỏ cảm xúc');
      setLoginModalOpen(true);
      return;
    }

    try {
      const response = isGenre
        ? await likeGenreReviewAPI(targetId, replyId, type)
        : await likeReviewAPI(targetId, replyId, type);
      if (response.status === 'success') {
        const { likesCount, myReaction, reactions } = response.data;

        setReplies(prev => ({
          ...prev,
          [parentId]: prev[parentId].map(r =>
            r._id === replyId ? { ...r, likesCount, myReaction, reactions } : r
          )
        }));
      }
    } catch (error) {
      toast.error('Bày tỏ cảm xúc thất bại');
    }
  };

  // Bật/Tắt hiển thị Spoiler
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


  // Định dạng thời gian tương đối
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

  // Tính phần trăm phân bổ sao
  const getDistributionPercent = (starCount) => {
    if (summary.total === 0) return 0;
    return Math.round((starCount / summary.total) * 100);
  };

  // Bật/Tắt hiển thị phản hồi
  const toggleRepliesVisibility = (reviewId) => {
    const isCollapsing = !hiddenReplies[reviewId];
    setHiddenReplies(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));

    if (isCollapsing) {
      // Small timeout to allow state update/UI shift, or immediate?
      // Immediate scroll might be jittery if height changes.
      // User requested scroll UP.
      setTimeout(() => {
        reviewRefs.current[reviewId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Tải phản hồi
  const fetchReplies = async (reviewId) => {
    if (hiddenReplies[reviewId]) {
      setHiddenReplies(prev => ({ ...prev, [reviewId]: false }));
      return;
    }
    if (replies[reviewId]) return; // Already loaded

    setLoadingReplies(prev => ({ ...prev, [reviewId]: true }));
    try {
      const response = isGenre
        ? await getGenreRepliesAPI(targetId, reviewId)
        : await getRepliesAPI(targetId, reviewId);
      if (response.status === 'success') {
        setReplies(prev => ({ ...prev, [reviewId]: response.data.replies }));
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  // Xử lý nút Trả lời
  const handleReplyClick = (reviewId) => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để trả lời bình luận');
      setLoginModalOpen(true);
      return;
    }
    setReplyingTo(replyingTo === reviewId ? null : reviewId);
    setReplyContent('');
    // Load replies if not loaded
    if (!replies[reviewId]) {
      fetchReplies(reviewId);
    }
  };

  // Gửi phản hồi
  const handleSubmitReply = async (parentId) => {
    if (!user || !replyContent.trim()) return;

    if (replyContent.length < 10) {
      toast.warning('Nội dung trả lời phải có ít nhất 10 ký tự');
      return;
    }

    setSubmittingReply(true);
    try {
      const response = isGenre
        ? await replyToGenreReviewAPI(targetId, { content: replyContent, parentId })
        : await replyToReviewAPI(targetId, { content: replyContent, parentId });

      if (response.status === 'success') {
        toast.success('Đã gửi trả lời!');
        // Add new reply to local state
        setReplies(prev => ({
          ...prev,
          [parentId]: [...(prev[parentId] || []), response.data.review]
        }));
        setReplyContent('');
        setReplyingTo(null);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gửi thất bại';
      toast.error(message);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Gửi báo cáo
  const handleReport = async () => {
    if (!reportReason) {
      toast.warning('Vui lòng chọn lý do báo cáo');
      return;
    }

    setSubmittingReport(true);
    try {
      // Sử dụng movieId vì API report chỉ hỗ trợ movie reviews
      const response = await reportReviewAPI(movieId || targetId, menuReviewId, {
        reason: reportReason,
        note: reportNote
      });

      if (response.status === 'success') {
        toast.success(response.message || 'Đã gửi báo cáo');
        // Track review đã report
        setReportedReviews(prev => new Set([...prev, menuReviewId]));
        // Reset form
        setReportDialogOpen(false);
        setReportReason('');
        setReportNote('');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể gửi báo cáo';
      toast.error(message);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Lý do báo cáo options
  const REPORT_REASONS = [
    { value: 'toxic', label: 'Nội dung độc hại' },
    { value: 'spam', label: 'Spam / Quảng cáo' },
    { value: 'hate', label: 'Kích động thù địch' },
    { value: 'harassment', label: 'Quấy rối' },
    { value: 'sexual', label: 'Nội dung người lớn' },
    { value: 'spoiler', label: 'Tiết lộ nội dung phim' },
    { value: 'other', label: 'Lý do khác' }
  ];

  return (
    <Box sx={{ mt: 4 }}>
      {/* Tiêu đề phần bình luận */}
      <Typography sx={sectionTitleStyle}>
        BÌNH LUẬN PHIM
      </Typography>

      <Typography sx={{ color: COLORS.textMuted, mb: 3, fontSize: '14px' }}>
        Chia sẻ cảm nhận để giúp người khác chọn phim phù hợp.
      </Typography>

      {/* Form viết bình luận - hiển thị cho tất cả */}
      <Paper sx={{ ...cardStyle, mb: 3 }}>
        {/* Hàng thông tin User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            src={user?.avatar}
            alt={user?.name || 'Guest'}
            sx={{ width: 40, height: 40, bgcolor: COLORS.primary }}
          />
          <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>
            {user?.name || 'Khách'}
          </Typography>
        </Box>

        {/* Hàng đánh giá sao */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '14px', color: COLORS.textMuted, mb: 0.5 }}>
            Bạn chấm phim này mấy sao?
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating
              value={rating}
              onChange={(e, newValue) => {
                if (!user) {
                  toast.warning('Vui lòng đăng nhập để đánh giá');
                  setLoginModalOpen(true);
                  return;
                }
                setRating(newValue);
              }}
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

        {/* Ô nhập tiêu đề */}
        <TextField
          fullWidth
          placeholder="Tiêu đề ngắn (ví dụ: Hành động đã mắt, nhịp nhanh)"
          value={title}
          onClick={() => {
            if (!user) {
              toast.warning('Vui lòng đăng nhập để viết bình luận');
              setLoginModalOpen(true);
            }
          }}
          onChange={(e) => setTitle(e.target.value)}
          inputProps={{ maxLength: 100 }}
          sx={{ mb: 2, ...inputStyle }}
          size="small"
        />

        {/* Ô nhập nội dung */}
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Chia sẻ cảm nhận của bạn về nội dung, diễn xuất, âm thanh, hình ảnh… (tối thiểu 20 ký tự)"
          value={content}
          onClick={() => {
            if (!user) {
              toast.warning('Vui lòng đăng nhập để viết bình luận');
              setLoginModalOpen(true);
            }
          }}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2, ...inputStyle }}
          helperText={`${content.length}/20 ký tự tối thiểu`}
        />

        {/* Tùy chọn Spoiler */}
        <FormControlLabel
          control={
            <Checkbox
              checked={hasSpoiler}
              onChange={(e) => {
                if (!user) {
                  toast.warning('Vui lòng đăng nhập để viết bình luận');
                  setLoginModalOpen(true);
                  return;
                }
                setHasSpoiler(e.target.checked);
              }}
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

        {/* Nút hành động */}
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

      {/* Tổng quan đánh giá */}
      {!loading && summary.total > 0 && (
        <Paper sx={{ ...cardStyle, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {/* Điểm trung bình */}
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

            {/* Thanh phân bổ */}
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

      {/* Thanh Sắp xếp & Bộ lọc */}
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

        {/* Chip hiển thị số bình luận đã ẩn */}
        {hiddenByUser.size > 0 && (
          <Chip
            label={`Đã ẩn ${hiddenByUser.size} bình luận`}
            onDelete={clearAllHidden}
            variant="outlined"
            sx={{
              borderColor: COLORS.border,
              color: COLORS.text
            }}
          />
        )}
      </Box>

      {/* Danh sách bình luận */}
      {loading ? (
        // Skeleton loading
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
        // Trạng thái trống
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
        // Danh sách thẻ đánh giá
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.filter(review => !hiddenByUser.has(review._id)).map((review) => (
            <Paper key={review._id} ref={(el) => (reviewRefs.current[review._id] = el)} sx={{ ...cardStyle }}>
              {/* Phần đầu */}
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

                {/* Menu tùy chọn */}
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

              {/* Tiêu đề */}
              {review.title && (
                <Typography sx={{ fontWeight: 600, fontSize: '15px', mb: 1 }}>
                  {review.title}
                </Typography>
              )}

              {/* Nội dung */}
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
                <Typography component="div" sx={{ fontSize: '14px', lineHeight: 1.6, color: COLORS.text }}>
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

              {/* Hành động (Like, Reply) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <ReactionAction
                  item={review}
                  user={user}
                  onReact={(type) => handleReaction(review._id, type)}
                />
                <Button
                  size="small"
                  startIcon={<ReplyIcon />}
                  onClick={() => handleReplyClick(review._id)}
                  sx={{ color: COLORS.textMuted, textTransform: 'none' }}
                >
                  Trả lời {replies[review._id]?.length > 0 ? `(${replies[review._id].length})` : ''}
                </Button>

              </Box>

              {/* Form trả lời */}
              <Collapse in={replyingTo === review._id}>
                <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Avatar src={user?.avatar} sx={{ width: 32, height: 32 }} />
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        placeholder="Viết trả lời..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        size="small"
                        sx={{ ...inputStyle }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleSubmitReply(review._id)}
                          disabled={replyContent.trim().length < 1 || submittingReply}
                          sx={{ bgcolor: COLORS.primary }}
                        >
                          {submittingReply ? <CircularProgress size={16} /> : 'Gửi'}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                        >
                          Hủy
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Collapse>

              {/* Danh sách trả lời */}
              {replies[review._id] && replies[review._id].length > 0 && !hiddenReplies[review._id] && (
                <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                  {replies[review._id].filter(reply => !hiddenByUser.has(reply._id)).map((reply) => (
                    <Box key={reply._id} sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
                      <Avatar src={reply.user?.avatar} sx={{ width: 32, height: 32 }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>
                            {reply.user?.name}
                          </Typography>
                          {reply.user?.role === 'admin' && (
                            <Chip label="Admin" size="small" sx={{ height: 18, fontSize: '10px', bgcolor: COLORS.primary, color: '#fff' }} />
                          )}
                          <Typography sx={{ fontSize: '11px', color: COLORS.textMuted }}>
                            {formatRelativeTime(reply.createdAt)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '13px', color: COLORS.text, mt: 0.5 }}>
                          {reply.content}
                        </Typography>
                        {/* Hành động trả lời */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <ReactionAction
                            item={reply}
                            user={user}
                            onReact={(type) => handleReplyReaction(review._id, reply._id, type)}
                          />
                          <Button
                            size="small"
                            startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
                            onClick={() => {
                              setReplyingTo(review._id);
                              setReplyContent(`@${reply.user?.name} `);
                            }}
                            sx={{ color: COLORS.textMuted, textTransform: 'none', fontSize: '12px', minWidth: 'auto' }}
                          >
                            Trả lời
                          </Button>
                        </Box>
                      </Box>
                      {/* Menu tùy chọn cho reply */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setMenuAnchorEl(e.currentTarget);
                          setMenuReviewId(reply._id);
                        }}
                      >
                        <MoreVertIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}


              {/* Nút thu gọn */}
              {replies[review._id] && replies[review._id].length > 0 && !hiddenReplies[review._id] && (
                <Button
                  size="small"
                  startIcon={<ArrowDropUpIcon />}
                  onClick={() => toggleRepliesVisibility(review._id)}
                  sx={{ mt: 1, color: COLORS.textMuted, textTransform: 'none' }}
                >
                  Thu gọn
                </Button>
              )}

              {/* Nút xem trả lời */}
              {(!replies[review._id] || hiddenReplies[review._id]) && (
                <Button
                  size="small"
                  onClick={() => fetchReplies(review._id)}
                  disabled={loadingReplies[review._id]}
                  sx={{ mt: 1, color: COLORS.textMuted, textTransform: 'none' }}
                >
                  {loadingReplies[review._id] ? <CircularProgress size={14} /> : 'Xem trả lời'}
                </Button>
              )}
            </Paper>
          ))}



          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 0.5,
              mt: 3,
              pt: 2,
              borderTop: '1px solid #eee'
            }}>
              {/* Trang đầu */}
              <Box
                onClick={() => handlePageChange(1)}
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: page === 1 ? 'default' : 'pointer',
                  color: page === 1 ? '#ccc' : '#666',
                  fontSize: '14px'
                }}
              >
                «
              </Box>
              {/* Trang trước */}
              <Box
                onClick={() => handlePageChange(page - 1)}
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: page === 1 ? 'default' : 'pointer',
                  color: page === 1 ? '#ccc' : '#666',
                  fontSize: '14px'
                }}
              >
                ‹
              </Box>

              {/* Page Numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = idx + 1;
                } else if (page <= 3) {
                  pageNum = idx + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = page - 2 + idx;
                }

                return (
                  <Box
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    sx={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      bgcolor: page === pageNum ? '#f5a623' : 'transparent',
                      color: page === pageNum ? '#fff' : '#666',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: page === pageNum ? 600 : 400,
                      '&:hover': {
                        bgcolor: page === pageNum ? '#f5a623' : '#f0f0f0'
                      }
                    }}
                  >
                    {pageNum}
                  </Box>
                );
              })}

              {/* Dấu ba chấm (...) */}
              {totalPages > 5 && page < totalPages - 2 && (
                <Box sx={{ px: 1, color: '#666' }}>...</Box>
              )}

              {/* Trang cuối cùng (nếu >5 trang và chưa gần cuối) */}
              {totalPages > 5 && page < totalPages - 2 && (
                <Box
                  onClick={() => handlePageChange(totalPages)}
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#666',
                    borderRadius: '4px',
                    fontSize: '14px',
                    '&:hover': { bgcolor: '#f0f0f0' }
                  }}
                >
                  {totalPages}
                </Box>
              )}

              {/* Trang sau */}
              <Box
                onClick={() => handlePageChange(page + 1)}
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: page === totalPages ? 'default' : 'pointer',
                  color: page === totalPages ? '#ccc' : '#666',
                  fontSize: '14px'
                }}
              >
                ›
              </Box>
              {/* Trang cuối */}
              <Box
                onClick={() => handlePageChange(totalPages)}
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: page === totalPages ? 'default' : 'pointer',
                  color: page === totalPages ? '#ccc' : '#666',
                  fontSize: '14px'
                }}
              >
                »
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Menu ngữ cảnh */}
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
        <MenuItem
          onClick={() => {
            if (!user) {
              toast.warning('Vui lòng đăng nhập để báo cáo');
              setLoginModalOpen(true);
              setMenuAnchorEl(null);
              return;
            }
            if (reportedReviews.has(menuReviewId)) {
              toast.info('Bạn đã báo cáo bình luận này');
              setMenuAnchorEl(null);
              return;
            }
            setReportDialogOpen(true);
            setMenuAnchorEl(null);
          }}
        >
          <FlagIcon sx={{ mr: 1, fontSize: 18 }} />
          {reportedReviews.has(menuReviewId) ? 'Đã báo cáo' : 'Báo cáo'}
        </MenuItem>
        <MenuItem onClick={() => {
          const reviewIdToHide = menuReviewId;
          hideReviewForMe(reviewIdToHide);
          setMenuAnchorEl(null);
          toast.success('Đã ẩn 1 bình luận');
        }}>
          <BlockIcon sx={{ mr: 1, fontSize: 18 }} /> Ẩn bình luận này
        </MenuItem>
      </Menu>

      {/* Auth Modals */}


      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => !submittingReport && setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: COLORS.error, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlagIcon /> Báo cáo bình luận
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Hãy chọn lý do bạn muốn báo cáo bình luận này. Báo cáo của bạn sẽ được giữ bí mật.
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <FormControlLabel value="toxic" control={<Radio />} label="Nội dung độc hại / Xúc phạm" />
              <FormControlLabel value="spam" control={<Radio />} label="Spam / Quảng cáo" />
              <FormControlLabel value="spoiler" control={<Radio />} label="Tiết lộ nội dung phim (Spoiler)" />
              <FormControlLabel value="hate" control={<Radio />} label="Ngôn từ kích động gây war" />
              <FormControlLabel value="sexual" control={<Radio />} label="Nội dung không phù hợp / Người lớn" />
              <FormControlLabel value="harassment" control={<Radio />} label="Quấy rối" />
              <FormControlLabel value="other" control={<Radio />} label="Lý do khác" />
            </RadioGroup>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Mô tả thêm (tùy chọn)..."
            value={reportNote}
            onChange={(e) => setReportNote(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#ddd' },
                '&.Mui-focused fieldset': { borderColor: '#ddd', borderWidth: '1px' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, }}>
          <Button
            onClick={() => setReportDialogOpen(false)}
            disabled={submittingReport}
            sx={{ color: COLORS.textMuted }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReportReview}
            disabled={submittingReport}
            startIcon={submittingReport && <CircularProgress size={20} color="inherit" />}
          >
            {submittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CommentSection;
