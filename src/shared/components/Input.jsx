import React from 'react';

function Input({ error, placeholder, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <input 
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          backgroundColor: '#171f1a',
          border: `1px solid ${error ? '#ff6b6b' : '#1f2a23'}`,
          color: '#e8efe9',
          padding: '12px',
          borderRadius: '4px',
          outline: 'none',
          fontSize: '14px'
        }}
      />
      {error && (
        <span style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default Input;