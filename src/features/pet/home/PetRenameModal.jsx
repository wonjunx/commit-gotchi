import { useEffect, useRef, useState } from 'react'
import { NAME_MAX } from '../rules.js'
import { validateName } from '../exp.js'
import { usePet } from '../usePet.js'
import s from './PetRenameModal.module.css'

// S-03 펫 이름 변경 — O-03과 같은 검사(2~8자). 바깥 클릭 · ESC로 닫힘
// 정원준 공통 <Modal>이 생기면 껍데기만 바꾸면 된다
export default function PetRenameModal({ onClose }) {
  const { pet, rename } = usePet()
  const [name, setName] = useState(pet?.name ?? '')
  const inputRef = useRef(null)
  const check = validateName(name)
  const unchanged = check.name === pet?.name

  useEffect(() => {
    inputRef.current?.select()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function save(e) {
    e.preventDefault()
    if (!check.ok || unchanged) return
    rename(check.name)
    onClose()
  }

  return (
    <div className={s.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className={s.box} role="dialog" aria-modal="true" aria-labelledby="rename-title" onSubmit={save} noValidate>
        <h2 id="rename-title" className={s.title}>펫 이름 바꾸기</h2>
        <div className={s.field}>
          <input
            ref={inputRef}
            className={`${s.input} ${!check.ok ? s.invalid : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="새 이름"
            aria-invalid={!check.ok || undefined}
            autoComplete="off"
            spellCheck="false"
          />
          <span className={s.count}>{[...name.trim()].length} / {NAME_MAX}</span>
        </div>
        <p className={`${s.help} ${!check.ok ? s.error : ''}`}>{check.ok ? '한글 · 영문 · 숫자 2~8자' : check.error}</p>
        <div className={s.actions}>
          <button type="button" className={s.btn} onClick={onClose}>CANCEL</button>
          <button type="submit" className={`${s.btn} ${s.primary}`} disabled={!check.ok || unchanged}>SAVE</button>
        </div>
      </form>
    </div>
  )
}
