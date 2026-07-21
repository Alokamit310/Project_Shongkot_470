import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./App.css";

import App from "./App.jsx";

console.log("[main.jsx] Rendering App component");

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);