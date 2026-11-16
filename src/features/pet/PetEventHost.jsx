import { useEffect, useState } from 'react'
import { EXP_PER_LEVEL, MAX_LEVEL, STAGES } from './rules.js'
import { getStage, nextEvolutionLevel } from './exp.js'
import { withJosa } from './josa.js'
import PetSprite from './PetSprite.jsx'
import s from './PetEventHost.module.css'

const STAGE_KO = { egg: '알', baby: '아기', growth: '성장기', legend: '최종 진화' }

// usePet이 띄우는 창: 레벨업 모달(H-05) → 진화 연출(H-06). ESC · Enter로 닫힘
export function PetEventHost({ event, onClose }) {
  useEffect(() => {
    if (!event) return
    const onKey = (e) => (e.key === 'Escape' || e.key === 'Enter') && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [event, onClose])

  if (!event) return null
  return event.kind === 'levelUp' ? <LevelUp event={event} onClose={onClose} /> : <Evolution event={event} onClose={onClose} />
}

// H-05 — 넘친 EXP 이월 표시 (예: 12 / 100)
function LevelUp({ event, onClose }) {
  const { pet, fromLevel, toLevel } = event
  const nextEvo = nextEvolutionLevel(toLevel)
  const maxed = toLevel >= MAX_LEVEL
  const exp = maxed ? EXP_PER_LEVEL : pet.exp
  return (
    <div className={s.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="levelup-title">
        <Confetti />
        <p className={s.kicker}>LEVEL UP!</p>
        <div className={s.hop}>
          <PetSprite type={pet.type} stage={getStage(fromLevel)} mood="HAPPY" size={7} title={pet.name} />
        </div>
        <h2 id="levelup-title" className={s.levels}>
          LV. {fromLevel} <span className={s.arrow}>→</span> LV. {toLevel}
        </h2>
        <p className={s.text}>
          {withJosa(pet.name, '이', '가')} 한 단계 성장했어요.
          {nextEvo ? ` 다음 진화까지 ${nextEvo - toLevel}레벨!` : ' 최고 레벨이에요!'}
        </p>
        <div className={s.barHead}>
          <span>EXP</span>
          <b>{maxed ? 'MAX' : `${exp} / ${EXP_PER_LEVEL}`}</b>
        </div>
        <div className={s.bar}><div className={s.barFill} style={{ width: `${(exp / EXP_PER_LEVEL) * 100}%` }} /></div>
        <button type="button" className={s.ok} onClick={onClose} autoFocus>OK</button>
      </div>
    </div>
  )
}

// H-06 — Lv.3 · 6 · 10 전체 화면 연출. 0.9초 뒤 새 모습 공개
function Evolution({ event, onClose }) {
  const { pet, fromStage, toStage } = event
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setRevealed(true), 900)
    return () => clearTimeout(id)
  }, [])
  const stageIndex = STAGES.findIndex((x) => x.id === toStage)
  const isFinal = toStage === 'legend'
  const date = pet.stageDates?.[toStage]

  return (
    <div className={s.full} role="dialog" aria-modal="true" aria-labelledby="evo-title">
      <div className={s.rays} aria-hidden="true" />
      <p className={s.kicker}>EVOLUTION</p>
      <div className={s.evoRow}>
        <PetSprite type={pet.type} stage={fromStage} size={8} animate={false} className={s.dim} />
        <span className={s.chev} aria-hidden="true">▶▶</span>
        <span className={revealed ? s.reveal : s.silhouette}>
          <PetSprite type={pet.type} stage={toStage} mood={revealed ? 'HAPPY' : undefined} locked={!revealed} size={12} title={`${STAGE_KO[toStage]} ${pet.name}`} />
        </span>
      </div>
      <h2 id="evo-title" className={s.evoTitle}>
        {revealed ? (
          isFinal ? (
            <>{withJosa(pet.name, '이', '가')} <em>최종 진화</em>했어요!</>
          ) : (
            <>{withJosa(pet.name, '이', '가')} <em>{STAGE_KO[toStage]}</em>{withJosa(STAGE_KO[toStage], '으로', '로').slice(STAGE_KO[toStage].length)} 진화했어요!</>
          )
        ) : (
          `${withJosa(pet.name, '이', '가')} 빛나고 있어요…`
        )}
      </h2>
      <p className={s.meta} style={{ visibility: revealed ? 'visible' : 'hidden' }}>
        STAGE {stageIndex} / {STAGES.length - 1} · {STAGES[stageIndex]?.label} · Lv.{pet.level} 달성{date ? ` · ${date}` : ''}
      </p>
      <button type="button" className={s.ok} onClick={onClose} disabled={!revealed} autoFocus style={{ width: 200 }}>확인</button>
    </div>
  )
}

function Confetti() {
  return (
    <span className={s.confetti} aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => <i key={i} style={{ '--i': i }} />)}
    </span>
  )
}
