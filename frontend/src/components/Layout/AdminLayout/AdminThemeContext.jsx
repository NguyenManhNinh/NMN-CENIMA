import { createContext, useContext, useState, useMemo } from 'react';

/**
 * AdminThemeContext – Quản lý chế độ sáng/tối toàn bộ trang admin
 * Cung cấp:
 *  - darkMode: boolean
 *  - toggleDarkMode: hàm chuyển đổi
 *  - colors: bảng màu phù hợp với chế độ hiện tại
 *
 * Tham khảo hệ thống màu từ: MUI Dashboard, Apex Admin, Ant Design Pro
 * Tỷ lệ tương phản tối thiểu: WCAG AA (4.5:1 cho text nhỏ, 3:1 cho text lớn)
 */
const AdminThemeContext = createContext();

// ═══════════════════════════════════════════════════
// BẢNG MÀU CHẾ ĐỘ SÁNG
// ═══════════════════════════════════════════════════
const LIGHT_COLORS = {
  // --- Nền ---
  bgPage: '#f5f7fa',
  bgHeader: '#ffffff',
  bgCard: '#ffffff',
  bgInput: '#f5f5f5',
  bgTableHead: '#f8f9fa',       // Nền header bảng
  bgTableHover: '#f5f7fa',      // Nền khi hover dòng bảng
  bgSubtle: '#fafbfc',          // Nền nhẹ cho item con (combo, promo)
  bgSubtleHover: '#f0f4f8',     // Hover cho item con
  bgProgressTrack: '#eee',      // Track của thanh progress

  // --- Nền tăng cường (stat summary boxes) ---
  bgWarm: '#fff8e1',            // Tổng 30 ngày
  bgBlue: '#e3f2fd',            // Trung bình
  bgGreen: '#e8f5e9',           // Cao nhất
  bgRed: '#fce4ec',             // Thấp nhất
  bgPurple: '#f3e5f5',          // Review
  bgOrange: '#fff3e0',          // Lồng tiếng

  // --- Viền ---
  borderHeader: '#ebebeb',
  borderCard: '#e8e8e8',
  borderTable: '#f0f0f0',       // Viền bảng
  borderSubtle: '#eee',         // Viền nhẹ (divider nội bộ)

  // --- Chữ ---
  textPrimary: '#1a1a2e',
  textSecondary: '#555',
  textMuted: '#999',
  textPlaceholder: '#aaa',
  textDisabled: '#ccc',         // Text vô hiệu (pagination disabled)

  // --- Icon ---
  iconColor: '#555',

  // --- Divider ---
  divider: '#e8e8e8',

  // --- Avatar ---
  avatarBorder: '#e8e8e8',
  rankBorder: '#fff',           // Viền rank badge phim

  // --- Pagination ---
  paginationActive: '#f5a623',
  paginationText: '#666',
  paginationHover: '#f0f0f0',

  // --- MUI Charts ---
  chartAxisColor: '#666',
  chartGridColor: '#f0f0f0'
};

// ═══════════════════════════════════════════════════
// BẢNG MÀU CHẾ ĐỘ TỐI
// Tham khảo: GitHub Dark, Discord, MUI Dark Palette
// ═══════════════════════════════════════════════════
const DARK_COLORS = {
  // --- Nền ---
  bgPage: '#0d1117',            // GitHub Dark nền chính
  bgHeader: '#161b22',          // Header tối hơn nền card
  bgCard: '#161b22',            // Card nền
  bgInput: '#21262d',           // Input nền
  bgTableHead: '#1c2128',       // Header bảng
  bgTableHover: '#1c2128',      // Hover dòng bảng
  bgSubtle: '#1c2128',          // Item con
  bgSubtleHover: '#262c36',     // Hover item con
  bgProgressTrack: '#30363d',   // Track progress bar

  // --- Nền tăng cường (stat summary boxes) – dùng alpha thấp ---
  bgWarm: 'rgba(255, 152, 0, 0.08)',
  bgBlue: 'rgba(33, 150, 243, 0.08)',
  bgGreen: 'rgba(76, 175, 80, 0.08)',
  bgRed: 'rgba(244, 67, 54, 0.08)',
  bgPurple: 'rgba(156, 39, 176, 0.08)',
  bgOrange: 'rgba(255, 152, 0, 0.06)',

  // --- Viền ---
  borderHeader: '#30363d',
  borderCard: '#30363d',
  borderTable: '#30363d',
  borderSubtle: '#30363d',

  // --- Chữ ---
  textPrimary: '#e6edf3',       // GitHub Dark primary text
  textSecondary: '#8b949e',     // GitHub Dark secondary
  textMuted: '#6e7681',         // GitHub Dark muted
  textPlaceholder: '#484f58',
  textDisabled: '#484f58',

  // --- Icon ---
  iconColor: '#8b949e',

  // --- Divider ---
  divider: '#30363d',

  // --- Avatar ---
  avatarBorder: '#30363d',
  rankBorder: '#30363d',

  // --- Pagination ---
  paginationActive: '#f5a623',
  paginationText: '#8b949e',
  paginationHover: '#21262d',

  // --- MUI Charts ---
  chartAxisColor: '#8b949e',
  chartGridColor: '#21262d'
};

/**
 * AdminThemeProvider – Bọc toàn bộ admin layout
 * Lưu trạng thái darkMode và cung cấp bảng màu tương ứng
 */
export const AdminThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Chọn bảng màu dựa trên chế độ hiện tại
  const colors = useMemo(() => darkMode ? DARK_COLORS : LIGHT_COLORS, [darkMode]);

  // Hàm chuyển đổi chế độ sáng/tối
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const value = useMemo(() => ({
    darkMode,
    toggleDarkMode,
    colors
  }), [darkMode, colors]);

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
};

/**
 * Hook sử dụng trong các component con
 * Ví dụ: const { darkMode, colors } = useAdminTheme();
 */
export const useAdminTheme = () => {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error('useAdminTheme phải dùng trong AdminThemeProvider');
  return ctx;
};
