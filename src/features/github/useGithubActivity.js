// HOME 등 화면에서 한 줄로 쓰는 훅
//   const { data, loading, error, fromCache, fetchedAt, retry } = useGithubActivity(githubId);
// - 마운트 시 자동 조회 (캐시 10분 우선)
// - 실패해도 마지막 캐시값을 data 로 유지하고 error 만 채운다 → "GitHub 연결 오류" 토스트용
// - retry() 는 캐시를 무시하고 재요청 → "다시 시도" 버튼용
// - githubId 가 바뀌면 key 로 다시 마운트하는 것을 권장 (<Home key={githubId} />)
import { useCallback, useEffect, useState } from 'react';
import { getTodayGithubActivity } from './githubApi.js';
import { cachedFetch } from './githubCache.js';

const fetchToday = (githubId, force) =>
  cachedFetch(githubId, 'today', () => getTodayGithubActivity(githubId), { force });

export function useGithubActivity(githubId) {
  const [state, setState] = useState({
    data: null, loading: !!githubId, error: null, fromCache: false, fetchedAt: null,
  });

  const apply = useCallback((promise) => {
    let alive = true;
    promise.then(
      (r) => alive && setState({ data: r.data, loading: false, error: r.error, fromCache: r.fromCache, fetchedAt: r.fetchedAt }),
      (error) => alive && setState((s) => ({ ...s, loading: false, error })),
    );
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!githubId) return undefined;
    return apply(fetchToday(githubId, false));
  }, [githubId, apply]);

  const retry = useCallback(() => {
    if (!githubId) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    apply(fetchToday(githubId, true));
  }, [githubId, apply]);

  return { ...state, retry };
}
