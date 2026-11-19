import s from './Onboarding.module.css'

// "02 / 05 · CHOOSE EGG" + 진행 점 5개
export default function StepHeader({ index, label, total = 5 }) {
  return (
    <>
      <p className={s.step}>{`${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')} · ${label}`}</p>
      <div className={s.dots} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`${s.dot} ${i < index ? s.dotOn : ''}`} />
        ))}
      </div>
    </>
  )
}
