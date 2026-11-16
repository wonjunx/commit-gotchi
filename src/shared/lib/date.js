// 공통 날짜 유틸 — 커밋고치의 모든 "오늘" 판정은 KST(UTC+9) 기준.
// 팀 전원 날짜는 이 파일만 사용한다. (new Date().toISOString() 등 직접 쓰지 말 것)
// 사용자 PC의 시간대 설정과 상관없이 같은 결과가 나오도록 고정 오프셋을 쓴다.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Date(또는 ISO 문자열) → KST 기준 'YYYY-MM-DD' */
export function toKstDate(input = new Date()) {
  const d = input instanceof Date ? input : new Date(input);
  return new Date(d.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * 오늘(KST) 'YYYY-MM-DD' — 날짜 키는 전원 이것만 사용
 * 개발용: localStorage 'commitgotchi_dev_today' 에 날짜를 넣으면 그 날짜로 덮어쓴다 (펫 petDeps 와 동일 규칙)
 */
export const DEV_TODAY_KEY = 'commitgotchi_dev_today';
export function todayKey() {
  try {
    const override = typeof localStorage !== 'undefined' && localStorage.getItem(DEV_TODAY_KEY);
    if (override) return override;
  } catch {
    /* localStorage 없음 */
  }
  return toKstDate(new Date());
}

/** todayKey 별칭 (기존 GitHub 코드 호환용) */
export const todayKst = todayKey;

/** 'YYYY-MM-DD' 에 n일 더하기 (음수 가능) */
export function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 해당 월의 마지막 날짜 (month: 1~12) */
export const lastDayOfMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/** 시각(ms 또는 Date) → KST 'YYYY-MM-DD HH:mm' (설정 "마지막 확인" 표시용) */
export function formatKstDateTime(input) {
  if (input == null) return null;
  const d = input instanceof Date ? input : new Date(input);
  return new Date(d.getTime() + KST_OFFSET_MS).toISOString().slice(0, 16).replace('T', ' ');
}

/** 'YYYY-MM' 키 */
export const monthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;
