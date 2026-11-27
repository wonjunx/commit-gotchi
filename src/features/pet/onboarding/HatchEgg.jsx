import { SHAPES, TYPE_COLORS } from '../petSprites.js'
import PetSprite from '../PetSprite.jsx'
import s from './HatchEgg.module.css'

// 부화 연출: 흔들림(금 1→2→3단계) → 윗껍데기 날아감 + 펫 튀어나옴 → 아랫껍데기 사라짐
// phase: 'crack1' | 'crack2' | 'crack3' | 'split' | 'born'
const SPLIT = [4, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 5] // 열마다 갈라지는 줄 (지그재그)
const CRACK_COLS = { crack1: [4, 7], crack2: [2, 9], crack3: [1, 10] }
const BITS = [
  [-46, -30], [-30, -52], [-8, -60], [18, -56], [40, -36], [52, -10],
]
const CELL = 10

export default function HatchEgg({ type, phase, name }) {
  const rows = SHAPES.shell
  const c = TYPE_COLORS[type] ?? TYPE_COLORS.c
  const fill = { A: c.A, B: c.B, D: c.D }
  const crack = CRACK_COLS[phase]
  const w = rows[0].length
  const h = rows.length

  const cells = (part) =>
    rows.flatMap((row, y) =>
      [...row].map((ch, x) => {
        if (!fill[ch]) return null
        const inTop = y < SPLIT[x]
        if ((part === 'top') !== inTop) return null
        const cracked = crack && !inTop && y === SPLIT[x] && x >= crack[0] && x <= crack[1]
        return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={cracked ? '#0b0f0d' : fill[ch]} />
      }),
    )

  const piece = (part) => (
    <svg className={`${s.piece} ${s[part]}`} width={w * CELL} height={h * CELL} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden="true">
      {cells(part)}
    </svg>
  )

  const opened = phase === 'split' || phase === 'born'
  return (
    <div className={`${s.wrap} ${s[phase]}`} style={{ width: w * CELL, height: h * CELL }} role="img" aria-label={opened ? `${name} 부화` : '흔들리는 알'}>
      {opened && <span className={s.flash} aria-hidden="true" />}
      {opened && (
        <span className={s.pet}>
          <PetSprite type={type} stage="egg" mood={phase === 'born' ? 'HAPPY' : undefined} size={9} animate={phase === 'born'} title={name} />
        </span>
      )}
      <div className={s.egg}>
        {piece('top')}
        {piece('bottom')}
      </div>
      {phase === 'split' &&
        BITS.map(([dx, dy], i) => (
          <i key={i} className={s.bit} style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, background: i % 2 ? c.A : c.D }} aria-hidden="true" />
        ))}
    </div>
  )
}
