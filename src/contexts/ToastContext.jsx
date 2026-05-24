import React, { createContext, useState, useContext, useCallback } from 'react';
import ToastNotification from '../components/shared/ToastNotification';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((payload) => {
    setToast(payload);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <ToastNotification payload={toast} />}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
