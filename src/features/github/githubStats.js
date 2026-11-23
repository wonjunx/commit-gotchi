// DATA 통계 함수 (담당: 한주성) — P-02 펫 정보 · R-01 랭킹(내 기록)이 쓰는 순수 함수
//
//   import { buildGithubStats } from '../features/github';
//   const s = buildGithubStats(byDate, { today });
//   s.longest   → { days, start, end }          최장 스트릭 (R-01 "14 days · 10/06 – 10/19")
//   s.current   → number                       현재 스트릭 (calcStreak 와 같은 규칙)
//   s.topWeeks  → [{ rank, start, end, commits }] 주간 커밋 TOP5 (월~일, KST)
//   s.bestDay   → { date, commits } | null     하루 최다 커밋
//   s.total     → number                       기간 안 총 커밋
//
// byDate = { 'YYYY-MM-DD': 커밋 수 } (getMonthlyGithubActivity 결과를 mergeByDate 로 합친 것)
import { addDays, todayKey } from '../../shared/lib/date.js';
import { calcStreak } from './githubApi.js';

const committed = (byDate, d) => (byDate?.[d] || 0) > 0;

/** 커밋한 날짜만 오름차순 */
function commitDates(byDate) {
  return Object.keys(byDate || {}).filter((d) => committed(byDate, d)).sort();
}

/**
 * 최장 스트릭. 같은 길이면 더 최근 구간.
 * @returns {{ days: number, start: string|null, end: string|null }}
 */
export function calcLongestStreak(byDate) {
  let best = { days: 0, start: null, end: null };
  let run = 0;
  let start = null;
  let prev = null;
  for (const d of commitDates(byDate)) {
    if (prev && addDays(prev, 1) === d) run++;
    else {
      run = 1;
      start = d;
    }
    if (run >= best.days) best = { days: run, start, end: d };
    prev = d;
  }
  return best;
}

/** 그 날짜가 속한 주의 월요일 'YYYY-MM-DD' (주 = 월~일) */
export function weekStartOf(date) {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0=일
  return addDays(date, -((dow + 6) % 7));
}

/** 주별 커밋 합계 (커밋 0인 주는 빠짐), 오래된 주 → 최근 주 순 */
export function weeklyTotals(byDate) {
  const weeks = {};
  for (const d of commitDates(byDate)) {
    const ws = weekStartOf(d);
    weeks[ws] = (weeks[ws] || 0) + byDate[d];
  }
  return Object.keys(weeks)
    .sort()
    .map((start) => ({ start, end: addDays(start, 6), commits: weeks[start] }));
}

/** 주간 커밋 TOP N. 커밋 수가 같으면 최근 주가 위 */
export function topWeeks(byDate, n = 5) {
  return weeklyTotals(byDate)
    .sort((a, b) => b.commits - a.commits || (a.start < b.start ? 1 : -1))
    .slice(0, n)
    .map((w, i) => ({ rank: i + 1, ...w }));
}

/** 하루 최다 커밋. 같으면 최근 날짜. 커밋이 없으면 null */
export function bestCommitDay(byDate) {
  let best = null;
  for (const d of commitDates(byDate)) {
    if (!best || byDate[d] >= best.commits) best = { date: d, commits: byDate[d] };
  }
  return best;
}

/** 'YYYY-MM-DD' → 'MM/DD' (R-01 표기) */
export const shortDate = (date) => (date ? `${date.slice(5, 7)}/${date.slice(8, 10)}` : '');

/** 한 번에 모두 계산 */
export function buildGithubStats(byDate, { today = todayKey(), topN = 5 } = {}) {
  const src = byDate || {};
  return {
    longest: calcLongestStreak(src),
    current: calcStreak(src, today),
    topWeeks: topWeeks(src, topN),
    bestDay: bestCommitDay(src),
    total: Object.values(src).reduce((sum, n) => sum + (n > 0 ? n : 0), 0),
  };
}
