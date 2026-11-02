import React from 'react';

function Button({ variant = 'default', disabled = false, children, onClick }) {
  const getStyle = () => {
    if (disabled) return { backgroundColor: '#6f7b73', color: '#111713', cursor: 'not-allowed' };
    if (variant === 'primary') return { backgroundColor: '#3bff77', color: '#111713', fontWeight: 'bold' };
    if (variant === 'danger') return { backgroundColor: '#ff6b6b', color: '#111713', fontWeight: 'bold' };
    return { backgroundColor: '#171f1a', color: '#e8efe9', border: '1px solid #1f2a23' };
  };

  return (
    <button 
      disabled={disabled} 
      onClick={onClick}
      style={{
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...getStyle()
      }}
    >
      {children}
    </button>
  );
}

export default Button;