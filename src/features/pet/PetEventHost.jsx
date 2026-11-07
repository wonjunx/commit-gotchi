import { nextEvolutionLevel } from './exp.js'
import styles from './PetEventHost.module.css'

// 레벨업(H-05) · 진화(H-06) 임시 화면 — 추후 디자인으로 교체
export function PetEventHost({ event, onClose }) {
  if (!event) return null
  const isLevelUp = event.kind === 'levelUp'
  const nextEvo = nextEvolutionLevel(event.toLevel ?? event.pet.level)
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={isLevelUp ? '레벨업' : '진화'}>
      <div className={styles.box}>
        <p className={styles.title}>{isLevelUp ? 'LEVEL UP!' : 'EVOLUTION'}</p>
        {isLevelUp ? (
          <>
            <p className={styles.big}>
              LV. {event.fromLevel} → LV. {event.toLevel}
            </p>
            <p>
              {event.pet.name}가 한 단계 성장했어요.
              {nextEvo ? ` 다음 진화까지 ${nextEvo - event.toLevel}레벨!` : ''}
            </p>
          </>
        ) : (
          <p className={styles.big}>
            {event.fromStage} → {event.toStage}
          </p>
        )}
        <button type="button" className={styles.ok} onClick={onClose} autoFocus>
          {isLevelUp ? 'OK' : '확인'}
        </button>
      </div>
    </div>
  )
}
