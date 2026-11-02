// GitHub 결과 캐시 — 비인증 한도(core 60회/시간, search 10회/분) 때문에 꼭 필요하다.
//
// ※ 팀 공용 utils/storage.js(이윤경 담당)에 의존하지 않도록 이 파일 안에서만 localStorage 를 다룬다.
//   GitHub 전용 키 하나만 쓰므로 다른 데이터와 섞이지 않는다.
//
// 저장 형태 (localStorage 'commitgotchi_github_cache'):
// { [githubId]: { today: { fetchedAt, data }, months: { 'YYYY-MM': { fetchedAt, data } } } }

export const GITHUB_CACHE_KEY = 'commitgotchi_github_cache';
export const CACHE_TTL_MS = 10 * 60 * 1000; // 10분

const storage = () => (typeof localStorage !== 'undefined' ? localStorage : null);

export function readGithubCache() {
  try {
    return JSON.parse(storage()?.getItem(GITHUB_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAll(all) {
  try {
    storage()?.setItem(GITHUB_CACHE_KEY, JSON.stringify(all));
  } catch {
    /* 저장 공간 부족 등 — 캐시는 없어도 동작해야 하므로 무시 */
  }
}

function readEntry(githubId, slot) {
  const user = readGithubCache()[githubId];
  if (!user) return null;
  return slot === 'today' ? user.today || null : user.months?.[slot] || null;
}

function writeEntry(githubId, slot, data) {
  const all = readGithubCache();
  const user = all[githubId] || { months: {} };
  const entry = { fetchedAt: Date.now(), data };
  if (slot === 'today') user.today = entry;
  else user.months = { ...user.months, [slot]: entry };
  all[githubId] = user;
  writeAll(all);
}

/**
 * 캐시 우선 조회.
 * - 캐시가 TTL 안이면 API를 부르지 않는다.
 * - force=true 면 무조건 새로 요청 (다시 시도 버튼).
 * - 요청이 실패하면 error 와 함께 마지막 캐시값(stale)을 돌려준다 → 화면 유지.
 *
 * @returns {Promise<{data:any, fromCache:boolean, fetchedAt:number|null, error:Error|null}>}
 */
export async function cachedFetch(githubId, slot, fetcher, { force = false, ttl = CACHE_TTL_MS } = {}) {
  const cached = readEntry(githubId, slot);
  if (!force && cached && Date.now() - cached.fetchedAt < ttl) {
    return { data: cached.data, fromCache: true, fetchedAt: cached.fetchedAt, error: null };
  }
  try {
    const data = await fetcher();
    writeEntry(githubId, slot, data);
    return { data, fromCache: false, fetchedAt: Date.now(), error: null };
  } catch (error) {
    if (cached) return { data: cached.data, fromCache: true, fetchedAt: cached.fetchedAt, error };
    throw error;
  }
}

export const clearGithubCache = () => storage()?.removeItem(GITHUB_CACHE_KEY);
