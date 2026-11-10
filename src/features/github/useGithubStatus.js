// H-01 커밋 지표 · 토스트 로직 (담당: 한주성)
//
//   const { todayCount, totalCount, loading, error, stale, retry } =
//     useGithubStatus(githubId, { onToast, addExp, recordActivity });
//
// - todayCount  : 오늘(KST) 커밋 수. 오늘 데이터를 아직 못 받았으면 null
// - totalCount  : 앱에서 확인한 누적 커밋 수 (githubLedger, 오프라인에서도 유지)
// - onToast     : 토스트 UI(정원준 공통)에 넘길 콜백. 아래 GITHUB_TOAST 형태로 호출된다.
// - addExp      : 문세연 addExp(amount, source). committedToday 이고 오늘 처음일 때만 1번 호출
// - recordActivity : 이윤경 recordActivity(date, { githubDone, commitCount })
import { useEffect, useRef, useState } from 'react';
import { useGithubActivity } from './useGithubActivity.js';
import { todayKey } from '../../shared/lib/date.js';
import {
  recordCommitCount, getTotalCommits, getDayCount, claimDailyReward, GITHUB_DAILY_EXP,
} from './githubLedger.js';

/** 토스트 내용 — 연결 약속 showToast({ type, title, message }) 형식 + actionLabel/onAction/duration 추가 */
export const GITHUB_TOAST = {
  reward: () => ({
    id: 'github-reward',
    type: 'success',
    title: `+${GITHUB_DAILY_EXP} EXP · GITHUB COMMIT`,
    message: '오늘 GitHub 커밋을 확인했어요!',
    duration: 3000,
  }),
  error: (error, { hasData, retry }) => ({
    id: 'github-error',
    type: 'error',
    title: 'GITHUB 연결 실패',
    actionLabel: '다시 시도',
    onAction: retry,
    message: hasData ? '잠시 후 다시 시도할게요. 마지막 기록을 보여드려요.' : error.message,
    duration: 3000,
  }),
};

export function useGithubStatus(githubId, { onToast, addExp, recordActivity } = {}) {
  const { data, loading, error, fromCache, retry } = useGithubActivity(githubId);
  const [totalCount, setTotalCount] = useState(() => (githubId ? getTotalCommits(githubId) : 0));

  // 콜백은 매 렌더 바뀔 수 있으므로 ref 로 최신값만 참조 (effect 재실행 방지)
  const cb = useRef({});
  useEffect(() => {
    cb.current = { onToast, addExp, recordActivity, retry };
  });
  const lastError = useRef(null);

  const today = todayKey();
  const isToday = data?.date === today;

  // 데이터 도착 → 누적 기록 · 활동 기록 · 하루 1회 보상
  useEffect(() => {
    if (!githubId || !data) return;
    // localStorage(외부 저장소)에 기록한 결과를 화면에 반영 — effect 에서 동기화하는 게 맞는 경우
    // oxlint-disable-next-line react/set-state-in-effect
    setTotalCount(recordCommitCount(githubId, data.date, data.commitCount));
    if (!fromCache) {
      cb.current.recordActivity?.(data.date, { githubDone: data.committedToday, commitCount: data.commitCount });
    }
    // 어제 캐시로는 보상하지 않는다. 보상 여부는 localStorage 로 판정 → 새로고침해도 1번
    if (data.date === todayKey() && data.committedToday && claimDailyReward(data.date)) {
      cb.current.addExp?.(GITHUB_DAILY_EXP, 'github');
      cb.current.onToast?.(GITHUB_TOAST.reward());
    }
  }, [githubId, data, fromCache]);

  // 연결 실패 → 오류 토스트 (같은 오류는 한 번만)
  useEffect(() => {
    if (!error || lastError.current === error) return;
    lastError.current = error;
    const hasData = !!data || getTotalCommits(githubId) > 0;
    cb.current.onToast?.(GITHUB_TOAST.error(error, { hasData, retry: () => cb.current.retry() }));
  }, [error, data, githubId]);

  return {
    // 오늘 데이터가 없으면(오프라인 · 캐시 없음) 누적 기록에 남은 오늘 값으로 대신
    todayCount: isToday ? data.commitCount : (githubId ? getDayCount(githubId, today) : null),
    totalCount,
    loading,
    error,
    stale: !!error, // 실패했지만 마지막 기록을 보여주는 중
    retry,
  };
}
