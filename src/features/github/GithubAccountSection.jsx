// S-01 설정 · GitHub 계정 섹션 (담당: 한주성) — 설정 화면 틀은 정원준
//
//   <GithubAccountSection user={user} onUserChange={(user) => saveUser(user)} />
//   user = { githubId, username, profileImage, createdAt }
//
// 연결된 계정  @id · 10분마다 갱신         [EDIT ID]   → S-02 모달
// 마지막 확인  YYYY-MM-DD HH:mm (KST)    [지금 새로고침] → retry() 캐시 무시 재조회
import { useState } from 'react';
import { useGithubActivity } from './useGithubActivity.js';
import { CACHE_TTL_MS } from './githubCache.js';
import { formatKstDateTime } from '../../shared/lib/date.js';
import GithubIdModal from './GithubIdModal.jsx';
import s from './GithubAccountSection.module.css';

export default function GithubAccountSection({ user, onUserChange }) {
  const githubId = user?.githubId;
  return <Section key={githubId || '-'} user={user} githubId={githubId} onUserChange={onUserChange} />;
}

// githubId 가 바뀌면 key 로 다시 마운트 → useGithubActivity 가 새 ID 로 조회
function Section({ user, githubId, onUserChange }) {
  const { fetchedAt, loading, error, retry } = useGithubActivity(githubId);
  const [editing, setEditing] = useState(false);

  const lastChecked = formatKstDateTime(fetchedAt);
  const refreshing = loading && !!githubId;

  return (
    <section className={s.card} data-testid="github-account-section">
      <h3 className={s.kicker}>GITHUB 계정</h3>

      <div className={s.row}>
        <span className={s.label}>연결된 계정</span>
        <span className={s.value}>
          {githubId ? `@${githubId}` : '연결 안 됨'}
          <span className={s.sub}> · {Math.round(CACHE_TTL_MS / 60000)}분마다 갱신</span>
        </span>
        <button type="button" className={s.btn} onClick={() => setEditing(true)}>EDIT ID</button>
      </div>

      <div className={s.row}>
        <span className={s.label}>마지막 확인</span>
        <span className={`${s.value} ${error ? s.err : ''}`}>
          {refreshing ? '확인 중…' : lastChecked || '—'}
          {error && !refreshing && <span className={s.sub}> · {error.message}</span>}
        </span>
        <button type="button" className={`${s.btn} ${s.ghost}`} onClick={retry} disabled={!githubId || refreshing}>
          지금 새로고침
        </button>
      </div>

      <GithubIdModal
        open={editing}
        currentId={githubId || ''}
        onCancel={() => setEditing(false)}
        onSave={(next) => {
          setEditing(false);
          onUserChange?.({ ...user, ...next });
        }}
      />
    </section>
  );
}
