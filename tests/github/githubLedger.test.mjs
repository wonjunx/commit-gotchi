// node --test tests/github/githubLedger.test.js — H-01 완료 기준 검증
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const {
  recordCommitCount, getTotalCommits, getDayCount, claimDailyReward, hasRewarded, readLedger,
} = await import('../../src/features/github/githubLedger.js');
const { todayKey } = await import('../../src/shared/lib/date.js');

beforeEach(() => store.clear());

test('새로고침 5번 해도 +20 EXP 보상은 하루 1번', () => {
  const today = todayKey();
  const results = Array.from({ length: 5 }, () => claimDailyReward(today));
  assert.deepEqual(results, [true, false, false, false, false]);
  assert.equal(hasRewarded(today), true);
});

test('다음 날에는 다시 보상 가능', () => {
  assert.equal(claimDailyReward('2026-11-09'), true);
  assert.equal(claimDailyReward('2026-11-10'), true);
});

test('S-02: 같은 날 GitHub ID 를 바꿔도 보상은 날짜 기준 1번', () => {
  // ID 와 상관없는 함수라 "다른 ID 로 다시 호출"해도 false
  assert.equal(claimDailyReward('2026-11-10'), true);
  recordCommitCount('newId', '2026-11-10', 2);
  assert.equal(claimDailyReward('2026-11-10'), false);
});

test('TOTAL = 날짜별 커밋 수 합계, 같은 날은 큰 값만', () => {
  recordCommitCount('me', '2026-11-08', 3);
  recordCommitCount('me', '2026-11-09', 2);
  assert.equal(recordCommitCount('me', '2026-11-10', 4), 9);
  // 같은 날 다시 조회 — 줄어든 값은 무시, 늘어난 값은 반영
  assert.equal(recordCommitCount('me', '2026-11-10', 1), 9);
  assert.equal(recordCommitCount('me', '2026-11-10', 6), 11);
  assert.equal(readLedger('me').since, '2026-11-08');
});

test('와이파이를 꺼도(저장소만 남아도) 숫자가 유지된다', () => {
  recordCommitCount('me', '2026-11-10', 4);
  // 앱 재시작 흉내: 모듈 상태 없이 저장소에서 다시 읽기
  assert.equal(getTotalCommits('me'), 4);
  assert.equal(getDayCount('me', '2026-11-10'), 4);
  assert.equal(getDayCount('me', '2026-11-11'), null);
});

test('저장소가 깨져 있어도 0 으로 동작', () => {
  store.set('commitgotchi_github_ledger', '{broken');
  assert.equal(getTotalCommits('me'), 0);
  store.set('commitgotchi_github_rewarded', '{broken');
  assert.equal(claimDailyReward('2026-11-10'), true);
});

test('설정 "마지막 확인" 시각은 KST 로 표시', async () => {
  const { formatKstDateTime } = await import('../../src/shared/lib/date.js');
  assert.equal(formatKstDateTime(Date.UTC(2026, 9, 14, 5, 2)), '2026-10-14 14:02');
  assert.equal(formatKstDateTime(null), null);
});
