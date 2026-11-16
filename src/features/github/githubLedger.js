// GitHub 누적 기록 (담당: 한주성) — H-01 TOTAL COMMITS · 하루 1회 +20 EXP 판정용
//
// GitHub API는 "앱 가입 후 누적"을 알려주지 않으므로, 앱이 확인한 날짜별 커밋 수를 직접 쌓는다.
// 캐시(githubCache)와 달리 TTL 없이 영구 보관 → 와이파이를 꺼도 TOTAL 이 사라지지 않는다.
//
// 저장 형태 (localStorage 'commitgotchi_github_ledger'):
// { [githubId]: { since: 'YYYY-MM-DD', days: { 'YYYY-MM-DD': 커밋수 } } }
// 보상 여부는 ID 와 무관하게 별도 키 'commitgotchi_github_rewarded' 에 날짜 기준으로 저장

export const GITHUB_LEDGER_KEY = 'commitgotchi_github_ledger';
export const GITHUB_DAILY_EXP = 20;

const storage = () => (typeof localStorage !== 'undefined' ? localStorage : null);

function readAll() {
  try {
    return JSON.parse(storage()?.getItem(GITHUB_LEDGER_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAll(all) {
  try {
    storage()?.setItem(GITHUB_LEDGER_KEY, JSON.stringify(all));
  } catch {
    /* 저장 실패해도 화면은 동작해야 하므로 무시 */
  }
}

function update(githubId, fn) {
  const all = readAll();
  const entry = all[githubId] || { since: null, days: {} };
  const result = fn(entry);
  all[githubId] = entry;
  writeAll(all);
  return result;
}

export const readLedger = (githubId) => readAll()[githubId] || null;

/**
 * 그날 커밋 수 기록. 같은 날 여러 번 와도 큰 값만 남긴다
 * (Search API 반영 지연으로 숫자가 잠깐 줄어 보이는 경우 대비).
 * @returns {number} 갱신 후 누적 합계
 */
export function recordCommitCount(githubId, date, count) {
  return update(githubId, (e) => {
    if (!e.since || date < e.since) e.since = date;
    e.days[date] = Math.max(e.days[date] || 0, Number(count) || 0);
    return sumDays(e.days);
  });
}

/** 앱에서 확인한 누적 커밋 수 (기록 없으면 0) */
export function getTotalCommits(githubId) {
  const e = readLedger(githubId);
  return e ? sumDays(e.days) : 0;
}

// ── 하루 1회 GitHub 보상 — GitHub ID 와 무관하게 "날짜" 기준 (S-02: 같은 날 ID 를 바꿔도 1번) ──
export const GITHUB_REWARD_KEY = 'commitgotchi_github_rewarded'; // { 'YYYY-MM-DD': true }

function readRewarded() {
  try {
    return JSON.parse(storage()?.getItem(GITHUB_REWARD_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * 오늘 보상을 "처음" 받는 경우에만 true. 이미 받았으면 false.
 * 새로고침 · StrictMode 이중 실행 · 같은 날 ID 변경에도 하루 1번만 true 가 나온다.
 */
export function claimDailyReward(date) {
  const all = readRewarded();
  if (all[date]) return false;
  all[date] = true;
  try {
    storage()?.setItem(GITHUB_REWARD_KEY, JSON.stringify(all));
  } catch {
    /* 무시 */
  }
  return true;
}

export const hasRewarded = (date) => !!readRewarded()[date];

/** 그날 기록된 커밋 수 (기록 없으면 null) */
export const getDayCount = (githubId, date) => readLedger(githubId)?.days?.[date] ?? null;

export const clearGithubLedger = () => {
  storage()?.removeItem(GITHUB_LEDGER_KEY);
  storage()?.removeItem(GITHUB_REWARD_KEY);
};

const sumDays = (days) => Object.values(days).reduce((a, n) => a + n, 0);
