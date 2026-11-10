import React, { useState } from "react";
import Header from "./shared/components/Header";
import Home from "./pages/Home";
import PetBook from "./pages/PetBook";
import Achievements from "./pages/Achievements";
import Ranking from "./pages/Ranking";
import Settings from "./pages/Settings";
import { PetProvider } from "./features/pet";

function App() {
  const [activeTab, setActiveTab] = useState("home");

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

  return (
    <PetProvider>
      <div style={{ minHeight: "100vh", backgroundColor: "#111713" }}>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main style={{ padding: "20px" }}>{renderContent()}</main>
      </div>
    </PetProvider>
  );
}

export default App;
