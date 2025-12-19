/**
 * BLOG SECTION - Góc điện ảnh (Galaxy Cinema Style)
 * Layout: 1 bài viết lớn bên trái + 3 bài viết nhỏ bên phải
 * Tỷ lệ ảnh chuẩn 16:9 để không bị cắt xén
 */

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
  Chip
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Visibility as ViewIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

// Mock data
import { mockBlogs, getBlogsByCategory } from '../../../mocks/mockBlogs';

// STYLES
const styles = {
  section: {
    py: 5,
    backgroundColor: '#fff'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    mb: 3
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: { xs: '1.25rem', md: '1.5rem' },
    color: '#1a3a5c',
    textTransform: 'uppercase',
    pl: 2,
    borderLeft: '4px solid #1a3a5c',
    letterSpacing: 1
  },
  tabs: {
    minHeight: 'auto',
    '& .MuiTab-root': {
      fontWeight: 700,
      fontSize: '1rem',
      textTransform: 'none',
      color: '#666',
      minHeight: 'auto',
      py: 0.5,
      px: 2,
      outline: 'none',
      '&:focus': {
        outline: 'none'
      },
      '&.Mui-selected': {
        color: '#1a3a5c'
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
    aspectRatio: '16/9'
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
    color: '#333',
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
    aspectRatio: '16/9'
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
    color: '#333',
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
    color: '#666'
  },
  statIcon: {
    fontSize: '0.9rem'
  },
  // Like button
  likeButton: {
    backgroundColor: '#e8f4ff',
    color: '#1a3a5c',
    fontSize: '0.75rem',
    fontWeight: 600,
    '&:hover': {
      backgroundColor: '#d0e8ff'
    }
  },
  // View more button
  viewMoreButton: {
    border: '1px solid #1a3a5c',
    color: '#1a3a5c',
    textTransform: 'none',
    fontWeight: 600,
    mt: 3,
    px: 4,
    '&:hover': {
      backgroundColor: '#f5f5f5'
    }
  }
};

// BLOG SECTION COMPONENT
function BlogSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [blogs, setBlogs] = useState([]);

  const categories = ['Thể loại phim', 'Diễn viên, Đạo diễn'];

  useEffect(() => {
    const categoryBlogs = getBlogsByCategory(categories[activeTab]);
    setBlogs(categoryBlogs);
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const featuredBlog = blogs[0];
  const smallBlogs = blogs.slice(1, 4);

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
              <Tab key={idx} label={cat} />
            ))}
          </Tabs>
        </Box>

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Featured Article - Left */}
          <Grid item xs={12} md={7}>
            {featuredBlog && (
              <Box
                sx={styles.featuredCard}
                onClick={() => handleBlogClick(featuredBlog._id)}
              >
                <Box sx={styles.featuredImageContainer}>
                  <Box
                    component="img"
                    src={featuredBlog.imageUrl}
                    alt={featuredBlog.title}
                    className="featured-image"
                    sx={styles.featuredImage}
                    draggable={false}
                    onError={(e) => {
                      e.target.src = '/images/default-blog.jpg';
                    }}
                  />
                </Box>

                <Typography sx={styles.featuredTitle}>
                  {featuredBlog.title}
                </Typography>

                <Box sx={styles.stats}>
                  <Chip
                    icon={<ThumbUpIcon sx={{ fontSize: '0.9rem !important' }} />}
                    label="Thích"
                    size="small"
                    sx={styles.likeButton}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Box sx={styles.statItem}>
                    <ViewIcon sx={styles.statIcon} />
                    <span>{featuredBlog.views}</span>
                  </Box>
                </Box>
              </Box>
            )}
          </Grid>

          {/* Small Articles - Right */}
          <Grid item xs={12} md={5}>
            {smallBlogs.map((blog) => (
              <Box
                key={blog._id}
                sx={styles.smallCard}
                onClick={() => handleBlogClick(blog._id)}
              >
                <Box sx={styles.smallImageContainer}>
                  <Box
                    component="img"
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="small-image"
                    sx={styles.smallImage}
                    draggable={false}
                    onError={(e) => {
                      e.target.src = '/images/default-blog.jpg';
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={styles.smallTitle}>
                    {blog.title}
                  </Typography>

                  <Box sx={styles.stats}>
                    <Chip
                      icon={<ThumbUpIcon sx={{ fontSize: '0.8rem !important' }} />}
                      label="Thích"
                      size="small"
                      sx={{ ...styles.likeButton, height: 24 }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Box sx={styles.statItem}>
                      <ViewIcon sx={styles.statIcon} />
                      <span>{blog.views}</span>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Grid>
        </Grid>

        {/* View More Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            endIcon={<ArrowIcon />}
            sx={styles.viewMoreButton}
            onClick={() => navigate('/blog')}
          >
            Xem thêm
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default BlogSection;
