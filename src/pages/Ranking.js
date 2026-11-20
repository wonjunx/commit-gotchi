import React, { useState } from "react";
import { loadData, STORAGE_KEYS } from "../shared/lib/storage";
import { usePet } from "../features/pet";
import { useGithubCalendar } from "../features/github";
import { getActivity } from "../features/todo/activity";
import "./Ranking.css";

const DEMO_RANKINGS = {
  weekly: [
    { rank: 1, handle: "pixelMaster", streak: 14, exp: 2440, level: 10 },
    { rank: 2, handle: "javaKing", streak: 11, exp: 2180, level: 10 },
    { rank: 3, handle: "pythonCat", streak: 9, exp: 1920, level: 9 },
    { rank: 4, handle: "dev_sora", streak: 8, exp: 1420, level: 10 },
    { rank: 5, handle: "git_minsu", streak: 8, exp: 1180, level: 8 },
    { rank: 6, handle: "hello_world", streak: 6, exp: 960, level: 7 },
    { rank: 7, handle: "code_jin", streak: 5, exp: 640, level: 6 },
  ],
  monthly: [
    { rank: 1, handle: "pixelMaster", streak: 28, exp: 6840, level: 10 },
    { rank: 2, handle: "javaKing", streak: 24, exp: 5920, level: 10 },
    { rank: 3, handle: "pythonCat", streak: 21, exp: 5150, level: 10 },
    { rank: 4, handle: "dev_sora", streak: 18, exp: 4210, level: 10 },
    { rank: 5, handle: "git_minsu", streak: 15, exp: 3680, level: 9 },
    { rank: 6, handle: "hello_world", streak: 12, exp: 2940, level: 8 },
    { rank: 7, handle: "code_jin", streak: 10, exp: 2450, level: 8 },
  ],
};

function formatRank(num) {
  return String(num).padStart(2, "0");
}

function PixelCrown() {
  const rows = [
    "A...AA...A",
    "A...AA...A",
    "AAAAAAAAAA",
    "AAAAAAAAAA",
    ".AAAAAAAA.",
  ];
  return (
    <svg
      className="podium-crown"
      width="30"
      height="15"
      viewBox="0 0 10 5"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === "A" ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill="var(--cg-green, #3bff77)"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function Ranking() {
  const [period, setPeriod] = useState("weekly");
  const { pet } = usePet();

  const user = loadData(STORAGE_KEYS.USER, {});
  const githubId = user?.githubId || "myGithub";
  const cal = useGithubCalendar(githubId, { getActivity });

  const myExp = pet?.totalExp ?? 0;
  const myLevel = pet?.level ?? 1;
  const myStreak = cal?.streak ?? 0;

  const list = DEMO_RANKINGS[period];
  const topThree = list.slice(0, 3);
  const restList = list.slice(3);

  const higherCount = list.filter((item) => item.exp > myExp).length;
  const myRank =
    higherCount < list.length
      ? higherCount + 1
      : Math.max(8, 23 - Math.floor(myExp / 40));

  return (
    <div className="ranking-page">
      <header className="ranking-header">
        <h1 className="ranking-title">RANKING</h1>
        <p className="ranking-sub">
          함께 코딩하고, 함께 성장해요. ·{" "}
          <span className="ranking-sub-mono">EXP 기준 · DEMO DATA</span>
        </p>
      </header>

      <div className="ranking-tabs" role="tablist" aria-label="랭킹 기간">
        <button
          type="button"
          role="tab"
          aria-selected={period === "weekly"}
          className={`ranking-tab ${period === "weekly" ? "active" : ""}`}
          onClick={() => setPeriod("weekly")}
        >
          WEEKLY
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={period === "monthly"}
          className={`ranking-tab ${period === "monthly" ? "active" : ""}`}
          onClick={() => setPeriod("monthly")}
        >
          MONTHLY
        </button>
      </div>

      {/* 1~3위 카드 */}
      <section className="ranking-podium" aria-label="상위 3명 랭킹">
        {topThree.map((item) => (
          <article
            key={item.rank}
            className={`podium-card ${item.rank === 1 ? "first" : ""}`}
          >
            <div>
              <div className="podium-top">
                <span className="podium-rank">{formatRank(item.rank)}</span>
                <PixelCrown />
              </div>
              <p className="podium-handle">@{item.handle}</p>
            </div>

            <div className="podium-meta">
              <span className="podium-streak">{item.streak} DAY STREAK</span>
              <span className="podium-exp">
                EXP {item.exp.toLocaleString()}
              </span>
            </div>
          </article>
        ))}
      </section>

      {/* 4~7위 리스트 */}
      <ul className="ranking-list" aria-label="4위 이하 랭킹">
        {restList.map((item) => (
          <li key={item.rank} className="ranking-row">
            <span className="row-rank">{formatRank(item.rank)}</span>
            <span className="row-handle">@{item.handle}</span>
            <span className="row-exp">{item.exp.toLocaleString()} EXP</span>
            <span className="row-streak">{item.streak} DAY STREAK</span>
            <span className="row-level">LV.{item.level}</span>
          </li>
        ))}
      </ul>

      {/* 내 기록 */}
      <section className="ranking-me-wrap" aria-label="내 랭킹 기록">
        <p className="ranking-me-label">MY RECORD</p>
        <div className="ranking-row me">
          <span className="row-rank">{formatRank(myRank)}</span>
          <span className="row-handle">@{githubId}</span>
          <span className="row-exp">EXP {myExp.toLocaleString()}</span>
          <span className="row-streak">{myStreak} DAY STREAK</span>
          <span className="row-level">LV.{myLevel}</span>
        </div>
      </section>
    </div>
  );
}

export default Ranking;
