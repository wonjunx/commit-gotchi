import { useContext } from 'react'
import { PetContext } from './petContext.js'

// { pet, addExp(amount, reason), feed(), rename(name), mood, today, canFeedToday, adoptPet, reload }
// shownStage: 화면에 그릴 단계 (진화 연출이 끝나기 전엔 이전 단계)
// addExp는 토스트를 띄우지 않음 (부르는 쪽 담당). 레벨업 · 진화 모달은 자동 표시.
export function usePet() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePet()은 <PetProvider> 안에서만 쓸 수 있어요.')
  return ctx
}
