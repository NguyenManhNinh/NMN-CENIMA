import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// MUI Components
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Breadcrumbs,
  CircularProgress
} from '@mui/material';

// Icons
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// APIs
import { getFeaturedArticleBySlugAPI, toggleFeaturedLikeAPI, incrementFeaturedViewAPI } from '@/apis/featuredApi';
import { getNowShowingMoviesAPI } from '@/apis/movieApi';
import { getAllGenresAPI } from '@/apis/genreApi';

// Constants
const COLORS = {
  primary: '#034EA2',
  orange: '#F5A623',
  dark: '#1a1a2e',
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
  white: '#FFFFFF',
  border: '#E5E5E5',
  bgLight: '#F8F9FA'
};

const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = FALLBACK_IMAGE;
};

// Convert any YouTube URL to embed format
const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;

  // Already embed format
  if (url.includes('/embed/')) return url;

  let videoId = null;

  // Format: https://youtu.be/VIDEO_ID or https://youtu.be/VIDEO_ID?si=xxx
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split(/[?&#]/)[0];
  }
  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  else if (url.includes('youtube.com/watch')) {
    const urlParams = new URL(url).searchParams;
    videoId = urlParams.get('v');
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

function FeaturedDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // States
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [relatedGenres, setRelatedGenres] = useState([]);

  // Like states
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch article
        const articleRes = await getFeaturedArticleBySlugAPI(slug);
        const articleData = articleRes?.data;

        if (!articleData) {
          setArticle(null);
          return;
        }

        // Increment view count - 24h cooldown với localStorage
        if (articleData?._id) {
          const viewKey = `featured_view_${articleData._id}`;
          const lastViewTime = localStorage.getItem(viewKey);
          const now = Date.now();
          const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h

          // Chỉ gọi API nếu chưa view trong 24h
          if (!lastViewTime || (now - parseInt(lastViewTime, 10)) > COOLDOWN_MS) {
            // Set localStorage TRƯỚC khi gọi API để chặn double call (React StrictMode)
            localStorage.setItem(viewKey, now.toString());
            try {
              const viewRes = await incrementFeaturedViewAPI(articleData._id);
              // Luôn cập nhật viewCount từ server (dù incremented hay không)
              if (viewRes?.viewCount !== undefined) {
                articleData.viewCount = viewRes.viewCount;
              }
            } catch (err) {
              // Rollback localStorage nếu API fail
              localStorage.removeItem(viewKey);
              console.error('Lỗi tăng view:', err);
            }
          }
        }

        setArticle(articleData);

        // Check if user has liked this article
        if (user && articleData.likedBy?.includes(user._id)) {
          setIsLiked(true);
        }

        // Fetch now showing movies for sidebar
        try {
          const moviesRes = await getNowShowingMoviesAPI(5);
          setNowShowingMovies(moviesRes?.data?.movies || []);
        } catch (err) {
          console.error('Lỗi tải phim đang chiếu:', err);
        }

        // Fetch 4 newest genres for "Tin liên quan" từ trang thể loại
        try {
          const genresRes = await getAllGenresAPI({ limit: 4, sortBy: 'newest' });
          setRelatedGenres(genresRes?.data?.genres || []);
        } catch (err) {
          console.error('Lỗi tải tin liên quan:', err);
        }

      } catch (error) {
        console.error('Lỗi tải bài viết:', error);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug, user]);

  // Add fallback error handler for images in HTML content
  useEffect(() => {
    if (!article?.content) return;

    // Find the content container and attach error handlers to all images
    const contentContainer = document.querySelector('[data-content-area]');
    if (contentContainer) {
      const images = contentContainer.querySelectorAll('img');
      images.forEach(img => {
        img.onerror = () => {
          img.onerror = null;
          img.src = FALLBACK_IMAGE;
        };
      });
    }
  }, [article?.content]);

  // Like handler
  const handleToggleLike = async () => {
    if (!article?._id) return;

    if (!user) {
      alert('Vui lòng đăng nhập để thích bài viết!');
      return;
    }

    if (likeLoading) return;

    const currentLiked = isLiked;
    const prevCount = article.likeCount || 0;

    setLikeLoading(true);

    // Optimistic update
    const newLiked = !currentLiked;
    setIsLiked(newLiked);
    setArticle(prev => ({
      ...prev,
      likeCount: currentLiked ? Math.max(prevCount - 1, 0) : prevCount + 1
    }));

    try {
      const res = await toggleFeaturedLikeAPI(article._id);
      setIsLiked(res.liked);
      setArticle(prev => ({
        ...prev,
        likeCount: res.likeCount ?? prev.likeCount
      }));
    } catch (error) {
      console.error('Lỗi toggle like:', error);
      if (error.response?.status === 401) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        logout();
        return;
      }
      // Rollback
      setIsLiked(currentLiked);
      setArticle(prev => ({ ...prev, likeCount: prevCount }));
    } finally {
      setLikeLoading(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          bgcolor: '#1a1a2e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <Box
          component="img"
          src="/NMN_CENIMA_LOGO.png"
          alt="NMN Cinema"
          sx={{ width: 200, height: 200, mb: 1.5, objectFit: 'contain' }}
        />
        <CircularProgress size={40} thickness={2} sx={{ color: '#F5A623', mb: 2 }} />
        <Typography sx={{ color: '#FFA500', fontSize: '1.2rem', fontWeight: 600 }}>
          Đang tải...
        </Typography>
      </Box>
    );
  }

  // Not found
  if (!article) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6" gutterBottom>Không tìm thấy bài viết</Typography>
        <Button onClick={() => navigate('/phim-hay')} variant="outlined">
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ background: 'url(/src/assets/images/bg-header.jpg) center top / cover no-repeat', minHeight: '100vh', py: 1 }}>
      <Container maxWidth="lg">

        <Box sx={{ bgcolor: '#fff', borderRadius: 0, p: { xs: 2, md: 3 } }}>
          {/* Breadcrumbs */}
          <Box sx={{ pb: 2 }}>
            <Breadcrumbs separator="/">
              <Link to="/" style={{ textDecoration: 'none', color: COLORS.textMuted, fontSize: '14px' }}>
                Trang chủ
              </Link>
              <Link to="/phim-hay" style={{ textDecoration: 'none', color: COLORS.textMuted, fontSize: '14px' }}>
                Phim Hay Tháng
              </Link>
              <Typography sx={{ color: COLORS.text, fontSize: '14px', fontWeight: 500 }}>
                {article.title}
              </Typography>
            </Breadcrumbs>
          </Box>

          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>

              {/* Title */}
              <Typography sx={{
                fontWeight: 700,
                fontSize: { xs: '1.4rem', md: '1.7rem' },
                color: COLORS.dark,
                mb: 2,
                lineHeight: 1.3
              }}>
                {article.title}
              </Typography>

              {/* Like + View buttons */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleToggleLike}
                  disabled={likeLoading}
                  disableRipple
                  disableElevation
                  startIcon={<ThumbUpIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    backgroundColor: 'rgba(64,128,255,1)',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '13px',
                    px: 2,
                    py: 0.5,
                    borderRadius: '4px',
                    boxShadow: 'none',
                    '&:hover': { backgroundColor: 'rgba(64,128,255,1)', boxShadow: 'none' }
                  }}
                >
                  {article.likeCount?.toLocaleString() || 0}
                </Button>

                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  px: 1.5,
                  fontSize: '13px',
                  height: '32px'
                }}>
                  <VisibilityIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: 'inherit' }}>
                    {article.viewCount?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>

              {/* Excerpt/Description - hiển thị trước video */}
              {article.excerpt && (
                <Typography
                  component="div"
                  sx={{
                    mb: 3,
                    lineHeight: 1.8,
                    fontSize: '15px',
                    color: COLORS.text,
                    textAlign: 'justify',
                    '& strong': { color: COLORS.primary, fontWeight: 700 }
                  }}
                  dangerouslySetInnerHTML={{ __html: article.excerpt }}
                />
              )}

              {/* Video Embed OR Thumbnail */}
              {article.videoUrl && !videoError ? (
                <Box sx={{ mb: 3, overflow: 'hidden', position: 'relative' }}>
                  <Box
                    component="iframe"
                    src={getYoutubeEmbedUrl(article.videoUrl)}
                    title={article.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onError={() => setVideoError(true)}
                    sx={{
                      width: '100%',
                      aspectRatio: '16/9',
                      border: 'none'
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ mb: 3, overflow: 'hidden', position: 'relative' }}>
                  <Box
                    component="img"
                    src={article.thumbnail}
                    alt={article.title}
                    onError={handleImageError}
                    sx={{
                      width: '100%',
                      aspectRatio: '16/9',
                      objectFit: 'cover'
                    }}
                  />
                  {/* Play button overlay nếu có video nhưng bị lỗi */}
                  {article.videoUrl && videoError && (
                    <Box
                      component="a"
                      href={article.videoUrl.replace('/embed/', '/watch?v=')}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        borderRadius: '50%',
                        width: 70,
                        height: 70,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: COLORS.primary,
                          transform: 'translate(-50%, -50%) scale(1.1)'
                        }
                      }}
                    >
                      <PlayArrowIcon sx={{ fontSize: 40 }} />
                    </Box>
                  )}
                </Box>
              )}

              {/* Article Content (HTML) */}
              <Box
                data-content-area
                sx={{
                  // Paragraph styling
                  '& p': {
                    mb: 2,
                    lineHeight: 1.8,
                    fontSize: '15px',
                    color: COLORS.text,
                    textAlign: 'justify'
                  },
                  // Image styling - centered like Galaxy reference
                  '& img': {
                    maxWidth: '80%',
                    height: 'auto',
                    my: 3,
                    display: 'block',
                    mx: 'auto' // Center image
                  },
                  // Headings - no borderBottom, clean style
                  '& h2': {
                    mt: 4,
                    mb: 2,
                    color: COLORS.primary,
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  },
                  '& h3': {
                    mt: 3,
                    mb: 2,
                    color: COLORS.dark,
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  },
                  // Links
                  '& a': { color: COLORS.primary, textDecoration: 'none' },
                  '& a:hover': { textDecoration: 'underline' },
                  // YouTube video iframe
                  '& iframe': {
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '16/9',
                    borderRadius: 1,
                    my: 2,
                    border: 'none'
                  },
                  // Video container (responsive)
                  '& .video-container, & .youtube-embed': {
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '56.25%', // 16:9
                    height: 0,
                    mb: 3,
                    '& iframe': {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }
                  },
                  // List styling
                  '& ul, & ol': {
                    pl: 3,
                    mb: 2
                  },
                  '& li': {
                    mb: 1,
                    lineHeight: 1.7
                  },
                  // Blockquote
                  '& blockquote': {
                    borderLeft: `4px solid ${COLORS.primary}`,
                    pl: 2,
                    py: 1,
                    my: 2,
                    bgcolor: COLORS.bgLight,
                    fontStyle: 'italic'
                  },
                  // Strong/Bold
                  '& strong, & b': {
                    fontWeight: 600,
                    color: COLORS.dark
                  },
                  // Movie item styling (numbered list with images)
                  '& .movie-item': {
                    display: 'flex',
                    gap: 2,
                    mb: 3,
                    p: 2,
                    bgcolor: COLORS.bgLight,
                    borderRadius: 1,
                    '& img': {
                      width: '200px',
                      height: 'auto',
                      objectFit: 'cover',
                      borderRadius: 1,
                      flexShrink: 0
                    }
                  }
                }}
                dangerouslySetInnerHTML={{ __html: article.content || article.excerpt || '' }}
              />

              {/* TIN LIÊN QUAN - Lấy từ Thể loại phim */}
              {relatedGenres.length > 0 && (
                <Box sx={{ mt: 5 }}>
                  <Typography sx={{
                    fontWeight: 700,
                    fontSize: '1.3rem',
                    color: COLORS.primary,
                    mb: 2,
                    pl: 1.5,
                    borderLeft: `3px solid ${COLORS.primary}`,
                    textTransform: 'uppercase'
                  }}>
                    Tin liên quan
                  </Typography>

                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                    gap: 2
                  }}>
                    {relatedGenres.slice(0, 4).map((genre) => (
                      <Link
                        key={genre._id}
                        to={`/the-loai-phim/${genre.slug}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Box sx={{
                          overflow: 'hidden',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-4px)' }
                        }}>
                          <Box
                            component="img"
                            src={genre.imageUrl}
                            alt={genre.name}
                            onError={handleImageError}
                            sx={{
                              width: '100%',
                              aspectRatio: '16/9',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                          <Typography sx={{
                            fontSize: '14px',
                            color: COLORS.text,
                            mt: 1.5,
                            fontWeight: 600,
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {genre.name}
                          </Typography>
                        </Box>
                      </Link>
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            {/* Sidebar - Only Now Showing Movies */}
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper sx={{ p: 2, position: 'sticky', top: 10 }} elevation={0}>
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#4A4A4A',
                  mb: 2,
                  textTransform: 'uppercase'
                }}>
                  Phim đang chiếu
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {nowShowingMovies.slice(0, 3).map((movie) => (
                    <Box
                      key={movie._id}
                      component={Link}
                      to={`/dat-ve/${movie.slug}`}
                      sx={{
                        textDecoration: 'none',
                        display: 'block',
                        '&:hover .movie-overlay': { opacity: 1 }
                      }}
                    >
                      {/* Poster phim */}
                      <Box sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        aspectRatio: '16/9',
                        borderRadius: 1,
                        bgcolor: '#f7f7f9ff',
                      }}>
                        <Box
                          component="img"
                          src={movie.bannerUrl || movie.posterUrl}
                          alt={movie.title}
                          onError={handleImageError}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            bgcolor: '#f7f7f9ff'
                          }}
                        />

                        {/* Badge đánh giá */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: 6,
                          right: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          {/* Độ tuổi */}
                          <Box sx={{
                            bgcolor: '#f5a623',
                            px: 0.75,
                            py: 0.25,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '10px' }}>
                              {movie.ageRating || 'P'}
                            </Typography>
                          </Box>
                          {/* Đánh giá sao */}
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.25,
                            px: 0.75,
                            py: 0.25
                          }}>
                            <Typography sx={{ color: '#f5a623', fontWeight: 700, fontSize: '10px' }}>★</Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '10px' }}>
                              {movie.rating?.toFixed(1) || '0'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Overlay khi hover */}
                        <Box
                          className="movie-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s'
                          }}
                        >
                          <Button
                            variant="contained"
                            sx={{
                              bgcolor: '#f5a623',
                              color: '#fff',
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '12px',
                              px: 2,
                              py: 0.5,
                              '&:hover': { bgcolor: '#e09520' }
                            }}
                          >
                            Mua vé
                          </Button>
                        </Box>
                      </Box>

                      {/* Tiêu đề phim */}
                      <Typography sx={{
                        mt: 0.75,
                        fontWeight: 600,
                        fontSize: '13px',
                        color: '#333333',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {movie.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Xem thêm */}
                <Button
                  component={Link}
                  to="/phim-dang-chieu"
                  fullWidth
                  disableRipple
                  sx={{
                    mt: 2,
                    py: 1,
                    color: COLORS.primary,
                    fontWeight: 600,
                    fontSize: '13px',
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'transparent' }
                  }}
                  endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
                >
                  Xem thêm
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>

      </Container>
    </Box>
  );
}

export default FeaturedDetailPage;
