import { createTheme } from '@mui/material/styles';

// THEME CONFIGURATION
const theme = createTheme({
  // PALETTE - Bảng màu
  palette: {
    primary: {
      main: '#1a1a2e',
      light: '#2d2d44',
      dark: '#0f0f1a',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#f9a825',
      light: '#ffc107',
      dark: '#f57f17',
      contrastText: '#000000'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#666666'
    },
    error: {
      main: '#d32f2f'
    },
    warning: {
      main: '#f9a825'
    },
    success: {
      main: '#2e7d32'
    },
    info: {
      main: '#0288d1'
    }
  },

  // TYPOGRAPHY - Font chữ
  typography: {
    fontFamily: '"Nunito Sans", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem'
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem'
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },

  // SHAPE - Bo góc
  shape: {
    borderRadius: 8
  },

  // COMPONENTS - Override styles cho MUI components
  components: {
    // Button
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px'
        },
        containedSecondary: {
          color: '#000',
          '&:hover': {
            backgroundColor: '#f57f17'
          }
        }
      }
    },
    // Card
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }
      }
    },
    // TextField
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8
          }
        }
      }
    },
    // Chip
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600
        }
      }
    }
  }
});

export default theme;
