import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./service-worker-registration";

// Registra o service worker para recursos offline
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
