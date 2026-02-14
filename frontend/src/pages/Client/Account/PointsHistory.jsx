import { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import {
  ErrorOutline as ErrorOutlineIcon,
  TrendingUp as EarnIcon,
  TrendingDown as SpendIcon,
  CardGiftcard as BonusIcon
} from '@mui/icons-material';
import { getPointsHistoryAPI } from '../../../apis/loyaltyApi';

const font = '"Nunito Sans", sans-serif';

const TYPE_MAP = {
  EARN: { label: 'Tích điểm', color: '#2e7d32', icon: EarnIcon, prefix: '+' },
  SPEND: { label: 'Sử dụng', color: '#d32f2f', icon: SpendIcon, prefix: '-' },
  BONUS: { label: 'Thưởng', color: '#ed6c02', icon: BonusIcon, prefix: '+' }
};

const COLUMNS = [
  { key: 'date', label: 'Ngày', flex: 1.2 },
  { key: 'description', label: 'Nội dung', flex: 2.5 },
  { key: 'type', label: 'Loại', flex: 1 },
  { key: 'points', label: 'Điểm', flex: 1 }
];

const cellStyle = {
  fontSize: '0.78rem',
  color: 'rgba(0,0,0,0.7)',
  fontFamily: font,
  textAlign: 'center'
};

export default function PointsHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getPointsHistoryAPI();
        setHistory(res.data?.history || []);
      } catch (error) {
        console.error('Lỗi lấy lịch sử điểm:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#fff', p: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 80 : 50} sx={{ mb: 1.5, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        py: 6,
        bgcolor: '#fff',
        mt: 0
      }}>
        <ErrorOutlineIcon sx={{ fontSize: 20, color: 'rgba(0,0,0,0.35)' }} />
        <Typography sx={{
          fontSize: '1.2rem',
          color: 'rgba(0,0,0,0.45)',
          fontFamily: font
        }}>
          Chưa có lịch sử tích điểm.
        </Typography>
      </Box>
    );
  }

  // Helper
  const getDisplayData = (item) => {
    const typeInfo = TYPE_MAP[item.type] || TYPE_MAP.EARN;
    const dateStr = item.date
      ? new Date(item.date).toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit',
        day: '2-digit', month: '2-digit', year: 'numeric'
      })
      : 'N/A';
    return { typeInfo, dateStr };
  };

  // ======================== MOBILE CARD LAYOUT ========================
  const renderMobileCards = () => (
    <Box sx={{ bgcolor: '#fff', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {history.map((item, idx) => {
        const { typeInfo, dateStr } = getDisplayData(item);
        const TypeIcon = typeInfo.icon;
        return (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '10px',
              bgcolor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            {/* Icon */}
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: `${typeInfo.color}10`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <TypeIcon sx={{ fontSize: 20, color: typeInfo.color }} />
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#1a2332',
                fontFamily: font,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.45)', fontFamily: font }}>
                  {dateStr}
                </Typography>
                <Typography sx={{
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  color: typeInfo.color,
                  bgcolor: `${typeInfo.color}12`,
                  px: 0.8, py: 0.15,
                  borderRadius: '8px',
                  fontFamily: font
                }}>
                  {typeInfo.label}
                </Typography>
              </Box>
            </Box>

            {/* Points */}
            <Typography sx={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: typeInfo.color,
              fontFamily: font,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              {typeInfo.prefix}{item.points?.toLocaleString('vi-VN')}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  // ======================== DESKTOP TABLE LAYOUT ========================
  const renderDesktopTable = () => (
    <Box sx={{ bgcolor: '#fff', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        bgcolor: '#f5f5f5',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        px: 2,
        py: 1.2,
        minWidth: 600
      }}>
        {COLUMNS.map((col) => (
          <Typography key={col.key} sx={{
            flex: col.flex,
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'rgba(0,0,0,0.65)',
            fontFamily: font,
            textAlign: 'center'
          }}>
            {col.label}
          </Typography>
        ))}
      </Box>

      {/* Rows */}
      {history.map((item, idx) => {
        const { typeInfo, dateStr } = getDisplayData(item);
        return (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
              transition: 'background 0.15s',
              minWidth: 600
            }}
          >
            <Typography sx={{ ...cellStyle, flex: 1.2, fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)' }}>
              {dateStr}
            </Typography>

            <Typography sx={{ ...cellStyle, flex: 2.5, fontWeight: 600, color: 'rgba(0,0,0,0.8)', textAlign: 'left' }}>
              {item.description}
            </Typography>

            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Typography sx={{
                fontSize: '0.72rem',
                color: typeInfo.color,
                fontFamily: font,
                fontWeight: 700,
                bgcolor: `${typeInfo.color}15`,
                px: 1.2,
                py: 0.3,
                borderRadius: '12px',
                whiteSpace: 'nowrap'
              }}>
                {typeInfo.label}
              </Typography>
            </Box>

            <Typography sx={{
              ...cellStyle,
              flex: 1,
              fontSize: '0.88rem',
              fontWeight: 700,
              color: typeInfo.color
            }}>
              {typeInfo.prefix}{item.points?.toLocaleString('vi-VN')}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  return isMobile ? renderMobileCards() : renderDesktopTable();
}
