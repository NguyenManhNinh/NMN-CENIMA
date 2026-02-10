import { useState, useEffect } from 'react';
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
import { getTicketPricingAPI } from '../../../apis/ticketPricingApi';

// STYLE TOKENS - Hệ thống màu sắc & typography
const tokens = {
  colors: {
    page: {
      background: 'rgba(233, 233, 245, 1)'     // Nền trang tổng thể
    },
    wrapper: {
      background: '#1A1A2E'                      // Nền wrapper chính (tối)
    },
    accent: 'rgb(255 215 0)',                     // Màu vàng cho tab active
    text: {
      primary: '#FFFFFF',                         // Tiêu đề, text chính
      secondary: 'rgba(255, 255, 255, 0.85)',     // Nội dung ghi chú
      muted: 'rgba(255, 255, 255, 0.7)'          // Text phụ, placeholder
    },
    border: {
      inactive: 'rgba(255, 255, 255, 0.3)'       // Viền tab không active
    },
    card: {
      background: 'rgba(255, 255, 255, 0.06)'    // Nền fallback khi ảnh lỗi
    },
    skeleton: 'rgba(255, 255, 255, 0.06)'         // Nền skeleton loading
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
    tab: {
      fontSize: '14px',
      fontWeight: 600
    },
    body: {
      fontSize: '14px',
      lineHeight: 1.8
    }
  }
};

