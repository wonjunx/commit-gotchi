import { useEffect, useState } from 'react'
import { EXP_REWARD, NEGLECT_HP_PENALTY } from '../rules.js'
import HatchEgg from './HatchEgg.jsx'
import { withJosa } from '../josa.js'
import StepHeader from './StepHeader.jsx'
import s from './Onboarding.module.css'

// O-05 부화 — 금이 가며 흔들리다(1.4초) 갈라지고 펫 등장 → EXP 규칙 안내
// 효과음(playSfx('hatch'))의 '팡' 타이밍과 split 시작(1.4초)을 맞춤
const TIMELINE = [
  ['crack1', 450],
  ['crack2', 450],
  ['crack3', 500],
  ['split', 600],
  ['born', null],
]

export default function HatchPet({ pet, onStart }) {
  const reduce =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.classList.contains('cg-no-motion'))
  const [phase, setPhase] = useState(reduce ? 'born' : 'crack1')

  useEffect(() => {
    const i = TIMELINE.findIndex(([p]) => p === phase)
    const [, ms] = TIMELINE[i]
    if (ms == null) return
    const id = setTimeout(() => setPhase(TIMELINE[i + 1][0]), ms)
    return () => clearTimeout(id)
  }, [phase])

  const born = phase === 'born'
  return (
    <section className={s.card} aria-labelledby="hatch-title" aria-live="polite">
      <StepHeader index={5} label="HATCH" />
      <div className={s.stage}>
        <HatchEgg type={pet.type} phase={phase} name={pet.name} />
      </div>

      <h1 id="hatch-title" className={`${s.title} ${s.center}`}>
        {born ? `${withJosa(pet.name, '이', '가')} 깨어났어요!` : phase === 'split' ? '톡!' : '알이 움직이고 있어요…'}
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
