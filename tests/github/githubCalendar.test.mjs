// node --test tests/github/githubCalendar.test.js — H-02 완료 기준 검증
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMonthCells, formatPopover, mergeByDate, shiftMonth, normalizeActivity,
} from '../../src/features/github/githubCalendar.js';
import { calcStreak } from '../../src/features/github/githubApi.js';

const TODAY = '2026-10-14';
const byDate = { '2026-10-01': 2, '2026-10-03': 1, '2026-10-14': 4, '2026-09-30': 1 };

test('9월 ↔ 10월 ↔ 11월 이동 (연도 경계 포함)', () => {
  assert.deepEqual(shiftMonth(2026, 10, -1), { year: 2026, month: 9 });
  assert.deepEqual(shiftMonth(2026, 10, 1), { year: 2026, month: 11 });
  assert.deepEqual(shiftMonth(2026, 12, 1), { year: 2027, month: 1 });
  assert.deepEqual(shiftMonth(2026, 1, -1), { year: 2025, month: 12 });
});

test('10월 칸: 1일=목요일, Commit / No Commit / Today / Future', () => {
  const cells = buildMonthCells(2026, 10, byDate, TODAY);
  assert.equal(cells.filter((c) => c === null).length, 4); // SUN~WED 빈칸
  const at = (d) => cells.find((c) => c?.day === d);
  assert.equal(at(1).status, 'commit');
  assert.equal(at(2).status, 'nocommit');
  assert.equal(at(14).status, 'commit');
  assert.equal(at(14).isToday, true);
  assert.equal(at(15).status, 'future');
  assert.equal(cells.filter(Boolean).length, 31);
});

test('오늘 아직 커밋 전이면 Today(회색), 지난달은 Commit/No Commit, 다음 달은 전부 Future', () => {
  assert.equal(buildMonthCells(2026, 10, {}, TODAY).find((c) => c?.day === 14).status, 'today');
  const sep = buildMonthCells(2026, 9, byDate, TODAY).filter(Boolean);
  assert.equal(sep.find((c) => c.day === 30).status, 'commit');
  assert.ok(sep.every((c) => c.status !== 'future'));
  assert.ok(buildMonthCells(2026, 11, byDate, TODAY).filter(Boolean).every((c) => c.status === 'future'));
});

test('DailyActivity 의 githubDone 도 Commit 으로 본다', () => {
  const cells = buildMonthCells(2026, 10, {}, TODAY, (d) => (d === '2026-10-02' ? { githubDone: true } : null));
  assert.equal(cells.find((c) => c?.day === 2).status, 'commit');
});

test('팝오버 형식 — OCT 14 / 4 commits / 3 / 4 Complete / +50 EXP', () => {
  const cell = buildMonthCells(2026, 10, byDate, TODAY).find((c) => c?.day === 14);
  assert.deepEqual(formatPopover(cell, { todoDone: 3, todoTotal: 4, expGained: 50 }), {
    title: 'OCT 14', commit: '4 commits', todo: '3 / 4 Complete', exp: '+50 EXP',
  });
  const one = buildMonthCells(2026, 10, byDate, TODAY).find((c) => c?.day === 3);
  assert.deepEqual(formatPopover(one, null), { title: 'OCT 3', commit: '1 commit', todo: '—', exp: '—' });
});

test('필드명이 달라도 DailyActivity 를 읽는다', () => {
  assert.deepEqual(normalizeActivity({ commits: 2, completedTodos: 1, totalTodos: 3, exp: 30 }), {
    githubDone: false, commitCount: 2, todoDone: 1, todoTotal: 3, exp: 30,
  });
});

test('스트릭: 지난달까지 이어서 계산 · 큰 값 우선 합치기', () => {
  const merged = mergeByDate({ '2026-09-30': 1 }, { '2026-10-01': 1, '2026-10-02': 0 }, { '2026-10-02': 3 });
  assert.equal(calcStreak(merged, '2026-10-02'), 3);
  // 오늘 커밋 전이면 어제까지
  assert.equal(calcStreak(merged, '2026-10-03'), 3);
});
