import React from "react";
import Placeholder from "../shared/components/Placeholder";
import { TodoCard } from "../features/todo";

function Home() {
  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      <div
        style={{
          flex: 2,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Placeholder name="DAY STREAK & Calendar" height="180px" />

        <TodoCard />
      </div>

      <div style={{ flex: 1 }}>
        <Placeholder name="PET BOX" height="420px" />
      </div>
    </div>
  );
}

export default Home;
