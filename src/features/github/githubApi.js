// src/features/github/githubApi.js — GitHub REST API / 비동기 통신 (담당: 한주성)
//
// 팀원이 쓰는 함수
//   getGithubUser(id)                    → { githubId, username, profileImage, createdAt }
//   getTodayGithubActivity(id)           → { date, username, committedToday, commitCount, lastActivityDate }
//   getMonthlyGithubActivity(id, y, m)   → { 'YYYY-MM-DD': 커밋수 }
//   calcStreak(byDate)                   → 연속 커밋 일수
//   GithubApiError                       → code: NOT_FOUND | RATE_LIMIT | NETWORK | UNKNOWN
//
// 참고: 2025년 이후 Events API의 PushEvent payload 에는 commits/size 가 없다.
//      그래서 "오늘 push 여부"는 Events API, "커밋 수"는 Search API 로 구한다.

import { toKstDate, todayKst, addDays, lastDayOfMonth, monthKey } from './githubDate.js';
import { MOCK_USER, mockTodayActivity, mockMonthlyActivity, mockDelay } from './githubMock.js';

const BASE = 'https://api.github.com';
// CRA 는 빌드 때 process.env.REACT_APP_* 를 값으로 바꿔 넣는다 (.env.local 에 설정).
// 반드시 process.env.REACT_APP_XXX 형태 그대로 써야 치환된다.
const env = typeof process !== 'undefined' && process.env ? {
  USE_MOCK: process.env.REACT_APP_USE_MOCK,
  MOCK_ERROR: process.env.REACT_APP_MOCK_ERROR,
  GITHUB_TOKEN: process.env.REACT_APP_GITHUB_TOKEN,
} : {};

// ───────────────────────── 설정 (Mock / 오류 시뮬레이션) ─────────────────────────
const config = {
  mock: env.USE_MOCK === 'true',
  mockError: env.MOCK_ERROR || null, // 'NOT_FOUND' | 'RATE_LIMIT' | 'NETWORK'
  // 개발용 토큰(선택). 시간당 60회 → 5000회. 프런트에 노출되므로 배포 빌드에는 넣지 말 것.
  token: env.GITHUB_TOKEN || null,
};

export function configureGithubApi(next) {
  Object.assign(config, next);
}
export const getGithubApiConfig = () => ({ ...config, token: config.token ? '(설정됨)' : null });

// ───────────────────────── 오류 ─────────────────────────
export const ERROR_MESSAGES = {
  NOT_FOUND: '존재하지 않는 GitHub ID예요. 철자를 확인해주세요.',
  RATE_LIMIT: '잠시 후 다시 시도해주세요.',
  NETWORK: '네트워크 연결을 확인해주세요.',
  UNKNOWN: 'GitHub 응답에 문제가 있어요. 잠시 후 다시 시도해주세요.',
  EMPTY_ID: 'GitHub ID를 입력해주세요.',
};

export class GithubApiError extends Error {
  /**
   * @param {'NOT_FOUND'|'RATE_LIMIT'|'NETWORK'|'UNKNOWN'|'EMPTY_ID'} code
   * @param {{status?: number, resetAt?: number|null}} [extra]
   */
  constructor(code, { status = null, resetAt = null } = {}) {
    super(ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN);
    this.name = 'GithubApiError';
    this.code = code;
    this.status = status;
    this.resetAt = resetAt; // RATE_LIMIT일 때 한도가 풀리는 시각(ms)
  }
}

// ───────────────────────── 공통 요청 ─────────────────────────
async function request(path) {
  // 커스텀 헤더(X-GitHub-Api-Version 등)를 넣으면 브라우저가 매번 CORS preflight(OPTIONS)를 한 번 더 보낸다.
  // Accept 만 쓰면 "단순 요청"이라 왕복이 절반. API 버전은 기본값(2022-11-28)이 적용된다.
  const headers = { Accept: 'application/vnd.github+json' };
  if (config.token) headers.Authorization = `Bearer ${config.token}`;

  let res;
  try {
    res = await fetch(BASE + path, { headers });
  } catch {
    throw new GithubApiError('NETWORK');
  }
  if (res.ok) return res.json();

  const resetHeader = res.headers.get('x-ratelimit-reset');
  const resetAt = resetHeader ? Number(resetHeader) * 1000 : null;
  const remaining = res.headers.get('x-ratelimit-remaining');
  let message = '';
  try {
    message = (await res.json()).message || '';
  } catch {
    /* 본문 없음 */
  }

  if (res.status === 404) throw new GithubApiError('NOT_FOUND', { status: 404 });
  // Search API에 없는 사용자를 넣으면 422 "The listed users ... cannot be searched"
  if (res.status === 422 && /cannot be searched/i.test(message))
    throw new GithubApiError('NOT_FOUND', { status: 422 });
  if (res.status === 429 || (res.status === 403 && (remaining === '0' || /rate limit/i.test(message))))
    throw new GithubApiError('RATE_LIMIT', { status: res.status, resetAt });
  throw new GithubApiError('UNKNOWN', { status: res.status });
}

