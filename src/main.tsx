import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./shared/styles/tokens.css";
import "./shared/styles/base.css";

const params = new URLSearchParams(window.location.search);
const windowType = params.get("window") === "panel" ? "panel" : "pet";
document.documentElement.dataset.window = windowType;
document.body.dataset.window = windowType;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
