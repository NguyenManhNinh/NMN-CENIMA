import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setToast(prev => ({ ...prev, open: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 1 }}
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          variant="filled"
          icon={toast.severity === 'success' ? <CheckCircleOutlineIcon /> : undefined}
          sx={{
            fontWeight: 600,
            fontSize: '0.85rem',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            minWidth: 250,
            fontFamily: '"Nunito Sans", sans-serif'
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
