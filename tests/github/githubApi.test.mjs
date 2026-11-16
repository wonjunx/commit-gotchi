// node --test tests/github/  — 실제 GitHub를 부르지 않고 fetch 를 가짜로 바꿔 검증한다.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getGithubUser, getTodayGithubActivity, getMonthlyGithubActivity, calcStreak,
  GithubApiError, configureGithubApi,
} from '../../src/features/github/githubApi.js';
import { cachedFetch } from '../../src/features/github/githubCache.js';
import { toKstDate, todayKst, addDays } from '../../src/features/github/githubDate.js';

// ── 가짜 fetch / localStorage ──
let routes;
globalThis.fetch = async (url) => {
  const path = url.replace('https://api.github.com', '');
  for (const [prefix, handler] of routes) if (path.startsWith(prefix)) return handler(path);
  throw new TypeError('fetch failed');
};
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers });
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

beforeEach(() => {
  routes = [];
  store.clear();
  configureGithubApi({ mock: false, mockError: null, token: null });
});

test('KST 날짜 변환: UTC 15:00 이후는 다음 날', () => {
  assert.equal(toKstDate('2026-10-30T14:59:59Z'), '2026-10-30');
  assert.equal(toKstDate('2026-10-30T15:00:00Z'), '2026-10-31');
});

test('getGithubUser: User 모델로 변환, @ 와 공백 제거', async () => {
  routes.push(['/users/octo', () => json({ login: 'octo', name: null, avatar_url: 'a.png', created_at: '2020-01-01T00:00:00Z' })]);
  const u = await getGithubUser('  @octo ');
  assert.deepEqual(u, { githubId: 'octo', username: 'octo', profileImage: 'a.png', createdAt: '2020-01-01T00:00:00Z' });
});

test('getGithubUser: 빈 값 → EMPTY_ID (요청 안 보냄)', async () => {
  await assert.rejects(getGithubUser('   '), (e) => e instanceof GithubApiError && e.code === 'EMPTY_ID');
});

test('오류 규격: 404 → NOT_FOUND', async () => {
  routes.push(['/users/', () => json({ message: 'Not Found' }, 404)]);
  await assert.rejects(getGithubUser('nobody'), (e) => e.code === 'NOT_FOUND' && e.message.includes('존재하지 않는'));
});

test('오류 규격: 403 + remaining 0 → RATE_LIMIT (resetAt 포함)', async () => {
  routes.push(['/users/', () => json({ message: 'API rate limit exceeded' }, 403, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1800000000' })]);
  await assert.rejects(getGithubUser('octo'), (e) => e.code === 'RATE_LIMIT' && e.resetAt === 1800000000000);
});

test('오류 규격: fetch 실패 → NETWORK', async () => {
  await assert.rejects(getGithubUser('octo'), (e) => e.code === 'NETWORK');
});

test('오류 규격: Search 422 cannot be searched → NOT_FOUND', async () => {
  routes.push(['/users/ghost/events', () => json([])]);
  routes.push(['/search/commits', () => json({ message: 'The listed users cannot be searched' }, 422)]);
  await assert.rejects(getTodayGithubActivity('ghost'), (e) => e.code === 'NOT_FOUND');
});

test('getTodayGithubActivity: 오늘 push + sha 중복 제거', async () => {
  const now = new Date().toISOString();
  routes.push(['/users/octo/events', () => json([
    { type: 'PushEvent', created_at: now, payload: {} },
    { type: 'WatchEvent', created_at: now, payload: {} },
  ])]);
  routes.push(['/search/commits', () => json({ total_count: 4, items: [{ sha: 'a' }, { sha: 'b' }, { sha: 'a' }, { sha: 'c' }] })]);
  const a = await getTodayGithubActivity('octo');
  assert.equal(a.date, todayKst());
  assert.equal(a.committedToday, true);
  assert.equal(a.commitCount, 3);
  assert.equal(a.lastActivityDate, todayKst());
});

test('getTodayGithubActivity: 오늘 활동 없음 → lastActivityDate 는 마지막 push 날짜', async () => {
  routes.push(['/users/octo/events', () => json([{ type: 'PushEvent', created_at: '2026-10-24T03:00:00Z', payload: {} }])]);
  routes.push(['/search/commits', () => json({ total_count: 0, items: [] })]);
  const a = await getTodayGithubActivity('octo');
  if (a.date !== '2026-10-24') {
    assert.equal(a.committedToday, false);
    assert.equal(a.commitCount, 0);
    assert.equal(a.lastActivityDate, '2026-10-24');
  }
});

test('getMonthlyGithubActivity: 날짜별 집계 (KST 기준)', async () => {
  routes.push(['/search/commits', () => json({ items: [
    { sha: '1', commit: { author: { date: '2026-10-01T16:00:00Z' } } }, // KST 10-02
    { sha: '2', commit: { author: { date: '2026-10-02T01:00:00Z' } } }, // KST 10-02
    { sha: '2', commit: { author: { date: '2026-10-02T01:00:00Z' } } }, // 중복
    { sha: '3', commit: { author: { date: '2026-10-05T01:00:00Z' } } },
  ] })]);
  assert.deepEqual(await getMonthlyGithubActivity('octo', 2026, 10), { '2026-10-02': 2, '2026-10-05': 1 });
});

test('calcStreak: 연속일, 오늘 미커밋이면 어제까지', () => {
  const t = '2026-10-31';
  assert.equal(calcStreak({ '2026-10-31': 1, '2026-10-30': 2, '2026-10-29': 1, '2026-10-27': 1 }, t), 3);
  assert.equal(calcStreak({ '2026-10-30': 1, '2026-10-29': 1 }, t), 2);
  assert.equal(calcStreak({ '2026-10-29': 1 }, t), 0);
  assert.equal(calcStreak({ [addDays(t, 0)]: 1, '2026-09-30': 1 }, t), 1);
});

test('캐시: TTL 안에서는 재요청 안 함, 실패 시 마지막 값 유지', async () => {
  let calls = 0;
  const ok = async () => ({ n: ++calls });
  const r1 = await cachedFetch('octo', 'today', ok);
  const r2 = await cachedFetch('octo', 'today', ok);
  assert.equal(calls, 1);
  assert.equal(r2.fromCache, true);
  const fail = async () => { throw new GithubApiError('NETWORK'); };
  const r3 = await cachedFetch('octo', 'today', fail, { force: true });
  assert.deepEqual(r3.data, r1.data);
  assert.equal(r3.error.code, 'NETWORK');
});

test('Mock 모드: API 호출 없이 규격대로 반환 + 오류 시뮬레이션', async () => {
  configureGithubApi({ mock: true });
  const a = await getTodayGithubActivity('user123');
  assert.deepEqual(Object.keys(a).sort(), ['commitCount', 'committedToday', 'date', 'lastActivityDate', 'username']);
  const today = new Date();
  const m = await getGithubUser('user123');
  assert.equal(m.githubId, 'user123');
  const month = await getMonthlyGithubActivity('user123', today.getFullYear(), today.getMonth() + 1);
  assert.ok(Object.keys(month).length > 0);
  configureGithubApi({ mockError: 'RATE_LIMIT' });
  await assert.rejects(getTodayGithubActivity('user123'), (e) => e.code === 'RATE_LIMIT');
});
