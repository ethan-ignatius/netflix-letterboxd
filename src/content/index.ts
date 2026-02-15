import { log } from "../shared/log";
import { getStorage, setStorage } from "../shared/storage";
import { detectActiveTitle } from "./netflixSelectors";

const ROOT_ID = "nxlb-shadow-root";
const BADGE_ID = "nxlb-debug-badge";
const TOGGLE_COMBO = {
  ctrlKey: true,
  shiftKey: true,
  key: "l"
};
const OBSERVER_DEBOUNCE_MS = 250;

const ensureBadge = (enabled: boolean) => {
  const existing = document.getElementById(BADGE_ID);
  if (!enabled) {
    existing?.remove();
    return;
  }

  if (existing) return;

  const host = document.createElement("div");
  host.id = BADGE_ID;
  host.style.position = "fixed";
  host.style.bottom = "16px";
  host.style.right = "16px";
  host.style.zIndex = "2147483647";

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      font-family: "Space Grotesk", sans-serif;
    }
    .badge {
      background: #111;
      color: #f5f5f5;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
    }
  `;

  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = "N×L active";

  shadow.appendChild(style);
  shadow.appendChild(badge);
  document.documentElement.appendChild(host);
};

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

const applyOverlayState = async (enabled: boolean) => {
  if (enabled) {
    mountOverlay();
  } else {
    document.getElementById(ROOT_ID)?.remove();
  }
  ensureBadge(enabled);
};

let lastActiveKey = "";
let debounceTimer: number | undefined;

const serializeCandidate = (candidate: ReturnType<typeof detectActiveTitle>): string => {
  if (!candidate) return "";
  return [
    candidate.netflixTitleId ?? "",
    candidate.titleText ?? "",
    candidate.year ?? "",
    candidate.href ?? ""
  ].join("|");
};

const emitActiveTitleChange = () => {
  const candidate = detectActiveTitle();
  const key = serializeCandidate(candidate);
  if (!candidate || key === lastActiveKey) return;
  lastActiveKey = key;
  log("Active title changed", {
    ...candidate,
    at: new Date().toISOString()
  });
};

const scheduleActiveTitleCheck = () => {
  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    emitActiveTitleChange();
  }, OBSERVER_DEBOUNCE_MS);
};

const observeTitleChanges = () => {
  const observer = new MutationObserver(() => scheduleActiveTitleCheck());
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "aria-expanded", "aria-hidden"]
  });

  document.addEventListener("pointerover", scheduleActiveTitleCheck, true);
  document.addEventListener("focusin", scheduleActiveTitleCheck, true);
  scheduleActiveTitleCheck();
};

const toggleOverlay = async () => {
  const state = await getStorage();
  const next = !(state.overlayEnabled ?? true);
  await setStorage({ overlayEnabled: next });
  await applyOverlayState(next);
  log("Overlay toggled", { enabled: next });
};

const handleKeydown = (event: KeyboardEvent) => {
  if (
    event.ctrlKey === TOGGLE_COMBO.ctrlKey &&
    event.shiftKey === TOGGLE_COMBO.shiftKey &&
    event.key.toLowerCase() === TOGGLE_COMBO.key
  ) {
    event.preventDefault();
    toggleOverlay().catch((err) => log("Toggle failed", err));
  }
};

const init = async () => {
  const state = await getStorage();
  const enabled = state.overlayEnabled ?? true;
  await applyOverlayState(enabled);
  observeTitleChanges();
  window.addEventListener("keydown", handleKeydown);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    init().catch((err) => log("Init failed", err));
  }, { once: true });
} else {
  init().catch((err) => log("Init failed", err));
}
