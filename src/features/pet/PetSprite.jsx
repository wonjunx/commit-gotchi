import { CROWN, EYE, SHAPES, TYPE_COLORS } from './petSprites.js'
import s from './PetSprite.module.css'

// 펫 그림. stage: 'shell'(부화 전) · 'egg' · 'baby' · 'growth' · 'legend'
// mood가 있으면 상태별 색 · 움직임 · 효과(HAPPY 반짝임, HUNGRY !, SICK 땀)
// locked: 도감에서 아직 못 얻은 펫 (실루엣)
export default function PetSprite({ type = 'c', stage = 'egg', mood, size = 8, locked = false, animate = true, className = '', title }) {
  const rows = SHAPES[stage] ?? SHAPES.egg
  const color = TYPE_COLORS[type] ?? TYPE_COLORS.c
  const palette = locked
    ? { A: '#1f2a23', B: '#1a231d', D: '#1f2a23', K: '#1f2a23', C: '#1f2a23' }
    : { A: color.A, B: color.B, D: color.D, K: EYE, C: CROWN }
  const w = rows[0].length
  const h = rows.length
  const moodClass = !locked && mood ? s[mood.toLowerCase()] : ''

  return (
    <span
      className={`${s.wrap} ${animate && !locked ? s.animate : ''} ${moodClass} ${className}`}
      style={{ width: w * size, height: h * size }}
      role="img"
      aria-label={title ?? (locked ? '아직 만나지 못한 펫' : `${stage} 펫`)}
    >
      <svg className={s.body} width={w * size} height={h * size} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden="true">
        {rows.flatMap((row, y) =>
          [...row].map((ch, x) =>
            palette[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={palette[ch]} /> : null,
          ),
        )}
      </svg>
      {!locked && mood === 'HAPPY' && (
        <>
          <Plus className={`${s.fx} ${s.spark1}`} size={size} />
          <Plus className={`${s.fx} ${s.spark2}`} size={size} />
          <Plus className={`${s.fx} ${s.spark3}`} size={size} />
        </>
      )}
      {!locked && mood === 'HUNGRY' && <span className={`${s.fx} ${s.bang}`} style={{ fontSize: size * 2.4 }}>!</span>}
      {!locked && mood === 'SICK' && <Drop className={`${s.fx} ${s.drop}`} size={size} />}
    </span>
  )
}

function Plus({ size, className }) {
  return (
    <svg className={className} width={size * 3} height={size * 3} viewBox="0 0 3 3" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="0" width="1" height="3" fill="var(--cg-green, #39ff72)" />
      <rect x="0" y="1" width="3" height="1" fill="var(--cg-green, #39ff72)" />
    </svg>
  )
}

function Drop({ size, className }) {
  return (
    <svg className={className} width={size * 2} height={size * 3} viewBox="0 0 2 3" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="0.5" y="0" width="1" height="1" fill="#6fc3ff" />
      <rect x="0" y="1" width="2" height="2" fill="#6fc3ff" />
    </svg>
  )
}
