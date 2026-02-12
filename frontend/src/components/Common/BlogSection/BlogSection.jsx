import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Skeleton
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

// APIs
import { getAllGenresAPI } from '../../../apis/genreApi';
import { getActorsAPI, getDirectorsAPI } from '../../../apis/personApi';

// STYLES
const styles = {
  section: {
    py: 5
  },
  sectionHeader: {
    display: 'flex',
    alignItems: { xs: 'flex-start', md: 'center' },
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 2, md: 3 },
    mb: 3
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: { xs: '1.25rem', md: '1.5rem' },
    color: '#EA3B92',
    textTransform: 'uppercase',
    pl: 2,
    borderLeft: '4px solid #00405d',
    letterSpacing: 1
  },
  tabs: {
    minHeight: 'auto',
    '& .MuiTab-root': {
      fontWeight: 700,
      fontSize: '1rem',
      textTransform: 'none',
      color: '#858e8fff',
      minHeight: 'auto',
      py: 0.5,
      px: 2,
      outline: 'none',
      '&:focus': {
        outline: 'none'
      },
      '&.Mui-selected': {
        color: '#EA3B92'
      },
      '&.Mui-focusVisible': {
        outline: 'none',
        boxShadow: 'none'
      }
    },
    '& .MuiTabs-indicator': {
      display: 'none'
    }
  },
  // Card lớn bên trái
  featuredCard: {
    cursor: 'pointer',
    '&:hover .featured-image': {
      transform: 'scale(1.03)'
    }
  },
  featuredImageContainer: {
    overflow: 'hidden',
    borderRadius: 1,
    aspectRatio: '16/9',
    backgroundColor: '#e0e0e0'
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    transition: 'transform 0.3s'
  },
  featuredTitle: {
    fontWeight: 700,
    fontSize: '1.25rem',
    color: '#fff',
    mt: 2,
    lineHeight: 1.4
  },
  // Card nhỏ bên phải
  smallCard: {
    display: 'flex',
    gap: 2,
    cursor: 'pointer',
    mb: 2,
    '&:hover .small-image': {
      transform: 'scale(1.03)'
    }
  },
  smallImageContainer: {
    flexShrink: 0,
    width: 140,
    overflow: 'hidden',
    borderRadius: 1,
    aspectRatio: '16/9',
    backgroundColor: '#e0e0e0'
  },
  smallImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    transition: 'transform 0.3s'
  },
  smallTitle: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#fff',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  // Stats (likes, views)
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mt: 1
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.7)'
  },
  statIcon: {
    fontSize: '0.9rem'
  },
  // Like button
  likeButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 600,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.25)'
    }
  },
  // View more button
  viewMoreButton: {
    border: '1px solid #FFFF33',
    color: '#FFFF33',
    textTransform: 'none',
    fontWeight: 600,
    mt: 3,
    px: 4,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)'
    }
  }
};

// Tab constants
const TAB_GENRES = 0;
const TAB_ACTORS = 1;
const TAB_DIRECTORS = 2;

