import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Material UI Components
import {
  Box,
  Container,
  Typography,
  Card,
  Select,
  MenuItem,
  FormControl,
  Button,
  Grid,
  CircularProgress,
  Drawer,
  IconButton,
} from '@mui/material';

// Material UI Icons
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import StarIcon from '@mui/icons-material/Star';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

// API calls
import { getDirectorsAPI, getNationalitiesAPI, togglePersonLikeAPI } from '@/apis/personApi';
import { getNowShowingMoviesAPI } from '@/apis/movieApi';
import SidebarMovieList from '../../../components/Common/SidebarMovieList/SidebarMovieList';

// Tùy chọn sắp xếp
const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'mostLiked', label: 'Được thích nhất' }
];

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
    background: 'url(/src/assets/images/bg-header.jpg) center top / cover no-repeat',
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
  filterRow: {
    display: { xs: 'none', md: 'flex' },
    flexWrap: 'wrap',
    gap: 2,
    mb: 4,
    pb: 2,
    borderBottom: '3px solid #1A3A5C'
  },
  filterSelect: {
    minWidth: 180,
    '& .MuiOutlinedInput-root': {
      bgcolor: '#fff',
      '& fieldset': { borderColor: '#ddd', borderRadius: 0 },
      '&:hover fieldset': { borderColor: '#ddd' },
      '&.Mui-focused fieldset': { borderColor: '#ddd', borderWidth: 1 }
    },
    '& .MuiSelect-select': {
      py: 1,
      fontSize: '0.9rem'
    }
  },
  directorCard: {
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
  // Ảnh đạo diễn - tỉ lệ 2:3 (chuẩn CGV/Galaxy)
  directorThumb: {
    width: { xs: 120, sm: 160, md: 200 },
    aspectRatio: '2 / 3',
    objectFit: 'cover',
    cursor: "pointer",
    mr: { xs: 1, md: 2 },
    flexShrink: 0,
    borderRadius: 1,
    overflow: "hidden",
    display: "block",
    bgcolor: "#1c1c1c",
  },
  directorContent: {
    flex: 1,
    py: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minWidth: 0
  },
  directorName: {
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
  directorBio: {
    fontSize: { xs: '12px', md: '14px' },
    color: '#A0A3A7',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: { xs: 3, md: 3 },
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  mobileFilterBtn: {
    display: { xs: 'flex', md: 'none' },
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '10px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '20px',
    color: '#666',
    fontWeight: 500,
    gap: 1
  },
  sidebarTitle: {
    fontWeight: 600,
    fontSize: '16px',
    color: '#1A3A5C',
    textTransform: 'uppercase',
    pl: 1.5,
    borderLeft: '3px solid #1A3A5C',
    mb: 2
  },
  sidebarMovie: {
    display: 'flex',
    gap: 1.5,
    mb: 2,
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.8
    }
  },
  sidebarPoster: {
    width: 80,
    height: 120,
    objectFit: 'cover',
    borderRadius: 1
  },
  sidebarMovieTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  }
};

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// COMPONENT CHÍNH
function FilmDirectorPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();

  // STATE dữ liệu
  const [directors, setDirectors] = useState([]);
  const [sidebarMovies, setSidebarMovies] = useState([]);
  const [nationalityOptions, setNationalityOptions] = useState([]);
  const [totalDirectors, setTotalDirectors] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // STATE bộ lọc - Khởi tạo từ URL query params
  const [selectedNationality, setSelectedNationality] = useState(
    () => searchParams.get('quoc-tich') || ''
  );
  const [selectedSort, setSelectedSort] = useState(
    () => searchParams.get('sap-xep') || 'popular'
  );

  // STATE phân trang - Khởi tạo từ URL query params
  const [currentPage, setCurrentPage] = useState(
    () => parseInt(searchParams.get('page'), 10) || 1
  );
  const itemsPerPage = 10;

  // STATE tải trang
  const [loading, setLoading] = useState(true);

  // STATE Drawer Mobile
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // STATE trạng thái Thích
  const [likeStates, setLikeStates] = useState({});
  const [likeLoading, setLikeLoading] = useState({});

  // Load danh sách quốc tịch từ API
  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        const res = await getNationalitiesAPI({ role: 'director' });
        const options = [{ value: '', label: 'Tất cả' }];
        res.data.forEach(nat => {
          options.push({ value: nat, label: nat });
        });
        setNationalityOptions(options);
      } catch (error) {
        console.error('Lỗi khi tải danh sách quốc tịch:', error);
        setNationalityOptions([{ value: '', label: 'Tất cả' }]);
      }
    };
    fetchNationalities();
  }, []);

  // Reset bộ lọc
  const resetFilters = () => {
    setSelectedNationality('');
    setSelectedSort('popular');
    setCurrentPage(1);
  };

  // Load sidebar phim đang chiếu (độc lập với directors)
  useEffect(() => {
    const fetchSidebarMovies = async () => {
      try {
        const moviesRes = await getNowShowingMoviesAPI(3);
        // API trả về { data: { movies: [...] } } hoặc { data: [...] } hoặc [...]
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
  }, []); // Chỉ fetch 1 lần khi mount

  // Load dữ liệu đạo diễn từ API
  useEffect(() => {
    const loadDirectors = async () => {
      setLoading(true);

      try {
        const sortMap = {
          'popular': '-viewCount',
          'newest': '-createdAt',
          'mostLiked': '-likeCount'
        };

        // Build API params
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          sort: sortMap[selectedSort] || '-viewCount'
        };
        if (selectedNationality) {
          params.nationality = selectedNationality;
        }

        // Fetch directors
        const directorsRes = await getDirectorsAPI(params);

        setDirectors(directorsRes.data || []);
        setTotalDirectors(directorsRes.total || 0);
        setTotalPages(directorsRes.totalPages || 1);

        // Khởi tạo likeStates từ localStorage
        const initialLikeStates = {};
        (directorsRes.data || []).forEach(director => {
          const likeKey = `director_liked_${director._id}`;
          const isLiked = localStorage.getItem(likeKey) === 'true';
          initialLikeStates[director._id] = {
            liked: isLiked,
            likeCount: director.likeCount || 0
          };
        });
        setLikeStates(initialLikeStates);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu đạo diễn:', error);
        setDirectors([]);
        setTotalDirectors(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadDirectors();
  }, [selectedNationality, selectedSort, currentPage]);

  // Cập nhật URL khi bộ lọc thay đổi (có guard tránh update dư)
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedNationality) params.set('quoc-tich', selectedNationality);
    if (selectedSort && selectedSort !== 'popular') params.set('sap-xep', selectedSort);
    if (currentPage > 1) params.set('page', currentPage.toString());

    // Guard: chỉ update nếu URL thực sự thay đổi
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedNationality, selectedSort, currentPage, searchParams, setSearchParams]);

  // Sync URL → state khi Back/Forward browser (popstate)
  useEffect(() => {
    const urlNationality = searchParams.get('quoc-tich') || '';
    const urlSort = searchParams.get('sap-xep') || 'popular';
    const urlPage = parseInt(searchParams.get('page'), 10) || 1;

    // Chỉ update state nếu URL khác với state hiện tại (tránh loop)
    if (urlNationality !== selectedNationality) {
      setSelectedNationality(urlNationality);
    }
    if (urlSort !== selectedSort) {
      setSelectedSort(urlSort);
    }
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Chỉ depend vào searchParams - khi URL thay đổi từ bên ngoài

  // Chuyển hướng đến chi tiết đạo diễn
  const handleDirectorClick = (slug) => {
    navigate(`/dao-dien-chi-tiet/${slug}`);
  };

  // Chuyển hướng đến chi tiết phim
  const handleMovieClick = (slug) => {
    navigate(`/phim/${slug}`);
  };

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xử lý Like - yêu cầu đăng nhập (giống genres)
  const handleToggleLike = async (directorId, e) => {
    e.stopPropagation();

    // Check đăng nhập
    if (!user) {
      alert('Vui lòng đăng nhập để thích đạo diễn!');
      return;
    }

    if (likeLoading[directorId]) return;

    const director = directors.find(d => d._id === directorId);
    const prevLiked = likeStates[directorId]?.liked ?? false;
    const prevCount = likeStates[directorId]?.likeCount ?? director?.likeCount ?? 0;

    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, nextLiked ? prevCount + 1 : prevCount - 1);

    setLikeLoading(prev => ({ ...prev, [directorId]: true }));

    // Optimistic update
    setLikeStates(prev => ({
      ...prev,
      [directorId]: { liked: nextLiked, likeCount: nextCount }
    }));

    // Call API (yêu cầu token)
    try {
      const res = await togglePersonLikeAPI(directorId);
      // Sync từ response backend
      setLikeStates(prev => ({
        ...prev,
        [directorId]: { liked: res.liked, likeCount: res.likeCount }
      }));
    } catch (error) {
      console.error('Lỗi khi toggle like:', error);
      const status = error.response?.status;
      // Nếu lỗi xác thực (token hết hạn) - logout ngay để tránh flicker
      if (status === 401 || status === 500) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        logout();
        return; // Không rollback vì đã logout
      }
      // Rollback on other errors
      setLikeStates(prev => ({
        ...prev,
        [directorId]: { liked: prevLiked, likeCount: prevCount }
      }));
    } finally {
      setLikeLoading(prev => ({ ...prev, [directorId]: false }));
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
          {/* Tiêu đề trang */}
          <Typography sx={styles.pageTitle}>Đạo diễn</Typography>

          {/* Mobile Filter Button */}
          <Box sx={styles.mobileFilterBtn} onClick={() => setFilterDrawerOpen(true)}>
            <FilterListIcon />
            <Typography>Bộ lọc</Typography>
          </Box>

          {/* Desktop Filter Row */}
          <Box sx={styles.filterRow}>
            {/* Dropdown Quốc tịch */}
            <FormControl sx={styles.filterSelect} size="small">
              <Select
                value={selectedNationality}
                onChange={(e) => {
                  setSelectedNationality(e.target.value);
                  setCurrentPage(1);
                }}
                displayEmpty
              >
                {nationalityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Dropdown Sắp xếp */}
            <FormControl sx={styles.filterSelect} size="small">
              <Select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Drawer for Mobile Filters */}
          <Drawer
            anchor="right"
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            PaperProps={{
              sx: { width: '85%', maxWidth: '360px', p: 2 }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>Bộ lọc tìm kiếm</Typography>
              <IconButton onClick={() => setFilterDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Quốc tịch */}
              <FormControl size="small" fullWidth>
                <Select
                  value={selectedNationality}
                  onChange={(e) => {
                    setSelectedNationality(e.target.value);
                    setCurrentPage(1);
                  }}
                  displayEmpty
                  renderValue={(selected) => !selected ? <span style={{ color: '#666' }}>Quốc gia</span> : selected}
                  sx={{ borderRadius: '4px', bgcolor: '#fff', fontSize: '15px' }}
                >
                  {nationalityOptions.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Sắp xếp */}
              <FormControl size="small" fullWidth>
                <Select
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    setCurrentPage(1);
                  }}
                  displayEmpty
                  renderValue={(selected) => SORT_OPTIONS.find(s => s.value === selected)?.label || 'Phổ biến nhất'}
                  sx={{ borderRadius: '4px', bgcolor: '#fff', fontSize: '15px' }}
                >
                  {SORT_OPTIONS.map((sort) => (
                    <MenuItem key={sort.value} value={sort.value}>{sort.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Nút hành động */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => {
                    resetFilters();
                    setFilterDrawerOpen(false);
                  }}
                >
                  Xóa bộ lọc
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: '#f5a623', color: '#fff', '&:hover': { bgcolor: '#e0961f' } }}
                  onClick={() => setFilterDrawerOpen(false)}
                >
                  Áp dụng
                </Button>
              </Box>
            </Box>
          </Drawer>

          {/* Main Content */}
          <Grid container spacing={4}>
            {/* Danh sách đạo diễn */}
            <Grid item xs={12} md={8}>
              {directors.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography sx={{ color: '#999', fontSize: '16px' }}>
                    Không tìm thấy đạo diễn phù hợp
                  </Typography>
                </Box>
              ) : (
                directors.map((director) => {
                  const liked = likeStates[director._id]?.liked || false;
                  const likeCount = likeStates[director._id]?.likeCount ?? director.likeCount ?? 0;
                  const isLoading = likeLoading[director._id] || false;
                  const bgColor = '#4285F4';

                  return (
                    <Card key={director._id} sx={styles.directorCard}>
                      {/* Ảnh đạo diễn */}
                      <Box
                        component="img"
                        src={director.photoUrl}
                        alt={director.name}
                        sx={styles.directorThumb}
                        onClick={() => handleDirectorClick(director.slug)}
                        onError={handleImageError}
                      />

                      {/* Nội dung */}
                      <Box sx={styles.directorContent}>
                        <Typography
                          sx={styles.directorName}
                          onClick={() => handleDirectorClick(director.slug)}
                        >
                          {director.name}
                        </Typography>

                        {/* Nút Like + View */}
                        <Box sx={styles.actionButtons}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<ThumbUpIcon sx={{ fontSize: { xs: 12, md: 14 } }} />}
                            onClick={(e) => handleToggleLike(director._id, e)}
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
                              {formatNumber(director.viewCount || 0)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Bio */}
                        <Typography sx={styles.directorBio}>
                          {director.shortBio || 'Chưa cập nhật tiểu sử'}
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

                <SidebarMovieList movies={sidebarMovies} />

                {/* Xem thêm button */}
                <Button
                  component={Link}
                  to="/phim-dang-chieu"
                  fullWidth
                  disableRipple
                  sx={{
                    mt: 2,
                    py: 1,
                    color: '#f5a623',
                    fontWeight: 600,
                    fontSize: '13px',
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                  }}
                >
                  Xem thêm phim →
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default FilmDirectorPage;
