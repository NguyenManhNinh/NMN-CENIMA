import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';

const PermissionContext = createContext(null);

/**
 * Hook kiểm tra quyền
 * - hasPermission('phim.them') → kiểm tra 1 quyền cụ thể
 * - hasAnyPermission('phim') → kiểm tra có bất kỳ quyền phim.* nào
 * - isMaster → admin toàn quyền
 */
export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    return { permissions: [], isMaster: false, hasPermission: () => false, hasAnyPermission: () => false };
  }
  return context;
};

// Helper đọc user từ localStorage
const readUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch { return {}; }
};

export function PermissionProvider({ children }) {
  // State reactive — cập nhật khi localStorage thay đổi
  const [user, setUser] = useState(readUserFromStorage);

  // Lắng nghe storage event (khi tab khác thay đổi localStorage)
  // + poll kiểm tra mỗi khi component mount lại
  useEffect(() => {
    // Re-read khi focus lại tab (cover case login/logout trên cùng tab)
    const handleFocus = () => {
      const current = readUserFromStorage();
      setUser(prev => {
        // Chỉ update nếu permissions thực sự thay đổi
        const prevStr = JSON.stringify(prev.permissions || []);
        const newStr = JSON.stringify(current.permissions || []);
        if (prevStr !== newStr || prev.isMaster !== current.isMaster) {
          return current;
        }
        return prev;
      });
    };

    // Lắng nghe storage event (cross-tab)
    const handleStorage = (e) => {
      if (e.key === 'user') {
        setUser(readUserFromStorage());
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    // Check ngay khi mount
    handleFocus();

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const permissions = user.permissions || [];
  const isMaster = user.isMaster || permissions.includes('*');

  // Force refresh — gọi từ bên ngoài khi cần (VD: sau login)
  const refreshPermissions = useCallback(() => {
    setUser(readUserFromStorage());
  }, []);

  const value = useMemo(() => ({
    permissions,
    isMaster,
    refreshPermissions,

    // Kiểm tra 1 permission cụ thể: hasPermission('phim.them')
    hasPermission: (key) => {
      if (isMaster) return true;
      return permissions.includes(key);
    },

    // Kiểm tra có bất kỳ permission nào thuộc module: hasAnyPermission('phim')
    hasAnyPermission: (module) => {
      if (isMaster) return true;
      return permissions.some(p => p.startsWith(module + '.'));
    }
  }), [permissions, isMaster, refreshPermissions]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export default PermissionContext;
