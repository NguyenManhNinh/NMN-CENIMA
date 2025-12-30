import { useState, useEffect, useCallback } from 'react';
import { getAllCombosAPI } from '../apis/comboApi';

/**
 * Custom hook để lấy danh sách combo
 * @returns {Object} { combos, loading, error, refetch }
 */
export const useCombos = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCombos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllCombosAPI();
      setCombos(response.data?.combos || []);
    } catch (err) {
      console.error('Lỗi tải combo:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách combo');
      setCombos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCombos();
  }, [fetchCombos]);

  return {
    combos,
    loading,
    error,
    refetch: fetchCombos
  };
};

export default useCombos;
