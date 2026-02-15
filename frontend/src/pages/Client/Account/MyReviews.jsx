import { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { ErrorOutline as ErrorOutlineIcon, Star as StarIcon } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { getMyReviewsAPI } from '../../../apis/reviewApi';
import { useNavigate } from 'react-router-dom';

const font = '"Nunito Sans", sans-serif';

export default function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const nameUpper = (user?.name || 'Khách hàng').toUpperCase();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getMyReviewsAPI();
        setReviews(res.data?.reviews || []);
      } catch (error) {
        console.error('Lỗi lấy nhận xét:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // Render stars
  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <Box sx={{ display: 'flex', gap: 0.2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            sx={{
              fontSize: '0.95rem',
              color: star <= rating ? '#f5a623' : '#e0e0e0'
            }}
          />
        ))}
      </Box>
    );
  };

  // Loading
  if (loading) {
    return (
      <Box sx={{ bgcolor: '#fff', p: 3 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 100 : 60} sx={{ mb: 1.5, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        px: { xs: 2, md: 3 },
        py: 1.5,
        borderBottom: '1px solid rgba(0,0,0,0.08)'
      }}>
        <Typography sx={{ fontSize: '0.85rem', color: '#555', fontFamily: font }}>
          <b style={{ color: '#1a2332' }}>{nameUpper}</b> Đây là danh sách các nhận xét của bạn.
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.4)', fontFamily: font }}>
          Tổng: {reviews.length} nhận xét
        </Typography>
      </Box>

      {/* Empty state */}
      {reviews.length === 0 && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          py: 6
        }}>
          <ErrorOutlineIcon sx={{ fontSize: '1rem', color: 'rgba(0,0,0,0.3)' }} />
          <Typography sx={{ fontSize: '0.82rem', color: 'rgba(0,0,0,0.4)', fontFamily: font }}>
            Bạn chưa có nhận xét nào.
          </Typography>
        </Box>
      )}

      {/* =============== MOBILE CARD LAYOUT =============== */}
      {reviews.length > 0 && isMobile && (
        <Box sx={{ px: 1.5, py: 1 }}>
          {reviews.map((review, idx) => (
            <Box
              key={review._id || idx}
              sx={{
                display: 'flex',
                gap: 1.5,
                py: 1.5,
                borderBottom: idx < reviews.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                cursor: review.movie?.slug ? 'pointer' : 'default'
              }}
              onClick={() => review.movie?.slug && navigate(`/booking/${review.movie.slug}`)}
            >
              {/* Poster */}
              {review.movie?.posterUrl && (
                <Box
                  component="img"
                  src={review.movie.posterUrl}
                  alt={review.movie?.title}
                  sx={{ width: 48, height: 68, objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1a2332',
                  fontFamily: font,
                  mb: 0.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {review.movie?.title || 'Phim đã xóa'}
                </Typography>
                {renderStars(review.rating)}
                <Typography sx={{
                  fontSize: '0.75rem',
                  color: 'rgba(0,0,0,0.65)',
                  fontFamily: font,
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {review.content}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.4)', fontFamily: font, mt: 0.3 }}>
                  {formatDate(review.createdAt)}
                  {review.isVerified && (
                    <span style={{ color: '#2e7d32', marginLeft: 6, fontWeight: 600 }}>✓ Đã xác thực</span>
                  )}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* =============== DESKTOP TABLE LAYOUT =============== */}
      {reviews.length > 0 && !isMobile && (
        <Box sx={{ overflow: 'auto' }}>
          {/* Table Header */}
          <Box sx={{
            display: 'flex',
            bgcolor: '#f5f5f5',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            px: 2,
            py: 1.2,
            minWidth: 800
          }}>
            {[
              { label: 'STT', flex: 0.4 },
              { label: 'Phim', flex: 2.5 },
              { label: 'Đánh giá', flex: 0.8 },
              { label: 'Nội dung', flex: 3 },
              { label: 'Ngày đăng', flex: 1.2 },
              { label: 'Trạng thái', flex: 0.8 }
            ].map((col) => (
              <Typography key={col.label} sx={{
                flex: col.flex,
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'rgba(0,0,0,0.65)',
                fontFamily: font,
                textAlign: 'center'
              }}>
                {col.label}
              </Typography>
            ))}
          </Box>

          {/* Table Rows */}
          {reviews.map((review, idx) => {
            const cellSx = {
              fontSize: '0.78rem',
              color: 'rgba(0,0,0,0.7)',
              fontFamily: font,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            };

            return (
              <Box
                key={review._id || idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                  transition: 'background 0.15s',
                  minWidth: 800,
                  cursor: review.movie?.slug ? 'pointer' : 'default'
                }}
              >
                {/* STT */}
                <Typography sx={{ ...cellSx, flex: 0.4 }}>{idx + 1}</Typography>

                {/* Phim */}
                <Box sx={{ flex: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {review.movie?.posterUrl && (
                    <Box
                      component="img"
                      src={review.movie.posterUrl}
                      alt={review.movie?.title}
                      sx={{ width: 36, height: 52, objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                    />
                  )}
                  <Typography sx={{
                    ...cellSx,
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'rgba(0,0,0,0.8)'
                  }}>
                    {review.movie?.title || 'Phim đã xóa'}
                  </Typography>
                </Box>

                {/* Đánh giá */}
                <Box sx={{ flex: 0.8, display: 'flex', justifyContent: 'center' }}>
                  {renderStars(review.rating)}
                </Box>

                {/* Nội dung */}
                <Typography sx={{
                  ...cellSx,
                  flex: 3,
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontSize: '0.75rem',
                  color: 'rgba(0,0,0,0.6)'
                }}>
                  {review.content}
                </Typography>

                {/* Ngày đăng */}
                <Typography sx={{ ...cellSx, flex: 1.2, fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>
                  {formatDate(review.createdAt)}
                </Typography>

                {/* Trạng thái */}
                <Box sx={{ flex: 0.8, display: 'flex', justifyContent: 'center' }}>
                  {review.isVerified ? (
                    <Typography sx={{
                      fontSize: '0.72rem',
                      color: '#2e7d32',
                      fontFamily: font,
                      fontWeight: 700,
                      bgcolor: '#2e7d3215',
                      px: 1,
                      py: 0.3,
                      borderRadius: '12px',
                      whiteSpace: 'nowrap'
                    }}>
                      Đã xác thực
                    </Typography>
                  ) : (
                    <Typography sx={{
                      fontSize: '0.72rem',
                      color: '#9e9e9e',
                      fontFamily: font,
                      fontWeight: 600,
                      bgcolor: '#9e9e9e15',
                      px: 1,
                      py: 0.3,
                      borderRadius: '12px',
                      whiteSpace: 'nowrap'
                    }}>
                      Chưa xác thực
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
