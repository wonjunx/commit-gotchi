// node --test tests/github/githubStats.test.mjs — DATA 통계 함수 검증 (R-01 · P-02)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGithubStats, calcLongestStreak, topWeeks, weeklyTotals, weekStartOf, bestCommitDay, shortDate,
} from '../../src/features/github/githubStats.js';

// 2026-10-01 = 목요일, 2026-10-12 = 월요일
const byDate = {
  '2026-09-28': 3, '2026-09-29': 1, // 9/28 주
  '2026-10-06': 2, '2026-10-07': 1, '2026-10-08': 5, '2026-10-09': 1, // 10/05 주 (4일 연속)
  '2026-10-12': 11, '2026-10-13': 4, // 10/12 주
  '2026-10-20': 0, // 0 은 커밋 안 한 날
  '2026-10-21': 2,
};

test('weekStartOf: 월~일 주, 월요일로', () => {
  assert.equal(weekStartOf('2026-10-12'), '2026-10-12'); // 월
  assert.equal(weekStartOf('2026-10-18'), '2026-10-12'); // 일
  assert.equal(weekStartOf('2026-10-01'), '2026-09-28'); // 목 → 월 경계 넘김
  assert.equal(weekStartOf('2027-01-01'), '2026-12-28'); // 연도 경계
});

test('최장 스트릭: 날짜 구간 포함, 0 커밋은 끊김', () => {
  assert.deepEqual(calcLongestStreak(byDate), { days: 4, start: '2026-10-06', end: '2026-10-09' });
  assert.deepEqual(calcLongestStreak({}), { days: 0, start: null, end: null });
  assert.deepEqual(calcLongestStreak({ '2026-10-19': 1, '2026-10-20': 0, '2026-10-21': 1 }).days, 1);
});

test('최장 스트릭: 같은 길이면 최근 구간, 월 경계 연속', () => {
  const s = calcLongestStreak({ '2026-09-01': 1, '2026-09-02': 1, '2026-09-30': 1, '2026-10-01': 1 });
  assert.deepEqual(s, { days: 2, start: '2026-09-30', end: '2026-10-01' });
});

test('주간 합계 / TOP5: 커밋 순, 동률이면 최근 주가 위', () => {
  assert.deepEqual(weeklyTotals(byDate).map((w) => [w.start, w.end, w.commits]), [
    ['2026-09-28', '2026-10-04', 4],
    ['2026-10-05', '2026-10-11', 9],
    ['2026-10-12', '2026-10-18', 15],
    ['2026-10-19', '2026-10-25', 2],
  ]);
  const top = topWeeks(byDate, 2);
  assert.deepEqual(top.map((w) => [w.rank, w.start, w.commits]), [[1, '2026-10-12', 15], [2, '2026-10-05', 9]]);
  const tie = topWeeks({ '2026-10-05': 3, '2026-10-12': 3 });
  assert.equal(tie[0].start, '2026-10-12');
  assert.equal(topWeeks(byDate).length, 4); // 주가 5개보다 적으면 있는 만큼
});

test('하루 최다 커밋', () => {
  assert.deepEqual(bestCommitDay(byDate), { date: '2026-10-12', commits: 11 });
  assert.equal(bestCommitDay({}), null);
  assert.deepEqual(bestCommitDay({ '2026-10-01': 2, '2026-10-03': 2 }), { date: '2026-10-03', commits: 2 });
});

test('buildGithubStats: 현재 스트릭은 calcStreak 규칙(오늘 전이면 어제까지)', () => {
  const s = buildGithubStats(byDate, { today: '2026-10-22' });
  assert.equal(s.current, 1); // 10/21 만
  assert.equal(s.longest.days, 4);
  assert.equal(s.total, 30);
  assert.equal(s.topWeeks[0].commits, 15);
  assert.equal(buildGithubStats(byDate, { today: '2026-10-23' }).current, 0);
  assert.deepEqual(buildGithubStats(null, { today: '2026-10-22' }).topWeeks, []);
});

test('shortDate: MM/DD', () => {
  assert.equal(shortDate('2026-10-06'), '10/06');
  assert.equal(shortDate(null), '');
});
