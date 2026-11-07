// 게임 숫자는 여기서만 수정 (설명: GAME_RULES.md)

// 펫 종류 (id = pet.type)
export const PET_TYPES = [
  { id: 'c', language: 'C' },
  { id: 'cpp', language: 'C++' },
  { id: 'java', language: 'Java' },
  { id: 'python', language: 'Python' },
  { id: 'html', language: 'HTML' },
]
export const PET_TYPE_IDS = PET_TYPES.map((t) => t.id)

// 활동별 EXP (key = addExp reason)
export const EXP_REWARD = {
  github: 20, // 오늘 GitHub 커밋 (하루 1번)
  todo: 10, // To-do 하나 완료
  allTodoBonus: 10, // 오늘 To-do 전부 완료 보너스
}

// 레벨당 EXP (넘친 만큼 이월)
export const EXP_PER_LEVEL = 100
export const MAX_LEVEL = 10

// 진화 단계
export const STAGES = [
  { id: 'egg', label: 'EGG', minLevel: 1 },
  { id: 'baby', label: 'BABY', minLevel: 3 },
  { id: 'growth', label: 'GROWTH', minLevel: 6 },
  { id: 'legend', label: 'LEGEND', minLevel: 10 },
]

export const HP_MAX = 100
// 쉰 날 하루당 HP 감소
export const NEGLECT_HP_PENALTY = 10
// FEED (제안값, 회의 확정 전)
export const FEED_HP = 10
export const FEED_PER_DAY = 1

// Mood (쉰 날 수 기준)
export const MOOD = {
  HAPPY: 'HAPPY', // 오늘 활동함
  NORMAL: 'NORMAL', // 평소 (오늘은 아직 활동 전)
  HUNGRY: 'HUNGRY', // 하루 이상 활동 없음
  SICK: 'SICK', // 3일 이상 활동 없음, 또는 HP 0
}
export const HUNGRY_IDLE_DAYS = 1
export const SICK_IDLE_DAYS = 3

// 펫 이름: 한글 · 영문 · 숫자 2~8자
export const NAME_MIN = 2
export const NAME_MAX = 8
export const NAME_PATTERN = /^[가-힣a-zA-Z0-9]+$/
