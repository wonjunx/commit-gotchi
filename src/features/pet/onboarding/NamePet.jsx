import { useState } from 'react'
import { NAME_MAX } from '../rules.js'
import { validateName } from '../exp.js'
import { TYPE_INFO } from '../petSprites.js'
import PetSprite from '../PetSprite.jsx'
import StepHeader from './StepHeader.jsx'
import s from './Onboarding.module.css'

// O-03 이름 짓기 — 2~8자 · 고른 알이 흔들림
export default function NamePet({ type, initialName = '코딩이', onBack, onNext }) {
  const [name, setName] = useState(initialName)
  const [touched, setTouched] = useState(false)
  const check = validateName(name)
  const showError = touched && !check.ok
  const length = [...name.trim()].length

  function submit(e) {
    e.preventDefault()
    setTouched(true)
    if (check.ok) onNext(check.name)
  }

  return (
    <section className={s.card} aria-labelledby="name-pet-title">
      <StepHeader index={3} label="NAME" />
      <div className={s.hero}>
        <PetSprite type={type} stage="shell" size={8} animate={false} className={s.wobble} title="고른 알" />
      </div>
      <h1 id="name-pet-title" className={s.title}>알의 이름을 지어주세요</h1>
      <p className={s.desc}>{TYPE_INFO[type]?.label} TYPE 알이에요. 이름은 설정에서 언제든 바꿀 수 있어요.</p>

      <form onSubmit={submit} noValidate>
        <label htmlFor="pet-name" className={s.label}>PET NAME</label>
        <div className={s.field}>
          <input
            id="pet-name"
            className={`${s.input} ${showError ? s.invalid : ''}`}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setTouched(true)
            }}
            maxLength={NAME_MAX + 4}
            autoComplete="off"
            spellCheck="false"
            autoFocus
            aria-invalid={showError || undefined}
            aria-describedby="pet-name-help"
          />
          <span className={s.count}>{length} / {NAME_MAX}</span>
        </div>
        <p id="pet-name-help" className={`${s.help} ${showError ? s.error : ''}`} role={showError ? 'alert' : undefined}>
          {showError ? check.error : '한글 · 영문 · 숫자 2~8자'}
        </p>

        <div className={s.actions}>
          <button type="button" className={s.btn} onClick={onBack}>BACK</button>
          <button type="submit" className={`${s.btn} ${s.primary}`} disabled={!check.ok}>
            NEXT · 부화시키기 →
          </button>
        </div>
      </form>
    </section>
  )
}
