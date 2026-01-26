import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Typography,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Menu,
  MenuItem,
  Avatar,
  InputBase,
  useMediaQuery,
  useTheme,
  Paper,
  Popper,
  Fade,
  Rating
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Movie as MovieIcon,
  Event as EventIcon,
  Article as ArticleIcon,
  KeyboardArrowDown as ArrowDownIcon,
  ConfirmationNumber as TicketIcon,
  PlayCircleOutline as TrailerIcon,
  Phone as PhoneIcon,
  ConfirmationNumberTwoTone as ConfirmationNumberTwoToneIcon
} from '@mui/icons-material';

// Logo
import LogoNMNCinema from '../../../../assets/images/NMN_CENIMA_LOGO.png';

// API cho Mega Menu
import { getNowShowingMoviesAPI, getComingSoonMoviesAPI } from '../../../../apis/movieApi';

// Auth Context and Modals
import { useAuth } from '../../../../contexts/AuthContext';
import { LoginModal, RegisterModal, ForgotPasswordModal } from '../../../Common';

// Import ảnh từ background-header
//Tạm thời comment nào thấy đẹp thì mở lại
// import backgroundHeader from '../../../../assets/images/bg-header.jpg';

// COLORS - Màu sắc
const COLORS = {
  primary: '#00405d',      // Cam chủ đạo
  text: '#333333',         // Chữ đen
  textLight: '#666666',    // Chữ xám
  white: '#ffffff',
  border: '#e0e0e0',       // Viền xám nhạt
  hover: '#f5f5f5'         // Hover background
};

// STYLES
const styles = {
  appBar: {
    // backgroundImage: `url(${backgroundHeader})`,
    backgroundColor: '#fff',
    backgroundSize: 'cover',
    backgroundPosition: 'center 55%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    borderBottom: `1px solid ${COLORS.border}`,
    transition: 'transform 0.3s ease-in-out'
  },
  appBarHidden: {
    transform: 'translateY(-100%)'
  },
  toolbar: {
    minHeight: '70px !important',
    justifyContent: 'space-between',
    gap: 2
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none'
  },
  logoImage: {
    height: 96,
    width: 'auto'
  },
  navMenu: {
    display: { xs: 'none', md: 'flex' },
    alignItems: 'center',
    gap: 0.5
  },
  navButton: {
    color: 'hsla(180, 2%, 24%, 75%)',
    fontWeight: 700,
    fontSize: '1rem',
    fontFamily: 'DM Sans, system-ui, sans-serif',
    textTransform: 'none',
    px: 1.5,
    py: 1,
    border: 0,
    outline: 0,
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#00AE72',
      border: 0
    },

    '&:focus': {
      outline: 0,
      boxShadow: 'none',
      border: 0
    },
    '&:active': {
      outline: 0,
      boxShadow: 'none',
      border: 0
    },
    '&.Mui-focusVisible': {
      outline: 0,
      boxShadow: 'none',
      border: 0
    },
    '&:focus-visible': {
      outline: 0,
      boxShadow: 'none',
      border: 0
    }
  },
  navButtonActive: {
    color: '#00AE72'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },
  searchIcon: {
    color: 'rgba(18, 18, 18, 1)',
    '&:hover': {
      backgroundColor: 'transparent',
      color: 'rgba(84, 87, 87, 1)',
      border: 0
    },
    '&:focus': { outline: 'none' },
    '&.Mui-focusVisible': { outline: 'none' }
  },
  loginBtn: {
    color: 'hsla(0, 5%, 40%, 1.00)',
    fontWeight: 500,
    fontSize: '0.9rem',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#00AE72'
    },
    '&:focus': { outline: 'none' },
    '&.Mui-focusVisible': { outline: 'none' }
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 1,
    px: 1.5,
    py: 0.5,
    // Mobile: full width overlay
    position: { xs: 'absolute', md: 'relative' },
    left: { xs: 0, md: 'auto' },
    right: { xs: 0, md: 'auto' },
    top: { xs: '50%', md: 'auto' },
    transform: { xs: 'translateY(-50%)', md: 'none' },
    mx: { xs: 2, md: 0 },
    zIndex: 10
  },
  searchInput: {
    fontSize: '0.9rem',
    width: { xs: '100%', md: 200 },
    flex: { xs: 1, md: 'none' }
  },
  // Mega Menu styles
  megaMenu: {
    mt: 1,
    p: 2,
    minWidth: 600,
    maxWidth: 750,
    maxHeight: '80vh',     // Giới hạn chiều cao
    overflowY: 'auto',     // Cho phép scroll
    borderRadius: 2,
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  megaMenuSection: {
    mb: 2
  },
  megaMenuTitle: {
    fontWeight: 600,
    color: COLORS.primary,
    fontSize: '0.85rem',
    mb: 1.5,
    pl: 0.5,
    borderLeft: `3px solid ${COLORS.primary}`,
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#00AE72'
    },
  },
  movieGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 1.5
  },
  movieCard: {
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    '&:hover .movie-poster': {
      filter: 'brightness(0.5)'
    },
    '&:hover .movie-overlay': {
      opacity: 1
    }
  },
  moviePosterWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 1,
    height: 220,  // Fixed height để đồng bộ
    flexShrink: 0
  },
  moviePoster: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'filter 0.3s',
    userSelect: 'none',
    pointerEvents: 'none'  // Ngăn kéo thả ảnh
  },
  movieOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    opacity: 0,
    transition: 'opacity 0.3s'
  },
  buyTicketBtn: {
    backgroundColor: '#F9A825',
    color: '#0e0f11ff',
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'none',
    px: 2,
    py: 0.75,
    borderRadius: 1,
    '&:hover': {
      backgroundColor: '#AE7519'
    }
  },
  trailerBtn: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontWeight: 500,
    fontSize: '0.75rem',
    textTransform: 'none',
    border: '1px solid #fff',
    px: 2,
    py: 0.5,
    borderRadius: 1,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)'
    }
  },
  movieTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: COLORS.text,
    mt: 1,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.3,
    minHeight: '2.6em'  // 2 dòng x lineHeight 1.3
  },
  viewAllBtn: {
    mt: 1.5,
    color: COLORS.primary,
    fontWeight: 500,
    fontSize: '0.85rem',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'rgba(242, 107, 56, 0.1)'
    }
  }
};

