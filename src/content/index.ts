import { log } from "../shared/log";
import { getStorage, setStorage } from "../shared/storage";
import {
  detectActiveTitleContext,
  extractGenresLine,
  extractMetadataLine,
  findOverlayContainer,
  findOverlayAnchor,
  findPreviewElement
} from "./netflixSelectors";
import { updateOverlay } from "./overlay";
import type { ResolveTitleMessage, TitleResolvedMessage } from "../shared/types";
import { DEBUG } from "../shared/log";

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

const serializeCandidate = (
  candidate: ReturnType<typeof detectActiveTitleContext>["candidate"]
): string => {
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
  const previewEl = findPreviewElement(container);
  const overlayContainer = findOverlayContainer(container, previewEl);
  const anchor = findOverlayAnchor(overlayContainer ?? container);
  const metadataLine = extractMetadataLine(overlayContainer ?? container);
  const genresLine = extractGenresLine(overlayContainer ?? container);
  const previewRegion = (() => {
    if (!overlayContainer || !previewEl) return undefined;
    const containerRect = overlayContainer.getBoundingClientRect();
    const previewRect = previewEl.getBoundingClientRect();
    if (containerRect.height === 0) return undefined;
    const top = Math.max(0, previewRect.top - containerRect.top);
    const bottom = Math.max(0, previewRect.bottom - containerRect.top);
    const controlsHeight = Math.max(0, containerRect.bottom - previewRect.bottom);
    return {
      top,
      bottom,
      containerHeight: containerRect.height,
      previewHeight: Math.max(0, previewRect.height),
      controlsHeight
    };
  })();
  const safeMode = !overlayContainer || !previewEl;
  const key = serializeCandidate(candidate);
  if (!candidate) {
    try {
      updateOverlay(null, null);
    } catch (error) {
      log("Overlay cleanup failed", { error });
    }
    lastActiveKey = "";
    lastContainer = null;
    return;
  }

  if (key === lastActiveKey && overlayContainer === lastContainer) return;
  lastActiveKey = key;
  lastContainer = overlayContainer;
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

      try {
        updateOverlay(
          overlayContainer,
          {
            titleLine,
            metadataLine,
            genresLine,
            communityRating: response.payload.tmdbVoteAverage,
            ratingCount: response.payload.tmdbVoteCount,
            inWatchlist: response.payload.inWatchlist,
            userRating: response.payload.userRating,
            matchScore: response.payload.matchScore,
            matchExplanation: response.payload.matchExplanation,
            debug: DEBUG
              ? {
                ...candidate,
                ...response.payload
              }
              : undefined
          },
          anchor,
          safeMode,
          previewRegion
        );
      } catch (error) {
        log("Overlay update failed", { error });
      }
    })
    .catch((err) => {
      log("Title resolve failed", { requestId, err });
    });

  const titleLine = candidate.titleText
    ? candidate.year
      ? `${candidate.titleText} (${candidate.year})`
      : candidate.titleText
    : "Unknown title";

  try {
    updateOverlay(
      overlayContainer,
      {
        titleLine,
        metadataLine,
        genresLine,
        debug: DEBUG ? { ...candidate } : undefined
      },
      anchor,
      safeMode,
      previewRegion
    );
  } catch (error) {
    log("Overlay update failed", { error });
  }
};

const scheduleActiveTitleCheck = () => {
  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    emitActiveTitleChange();
  }, OBSERVER_DEBOUNCE_MS);
};

const observeTitleChanges = () => {
  const observer = new MutationObserver(() => {
    try {
      scheduleActiveTitleCheck();
    } catch (error) {
      log("Mutation observer failed", { error });
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "aria-expanded", "aria-hidden"]
  });

  document.addEventListener("pointerover", () => {
    try {
      scheduleActiveTitleCheck();
    } catch (error) {
      log("Pointer observer failed", { error });
    }
  }, true);
  document.addEventListener("focusin", () => {
    try {
      scheduleActiveTitleCheck();
    } catch (error) {
      log("Focus observer failed", { error });
    }
  }, true);
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
