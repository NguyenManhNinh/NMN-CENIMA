import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

let socket = null;

/**
 * Kết nối với Socket.io server
 */
export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io(`${SOCKET_URL}/booking`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  return socket;
};

/**
 * Ngắt kết nối Socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Tham gia phòng theo showtimeId
 * @param {string} showtimeId
 */
export const joinShowtime = (showtimeId) => {
  if (!socket?.connected) {
    connectSocket();
  }
  socket?.emit('joinShowtime', showtimeId);
};

/**
 * Rời phòng theo showtimeId
 * @param {string} showtimeId
 */
export const leaveShowtime = (showtimeId) => {
  socket?.emit('leaveShowtime', showtimeId);
};

/**
 * Lắng nghe sự kiện ghế được giữ
 * @param {Function} callback - (data: { seatCode, userId, timestamp }) => void
 */
export const onSeatHeld = (callback) => {
  socket?.on('seat:held', callback);
};

/**
 * Lắng nghe sự kiện ghế được nhả
 * @param {Function} callback - (data: { seatCode, timestamp }) => void
 */
export const onSeatReleased = (callback) => {
  socket?.on('seat:released', callback);
};

/**
 * Lắng nghe sự kiện ghế đã bán
 * @param {Function} callback - (data: { seatCodes, timestamp }) => void
 */
export const onSeatSold = (callback) => {
  socket?.on('seat:sold', callback);
};

/**
 * Hủy lắng nghe sự kiện
 * @param {string} event
 */
export const offEvent = (event) => {
  socket?.off(event);
};

/**
 * Lấy socket hiện tại
 */
export const getSocket = () => socket;

export default {
  connectSocket,
  disconnectSocket,
  joinShowtime,
  leaveShowtime,
  onSeatHeld,
  onSeatReleased,
  onSeatSold,
  offEvent,
  getSocket
};