// MENU ITEMS - Để trống (Tất cả đều dùng dropdown riêng)
const menuItems = [];

// GÓC ĐIỆN ẢNH MENU ITEMS
const blogMenuItems = [
  { label: 'Thể loại phim', path: '/the-loai-phim' },
  { label: 'Diễn viên', path: '/dien-vien' },
  { label: 'Đạo diễn', path: '/dao-dien' }
];

// SỰ KIỆN MENU ITEMS
const eventMenuItems = [
  { label: 'Ưu đãi-Sự kiện', path: '/uu-dai-sự-kien' },
  { label: 'Phim hay hàng tháng', path: '/phim-hay-hang-thang' }
];
// SỰ KIỆN GIÁ VÉ ITEMS
const eventTicketMenuItems = [
  { label: 'Giá vé', path: '/gia-ve' },
];
// THÀNH VIÊN MENU ITEMS
const memberMenuItems = [
  { label: 'Thành viên', path: '/thanh-vien' },
];
// LIÊN HỆ MENU ITEMS
const contactMenuItems = [
  { label: 'Liên hệ', path: '/lien-he' },
]

// HEADER COMPONENT
function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hide on scroll state
  const [hideHeader, setHideHeader] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Mega Menu state - Phim
  const [movieMenuAnchor, setMovieMenuAnchor] = useState(null);
  const [movieMenuOpen, setMovieMenuOpen] = useState(false);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);

  // Dropdown state - Góc điện ảnh
  const [blogMenuAnchor, setBlogMenuAnchor] = useState(null);
  const [blogMenuOpen, setBlogMenuOpen] = useState(false);

  // Dropdown state - Sự kiện
  const [eventMenuAnchor, setEventMenuAnchor] = useState(null);
  const [eventMenuOpen, setEventMenuOpen] = useState(false);

  // Auth Modals state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

  // Auth from Context
  const { user, isAuthenticated, logout } = useAuth();

  // Load movies cho Mega Menu từ API
  // Ref để throttle API call (TTL 30 giây)
  const lastFetchRef = useRef(0);

  // Function refresh data cho dropdown
  const refreshMoviesForDropdown = async () => {
    const now = Date.now();
    // Chỉ refetch nếu quá 30 giây kể từ lần fetch trước
    if (now - lastFetchRef.current < 30000) return;
    lastFetchRef.current = now;

    try {
      const [nowShowingRes, comingSoonRes] = await Promise.all([
        getNowShowingMoviesAPI(4),
        getComingSoonMoviesAPI(4)
      ]);

      // Parse response
      const nowShowing = nowShowingRes?.movies || nowShowingRes?.data?.movies || [];
      const comingSoon = comingSoonRes?.movies || comingSoonRes?.data?.movies || [];

      setNowShowingMovies(nowShowing.slice(0, 4));
      setComingSoonMovies(comingSoon.slice(0, 4));
    } catch (error) {
      console.error('Error loading movies for mega menu:', error);
    }
  };

  // Preload khi mount
  useEffect(() => {
    refreshMoviesForDropdown();
  }, []);

  // Hide on scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Chỉ ẩn khi kéo xuống quá 100px
      if (currentScrollY > 100) {
        // Kéo xuống -> ẩn header
        if (currentScrollY > lastScrollY) {
          setHideHeader(true);
        }
        // Kéo lên -> hiện header
        else {
          setHideHeader(false);
        }
      } else {
        setHideHeader(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // HANDLERS
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  const handleAccountMenuOpen = (e) => setAccountMenuAnchor(e.currentTarget);
  const handleAccountMenuClose = () => setAccountMenuAnchor(null);

  // Mega Menu handlers với delay để cho phép di chuyển mượt từ nút sang menu
  const menuCloseTimeoutRef = useRef(null);

  const handleMovieMenuOpen = (e) => {
    // Hủy timeout đóng nếu có
    if (menuCloseTimeoutRef.current) {
      clearTimeout(menuCloseTimeoutRef.current);
      menuCloseTimeoutRef.current = null;
    }
    setMovieMenuAnchor(e.currentTarget);
    setMovieMenuOpen(true);

    // Refresh data khi mở dropdown (với TTL 30s để tránh spam API)
    refreshMoviesForDropdown();
  };

  const handleMovieMenuClose = () => {
    // Delay 150ms trước khi đóng, cho phép user di chuyển sang menu
    menuCloseTimeoutRef.current = setTimeout(() => {
      setMovieMenuOpen(false);
    }, 150);
  };

  const handleMenuEnter = () => {
    // Khi vào menu, hủy timeout đóng
    if (menuCloseTimeoutRef.current) {
      clearTimeout(menuCloseTimeoutRef.current);
      menuCloseTimeoutRef.current = null;
    }
  };

  const handleMenuLeave = () => {
    // Khi rời menu, đóng menu
    setMovieMenuOpen(false);
  };

  // Blog Menu handlers
  const blogMenuCloseTimeoutRef = useRef(null);

  const handleBlogMenuOpen = (e) => {
    if (blogMenuCloseTimeoutRef.current) {
      clearTimeout(blogMenuCloseTimeoutRef.current);
      blogMenuCloseTimeoutRef.current = null;
    }
    setBlogMenuAnchor(e.currentTarget);
    setBlogMenuOpen(true);
  };

  const handleBlogMenuClose = () => {
    blogMenuCloseTimeoutRef.current = setTimeout(() => {
      setBlogMenuOpen(false);
    }, 50);  // Nhanh hơn - 50ms thay vì 150ms
  };

  const handleBlogMenuEnter = () => {
    if (blogMenuCloseTimeoutRef.current) {
      clearTimeout(blogMenuCloseTimeoutRef.current);
      blogMenuCloseTimeoutRef.current = null;
    }
  };

  const handleBlogMenuLeave = () => {
    setBlogMenuOpen(false);
  };

  // Event Menu handlers
  const eventMenuCloseTimeoutRef = useRef(null);

  const handleEventMenuOpen = (e) => {
    if (eventMenuCloseTimeoutRef.current) {
      clearTimeout(eventMenuCloseTimeoutRef.current);
      eventMenuCloseTimeoutRef.current = null;
    }
    setEventMenuAnchor(e.currentTarget);
    setEventMenuOpen(true);
  };

  const handleEventMenuClose = () => {
    eventMenuCloseTimeoutRef.current = setTimeout(() => {
      setEventMenuOpen(false);
    }, 50);
  };

  const handleEventMenuEnter = () => {
    if (eventMenuCloseTimeoutRef.current) {
      clearTimeout(eventMenuCloseTimeoutRef.current);
      eventMenuCloseTimeoutRef.current = null;
    }
  };

  const handleEventMenuLeave = () => {
    setEventMenuOpen(false);
  };

  const memberMenuCloseTimeoutRef = useRef(null);

  const handleMemberMenuOpen = (e) => {
    if (memberMenuCloseTimeoutRef.current) {
      clearTimeout(memberMenuCloseTimeoutRef.current);
      memberMenuCloseTimeoutRef.current = null;
    }
    setMemberMenuAnchor(e.currentTarget);
    setMemberMenuOpen(true);
  };

  const handleMemberMenuClose = () => {
    memberMenuCloseTimeoutRef.current = setTimeout(() => {
      setMemberMenuOpen(false);
    }, 50);
  };

  const handleMemberMenuEnter = () => {
    if (memberMenuCloseTimeoutRef.current) {
      clearTimeout(memberMenuCloseTimeoutRef.current);
      memberMenuCloseTimeoutRef.current = null;
    }
  };

  const handleMemberMenuLeave = () => {
    setMemberMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/tim-kiem?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    handleAccountMenuClose();
    await logout();
    navigate('/');
  };

  // RENDER - Mega Menu cho Phim
  const renderMovieMegaMenu = () => (
    <Popper
      open={movieMenuOpen}
      anchorEl={movieMenuAnchor}
      placement="bottom"
      transition
      style={{ zIndex: 1300 }}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 10]  // Khoảng cách từ anchor
          }
        },
        {
          name: 'preventOverflow',
          options: {
            padding: 16
          }
        }
      ]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper
            sx={styles.megaMenu}
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
          >
            <Box>
              {/* PHIM ĐANG CHIẾU */}
              <Box sx={styles.megaMenuSection}>
                <Typography sx={styles.megaMenuTitle}>
                  PHIM ĐANG CHIẾU
                </Typography>
                <Box sx={styles.movieGrid}>
                  {nowShowingMovies.map((movie) => (
                    <Box key={movie._id} sx={styles.movieCard}>
                      {/* Poster wrapper với overlay */}
                      <Box sx={styles.moviePosterWrapper}>
                        <Box
                          component="img"
                          className="movie-poster"
                          src={movie.posterUrl}
                          alt={movie.title}
                          sx={styles.moviePoster}
                        />
                        {/* Overlay chỉ có nút Mua vé */}
                        <Box className="movie-overlay" sx={styles.movieOverlay}>
                          <Button
                            component={Link}
                            to={`/dat-ve/${movie.slug}`}
                            sx={styles.buyTicketBtn}
                            startIcon={<TicketIcon />}
                            onClick={handleMovieMenuClose}
                          >
                            Mua vé
                          </Button>
                        </Box>
                      </Box>
                      {/* Title */}
                      <Typography
                        component={Link}
                        to={`/movie/${movie._id}`}
                        sx={{ ...styles.movieTitle, textDecoration: 'none' }}
                        onClick={handleMovieMenuClose}
                      >
                        {movie.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              {/* PHIM SẮP CHIẾU */}
              <Box sx={styles.megaMenuSection}>
                <Typography sx={styles.megaMenuTitle}>
                  PHIM SẮP CHIẾU
                </Typography>
                <Box sx={styles.movieGrid}>
                  {comingSoonMovies.map((movie) => (
                    <Box key={movie._id} sx={styles.movieCard}>
                      {/* Poster wrapper với overlay */}
                      <Box sx={styles.moviePosterWrapper}>
                        <Box
                          component="img"
                          className="movie-poster"
                          src={movie.posterUrl}
                          alt={movie.title}
                          sx={styles.moviePoster}
                        />
                        {/* Overlay chỉ có nút Mua vé */}
                        <Box className="movie-overlay" sx={styles.movieOverlay}>
                          <Button
                            component={Link}
                            to={`/dat-ve/${movie.slug}`}
                            sx={styles.buyTicketBtn}
                            startIcon={<TicketIcon />}
                            onClick={handleMovieMenuClose}
                          >
                            Mua vé
                          </Button>
                        </Box>
                      </Box>
                      {/* Title */}
                      <Typography
                        component={Link}
                        to={`/movie/${movie._id}`}
                        sx={{ ...styles.movieTitle, textDecoration: 'none' }}
                        onClick={handleMovieMenuClose}
                      >
                        {movie.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  // RENDER - Dropdown Menu cho Góc điện ảnh
  const renderBlogMenu = () => (
    <Popper
      open={blogMenuOpen}
      anchorEl={blogMenuAnchor}
      placement="bottom-start"
      transition
      style={{ zIndex: 1300 }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={80}>
          <Paper
            sx={{
              mt: 0.5,
              py: 0.5,
              minWidth: 160,
              borderRadius: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={handleBlogMenuEnter}
            onMouseLeave={handleBlogMenuLeave}
          >
            {blogMenuItems.map((item) => (
              <Box
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setBlogMenuOpen(false)}
                sx={{
                  display: 'block',
                  px: 2.5,
                  py: 1.2,
                  textDecoration: 'none',
                  color: COLORS.text,
                  fontSize: '0.95rem',
                  fontWeight: 400,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#00AE72'
                  }
                }}
              >
                {item.label}
              </Box>
            ))}
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  // RENDER - Dropdown Menu cho Sự kiện
  const renderEventMenu = () => (
    <Popper
      open={eventMenuOpen}
      anchorEl={eventMenuAnchor}
      placement="bottom-start"
      transition
      style={{ zIndex: 1300 }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={80}>
          <Paper
            sx={{
              mt: 0.5,
              py: 0.5,
              minWidth: 180,
              borderRadius: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={handleEventMenuEnter}
            onMouseLeave={handleEventMenuLeave}
          >
            {eventMenuItems.map((item) => (
              <Box
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setEventMenuOpen(false)}
                sx={{
                  display: 'block',
                  px: 2.5,
                  py: 1.2,
                  textDecoration: 'none',
                  color: COLORS.text,
                  fontSize: '0.95rem',
                  fontWeight: 400,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#00AE72'
                  }
                }}
              >
                {item.label}
              </Box>
            ))}
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  // RENDER - Mobile Menu với Accordion
  const [mobileMenuExpanded, setMobileMenuExpanded] = useState({
    phim: false,
    blog: false,
    event: false
  });

  const toggleMobileSubMenu = (menu) => {
    setMobileMenuExpanded(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const renderMobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={toggleMobileMenu}
      PaperProps={{
        sx: { width: 300, backgroundColor: COLORS.white }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Box component="img" src={LogoNMNCinema} alt="NMN Cinema" sx={{ height: 50 }} />
        <IconButton onClick={toggleMobileMenu}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ pt: 0 }}>
        {/* === PHIM === */}
        <ListItem
          onClick={() => toggleMobileSubMenu('phim')}
          sx={{
            color: COLORS.text,
            cursor: 'pointer',
            backgroundColor: mobileMenuExpanded.phim ? '#f5f5f5' : 'transparent',
            '&:hover': { backgroundColor: COLORS.hover }
          }}
        >
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 40 }}>
            <MovieIcon />
          </ListItemIcon>
          <ListItemText
            primary="Phim"
            primaryTypographyProps={{ fontWeight: 600 }}
          />
          <ArrowDownIcon sx={{
            transform: mobileMenuExpanded.phim ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s'
          }} />
        </ListItem>

        {/* Phim sub-items */}
        <Box sx={{
          maxHeight: mobileMenuExpanded.phim ? '200px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          backgroundColor: '#fafafa'
        }}>
          <ListItem
            component={Link}
            to="/movies?status=now"
            onClick={toggleMobileMenu}
            sx={{ pl: 6, color: COLORS.text, '&:hover': { backgroundColor: COLORS.hover, color: COLORS.primary } }}
          >
            <ListItemText primary="Phim đang chiếu" />
          </ListItem>
          <ListItem
            component={Link}
            to="/movies?status=coming"
            onClick={toggleMobileMenu}
            sx={{ pl: 6, color: COLORS.text, '&:hover': { backgroundColor: COLORS.hover, color: COLORS.primary } }}
          >
            <ListItemText primary="Phim sắp chiếu" />
          </ListItem>
        </Box>

        <Divider />

        {/* === GÓC ĐIỆN ẢNH === */}
        <ListItem
          onClick={() => toggleMobileSubMenu('blog')}
          sx={{
            color: COLORS.text,
            cursor: 'pointer',
            backgroundColor: mobileMenuExpanded.blog ? '#f5f5f5' : 'transparent',
            '&:hover': { backgroundColor: COLORS.hover }
          }}
        >
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 40 }}>
            <ArticleIcon />
          </ListItemIcon>
          <ListItemText
            primary="Góc điện ảnh"
            primaryTypographyProps={{ fontWeight: 600 }}
          />
          <ArrowDownIcon sx={{
            transform: mobileMenuExpanded.blog ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s'
          }} />
        </ListItem>

        {/* Blog sub-items */}
        <Box sx={{
          maxHeight: mobileMenuExpanded.blog ? '200px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          backgroundColor: '#fafafa'
        }}>
          <ListItem
            component={Link}
            to="/the-loai-phim"
            onClick={toggleMobileMenu}
            sx={{ pl: 6, color: COLORS.text, '&:hover': { backgroundColor: COLORS.hover, color: COLORS.primary } }}
          >
            <ListItemText primary="Thể loại phim" />
          </ListItem>
          <ListItem
            component={Link}
            to="/dien-vien"
            onClick={toggleMobileMenu}
            sx={{ pl: 6, color: COLORS.text, '&:hover': { backgroundColor: COLORS.hover, color: COLORS.primary } }}
          >
            <ListItemText primary="Diễn viên" />
          </ListItem>
          <ListItem
            component={Link}
            to="/dao-dien"
            onClick={toggleMobileMenu}
            sx={{ pl: 6, color: COLORS.text, '&:hover': { backgroundColor: COLORS.hover, color: COLORS.primary } }}
          >
            <ListItemText primary="Đạo diễn" />
          </ListItem>
        </Box>
        <Divider />

        {/* === SỰ KIỆN === */}
        <ListItem
          onClick={() => toggleMobileSubMenu('event')}
          sx={{
            color: COLORS.text,
            cursor: 'pointer',
            backgroundColor: mobileMenuExpanded.event ? '#f5f5f5' : 'transparent',
            '&:hover': { backgroundColor: COLORS.hover }
          }}
        >
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 40 }}>
            <EventIcon />
          </ListItemIcon>
          <ListItemText
            primary="Sự kiện"
            primaryTypographyProps={{ fontWeight: 600 }}
          />
          <ArrowDownIcon sx={{
            transform: mobileMenuExpanded.event ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s'
          }} />
        </ListItem>

        {/* Event sub-items */}
        <Box sx={{
          maxHeight: mobileMenuExpanded.event ? '200px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          backgroundColor: '#fafafa'
        }}>
          <ListItem
            component={Link}
            to="/khuyen-mai"
            onClick={toggleMobileMenu}
            sx={{ pl: 6, color: COLORS.text, '&:hover': { backgroundColor: COLORS.hover, color: COLORS.primary } }}
          >
            <ListItemText primary="Khuyến mãi" />
          </ListItem>
          <ListItem
            component={Link}
            to="/su-kien-dac-biet"
            onClick={toggleMobileMenu}
            sx={{ pl: 6, color: COLORS.text, '&:hover': { backgroundColor: COLORS.hover, color: COLORS.primary } }}
          >
            <ListItemText primary="Sự kiện đặc biệt" />
          </ListItem>
        </Box>
        <Divider />
        {/* === Giá vé === */}
        <ListItem
          component={Link}
          to="/gia-ve"
          onClick={toggleMobileMenu}
          sx={{
            color: COLORS.text,
            cursor: 'pointer',
            '&:hover': { backgroundColor: COLORS.hover }
          }}
        >
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 40 }}>
            <ConfirmationNumberTwoToneIcon />
          </ListItemIcon>
          <ListItemText
            primary="Giá vé"
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </ListItem>
        {/* === THÀNH VIÊN === */}
        <ListItem
          component={Link}
          to="/thanh-vien"
          onClick={toggleMobileMenu}
          sx={{
            color: COLORS.text,
            cursor: 'pointer',
            '&:hover': { backgroundColor: COLORS.hover }
          }}
        >
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 40 }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText
            primary="Thành viên"
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </ListItem>
        {/* === Liên hệ === */}
        <ListItem
          component={Link}
          to="/lien-he"
          onClick={toggleMobileMenu}
          sx={{
            color: COLORS.text,
            cursor: 'pointer',
            '&:hover': { backgroundColor: COLORS.hover }
          }}
        >
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 40 }}>
            <PhoneIcon />
          </ListItemIcon>
          <ListItemText
            primary="Liên hệ"
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </ListItem>
      </List>
    </Drawer>
  );

  // RENDER - Account Menu
  const renderAccountMenu = () => (
    <Menu
      anchorEl={accountMenuAnchor}
      open={Boolean(accountMenuAnchor)}
      onClose={handleAccountMenuClose}
      PaperProps={{ sx: { mt: 1, minWidth: 180 } }}
    >
      <MenuItem onClick={() => { handleAccountMenuClose(); navigate('/tai-khoan'); }}>
        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
        Tài khoản
      </MenuItem>
      <MenuItem onClick={() => { handleAccountMenuClose(); navigate('/lich-su'); }}>
        <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
        Lịch sử
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
        Đăng xuất
      </MenuItem>
    </Menu>
  );

  // RENDER CHÍNH
  return (
    <AppBar
      position="sticky"
      sx={{
        ...styles.appBar,
        ...(hideHeader ? styles.appBarHidden : {})
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={styles.toolbar} disableGutters>

          {/*PHẦN TRÁI: Menu mobile + Logo - ẩn khi search mở trên mobile*/}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            visibility: { xs: searchOpen ? 'hidden' : 'visible', md: 'visible' }
          }}>
            {isMobile && (
              <IconButton onClick={toggleMobileMenu} sx={{ color: COLORS.text }}>
                <MenuIcon />
              </IconButton>
            )}

            <Box component={Link} to="/" sx={styles.logo}>
              <Box
                component="img"
                src={LogoNMNCinema}
                alt="NMN Cinema"
                sx={styles.logoImage}
              />
            </Box>
          </Box>

          {/*PHẦN GIỮA: Menu (Desktop)*/}
          <Box sx={styles.navMenu}>
            {/* Nút Phim với Mega Menu - bọc trong Box để xử lý hover */}
            <Box
              onMouseEnter={handleMovieMenuOpen}
              onMouseLeave={(e) => {
                // Chỉ đóng nếu chuột không di chuyển vào menu
                const rect = e.currentTarget.getBoundingClientRect();
                if (e.clientY < rect.bottom) {
                  handleMovieMenuClose();
                }
              }}
            >
              <Button
                disableRipple
                disableFocusRipple
                sx={{
                  ...styles.navButton,
                  ...(movieMenuOpen ? styles.navButtonActive : {})
                }}
                endIcon={<ArrowDownIcon sx={{ fontSize: 18 }} />}
              >
                Phim
              </Button>
            </Box>

            {/* Nút Góc điện ảnh với dropdown */}
            <Box
              onMouseEnter={handleBlogMenuOpen}
              onMouseLeave={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                if (e.clientY < rect.bottom) {
                  handleBlogMenuClose();
                }
              }}
            >
              <Button
                disableRipple
                disableFocusRipple
                sx={{
                  ...styles.navButton,
                  ...(blogMenuOpen ? styles.navButtonActive : {})
                }}
                endIcon={<ArrowDownIcon sx={{ fontSize: 18 }} />}
              >
                Góc điện ảnh
              </Button>
            </Box>

            {/* Nút Sự kiện với dropdown */}
            <Box
              onMouseEnter={handleEventMenuOpen}
              onMouseLeave={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                if (e.clientY < rect.bottom) {
                  handleEventMenuClose();
                }
              }}
            >
              <Button
                disableRipple
                disableFocusRipple
                sx={{
                  ...styles.navButton,
                  ...(eventMenuOpen ? styles.navButtonActive : {})
                }}
                endIcon={<ArrowDownIcon sx={{ fontSize: 18 }} />}
              >
                Sự kiện
              </Button>
            </Box>
            {/* Nút Giá vé */}
            <Box sx={{ mx: 0.5 }}>
              <Button
                component={Link}
                to="/gia-ve"
                disableRipple
                disableFocusRipple
                sx={styles.navButton}
              >
                Giá vé
              </Button>
            </Box>
            {/* Nút Thành viên */}
            <Box sx={{ mx: 0.5 }}>
              <Button
                component={Link}
                to="/thanh-vien"
                disableRipple
                disableFocusRipple
                sx={styles.navButton}
              >
                Thành viên
              </Button>
            </Box>
            {/* Nút liên hệ */}
            <Box sx={{ mx: 0.5 }}>
              <Button
                component={Link}
                to="/lien-he"
                disableRipple
                disableFocusRipple
                sx={styles.navButton}
              >
                Liên hệ
              </Button>
            </Box>
          </Box>

          {/*PHẦN PHẢI: Search + Login*/}
          <Box sx={styles.rightSection}>
            {searchOpen ? (
              <Box sx={styles.searchBox}>
                <InputBase
                  placeholder="Tìm phim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  sx={styles.searchInput}
                  autoFocus
                />
                <IconButton size="small" onClick={toggleSearch}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <IconButton onClick={toggleSearch} sx={styles.searchIcon}>
                <SearchIcon />
              </IconButton>
            )}

            {/* User section - ẩn trên mobile khi search mở */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              visibility: { xs: searchOpen ? 'hidden' : 'visible', md: 'visible' }
            }}>
              {isAuthenticated ? (
                <>
                  <IconButton onClick={handleAccountMenuOpen}>
                    <Avatar src={user?.avatar} alt={user?.name} sx={{ width: 32, height: 32 }} />
                  </IconButton>
                  {renderAccountMenu()}
                </>
              ) : (
                <Button
                  onClick={() => setLoginModalOpen(true)}
                  sx={styles.loginBtn}
                  startIcon={<PersonIcon />}
                >
                  Đăng Nhập
                </Button>
              )}
            </Box>
          </Box>

        </Toolbar>
      </Container>

      {/* Mega Menu cho Phim */}
      {renderMovieMegaMenu()}

      {/* Dropdown Menu cho Góc điện ảnh */}
      {renderBlogMenu()}

      {/* Dropdown Menu cho Sự kiện */}
      {renderEventMenu()}

      {/* Mobile Menu Drawer */}
      {renderMobileMenu()}

      {/* Auth Modals */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
        onForgotPassword={() => {
          setLoginModalOpen(false);
          setForgotPasswordModalOpen(true);
        }}
      />
      <RegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
      <ForgotPasswordModal
        open={forgotPasswordModalOpen}
        onClose={() => setForgotPasswordModalOpen(false)}
        onBackToLogin={() => {
          setForgotPasswordModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </AppBar>
  );
}

export default Header;
