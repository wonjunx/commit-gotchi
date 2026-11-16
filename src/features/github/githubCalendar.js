// H-02 캘린더 계산 (담당: 한주성) — 화면 없이 테스트할 수 있도록 순수 함수로 분리
import { lastDayOfMonth, monthKey } from '../../shared/lib/date.js';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** (year, month) 에서 delta 개월 이동 → { year, month } */
export function shiftMonth(year, month, delta) {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

/** 'YYYY-MM-DD' → { year, month } */
export const ymOf = (date) => ({ year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)) });

/**
 * DailyActivity(이윤경)를 팝오버용으로 정규화.
 * 필드명이 확정되기 전이라 흔한 이름 몇 가지를 받아준다.
 */
export function normalizeActivity(a) {
  if (!a) return null;
  const pick = (...keys) => {
    for (const k of keys) if (a[k] != null) return a[k];
    return null;
  };
  return {
    githubDone: !!pick('githubDone', 'committed', 'committedToday'),
    commitCount: pick('commitCount', 'commits'),
    todoDone: pick('todoDone', 'completedTodoCound', 'completedTodoCount', 'completedTodos', 'doneCount'),
    todoTotal: pick('todoTotal', 'totalTodos', 'todoCount'),
    exp: pick('expGained', 'exp', 'earnedExp', 'gainedExp'),
  };
}

/**
 * 한 달 칸 목록. 앞쪽 빈칸은 null.
 * status: 'commit' | 'nocommit' | 'today' | 'future'
 * @param {Record<string, number>} byDate  날짜별 커밋 수 (GitHub + 기록 합친 것)
 * @param {(date:string)=>object|null} [getActivity]
 */
export function buildMonthCells(year, month, byDate, today, getActivity) {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const cells = Array(first).fill(null);
  const mk = monthKey(year, month);
  for (let day = 1; day <= lastDayOfMonth(year, month); day++) {
    const date = `${mk}-${String(day).padStart(2, '0')}`;
    const act = normalizeActivity(getActivity?.(date));
    const commits = Math.max(byDate?.[date] || 0, act?.commitCount || 0);
    const committed = commits > 0 || !!act?.githubDone;
    let status;
    if (date > today) status = 'future';
    else if (committed) status = 'commit';
    else status = date === today ? 'today' : 'nocommit';
    cells.push({ date, day, status, isToday: date === today, commits });
  }
  return cells;
}

/** 여러 출처의 { date: n } 를 날짜별 최댓값으로 합친다 */
export function mergeByDate(...sources) {
  const out = {};
  for (const src of sources) {
    for (const [d, n] of Object.entries(src || {})) out[d] = Math.max(out[d] || 0, n || 0);
  }
  return out;
}

/** 팝오버 문구 — PRD 7.2 시안 형식 (OCT 14 / 4 commits / 3 / 4 Complete / +50 EXP) */
export function formatPopover(cell, activity) {
  const a = normalizeActivity(activity);
  const { month } = ymOf(cell.date);
  const commits = Math.max(cell.commits, a?.commitCount || 0);
  return {
    title: `${MONTH_NAMES[month - 1].slice(0, 3).toUpperCase()} ${cell.day}`,
    commit: `${commits} ${commits === 1 ? 'commit' : 'commits'}`,
    todo: a?.todoTotal ? `${a.todoDone ?? 0} / ${a.todoTotal} Complete` : '—',
    exp: a?.exp != null ? `+${a.exp} EXP` : '—',
  };
}
