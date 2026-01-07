import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

// Chỗ thêm MUI
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
  CircularProgress
} from '@mui/material';

// Chỗ thêm MUI Icons
import MovieIcon from '@mui/icons-material/Movie';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

// ============================================
// DỮ LIỆU MẪu (MOCK DATA)
// Sử dụng tạm thời, sẽ thay bằng API thực tế
// ============================================

// Danh sách thể loại phim
const MOCK_GENRES = ['Tất cả', 'Hành động', 'Kinh dị', 'Hài', 'Tình cảm', 'Hoạt hình', 'Khoa học viễn tưởng'];

// Danh sách quốc gia sản xuất
const MOCK_COUNTRIES = ['Tất cả', 'Việt Nam', 'Mỹ', 'Hàn Quốc', 'Trung Quốc', 'Nhật Bản'];

// Danh sách năm phát hành
const MOCK_YEARS = ['Tất cả', '2026', '2025', '2024', '2023', '2022'];

// Trạng thái phim
const MOCK_STATUS = ['Tất cả', 'Đang chiếu', 'Sắp chiếu'];

// Tùy chọn sắp xếp
const MOCK_SORT = ['Xem nhiều nhất', 'Mới nhất', 'Thích nhiều nhất'];

const MOCK_MOVIES = [
  {
    id: 1,
    title: 'Avengers: Endgame',
    posterUrl: 'https://www.galaxycine.vn/media/2019/4/10/640wx396h_1554864314405.jpg',
    description: 'Cú búng tay của Thanos đã khiến toàn bộ dân số biến mất một nửa. Các siêu anh hùng đánh mất bạn bè, người thân và đánh mất cả chính mình. Bộ sáu Avengers đầu tiên từ tan. Iron Man kẹt lại ngoài không gian, Hawkeye mất tích. Thor, Capta...',
    likes: 2607278,
    views: 5200000,
    genre: 'Hành động',
    country: 'Mỹ',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 2,
    title: 'AVENGERS: INFINITY WAR',
    posterUrl: 'https://www.galaxycine.vn/media/2020/9/3/avengers-infinity-war-4k-8k_1599105170451.jpg',
    description: 'Biệt Đội Siêu Anh Hùng và đồng minh tiếp tục bảo vệ thế giới khỏi những mối đe dọa đến từ ngoài vũ trụ. Đối thủ lần này của họ là kẻ hùng mạnh nhất: Thanos.',
    likes: 1338494,
    views: 4500000,
    genre: 'Hành động',
    country: 'Mỹ',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 5,
    title: 'Lật Mặt 7: Một Điều Ước',
    posterUrl: 'https://image.tmdb.org/t/p/w500/tXHpvlr5F7gV2DmblhCNfxGSwxf.jpg',
    description: 'Câu chuyện cảm động về tình thân, gia đình và những điều ước giản đơn nhưng đầy ý nghĩa. Phần 7 của series Lật Mặt tiếp tục gây bất ngờ với những tình tiết đậm chất nhân văn.',
    likes: 980000,
    views: 2300000,
    genre: 'Tâm lý',
    country: 'Việt Nam',
    year: '2025',
    status: 'COMING'
  },
  {
    id: 6,
    title: 'MUFASA: Vua Sư Tử',
    posterUrl: 'https://image.tmdb.org/t/p/w500/lurEK87kukWNaHd0zYnsi3yzJrs.jpg',
    description: 'Câu chuyện về nguồn gốc của Mufasa, từ một chú sư tử mồ côi lạc lõng đến khi trở thành vị vua vĩ đại của Pride Lands. Hành trình đầy thử thách và cảm động.',
    likes: 750000,
    views: 1800000,
    genre: 'Hoạt hình',
    country: 'Mỹ',
    year: '2025',
    status: 'COMING'
  },
  {
    id: 7,
    title: 'Công Tử Bạc Liêu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/aYPm0EiVNnIlZpTx3BPsOvDMaWo.jpg',
    description: 'Bộ phim tái hiện cuộc đời vị công tử giàu có nhất miền Nam Việt Nam thời thuộc địa. Câu chuyện về tình yêu, danh vọng và sự hy sinh.',
    likes: 520000,
    views: 1200000,
    genre: 'Tình cảm',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 8,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 9,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 10,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 11,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 12,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 13,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 14,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 15,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 16,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 17,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 18,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  },
  {
    id: 19,
    title: 'Quỷ Cẩu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSvCRwBjPWaSB0NJ.jpg',
    description: 'Bộ phim kinh dị Việt Nam với những cảnh rùng rợn và câu chuyện về tín ngưỡng dân gian. Khi quá khứ trở về ám ảnh, nỗi sợ hãi không còn chỉ là trí tưởng tượng.',
    likes: 430000,
    views: 980000,
    genre: 'Kinh dị',
    country: 'Việt Nam',
    year: '2024',
    status: 'NOW'
  }
];

