import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAPI, logoutAPI, getMeAPI, registerAPI, verifyAccountAPI } from '../apis/authApi';

// Create context
const AuthContext = createContext(null);

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Optionally verify token with API
          // const response = await getMeAPI();
          // setUser(response.data.user);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await loginAPI({ email, password });

      if (response.status === 'success') {
        const { token, data } = response;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại!';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await registerAPI(userData);

      if (response.status === 'success') {
        return { success: true, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng ký thất bại!';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Verify OTP function
  const verifyOTP = useCallback(async (email, otp) => {
    try {
      setError(null);
      const response = await verifyAccountAPI({ email, otp });

      if (response.status === 'success') {
        const { token, data } = response;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Xác thực OTP thất bại!';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await logoutAPI();
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    verifyOTP,
    logout,
    clearError,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
