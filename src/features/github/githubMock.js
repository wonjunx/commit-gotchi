// GitHub API Mock 데이터 — PRD 13.1 "API 완성 전 사용할 Mock Data"
// 팀원은 .env 에 REACT_APP_USE_MOCK=true 를 두면 실제 API 호출 없이 이 값을 받는다.
import { todayKst, addDays, lastDayOfMonth, monthKey } from './githubDate.js';

export const MOCK_USER = {
  githubId: 'user123',
  username: 'user123',
  profileImage: 'https://avatars.githubusercontent.com/u/9919?v=4',
  createdAt: '2024-03-02T00:00:00Z',
};

export function mockTodayActivity(username = MOCK_USER.githubId) {
  const today = todayKst();
  return {
    date: today,
    username,
    committedToday: true,
    commitCount: 3,
    lastActivityDate: today,
  };
}

/** 오늘부터 거꾸로 7일 연속 커밋 + 그 이전은 띄엄띄엄 → "7 DAY STREAK" 시연용 */
export function mockMonthlyActivity(year, month) {
  const today = todayKst();
  const byDate = {};
  const last = lastDayOfMonth(year, month);
  for (let day = 1; day <= last; day++) {
    const date = `${monthKey(year, month)}-${String(day).padStart(2, '0')}`;
    if (date > today) break; // 미래 날짜는 비움
    const daysAgo = Math.round((new Date(today) - new Date(date)) / 86400000);
    if (daysAgo < 7 || day % 3 === 0) byDate[date] = (day % 4) + 1;
  }
  // 7일 연속 구간 바로 앞은 비워 둔다 (스트릭이 정확히 7이 되도록)
  delete byDate[addDays(today, -7)];
  return byDate;
}

export const mockDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
