import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

// APIs
import { getAllMoviesAPI, getCountriesAPI, getYearsAPI, toggleLikeAPI, getLikeStatusAPI } from '@/apis/movieApi';
import { getAllGenresAPI } from '@/apis/genreApi';

// Auth Context
import { useAuth } from '@/contexts/AuthContext';

// MUI Components
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  Select,
  MenuItem,
  FormControl,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Drawer,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';

// MUI Icons
import MovieIcon from '@mui/icons-material/Movie';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// CẤU HÌNH BỘ LỌC TĨNH (Static Filter Options)

// Trạng thái phim (không cần lấy từ API)
const STATUS_OPTIONS = [
  { value: '', label: 'Đang Chiếu/' },
  { value: 'NOW', label: 'Đang chiếu' },
  { value: 'COMING', label: 'Sắp chiếu' }
];

// Tùy chọn sắp xếp
const SORT_OPTIONS = [
  { value: 'views', label: 'Xem nhiều nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'rating', label: 'Thích nhiều nhất' }
];

// Danh sách quốc gia sẽ được fetch từ API

// Danh sách năm phát hành sẽ được fetch từ API

// CẤU HÌNH GIAO DIỆN (STYLES)
// Sử dụng MUI sx prop
const styles = {
  // Container chính của trang
  wrapper: {
    minHeight: '100vh',
    bgcolor: '#fff',
    py: { xs: 2, md: 4 }
  },

  // Tiêu đề trang - "THẾ GIỚI ĐIỆN ẢNH"
  pageTitle: {
    fontWeight: 400,
    fontSize: { xs: '18px', md: '20px' },
    color: '#4A4A4A',
    textTransform: 'uppercase',
    pl: 2,
    borderLeft: '4px solid #1A3A5C',
    mb: 3
  },

  // Hàng bộ lọc (Thể loại, Quốc gia, Năm...) -> Desktop only
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
    minWidth: 217,
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

  // Card hiển thị thông tin phim
  movieCard: {
    display: 'flex',
    mb: 3,
    overflow: 'visible',
    border: 'none',
    boxShadow: 'none',
    borderRadius: 0,
    flexDirection: { xs: 'row', md: 'row' }, // Mobile vẫn ngang
    alignItems: 'flex-start'
  },

  // Poster phim
  moviePoster: {
    width: { xs: '140px', sm: '180px', md: '255px' },
    height: { xs: '210px', sm: '270px', md: '155px' }, // Mobile: Portrait, Desktop: Landscape? Check user templates. Template looks portrait in mobile list usually, but code was 255x155 (Landscape).
    // User Image 0 shows Landscape poster in the list.
    // Let's stick to Landscape ratios but smaller if that's what desktop had, OR switch to Portrait if that matches the request.
    // But current code had 255x155 (Landscape).
    // Let's look at Image 0 again. It looks like Landscape posters.
    // I will keep Landscape ratio but responsive.
    width: { xs: '150px', sm: '200px', md: '255px' },
    height: { xs: '90px', sm: '120px', md: '155px' },
    objectFit: 'cover',
    flexShrink: 0,
    cursor: 'pointer',
    boxShadow: 'none',
    border: 'none',
    borderRadius: 0,
    marginRight: 2
  },

  // Nội dung phim (tiêu đề, mô tả, nút)
  movieContent: {
    flex: 1,
    py: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minWidth: 0 // Prevent text overflow
  },

  // Tiêu đề phim
  movieTitle: {
    fontWeight: 700,
    fontSize: { xs: '15px', md: '18px' },
    color: '#1A1A2E',
    mt: 0,
    mb: 0.5,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
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

  // Mô tả ngắn của phim (tối đa 3 dòng)
  movieDescription: {
    fontSize: { xs: '12px', md: '14px' },
    color: '#A0A3A7',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: { xs: 2, md: 3 }, // Mobile 2 dòng
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  // Mobile Filter Button style
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
  }
};

// HÀM TIỆN ÍCH (UTILITIES)
/**
 * Format số với dấu phẩy ngăn cách hàng nghìn
 * Ví dụ: 1234567 -> "1,234,567"
 */
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};


// COMPONENT CHÍNH - TRANG THỂ LOẠI PHIM
function GenresPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Đọc URL params khi load trang
  const getParamOrDefault = (param, defaultValue) => {
    const value = searchParams.get(param);
    return value || defaultValue;
  };

  // STATE DỮ LIỆU TỪ API
  const [movies, setMovies] = useState([]);
  const [sidebarMovies, setSidebarMovies] = useState([]); // Phim đang chiếu cho sidebar (độc lập với filter)
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [years, setYears] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // STATE QUẢN LÝ BỘ LỌC - khởi tạo từ URL params (sử dụng value thay vì label)
  const [selectedGenre, setSelectedGenre] = useState(getParamOrDefault('the-loai', ''));
  const [selectedCountry, setSelectedCountry] = useState(getParamOrDefault('quoc-gia', ''));
  const [selectedYear, setSelectedYear] = useState(getParamOrDefault('nam', ''));
  const [selectedStatus, setSelectedStatus] = useState(getParamOrDefault('trang-thai', ''));
  const [selectedSort, setSelectedSort] = useState(getParamOrDefault('sap-xep', 'views'));

  // STATE PHÂN TRANG - khởi tạo từ URL params
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const itemsPerPage = 15;  // Số phim hiển thị mỗi trang (mặc định 15)

  // STATE LOADING
  const [loading, setLoading] = useState(true);

  // STATE DRAWER CHO MOBILE
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // STATE LIKE - track like status cho mỗi movie
  const [likeStates, setLikeStates] = useState({});
  const { user } = useAuth();

  // HÀM TOGGLE LIKE cho từng movie card
  const handleToggleLike = async (movieId, e) => {
    e.stopPropagation(); // Ngăn click lan ra card

    if (!user) {
      alert('Vui lòng đăng nhập để thích phim!');
      return;
    }

    try {
      const res = await toggleLikeAPI(movieId);
      // Cập nhật local state
      setLikeStates(prev => ({
        ...prev,
        [movieId]: {
          liked: res?.data?.liked,
          likeCount: res?.data?.likeCount
        }
      }));
      // Cập nhật movie trong danh sách
      setMovies(prev => prev.map(m =>
        m._id === movieId ? { ...m, likeCount: res?.data?.likeCount } : m
      ));
    } catch (error) {
      console.error('Toggle like failed:', error);
      if (error.response?.status === 401) {
        alert('Vui lòng đăng nhập để thích phim!');
      }
    }
  };

  // HÀM RESET BỘ LỌC
  const resetFilters = () => {
    setSelectedGenre('');
    setSelectedCountry('');
    setSelectedYear('');
    setSelectedStatus('');
    setSelectedSort('views');
    setCurrentPage(1);
  };

  // Fetch genres từ API khi mount component
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await getAllGenresAPI();
        // API trả về { success, count, data: [...] }
        setGenres(res.data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách thể loại:', error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch countries từ API khi mount component
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await getCountriesAPI();
        setCountries(res.data?.countries || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách quốc gia:', error);
      }
    };
    fetchCountries();
  }, []);

  // Fetch years từ API khi mount component
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await getYearsAPI();
        setYears(res.data?.years || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách năm:', error);
      }
    };
    fetchYears();
  }, []);

  // Fetch phim đang chiếu cho sidebar (độc lập với filter chính)
  useEffect(() => {
    const fetchSidebarMovies = async () => {
      try {
        const res = await getAllMoviesAPI({ status: 'NOW', limit: 5, sortBy: 'views' });
        setSidebarMovies(res.data?.movies || []);
      } catch (error) {
        console.error('Lỗi khi tải phim đang chiếu cho sidebar:', error);
      }
    };
    fetchSidebarMovies();
  }, []);

  // Cập nhật URL khi filter hoặc page thay đổi
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedGenre) params.set('the-loai', selectedGenre);
    if (selectedCountry) params.set('quoc-gia', selectedCountry);
    if (selectedYear) params.set('nam', selectedYear);
    if (selectedStatus) params.set('trang-thai', selectedStatus);
    if (selectedSort && selectedSort !== 'views') params.set('sap-xep', selectedSort);
    if (currentPage > 1) params.set('page', currentPage.toString());

    setSearchParams(params, { replace: true });
  }, [selectedGenre, selectedCountry, selectedYear, selectedStatus, selectedSort, currentPage, setSearchParams]);

  // Fetch movies từ API khi filter hoặc page thay đổi
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          sortBy: selectedSort || 'views'
        };

        // Thêm filters nếu có giá trị
        if (selectedGenre) params.genre = selectedGenre;
        if (selectedCountry) params.country = selectedCountry;
        if (selectedYear) params.year = selectedYear;
        if (selectedStatus) params.status = selectedStatus;

        const res = await getAllMoviesAPI(params);

        setMovies(res.data?.movies || []);
        setTotalMovies(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (error) {
        console.error('Lỗi khi tải danh sách phim:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [selectedGenre, selectedCountry, selectedYear, selectedStatus, selectedSort, currentPage]);

  // Xử lý click vào phim -> chuyển đến trang chi tiết phim
  const handleMovieClick = (movieId) => {
    navigate(`/phim/${movieId}`);
  };

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
  };

  // GIAO DIỆN HIỂN THỊ
  // Loading state
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
          sx={{
            color: '#F5A623',
            mb: 2
          }}
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
          Chờ tôi xíu nhé
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.wrapper}>
      <Container maxWidth="lg">
        {/* Tiêu đề trang */}
        <Typography sx={styles.pageTitle}>Thế giới phim ảnh</Typography>

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
            {/* Thể loại - từ API */}
            <FormControl size="small" fullWidth>
              <Select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                displayEmpty
                renderValue={(selected) => !selected ? <span style={{ color: '#666' }}>Thể Loại</span> : genres.find(g => g._id === selected)?.name || selected}
                sx={{
                  borderRadius: '4px',
                  bgcolor: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' },
                  fontSize: '15px'
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {genres.map((genre) => (
                  <MenuItem key={genre._id} value={genre._id}>{genre.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Quốc gia - từ API */}
            <FormControl size="small" fullWidth>
              <Select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                displayEmpty
                renderValue={(selected) => !selected ? <span style={{ color: '#666' }}>Quốc Gia</span> : selected}
                sx={{ borderRadius: '4px', bgcolor: '#fff', fontSize: '15px' }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>{country}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Năm - từ API */}
            <FormControl size="small" fullWidth>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                displayEmpty
                renderValue={(selected) => !selected ? <span style={{ color: '#666' }}>Năm</span> : selected}
                sx={{ borderRadius: '4px', bgcolor: '#fff', fontSize: '15px' }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Trạng thái - static */}
            <FormControl size="small" fullWidth>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                displayEmpty
                renderValue={(selected) => !selected ? <span style={{ color: '#666' }}>Đang Chiếu/ Sắp Chiếu</span> : STATUS_OPTIONS.find(s => s.value === selected)?.label || selected}
                sx={{ borderRadius: '4px', bgcolor: '#fff', fontSize: '15px' }}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value || 'all'} value={status.value}>{status.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sắp xếp - static */}
            <FormControl size="small" fullWidth>
              <Select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                displayEmpty
                renderValue={(selected) => SORT_OPTIONS.find(s => s.value === selected)?.label || 'Xem nhiều nhất'}
                sx={{ borderRadius: '4px', bgcolor: '#fff', fontSize: '15px' }}
              >
                {SORT_OPTIONS.map((sort) => (
                  <MenuItem key={sort.value} value={sort.value}>{sort.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

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

        {/* Hàng bộ lọc (Thể loại, Quốc gia, Năm...) - Desktop */}
        <Box sx={styles.filterRow}>
          {/* Thể loại - từ API */}
          <FormControl sx={styles.filterSelect} size="small">
            <Select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              displayEmpty
              renderValue={(selected) => !selected ? 'Thể Loại' : genres.find(g => g._id === selected)?.name || 'Thể Loại'}
            >
              <MenuItem value="">Thể Loại</MenuItem>
              {genres.map((genre) => (
                <MenuItem key={genre._id} value={genre._id}>{genre.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quốc gia - từ API */}
          <FormControl sx={styles.filterSelect} size="small">
            <Select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              displayEmpty
              renderValue={(selected) => selected || 'Quốc Gia'}
            >
              <MenuItem value="">Quốc Gia</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Năm - từ API */}
          <FormControl sx={styles.filterSelect} size="small">
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              displayEmpty
              renderValue={(selected) => selected || 'Năm'}
            >
              <MenuItem value="">Năm</MenuItem>
              {years.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Trạng thái */}
          <FormControl sx={styles.filterSelect} size="small">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              displayEmpty
              renderValue={(selected) => STATUS_OPTIONS.find(s => s.value === selected)?.label || 'Đang Chiếu/'}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value || 'all'} value={status.value}>{status.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Sắp xếp */}
          <FormControl sx={styles.filterSelect} size="small">
            <Select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              displayEmpty
              renderValue={(selected) => SORT_OPTIONS.find(s => s.value === selected)?.label || 'Xem nhiều nhất'}
            >
              {SORT_OPTIONS.map((sort) => (
                <MenuItem key={sort.value} value={sort.value}>{sort.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Movies List */}
            {movies.length === 0 && !loading && (
              <Typography sx={{ textAlign: 'center', color: '#999', py: 4 }}>
                Không tìm thấy phim nào phù hợp với bộ lọc.
              </Typography>
            )}
            {movies.map((movie) => (
              <Card key={movie._id} sx={styles.movieCard}>
                <CardMedia
                  component="img"
                  sx={styles.moviePoster}
                  image={movie.posterUrl}
                  alt={movie.title}
                  onClick={() => handleMovieClick(movie._id)}
                />
                <Box sx={styles.movieContent}>
                  <Typography
                    sx={styles.movieTitle}
                    onClick={() => handleMovieClick(movie._id)}
                  >
                    {movie.title}
                  </Typography>

                  {/* Action Buttons */}
                  <Box sx={styles.actionButtons}>
                    <Button
                      variant="contained"
                      startIcon={<ThumbUpIcon />}
                      sx={{
                        ...styles.likeBtn,
                        bgcolor: likeStates[movie._id]?.liked ? '#034EA2' : '#4285F4',
                        '&:hover': {
                          bgcolor: likeStates[movie._id]?.liked ? '#023B7A' : '#3367D6'
                        }
                      }}
                      size="small"
                      onClick={(e) => handleToggleLike(movie._id, e)}
                    >
                      {likeStates[movie._id]?.likeCount ?? movie.likeCount ?? 0}
                    </Button>
                    <Box sx={styles.viewCount}>
                      <VisibilityIcon sx={{ fontSize: 18 }} />
                      <span>{formatNumber(movie.viewCount || 0)}</span>
                    </Box>
                  </Box>

                  <Typography sx={styles.movieDescription}>
                    {movie.description}
                  </Typography>
                </Box>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 0.5,
                mt: 3,
                mb: 2
              }}>
                {/* First */}
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
                {/* Prev */}
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

                {/* Ellipsis */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <Box sx={{ px: 1, color: '#666' }}>...</Box>
                )}

                {/* Last page number */}
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

                {/* Next */}
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
                {/* Last */}
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

            {/* Empty State - Already handled above in movies list */}
          </Grid>

          {/* Sidebar - Phim đang chiếu */}
          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              {/* Title */}
              <Typography sx={{
                fontWeight: 600,
                fontSize: '18px',
                color: '#4A4A4A',
                mb: 2,
                textTransform: 'uppercase'
              }}>
                Phim đang chiếu
              </Typography>

              {/* Movie Cards - Vertical Layout */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sidebarMovies.slice(0, 3).map((movie) => (
                  <Box
                    key={movie._id}
                    component={Link}
                    to={`/dat-ve/${movie._id}`}
                    sx={{
                      textDecoration: 'none',
                      display: 'block',
                      '&:hover .movie-overlay': {
                        opacity: 1
                      }
                    }}
                  >
                    {/* Poster Container with Overlay */}
                    <Box sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      aspectRatio: '3/4',
                      borderRadius: 1,
                      bgcolor: '#f7f7f9ff',
                    }}>
                      {/* Poster Image */}
                      <Box
                        component="img"
                        src={movie.posterUrl}
                        alt={movie.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          bgcolor: '#f7f7f9ff'
                        }}
                      />

                      {/* Combined Rating Badge - Bottom Right */}
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
                        {/* Age Rating */}
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

                        {/* Star Rating */}
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

                      {/* Hover Overlay with "Mua vé" button */}
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

                    {/* Movie Title - Below Poster */}
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
                  color: '#1A3A5C',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  '&:hover': {
                    bgcolor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                Xem thêm →
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default GenresPage;
