import React, { useSyncExternalStore } from 'react';
import { isMuted, setMuted, subscribeSound } from '../lib/sound';

// 헤더 음소거 버튼 (설정 버튼과 같은 모양)
function SoundToggle() {
  const muted = useSyncExternalStore(subscribeSound, isMuted);
  const green = 'var(--cg-green, #3bff77)';
  const color = muted ? 'var(--cg-sub, #9aa59d)' : green;

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-label={muted ? '소리 켜기' : '소리 끄기'}
      aria-pressed={!muted}
      title={muted ? '소리 켜기' : '소리 끄기'}
      style={{
        background: 'var(--cg-card, #111713)',
        border: '1px solid var(--cg-line, #1f2a23)',
        width: '44px',
        height: '44px',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="1" y="4" width="2" height="2" fill={color} />
        <rect x="3" y="3" width="1" height="4" fill={color} />
        <rect x="4" y="2" width="1" height="6" fill={color} />
        {muted ? (
          <>
            <rect x="6" y="3" width="1" height="1" fill={color} />
            <rect x="8" y="3" width="1" height="1" fill={color} />
            <rect x="7" y="4" width="1" height="2" fill={color} />
            <rect x="6" y="6" width="1" height="1" fill={color} />
            <rect x="8" y="6" width="1" height="1" fill={color} />
          </>
        ) : (
          <>
            <rect x="6" y="4" width="1" height="2" fill={color} />
            <rect x="7" y="3" width="1" height="1" fill={color} />
            <rect x="7" y="6" width="1" height="1" fill={color} />
            <rect x="8" y="2" width="1" height="6" fill={color} />
          </>
        )}
      </svg>
    </button>
  );
}

export default SoundToggle;