// COMPONENT CHÍNH
const TicketPricingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ========== STATE ==========
  const [pricingData, setPricingData] = useState(null);   // Dữ liệu bảng giá từ API
  const [activeTab, setActiveTab] = useState(0);          // Index tab đang chọn
  const [loading, setLoading] = useState(true);           // Trạng thái đang tải dữ liệu
  const [error, setError] = useState(null);               // Thông báo lỗi (nếu có)
  const [imageLoading, setImageLoading] = useState(true); // Trạng thái đang tải ảnh
  const [imageError, setImageError] = useState(false);    // Ảnh bị lỗi không tải được

  // EFFECT: Gọi API lấy bảng giá
  useEffect(() => {
    const fetchPricing = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTicketPricingAPI();
        if (response?.success && response?.data) {
          setPricingData(response.data);
        } else {
          setError('Không tải được bảng giá vé');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // API trả về 404 = chưa có bảng giá nào
          setPricingData(null);
        } else {
          setError('Không tải được bảng giá vé. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  // EFFECT: Đồng bộ URL hash với tab đang chọn
  // VD: URL /gia-ve#3D-price → tự động chuyển đến tab "GIÁ VÉ 3D"
  useEffect(() => {
    if (!pricingData) return;

    const hash = location.hash.replace('#', '');
    if (hash) {
      const tabIndex = pricingData.tabs.findIndex(tab => tab.slug === hash);
      if (tabIndex !== -1) {
        setActiveTab(tabIndex);
      }
    }
  }, [location.hash, pricingData]);

  // EFFECT: Reset trạng thái ảnh khi chuyển tab
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [activeTab]);

  // HANDLERS

  /** Xử lý khi nhấn chọn tab */
  const handleTabClick = (index, slug) => {
    setActiveTab(index);
    navigate(`/gia-ve#${slug}`, { replace: true });
  };

  /** Xử lý khi ảnh tải thành công */
  const handleImageLoad = () => setImageLoading(false);

  /** Xử lý khi ảnh tải thất bại */
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

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
        {/* Logo NMN Cinema */}
        <Box
          component="img"
          src="/NMN_CENIMA_LOGO.png"
          alt="NMN Cinema"
          sx={{ width: 200, height: 200, mb: 1.5, objectFit: 'contain' }}
        />

        {/* Vòng xoay loading */}
        <CircularProgress
          size={40}
          thickness={2}
          sx={{ color: '#F5A623', mb: 2 }}
        />

        {/* Text chờ */}
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
  // RENDER: Chưa có dữ liệu (API trả 404)
  if (!pricingData) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: tokens.colors.page.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography sx={{ color: '#333' }}>
          Chưa có dữ liệu bảng giá
        </Typography>
      </Box>
    );
  }

  // Tab hiện tại đang được chọn
  const currentTab = pricingData.tabs[activeTab];

  // RENDER: Nội dung chính
  return (
    <Box sx={{
      minHeight: '100vh',
      background: tokens.colors.page.background,
      p: 0
    }}>
      <Container maxWidth="lg">
        {/* WRAPPER CHÍNH - Nền tối */}
        <Box sx={{
          bgcolor: tokens.colors.wrapper.background,
          borderRadius: `${tokens.radius.wrapper}px`,
          boxShadow: tokens.shadow.wrapper,
          p: { xs: 2, md: 4 }
        }}>

          {/* TIÊU ĐỀ */}
          <Typography
            component="h1"
            sx={{
              fontWeight: tokens.typography.h1.desktop.fontWeight,
              fontSize: { xs: tokens.typography.h1.mobile.fontSize, md: tokens.typography.h1.desktop.fontSize },
              color: tokens.colors.text.primary,
              mb: 2
            }}
          >
            {pricingData.title}
          </Typography>

          {/* DANH SÁCH TABS */}
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 3
          }}>
            {pricingData.tabs.map((tab, index) => {
              const isActive = index === activeTab;
              return (
                <Button
                  key={tab.slug}
                  onClick={() => handleTabClick(index, tab.slug)}
                  sx={{
                    minHeight: '44px',
                    px: { xs: 2, md: 3 },
                    py: 1,
                    fontSize: tokens.typography.tab.fontSize,
                    fontWeight: tokens.typography.tab.fontWeight,
                    textTransform: 'uppercase',
                    borderRadius: `${tokens.radius.button}px`,
                    transition: 'all 0.2s ease',
                    // Trạng thái active: nền vàng | inactive: viền trắng mờ
                    bgcolor: isActive ? tokens.colors.accent : 'transparent',
                    color: tokens.colors.text.primary,
                    border: isActive ? 'none' : `1px solid ${tokens.colors.border.inactive}`,
                    // Tắt hiệu ứng hover và focus
                    '&:hover': {
                      bgcolor: isActive ? tokens.colors.accent : 'transparent',
                      borderColor: isActive ? 'transparent' : tokens.colors.border.inactive
                    },
                    '&:focus': {
                      bgcolor: isActive ? tokens.colors.accent : 'transparent',
                      outline: 'none'
                    }
                  }}
                >
                  {tab.name}
                </Button>
              );
            })}
          </Box>

          {/* ẢNH BẢNG GIÁ (tỷ lệ 16:9) */}
          <Box sx={{
            mb: 3,
            borderRadius: 0,
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '16 / 9',
            bgcolor: 'transparent',
            border: 'none',
            boxShadow: 'none'
          }}>
            {/* Skeleton loading khi ảnh đang tải */}
            {imageLoading && !imageError && (
              <Skeleton
                variant="rectangular"
                animation="wave"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgcolor: tokens.colors.skeleton
                }}
              />
            )}

            {/* Fallback khi ảnh bị lỗi */}
            {imageError && (
              <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: tokens.colors.card.background,
                gap: 1
              }}>
                <Typography sx={{
                  color: tokens.colors.text.muted,
                  fontSize: { xs: '0.9rem', md: '1.1rem' }
                }}>
                  Ảnh đang được cập nhật
                </Typography>
                <Typography sx={{
                  color: tokens.colors.text.muted,
                  fontSize: { xs: '0.8rem', md: '0.9rem' },
                  opacity: 0.7
                }}>
                  Vui lòng quay lại sau
                </Typography>
              </Box>
            )}

            {/* Ảnh bảng giá - luôn render, dùng opacity để chuyển trạng thái mượt */}
            {!imageError && currentTab?.imageUrl && (
              <Box
                component="img"
                src={currentTab.imageUrl}
                alt={currentTab?.name}
                referrerPolicy="no-referrer"
                onLoad={handleImageLoad}
                onError={handleImageError}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  opacity: imageLoading ? 0 : 1,
                  transition: 'opacity 0.3s ease'
                }}
              />
            )}
          </Box>

          {/* GHI CHÚ (HTML content) */}
          {pricingData.notes && (
            <Box
              sx={{
                mt: 3,
                fontSize: tokens.typography.body.fontSize,
                lineHeight: tokens.typography.body.lineHeight,
                color: tokens.colors.text.secondary,
                '& p': {
                  mb: 1.5
                },
                '& ul': {
                  pl: 2.5,
                  m: 0,
                  '& li': {
                    mb: 1.5
                  }
                },
                '& strong': {
                  color: tokens.colors.text.primary
                }
              }}
              dangerouslySetInnerHTML={{ __html: pricingData.notes }}
            />
          )}

        </Box>
      </Container>
    </Box>
  );
};

export default TicketPricingPage;