async function mockGate() {
  await mockDelay();
  if (config.mockError) throw new GithubApiError(config.mockError, { resetAt: Date.now() + 60_000 });
}

function normalizeId(id) {
  const v = String(id ?? '').trim().replace(/^@/, '');
  if (!v) throw new GithubApiError('EMPTY_ID');
  return v;
}

const kstRange = (from, to) => `${from}T00:00:00+09:00..${to}T23:59:59+09:00`;

// ───────────────────────── 공개 함수 ─────────────────────────

/** GitHub 사용자 조회 → User 모델 (PRD 9.1) */
export async function getGithubUser(id) {
  const githubId = normalizeId(id);
  if (config.mock) {
    await mockGate();
    if (/^(notfound|없는)/i.test(githubId)) throw new GithubApiError('NOT_FOUND', { status: 404 });
    return { ...MOCK_USER, githubId, username: githubId };
  }
  const u = await request(`/users/${encodeURIComponent(githubId)}`);
  return {
    githubId: u.login,
    username: u.name || u.login,
    profileImage: u.avatar_url,
    createdAt: u.created_at,
  };
}

/** 오늘(KST) 활동 → GithubActivity 모델 (PRD 4.1 / 9.4) */
export async function getTodayGithubActivity(id) {
  const githubId = normalizeId(id);
  if (config.mock) {
    await mockGate();
    return mockTodayActivity(githubId);
  }
  const today = todayKst();
  const q = `author:${githubId} author-date:${kstRange(today, today)}`;
  const [events, search] = await Promise.all([
    request(`/users/${encodeURIComponent(githubId)}/events/public?per_page=100`),
    request(`/search/commits?q=${encodeURIComponent(q)}&per_page=100`),
  ]);

  const pushes = events.filter((e) => e.type === 'PushEvent');
  const pushedToday = pushes.some((e) => toKstDate(e.created_at) === today);
  const lastPushDate = pushes.length ? toKstDate(pushes[0].created_at) : null;
  // 포크 저장소에 같은 커밋이 중복 검색되므로 sha 기준으로 센다
  const commitCount = new Set(search.items.map((it) => it.sha)).size;

  return {
    date: today,
    username: githubId,
    committedToday: pushedToday || commitCount > 0,
    commitCount,
    lastActivityDate: commitCount > 0 || pushedToday ? today : lastPushDate,
  };
}

/** (P1) 한 달치 날짜별 커밋 수 → { 'YYYY-MM-DD': n } — 캘린더 · 스트릭용 */
export async function getMonthlyGithubActivity(id, year, month) {
  const githubId = normalizeId(id);
  if (config.mock) {
    await mockGate();
    return mockMonthlyActivity(year, month);
  }
  const mk = monthKey(year, month);
  const q = `author:${githubId} author-date:${kstRange(`${mk}-01`, `${mk}-${lastDayOfMonth(year, month)}`)}`;
  const byDate = {};
  const seen = new Set();
  // 최대 300개까지 (Search API 비인증 분당 10회 제한을 고려해 3페이지로 제한)
  for (let page = 1; page <= 3; page++) {
    const s = await request(`/search/commits?q=${encodeURIComponent(q)}&per_page=100&page=${page}`);
    for (const it of s.items) {
      if (seen.has(it.sha)) continue;
      seen.add(it.sha);
      const d = toKstDate(it.commit.author.date);
      byDate[d] = (byDate[d] || 0) + 1;
    }
    if (s.items.length < 100) break;
  }
  return byDate;
}

/**
 * 연속 커밋 일수. 오늘 아직 커밋 전이면 어제까지로 계산한다
 * (아침에 스트릭이 0으로 보이는 문제 방지 — 팀 확정 필요).
 */
export function calcStreak(byDate, today = todayKst()) {
  let cursor = byDate[today] ? today : addDays(today, -1);
  let streak = 0;
  while (byDate[cursor]) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
