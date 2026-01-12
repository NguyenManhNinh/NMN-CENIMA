import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams, useParams } from 'react-router-dom';

// Các API
import { getAllMoviesAPI } from '@/apis/movieApi';
import { getAllGenresAPI, getCategoriesAPI, getCountriesAPI, getYearsAPI, toggleGenreLikeAPI, getGenreLikeStatusAPI } from '@/apis/genreApi';

// Ngữ cảnh xác thực (Auth Context)
import { useAuth } from '@/contexts/AuthContext';

// Các thành phần giao diện từ Material UI
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

// Các biểu tượng từ Material UI
import MovieIcon from '@mui/icons-material/Movie';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// CẤU HÌNH BỘ LỌC TĨNH
// Trạng thái phim
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'NOW', label: 'Đang chiếu' },
  { value: 'COMING', label: 'Sắp chiếu' }
];

// Tùy chọn sắp xếp
const SORT_OPTIONS = [
  { value: 'views', label: 'Xem nhiều nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'rating', label: 'Thích nhiều nhất' }
];

// Danh sách quốc gia (lấy từ API)

// Danh sách năm phát hành (lấy từ API)

// CẤU HÌNH GIAO DIỆN
// Sử dụng thuộc tính sx của MUI
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
  }
};

// CÁC HÀM TIỆN ÍCH
/**
 * Format số với dấu phẩy ngăn cách hàng nghìn
 * Ví dụ: 1234567 -> "1,234,567"
 */
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};


