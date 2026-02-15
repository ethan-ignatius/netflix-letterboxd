import { log } from "../shared/log";
import { getStorage, setStorage } from "../shared/storage";
import { detectActiveTitleContext } from "./netflixSelectors";
import { updateOverlay } from "./overlay";
import type { ResolveTitleMessage, TitleResolvedMessage } from "../shared/types";

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

let overlayEnabled = true;

const applyOverlayState = async (enabled: boolean) => {
  overlayEnabled = enabled;
  if (!enabled) {
    updateOverlay(null, null);
  }
  ensureBadge(enabled);
};

let lastActiveKey = "";
let lastContainer: Element | null = null;
let debounceTimer: number | undefined;
let lastRequestId = "";

const serializeCandidate = (candidate: ReturnType<typeof detectActiveTitleContext>[\"candidate\"]): string => {
  if (!candidate) return "";
  return [
    candidate.netflixTitleId ?? "",
    candidate.titleText ?? "",
    candidate.year ?? "",
    candidate.href ?? ""
  ].join("|");
};

const emitActiveTitleChange = () => {
  if (!overlayEnabled) return;

  const { candidate, container } = detectActiveTitleContext();
  const key = serializeCandidate(candidate);
  if (!candidate) {
    updateOverlay(null, null);
    lastActiveKey = "";
    lastContainer = null;
    return;
  }

  if (key === lastActiveKey && container === lastContainer) return;
  lastActiveKey = key;
  lastContainer = container;
  log("Active title changed", {
    ...candidate,
    at: new Date().toISOString()
  });

  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  lastRequestId = requestId;
  const message: ResolveTitleMessage = {
    type: "RESOLVE_TITLE",
    requestId,
    payload: {
      netflixTitleId: candidate.netflixTitleId,
      titleText: candidate.titleText,
      year: candidate.year,
      href: candidate.href
    }
  };

  chrome.runtime
    .sendMessage(message)
    .then((response: TitleResolvedMessage) => {
      if (response?.type !== "TITLE_RESOLVED") return;
      if (response.requestId !== lastRequestId) return;
      log("Title resolved", { requestId, response });

      updateOverlay(container, {
        titleLine,
        communityRating: response.payload.tmdbVoteAverage,
        ratingCount: response.payload.tmdbVoteCount,
        inWatchlist: response.payload.inWatchlist,
        userRating: response.payload.userRating,
        matchScore: response.payload.matchScore,
        matchExplanation: response.payload.matchExplanation
      });
    })
    .catch((err) => {
      log("Title resolve failed", { requestId, err });
    });

  const titleLine = candidate.titleText
    ? candidate.year
      ? `${candidate.titleText} (${candidate.year})`
      : candidate.titleText
    : "Unknown title";

  updateOverlay(container, { titleLine });
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
  if (next) scheduleActiveTitleCheck();
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
