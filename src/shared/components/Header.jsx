import React from 'react';

function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'HOME' },
    { id: 'petbook', label: 'PET BOOK' },
    { id: 'achievements', label: 'ACHIEVEMENTS' },
    { id: 'ranking', label: 'RANKING' }
  ];

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      backgroundColor: '#171f1a',
      borderBottom: '1px solid #1f2a23'
    }}>
      <h2 style={{ color: '#3bff77', margin: 0, fontSize: '18px' }}>🌱 CommitGotchi</h2>
      
      <nav style={{ display: 'flex', gap: '15px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === tab.id ? '#3bff77' : '#9aa59d',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <button
        onClick={() => setActiveTab('settings')}
        style={{
          background: 'none',
          border: '1px solid #1f2a23',
          color: '#e8efe9',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ⚙️ 설정
      </button>
    </header>
  );
}

export default Header;