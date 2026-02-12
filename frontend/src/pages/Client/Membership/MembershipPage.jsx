import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Material UI Components
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Skeleton
} from '@mui/material';

// API
import { getMembershipInfoAPI } from '../../../apis/membershipInfoApi';

// STYLE TOKENS - Hệ thống màu sắc & typography (đồng bộ với TicketPricingPage)
const tokens = {
  colors: {
    page: {
      background: 'rgba(233, 233, 245, 1)'     // Nền trang tổng thể
    },
    wrapper: {
      background: '#FFFFFF'                       // Nền wrapper chính (trắng)
    },
    accent: '#1E1E2A',                            // Màu tối cho tiêu đề
    text: {
      primary: '#1A1A1A',
      secondary: 'rgba(0, 0, 0, 0.75)',
      muted: 'rgba(0, 0, 0, 0.5)'
    },
    border: {
      section: 'rgba(0, 0, 0, 0.1)',              // Viền phân cách sections
      inactive: 'rgba(0, 0, 0, 0.2)'             // Viền nút nav không active
    },
    card: {
      background: 'rgba(0, 0, 0, 0.03)'
    },
    skeleton: 'rgba(0, 0, 0, 0.06)'
  },
  spacing: {
    wrapper: { xs: '16px', md: '32px' }
  },
  radius: {
    wrapper: 0,
    button: 0,
    card: 0
  },
  shadow: {
    wrapper: '0 8px 32px rgba(0, 0, 0, 0.4)',
    image: '0 4px 16px rgba(0, 0, 0, 0.3)'
  },
  typography: {
    h1: {
      mobile: { fontSize: '20px', fontWeight: 700 },
      desktop: { fontSize: '26px', fontWeight: 700 }
    },
    h2: {
      mobile: { fontSize: '17px', fontWeight: 700 },
      desktop: { fontSize: '21px', fontWeight: 700 }
    },
    nav: {
      fontSize: '13px',
      fontWeight: 600
    },
    body: {
      fontSize: '14px',
      lineHeight: 1.8
    }
  }
};

