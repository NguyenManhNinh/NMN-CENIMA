import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  Instagram as InstagramIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
// Logo
import LogoNMNCinema from '../../../../assets/images/NMN_CENIMA_LOGO.png';


// STYLES
const styles = {
  footer: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    pt: 5,
    pb: 3,
    mt: 'auto', // Đẩy footer xuống cuối trang
    userSelect: 'none'  // Ngăn bôi đen gây lẩy lẩy
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#f9a825',
    mb: 2,
    fontSize: '1.1rem'
  },
  link: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    display: 'block',
    mb: 1,
    transition: 'color 0.2s',
    '&:hover': {
      color: '#f9a825'
    }
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1.5,
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.9rem'
  },
  socialIcon: {
    color: '#fff',
    '&:hover': {
      color: '#f9a825',
      transform: 'scale(1.1)'
    },
    '&:focus': {
      outline: 'none'
    },
    '&.Mui-focusVisible': {
      outline: 'none'
    }
  },
  copyright: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1rem',
    mt: 3
  }
};

// FOOTER LINKS DATA
const footerLinks = {
  // Cột "Về chúng tôi"
  about: [
    { label: 'Giới thiệu', path: '/gioi-thieu' },
    { label: 'Hệ thống rạp', path: '/he-thong-rap' },
    { label: 'Liên hệ', path: '/lien-he' },
    { label: 'Tuyển dụng', path: '/tuyen-dung' }
  ],
  // Cột "Hỗ trợ"
  support: [
    { label: 'Câu hỏi thường gặp', path: '/cau-hoi-thuong-gap' },
    { label: 'Điều khoản sử dụng', path: '/dieu-khoan-su-dung' },
    { label: 'Chính sách bảo mật', path: '/chinh-sach-bao-mat' },
    { label: 'Góp ý khiếu nại', path: '/gop-y-khieu-nai' }
  ]
};

// Thông tin liên hệ
const contactInfo = {
  address: 'Hà Nội',
  phone: '0849045706',
  email: 'support@nmncinema.com'
};

// FOOTER COMPONENT
function Footer() {
  return (
    <Box component="footer" sx={styles.footer}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>

          {/* Thông tin rạp */}
          <Grid item xs={12} sm={6} md={4}>
            <img src={LogoNMNCinema} alt="Logo NMN Cinema" style={{ height: 76, marginBottom: 16 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', mb: 2 }}>
              Hệ thống rạp chiếu phim hiện đại với công nghệ âm thanh và hình ảnh tiên tiến nhất.
            </Typography>

            {/* Mạng xã hội */}
            <Stack direction="row" spacing={1}>
              <IconButton
                component="a"
                href="https://www.facebook.com/nguymanhninh/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                sx={{ ...styles.socialIcon, "&:hover": { color: "#1877F2", }, }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://github.com/NguyenManhNinh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                sx={{
                  ...styles.socialIcon,
                  "&:hover": { color: "#24292F" },
                }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://www.instagram.com/nmninh._.5205//"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                sx={{
                  ...styles.socialIcon,
                  "&:hover": { color: "#CD486B" },
                }}
              >
                <InstagramIcon />
              </IconButton>
            </Stack>
          </Grid>

          {/*CỘT 2: Liên kết nhanh*/}
          <Grid item xs={6} sm={3} md={2}>
            <Typography sx={{ ...styles.sectionTitle, color: 'white' }}>
              Về chúng tôi
            </Typography>
            {footerLinks.about.map((link) => (
              <Box
                key={link.path}
                component={Link}
                to={link.path}
                sx={styles.link}
              >
                {link.label}
              </Box>
            ))}
          </Grid>

          {/*CỘT 3: Hỗ trợ*/}
          <Grid item xs={6} sm={3} md={2}>
            <Typography sx={{ ...styles.sectionTitle, color: 'white' }}>
              Hỗ trợ
            </Typography>
            {footerLinks.support.map((link) => (
              <Box
                key={link.path}
                component={Link}
                to={link.path}
                sx={styles.link}
              >
                {link.label}
              </Box>
            ))}
          </Grid>

          {/*CỘT 4: Liên hệ*/}
          <Grid item xs={12} sm={6} md={4}>
            <Typography sx={{ ...styles.sectionTitle, color: 'white' }}>
              Liên hệ
            </Typography>

            <Box sx={styles.contactItem}>
              <LocationIcon sx={{ color: '#f1efeaff', fontSize: 20 }} />
              <Typography variant="body2">{contactInfo.address}</Typography>
            </Box>

            <Box sx={styles.contactItem}>
              <PhoneIcon sx={{ color: '#f1efeaff', fontSize: 20 }} />
              <Typography variant="body2">{contactInfo.phone}</Typography>
            </Box>

            <Box sx={styles.contactItem}>
              <EmailIcon sx={{ color: '#f1efeaff', fontSize: 20 }} />
              <Typography variant="body2">{contactInfo.email}</Typography>
            </Box>
          </Grid>

        </Grid>

        {/*DIVIDER*/}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 3 }} />

        {/* COPYRIGHT */}
        <Typography sx={styles.copyright}>
          2026 NMN Cinema. Đồ án tốt nghiệp - Nguyễn Mạnh Ninh (2200571)
        </Typography>

      </Container>
    </Box>
  );
}

export default Footer;
