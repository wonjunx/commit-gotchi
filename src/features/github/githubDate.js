// 날짜 유틸 — 커밋고치는 모든 "오늘" 판정을 KST(UTC+9) 기준으로 한다.
// 사용자 PC의 시간대 설정과 상관없이 같은 결과가 나오도록 고정 오프셋을 쓴다.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Date(또는 ISO 문자열) → KST 기준 'YYYY-MM-DD' */
export function toKstDate(input = new Date()) {
  const d = input instanceof Date ? input : new Date(input);
  return new Date(d.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 오늘(KST) 'YYYY-MM-DD' */
export const todayKst = () => toKstDate(new Date());

/** 'YYYY-MM-DD' 에 n일 더하기 */
export function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 해당 월의 마지막 날짜 (month: 1~12) */
export const lastDayOfMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/** 'YYYY-MM' 키 */
export const monthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;
