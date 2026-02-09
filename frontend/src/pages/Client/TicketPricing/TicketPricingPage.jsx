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

// ============================================================
// STYLE TOKENS - Dark Theme (TouchCinema Style)
// ============================================================
const tokens = {
  colors: {
    page: {
      background: 'rgba(233, 233, 245, 1)'
    },
    wrapper: {
      background: '#1A1A2E'
    },
    accent: 'rgb(255 215 0)',
    accentHover: 'none',
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.85)',
      muted: 'rgba(255, 255, 255, 0.7)'
    },
    border: {
      inactive: 'rgba(255, 255, 255, 0.3)',

    },
    card: {
      background: 'rgba(255, 255, 255, 0.06)'
    },
    skeleton: 'rgba(255, 255, 255, 0.06)'
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

// ============================================================
// MOCK DATA
// ============================================================
const MOCK_PRICING_DATA = {
  title: 'Giá Vé rạp NMN Cinema - Hà Nội',
  tabs: [
    {
      name: 'GIÁ VÉ 2D',
      slug: '2D-price',
      imageUrl: 'https://touchcinema.com/storage/slider-tv/z4045880677164-1ba77b4619d45e773581092b6319ac62.jpg',
      sortOrder: 1
    },
    {
      name: 'GIÁ VÉ 3D',
      slug: '3D-price',
      imageUrl: 'https://touchcinema.com/storage/slider-app/z4986572984860-008d90891c78bc2a0b13b8acd84f9e88.jpg',
      sortOrder: 2
    },
    {
      name: 'NGÀY LỄ',
      slug: 'holiday-price',
      imageUrl: 'https://touchcinema.com/storage/slider-tv/z4103264955341-3bb1395fb3108359cda4af45aee336f4-1724913363.jpg',
      sortOrder: 3
    }
  ],
  notes: `
    <p><strong>Ghi chú:</strong></p>
    <ul style="padding-left: 20px; margin: 0;">
      <li>Bảng giá trên áp dụng cho khách hàng có thẻ thành viên, khách hàng không có thẻ thành viên phụ thu 10.000đ/vé đối với ghế thường, 20.000đ/vé đối với ghế đôi.</li>
      <li>Bảng giá trên áp dụng cho suất chiếu thông thường, suất chiếu sớm (suất chiếu đặc biệt, suất chiếu sneakshow) phụ thu 10.000đ/vé đối với ghế thường, 20.000đ/vé đối với ghế đôi.</li>
      <li>Giá vé khi đặt vé trực tuyến trên website và ứng dụng NMN Cinema là giá vé người lớn.</li>
      <li>Giá vé học sinh, sinh viên được áp dụng cho người từ 22 tuổi trở xuống khi mua vé tại quầy.</li>
      <li>Giá vé trẻ em, người cao tuổi, đối tượng ưu tiên áp dụng cho trẻ em, người từ 60 tuổi trở lên, người có công với cách mạng, người có hoàn cảnh đặc biệt khó khăn và các đối tượng khác theo quy định của pháp luật khi mua vé tại quầy.</li>
      <li>Người khuyết tật đặc biệt nặng được miễn giá vé, người khuyết tật nặng được giảm 50% giá vé khi mua vé tại quầy.</li>
      <li>Khách hàng khi đến rạp xem phim vui lòng chứng thực được độ tuổi phù hợp với phim, được quy định căn cứ vào Thông tư số 12/2015/TT-BVHTTDL của Bộ trưởng Bộ Văn hóa, Thể thao và Du lịch có hiệu lực thi hành từ ngày 01/01/2017. NMN Cinema có quyền từ chối việc bán vé hoặc vào phòng chiếu nếu khách hàng không tuân thủ đúng theo quy định.</li>
      <li>Khách hàng khi đến rạp xem phim vui lòng chứng thực được độ tuổi phù hợp với phim, được quy định căn cứ vào Thông tư số 12/2015/TT-BVHTTDL của Bộ trưởng Bộ Văn hóa, Thể thao và Du lịch có hiệu lực thi hành từ ngày 01/01/2017. NMN Cinema có quyền từ chối việc bán vé hoặc vào phòng chiếu nếu khách hàng không tuân thủ đúng theo quy định.</li>
      <li>Khách hàng khi đến rạp xem phim vui lòng chứng thực được độ tuổi phù hợp với phim, được quy định căn cứ vào Thông tư số 12/2015/TT-BVHTTDL của Bộ trưởng Bộ Văn hóa, Thể thao và Du lịch có hiệu lực thi hành từ ngày 01/01/2017. NMN Cinema có quyền từ chối việc bán vé hoặc vào phòng chiếu nếu khách hàng không tuân thủ đúng theo quy định.</li>
      <li>Khách hàng khi đến rạp xem phim vui lòng chứng thực được độ tuổi phù hợp với phim, được quy định căn cứ vào Thông tư số 12/2015/TT-BVHTTDL của Bộ trưởng Bộ Văn hóa, Thể thao và Du lịch có hiệu lực thi hành từ ngày 01/01/2017. NMN Cinema có quyền từ chối việc bán vé hoặc vào phòng chiếu nếu khách hàng không tuân thủ đúng theo quy định.</li>
      <li>Khách hàng khi đến rạp xem phim vui lòng chứng thực được độ tuổi phù hợp với phim, được quy định căn cứ vào Thông tư số 12/2015/TT-BVHTTDL của Bộ trưởng Bộ Văn hóa, Thể thao và Du lịch có hiệu lực thi hành từ ngày 01/01/2017. NMN Cinema có quyền từ chối việc bán vé hoặc vào phòng chiếu nếu khách hàng không tuân thủ đúng theo quy định.</li>
      <li>Khách hàng khi đến rạp xem phim vui lòng chứng thực được độ tuổi phù hợp với phim, được quy định căn cứ vào Thông tư số 12/2015/TT-BVHTTDL của Bộ trưởng Bộ Văn hóa, Thể thao và Du lịch có hiệu lực thi hành từ ngày 01/01/2017. NMN Cinema có quyền từ chối việc bán vé hoặc vào phòng chiếu nếu khách hàng không tuân thủ đúng theo quy định.</li>
      <li>Khách hàng khi đến rạp xem phim vui lòng chứng thực được độ tuổi phù hợp với phim, được quy định căn cứ vào Thông tư số 12/2015/TT-BVHTTDL của Bộ trưởng Bộ Văn hóa, Thể thao và Du lịch có hiệu lực thi hành từ ngày 01/01/2017. NMN Cinema có quyền từ chối việc bán vé hoặc vào phòng chiếu nếu khách hàng không tuân thủ đúng theo quy định.</li>
      <li>Khách hàng khi đến rạp xem phim vui lòng chứng thực được độ tuổi phù hợp với phim, được quy định căn cứ vào Thông tư số 12/2015/TT-BVHTTDL của Bộ trưởng Bộ Văn hóa, Thể thao và Du lịch có hiệu lực thi hành từ ngày 01/01/2017. NMN Cinema có quyền từ chối việc bán vé hoặc vào phòng chiếu nếu khách hàng không tuân thủ đúng theo quy định.</li>

    </ul>
  `,
  status: 'active'
};

