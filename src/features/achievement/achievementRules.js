/*
 * - 업적 목록 + 판정 순수 함수 (화면 없이 계산만)
 * - 업적 목록·숫자는 회의에서 바뀌면 ACHIEVEMENTS 배열만 고치면 됨
 
*/
const DAY_MS = 24 * 60 * 60 * 1000;

/* "2026-11-17" → 숫자(밀리초). 날짜끼리 며칠 차이인지 계산할 때 사용 */
const toMs = (dateKey) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

/*
 * longestStreak(dates)
 * - 날짜 배열에서 "하루도 안 빠지고 이어진" 가장 긴 일수
 * - 정렬 → 중복 제거(filter) → 앞 날짜와 정확히 하루 차이면 이어서 셈
 */
export const longestStreak = (dates) => {
  const sorted = [...dates].sort().filter((d, i, arr) => d !== arr[i - 1]);
  let best = 0;
  let run = 0;
  sorted.forEach((date, i) => {
    const isNextDay = i > 0 && toMs(date) - toMs(sorted[i - 1]) === DAY_MS;
    run = isNextDay ? run + 1 : 1;
    if (run > best) best = run;
  });
  return best;
};


export const maxMonthlyCommits = (days) => {
  const byMonth = {};
  Object.keys(days).forEach((date) => {
    const month = date.slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + days[date];
  });
  return Math.max(0, ...Object.values(byMonth));
};

/* 
남은 일수
*/
export const ddayLabel = (targetDate, today) => {
  const diff = Math.round((toMs(targetDate) - toMs(today)) / DAY_MS);
  if (diff === 0) return "D-DAY";
  return diff > 0 ? `D-${diff}` : `D+${-diff}`;
};

//업적목록

export const ACHIEVEMENTS = [
  { id: "firstCommit", title: "첫 커밋", desc: "GitHub 커밋 1회", stat: "totalCommits", max: 1 },
  { id: "week", title: "일주일 개근", desc: "7일 연속 활동", stat: "streak", max: 7 },
  { id: "todoMaster", title: "할 일 정복자", desc: "To-do 50개 완료", stat: "completedTodos", max: 50 },
  { id: "firstEvolution", title: "첫 진화", desc: "아기로 진화", stat: "evolved", max: 1 },
  { id: "month", title: "한 달 개근", desc: "30일 연속 활동 · JAVA 알 획득", stat: "streak", max: 30 },
  { id: "commit100", title: "커밋 100", desc: "한 달 커밋 100회", stat: "monthlyCommits", max: 100 },
  { id: "perfect10", title: "완벽한 하루 x10", desc: "To-do 전부 완료한 날 10일", stat: "perfectDays", max: 10 },
  { id: "legend", title: "레전드", desc: "최종 진화 달성", stat: "legend", max: 1 },
  { id: "earlyBird", title: "얼리버드", desc: "오전 9시 전 커밋 5회", stat: null, max: 5, pending: true },
];


 /* makeStats({ todos, activity, commitDays, pet })
 * - 저장된 기록들을 업적 판정용 숫자로 정리
 *   todos      : 내 할 일 배열 (commitgotchi_todos)
 *   activity   : 날짜별 활동 기록 (commitgotchi_activity)
 *   commitDays : 주성님 날짜별 커밋 수 { "날짜": 개수 }
 *   pet        : 세연님 펫 (없으면 null)
 * - "활동한 날" = 커밋한 날 + To-do를 하나라도 완료한 날
 */
export const makeStats = ({ todos, activity, commitDays, pet }) => {
  const commitDates = Object.keys(commitDays).filter((d) => commitDays[d] > 0);
  const todoDates = Object.keys(activity).filter((d) => activity[d].completedTodoCount > 0);
  const stageDates = pet ? pet.stageDates || {} : {};

  return {
    totalCommits: Object.values(commitDays).reduce((sum, n) => sum + n, 0),
    streak: longestStreak([...commitDates, ...todoDates]),
    completedTodos: todos.filter((t) => t.completed).length,
    perfectDays: Object.keys(activity).filter((d) => activity[d].bonusGiven).length,
    monthlyCommits: maxMonthlyCommits(commitDays),
    evolved: stageDates.baby ? 1 : 0,
    legend: stageDates.legend ? 1 : 0,
  };
};

//업적 달성도
export const checkAchievements = (data) => {
  const stats = makeStats(data);
  return ACHIEVEMENTS.map((a) => {
    if (a.pending) return { ...a, value: 0, done: false };
    const value = Math.min(stats[a.stat], a.max);
    return { ...a, value, done: value >= a.max };
  });
};