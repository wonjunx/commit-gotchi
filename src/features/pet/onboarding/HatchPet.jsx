import { useEffect, useState } from 'react'
import { EXP_REWARD, NEGLECT_HP_PENALTY } from '../rules.js'
import PetSprite from '../PetSprite.jsx'
import { withJosa } from '../josa.js'
import StepHeader from './StepHeader.jsx'
import s from './Onboarding.module.css'

// O-05 부화 — 알이 흔들리다 깨지고 펫 등장 → EXP 규칙 안내
// phase: shake(1.4s) → crack(0.5s) → born
export default function HatchPet({ pet, onStart }) {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [phase, setPhase] = useState(reduce ? 'born' : 'shake')

  useEffect(() => {
    if (phase === 'born') return
    const id = setTimeout(() => setPhase(phase === 'shake' ? 'crack' : 'born'), phase === 'shake' ? 1400 : 500)
    return () => clearTimeout(id)
  }, [phase])

  const born = phase === 'born'
  return (
    <section className={s.card} aria-labelledby="hatch-title" aria-live="polite">
      <StepHeader index={5} label="HATCH" />
      <div className={s.stage}>
        {!born ? (
          <span className={phase === 'shake' ? s.shake : s.crack}>
            <PetSprite type={pet.type} stage="shell" size={9} animate={false} title="부화 중인 알" />
          </span>
        ) : (
          <>
            <span className={s.flash} />
            <PetSprite type={pet.type} stage="shell" size={5} animate={false} title="깨진 알" className={s.fadeIn} />
            <span className={`${s.arrow} ${s.fadeIn}`}>→</span>
            <span className={s.pop}>
              <PetSprite type={pet.type} stage="egg" mood="HAPPY" size={9} title={pet.name} />
            </span>
          </>
        )}
      </div>

      <h1 id="hatch-title" className={`${s.title} ${s.center}`}>
        {born ? `${withJosa(pet.name, '이', '가')} 깨어났어요!` : '알이 움직이고 있어요…'}
      </h1>

      <div className={born ? s.fadeIn : ''} style={{ visibility: born ? 'visible' : 'hidden' }}>
        <p className={`${s.desc} ${s.center}`}>이렇게 하면 {withJosa(pet.name, '이', '가')} 자라요.</p>
        <ul className={s.rules}>
          <li><span>GitHub에 커밋하기 (하루 1번)</span><span className={s.gain}>+{EXP_REWARD.github} EXP</span></li>
          <li><span>To-do 하나 완료</span><span className={s.gain}>+{EXP_REWARD.todo} EXP</span></li>
          <li><span>오늘 To-do 전부 완료</span><span className={s.gain}>+{EXP_REWARD.allTodoBonus} BONUS</span></li>
          <li><span>하루 아무 활동 없음</span><span className={s.loss}>HP -{NEGLECT_HP_PENALTY}</span></li>
        </ul>
        <p className={s.evo}>Lv.3 아기 → Lv.6 성장기 → Lv.10 최종 진화</p>
        <div className={s.actions}>
          <button type="button" className={`${s.btn} ${s.primary} ${s.full}`} onClick={onStart} disabled={!born}>
            START · HOME으로 →
          </button>
        </div>
      </div>
    </section>
  )
}
