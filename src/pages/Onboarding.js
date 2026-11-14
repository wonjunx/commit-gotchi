import React from "react";
import GithubConnect from "../features/github/GithubConnect";

function Onboarding({ onComplete }) {
  const handleConnected = (user) => {
    localStorage.setItem("commitgotchi_user", JSON.stringify(user));

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "var(--cg-bg)",
      }}
    >
      <GithubConnect onConnected={handleConnected} />
    </div>
  );
}

export default Onboarding;
