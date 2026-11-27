import React from 'react';
import SoundToggle from './SoundToggle';

// 피그마 헤더 @아이디 옆 픽셀 아이콘
function PixelUserIcon() {
  return (
    <span
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        backgroundColor: '#143d22',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 10 10"
        shapeRendering="crispEdges"
      >
        <rect x="2" y="2" width="2" height="2" fill="var(--cg-green, #3bff77)" />
        <rect x="6" y="2" width="2" height="2" fill="var(--cg-green, #3bff77)" />
        <rect x="2" y="6" width="6" height="2" fill="var(--cg-green, #3bff77)" />
      </svg>
    </span>
  );
}

function Header({ activeTab, setActiveTab }) {
  const user = JSON.parse(localStorage.getItem("commitgotchi_user") || "{}");
  const displayId = user.githubId ? `@${user.githubId}` : "";

  const tabs = [
    { id: 'home', label: 'HOME' },
    { id: 'petbook', label: 'PET BOOK' },
    { id: 'achievements', label: 'ACHIEVEMENTS' },
    { id: 'ranking', label: 'RANKING' }
  ];

  return (
    <header
      style={{
        width: '100%',
        backgroundColor: 'var(--cg-bg, #0b0f0d)',
      }}
    >
      <div
        style={{
          maxWidth: '1344px',
          margin: '0 auto',
          height: '80px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--cg-line, #1f2a23)',
          boxSizing: 'border-box',
        }}
      >
        {/* 좌측: 로고 + 네비게이션 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <h1
            onClick={() => setActiveTab('home')}
            style={{
              color: 'var(--cg-green, #3bff77)',
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: "var(--cg-roboto, 'Roboto Mono', monospace)",
              letterSpacing: '0.06em',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            COMMITGOTCHI
          </h1>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: isActive ? '#131c16' : 'var(--cg-card, #111713)',
                    border: `1px solid ${
                      isActive
                        ? 'var(--cg-green, #3bff77)'
                        : 'var(--cg-line, #1f2a23)'
                    }`,
                    color: isActive
                      ? 'var(--cg-text-main, var(--cg-text, #e8efe9))'
                      : '#c8d3cb',
                    fontFamily: "var(--cg-roboto, 'Roboto Mono', monospace)",
                    fontWeight: 700,
                    fontSize: '13px',
                    letterSpacing: '0.03em',
                    width: '136px',
                    height: '44px',
                    padding: '0 16px',
                    textAlign: 'left',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease, background 0.15s ease, color 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 우측: 픽셀 아이콘 + 아이디 + 설정 + 구독 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {displayId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '4px' }}>
              <PixelUserIcon />
              <span
                style={{
                  color: 'var(--cg-sub, #9aa59d)',
                  fontFamily: "var(--cg-roboto, 'Roboto Mono', monospace)",
                  fontSize: '13px',
                }}
              >
                {displayId}
              </span>
            </div>
          )}

          <SoundToggle />

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            aria-label="설정"
            style={{
              background: activeTab === 'settings' ? '#131c16' : 'var(--cg-card, #111713)',
              border: `1px solid ${
                activeTab === 'settings'
                  ? 'var(--cg-green, #3bff77)'
                  : 'var(--cg-line, #1f2a23)'
              }`,
              color: 'var(--cg-sub, #9aa59d)',
              width: '44px',
              height: '44px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease',
            }}
          >
            ⚙️
          </button>

          <button
            type="button"
            style={{
              background: 'var(--cg-card, #111713)',
              border: '1px solid var(--cg-line, #1f2a23)',
              color: 'var(--cg-green, #3bff77)',
              minWidth: '132px',
              height: '44px',
              padding: '0 16px',
              textAlign: 'left',
              borderRadius: '6px',
              fontFamily: "var(--cg-roboto, 'Roboto Mono', monospace)",
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.03em',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            SUBSCRIBE
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;