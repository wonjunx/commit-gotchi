import React, { useState, useEffect } from "react";
import Header from "./shared/components/Header";
import Home from "./pages/Home";
import PetBook from "./pages/PetBook";
import Achievements from "./pages/Achievements";
import Ranking from "./pages/Ranking";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import { PetProvider } from "./features/pet";
import { initSound } from "./shared/lib/sound";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  const [hasUser, setHasUser] = useState(false);

  // 첫 클릭 이후 BGM 시작
  useEffect(() => {
    initSound();
  }, []);

  // GitHub 연결 + 펫 생성까지 끝나야 HOME
  useEffect(() => {
    const user = localStorage.getItem("commitgotchi_user");
    const pet = localStorage.getItem("commitgotchi_pet");
    if (user && pet) {
      setHasUser(true);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "petbook":
        return <PetBook />;
      case "achievements":
        return <Achievements />;
      case "ranking":
        return <Ranking />;
      case "settings":
        return <Settings />;
      default:
        return <Home />;
    }
  };

  if (!hasUser) {
    return <Onboarding onComplete={() => setHasUser(true)} />;
  }

  return (
    <PetProvider>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--cg-bg)",
          color: "var(--cg-text-main)",
        }}
      >
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main
          style={{ maxWidth: "1344px", margin: "0 auto", padding: "40px 0" }}
        >
          {renderContent()}
        </main>
      </div>
    </PetProvider>
  );
}

export default App;
