// H-02 캘린더 · 스트릭 데이터 훅 (담당: 한주성)
//
//   const cal = useGithubCalendar(githubId, { getActivity });
//   cal.year, cal.month, cal.cells, cal.streak, cal.loading, cal.error
//   cal.prev(), cal.next(), cal.canNext, cal.retry()
//
// - 칸 상태 = getMonthlyGithubActivity() + 앱 누적 기록(githubLedger) + DailyActivity(이윤경 getActivity) 합침
// - 스트릭 = 이번 달 + 지난달 기준, 오늘 아직 커밋 전이면 어제까지 (calcStreak)
// - 월 데이터는 githubCache 의 월 슬롯(10분)을 쓴다 → 월 이동을 반복해도 API 를 다시 안 부름
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMonthlyGithubActivity, calcStreak } from './githubApi.js';
import { cachedFetch } from './githubCache.js';
import { readLedger } from './githubLedger.js';
import { buildMonthCells, mergeByDate, shiftMonth, ymOf } from './githubCalendar.js';
import { todayKey, monthKey, addDays } from '../../shared/lib/date.js';

const ymKey = ({ year, month }) => monthKey(year, month);

export function useGithubCalendar(githubId, { getActivity } = {}) {
  const today = todayKey();
  const thisYm = ymOf(today);
  const [view, setView] = useState(thisYm);
  const [months, setMonths] = useState({}); // 'YYYY-MM' → { data, error, loading }

  const load = useCallback((ym, force = false) => {
    if (!githubId) return;
    const mk = ymKey(ym);
    setMonths((m) => ({ ...m, [mk]: { ...m[mk], loading: true, error: null } }));
    cachedFetch(githubId, mk, () => getMonthlyGithubActivity(githubId, ym.year, ym.month), { force }).then(
      (r) => setMonths((m) => ({ ...m, [mk]: { data: r.data, error: r.error, loading: false } })),
      (error) => setMonths((m) => ({ ...m, [mk]: { ...m[mk], error, loading: false } })),
    );
  }, [githubId]);

  const viewKey = ymKey(view);
  const thisKey = ymKey(thisYm);
  const prevYm = shiftMonth(thisYm.year, thisYm.month, -1);
  const prevKey = ymKey(prevYm);
  const isFutureMonth = viewKey > thisKey;

  // 보고 있는 달 + 스트릭용(이번 달 · 지난달). 미래 달은 조회하지 않는다.
  // 이미 요청한 달은 ref 로 기억해 다시 부르지 않는다 (retry 만 강제 재조회)
  const requested = useRef(new Set());
  useEffect(() => {
    if (!githubId) return;
    const keys = [thisKey, prevKey];
    if (!isFutureMonth) keys.push(viewKey);
    for (const k of keys) {
      if (requested.current.has(k)) continue;
      requested.current.add(k);
      load(ymOf(`${k}-01`));
    }
  }, [githubId, viewKey, thisKey, prevKey, isFutureMonth, load]);

  const ledgerDays = readLedger(githubId)?.days;

  const cells = useMemo(() => {
    const monthData = months[viewKey]?.data;
    const byDate = mergeByDate(monthData, ledgerDays);
    const built = buildMonthCells(view.year, view.month, byDate, today, getActivity);
    // GitHub 월 데이터를 아직 못 받았으면 "No Commit"(빨강)으로 단정하지 않고 회색으로 둔다
    if (monthData) return built;
    return built.map((c) => (c?.status === 'nocommit' ? { ...c, status: 'unknown' } : c));
  }, [months, viewKey, ledgerDays, view.year, view.month, today, getActivity]);

  const streak = useMemo(() => {
    const byDate = mergeByDate(months[prevKey]?.data, months[thisKey]?.data, ledgerDays);
    // DailyActivity 에 githubDone 만 있고 GitHub 숫자가 없는 날도 커밋한 날로 본다
    if (getActivity) {
      for (let d = today, i = 0; i < 62; i++, d = addDays(d, -1)) {
        const a = getActivity(d);
        if (a?.githubDone && !byDate[d]) byDate[d] = 1;
      }
    }
    return calcStreak(byDate, today);
  }, [months, prevKey, thisKey, ledgerDays, today, getActivity]);

  const cur = months[viewKey];
  return {
    ...view,
    cells,
    streak,
    loading: !isFutureMonth && (!cur || cur.loading) && !cur?.data,
    error: isFutureMonth ? null : cur?.error || null,
    isFutureMonth,
    prev: () => setView((v) => shiftMonth(v.year, v.month, -1)),
    // 다음 달까지만 (전부 Future 로 보이는 달)
    next: () => setView((v) => shiftMonth(v.year, v.month, 1)),
    canNext: viewKey <= thisKey,
    goToday: () => setView(thisYm),
    retry: () => load(view, true),
  };
}
