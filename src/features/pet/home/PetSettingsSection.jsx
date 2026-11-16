import { useState } from 'react'
import { TYPE_INFO } from '../petSprites.js'
import { usePet } from '../usePet.js'
import PetRenameModal from './PetRenameModal.jsx'
import s from './PetSettingsSection.module.css'

// 설정 화면 펫 섹션 (S-03 이름 변경 진입점)
export default function PetSettingsSection() {
  const { pet } = usePet()
  const [editing, setEditing] = useState(false)
  if (!pet) return null

  return (
    <section className={s.card}>
      <h3 className={s.kicker}>펫</h3>
      <div className={s.row}>
        <span className={s.label}>펫 이름</span>
        <span className={s.value}>
          {pet.name}
          <span className={s.sub}> · {TYPE_INFO[pet.type]?.label} TYPE · Lv.{pet.level}</span>
        </span>
        <button type="button" className={s.btn} onClick={() => setEditing(true)}>RENAME</button>
      </div>
      {editing && <PetRenameModal onClose={() => setEditing(false)} />}
    </section>
  )
}
