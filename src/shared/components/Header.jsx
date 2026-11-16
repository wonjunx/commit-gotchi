import React from 'react';

function Header({ activeTab, setActiveTab }) {
  // 🌟 브라우저 저장소에서 실제 연동된 유저 정보 가져오기
  const user = JSON.parse(localStorage.getItem("commitgotchi_user") || "{}");
  const displayId = user.githubId ? `@${user.githubId}` : "";

  const tabs = [
    { id: 'home', label: 'HOME' },
    { id: 'petbook', label: 'PET BOOK' },
    { id: 'achievements', label: 'ACHIEVEMENTS' },
    { id: 'ranking', label: 'RANKING' }
  ];

  return (
    <header style={{
      width: '100%',
      borderBottom: '1px solid var(--cg-line)',
      backgroundColor: 'var(--cg-bg)'
    }}>
      <div style={{
        maxWidth: '1344px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <h1 style={{ 
            color: 'var(--cg-green)', 
            margin: 0, 
            fontSize: '19px', 
            fontFamily: 'var(--cg-roboto)',
            letterSpacing: '1px'
          }}>
            COMMITGOTCHI
          </h1>
          
          <nav style={{ display: 'flex', gap: '12px', height: '64px', alignItems: 'flex-end' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: isActive ? 'var(--cg-field)' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--cg-line)' : 'transparent',
                    borderBottom: isActive ? '2px solid var(--cg-green)' : '1px solid transparent',
                    color: isActive ? 'var(--cg-text-main)' : 'var(--cg-sub)',
                    fontFamily: 'var(--cg-roboto)',
                    fontWeight: 700,
                    fontSize: '13px',
                    width: '130px',
                    height: '44px',
                    borderRadius: '6px 6px 0 0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 🌟 하드코딩된 예시 대신, 실제 유저 아이디(displayId) 렌더링 */}
          <span style={{ color: 'var(--cg-sub)', fontFamily: 'var(--cg-roboto)', fontSize: '13px' }}>
            {displayId}
          </span>
          
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              background: 'var(--cg-field)',
              border: `1px solid var(--cg-line)`,
              color: 'var(--cg-sub)',
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ⚙️
          </button>
          <button style={{
            background: 'var(--cg-line)',
            border: 'none',
            color: 'var(--cg-green)',
            padding: '0 24px',
            height: '40px',
            borderRadius: '6px',
            fontFamily: 'var(--cg-roboto)',
            fontWeight: 700,
            cursor: 'pointer'
          }}>
            SUBSCRIBE
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;