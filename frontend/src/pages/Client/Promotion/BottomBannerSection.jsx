import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// CONSTANTS
const MAX_BANNERS = 2;

// Fallback image khi ảnh lỗi
const FALLBACK_BANNER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYW5uZXI8L3RleHQ+PC9zdmc+';

// STYLES
const styles = {
  section: {
    width: '100%',
    mt: { xs: 4, md: 6 },
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 2, md: 3 }
  },
  bannerWrapper: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 1,
    cursor: 'pointer'
  },
  bannerImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'cover'
  }
};

// COMPONENT
/**
 * Hiển thị banner nổi bật phía dưới grid ưu đãi
 * Chỉ render khi có ít nhất 1 banner, tối đa 2 banner
 */
function BottomBannerSection({ banners = [] }) {
  const navigate = useNavigate();

  // Không render nếu không có banners
  if (!banners || banners.length === 0) {
    return null;
  }

  // Handler click banner
  const handleBannerClick = (banner) => {
    if (banner.slug) {
      navigate(`/uu-dai/${banner.slug}`);
    }
  };

  // Handler lỗi ảnh
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_BANNER;
  };

  // Sort theo bannerOrder và giới hạn số lượng
  const sortedBanners = [...banners]
    .sort((a, b) => (a.bannerOrder ?? 0) - (b.bannerOrder ?? 0))
    .slice(0, MAX_BANNERS);

  return (
    <Box sx={styles.section}>
      {sortedBanners.map((banner) => {
        // Ưu tiên coverUrl, fallback thumbnailUrl
        const imageUrl = banner.coverUrl || banner.thumbnailUrl || FALLBACK_BANNER;

        return (
          <Box
            key={banner._id}
            sx={styles.bannerWrapper}
            onClick={() => handleBannerClick(banner)}
            title={banner.title}
          >
            <Box
              component="img"
              src={imageUrl}
              alt={banner.title || 'Banner ưu đãi'}
              sx={styles.bannerImage}
              onError={handleImageError}
              loading="lazy"
            />
          </Box>
        );
      })}
    </Box>
  );
}

BottomBannerSection.propTypes = {
  banners: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      slug: PropTypes.string,
      title: PropTypes.string,
      coverUrl: PropTypes.string,
      thumbnailUrl: PropTypes.string,
      bannerOrder: PropTypes.number
    })
  )
};

export default BottomBannerSection;
