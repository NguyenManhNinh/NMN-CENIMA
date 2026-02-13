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

// APIs
import { getActorsAPI, getNationalitiesAPI, togglePersonLikeAPI } from '@/apis/personApi';
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
  // Container chính của trang
  wrapper: {
    minHeight: '100vh',
    background: 'url(/src/assets/images/bg-header.jpg) center top / cover no-repeat',
    py: 1
  },

  // Tiêu đề trang - "DIỄN VIÊN"
  pageTitle: {
    fontWeight: 400,
    fontSize: { xs: '18px', md: '20px' },
    color: '#4A4A4A',
    textTransform: 'uppercase',
    pl: 2,
    borderLeft: '4px solid #1A3A5C',
    mb: 3
  },

  // Hàng bộ lọc (Desktop only)
  filterRow: {
    display: { xs: 'none', md: 'flex' },
    flexWrap: 'wrap',
    gap: 2,
    mb: 4,
    pb: 2,
    borderBottom: '3px solid #1A3A5C'
  },

  // Dropdown bộ lọc
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

  // Card hiển thị thông tin diễn viên
  actorCard: {
    display: 'flex',
    mb: 3,
    flexDirection: 'row',
    gap: { xs: 1.25, md: 2 },
    overflow: 'visible',
    border: 'none',
    boxShadow: 'none',
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },

  // Avatar diễn viên - tỉ lệ 2:3 (chuẩn CGV/Galaxy)
  actorThumb: {
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


  // Nội dung diễn viên (tên, bio, nút)
  actorContent: {
    flex: 1,
    py: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minWidth: 0
  },

  // Tên diễn viên
  actorName: {
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

  // Container nút Thích và Lượt xem
  actionButtons: {
    display: 'flex',
    gap: 1,
    mb: 1,
    flexWrap: 'wrap'
  },

  // Nút Thích (xanh dương)
  likeBtn: {
    bgcolor: 'rgba(64,128,255,1)',
    color: '#fff',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: { xs: '10px', md: '12px' },
    px: { xs: 1.5, md: 2.4 },
    py: 0.5,
    minWidth: 'auto',
    height: { xs: '24px', md: '30px' },
    '&:hover': { bgcolor: 'rgba(64,128,255,0.8)' }
  },

  // Hiển thị lượt xem
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

  // Mô tả ngắn của diễn viên (tối đa 3 dòng)
  actorBio: {
    fontSize: { xs: '12px', md: '14px' },
    color: '#A0A3A7',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: { xs: 3, md: 3 },
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  // Nút bộ lọc trên Mobile
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

  // Sidebar title
  sidebarTitle: {
    fontWeight: 600,
    fontSize: '16px',
    color: '#1A3A5C',
    textTransform: 'uppercase',
    pl: 1.5,
    borderLeft: '3px solid #1A3A5C',
    mb: 2
  },

  // Sidebar movie item
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
// HÀM TIỆN ÍCH
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
// COMPONENT CHÍNH
function ActorsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();

  // STATE dữ liệu
  const [actors, setActors] = useState([]);
  const [sidebarMovies, setSidebarMovies] = useState([]);
  const [nationalityOptions, setNationalityOptions] = useState([]);
  const [totalActors, setTotalActors] = useState(0);
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
  // STATE loading per-item khi call API like (chống spam click)
  const [likeLoading, setLikeLoading] = useState({});

  // Load danh sách quốc tịch từ API (chỉ chạy 1 lần khi mount)
  useEffect(() => {
    const loadNationalities = async () => {
      try {
        const res = await getNationalitiesAPI({ role: 'actor' });
        const options = [{ value: '', label: 'Tất cả' }];
        if (res?.data) {
          res.data.forEach(nat => {
            options.push({ value: nat, label: nat });
          });
        }
        setNationalityOptions(options);
      } catch (error) {
        console.error('Lỗi khi tải danh sách quốc tịch:', error);
        setNationalityOptions([{ value: '', label: 'Tất cả' }]);
      }
    };
    loadNationalities();
  }, []);

  // Đặt lại bộ lọc
  const resetFilters = () => {
    setSelectedNationality('');
    setSelectedSort('popular');
    setCurrentPage(1);
  };

  // Load dữ liệu từ API khi mount hoặc thay đổi filter
  useEffect(() => {
    const loadActors = async () => {
      setLoading(true);
      try {
        // Map sort UI -> API sort param
        const sortMap = {
          'popular': '-viewCount',
          'newest': '-createdAt',
          'mostLiked': '-likeCount'
        };

        const params = {
          page: currentPage,
          limit: itemsPerPage,
          sort: sortMap[selectedSort] || '-viewCount',
          ...(selectedNationality && { nationality: selectedNationality })
        };

        // Call APIs song song
        const [actorsRes, moviesRes] = await Promise.all([
          getActorsAPI(params),
          getNowShowingMoviesAPI(5)
        ]);

        // Cập nhật state với data từ API
        setActors(actorsRes.data || []);
        setTotalActors(actorsRes.total || 0);
        setTotalPages(actorsRes.totalPages || 1);
        setSidebarMovies(Array.isArray(moviesRes?.data?.movies) ? moviesRes.data.movies : []);

        // Khởi tạo likeStates từ localStorage
        const initialLikeStates = {};
        (actorsRes.data || []).forEach(actor => {
          const likeKey = `actor_liked_${actor._id}`;
          const isLiked = localStorage.getItem(likeKey) === 'true';
          initialLikeStates[actor._id] = {
            liked: isLiked,
            likeCount: actor.likeCount || 0
          };
        });
        setLikeStates(initialLikeStates);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu diễn viên:', error);
        // Reset state nếu API lỗi
        setActors([]);
        setTotalActors(0);
        setTotalPages(1);
        setSidebarMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadActors();
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

  // Chuyển hướng đến chi tiết diễn viên
  const handleActorClick = (slug) => {
    navigate(`/dien-vien-chi-tiet/${slug}`);
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

  // Xử lý Like - Call API + lưu localStorage (chống spam + optimistic + rollback)
  const handleToggleLike = async (actorId, e) => {
    e.stopPropagation();

    // Check đăng nhập
    if (!user) {
      alert('Vui lòng đăng nhập để thích diễn viên!');
      return;
    }

    // Chống spam click - nếu đang loading thì bỏ qua
    if (likeLoading[actorId]) return;

    const actor = actors.find(a => a._id === actorId);
    const prevLiked = likeStates[actorId]?.liked ?? false;
    const prevCount = likeStates[actorId]?.likeCount ?? actor?.likeCount ?? 0;

    // Tính trạng thái mới
    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, nextLiked ? prevCount + 1 : prevCount - 1);

    // Set loading cho item này
    setLikeLoading(prev => ({ ...prev, [actorId]: true }));

    // Optimistic update UI
    setLikeStates(prev => ({
      ...prev,
      [actorId]: { liked: nextLiked, likeCount: nextCount }
    }));

    // Call API (yêu cầu token)
    try {
      const res = await togglePersonLikeAPI(actorId);
      // Sync từ response backend
      setLikeStates(prev => ({
        ...prev,
        [actorId]: { liked: res.liked, likeCount: res.likeCount }
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
      // Rollback về trạng thái trước
      setLikeStates(prev => ({
        ...prev,
        [actorId]: { liked: prevLiked, likeCount: prevCount }
      }));
    } finally {
      // Clear loading
      setLikeLoading(prev => ({ ...prev, [actorId]: false }));
    }
  };

  // GIAO DIỆN
  // Màn hình chờ
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
        {/* Logo */}
        <Box
          component="img"
          src="/NMN_CENIMA_LOGO.png"
          alt="NMN Cinema"
          sx={{ width: 200, height: 200, mb: 1.5, objectFit: 'contain' }}
        />

        {/* Spinning Loader */}
        <CircularProgress
          size={40}
          thickness={2}
          sx={{ color: '#F5A623', mb: 2 }}
        />

        {/* Loading Text */}
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
          <Typography sx={styles.pageTitle}>Diễn viên</Typography>

          {/* Mobile Filter Button */}
          <Box sx={styles.mobileFilterBtn} onClick={() => setFilterDrawerOpen(true)}>
            <FilterListIcon />
            <Typography>Phân loại / Lọc</Typography>
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
                  onChange={(e) => setSelectedNationality(e.target.value)}
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
                  onChange={(e) => setSelectedSort(e.target.value)}
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

          {/* Hàng bộ lọc (Desktop) */}
          <Box sx={styles.filterRow}>
            {/* Chọn quốc tịch */}
            <FormControl sx={styles.filterSelect} size="small">
              <Select
                value={selectedNationality}
                onChange={(e) => setSelectedNationality(e.target.value)}
                displayEmpty
                renderValue={(selected) => selected || 'Quốc gia'}
              >
                {nationalityOptions.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Chọn sắp xếp */}
            <FormControl sx={styles.filterSelect} size="small">
              <Select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                displayEmpty
                renderValue={(selected) => SORT_OPTIONS.find(s => s.value === selected)?.label || 'Phổ biến nhất'}
              >
                {SORT_OPTIONS.map((sort) => (
                  <MenuItem key={sort.value} value={sort.value}>{sort.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Grid chính: Danh sách + Sidebar */}
          <Grid container spacing={3}>
            {/* Nội dung chính - Danh sách diễn viên */}
            <Grid item xs={12} md={8}>
              {actors.length === 0 && !loading && (
                <Typography sx={{ textAlign: 'center', color: '#999', py: 4 }}>
                  Không tìm thấy diễn viên nào phù hợp với bộ lọc.
                </Typography>
              )}

              {actors.map((actor) => (
                <Card key={actor._id} sx={styles.actorCard}>
                  {/* Avatar diễn viên */}
                  <Box
                    component="img"
                    src={actor.photoUrl}
                    alt={actor.name}
                    onError={handleImageError}
                    sx={styles.actorThumb}
                    onClick={() => handleActorClick(actor.slug)}
                  />

                  {/* Thông tin diễn viên */}
                  <Box sx={styles.actorContent}>
                    {/* Tên diễn viên */}
                    <Typography
                      sx={styles.actorName}
                      onClick={() => handleActorClick(actor.slug)}
                    >
                      {actor.name}
                    </Typography>

                    {/* Nút Like + View */}
                    <Box sx={styles.actionButtons}>
                      <Button
                        variant="contained"
                        disableRipple
                        disableElevation
                        disabled={likeLoading[actor._id]}
                        startIcon={<ThumbUpIcon />}
                        sx={{
                          ...styles.likeBtn,
                          bgcolor: '#4285F4',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: '#4285F4',
                            boxShadow: 'none'
                          },
                          '&:active': {
                            bgcolor: '#4285F4',
                            boxShadow: 'none'
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#4285F4',
                            color: '#fff',
                            opacity: 0.7
                          }
                        }}
                        size="small"
                        onClick={(e) => handleToggleLike(actor._id, e)}
                      >
                        {formatNumber(likeStates[actor._id]?.likeCount ?? actor.likeCount ?? 0)}
                      </Button>
                      <Box sx={styles.viewCount}>
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                        <span>{formatNumber(actor.viewCount || 0)}</span>
                      </Box>
                    </Box>

                    {/* Tiểu sử ngắn */}
                    <Typography sx={styles.actorBio}>
                      {actor.shortBio}
                    </Typography>
                  </Box>
                </Card>
              ))}

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

export default ActorsPage;
