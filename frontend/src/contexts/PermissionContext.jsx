import { createContext, useContext, useMemo } from 'react';

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

export function PermissionProvider({ children }) {
  // Lấy permissions từ localStorage (được lưu khi admin login)
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch { return {}; }
  }, []);

  const permissions = user.permissions || [];
  const isMaster = user.isMaster || permissions.includes('*');

  const value = useMemo(() => ({
    permissions,
    isMaster,

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
  }), [permissions, isMaster]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export default PermissionContext;
