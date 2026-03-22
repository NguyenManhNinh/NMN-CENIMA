import { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '../../../components/Layout/AdminLayout/AdminThemeContext';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress,
  TextField, MenuItem, IconButton, Tooltip, Tab, Tabs, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import GridViewIcon from '@mui/icons-material/GridView';
import ListIcon from '@mui/icons-material/List';
import InboxIcon from '@mui/icons-material/Inbox';
import { getAllRoomsAPI, getRoomByIdAPI, updateRoomAPI } from '../../../apis/roomApi';

// Seat images
import gheThuong from '../../../assets/images/ghe-thuong.png';
import gheVip from '../../../assets/images/ghe-vip.png';
import gheDoi from '../../../assets/images/ghe-doi.png';
import { useToast } from '../../../contexts/ToastContext';

// Loại ghế
const SEAT_TYPE_MAP = {
  standard: { label: 'Ghế Thường', color: '#5C8EC6', bg: '#e3f2fd', img: gheThuong },
  vip: { label: 'Ghế VIP', color: '#F5A623', bg: '#fff8e1', img: gheVip },
  couple: { label: 'Ghế Đôi', color: '#4DD0C8', bg: '#e0f7fa', img: gheDoi }
};

// Card style
const getCardSx = (colors) => ({
  borderRadius: 3,
  border: `1px solid ${colors.borderCard}`,
  bgcolor: colors.bgCard,
  transition: 'all 0.3s ease'
});

const AdminSeatPage = () => {
  const { darkMode, colors } = useAdminTheme();
  const { showToast } = useToast();
  const cardSx = getCardSx(colors);

  // State
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedMapRoom, setSelectedMapRoom] = useState('');
  const [roomDetail, setRoomDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Add seat modal
  const [openAddSeat, setOpenAddSeat] = useState(false);
  const [addSeatRoom, setAddSeatRoom] = useState('');
  const [addSeatRow, setAddSeatRow] = useState('');
  const [addCountStandard, setAddCountStandard] = useState('');
  const [addCountVip, setAddCountVip] = useState('');
  const [addCountCouple, setAddCountCouple] = useState('');
  const [addingSeat, setAddingSeat] = useState(false);

  // Edit seat modal
  const [openEditSeat, setOpenEditSeat] = useState(false);
  const [editSeatData, setEditSeatData] = useState(null);
  const [editSeatType, setEditSeatType] = useState('standard');
  const [editingSeat, setEditingSeat] = useState(false);

  // Delete seat confirm
  const [openDeleteSeatConfirm, setOpenDeleteSeatConfirm] = useState(false);
  const [deleteSeatTarget, setDeleteSeatTarget] = useState(null);

  // Fetch all rooms
  useEffect(() => {
    setLoading(true);
    getAllRoomsAPI()
      .then(res => {
        const data = res.data?.rooms || [];
        setRooms(data);
        if (data.length > 0) setSelectedMapRoom(data[0]._id);
      })
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  // Fetch seatMap khi chọn phòng ở tab sơ đồ
  useEffect(() => {
    if (!selectedMapRoom || activeTab !== 1) return;
    setLoadingMap(true);
    getRoomByIdAPI(selectedMapRoom)
      .then(res => setRoomDetail(res.data?.room || null))
      .catch(() => setRoomDetail(null))
      .finally(() => setLoadingMap(false));
  }, [selectedMapRoom, activeTab]);

  // Flatten seats từ tất cả rooms cho bảng danh sách
  const allSeats = useMemo(() => {
    const seats = [];
    rooms.forEach(room => {
      if (room.seatMap) {
        room.seatMap.forEach(rowData => {
          rowData.seats.forEach(seat => {
            seats.push({
              id: `${room._id}-${rowData.row}${seat.number}`,
              seatName: `${rowData.row}${seat.number}`,
              roomName: room.name,
              roomId: room._id,
              row: rowData.row,
              col: seat.number,
              type: seat.type || 'standard',
              status: seat.isBooked ? 'booked' : 'active'
            });
          });
        });
      }
    });
    return seats;
  }, [rooms]);

  // Filter seats
  const filteredSeats = useMemo(() => {
    let result = allSeats;
    if (selectedRoom !== 'all') result = result.filter(s => s.roomId === selectedRoom);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(s => s.seatName.toLowerCase().includes(q));
    }
    return result;
  }, [allSeats, selectedRoom, searchQuery]);

  // Reset page khi filter thay đổi
  useEffect(() => { setCurrentPage(1); }, [selectedRoom, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSeats.length / itemsPerPage));
  const paginatedSeats = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSeats.slice(start, start + itemsPerPage);
  }, [filteredSeats, currentPage, itemsPerPage]);

  // Hàm thêm ghế (3 loại cùng lúc)
  const handleAddSeats = async () => {
    const std = Number(addCountStandard) || 0;
    const vipC = Number(addCountVip) || 0;
    const coupleC = Number(addCountCouple) || 0;
    if (!addSeatRoom || !addSeatRow || (std + vipC + coupleC) <= 0) return;
    setAddingSeat(true);
    try {
      const res = await getRoomByIdAPI(addSeatRoom);
      const room = res.data?.room;
      if (!room) { showToast('Không tìm thấy phòng!', 'error'); return; }

      const seatMap = room.seatMap || [];
      const rowUpper = addSeatRow.toUpperCase();

      // Tìm hoặc tạo row
      let existingRow = seatMap.find(r => r.row === rowUpper);
      if (!existingRow) {
        existingRow = { row: rowUpper, seats: [] };
        seatMap.push(existingRow);
      }

      let startNum = existingRow.seats.length > 0
        ? Math.max(...existingRow.seats.map(s => s.number)) + 1
        : 1;

      // Thêm ghế Thường
      for (let i = 0; i < std; i++) {
        existingRow.seats.push({ number: startNum++, type: 'standard', isBooked: false });
      }
      // Thêm ghế VIP
      for (let i = 0; i < vipC; i++) {
        existingRow.seats.push({ number: startNum++, type: 'vip', isBooked: false });
      }
      // Thêm ghế Đôi
      for (let i = 0; i < coupleC; i++) {
        existingRow.seats.push({ number: startNum++, type: 'couple', isBooked: false });
      }

      const newTotalSeats = seatMap.reduce((sum, r) => sum + r.seats.length, 0);
      await updateRoomAPI(addSeatRoom, { seatMap, totalSeats: newTotalSeats });

      // Refresh data
      const roomsRes = await getAllRoomsAPI();
      const data = roomsRes.data?.rooms || [];
      setRooms(data);
      if (selectedMapRoom) {
        const detailRes = await getRoomByIdAPI(selectedMapRoom);
        setRoomDetail(detailRes.data?.room || null);
      }

      setOpenAddSeat(false);
      setAddSeatRoom(''); setAddSeatRow('');
      setAddCountStandard(''); setAddCountVip(''); setAddCountCouple('');
      showToast(`Thêm ${std + vipC + coupleC} ghế thành công!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi thêm ghế!', 'error');
    } finally {
      setAddingSeat(false);
    }
  };

  const openEditSeatModal = (seat) => {
    setEditSeatData({ roomId: seat.roomId, row: seat.row, number: seat.col, oldType: seat.type });
    setEditSeatType(seat.type);
    setOpenEditSeat(true);
  };

  const handleEditSeat = async () => {
    if (!editSeatData) return;
    setEditingSeat(true);
    try {
      const res = await getRoomByIdAPI(editSeatData.roomId);
      const room = res.data?.room;
      if (!room) return;
      const seatMap = room.seatMap || [];
      const rowObj = seatMap.find(r => r.row === editSeatData.row);
      if (rowObj) {
        const seatObj = rowObj.seats.find(s => s.number === editSeatData.number);
        if (seatObj) seatObj.type = editSeatType;
      }
      await updateRoomAPI(editSeatData.roomId, { seatMap });
      const roomsRes = await getAllRoomsAPI();
      setRooms(roomsRes.data?.rooms || []);
      setOpenEditSeat(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi sửa ghế!', 'error');
    } finally {
      setEditingSeat(false);
    }
  };

  const handleDeleteSeat = async () => {
    if (!deleteSeatTarget) return;
    const seat = deleteSeatTarget;
    try {
      const res = await getRoomByIdAPI(seat.roomId);
      const room = res.data?.room;
      if (!room) return;
      const seatMap = room.seatMap || [];
      const rowObj = seatMap.find(r => r.row === seat.row);
      if (rowObj) {
        rowObj.seats = rowObj.seats.filter(s => s.number !== seat.col);
        if (rowObj.seats.length === 0) {
          const idx = seatMap.indexOf(rowObj);
          seatMap.splice(idx, 1);
        }
      }
      const newTotal = seatMap.reduce((sum, r) => sum + r.seats.length, 0);
      await updateRoomAPI(seat.roomId, { seatMap, totalSeats: newTotal });
      const roomsRes = await getAllRoomsAPI();
      setRooms(roomsRes.data?.rooms || []);
      if (selectedMapRoom) {
        const detailRes = await getRoomByIdAPI(selectedMapRoom);
        setRoomDetail(detailRes.data?.room || null);
      }
      setOpenDeleteSeatConfirm(false);
      setDeleteSeatTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi xóa ghế!', 'error');
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>

      {/* === HEADER === */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
            Quản lý Ghế
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            {rooms.length} phòng — {allSeats.length} ghế
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddSeat(true)}
          sx={{
            bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5,
            '&:hover': { bgcolor: '#163f78' }
          }}
        >
          Thêm ghế
        </Button>
      </Box>

      {/* === MAIN CARD === */}
      <Card sx={{ ...cardSx }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              minHeight: 38, mb: 2,
              '& .MuiTab-root': {
                minHeight: 38, textTransform: 'none', fontWeight: 600,
                fontSize: '0.85rem', color: colors.textMuted,
                '&.Mui-selected': { color: '#1565c0' }
              },
              '& .MuiTabs-indicator': { bgcolor: '#1565c0' }
            }}
          >
            <Tab label="Danh sách ghế" icon={<ListIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
            <Tab label="Sơ đồ ghế" icon={<GridViewIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          </Tabs>

          <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}`, mb: 2 }} />

          {/* ========== TAB 1: DANH SÁCH GHẾ ========== */}
          {activeTab === 0 && (
            <>
              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  select size="small" value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  sx={{
                    minWidth: 180,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2, fontSize: '0.85rem',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderSubtle },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderSubtle, borderWidth: 1 }
                    }
                  }}
                >
                  <MenuItem value="all">Tất cả phòng</MenuItem>
                  {rooms.map(r => (
                    <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  size="small"
                  placeholder="Tìm kiếm theo tên ghế..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.textMuted }} /></InputAdornment>
                  }}
                  sx={{
                    flex: 1, minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2, fontSize: '0.85rem',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderSubtle },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderSubtle, borderWidth: 1 }
                    }
                  }}
                />
              </Box>

              {/* Table */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress size={36} />
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 600, tableLayout: 'fixed', '& .MuiTableCell-root': { color: colors.textPrimary, borderColor: colors.borderSubtle, py: 1.2, verticalAlign: 'middle' } }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: colors.bgTableHead }}>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 50 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Tên ghế</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 120 }}>Phòng</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 140 }}>Hàng/Cột</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Loại ghế</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Tình trạng</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: colors.textSecondary, fontSize: '0.78rem', width: 100 }}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSeats.length > 0 ? paginatedSeats.map((seat, idx) => {
                        const seatType = SEAT_TYPE_MAP[seat.type] || SEAT_TYPE_MAP.standard;
                        return (
                          <TableRow key={seat.id} sx={{ '&:hover': { bgcolor: colors.bgSubtle } }}>
                            <TableCell sx={{ fontSize: '0.8rem', color: colors.textMuted }}>{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{seat.seatName}</TableCell>
                            <TableCell sx={{ fontSize: '0.82rem' }}>{seat.roomName}</TableCell>
                            <TableCell sx={{ fontSize: '0.82rem', color: colors.textSecondary }}>
                              Hàng {seat.row}, Cột {seat.col}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={seatType.label}
                                size="small"
                                sx={{
                                  height: 24, fontSize: '0.72rem', fontWeight: 600,
                                  bgcolor: darkMode ? 'transparent' : seatType.bg,
                                  color: seatType.color,
                                  border: darkMode ? `1px solid ${seatType.color}` : 'none',
                                  '& .MuiChip-label': { px: 1 }
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={seat.status === 'active' ? 'Hoạt Động' : 'Đã Đặt'}
                                size="small"
                                sx={{
                                  height: 24, fontSize: '0.72rem', fontWeight: 600,
                                  bgcolor: seat.status === 'active'
                                    ? (darkMode ? 'transparent' : '#e8f5e9')
                                    : (darkMode ? 'transparent' : '#ffebee'),
                                  color: seat.status === 'active' ? '#4caf50' : '#f44336',
                                  border: darkMode ? `1px solid ${seat.status === 'active' ? '#4caf50' : '#f44336'}` : 'none',
                                  '& .MuiChip-label': { px: 1 }
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                <Tooltip title="Sửa loại ghế">
                                  <IconButton size="small" onClick={() => openEditSeatModal(seat)} sx={{ color: '#1565c0' }}>
                                    <EditIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Xóa ghế">
                                  <IconButton size="small" onClick={() => { setDeleteSeatTarget(seat); setOpenDeleteSeatConfirm(true); }} sx={{ color: '#e53935' }}>
                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                            <InboxIcon sx={{ fontSize: 48, color: colors.textMuted, mb: 1, opacity: 0.5 }} />
                            <Typography variant="body2" sx={{ color: colors.textMuted }}>
                              Không tìm thấy ghế nào
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Phân trang */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 2, mb: 1 }}>
                  {/* Trang đầu */}
                  <Box
                    onClick={() => setCurrentPage(1)}
                    sx={{
                      width: 32, height: 32, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: currentPage === 1 ? 'default' : 'pointer',
                      color: currentPage === 1 ? (darkMode ? '#555' : '#ccc') : colors.textSecondary,
                      fontSize: '14px', borderRadius: 1,
                      '&:hover': { bgcolor: currentPage === 1 ? 'transparent' : colors.bgSubtle }
                    }}
                  >«</Box>
                  {/* Trang trước */}
                  <Box
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    sx={{
                      width: 32, height: 32, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: currentPage === 1 ? 'default' : 'pointer',
                      color: currentPage === 1 ? (darkMode ? '#555' : '#ccc') : colors.textSecondary,
                      fontSize: '14px', borderRadius: 1,
                      '&:hover': { bgcolor: currentPage === 1 ? 'transparent' : colors.bgSubtle }
                    }}
                  >‹</Box>

                  {/* Số trang */}
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
                        onClick={() => setCurrentPage(pageNum)}
                        sx={{
                          width: 32, height: 32, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer',
                          bgcolor: currentPage === pageNum ? '#1565c0' : 'transparent',
                          color: currentPage === pageNum ? '#fff' : colors.textSecondary,
                          borderRadius: 1, fontSize: '0.82rem',
                          fontWeight: currentPage === pageNum ? 700 : 400,
                          '&:hover': { bgcolor: currentPage === pageNum ? '#1565c0' : colors.bgSubtle }
                        }}
                      >
                        {pageNum}
                      </Box>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <Box sx={{ px: 0.5, color: colors.textMuted, fontSize: '0.82rem' }}>...</Box>
                  )}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <Box
                      onClick={() => setCurrentPage(totalPages)}
                      sx={{
                        width: 32, height: 32, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: colors.textSecondary,
                        borderRadius: 1, fontSize: '0.82rem',
                        '&:hover': { bgcolor: colors.bgSubtle }
                      }}
                    >{totalPages}</Box>
                  )}

                  {/* Trang sau */}
                  <Box
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                    sx={{
                      width: 32, height: 32, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: currentPage === totalPages ? 'default' : 'pointer',
                      color: currentPage === totalPages ? (darkMode ? '#555' : '#ccc') : colors.textSecondary,
                      fontSize: '14px', borderRadius: 1,
                      '&:hover': { bgcolor: currentPage === totalPages ? 'transparent' : colors.bgSubtle }
                    }}
                  >›</Box>
                  {/* Trang cuối */}
                  <Box
                    onClick={() => setCurrentPage(totalPages)}
                    sx={{
                      width: 32, height: 32, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: currentPage === totalPages ? 'default' : 'pointer',
                      color: currentPage === totalPages ? (darkMode ? '#555' : '#ccc') : colors.textSecondary,
                      fontSize: '14px', borderRadius: 1,
                      '&:hover': { bgcolor: currentPage === totalPages ? 'transparent' : colors.bgSubtle }
                    }}
                  >»</Box>
                </Box>
              )}
            </>
          )}

          {/* ========== TAB 2: SƠ ĐỒ GHẾ ========== */}
          {activeTab === 1 && (
            <>
              {/* Title + Room selector */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, fontSize: '1.05rem' }}>
                  Sơ đồ ghế
                </Typography>
                <TextField
                  select size="small" value={selectedMapRoom}
                  onChange={(e) => setSelectedMapRoom(e.target.value)}
                  sx={{
                    minWidth: 160,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2, fontSize: '0.85rem',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderSubtle },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderSubtle, borderWidth: 1 }
                    }
                  }}
                >
                  {rooms.map(r => (
                    <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>
                  ))}
                </TextField>
              </Box>

              {loadingMap ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress size={36} />
                </Box>
              ) : roomDetail?.seatMap?.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>

                  {/* MÀN HÌNH */}
                  <Box sx={{
                    width: '80%', maxWidth: 600, py: 1.2, bgcolor: '#9e9e9e',
                    borderRadius: '4px 4px 50% 50%', textAlign: 'center',
                    mb: 2
                  }}>
                    <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', letterSpacing: 2 }}>
                      MÀN HÌNH
                    </Typography>
                  </Box>

                  {/* Sơ đồ ghế */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    {roomDetail.seatMap.map((rowData) => (
                      <Box key={rowData.row} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                        {/* Row label */}
                        <Typography sx={{
                          width: 60, fontWeight: 700, fontSize: '0.8rem',
                          color: colors.textSecondary, textAlign: 'right', pr: 1,
                          pt: '8px', flexShrink: 0
                        }}>
                          Hàng {rowData.row}
                        </Typography>

                        {/* Seats - max 10 per line */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 440 }}>
                          {rowData.seats.map((seat) => {
                            const sType = seat.type || 'standard';
                            const seatImg = SEAT_TYPE_MAP[sType]?.img || gheThuong;

                            return (
                              <Tooltip
                                key={`${rowData.row}${seat.number}`}
                                title={`${rowData.row}${seat.number} — ${SEAT_TYPE_MAP[sType]?.label || 'Ghế Thường'}`}
                              >
                                <Box sx={{
                                  width: 40, height: 40, display: 'flex', alignItems: 'center',
                                  justifyContent: 'center', position: 'relative', cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  '&:hover': { transform: 'scale(1.15)' }
                                }}>
                                  <Box
                                    component="img"
                                    src={seatImg}
                                    alt={`${rowData.row}${seat.number}`}
                                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  />
                                  <Typography sx={{
                                    position: 'absolute', fontWeight: 700, fontSize: '0.58rem',
                                    color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                    userSelect: 'none'
                                  }}>
                                    {rowData.row}{seat.number}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Legend */}
                  <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {Object.entries(SEAT_TYPE_MAP).map(([key, val]) => (
                      <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Box
                          component="img"
                          src={val.img}
                          alt={val.label}
                          sx={{ width: 24, height: 24, objectFit: 'contain' }}
                        />
                        <Typography sx={{ fontSize: '0.78rem', color: colors.textSecondary, fontWeight: 500 }}>
                          {val.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <EventSeatIcon sx={{ fontSize: 48, color: colors.textMuted, opacity: 0.5, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: colors.textMuted }}>
                    Phòng này chưa có sơ đồ ghế
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* === ADD SEAT DIALOG === */}
      <Dialog open={openAddSeat} onClose={() => setOpenAddSeat(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          Thêm Ghế Mới
          <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
            Thêm ghế vào phòng chiếu
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

            {/* Chọn phòng */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Phòng chiếu
            </Typography>
            <TextField
              select label="Chọn phòng" size="small" fullWidth value={addSeatRoom}
              onChange={(e) => setAddSeatRoom(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
            >
              {rooms.map(r => (
                <MenuItem key={r._id} value={r._id}>
                  {r.name} ({r.type} — {r.totalSeats} ghế)
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ borderBottom: `1px solid ${colors.borderSubtle}` }} />

            {/* Hàng ghế */}
            <TextField
              label="Hàng (A-Z)" size="small" fullWidth
              value={addSeatRow}
              onChange={(e) => setAddSeatRow(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2))}
              placeholder="VD: A, B, C..."
              inputProps={{ maxLength: 2 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
            />

            {/* Số lượng ghế theo loại */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: -1 }}>
              Số lượng ghế theo loại
            </Typography>

            {/* Ghế Thường */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 120 }}>
                <Box component="img" src={gheThuong} alt="Thường" sx={{ width: 24, height: 24, objectFit: 'contain' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#5C8EC6' }}>Thường</Typography>
              </Box>
              <TextField
                type="number" size="small" fullWidth
                value={addCountStandard} onChange={(e) => setAddCountStandard(e.target.value)}
                placeholder="0" inputProps={{ min: 0, max: 50 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
              />
            </Box>

            {/* Ghế VIP */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 120 }}>
                <Box component="img" src={gheVip} alt="VIP" sx={{ width: 24, height: 24, objectFit: 'contain' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#F5A623' }}>VIP</Typography>
              </Box>
              <TextField
                type="number" size="small" fullWidth
                value={addCountVip} onChange={(e) => setAddCountVip(e.target.value)}
                placeholder="0" inputProps={{ min: 0, max: 50 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
              />
            </Box>

            {/* Ghế Đôi */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 120 }}>
                <Box component="img" src={gheDoi} alt="Đôi" sx={{ width: 24, height: 24, objectFit: 'contain' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#4DD0C8' }}>Đôi</Typography>
              </Box>
              <TextField
                type="number" size="small" fullWidth
                value={addCountCouple} onChange={(e) => setAddCountCouple(e.target.value)}
                placeholder="0" inputProps={{ min: 0, max: 50 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)', borderWidth: 1 } } }}
              />
            </Box>

            {/* Preview */}
            {addSeatRoom && addSeatRow && ((Number(addCountStandard) || 0) + (Number(addCountVip) || 0) + (Number(addCountCouple) || 0)) > 0 && (
              <Box sx={{
                bgcolor: darkMode ? 'rgba(21,101,192,0.08)' : '#f0f7ff',
                borderRadius: 2, p: 1.5, border: `1px solid ${darkMode ? 'rgba(21,101,192,0.2)' : '#e3f2fd'}`
              }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                  Xem trước — Hàng {addSeatRow}, Phòng: {rooms.find(r => r._id === addSeatRoom)?.name || '—'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {Number(addCountStandard) > 0 && <Chip label={`Thường: ${addCountStandard}`} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#e3f2fd', color: '#5C8EC6' }} />}
                  {Number(addCountVip) > 0 && <Chip label={`VIP: ${addCountVip}`} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#fff8e1', color: '#F5A623' }} />}
                  {Number(addCountCouple) > 0 && <Chip label={`Đôi: ${addCountCouple}`} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#e0f7fa', color: '#4DD0C8' }} />}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setOpenAddSeat(false)}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}
          >
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleAddSeats}
            disabled={addingSeat || !addSeatRoom || !addSeatRow || ((Number(addCountStandard) || 0) + (Number(addCountVip) || 0) + (Number(addCountCouple) || 0)) <= 0}
            startIcon={addingSeat ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <AddIcon />}
            sx={{
              bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5,
              '&:hover': { bgcolor: '#163f78' },
              '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' }
            }}
          >
            {addingSeat ? 'Đang thêm...' : 'Thêm ghế'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === EDIT SEAT DIALOG === */}
      <Dialog open={openEditSeat} onClose={() => setOpenEditSeat(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary, pb: 0.5, fontSize: '1.2rem' }}>
          Sửa Loại Ghế
          {editSeatData && (
            <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.8rem', mt: 0.3 }}>
              Ghế {editSeatData.row}{editSeatData.number}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {Object.entries(SEAT_TYPE_MAP).map(([key, val]) => (
              <Box
                key={key}
                onClick={() => setEditSeatType(key)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, cursor: 'pointer',
                  border: `2px solid ${editSeatType === key ? val.color : colors.borderSubtle}`,
                  bgcolor: editSeatType === key ? (darkMode ? 'rgba(21,101,192,0.08)' : val.bg) : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: val.color }
                }}
              >
                <Box component="img" src={val.img} alt={val.label} sx={{ width: 28, height: 28, objectFit: 'contain' }} />
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: editSeatType === key ? val.color : colors.textPrimary }}>
                  {val.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setOpenEditSeat(false)}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}
          >
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSeat}
            disabled={editingSeat}
            startIcon={editingSeat ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <EditIcon />}
            sx={{
              bgcolor: '#1B4F93', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5,
              '&:hover': { bgcolor: '#163f78' },
              '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' }
            }}
          >
            {editingSeat ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DELETE SEAT CONFIRM DIALOG === */}
      <Dialog open={openDeleteSeatConfirm} onClose={() => setOpenDeleteSeatConfirm(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.bgCard } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: '#e53935', pb: 0.5, fontSize: '1.15rem' }}>
          <WarningAmberIcon sx={{ color: '#ff9800', fontSize: 28 }} />
          Xác nhận xóa ghế
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: colors.textPrimary, mt: 1 }}>
            Bạn có chắc chắn muốn xóa ghế <b>{deleteSeatTarget?.seatName}</b> không?
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, mt: 1 }}>
            Phòng: {deleteSeatTarget?.roomName} — Hàng {deleteSeatTarget?.row}, Cột {deleteSeatTarget?.col}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#e53935', mt: 1, fontStyle: 'italic' }}>
            Ghế sẽ bị xóa khỏi sơ đồ phòng. Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setOpenDeleteSeatConfirm(false)}
            sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}
          >
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteSeat}
            startIcon={<DeleteIcon />}
            sx={{
              bgcolor: '#e53935', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5,
              '&:hover': { bgcolor: '#c62828' }
            }}
          >
            Xóa ghế
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSeatPage;
