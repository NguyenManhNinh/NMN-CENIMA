import { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { getMyTicketsAPI } from '../../../apis/ticketApi';

const font = '"Nunito Sans", sans-serif';

const cellSx = {
  fontSize: '0.78rem',
  color: 'rgba(0,0,0,0.7)',
  fontFamily: font,
  textAlign: 'center'
};

export default function WatchedMovies() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const nameUpper = (user?.name || 'Khách hàng').toUpperCase();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await getMyTicketsAPI();
        // Lấy vé VALID (đã mua) và USED (đã check-in), bỏ VOID (đã hủy)
        const watchedTickets = (res.data?.tickets || []).filter(t => t.status === 'USED' || t.status === 'VALID');
        setTickets(watchedTickets);
      } catch (error) {
        console.error('Lỗi lấy danh sách phim đã xem:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Gom nhóm vé theo movieId (1 phim nhiều ghế = 1 dòng)
  const groupedByMovie = tickets.reduce((acc, ticket) => {
    const movieId = ticket.showtimeId?.movieId?._id;
    if (!movieId) return acc;

    const key = `${movieId}_${ticket.showtimeId?._id}`;
    if (!acc[key]) {
      acc[key] = {
        movieTitle: ticket.showtimeId?.movieId?.title || 'N/A',
        posterUrl: ticket.showtimeId?.movieId?.posterUrl || '',
        duration: ticket.showtimeId?.movieId?.duration || 0,
        room: ticket.showtimeId?.roomId?.name || 'N/A',
        cinema: ticket.showtimeId?.cinemaId?.name || 'NMN Cinema',
        showtime: ticket.showtimeId?.startAt,
        format: ticket.showtimeId?.format || '2D',
        usedAt: ticket.usedAt,
        seats: []
      };
    }
    acc[key].seats.push(ticket.seatCode);
    return acc;
  }, {});

  const allMovies = Object.values(groupedByMovie).sort((a, b) =>
    new Date(b.showtime) - new Date(a.showtime)
  );

  // Lấy danh sách năm từ dữ liệu (sắp xếp giảm dần)
  const years = [...new Set(
    allMovies.map(m => m.showtime ? new Date(m.showtime).getFullYear() : null).filter(Boolean)
  )].sort((a, b) => b - a);

  // Lọc theo năm
  const movieList = filter === 'all'
    ? allMovies
    : allMovies.filter(m => m.showtime && new Date(m.showtime).getFullYear() === Number(filter));

  // Loading
  if (loading) {
    return (
      <Box sx={{ bgcolor: '#fff', p: 3 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 80 : 50} sx={{ mb: 1.5, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // Columns for desktop
  const COLUMNS = [
    { key: 'stt', label: 'STT', flex: 0.5 },
    { key: 'movie', label: 'Phim', flex: 2.5 },
    { key: 'showtime', label: 'Suất chiếu', flex: 1.5 },
    { key: 'room', label: 'Phòng', flex: 0.8 },
    { key: 'seats', label: 'Ghế', flex: 1 },
    { key: 'format', label: 'Định dạng', flex: 0.8 },
    { key: 'usedAt', label: 'Ngày xem', flex: 1.5 }
  ];

  return (
    <Box sx={{ bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        px: { xs: 2, md: 3 },
        py: 1.5,
        borderBottom: '1px solid rgba(0,0,0,0.08)'
      }}>
        <Typography sx={{ fontSize: '0.85rem', color: '#555', fontFamily: font }}>
          <b style={{ color: '#1a2332' }}>{nameUpper}</b> Đây là danh sách các phim bạn đã xem.
        </Typography>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
          sx={{
            fontSize: '0.8rem',
            fontFamily: font,
            height: 34,
            minWidth: 80,
            '& .MuiSelect-select': { py: 0.5 },
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' }
          }}
        >
          <MenuItem value="all" sx={{ fontSize: '0.8rem', fontFamily: font }}>Tất cả</MenuItem>
          {years.map(year => (
            <MenuItem key={year} value={String(year)} sx={{ fontSize: '0.8rem', fontFamily: font }}>{year}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Empty state */}
      {movieList.length === 0 && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          py: 6
        }}>
          <ErrorOutlineIcon sx={{ fontSize: 20, color: 'rgba(0,0,0,0.35)' }} />
          <Typography sx={{ fontSize: '1.2rem', color: 'rgba(0,0,0,0.45)', fontFamily: font }}>
            Không tìm thấy kết quả nào.
          </Typography>
        </Box>
      )}

      {/* =============== MOBILE CARD LAYOUT =============== */}
      {movieList.length > 0 && isMobile && (
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {movieList.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                gap: 1.5,
                p: 1.5,
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '10px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              {/* Poster */}
              {item.posterUrl && (
                <Box
                  component="img"
                  src={item.posterUrl}
                  alt={item.movieTitle}
                  sx={{
                    width: 55,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: '6px',
                    flexShrink: 0
                  }}
                />
              )}
              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1a2332',
                  fontFamily: font,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mb: 0.3
                }}>
                  {item.movieTitle}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.5)', fontFamily: font }}>
                  Suất: {formatDate(item.showtime)}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.5)', fontFamily: font }}>
                  Phòng: {item.room} • {item.format} • Ghế: {item.seats.join(', ')}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.4)', fontFamily: font, mt: 0.3 }}>
                  Ngày xem: {formatDate(item.showtime)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* =============== DESKTOP TABLE LAYOUT =============== */}
      {movieList.length > 0 && !isMobile && (
        <Box sx={{ overflow: 'auto' }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            bgcolor: '#f5f5f5',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            px: 2,
            py: 1.2,
            minWidth: 700
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
          {movieList.map((item, idx) => (
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
                minWidth: 700
              }}
            >
              {/* STT */}
              <Typography sx={{ ...cellSx, flex: 0.5 }}>{idx + 1}</Typography>

              {/* Phim */}
              <Box sx={{ flex: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.posterUrl && (
                  <Box
                    component="img"
                    src={item.posterUrl}
                    alt={item.movieTitle}
                    sx={{ width: 36, height: 52, objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                  />
                )}
                <Typography sx={{
                  ...cellSx,
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'rgba(0,0,0,0.8)'
                }}>
                  {item.movieTitle}
                </Typography>
              </Box>

              {/* Suất chiếu */}
              <Typography sx={{ ...cellSx, flex: 1.5, fontSize: '0.75rem' }}>
                {formatDate(item.showtime)}
              </Typography>

              {/* Phòng */}
              <Typography sx={{ ...cellSx, flex: 0.8 }}>{item.room}</Typography>

              {/* Ghế */}
              <Typography sx={{ ...cellSx, flex: 1, fontWeight: 600 }}>
                {item.seats.join(', ')}
              </Typography>

              {/* Định dạng */}
              <Typography sx={{ ...cellSx, flex: 0.8 }}>{item.format}</Typography>

              {/* Ngày xem */}
              <Typography sx={{ ...cellSx, flex: 1.5, fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>
                {formatDate(item.showtime)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