// CẤU HÌNH GIAO DIỆN (STYLES)
// Sử dụng MUI sx prop
const styles = {
  // Container chính của trang
  wrapper: {
    minHeight: '100vh',
    bgcolor: '#fff',
    py: { xs: 2, md: 4 }
  },

  // Tiêu đề trang - "PHIM ĐIỆN ẢNH"
  pageTitle: {
    fontWeight: 400,
    fontSize: '20px',
    color: '#4A4A4A',
    textTransform: 'uppercase',
    pl: 2,
    borderLeft: '4px solid #1A3A5C',
    mb: 3
  },

  // Hàng bộ lọc (Thể loại, Quốc gia, Năm...)
  filterRow: {
    display: 'flex',
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
    borderRadius: 0
  },

  // Poster phim (hình ngang theo template Galaxy)
  moviePoster: {
    width: '255px',
    height: '155px',
    objectFit: 'cover',
    flexShrink: 0,
    cursor: 'pointer',
    boxShadow: 'none',
    border: 'none',
    borderRadius: 0
  },

  // Nội dung phim (tiêu đề, mô tả, nút)
  movieContent: {
    flex: 1,
    pl: 1.5,
    pr: 1.5,
    py: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },

  // Tiêu đề phim
  movieTitle: {
    fontWeight: 700,
    fontSize: '18px',
    color: '#1A1A2E',
    mt: 0,
    mb: 0.5,
    cursor: 'pointer'
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
    fontSize: '12px',
    px: 2.4,
    py: 0.5,
    minWidth: 'auto',
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
    px: 2.8,
    py: 0.2,
    fontSize: '12px',
    cursor: 'pointer',
  },

  // Mô tả ngắn của phim (tối đa 3 dòng)
  movieDescription: {
    fontSize: '14px',
    color: '#A0A3A7',
    lineHeight: 1.7,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
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

  // Đọc URL params khi load trang
  const getParamOrDefault = (param, defaultValue) => {
    const value = searchParams.get(param);
    return value || defaultValue;
  };

  //STATE QUẢN LÝ BỘ LỌC - khởi tạo từ URL params
  const [selectedGenre, setSelectedGenre] = useState(getParamOrDefault('the-loai', 'Tất cả'));
  const [selectedCountry, setSelectedCountry] = useState(getParamOrDefault('quoc-gia', 'Tất cả'));
  const [selectedYear, setSelectedYear] = useState(getParamOrDefault('nam', 'Tất cả'));
  const [selectedStatus, setSelectedStatus] = useState(getParamOrDefault('trang-thai', 'Tất cả'));
  const [selectedSort, setSelectedSort] = useState(getParamOrDefault('sap-xep', 'Xem nhiều nhất'));

  //STATE PHÂN TRANG - khởi tạo từ URL params
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const itemsPerPage = 15;  // Số phim hiển thị mỗi trang (mặc định 15)

  // STATE LOADING
  const [loading, setLoading] = useState(true);

  // Cập nhật URL khi filter hoặc page thay đổi
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedGenre !== 'Tất cả') params.set('the-loai', selectedGenre);
    if (selectedCountry !== 'Tất cả') params.set('quoc-gia', selectedCountry);
    if (selectedYear !== 'Tất cả') params.set('nam', selectedYear);
    if (selectedStatus !== 'Tất cả') params.set('trang-thai', selectedStatus);
    if (selectedSort !== 'Xem nhiều nhất') params.set('sap-xep', selectedSort);
    if (currentPage > 1) params.set('page', currentPage.toString());

    setSearchParams(params, { replace: true });
  }, [selectedGenre, selectedCountry, selectedYear, selectedStatus, selectedSort, currentPage, setSearchParams]);

  // Simulate loading khi mount component HOẶC khi filter/page thay đổi
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // Loading 800ms
    return () => clearTimeout(timer);
  }, [selectedGenre, selectedCountry, selectedYear, selectedStatus, selectedSort, currentPage]);

  // HÀM LỌC PHIM
  // Lọc và sắp xếp danh sách phim theo các tiêu chí đã chọn
  const getFilteredMovies = () => {
    let filtered = [...MOCK_MOVIES];

    // Lọc theo thể loại
    if (selectedGenre !== 'Tất cả') {
      filtered = filtered.filter(m => m.genre === selectedGenre);
    }
    // Lọc theo quốc gia
    if (selectedCountry !== 'Tất cả') {
      filtered = filtered.filter(m => m.country === selectedCountry);
    }
    // Lọc theo năm
    if (selectedYear !== 'Tất cả') {
      filtered = filtered.filter(m => m.year === selectedYear);
    }
    // Lọc theo trạng thái (Đang chiếu / Sắp chiếu)
    if (selectedStatus !== 'Tất cả') {
      const status = selectedStatus === 'Đang chiếu' ? 'NOW' : 'COMING';
      filtered = filtered.filter(m => m.status === status);
    }

    // Sắp xếp theo tiêu chí đã chọn
    if (selectedSort === 'Xem nhiều nhất') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (selectedSort === 'Thích nhiều nhất') {
      filtered.sort((a, b) => b.likes - a.likes);
    }

    return filtered;
  };

  // Xử lý click vào phim -> chuyển đến trang chi tiết phim
  const handleMovieClick = (movieId) => {
    navigate(`/phim/${movieId}`);
  };

  // Lấy danh sách phim đã lọc
  const filteredMovies = getFilteredMovies();

  // TÍNH TOÁN PHÂN TRANG
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage); // Tổng số trang
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ); // Danh sách phim của trang hiện tại

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
        <Typography sx={styles.pageTitle}>Phim điện ảnh</Typography>

        {/* Hàng bộ lọc - Thể loại, Quốc gia, Năm, Trạng thái, Sắp xếp */}
        <Box sx={styles.filterRow}>
          <FormControl sx={styles.filterSelect} size="small">
            <Select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              displayEmpty
            >
              {MOCK_GENRES.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre === 'Tất cả' ? 'Thể Loại' : genre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={styles.filterSelect} size="small">
            <Select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              {MOCK_COUNTRIES.map((country) => (
                <MenuItem key={country} value={country}>
                  {country === 'Tất cả' ? 'Quốc Gia' : country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={styles.filterSelect} size="small">
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {MOCK_YEARS.map((year) => (
                <MenuItem key={year} value={year}>
                  {year === 'Tất cả' ? 'Năm' : year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={styles.filterSelect} size="small">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {MOCK_STATUS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status === 'Tất cả' ? 'Đang Chiếu/' : status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={styles.filterSelect} size="small">
            <Select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              {MOCK_SORT.map((sort) => (
                <MenuItem key={sort} value={sort}>{sort}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Movies List */}
            {paginatedMovies.map((movie) => (
              <Card key={movie.id} sx={styles.movieCard}>
                <CardMedia
                  component="img"
                  sx={styles.moviePoster}
                  image={movie.posterUrl}
                  alt={movie.title}
                  onClick={() => handleMovieClick(movie.id)}
                />
                <Box sx={styles.movieContent}>
                  <Typography
                    sx={styles.movieTitle}
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    {movie.title}
                  </Typography>

                  {/* Action Buttons */}
                  <Box sx={styles.actionButtons}>
                    <Button
                      variant="contained"
                      startIcon={<ThumbUpIcon />}
                      sx={styles.likeBtn}
                      size="small"
                    >
                      Thích
                    </Button>
                    <Box sx={styles.viewCount}>
                      <VisibilityIcon sx={{ fontSize: 18 }} />
                      <span>{formatNumber(movie.likes)}</span>
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

            {/* Empty State */}
            {filteredMovies.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary" fontSize="1.1rem">
                  Không tìm thấy phim phù hợp với bộ lọc
                </Typography>
              </Box>
            )}
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
                {MOCK_MOVIES.filter(m => m.status === 'NOW').slice(0, 3).map((movie) => (
                  <Box
                    key={movie.id}
                    component={Link}
                    to={`/dat-ve/${movie.id}`}
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
                            C18
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
                            10
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
