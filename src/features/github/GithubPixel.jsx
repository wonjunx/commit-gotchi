// 문자열 격자로 그리는 픽셀아트 (SVG). 각 문자 → palette 색, 그 외 문자는 투명.
export default function GithubPixel({ rows, palette, size = 7, className, title }) {
  const w = rows[0].length;
  const h = rows.length;
  return (
    <svg
      className={className}
      width={w * size}
      height={h * size}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) =>
          palette[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={palette[ch]} /> : null,
        ),
      )}
    </svg>
  );
}
