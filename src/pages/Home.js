import React from "react";
import { TodoCard } from "../features/todo";
import { GithubCalendar, GithubStatus } from "../features/github";
import { getActivity, recordActivity } from "../features/todo/activity";
import { usePet, PetCard } from "../features/pet";
import { DdaySection } from "../features/achievement";
import "./Home.css";

function Home() {
  const user = JSON.parse(localStorage.getItem("commitgotchi_user") || "{}");
  const githubId = user.githubId || "";

  const { addExp } = usePet();

  const showToast = (toastData) => {
    console.log("Toast 띄우기:", toastData);
  };

  return (
    <div className="home-grid">
      <div className="home-left">
        <div className="home-calendar-slot">
          <GithubCalendar
            key={`cal-${githubId}`}
            githubId={githubId}
            getActivity={getActivity}
          />
        </div>
        <div className="home-dday-slot">
          <DdaySection />
        </div>
        <div className="home-todo-slot">
          <TodoCard />
        </div>
      </div>

      <div className="home-right">
        <div className="home-pet-card">
          <PetCard />
          <div className="home-status-slot">
            <GithubStatus
              key={`stat-${githubId}`}
              githubId={githubId}
              onToast={showToast}
              addExp={addExp}
              recordActivity={recordActivity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;