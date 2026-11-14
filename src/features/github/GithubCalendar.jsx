// H-02 HOME 캘린더 카드 — 스트릭 · 월 이동 · 날짜 팝오버 (담당: 한주성)
//
//   <GithubCalendar githubId={user.githubId} getActivity={getActivity} />  // getActivity: 이윤경 activity.js
import { useEffect, useState } from 'react';
import { useGithubCalendar } from './useGithubCalendar.js';
import { MONTH_NAMES, WEEKDAYS, formatPopover } from './githubCalendar.js';
import s from './GithubCalendar.module.css';

const STATUS_LABEL = { commit: 'Commit', nocommit: 'No Commit', today: 'Today', future: 'Future', unknown: '불러오는 중' };

export default function GithubCalendar({ githubId, getActivity }) {
  const cal = useGithubCalendar(githubId, { getActivity });
  const [selected, setSelected] = useState(null); // 선택한 칸

  // 바깥 클릭 · Esc 로 팝오버 닫기
  useEffect(() => {
    if (!selected) return undefined;
    const onDown = (e) => { if (!e.target.closest?.(`.${s.cell}, .${s.popover}`)) setSelected(null); };
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [selected]);

  const move = (fn) => { setSelected(null); fn(); };
  const pop = selected && formatPopover(selected, getActivity?.(selected.date));

  return (
    <section className={s.card} data-testid="github-calendar">
      <header className={s.head}>
        <div>
          <p className={s.kicker}>DAY STREAK</p>
          <h2 className={s.streak}>
            ✦{cal.streak} DAY STREAK
            <span className={s.streakMsg}>
              {cal.streak > 0 ? `${cal.streak}일 연속 활동 중이에요!` : '오늘 커밋하고 스트릭을 시작해요!'}
            </span>
          </h2>
        </div>
        <div className={s.nav}>
          <div className={s.navBtns}>
            <button type="button" className={s.navBtn} onClick={() => move(cal.prev)} aria-label="이전 달">‹</button>
            <button type="button" className={s.navBtn} onClick={() => move(cal.next)} disabled={!cal.canNext} aria-label="다음 달">›</button>
          </div>
          <p className={s.monthLabel} aria-live="polite">{MONTH_NAMES[cal.month - 1]} {cal.year}</p>
        </div>
      </header>

      <div className={s.grid} role="grid" aria-busy={cal.loading || undefined}>
        {WEEKDAYS.map((w) => <span key={w} className={s.weekday}>{w}</span>)}
        {cal.cells.map((c, i) =>
          c ? (
            <button
              key={c.date}
              type="button"
              className={`${s.cell} ${s[c.status]} ${c.isToday ? s.isToday : ''} ${selected?.date === c.date ? s.selected : ''}`}
              disabled={c.status === 'future'}
              onClick={() => setSelected(selected?.date === c.date ? null : c)}
              aria-label={`${c.date} ${STATUS_LABEL[c.status]}${c.commits ? ` ${c.commits} commits` : ''}`}
            >
              <span className={s.day}>{c.day}</span>
              <span className={s.dot} />
            </button>
          ) : (
            <span key={`blank-${i}`} />
          ),
        )}

        {pop && (
          <div className={s.popover} role="dialog" aria-label={`${pop.title} 상세`}>
            <p className={s.popTitle}>{pop.title}</p>
            <dl className={s.popList}>
              <dt>TODAY&apos;S COMMIT</dt><dd>{pop.commit}</dd>
              <dt>TO-DO</dt><dd>{pop.todo}</dd>
              <dt>EXP</dt><dd>{pop.exp}</dd>
            </dl>
          </div>
        )}
      </div>

      <footer className={s.foot}>
        <span className={s.legend}><i className={s.lgCommit} />Commit</span>
        <span className={s.legend}><i className={s.lgNo} />No Commit</span>
        <span className={s.legend}><i className={s.lgFuture} />Today / Future</span>
        {cal.error && (
          <span className={s.err}>
            불러오기 실패 · <button type="button" onClick={cal.retry}>다시 시도</button>
          </span>
        )}
      </footer>
    </section>
  );
}
