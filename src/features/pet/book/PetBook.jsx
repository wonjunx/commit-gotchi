import { useState } from 'react'
import { PET_TYPES, STAGES } from '../rules.js'
import { TYPE_INFO } from '../petSprites.js'
import { usePet } from '../usePet.js'
import PetSprite from '../PetSprite.jsx'
import PetInfo from './PetInfo.jsx'
import s from './PetBook.module.css'

const STAGE_KO = { egg: '알', baby: '아기', growth: '성장기', legend: '최종 진화' }

function lockHint(type, stage, pet) {
  if (pet && type === pet.type) {
    const lv = STAGES.find((x) => x.id === stage)?.minLevel
    return `Lv.${lv} 달성 시`
  }
  return '새 알을 얻으면 열려요'
}

// P-01 펫 도감 — 카드를 누르면 P-02 펫 정보
export default function PetBook() {
  const { pet } = usePet()
  const [filter, setFilter] = useState('all')
  const [detail, setDetail] = useState(false)

  if (detail && pet) return <PetInfo onBack={() => setDetail(false)} />

  const types = filter === 'all' ? PET_TYPES.map((t) => t.id) : [filter]
  const cards = types.flatMap((type) => STAGES.map((st) => ({ type, stage: st.id })))
  const total = PET_TYPES.length * STAGES.length
  const owned = pet ? Object.keys(pet.stageDates ?? {}).length : 0

  return (
    <div className={s.page}>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>펫 도감</h1>
          <p className={s.sub}>진화할 때마다 도감에 기록돼요. 다른 알은 업적으로 얻을 수 있어요.</p>
        </div>
        <div className={s.filters}>
          {[{ id: 'all', label: '전체' }, ...PET_TYPES.map((t) => ({ id: t.id, label: TYPE_INFO[t.id].label }))].map((f) => (
            <button key={f.id} type="button" className={`${s.chip} ${filter === f.id ? s.chipOn : ''}`} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
          <span className={s.count}><b>{owned}</b> / {total} 수집</span>
        </div>
      </div>

      <div className={s.grid}>
        {cards.map(({ type, stage }) => {
          const date = pet?.type === type ? pet.stageDates?.[stage] : null
          const key = `${type}-${stage}`
          const label = `${TYPE_INFO[type].label} · ${STAGES.find((x) => x.id === stage).label}`
          if (!date) {
            return (
              <div key={key} className={`${s.card} ${s.locked}`}>
                <span className={s.art}><PetSprite type={type} stage={stage} locked size={6} /></span>
                <span className={s.name}>???</span>
                <span className={s.meta}>{label}</span>
                <span className={s.hint}>{lockHint(type, stage, pet)}</span>
              </div>
            )
          }
          return (
            <button key={key} type="button" className={s.card} onClick={() => setDetail(true)} title={`${pet.name} 정보 보기`}>
              <span className={s.art}><PetSprite type={type} stage={stage} size={6} animate={false} title={`${STAGE_KO[stage]} ${pet.name}`} /></span>
              <span className={s.name}>{pet.name}</span>
              <span className={s.meta}>{label}</span>
              <span className={s.date}>획득 {date.slice(5).replace('-', '/')}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
