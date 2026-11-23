// DATA 통계 훅 (담당: 한주성) — P-02 펫 정보 · R-01 랭킹(내 기록)용
//
//   const stats = useGithubStats(githubId, { getActivity });   // getActivity: 이윤경 activity.js
//   stats.longest   { days, start, end }   최장 스트릭
//   stats.current   현재 스트릭
//   stats.topWeeks  [{ rank, start, end, commits }]  주간 커밋 TOP5
//   stats.bestDay   { date, commits } | null          하루 최다 커밋
//   stats.total     기간 안 총 커밋
//   stats.loading · stats.error · stats.retry() · stats.from · stats.to
//
// - 최근 months 개월(기본 3, 이번 달 포함)을 getMonthlyGithubActivity 로 받는다
// - 월 데이터는 useGithubCalendar 와 같은 githubCache 월 슬롯('YYYY-MM')을 쓴다 → 캘린더가 이미 받은 달은 API 를 다시 안 부름
// - GitHub 데이터 + 앱 누적 기록(githubLedger) + DailyActivity(githubDone · commitCount) 를 날짜별 최댓값으로 합친다
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMonthlyGithubActivity } from './githubApi.js';
import { cachedFetch } from './githubCache.js';
import { readLedger } from './githubLedger.js';
import { mergeByDate, normalizeActivity, shiftMonth, ymOf } from './githubCalendar.js';
import { buildGithubStats } from './githubStats.js';
import { addDays, monthKey, todayKey } from '../../shared/lib/date.js';

export function useGithubStats(githubId, { getActivity, months: monthCount = 3 } = {}) {
  const today = todayKey();
  const [months, setMonths] = useState({}); // 'YYYY-MM' → { data, error, loading }
  const [nonce, setNonce] = useState(0);

  // 이번 달부터 거슬러 monthCount 개월 키 (오래된 달 → 이번 달)
  const keys = useMemo(() => {
    const { year, month } = ymOf(today);
    const out = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const ym = shiftMonth(year, month, -i);
      out.push(monthKey(ym.year, ym.month));
    }
    return out;
  }, [today, monthCount]);
  const keysSig = keys.join(',');

  useEffect(() => {
    if (!githubId) return undefined;
    const live = { current: true }; // cleanup 후 늦게 온 응답은 무시
    const force = nonce > 0;
    for (const mk of keys) {
      const { year, month } = ymOf(`${mk}-01`);
      setMonths((m) => ({ ...m, [mk]: { ...m[mk], loading: true, error: null } }));
      cachedFetch(githubId, mk, () => getMonthlyGithubActivity(githubId, year, month), { force }).then(
        (r) => live.current && setMonths((m) => ({ ...m, [mk]: { data: r.data, error: r.error, loading: false } })),
        (error) => live.current && setMonths((m) => ({ ...m, [mk]: { ...m[mk], error, loading: false } })),
      );
    }
    return () => {
      live.current = false;
    };
    // keysSig 로 배열 동일성 대신 내용 비교
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubId, keysSig, nonce]);

  const ledgerDays = githubId ? readLedger(githubId)?.days : null;
  const from = `${keys[0]}-01`;

  const byDate = useMemo(() => {
    const merged = mergeByDate(...keys.map((k) => months[k]?.data), ledgerDays);
    if (getActivity) {
      for (let d = today; d >= from; d = addDays(d, -1)) {
        const a = normalizeActivity(getActivity(d));
        if (!a) continue;
        const n = Math.max(a.commitCount || 0, a.githubDone ? 1 : 0);
        if (n > (merged[d] || 0)) merged[d] = n;
      }
    }
    // 기간 밖(ledger 의 오래된 날짜 · 미래 날짜)은 뺀다
    for (const d of Object.keys(merged)) if (d < from || d > today) delete merged[d];
    return merged;
  }, [keys, months, ledgerDays, getActivity, today, from]);

  const stats = useMemo(() => buildGithubStats(byDate, { today }), [byDate, today]);
  const retry = useCallback(() => setNonce((n) => n + 1), []);

  const states = keys.map((k) => months[k]);
  const anyData = states.some((s) => s?.data);
  return {
    ...stats,
    byDate,
    from,
    to: today,
    loading: !!githubId && !anyData && states.some((s) => !s || s.loading),
    error: states.find((s) => s?.error)?.error || null,
    retry,
  };
}
