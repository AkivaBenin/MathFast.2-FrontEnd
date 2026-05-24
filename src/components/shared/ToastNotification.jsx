import React from 'react';

export default function ToastNotification({ payload }) {
  if (!payload) return null;

  const { type, message } = payload;
  const bgColor = type === 'HIT' ? '#4CAF50' : type === 'MISS' ? '#F44336' : '#2196F3';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: bgColor,
      color: 'white',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <strong style={{ textTransform: 'uppercase' }}>{type}:</strong> {message}
    </div>
  );
}
