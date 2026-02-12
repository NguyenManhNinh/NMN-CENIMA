import { useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import LocalActivityOutlinedIcon from '@mui/icons-material/LocalActivityOutlined';
import PropTypes from 'prop-types';
// HELPERS
/**
 * Format khoảng thời gian ưu đãi
 * @param {string} startAt - Ngày bắt đầu (ISO string)
 * @param {string} endAt - Ngày kết thúc (ISO string)
 * @returns {string} Chuỗi ngày định dạng dd/mm/yyyy
 */
const formatDateRange = (startAt, endAt) => {
  // Validate input
  if (!startAt || Number.isNaN(new Date(startAt).getTime())) {
    return '';
  }

  // Dùng UTC để tránh lệch timezone (VD: 2026-12-31T23:59Z -> 2027-01-01 ở GMT+7)
  const formatDate = (dateStr, showYear = true) => {
    const date = new Date(dateStr);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return showYear ? `${day}/${month}/${year}` : `${day}/${month}`;
  };

  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;

  if (!end) {
    return `Từ ${formatDate(startAt)}`;
  }

  // Rút gọn nếu cùng năm (dùng UTC)
  if (start.getUTCFullYear() === end.getUTCFullYear()) {
    return `${formatDate(startAt, false)} - ${formatDate(endAt)}`;
  }

  return `${formatDate(startAt)} - ${formatDate(endAt)}`;
};

// STYLES
const styles = {
  card: {
    position: 'relative',
    borderRadius: '4px',
    overflow: 'hidden',
    border: '1px solid #eee',
    bgcolor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  imageWrapper: {
    width: '100%',
    overflow: 'hidden',
    bgcolor: '#1c1c1c'
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  imageFallback: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #1c1c1c 0%, #2a2a2a 50%, #1c1c1c 100%)',
    gap: 1.5,
    aspectRatio: '16 / 9',
    minHeight: 140
  },
  fallbackIcon: {
    fontSize: '2.5rem',
    color: 'rgba(245, 166, 35, 0.6)'
  },
  fallbackText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.7rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },
  dateStrip: {
    py: 1,
    px: 1.5,
    textAlign: 'center',
    bgcolor: '#fff',
    borderTop: '1px solid #eee'
  },
  dateText: {
    fontSize: '0.75rem',
    color: '#666',
    fontWeight: 400
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: '16 / 9',
    position: 'relative',
    bgcolor: '#f0f0f0'
  },
  skeletonInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }
};

// PROMOTION CARD COMPONENT
function PromotionCard({ promotion, onClick }) {
  const { thumbnailUrl, coverUrl, startAt, endAt, title } = promotion;
  const [hasError, setHasError] = useState(false);

  // Ưu tiên thumbnailUrl, fallback coverUrl
  const imageUrl = thumbnailUrl || coverUrl || '';
  const showFallback = !imageUrl || hasError;

  return (
    <Box sx={styles.card} onClick={onClick} title={title}>
      <Box sx={styles.imageWrapper}>
        {showFallback ? (
          <Box sx={styles.imageFallback}>
            <LocalActivityOutlinedIcon sx={styles.fallbackIcon} />
            <Typography sx={styles.fallbackText}>
              Chưa có ảnh
            </Typography>
          </Box>
        ) : (
          <Box
            component="img"
            src={imageUrl}
            alt={title || 'Ưu đãi'}
            sx={styles.image}
            onError={() => setHasError(true)}
            loading="lazy"
          />
        )}
      </Box>

      <Box sx={styles.dateStrip}>
        <Typography sx={styles.dateText}>
          {formatDateRange(startAt, endAt)}
        </Typography>
      </Box>
    </Box>
  );
}

PromotionCard.propTypes = {
  promotion: PropTypes.shape({
    _id: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    coverUrl: PropTypes.string,
    startAt: PropTypes.string,
    endAt: PropTypes.string,
    title: PropTypes.string,
    slug: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func
};

// SKELETON COMPONENT
export function PromotionCardSkeleton() {
  return (
    <Box sx={styles.card}>
      <Box sx={styles.skeletonImage}>
        <Skeleton variant="rectangular" sx={styles.skeletonInner} animation="wave" />
      </Box>
      <Box sx={styles.dateStrip}>
        <Skeleton width="70%" sx={{ mx: 'auto' }} />
      </Box>
    </Box>
  );
}

export default PromotionCard;
