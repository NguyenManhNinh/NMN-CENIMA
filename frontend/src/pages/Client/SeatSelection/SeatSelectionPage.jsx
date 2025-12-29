import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';

// Mock data
import { mockSeats, getSeatsByRow, mockShowtime } from '../../../mocks/mockSeats';

// Ảnh màn hình
import screenImage from '../../../assets/images/manhinhled.png';

// Ảnh ghế
import gheThuong from '../../../assets/images/ghe-thuong.png';
import gheVip from '../../../assets/images/ghe-vip.png';
import gheDoi from '../../../assets/images/ghe-doi.png';
import gheDaBan from '../../../assets/images/ghe-da-ban.png';
import gheDangChon from '../../../assets/images/ghe-dang-chon.png';

// Styles
const styles = {
  wrapper: {
    minHeight: '100vh',
    bgcolor: '#fff',
    py: 4
  },
  screenTitle: {
    color: '#1a3a5c',
    fontWeight: 700,
    fontFamily: 'Arial, sans-serif',
    fontSize: '1.5rem',
    fontStyle: 'italic',
    textAlign: 'center',
    mb: 2
  },
  screenImage: {
    width: '80%',
    maxWidth: 650,
    mx: 'auto',
    display: 'block',
    mb: 4
  },
  seatContainer: {
    maxWidth: 700,
    mx: 'auto',
    px: 2
  },
  seatRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    mb: '6px'
  },
  // Container cho từng ghế (bao gồm ảnh + label)
  seatWrapper: {
    position: 'relative',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
    '&:hover': {
      transform: 'scale(1.1)'
    }
  },
  // Ghế đã bán
  soldSeatWrapper: {
    cursor: 'not-allowed',
    '&:hover': {
      transform: 'none'
    }
  },
  // Ảnh ghế
  seatImage: {
    width: 45,
    height: 40,
    objectFit: 'contain',
    display: 'block'
  },
  // Ghế đôi rộng hơn
  coupleSeatImage: {
    width: 90,
    height: 45
  },
  // Label số ghế
  seatLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#000',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    pointerEvents: 'none',
    userSelect: 'none'
  },
  // Label ghế đôi
  coupleSeatLabel: {
    fontSize: '0.75rem'
  },
  // Legend
  legend: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 3,
    mt: 4,
    pt: 3
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },
  legendImage: {
    width: 35,
    height: 30,
    objectFit: 'contain'
  },
  // Sidebar
  bookingInfo: {
    bgcolor: '#fff',
    borderRadius: 2,
    p: 3,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 100
  },
  continueBtn: {
    mt: 3,
    py: 1.5,
    fontWeight: 700,
    fontSize: '1rem',
    bgcolor: '#F5A623',
    '&:hover': {
      bgcolor: '#E09612'
    }
  },
  loadingScreen: {
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
  }
};

// Hàm lấy ảnh ghế theo loại và trạng thái
const getSeatImage = (seat, isSelected) => {
  if (seat.status === 'sold') return gheDaBan;
  if (isSelected) return gheDangChon;

  switch (seat.type) {
    case 'VIP': return gheVip;
    case 'COUPLE': return gheDoi;
    default: return gheThuong;
  }
};

function SeatSelectionPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showtime, setShowtime] = useState(null);

  // Load dữ liệu ghế và suất chiếu
  useEffect(() => {
    loadData();
  }, [showtimeId]);

  /**
   * Load dữ liệu ghế từ API
   *
   * Hiện tại: Sử dụng mock data (95 ghế mặc định)
   * Sau này: Call API real-time để lấy trạng thái ghế
   *
   * API endpoint dự kiến:
   * GET /api/showtimes/:showtimeId/seats
   *
   * Response mẫu:
   * {
   *   showtime: { movieTitle, cinemaName, roomName, date, time, posterUrl, ... },
   *   seats: [
   *     { id: 'A01', row: 'A', number: 1, type: 'STANDARD', status: 'available', price: 75000 },
   *     { id: 'A02', row: 'A', number: 2, type: 'STANDARD', status: 'sold', price: 75000 },
   *     { id: 'A03', row: 'A', number: 3, type: 'VIP', status: 'reserved', price: 100000 },
   *     ...
   *   ]
   * }
   *
   * Trạng thái ghế:
   * - available: Còn trống
   * - sold: Đã bán
   * - reserved: Đang giữ (bởi người khác)
   * - selected: Đang chọn (của mình)
   */
  const loadData = async () => {
    setLoading(true);

    try {
      // TODO: Thay thế bằng API call thực
      // const response = await getSeatsByShowtimeAPI(showtimeId);
      // setSeats(response.data.seats);
      // setShowtime(response.data.showtime);

      // Mock data - 95 ghế mặc định
      setTimeout(() => {
        setSeats(mockSeats);
        setShowtime(mockShowtime);
        setLoading(false);
      }, 800);

    } catch (error) {
      console.error('Lỗi tải dữ liệu ghế:', error);
      // Fallback to mock data if API fails
      setSeats(mockSeats);
      setShowtime(mockShowtime);
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'sold') return;
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };

  const isSeatSelected = (seatId) => {
    return selectedSeats.some(s => s.id === seatId);
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const seatsByRow = getSeatsByRow();

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;
    navigate('/thanh-toan', {
      state: { showtime, selectedSeats, totalPrice }
    });
  };

  // Loading screen
  if (loading) {
    return (
      <Box sx={styles.loadingScreen}>
        <Box
          component="img"
          src="/NMN_CENIMA_LOGO.png"
          alt="NMN Cinema"
          sx={{ width: 200, height: 200, mb: 1.5, objectFit: 'contain' }}
        />
        <CircularProgress size={40} thickness={2} sx={{ color: '#F5A623', mb: 2 }} />
        <Typography sx={{ color: '#FFA500', fontSize: '1.2rem', fontWeight: 600 }}>
          Đang tải sơ đồ ghế...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.wrapper}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Sơ đồ ghế */}
          <Grid item xs={12} md={8}>
            {/* Tiêu đề MÀN HÌNH */}
            <Typography sx={styles.screenTitle}>
              MÀN HÌNH
            </Typography>

            {/* Ảnh màn hình LED */}
            <Box
              component="img"
              src={screenImage}
              alt="Màn hình"
              sx={styles.screenImage}
            />

            {/* Sơ đồ ghế - dùng ảnh */}
            <Box sx={styles.seatContainer}>
              {Object.keys(seatsByRow).map(row => (
                <Box key={row} sx={styles.seatRow}>
                  {seatsByRow[row].map(seat => (
                    <Box
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      sx={{
                        ...styles.seatWrapper,
                        ...(seat.status === 'sold' ? styles.soldSeatWrapper : {})
                      }}
                      title={`${seat.id} - ${formatPrice(seat.price)}`}
                    >
                      {/* Ảnh ghế */}
                      <Box
                        component="img"
                        src={getSeatImage(seat, isSeatSelected(seat.id))}
                        alt={seat.id}
                        sx={{
                          ...styles.seatImage,
                          ...(seat.type === 'COUPLE' ? styles.coupleSeatImage : {})
                        }}
                      />
                      {/* Label số ghế */}
                      <Typography
                        sx={{
                          ...styles.seatLabel,
                          ...(seat.type === 'COUPLE' ? styles.coupleSeatLabel : {})
                        }}
                      >
                        {seat.id}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ))}

              {/* Legend - Chú thích bằng ảnh */}
              <Box sx={styles.legend}>
                <Box sx={styles.legendItem}>
                  <Box component="img" src={gheThuong} alt="Ghế thường" sx={styles.legendImage} />
                  <Typography variant="body2" color="text.secondary">Ghế thường</Typography>
                </Box>
                <Box sx={styles.legendItem}>
                  <Box component="img" src={gheDoi} alt="Ghế đôi" sx={styles.legendImage} />
                  <Typography variant="body2" color="text.secondary">Ghế đôi</Typography>
                </Box>
                <Box sx={styles.legendItem}>
                  <Box component="img" src={gheVip} alt="Ghế VIP" sx={styles.legendImage} />
                  <Typography variant="body2" color="text.secondary">Ghế VIP</Typography>
                </Box>
                <Box sx={styles.legendItem}>
                  <Box component="img" src={gheDaBan} alt="Ghế đã bán" sx={styles.legendImage} />
                  <Typography variant="body2" color="text.secondary">Ghế đã bán</Typography>
                </Box>
                <Box sx={styles.legendItem}>
                  <Box component="img" src={gheDangChon} alt="Ghế đang chọn" sx={styles.legendImage} />
                  <Typography variant="body2" color="text.secondary">Ghế đang chọn</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Thông tin đặt vé */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
              {/* Thanh cam trên cùng */}
              <Box sx={{ height: 6, bgcolor: '#1a1a2e' }} />

              {/* Nội dung */}
              <Box sx={{ p: 3 }}>
                {/* Poster + Thông tin phim */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  {/* Poster phim */}
                  <Box
                    component="img"
                    src={showtime?.posterUrl || '/placeholder-movie.jpg'}
                    alt={showtime?.movieTitle}
                    sx={{
                      width: 130,
                      height: 180,
                      borderRadius: 1,
                      objectFit: 'cover',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  />
                  {/* Thông tin phim */}
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} sx={{ color: '#1a3a5c', fontSize: '1.1rem', mb: 1 }}>
                      {showtime?.movieTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        {showtime?.format}
                      </Typography>
                      <Box sx={{
                        bgcolor: '#F5A623',
                        color: '#fff',
                        px: 1,
                        py: 0.25,
                        borderRadius: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        T13
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Rạp - Phòng */}
                <Typography sx={{ color: '#1a3a5c', mb: 1 }}>
                  <strong>{showtime?.cinemaName}</strong> - {showtime?.roomName}
                </Typography>

                {/* Suất chiếu */}
                <Typography sx={{ color: '#1a3a5c', mb: 2 }}>
                  Suất: <strong>{showtime?.time}</strong> - {showtime?.date}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Chi tiết vé */}
                {selectedSeats.length > 0 ? (
                  <Box sx={{ mb: 2 }}>
                    {/* Nhóm theo loại ghế */}
                    {(() => {
                      const grouped = selectedSeats.reduce((acc, seat) => {
                        const type = seat.type === 'STANDARD' ? 'Thường' : seat.type === 'VIP' ? 'VIP' : 'Đôi';
                        if (!acc[type]) acc[type] = { seats: [], price: seat.price, count: 0 };
                        acc[type].seats.push(seat.id);
                        acc[type].count++;
                        return acc;
                      }, {});

                      return Object.entries(grouped).map(([type, data]) => (
                        <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            {data.count}x Ghế {type}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#F5A623', fontWeight: 600 }}>
                            {formatPrice(data.price * data.count).replace('₫', 'đ')}
                          </Typography>
                        </Box>
                      ));
                    })()}

                    {/* Ghế đã chọn */}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Ghế: <strong style={{ color: '#1a3a5c' }}>{selectedSeats.map(s => s.id).join(', ')}</strong>
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Vui lòng chọn ghế
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Tổng cộng */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography fontWeight={700} sx={{ color: '#1a3a5c' }}>
                    Tổng cộng
                  </Typography>
                  <Typography fontWeight={700} sx={{ color: '#F5A623', fontSize: '1.2rem' }}>
                    {formatPrice(totalPrice).replace('₫', 'đ')}
                  </Typography>
                </Box>

                {/* Nút Quay lại + Tiếp tục */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="text"
                    onClick={() => navigate(-1)}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      color: '#F5A623',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'rgba(245,166,35,0.08)'
                      }
                    }}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="contained"
                    disabled={selectedSeats.length === 0}
                    onClick={handleContinue}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: '1rem',
                      bgcolor: '#F5A623',
                      borderRadius: 6,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#E09612'
                      },
                      '&:disabled': {
                        bgcolor: '#ccc',
                        color: '#fff'
                      }
                    }}
                  >
                    Tiếp tục
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default SeatSelectionPage;
