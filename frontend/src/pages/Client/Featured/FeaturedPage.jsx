import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Material UI Components
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';

// Material UI Icons
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import StarIcon from '@mui/icons-material/Star';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

// API calls
import { getFeaturedArticlesAPI, toggleFeaturedLikeAPI } from '@/apis/featuredApi';
import { getNowShowingMoviesAPI } from '@/apis/movieApi';

// Fallback image (data URI - không cần network request, chặn loop onError)
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

// Helper: Xử lý lỗi ảnh - chặn infinite loop
const handleImageError = (e) => {
  e.target.onerror = null; // Chặn loop nếu fallback cũng fail
  e.target.src = FALLBACK_IMAGE;
};

// CẤU HÌNH GIAO DIỆN (STYLES)
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'url(/src/assets/images/bg-header.jpg) center top / cover no-repeat fixed',
    py: 1
  },
  pageTitle: {
    fontWeight: 400,
    fontSize: { xs: '18px', md: '20px' },
    color: '#4A4A4A',
    textTransform: 'uppercase',
    pl: 2,
    borderLeft: '4px solid #1A3A5C',
    mb: 3
  },
  // Đường kẻ dưới tiêu đề (không có filter)
  titleBorder: {
    borderBottom: '3px solid #1A3A5C',
    pb: 2,
    mb: 4
  },
  articleCard: {
    display: 'flex',
    mb: 3,
    flexDirection: 'row',
    gap: { xs: 1.25, md: 2 },
    overflow: 'visible',
    border: 'none',
    boxShadow: 'none',
    borderRadius: 0,
    alignItems: 'flex-start'
  },
  articleThumb: {
    width: { xs: 120, sm: 160, md: 300 },
    aspectRatio: "16/9",
    cursor: "pointer",
    mr: { xs: 1, md: 2 },
    flexShrink: 0,
    border: "none",
    borderRadius: 0.7,
    overflow: "hidden",
    objectFit: "cover",
    display: "block",
    bgcolor: "#f7f7f9ff",
  },
  articleContent: {
    flex: 1,
    py: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minWidth: 0
  },
  articleTitle: {
    fontWeight: 700,
    fontSize: { xs: '15px', md: '18px' },
    color: '#1A1A2E',
    mt: 0,
    mb: 0.5,
    cursor: 'pointer',
    whiteSpace: 'normal',
    WebkitLineClamp: { xs: 2, md: 1 },
    WebkitBoxOrient: "vertical",
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  actionButtons: {
    display: 'flex',
    gap: 1,
    mb: 1,
    flexWrap: 'wrap'
  },
  viewCount: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.2,
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: 1,
    px: 1,
    py: 0.2,
    fontSize: { xs: '10px', md: '12px' },
    height: { xs: '24px', md: '30px' },
    cursor: 'pointer',
  },
  articleExcerpt: {
    fontSize: { xs: '12px', md: '14px' },
    color: '#A0A3A7',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: { xs: 3, md: 3 },
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  sidebarTitle: {
    fontWeight: 600,
    fontSize: '16px',
    color: '#1A3A5C',
    textTransform: 'uppercase',
    pl: 1.5,
    borderLeft: '3px solid #1A3A5C',
    mb: 2
  }
};

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// COMPONENT CHÍNH
function FeaturedPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();

  // STATE dữ liệu
  const [articles, setArticles] = useState([]);
  const [sidebarMovies, setSidebarMovies] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // STATE phân trang - Khởi tạo từ URL query params
  const [currentPage, setCurrentPage] = useState(
    () => parseInt(searchParams.get('page'), 10) || 1
  );
  const itemsPerPage = 10;

  // STATE tải trang
  const [loading, setLoading] = useState(true);

  // STATE trạng thái Thích
  const [likeStates, setLikeStates] = useState({});
  const [likeLoading, setLikeLoading] = useState({});

  // Load sidebar phim đang chiếu (độc lập)
  useEffect(() => {
    const fetchSidebarMovies = async () => {
      try {
        const moviesRes = await getNowShowingMoviesAPI(3);
        let movies = [];
        if (Array.isArray(moviesRes)) {
          movies = moviesRes;
        } else if (moviesRes.data?.movies) {
          movies = moviesRes.data.movies;
        } else if (Array.isArray(moviesRes.data)) {
          movies = moviesRes.data;
        }
        setSidebarMovies(movies);
      } catch (error) {
        console.error('Lỗi khi tải phim đang chiếu:', error);
        setSidebarMovies([]);
      }
    };
    fetchSidebarMovies();
  }, []);

  // Load dữ liệu bài viết từ API
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);

      try {
        // Build API params
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          sort: '-createdAt' // Mặc định sắp xếp theo mới nhất
        };

        // Fetch articles
        const articlesRes = await getFeaturedArticlesAPI(params);

        setArticles(articlesRes.data || []);
        setTotalArticles(articlesRes.total || 0);
        setTotalPages(articlesRes.totalPages || 1);

        // Khởi tạo likeStates từ localStorage
        const initialLikeStates = {};
        (articlesRes.data || []).forEach(article => {
          const likeKey = `featured_liked_${article._id}`;
          const isLiked = localStorage.getItem(likeKey) === 'true';
          initialLikeStates[article._id] = {
            liked: isLiked,
            likeCount: article.likeCount || 0
          };
        });
        setLikeStates(initialLikeStates);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu bài viết:', error);
        setArticles([]);
        setTotalArticles(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [currentPage]);

  // Cập nhật URL khi phân trang thay đổi
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [currentPage, searchParams, setSearchParams]);

  // Sync URL → state khi Back/Forward browser
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page'), 10) || 1;
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Chuyển hướng đến chi tiết bài viết
  const handleArticleClick = (slug) => {
    navigate(`/phim-hay/${slug}`);
  };

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xử lý Like - yêu cầu đăng nhập
  const handleToggleLike = async (articleId, e) => {
    e.stopPropagation();

    if (!user) {
      alert('Vui lòng đăng nhập để thích bài viết!');
      return;
    }

    if (likeLoading[articleId]) return;

    const article = articles.find(a => a._id === articleId);
    const prevLiked = likeStates[articleId]?.liked ?? false;
    const prevCount = likeStates[articleId]?.likeCount ?? article?.likeCount ?? 0;

    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, nextLiked ? prevCount + 1 : prevCount - 1);

    setLikeLoading(prev => ({ ...prev, [articleId]: true }));

    // Optimistic update
    setLikeStates(prev => ({
      ...prev,
      [articleId]: { liked: nextLiked, likeCount: nextCount }
    }));

    try {
      const res = await toggleFeaturedLikeAPI(articleId);
      setLikeStates(prev => ({
        ...prev,
        [articleId]: { liked: res.liked, likeCount: res.likeCount }
      }));
      // Lưu vào localStorage
      localStorage.setItem(`featured_liked_${articleId}`, res.liked.toString());
    } catch (error) {
      console.error('Lỗi khi toggle like:', error);
      const status = error.response?.status;
      if (status === 401 || status === 500) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        logout();
        return;
      }
      // Rollback on error
      setLikeStates(prev => ({
        ...prev,
        [articleId]: { liked: prevLiked, likeCount: prevCount }
      }));
    } finally {
      setLikeLoading(prev => ({ ...prev, [articleId]: false }));
    }
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
        <Typography
          sx={{
            color: '#FFA500',
            fontSize: '1.2rem',
            fontWeight: 600,
            fontFamily: '"Montserrat","Poppins", "Google Sans", sans-serif',
            letterSpacing: '0.5px'
          }}
        >
          Đang tải...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.wrapper}>
      <Container maxWidth="lg">
        <Box sx={{ bgcolor: '#fff', borderRadius: 0, p: { xs: 2, md: 3 } }}>
          {/* Tiêu đề trang + đường kẻ */}
          <Box sx={styles.titleBorder}>
            <Typography sx={styles.pageTitle}>Phim hay tháng</Typography>
          </Box>

          {/* Main Content */}
          <Grid container spacing={4}>
            {/* Danh sách bài viết */}
            <Grid item xs={12} md={8}>
              {articles.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography sx={{ color: '#999', fontSize: '16px' }}>
                    Chưa có bài viết nào
                  </Typography>
                </Box>
              ) : (
                articles.map((article) => {
                  const liked = likeStates[article._id]?.liked || false;
                  const likeCount = likeStates[article._id]?.likeCount ?? article.likeCount ?? 0;
                  const isLoading = likeLoading[article._id] || false;
                  const bgColor = '#4285F4';

                  return (
                    <Card key={article._id} sx={styles.articleCard}>
                      {/* Ảnh bài viết */}
                      <Box
                        component="img"
                        src={article.thumbnail}
                        alt={article.title}
                        sx={styles.articleThumb}
                        onClick={() => handleArticleClick(article.slug)}
                        onError={handleImageError}
                      />

                      {/* Nội dung */}
                      <Box sx={styles.articleContent}>
                        <Typography
                          sx={styles.articleTitle}
                          onClick={() => handleArticleClick(article.slug)}
                        >
                          {article.title}
                        </Typography>

                        {/* Nút Like + View */}
                        <Box sx={styles.actionButtons}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<ThumbUpIcon sx={{ fontSize: { xs: 12, md: 14 } }} />}
                            onClick={(e) => handleToggleLike(article._id, e)}
                            disabled={isLoading}
                            disableRipple
                            disableElevation
                            sx={{
                              bgcolor: bgColor,
                              color: '#fff',
                              textTransform: 'none',
                              fontWeight: 500,
                              fontSize: { xs: '10px', md: '12px' },
                              px: { xs: 1.5, md: 2.4 },
                              py: 0.5,
                              minWidth: 'auto',
                              height: { xs: '24px', md: '30px' },
                              boxShadow: 'none',
                              '&:hover': { bgcolor: bgColor, boxShadow: 'none' },
                              '&:active': { bgcolor: bgColor, boxShadow: 'none' },
                              '&:focus': { bgcolor: bgColor },
                              '&.Mui-focusVisible': { bgcolor: bgColor, boxShadow: 'none' },
                              '&.Mui-disabled': { bgcolor: bgColor, color: '#fff', opacity: 0.7 }
                            }}
                          >
                            {formatNumber(likeCount)}
                          </Button>

                          <Box sx={styles.viewCount}>
                            <VisibilityIcon sx={{ fontSize: { xs: 12, md: 14 } }} />
                            <Typography sx={{ fontSize: 'inherit' }}>
                              {formatNumber(article.viewCount || 0)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Mô tả ngắn */}
                        <Typography sx={styles.articleExcerpt}>
                          {article.excerpt || 'Chưa có mô tả'}
                        </Typography>
                      </Box>
                    </Card>
                  );
                })
              )}

              {/* Phân trang */}
              {totalPages > 1 && (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 3,
                  mb: 2
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
                      cursor: currentPage === 1 ? 'default' : 'pointer',
                      color: currentPage === 1 ? '#ccc' : '#666',
                      fontSize: '14px'
                    }}
                  >
                    «
                  </Box>
                  {/* Trang trước */}
                  <Box
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    sx={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: currentPage === 1 ? 'default' : 'pointer',
                      color: currentPage === 1 ? '#ccc' : '#666',
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
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
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
                          bgcolor: currentPage === pageNum ? '#f5a623' : 'transparent',
                          color: currentPage === pageNum ? '#fff' : '#666',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: currentPage === pageNum ? 600 : 400,
                          '&:hover': {
                            bgcolor: currentPage === pageNum ? '#f5a623' : '#f0f0f0'
                          }
                        }}
                      >
                        {pageNum}
                      </Box>
                    );
                  })}

                  {/* Dấu ba chấm (...) */}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <Box sx={{ px: 1, color: '#666' }}>...</Box>
                  )}

                  {/* Trang cuối cùng */}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
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
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    sx={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: currentPage === totalPages ? 'default' : 'pointer',
                      color: currentPage === totalPages ? '#ccc' : '#666',
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
                      cursor: currentPage === totalPages ? 'default' : 'pointer',
                      color: currentPage === totalPages ? '#ccc' : '#666',
                      fontSize: '14px'
                    }}
                  >
                    »
                  </Box>
                </Box>
              )}
            </Grid>

            {/* Thanh bên - Phim đang chiếu */}
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ position: 'sticky', top: 100 }}>
                {/* Tiêu đề */}
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#4A4A4A',
                  mb: 2,
                  textTransform: 'uppercase'
                }}>
                  Phim đang chiếu
                </Typography>

                {/* Thẻ phim - Dọc */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(Array.isArray(sidebarMovies) ? sidebarMovies : []).slice(0, 3).map((movie) => (
                    <Box
                      key={movie._id}
                      component={Link}
                      to={`/dat-ve/${movie.slug}`}
                      sx={{
                        textDecoration: 'none',
                        display: 'block',
                        '&:hover .movie-overlay': {
                          opacity: 1
                        }
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
                        {/* Ảnh Poster */}
                        <Box
                          component="img"
                          src={movie.bannerUrl || movie.posterUrl}
                          alt={movie.title}
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
                            <Typography sx={{
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '10px'
                            }}>
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
                            <StarIcon sx={{ fontSize: 12, color: '#f5a623' }} />
                            <Typography sx={{
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '10px'
                            }}>
                              {movie.rating?.toFixed(1) || '0'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Overlay khi hover */}
                        <Box
                          className="movie-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
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
                            startIcon={<ConfirmationNumberIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              bgcolor: '#f5a623',
                              color: '#fff',
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '12px',
                              px: 2,
                              py: 0.5,
                              '&:hover': {
                                bgcolor: '#e09520'
                              }
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
                {/* Xem thêm button */}
                <Button
                  component={Link}
                  to="/phim-dang-chieu"
                  fullWidth
                  disableRipple
                  sx={{
                    mt: 2,
                    py: 1,
                    color: '#1A3A5C',
                    fontWeight: 600,
                    fontSize: '13px',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'transparent'
                    }
                  }}
                  endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
                >
                  Xem thêm
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default FeaturedPage;
