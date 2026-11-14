// H-01 HOME 커밋 지표 카드 (담당: 한주성)
//
// 사용 예 (HOME 오른쪽 열, 펫 카드 아래):
//   <GithubStatus
//     githubId={user.githubId}
//     onToast={showToast}            // 정원준 공통 토스트
//     addExp={addExp}                // 문세연
//     recordActivity={recordActivity} // 이윤경
//   />
import { useGithubStatus } from './useGithubStatus.js';
import s from './GithubStatus.module.css';

const fmt = (n) => (n == null ? '—' : n.toLocaleString('ko-KR'));

export default function GithubStatus({ githubId, onToast, addExp, recordActivity }) {
  const { todayCount, totalCount, loading, stale } = useGithubStatus(githubId, { onToast, addExp, recordActivity });
  const pending = loading && todayCount == null;

  return (
    <div className={s.row} data-stale={stale || undefined} aria-busy={pending || undefined}>
      <section className={s.card} data-testid="github-today">
        <h3 className={s.label}>TODAY&apos;S COMMITS</h3>
        <p className={s.value}>{pending ? '…' : fmt(todayCount)}</p>
      </section>
      <section className={s.card} data-testid="github-total">
        <h3 className={s.label}>TOTAL COMMITS</h3>
        <p className={s.value}>{fmt(totalCount)}</p>
      </section>
      {stale && <span className={s.sr}>GitHub 연결 실패 — 마지막 기록을 표시 중</span>}
    </div>
  );
}
