// 아직 develop에 없는 공용 함수 임시 구현. 원본 머지되면 import로 교체.
// loadData · saveData → 이윤경 storage.js / todayKey → 한주성 date.js

export function loadData(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key)
    return saved === null ? defaultValue : JSON.parse(saved)
  } catch {
    return defaultValue
  }
}

export function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error(`[saveData] "${key}" 저장 실패`, err)
  }
}

// KST 오늘 'YYYY-MM-DD'. 개발용: localStorage 'commitgotchi_dev_today'로 날짜 덮어쓰기 가능
export function todayKey() {
  try {
    const override = localStorage.getItem('commitgotchi_dev_today')
    if (override) return override
  } catch {
    /* localStorage 없음 */
  }
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}
