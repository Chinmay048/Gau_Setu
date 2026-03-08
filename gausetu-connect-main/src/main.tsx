import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/firebase"; // Firebase Cloud Sync initialization

createRoot(document.getElementById("root")!).render(<App />);
