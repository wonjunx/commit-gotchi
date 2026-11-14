import React from "react";
import Placeholder from "../shared/components/Placeholder";
import { TodoCard } from "../features/todo";
import { GithubCalendar, GithubStatus } from "../features/github";
import { getActivity, recordActivity } from "../features/todo/activity";
import { usePet } from "../features/pet";

function Home() {
  const user = JSON.parse(localStorage.getItem("commitgotchi_user") || "{}");
  const githubId = user.githubId || "";

  const { addExp } = usePet();

  const showToast = (toastData) => {
    console.log("Toast 띄우기:", toastData);
  };

  return (
    /* 🌟 플렉스 비율 대신 고정 픽셀(740px, 580px)과 간격(24px)으로 1344px에 딱 맞게 배치 */
    <div style={{ display: "flex", gap: "24px" }}>
      {/* 왼쪽 구역 (캘린더 + 투두) */}
      <div
        style={{
          width: "740px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <GithubCalendar
          key={`cal-${githubId}`}
          githubId={githubId}
          getActivity={getActivity}
        />
        <TodoCard />
      </div>

      {/* 오른쪽 구역 (펫 박스 + 지표) */}
      <div
        style={{
          width: "580px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* 펫 박스 임시 높이도 피그마 수치인 630px로 조정 */}
        <Placeholder name="PET BOX" height="630px" />

        <GithubStatus
          key={`stat-${githubId}`}
          githubId={githubId}
          onToast={showToast}
          addExp={addExp}
          recordActivity={recordActivity}
        />
      </div>
    </div>
  );
}

export default Home;
