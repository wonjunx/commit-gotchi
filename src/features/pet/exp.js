// 게임 규칙 순수 함수. 날짜는 'YYYY-MM-DD', pet은 바꾸지 않고 새 객체 반환
import {
  EXP_PER_LEVEL,
  FEED_HP,
  FEED_PER_DAY,
  HP_MAX,
  HUNGRY_IDLE_DAYS,
  MAX_LEVEL,
  MOOD,
  NAME_MAX,
  NAME_MIN,
  NAME_PATTERN,
  NEGLECT_HP_PENALTY,
  PET_TYPE_IDS,
  SICK_IDLE_DAYS,
  STAGES,
} from './rules.js'

const DAY_MS = 24 * 60 * 60 * 1000
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

function toUtcMs(dateKey) {
  if (!DATE_KEY.test(dateKey)) throw new Error(`날짜 형식이 아니에요: ${dateKey}`)
  const [y, m, d] = dateKey.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

// from → to 일수 (같은 날 0)
export function diffDays(from, to) {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS)
}

export function addDays(dateKey, n) {
  return new Date(toUtcMs(dateKey) + n * DAY_MS).toISOString().slice(0, 10)
}

const laterOf = (a, b) => (!a ? b : !b ? a : a > b ? a : b)

// 첫 펫 생성 (온보딩)
export function createPet({ type, name, today }) {
  if (!PET_TYPE_IDS.includes(type)) throw new Error(`알 수 없는 펫 종류: ${type}`)
  return {
    type,
    name,
    level: 1,
    exp: 0, // 현재 레벨 내 EXP (0~100)
    totalExp: 0, // 누적 EXP
    hp: HP_MAX,
    stage: 'egg',
    stageDates: { egg: today }, // 단계별 도달일 (도감 · 펫 정보)
    createdAt: today,
    lastFedDate: null,
    fedCount: 0, // lastFedDate의 FEED 횟수
    penaltyCheckedUntil: today, // 패널티 계산 완료일
    lastExpDate: null, // 마지막 활동 EXP 받은 날
  }
}

// EXP 더하기만 (0 이하 무시)
export function calculateExp(pet, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return pet
  return { ...pet, exp: pet.exp + amount, totalExp: pet.totalExp + amount }
}

// 100 넘으면 레벨업 + 이월. 최대 레벨에선 100에서 멈춤
export function checkLevelUp(pet) {
  let { level, exp } = pet
  const fromLevel = level
  while (exp >= EXP_PER_LEVEL && level < MAX_LEVEL) {
    exp -= EXP_PER_LEVEL
    level += 1
  }
  if (level >= MAX_LEVEL) exp = Math.min(exp, EXP_PER_LEVEL)
  return { pet: { ...pet, level, exp }, leveledUp: level > fromLevel, fromLevel, toLevel: level }
}

// 레벨 → 진화 단계 id
export function getStage(level) {
  let stage = STAGES[0].id
  for (const s of STAGES) if (level >= s.minLevel) stage = s.id
  return stage
}

// 다음 진화 레벨 (최종이면 null)
export function nextEvolutionLevel(level) {
  const next = STAGES.find((s) => s.minLevel > level)
  return next ? next.minLevel : null
}

// 단계가 바뀌었으면 진화 처리 + 도달 날짜 기록
export function checkEvolution(pet, today) {
  const fromStage = pet.stage
  const toStage = getStage(pet.level)
  if (toStage === fromStage) return { pet, evolved: false, fromStage, toStage }
  const stageDates = { ...pet.stageDates }
  for (const s of STAGES) if (pet.level >= s.minLevel && !stageDates[s.id]) stageDates[s.id] = today
  return { pet: { ...pet, stage: toStage, stageDates }, evolved: true, fromStage, toStage }
}

// EXP 더하기 → 레벨업 → 진화 (usePet.addExp에서 사용)
export function applyExp(pet, amount, today) {
  const lv = checkLevelUp(calculateExp(pet, amount))
  const ev = checkEvolution(lv.pet, today)
  return {
    pet: ev.pet,
    gained: lv.pet.totalExp - pet.totalExp,
    levelUp: lv.leveledUp ? { fromLevel: lv.fromLevel, toLevel: lv.toLevel } : null,
    evolution: ev.evolved ? { fromStage: ev.fromStage, toStage: ev.toStage } : null,
  }
}

// HAPPY · NORMAL · HUNGRY · SICK. idleDays = 마지막 활동 다음 날 ~ 어제까지 쉰 날 수
export function calculateMood({ lastActivityDate, today, hp = HP_MAX }) {
  if (hp <= 0) return MOOD.SICK
  if (!lastActivityDate) return MOOD.NORMAL
  const days = diffDays(lastActivityDate, today)
  if (days <= 0) return MOOD.HAPPY
  const idleDays = days - 1
  if (idleDays >= SICK_IDLE_DAYS) return MOOD.SICK
  if (idleDays >= HUNGRY_IDLE_DAYS) return MOOD.HUNGRY
  return MOOD.NORMAL
}

// 쉰 날마다 HP 감소 (어제까지). 이미 계산한 날은 다시 안 깎음. lastActivityDate 확정 후 호출
export function applyNeglectPenalty(pet, { lastActivityDate, today }) {
  const yesterday = addDays(today, -1)
  const checkedUntil = pet.penaltyCheckedUntil ?? pet.createdAt ?? yesterday
  const start = laterOf(checkedUntil, lastActivityDate ?? pet.createdAt)
  const idleDays = Math.max(0, diffDays(start, yesterday))
  const hpLost = Math.min(pet.hp, idleDays * NEGLECT_HP_PENALTY)
  const penaltyCheckedUntil = laterOf(checkedUntil, yesterday)
  if (idleDays === 0 && penaltyCheckedUntil === pet.penaltyCheckedUntil) {
    return { pet, idleDays: 0, hpLost: 0 }
  }
  return { pet: { ...pet, hp: pet.hp - hpLost, penaltyCheckedUntil }, idleDays, hpLost }
}

export function canFeed(pet, today) {
  return pet.lastFedDate !== today || pet.fedCount < FEED_PER_DAY
}

// HP 회복 (하루 횟수 제한)
export function feedPet(pet, today) {
  if (!canFeed(pet, today)) return { pet, fed: false, hpGained: 0 }
  const hp = Math.min(HP_MAX, pet.hp + FEED_HP)
  const fedCount = pet.lastFedDate === today ? pet.fedCount + 1 : 1
  return { pet: { ...pet, hp, lastFedDate: today, fedCount }, fed: true, hpGained: hp - pet.hp }
}

// 이름 검사 (O-03 · S-03 공용). error는 화면 표시용 문구
export function validateName(raw) {
  const name = (raw ?? '').trim()
  const length = [...name].length
  if (length < NAME_MIN || length > NAME_MAX) {
    return { ok: false, name, error: `이름은 ${NAME_MIN}~${NAME_MAX}자로 지어주세요.` }
  }
  if (!NAME_PATTERN.test(name)) {
    return { ok: false, name, error: '한글 · 영문 · 숫자만 쓸 수 있어요.' }
  }
  return { ok: true, name, error: null }
}
