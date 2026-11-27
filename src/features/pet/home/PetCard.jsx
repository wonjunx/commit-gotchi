import { useState } from 'react'
import { EXP_PER_LEVEL, FEED_HP, HP_MAX, MAX_LEVEL, STAGES } from '../rules.js'
import { diffDays } from '../exp.js'
import { TYPE_INFO } from '../petSprites.js'
import { usePet } from '../usePet.js'
import { playSfx } from '../../../shared/lib/sound'
import PetSprite from '../PetSprite.jsx'
import PetRenameModal from './PetRenameModal.jsx'
import Heart from './Heart.jsx'
import s from './PetCard.module.css'

const MOOD_TEXT = {
  HAPPY: '오늘도 함께 성장했어요!',
  NORMAL: '오늘은 뭘 해볼까요?',
  HUNGRY: '배고파요… 커밋이나 할 일을 해 주세요!',
  SICK: '아파요 · 커밋하면 나아요',
}

function lastFedLabel(lastFedDate, today) {
  if (!lastFedDate) return '아직 안 줬어요'
  const d = diffDays(lastFedDate, today)
  return d <= 0 ? '오늘' : d === 1 ? '어제' : `${d}일 전`
}

// H-04 펫 카드 — HOME 오른쪽 PET BOX 자리. FEED 줄(FeedRow) · 이름 변경(S-03) 포함
// 주소에 ?debug 를 붙이면 시연용 "EXP 98" 버튼이 보임
export default function PetCard() {
  const { pet, shownStage, mood, today, feed, canFeedToday, debug } = usePet()
  const [renaming, setRenaming] = useState(false)
  const [fedPop, setFedPop] = useState(0)

  if (!pet) {
    return (
      <section className={s.card}>
        <div className={s.empty}>
          <PetSprite type="c" stage="shell" size={8} animate={false} />
          아직 함께할 펫이 없어요.
        </div>
      </section>
    )
  }

  const info = TYPE_INFO[pet.type] ?? TYPE_INFO.c
  const stageLabel = STAGES.find((x) => x.id === shownStage)?.label ?? ''
  const maxed = pet.level >= MAX_LEVEL
  const expPct = Math.min(100, (pet.exp / EXP_PER_LEVEL) * 100)
  const hearts = Array.from({ length: 5 }, (_, i) => {
    const v = pet.hp - i * (HP_MAX / 5)
    return v >= HP_MAX / 5 ? 'full' : v >= HP_MAX / 10 ? 'half' : 'empty'
  })
  const showDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')

  function onFeed() {
    const r = feed()
    if (r.fed) {
      playSfx('feed')
      setFedPop((n) => n + 1)
    }
  }

  return (
    <section className={s.card} aria-label={`${pet.name} 펫 카드`}>
      <div className={s.top}>
        <span className={s.type}>{info.label} TYPE</span>
        <span className={`${s.mood} ${s[mood]}`}>
          <span className={s.moodDot} aria-hidden="true" />
          {mood}
        </span>
      </div>

      <div className={s.nameRow}>
        <h2 className={s.name}>{pet.name}</h2>
        <button type="button" className={s.edit} onClick={() => setRenaming(true)} aria-label="펫 이름 바꾸기" title="이름 바꾸기">✎</button>
        <span className={s.level}>LV. {pet.level}</span>
      </div>

      <div className={s.stage}>
        <span className={s.stageLabel}>{stageLabel}</span>
        <span className={s.bubble}>{info.tip}</span>
        <PetSprite type={pet.type} stage={shownStage} mood={mood} size={13} title={`${pet.name} (${mood})`} />
      </div>
      <p className={s.caption}>{MOOD_TEXT[mood]}</p>

      <div className={s.barHead}>
        <span>EXP</span>
        <b>{maxed ? 'MAX' : `${pet.exp} / ${EXP_PER_LEVEL}`}</b>
      </div>
      <div className={s.bar} role="progressbar" aria-label="경험치" aria-valuemin={0} aria-valuemax={EXP_PER_LEVEL} aria-valuenow={pet.exp}>
        <div className={s.barFill} style={{ width: `${expPct}%` }} />
      </div>

      <div className={s.hpRow}>
        <span>HP</span>
        <span className={s.hearts} role="img" aria-label={`HP ${pet.hp} / ${HP_MAX}`}>
          {hearts.map((f, i) => <Heart key={i} fill={f} />)}
        </span>
        <span className={`${s.hpNum} ${pet.hp <= 30 ? s.hpLow : ''}`}>{pet.hp} / {HP_MAX}</span>
      </div>

      <div className={s.feed}>
        <button type="button" className={s.feedBtn} onClick={onFeed} disabled={!canFeedToday || pet.hp >= HP_MAX}
          title={!canFeedToday ? '오늘은 이미 밥을 줬어요' : pet.hp >= HP_MAX ? 'HP가 가득해요' : `HP +${FEED_HP}`}>
          FEED
          {fedPop > 0 && <span key={fedPop} className={s.float}>+{FEED_HP} HP</span>}
        </button>
        <span className={s.lastFed}>LAST FED · {lastFedLabel(pet.lastFedDate, today)}</span>
        {showDebug && (
          <button type="button" className={s.debug} onClick={() => debug.set({ exp: 98 })}>EXP 98</button>
        )}
      </div>

      {renaming && <PetRenameModal onClose={() => setRenaming(false)} />}
    </section>
  )
}
