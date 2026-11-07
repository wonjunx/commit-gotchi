import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  applyExp,
  applyNeglectPenalty,
  calculateMood,
  canFeed,
  createPet,
  feedPet,
  validateName,
} from './exp.js'
import { PET_KEY } from './keys.js'
import { loadData, saveData, todayKey } from './petDeps.js'
import { PetContext } from './petContext.js'
import { PetEventHost } from './PetEventHost.jsx'

// 이 reason으로 EXP를 받으면 오늘 활동한 것으로 본다
const ACTIVITY_REASONS = ['github', 'todo', 'allTodoBonus']
// 토스트가 먼저 보이도록 모달은 늦게 띄움
const FIRST_MODAL_DELAY_MS = 700
const NEXT_MODAL_DELAY_MS = 250

const later = (a, b) => (!a ? b : !b ? a : a > b ? a : b)

// lastActivityDate: 마지막 활동일 'YYYY-MM-DD'. 로딩 중 undefined(패널티 보류), 기록 없음 null
export function PetProvider({ lastActivityDate, children }) {
  const [pet, setPet] = useState(() => loadData(PET_KEY, null))
  const petRef = useRef(pet)
  const [today, setToday] = useState(todayKey)
  const [queue, setQueue] = useState([]) // 대기 중인 레벨업 · 진화
  const [event, setEvent] = useState(null) // 현재 표시 중
  const shownOnce = useRef(false)

  // pet 변경은 전부 여기로 (ref · state · 저장 동기화)
  const commit = useCallback((next) => {
    petRef.current = next
    setPet(next)
    if (next) saveData(PET_KEY, next)
  }, [])

  // 자정 · 탭 복귀 시 날짜 갱신
  const syncToday = useCallback(() => setToday(todayKey()), [])
  useEffect(() => {
    const id = setInterval(syncToday, 30_000)
    window.addEventListener('focus', syncToday)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', syncToday)
    }
  }, [syncToday])

  // EXP 받은 날도 활동일로 침
  const effectiveLast = lastActivityDate === undefined ? undefined : later(lastActivityDate, pet?.lastExpDate)

  // 방치 패널티 (활동 데이터 확정 후)
  useEffect(() => {
    const cur = petRef.current
    if (!cur || effectiveLast === undefined) return
    const r = applyNeglectPenalty(cur, { lastActivityDate: effectiveLast, today })
    if (r.pet !== cur) commit(r.pet)
  }, [today, effectiveLast, commit])

  // 대기열에서 모달 하나씩 표시
  useEffect(() => {
    if (event) return
    if (queue.length === 0) {
      shownOnce.current = false
      return
    }
    const delay = shownOnce.current ? NEXT_MODAL_DELAY_MS : FIRST_MODAL_DELAY_MS
    const id = setTimeout(() => {
      shownOnce.current = true
      setEvent(queue[0])
      setQueue((q) => q.slice(1))
    }, delay)
    return () => clearTimeout(id)
  }, [event, queue])

  const dismissEvent = useCallback(() => setEvent(null), [])

  const addExp = useCallback(
    (amount, reason) => {
      const cur = petRef.current
      if (!cur) return { gained: 0, levelUp: null, evolution: null }
      const day = todayKey()
      const r = applyExp(cur, amount, day)
      if (r.gained === 0) return { gained: 0, levelUp: null, evolution: null }
      const next = ACTIVITY_REASONS.includes(reason) ? { ...r.pet, lastExpDate: day } : r.pet
      commit(next)
      const events = []
      if (r.levelUp) events.push({ kind: 'levelUp', ...r.levelUp, pet: next })
      if (r.evolution) events.push({ kind: 'evolution', ...r.evolution, pet: next })
      if (events.length) setQueue((q) => [...q, ...events])
      return { gained: r.gained, levelUp: r.levelUp, evolution: r.evolution }
    },
    [commit],
  )

  const feed = useCallback(() => {
    const cur = petRef.current
    if (!cur) return { fed: false, hpGained: 0 }
    const r = feedPet(cur, todayKey())
    if (r.fed) commit(r.pet)
    return { fed: r.fed, hpGained: r.hpGained }
  }, [commit])

  const rename = useCallback(
    (name) => {
      const v = validateName(name)
      const cur = petRef.current
      if (v.ok && cur) commit({ ...cur, name: v.name })
      return v
    },
    [commit],
  )

  // 온보딩 O-02 · O-03 결과로 펫 생성
  const adoptPet = useCallback(
    ({ type, name }) => {
      const next = createPet({ type, name, today: todayKey() })
      commit(next)
      return next
    },
    [commit],
  )

  // 저장소가 외부에서 바뀐 뒤 다시 읽기 (S-04 초기화 등)
  const reload = useCallback(() => {
    const stored = loadData(PET_KEY, null)
    petRef.current = stored
    setPet(stored)
    setQueue([])
    setEvent(null)
  }, [])

  // 시연 · 개발용
  const debug = useMemo(
    () => ({
      set: (patch) => petRef.current && commit({ ...petRef.current, ...patch }),
      syncToday,
    }),
    [commit, syncToday],
  )

  const value = useMemo(
    () => ({
      pet,
      addExp,
      feed,
      rename,
      today,
      mood: pet
        ? calculateMood({
            lastActivityDate: effectiveLast === undefined ? (pet.lastExpDate ?? null) : effectiveLast,
            today,
            hp: pet.hp,
          })
        : null,
      canFeedToday: pet ? canFeed(pet, today) : false,
      event,
      dismissEvent,
      adoptPet,
      reload,
      debug,
    }),
    [pet, addExp, feed, rename, today, effectiveLast, event, dismissEvent, adoptPet, reload, debug],
  )

  return (
    <PetContext.Provider value={value}>
      {children}
      <PetEventHost event={event} onClose={dismissEvent} />
    </PetContext.Provider>
  )
}
