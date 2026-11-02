import React from 'react';

function Placeholder({ name, height = '200px' }) {
  return (
    <div style={{
      width: '100%',
      height: height,
      backgroundColor: '#1f2a23',
      border: '2px dashed #3bff77',
      color: '#3bff77',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'monospace',
      borderRadius: '8px',
      margin: '10px 0'
    }}>
      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>[ SLOT ]</span>
      <span style={{ fontSize: '16px', marginTop: '5px' }}>{name}</span>
    </div>
  );
}

export default Placeholder;