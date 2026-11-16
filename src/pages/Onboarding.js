import React, { useState } from "react";
import GithubConnect from "../features/github/GithubConnect";
import { PetOnboarding } from "../features/pet";

// 01 GitHub 연결 → 02~05 펫 만들기 (GitHub 연결은 했는데 펫이 없으면 02부터)
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(() =>
    localStorage.getItem("commitgotchi_user") ? "pet" : "connect"
  );

  const handleConnected = (user) => {
    localStorage.setItem("commitgotchi_user", JSON.stringify(user));
    setStep("pet");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "40px 0",
        boxSizing: "border-box",
        backgroundColor: "var(--cg-bg)",
      }}
    >
      {step === "connect" ? (
        <GithubConnect onConnected={handleConnected} />
      ) : (
        <PetOnboarding
          onBack={() => setStep("connect")}
          onComplete={() => onComplete && onComplete()}
        />
      )}
    </div>
  );
}

export default Onboarding;
