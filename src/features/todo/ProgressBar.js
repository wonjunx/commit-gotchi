/*진행바/ value(완료개수), max(전체 개수) */

export default function ProgressBar({ value, max }) {
  const percent = max === 0 ? 0 : Math.round((value / max) * 100);
 
  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}