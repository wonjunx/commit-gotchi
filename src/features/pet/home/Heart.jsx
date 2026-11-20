// 픽셀 하트 한 칸 (filled: 'full' | 'half' | 'empty')
const ROWS = ['.AA.AA.', 'AAAAAAA', 'AAAAAAA', '.AAAAA.', '..AAA..', '...A...']

export default function Heart({ fill = 'full', size = 2.4 }) {
  const on = 'var(--cg-green, #39ff72)'
  const off = 'var(--cg-line, #2a372e)'
  return (
    <svg width={7 * size} height={6 * size} viewBox="0 0 7 6" shapeRendering="crispEdges" aria-hidden="true">
      {ROWS.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === 'A' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill === 'full' || (fill === 'half' && x < 4) ? on : off} />
          ) : null,
        ),
      )}
    </svg>
  )
}
