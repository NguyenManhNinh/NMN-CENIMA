// Mock User Data - Dữ liệu user mẫu
export const mockUser = {
  _id: 'user1',
  name: 'Nguyễn Mạnh Ninh',
  email: 'nguyenmanhninh@gmail.com',
  phone: '0987654321',
  role: 'user',
  avatar: '/images/default-avatar.jpg',
  points: 1500,
  rank: 'VIP',
  isActive: true,
  createdAt: '2024-01-15T10:00:00Z'
};

// Mock admin user
export const mockAdmin = {
  _id: 'admin1',
  name: 'Admin NMN',
  email: 'admin@nmncinema.com',
  role: 'admin',
  avatar: '/images/admin-avatar.jpg',
  isActive: true
};

export default mockUser;
