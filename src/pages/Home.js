import React from "react";
import Placeholder from "../shared/components/Placeholder";

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
        <Placeholder name="TO-DO LIST" height="220px" />
      </div>

      <div style={{ flex: 1 }}>
        <Placeholder name="PET BOX" height="420px" />
      </div>
    </div>
  );
}

export default Home;
