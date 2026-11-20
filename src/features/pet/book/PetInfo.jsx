import { useMemo } from 'react'
import { MAX_LEVEL, STAGES } from '../rules.js'
import { diffDays, nextEvolutionLevel } from '../exp.js'
import { TYPE_INFO } from '../petSprites.js'
import { usePet } from '../usePet.js'
import PetSprite from '../PetSprite.jsx'
import { loadData, STORAGE_KEYS } from '../../../shared/lib/storage'
import { useGithubCalendar, useGithubStatus } from '../../github'
import { getActivity } from '../../todo/activity'
import s from './PetBook.module.css'

const LOG_TEXT = {
  egg: (pet) => `알을 골랐어요 · ${TYPE_INFO[pet.type].label} TYPE`,
  baby: () => '아기로 진화 · Lv.3',
  growth: () => '성장기로 진화 · Lv.6',
  legend: () => '최종 진화 · Lv.10',
}

function longestRun(cells) {
  let best = 0
  let run = 0
  for (const c of cells ?? []) {
    run = c?.status === 'commit' ? run + 1 : 0
    best = Math.max(best, run)
  }
  return best
}

// P-02 펫 정보
export default function PetInfo({ onBack }) {
  const { pet, mood, today } = usePet()
  const githubId = loadData(STORAGE_KEYS.USER, {})?.githubId || ''
  const { totalCount } = useGithubStatus(githubId)
  const cal = useGithubCalendar(githubId, { getActivity })

  const doneTodos = useMemo(() => loadData(STORAGE_KEYS.TODOS, []).filter((t) => t.completed).length, [])

  const stageIdx = STAGES.findIndex((x) => x.id === pet.stage)
  const nextLv = nextEvolutionLevel(pet.level)
  const nextStage = STAGES.find((x) => x.minLevel === nextLv)
  const days = diffDays(pet.createdAt, today) + 1

  const stats = [
    ['총 GitHub 활동', totalCount ?? 0, 'commits'],
    ['현재 스트릭', cal.streak ?? 0, 'days'],
    ['이번 달 최장 스트릭', Math.max(longestRun(cal.cells), cal.streak ?? 0), 'days'],
    ['완료한 To-do', doneTodos, 'todos'],
    ['총 획득 EXP', pet.totalExp.toLocaleString(), 'exp'],
    ['함께한 날', days, 'days'],
  ]

  return (
    <div className={s.page}>
      <div className={s.crumb}>
        <button type="button" className={s.crumbLink} onClick={onBack}>PET BOOK</button>
        <span aria-hidden="true">›</span>
        <h1>{pet.name} 정보</h1>
      </div>

      <div className={s.layout}>
        <section className={s.panel}>
          <div className={s.profileTop}>{TYPE_INFO[pet.type].label} TYPE · STAGE {stageIdx} / {STAGES.length - 1}</div>
          <div className={s.profileArt}>
            <PetSprite type={pet.type} stage={pet.stage} mood={mood} size={12} />
          </div>
          <h2 className={s.profileName}>{pet.name}<small>LV. {pet.level}</small></h2>
          <p className={s.profileMood}>● {mood}</p>
          <div className={s.next}>
            <div className={s.nextLabel}>다음 진화 · {nextStage ? nextStage.label : 'COMPLETE'}</div>
            <p>{nextLv ? `Lv.${nextLv} 달성까지 ${nextLv - pet.level}레벨 남았어요` : '모든 진화를 마쳤어요!'}</p>
            <div className={s.bar}><div className={s.barFill} style={{ width: `${(pet.level / MAX_LEVEL) * 100}%` }} /></div>
            <div className={s.barFoot}><span>Lv.{pet.level}</span><span>Lv.{MAX_LEVEL}</span></div>
          </div>
        </section>

        <div>
          <div className={s.stats}>
            {stats.map(([label, value, unit]) => (
              <div key={label} className={s.stat}>
                <div className={s.statLabel}>{label}</div>
                <div className={s.statValue}>{value}<small>{unit}</small></div>
              </div>
            ))}
          </div>
          <section className={s.panel}>
            <h2 className={s.logTitle}>GROWTH LOG</h2>
            <ul className={s.log}>
              {STAGES.map((st) => {
                const date = pet.stageDates?.[st.id]
                return (
                  <li key={st.id} className={date ? '' : s.logTodo}>
                    <PetSprite type={pet.type} stage={st.id} size={3} locked={!date} animate={false} />
                    <span className={s.logDate}>{date ?? '?'}</span>
                    <span>{LOG_TEXT[st.id](pet)}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
