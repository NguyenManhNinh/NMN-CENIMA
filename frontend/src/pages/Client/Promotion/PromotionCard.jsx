import { Box, Typography, Skeleton } from '@mui/material';
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

// Fallback image khi ảnh lỗi
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2FhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
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
    bgcolor: '#f5f5f5',
    aspectRatio: '16 / 9'
  },
  image: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover'
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

  // Ưu tiên thumbnailUrl, fallback coverUrl
  const imageUrl = thumbnailUrl || coverUrl || '';

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE;
  };

  return (
    <Box sx={styles.card} onClick={onClick} title={title}>
      <Box sx={styles.imageWrapper}>
        <Box
          component="img"
          src={imageUrl}
          alt={title || 'Ưu đãi'}
          sx={styles.image}
          onError={handleImageError}
          loading="lazy"
        />
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