// COMPONENT CHÍNH
const MembershipPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ========== STATE ==========
  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadingMap, setImageLoadingMap] = useState({});
  const [imageErrorMap, setImageErrorMap] = useState({});

  // Refs cho từng section (để scroll smooth)
  const sectionRefs = useRef({});

  // EFFECT: Gọi API lấy dữ liệu thành viên
  useEffect(() => {
    const fetchMembershipInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMembershipInfoAPI();
        if (response?.success && response?.data) {
          setMembershipData(response.data);
          // Khởi tạo trạng thái loading cho từng ảnh section
          const loadingMap = {};
          const errorMap = {};
          response.data.sections.forEach(section => {
            if (section.imageUrl) {
              loadingMap[section.slug] = true;
              errorMap[section.slug] = false;
            }
          });
          setImageLoadingMap(loadingMap);
          setImageErrorMap(errorMap);
        } else {
          setError('Không tải được thông tin thành viên');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setMembershipData(null);
        } else {
          setError('Không tải được thông tin thành viên. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipInfo();
  }, []);

  // EFFECT: Scroll đến section theo URL hash
  useEffect(() => {
    if (!membershipData) return;

    const hash = location.hash.replace('#', '');
    if (hash && sectionRefs.current[hash]) {
      // Delay nhỏ để đảm bảo DOM đã render
      setTimeout(() => {
        sectionRefs.current[hash]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [location.hash, membershipData]);

  // HANDLERS

  /** Scroll đến section khi nhấn vào nav */
  const handleNavClick = useCallback((slug) => {
    navigate(`/thanh-vien#${slug}`, { replace: true });
    sectionRefs.current[slug]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, [navigate]);

  /** Xử lý khi ảnh trong section tải thành công */
  const handleImageLoad = useCallback((slug) => {
    setImageLoadingMap(prev => ({ ...prev, [slug]: false }));
  }, []);

  /** Xử lý khi ảnh trong section tải thất bại */
  const handleImageError = useCallback((slug) => {
    setImageLoadingMap(prev => ({ ...prev, [slug]: false }));
    setImageErrorMap(prev => ({ ...prev, [slug]: true }));
  }, []);

  // RENDER: Trạng thái Loading (toàn màn hình)
  if (loading) {
    return (
      <Box sx={{
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
      }}>
        <Box
          component="img"
          src="/NMN_CENIMA_LOGO.png"
          alt="NMN Cinema"
          sx={{ width: 200, height: 200, mb: 1.5, objectFit: 'contain' }}
        />
        <CircularProgress
          size={40}
          thickness={2}
          sx={{ color: '#F5A623', mb: 2 }}
        />
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

  // RENDER: Trạng thái lỗi
  if (error) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: tokens.colors.page.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2
      }}>
        <Typography sx={{ color: '#333', fontSize: '1.1rem' }}>
          {error}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{ borderColor: '#999', color: '#333' }}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  // RENDER: Chưa có dữ liệu
  if (!membershipData) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: tokens.colors.page.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography sx={{ color: '#333' }}>
          Chưa có dữ liệu thông tin thành viên
        </Typography>
      </Box>
    );
  }

  // RENDER: Nội dung chính - Scroll-based sections
  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundImage: 'url(/src/assets/images/bg-header.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      py: 1
    }}>
      <Container maxWidth="lg">
        {/* WRAPPER CHÍNH - Nền tối */}
        <Box sx={{
          bgcolor: tokens.colors.wrapper.background,
          borderRadius: `${tokens.radius.wrapper}px`,
          boxShadow: tokens.shadow.wrapper,
          p: { xs: 2, md: 4 }
        }}>

          {/* TIÊU ĐỀ TRANG */}
          <Typography
            component="h1"
            sx={{
              fontWeight: tokens.typography.h1.desktop.fontWeight,
              fontSize: { xs: tokens.typography.h1.mobile.fontSize, md: tokens.typography.h1.desktop.fontSize },
              color: tokens.colors.accent,
              mb: 2
            }}
          >
            {membershipData.title}
          </Typography>



          {/* DANH SÁCH SECTIONS */}
          {membershipData.sections.map((section, index) => (
            <Box
              key={section.slug}
              ref={(el) => { sectionRefs.current[section.slug] = el; }}
              sx={{
                mb: 1,
                pb: 0,
                // Offset scroll để header không che
                scrollMarginTop: '80px'
              }}
            >
              {/* Tiêu đề section */}
              <Typography
                component="h2"
                sx={{
                  fontWeight: tokens.typography.h2.desktop.fontWeight,
                  fontSize: {
                    xs: tokens.typography.h2.mobile.fontSize,
                    md: tokens.typography.h2.desktop.fontSize
                  },
                  color: tokens.colors.accent,
                  mb: 2
                }}
              >
                {section.title}
              </Typography>

              {/* Ảnh banner (nếu có) - full width, tự cao theo ảnh */}
              {section.imageUrl && (
                <Box sx={{ mb: 2, position: 'relative' }}>
                  {/* Skeleton loading */}
                  {imageLoadingMap[section.slug] && !imageErrorMap[section.slug] && (
                    <Skeleton
                      variant="rectangular"
                      animation="wave"
                      sx={{
                        width: '100%',
                        height: { xs: 180, md: 330 },
                        bgcolor: tokens.colors.skeleton
                      }}
                    />
                  )}

                  {/* Fallback khi ảnh lỗi */}
                  {imageErrorMap[section.slug] ? (
                    <Box sx={{
                      height: { xs: 180, md: 320 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: tokens.colors.card.background
                    }}>
                      <Typography sx={{
                        color: tokens.colors.text.muted,
                        fontSize: { xs: '0.9rem', md: '1.1rem' }
                      }}>
                        Ảnh đang được cập nhật
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      component="img"
                      src={section.imageUrl}
                      alt={section.title}
                      referrerPolicy="no-referrer"
                      onLoad={() => handleImageLoad(section.slug)}
                      onError={() => handleImageError(section.slug)}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        opacity: imageLoadingMap[section.slug] ? 0 : 1,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                  )}
                </Box>
              )}

              {/* Nội dung HTML */}
              {section.content && (
                <Box
                  sx={{
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: tokens.colors.text.secondary,
                    '& h3': {
                      color: tokens.colors.accent,
                      fontSize: { xs: '15px', md: '17px' },
                      fontWeight: 600,
                      mt: 2,
                      mb: 1
                    },
                    '& p': {
                      m: 0,
                      mb: 1
                    },
                    '& ul, & ol': {
                      m: 0,
                      mt: 0.5,
                      mb: 1,
                      pl: 2
                    },
                    '& li': {
                      mb: 0.5
                    },
                    '& li p': {
                      m: 0
                    },
                    '& strong': {
                      color: '#f41717ff'
                    },
                    // Styling cho bảng HTML
                    '& table': {
                      width: '100%',
                      borderCollapse: 'collapse',
                      mb: 2,
                      fontSize: '13px',
                      '& th': {
                        bgcolor: '#1A1A2E',
                        color: '#FFD700',
                        p: { xs: 1, md: 1.25 },
                        border: '1px solid rgba(0,0,0,0.15)',
                        fontWeight: 600
                      },
                      '& td': {
                        p: { xs: 1, md: 1.25 },
                        border: '1px solid rgba(0,0,0,0.1)',
                        color: tokens.colors.text.secondary
                      },
                      '& tr:nth-of-type(even)': {
                        bgcolor: 'rgba(0,0,0,0.03)'
                      }
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}
            </Box>
          ))}

        </Box>
      </Container>
    </Box>
  );
};

export default MembershipPage;
