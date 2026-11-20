//업적달성화면
import { useState, useEffect, useCallback } from "react";
import { loadData, saveData, STORAGE_KEYS } from "../../shared/lib/storage";
import { todayKey } from "../../shared/lib/date";
import { usePet } from "../pet";
import { checkAchievements, ddayLabel } from "./achievementRules";
import DdaySection from "./DdaySection";
import { addDday, updateDday, deleteDday } from "./ddayUtils";
import DdayModal from "./DdayModal";
import "./Achievement.css";

const GITHUB_LEDGER_KEY = "commitgotchi_github_ledger";
const TOAST_MS = 2000;

/* 저장된 기록을 모아서 업적 판정 */
const collectResults = (pet) => {
  const user = loadData(STORAGE_KEYS.USER, {});
  const ledger = loadData(GITHUB_LEDGER_KEY, {});
  const myLedger = ledger[user.githubId];

  return checkAchievements({
    todos: loadData(STORAGE_KEYS.TODOS, []),
    activity: loadData(STORAGE_KEYS.ACTIVITY, {}),
    commitDays: myLedger ? myLedger.days : {},
    pet,
  });
};

export default function AchievementsView() {
  const { pet } = usePet();
  const today = todayKey();

  // 화면을 열 때 한 번 판정 (useState 초기값 함수 → 첫 렌더링에만 실행)
  const [results] = useState(() => collectResults(pet));
  const [toast, setToast] = useState("");

  const doneCount = results.filter((r) => r.done).length;

  // 새로 달성한 업적 저장 + 토스트
  useEffect(() => {
    const saved = loadData(STORAGE_KEYS.ACHIEVEMENTS, {});
    const newly = results.filter((r) => r.done && !saved[r.id]);
    if (newly.length === 0) return;

    const updated = { ...saved };
    newly.forEach((r) => {
      updated[r.id] = today;
    });
    saveData(STORAGE_KEYS.ACHIEVEMENTS, updated);
    setToast(`업적 달성! ${newly.map((r) => r.title).join(" · ")}`);
  }, [results, today]);

  // 토스트 자동으로 사라지기 (강의 7장 useEffect + cleanup)
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <section className="ach">
      <header className="ach-header">
        <div>
          <h2 className="ach-title">업적</h2>
          <p className="ach-sub">조건을 채우면 배지와 보상을 받아요.</p>
        </div>
        <span className="ach-count">
          {doneCount} / {results.length} 달성
        </span>
      </header>

      <ul className="ach-grid">
        {results.map((r) => (
          <li
            key={r.id}
            className={`ach-card ${r.done ? "done" : ""} ${r.pending ? "pending" : ""}`}
          >
            <p className="ach-card-title">{r.title}</p>
            <p className="ach-card-desc">{r.desc}</p>

            {r.pending ? (
              <p className="ach-status">COMING SOON</p>
            ) : r.done ? (
              <p className="ach-status">COMPLETE</p>
            ) : (
              <>
                <p className="ach-status">
                  {r.value} / {r.max}
                </p>
                <div className="ach-bar">
                  <div
                    className="ach-bar-fill"
                    style={{ width: `${(r.value / r.max) * 100}%` }}
                  />
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* D-day 줄 (HOME에도 같은 컴포넌트) */}
      <div className="ach-dday-wrap">
        <DdaySection />
      </div>

      {toast && <div className="ach-toast">{toast}</div>}
    </section>
  );
}