import { log } from "../shared/log";
import { getStorage } from "../shared/storage";

const ROOT_ID = "nxlb-shadow-root";

const mountOverlay = () => {
  if (document.getElementById(ROOT_ID)) {
    log("Overlay already mounted");
    return;
  }

  const host = document.createElement("div");
  host.id = ROOT_ID;
  host.style.position = "fixed";
  host.style.top = "16px";
  host.style.right = "16px";
  host.style.zIndex = "2147483647";

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      font-family: "Space Grotesk", sans-serif;
    }
    .panel {
      background: rgba(12, 12, 12, 0.9);
      color: #f5f5f5;
      border-radius: 12px;
      padding: 12px 14px;
      min-width: 220px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .title {
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 8px;
      opacity: 0.7;
    }
    .status {
      font-size: 14px;
      line-height: 1.4;
    }
  `;

  const panel = document.createElement("div");
  panel.className = "panel";

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = "Letterboxd";

  const status = document.createElement("div");
  status.className = "status";
  status.textContent = "Loading export status...";

  panel.appendChild(title);
  panel.appendChild(status);
  shadow.appendChild(style);
  shadow.appendChild(panel);

  document.documentElement.appendChild(host);

  getStorage()
    .then((state) => {
      if (!state.letterboxdExport) {
        status.textContent = "No export loaded yet.";
        return;
      }
      status.textContent = `Export loaded: ${state.letterboxdExport.films.length} films.`;
    })
    .catch((err) => {
      status.textContent = "Failed to read storage.";
      log("Storage read failed", err);
    });

  log("Overlay mounted");
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountOverlay, { once: true });
} else {
  mountOverlay();
}
