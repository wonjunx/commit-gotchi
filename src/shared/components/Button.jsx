import React from 'react';

function Button({ variant = 'default', disabled = false, children, onClick }) {
  const getStyle = () => {
    if (disabled) {
      return {
        backgroundColor: '#6f7b73',
        color: '#111713',
        cursor: 'not-allowed',
      };
    }
    if (variant === 'primary') {
      return {
        backgroundColor: 'var(--cg-green, #3bff77)',
        color: '#111713',
        fontWeight: 700,
      };
    }
    if (variant === 'danger') {
      return {
        backgroundColor: 'var(--cg-red, #ff6b6b)',
        color: '#111713',
        fontWeight: 700,
      };
    }
    return {
      backgroundColor: 'var(--cg-field, #171f1a)',
      color: 'var(--cg-green, #3bff77)',
      border: '1px solid var(--cg-line, #1f2a23)',
      fontWeight: 700,
    };
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '10px 16px',
        border: 'none',
        borderRadius: '4px',
        fontFamily: "var(--cg-roboto, 'Roboto Mono', 'Noto Sans KR', monospace)",
        fontSize: '12px',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...getStyle(),
      }}
    >
      {children}
    </button>
  );
}

export default Button;