// ============================================================
// COMPONENT
// ============================================================
const TicketPricingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [pricingData, setPricingData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Load data
  useEffect(() => {
    // TODO: Replace with API call
    setTimeout(() => {
      setPricingData(MOCK_PRICING_DATA);
      setLoading(false);
    }, 300);
  }, []);

  // Handle URL hash to set active tab
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

  // Reset image states when tab changes
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [activeTab]);

  // Handle tab click
  const handleTabClick = (index, slug) => {
    setActiveTab(index);
    navigate(`/gia-ve#${slug}`, { replace: true });
  };

  // Handle image load/error
  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Loading state - fullscreen overlay with NMN Cinema logo
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

  // No data state
  if (!pricingData) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: tokens.colors.page.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography sx={{ color: tokens.colors.text.primary }}>
          Chưa có dữ liệu bảng giá
        </Typography>
      </Box>
    );
  }

  const currentTab = pricingData.tabs[activeTab];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: tokens.colors.page.background,
      p: 0
    }}>
      <Container maxWidth="lg">
        {/* ========== MAIN WRAPPER - Dark Background ========== */}
        <Box sx={{
          bgcolor: tokens.colors.wrapper.background,
          borderRadius: `${tokens.radius.wrapper}px`,
          boxShadow: tokens.shadow.wrapper,
          p: { xs: 2, md: 4 }
        }}>

          {/* ========== 1) TITLE ========== */}
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

          {/* ========== 2) TABS ========== */}
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
                    // Active state
                    bgcolor: isActive ? tokens.colors.accent : 'transparent',
                    color: tokens.colors.text.primary,
                    border: isActive ? 'none' : `1px solid ${tokens.colors.border.inactive}`,
                    // Disable hover and focus effects
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

          {/* ========== 3) PRICE IMAGE (16:9 aspect ratio) ========== */}
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
            {/* Loading skeleton */}
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

            {/* Error fallback - placeholder image */}
            {imageError && (
              <Box
                component="img"
                src="https://placehold.co/1920x1080/1A1A2E/666666?text=Bảng+giá+vé"
                alt="Bảng giá vé"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            )}

            {/* Actual image - always render, visibility controlled by opacity */}
            {!imageError && currentTab?.imageUrl && (
              <Box
                component="img"
                src={currentTab.imageUrl}
                alt={currentTab?.name}
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

          {/* ========== 4) NOTES (no separate card) ========== */}
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

        </Box>
      </Container>
    </Box>
  );
};

export default TicketPricingPage;
