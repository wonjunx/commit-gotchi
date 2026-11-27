import { PET_TYPES } from '../rules.js'
import { TYPE_INFO } from '../petSprites.js'
import PetSprite from '../PetSprite.jsx'
import StepHeader from './StepHeader.jsx'
import s from './Onboarding.module.css'

// O-02 알 고르기 — 하나 고르기 전에는 NEXT 비활성
export default function ChooseEgg({ selected, onSelect, onBack, onNext }) {
  return (
    <section className={`${s.card} ${s.wide}`} aria-labelledby="choose-egg-title">
      <StepHeader index={2} label="CHOOSE EGG" />
      <h1 id="choose-egg-title" className={s.title}>함께할 알을 골라주세요</h1>
      <p className={s.desc}>알마다 깨어나는 펫과 코딩 팁이 달라요. 나중에 도감에서 다른 펫도 모을 수 있어요.</p>

      <div className={s.eggs} role="radiogroup" aria-label="알 종류">
        {PET_TYPES.map(({ id }) => {
          const on = selected === id
          const info = TYPE_INFO[id]
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`${s.egg} ${on ? s.eggOn : ''}`}
              onClick={() => onSelect(id)}
            >
              <span className={s.eggArt}>
                <PetSprite type={id} stage="shell" size={5} animate={false} title={`${info.label} 알`} />
              </span>
              <span className={s.eggType} style={{ color: on ? 'var(--cg-green, #39ff72)' : undefined }}>
                {info.label} TYPE
              </span>
              <span className={`${s.pill} ${on ? s.pillOn : ''}`}>{on ? 'SELECTED' : 'SELECT'}</span>
            </button>
          )
        })}
      </div>

      <div className={s.actions}>
        <button type="button" className={s.btn} onClick={onBack} disabled={!onBack}>BACK</button>
        <button type="button" className={`${s.btn} ${s.primary}`} onClick={onNext} disabled={!selected}>
          NEXT · 이름 짓기 →
        </button>
      </div>
    </section>
  )
}
