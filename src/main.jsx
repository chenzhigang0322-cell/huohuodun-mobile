import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Platform from "./Platform";

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

const RootComponent = mode === "platform" ? Platform : App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>,
);
