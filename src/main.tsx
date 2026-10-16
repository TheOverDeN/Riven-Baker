import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/source-serif-4";
import { App } from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('index.html is missing the <div id="root"> the app mounts into.');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