// BLOG SECTION COMPONENT
function BlogSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TAB_GENRES);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Thể loại phim', 'Diễn viên', 'Đạo diễn'];

  // Load data theo tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let response;

        switch (activeTab) {
          case TAB_GENRES:
            response = await getAllGenresAPI();
            // Backend trả về { success: true, data: { genres: [...] } }
            const genresData = response?.data?.genres || response?.data || [];
            if (Array.isArray(genresData) && genresData.length > 0) {
              // Sử dụng trực tiếp dữ liệu từ Genre
              setItems(genresData.slice(0, 4).map(genre => ({
                _id: genre._id,
                slug: genre.slug,
                title: genre.name,
                imageUrl: genre.imageUrl,
                viewCount: genre.viewCount || 0,
                likeCount: genre.likeCount || 0
              })));
            } else {
              setItems([]);
            }
            break;

          case TAB_ACTORS:
            response = await getActorsAPI({ limit: 4 });
            // Backend trả về { success: true, data: [...] }
            const actorsData = response?.data;
            if (Array.isArray(actorsData) && actorsData.length > 0) {
              setItems(actorsData.map(p => ({
                _id: p._id,
                slug: p.slug,
                title: p.name,
                imageUrl: p.photoUrl,
                viewCount: p.viewCount || 0,
                likeCount: p.likeCount || 0
              })));
            } else {
              setItems([]);
            }
            break;

          case TAB_DIRECTORS:
            response = await getDirectorsAPI({ limit: 4 });
            // Backend trả về { success: true, data: [...] }
            const directorsData = response?.data;
            if (Array.isArray(directorsData) && directorsData.length > 0) {
              setItems(directorsData.map(p => ({
                _id: p._id,
                slug: p.slug,
                title: p.name,
                imageUrl: p.photoUrl,
                viewCount: p.viewCount || 0,
                likeCount: p.likeCount || 0
              })));
            } else {
              setItems([]);
            }
            break;

          default:
            setItems([]);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleItemClick = (item) => {
    // Helper function to create slug from name
    const createSlug = (name) => {
      return name
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    };

    const slug = item.slug || createSlug(item.title);

    switch (activeTab) {
      case TAB_GENRES:
        navigate(`/the-loai-phim/${slug}`);
        break;
      case TAB_ACTORS:
        navigate(`/dien-vien/${slug}`);
        break;
      case TAB_DIRECTORS:
        navigate(`/dao-dien/${slug}`);
        break;
      default:
        break;
    }
  };

  const getViewMoreUrl = () => {
    switch (activeTab) {
      case TAB_GENRES:
        return '/the-loai-phim';
      case TAB_ACTORS:
        return '/dien-vien';
      case TAB_DIRECTORS:
        return '/dao-dien';
      default:
        return '/the-loai-phim';
    }
  };

  const getPlaceholderImage = () => {
    switch (activeTab) {
      case TAB_GENRES:
        return 'https://placehold.co/800x450/1a3a5c/ffffff?text=Genre';
      case TAB_ACTORS:
      case TAB_DIRECTORS:
        return 'https://placehold.co/800x450/1a3a5c/ffffff?text=Person';
      default:
        return 'https://placehold.co/800x450/1a3a5c/ffffff?text=No+Image';
    }
  };

  const featuredItem = items[0];
  const smallItems = items.slice(1, 4);

  // Render skeleton loading
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
        <Skeleton width="80%" sx={{ mt: 2 }} />
        <Skeleton width="40%" />
      </Grid>
      <Grid item xs={12} md={5}>
        {[1, 2, 3].map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" width={140} height={80} sx={{ borderRadius: 1 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="100%" />
              <Skeleton width="60%" />
            </Box>
          </Box>
        ))}
      </Grid>
    </Grid>
  );

  // Không hiển thị section nếu không có data
  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <Box sx={styles.section}>
      <Container maxWidth="lg">
        {/* Header + Tabs */}
        <Box sx={styles.sectionHeader}>
          <Typography variant="h5" component="h2" sx={styles.sectionTitle}>
            GÓC ĐIỆN ẢNH
          </Typography>

          <Tabs value={activeTab} onChange={handleTabChange} sx={styles.tabs}>
            {categories.map((cat, idx) => (
              <Tab key={idx} label={cat} disableRipple disableFocusRipple />
            ))}
          </Tabs>
        </Box>

        {/* Loading hoặc Content */}
        {loading ? renderSkeletons() : (
          <Grid container spacing={3}>
            {/* Featured Item - Left */}
            <Grid item xs={12} md={7}>
              {featuredItem && (
                <Box
                  sx={styles.featuredCard}
                  onClick={() => handleItemClick(featuredItem)}
                >
                  <Box sx={styles.featuredImageContainer}>
                    <Box
                      component="img"
                      src={featuredItem.imageUrl || getPlaceholderImage()}
                      alt={featuredItem.title}
                      className="featured-image"
                      sx={styles.featuredImage}
                      draggable={false}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getPlaceholderImage();
                      }}
                    />
                  </Box>

                  <Typography sx={styles.featuredTitle}>
                    {featuredItem.title}
                  </Typography>

                  <Box sx={styles.stats}>
                    <Chip
                      icon={<ThumbUpIcon sx={{ fontSize: '0.9rem !important' }} />}
                      label={featuredItem.likeCount || 0}
                      size="small"
                      sx={styles.likeButton}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Box sx={styles.statItem}>
                      <ViewIcon sx={styles.statIcon} />
                      <span>{featuredItem.viewCount || 0}</span>
                    </Box>
                  </Box>
                </Box>
              )}
            </Grid>

            {/* Small Items - Right */}
            <Grid item xs={12} md={5}>
              {smallItems.map((item) => (
                <Box
                  key={item._id}
                  sx={styles.smallCard}
                  onClick={() => handleItemClick(item)}
                >
                  <Box sx={styles.smallImageContainer}>
                    <Box
                      component="img"
                      src={item.imageUrl || getPlaceholderImage()}
                      alt={item.title}
                      className="small-image"
                      sx={styles.smallImage}
                      draggable={false}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getPlaceholderImage();
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={styles.smallTitle}>
                      {item.title}
                    </Typography>

                    <Box sx={styles.stats}>
                      <Chip
                        icon={<ThumbUpIcon sx={{ fontSize: '0.8rem !important' }} />}
                        label={item.likeCount || 0}
                        size="small"
                        sx={{ ...styles.likeButton, height: 24 }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Box sx={styles.statItem}>
                        <ViewIcon sx={styles.statIcon} />
                        <span>{item.viewCount || 0}</span>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Grid>
          </Grid>
        )}

        {/* View More Button */}
        {items.length > 0 && (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              sx={{
                ...styles.viewMoreButton,
                fontSize: '1rem',
              }}
              onClick={() => navigate(getViewMoreUrl())}
            >
              Xem thêm
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default BlogSection;
