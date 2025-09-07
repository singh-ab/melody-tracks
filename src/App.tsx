import React from "react";
import MusicLibrary from "./components/MusicLibrary";
import "./App.css";

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Music Library (Standalone)</h1>
      {/* <p>
        This is the `music-library` micro frontend running in isolation. The
        `MusicLibrary` component below is the one exposed to the main app.
      </p> */}
      {/* <hr style={{ margin: "1rem 0" }} /> */}
      {/* Render the component with a default role for standalone testing */}
      <MusicLibrary role="admin" />
    </div>
  );
}

export default App;
