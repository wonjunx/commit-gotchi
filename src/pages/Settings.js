import React, { useState } from "react";
import { GithubAccountSection } from "../features/github";

function Settings() {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("commitgotchi_user") || "{}");
  });

  const handleUserChange = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("commitgotchi_user", JSON.stringify(updatedUser));
  };

  return (
    <div
      style={{
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>
        설정 (Settings)
      </h2>

      <GithubAccountSection user={user} onUserChange={handleUserChange} />

      {/* 나중에 다른 설정이 생기면 이 아래로 추가하시면 됩니다 */}
    </div>
  );
}

export default Settings;