// COMPONENT CHÍNH
function GenresPage() {
  const navigate = useNavigate();
  const { genreSlug } = useParams(); // Đọc slug từ URL path (ví dụ: /the-loai-phim/hanh-dong)
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Đọc tham số URL
  const getParamOrDefault = (param, defaultValue) => {
    const value = searchParams.get(param);
    return value || defaultValue;
  };

  // STATE dữ liệu
  const [movies, setMovies] = useState([]);
  const [sidebarMovies, setSidebarMovies] = useState([]); // Phim đang chiếu cho sidebar (độc lập với filter)
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [years, setYears] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // STATE bộ lọc - khởi tạo từ URL params (sử dụng value thay vì label)
  const [selectedGenre, setSelectedGenre] = useState(getParamOrDefault('the-loai', ''));
  const [selectedCountry, setSelectedCountry] = useState(getParamOrDefault('quoc-gia', ''));
  const [selectedYear, setSelectedYear] = useState(getParamOrDefault('nam', ''));
  const [selectedStatus, setSelectedStatus] = useState(getParamOrDefault('trang-thai', ''));
  const [selectedSort, setSelectedSort] = useState(getParamOrDefault('sap-xep', 'views'));

  // STATE phân trang - khởi tạo từ URL params
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const itemsPerPage = 15;  // Số phim hiển thị mỗi trang (mặc định 15)

  // STATE tải trang
  const [loading, setLoading] = useState(true);

  // STATE Drawer Mobile
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // STATE trạng thái Thích - track like status cho mỗi movie
  const [likeStates, setLikeStates] = useState({});
  const { user } = useAuth();

  // Xử lý Thích bài viết (Genre)
  const handleToggleLike = async (genreId, e) => {
    e.stopPropagation(); // Ngăn click lan ra card

    if (!user) {
      alert('Vui lòng đăng nhập để thích bài viết!');
      return;
    }

    try {
      const res = await toggleGenreLikeAPI(genreId);
      // Cập nhật local state - API trả về { success, liked, likeCount }
      setLikeStates(prev => ({
        ...prev,
        [genreId]: {
          liked: res?.liked,
          likeCount: res?.likeCount
        }
      }));
      // Cập nhật genre trong danh sách
      setMovies(prev => prev.map(m =>
        m._id === genreId ? { ...m, likeCount: res?.likeCount } : m
      ));
    } catch (error) {
      console.error('Toggle like failed:', error);
      if (error.response?.status === 401) {
        alert('Vui lòng đăng nhập để thích bài viết!');
      }
    }
  };

  // Đặt lại bộ lọc
  const resetFilters = () => {
    setSelectedGenre('');
    setSelectedCountry('');
    setSelectedYear('');
    setSelectedStatus('');
    setSelectedSort('views');
    setCurrentPage(1);
  };

  // Lấy danh sách categories từ API khi mount component (cho dropdown filter)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Lấy danh sách categories duy nhất từ database
        const res = await getCategoriesAPI();
        // API trả về { success, count, data: ['Hành động', 'Viễn tưởng', ...] }
        const categories = res.data || [];
        // Chuyển đổi thành format giống genres để tương thích với dropdown
        setGenres(categories.map((cat, index) => ({ _id: cat, name: cat })));
      } catch (error) {
        console.error('Lỗi khi tải danh sách thể loại:', error);
      }
    };
    fetchCategories();
  }, []);

  // Khi có genreSlug từ URL và genres đã load, tự động set filter
  useEffect(() => {
    if (genreSlug && genres.length > 0) {
      // Tìm genre theo slug hoặc tên đã được slug hóa
      const matchedGenre = genres.find(g => {
        const genreNameSlug = g.name
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .replace(/\s+/g, '-'); // Thay khoảng trắng bằng -
        return genreNameSlug === genreSlug || g.slug === genreSlug || g._id === genreSlug;
      });
      if (matchedGenre) {
        setSelectedGenre(matchedGenre._id);
      }
    }
  }, [genreSlug, genres]);

  // Lấy danh sách quốc gia từ Genre API khi mount component
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await getCountriesAPI();
        // Genre API trả về { success, count, data: ['Việt Nam', 'Mỹ', ...] }
        setCountries(res.data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách quốc gia:', error);
      }
    };
    fetchCountries();
  }, []);

  // Lấy danh sách năm từ Genre API khi mount component
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await getYearsAPI();
        // Genre API trả về { success, count, data: [2025, 2024, ...] }
        setYears(res.data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách năm:', error);
      }
    };
    fetchYears();
  }, []);

  // Lấy danh sách phim sidebar (đang chiếu, độc lập với filter chính)
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

  // Cập nhật URL khi bộ lọc thay đổi
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

  // Lấy danh sách bài viết/thể loại theo bộ lọc
  useEffect(() => {
    const fetchGenresData = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          sortBy: selectedSort || 'views'
        };

        // Thêm filters nếu có giá trị
        // Lọc theo category (Hành động, Viễn tưởng...)
        if (selectedGenre) {
          params.category = selectedGenre; // selectedGenre = category name
        }
        if (selectedCountry) params.country = selectedCountry;
        if (selectedYear) params.year = selectedYear;
        if (selectedStatus) params.status = selectedStatus;

        const res = await getAllGenresAPI(params);

        setMovies(res.data?.genres || []);
        setTotalMovies(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (error) {
        console.error('Lỗi khi tải danh sách:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGenresData();
  }, [selectedGenre, selectedCountry, selectedYear, selectedStatus, selectedSort, currentPage, genres]);

  // Chuyển hướng đến chi tiết bài viết (Genre)
  const handleMovieClick = (slug) => {
    navigate(`/phim/${slug}`);
  };

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
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

        {/* Hàng bộ lọc (Giao diện Desktop) */}
        <Box sx={styles.filterRow}>
          {/* Chọn thể loại */}
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

          {/* Chọn quốc gia */}
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

          {/* Chọn năm */}
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

          {/* Chọn trạng thái */}
          <FormControl sx={styles.filterSelect} size="small">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              displayEmpty
              renderValue={(selected) => STATUS_OPTIONS.find(s => s.value === selected)?.label || 'Tất cả'}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value || 'all'} value={status.value}>{status.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Chọn sắp xếp */}
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
          {/* Nội dung chính */}
          <Grid item xs={12} md={8}>
            {/* Danh sách phim */}
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
                  image={movie.imageUrl || movie.bannerUrl}
                  alt={movie.name}
                  onClick={() => handleMovieClick(movie.slug)}
                />
                <Box sx={styles.movieContent}>
                  <Typography
                    sx={styles.movieTitle}
                    onClick={() => handleMovieClick(movie.slug)}
                  >
                    {movie.name}
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

            {/* Trạng thái trống (đã xử lý ở trên) */}
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
                    {/* Poster phim */}
                    <Box sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      aspectRatio: '3/4',
                      borderRadius: 1,
                      bgcolor: '#f7f7f9ff',
                    }}>
                      {/* Ảnh Poster */}
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

              {/* Nút Xem thêm */}
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
