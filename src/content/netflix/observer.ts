import { log, DEBUG } from "../../shared/logger";
import { STORAGE_KEYS } from "../../shared/constants";
import { getStorage, setStorage } from "../../shared/storage";
import { buildLetterboxdKey } from "../../shared/normalize";
import type {
  LetterboxdIndexUpdatedAckMessage,
  LetterboxdIndexUpdatedMessage,
  ExtractedTitleInfo,
  OverlayData,
  OverlayDataResolvedMessage,
  ResolveOverlayDataMessage
} from "../../shared/types";
import {
  findActiveJawbone
} from "./selectors";
import { createOverlayManager } from "../ui/overlay";
import { setBadgeVisible } from "../ui/badge";

const TOGGLE_COMBO = {
  ctrlKey: true,
  shiftKey: true,
  key: "l"
};
const OBSERVER_DEBOUNCE_MS = 250;
const WATCHDOG_INTERVAL_MS = 2000;
const HERO_WIDTH_THRESHOLD = 0.85;
const HERO_HEIGHT_THRESHOLD = 0.6;

const overlayManager = createOverlayManager();

let overlayEnabled = true;
let lastActiveKey = "";
let lastContainer: Element | null = null;
let debounceTimer: number | undefined;
let watchdogTimer: number | undefined;
let lastRequestId = "";
let lastOutlined: HTMLElement | null = null;
let playbackActive = false;
let lastResolvedPayload: OverlayData | null = null;

type NxlWindow = Window & {
  __nxlBooted?: boolean;
  __nxlDebug?: {
    getLbIndex: () => Promise<Record<string, unknown>>;
    lastOverlayData: () => OverlayData | null;
    forceResolve: () => void;
  };
};

const getNxlWindow = () => window as NxlWindow;

const describeElement = (el: Element | null) => {
  if (!el) return "none";
  const parts = [el.tagName.toLowerCase()];
  const className = (el as HTMLElement).className;
  if (className) {
    parts.push(
      "." +
        className
          .toString()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 3)
          .join(".")
    );
  }
  const dataUia = (el as HTMLElement).getAttribute?.("data-uia");
  if (dataUia) parts.push(`[data-uia="${dataUia}"]`);
  return parts.join("");
};

const isHeroSized = (el: Element | null) => {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  return (
    rect.width > window.innerWidth * HERO_WIDTH_THRESHOLD ||
    rect.height > window.innerHeight * HERO_HEIGHT_THRESHOLD
  );
};

const updateDebugOutline = (container: HTMLElement | null) => {
  if (lastOutlined && lastOutlined !== container) {
    lastOutlined.style.outline = "";
    lastOutlined.style.outlineOffset = "";
    lastOutlined = null;
  }
  if (container && DEBUG) {
    container.style.outline = "1px solid rgba(255, 80, 80, 0.85)";
    container.style.outlineOffset = "-1px";
    lastOutlined = container;
  }
};

const isPlaybackRoute = () => window.location.pathname.includes("/watch/");

const isPlayingMainVideo = () => {
  const videos = Array.from(document.querySelectorAll("video"));
  return videos.some((video) => {
    if (video.paused || video.ended) return false;
    const rect = video.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const widthRatio = rect.width / window.innerWidth;
    const heightRatio = rect.height / window.innerHeight;
    return widthRatio > 0.85 || heightRatio > 0.6;
  });
};

const hasPlayerContainer = () => {
  return Boolean(
    document.querySelector(
      "[data-uia*='video-player'], [class*='VideoPlayer'], [class*='watch-video'], [data-uia*='player']"
    )
  );
};

const detectPlaybackActive = () => {
  if (isPlaybackRoute()) return true;
  if (isPlayingMainVideo()) return true;
  if (hasPlayerContainer() && isPlayingMainVideo()) return true;
  return false;
};

const updatePlaybackState = () => {
  const next = detectPlaybackActive();
  if (next === playbackActive) return;
  playbackActive = next;

  if (playbackActive) {
    setBadgeVisible(false);
    log("BADGE_HIDDEN_PLAYBACK");
    overlayManager.unmount();
  } else {
    if (overlayEnabled) {
      setBadgeVisible(true);
      log("BADGE_SHOWN");
      log("BROWSE_MODE_DETECTED");
    }
  }
};

const setBadgeForState = () => {
  if (!overlayEnabled) {
    setBadgeVisible(false);
    return;
  }
  if (!playbackActive) {
    setBadgeVisible(true);
    log("BADGE_SHOWN");
  }
};

const serializeCandidateKey = (info: ExtractedTitleInfo) => {
  return [
    info.normalizedTitle ?? "",
    info.year ?? "",
    info.netflixId ?? "",
    info.href ?? ""
  ].join("|");
};

const buildEmptyOverlayData = (title: string, year?: number): OverlayData => ({
  title,
  year: year ?? null,
  tmdb: {
    id: null,
    voteAverage: null,
    voteCount: null
  },
  letterboxd: {
    inWatchlist: false,
    userRating: null,
    matchPercent: null,
    becauseYouLike: []
  }
});

const attemptResolve = (reason: string) => {
  if (!overlayEnabled) return;
  updatePlaybackState();
  if (playbackActive) return;

  if (DEBUG) log("OVERLAY_MOUNT_ATTEMPT", { reason });
  const jawbone = findActiveJawbone();
  const root = jawbone.jawboneEl;
  const extracted = jawbone.extracted;

  if (!root || !extracted) {
    if (DEBUG) log("OVERLAY_MOUNT_FAILED", { reason: "no-jawbone" });
    overlayManager.unmount();
    updateDebugOutline(null);
    return;
  }

  if (isHeroSized(root)) {
    if (DEBUG) log("OVERLAY_MOUNT_FAILED", { reason: "hero-sized" });
    overlayManager.unmount();
    updateDebugOutline(null);
    return;
  }

  if (DEBUG) {
    log("ACTIVE_JAWBONE_FOUND", {
      rawTitle: extracted.rawTitle,
      netflixId: extracted.netflixId,
      year: extracted.year,
      isSeries: extracted.isSeries,
      rejectedTitleCandidates: jawbone.rejectedCount,
      chosenTitleElement: jawbone.chosenTitleElement
        ? jawbone.chosenTitleElement.outerHTML.slice(0, 200)
        : undefined
    });
    log("EXTRACTED_TITLE_INFO", extracted);
  }

  const key = serializeCandidateKey(extracted);
  if (key === lastActiveKey && root === lastContainer) {
    if (DEBUG) log("OVERLAY_MOUNT_SUCCESS", { reused: true });
    return;
  }

  lastActiveKey = key;
  lastContainer = root;
  updateDebugOutline(root);

  overlayManager.mount(root);
  overlayManager.update(buildEmptyOverlayData(extracted.rawTitle, extracted.year ?? undefined));

  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  lastRequestId = requestId;
  const message: ResolveOverlayDataMessage = {
    type: "RESOLVE_OVERLAY_DATA",
    requestId,
    payload: extracted
  };

  log("OVERLAY_REQUEST", {
    titleText: extracted.rawTitle,
    normalizedTitle: extracted.normalizedTitle,
    href: extracted.href,
    year: extracted.year
  });

  chrome.runtime
    .sendMessage(message)
    .then((response: OverlayDataResolvedMessage) => {
      if (response?.type !== "OVERLAY_DATA_RESOLVED") return;
      if (response.requestId !== lastRequestId) return;
      lastResolvedPayload = response.payload;
      log("OVERLAY_RESPONSE", {
        requestId,
        tmdb: response.payload.tmdb,
        letterboxd: {
          inWatchlist: response.payload.letterboxd?.inWatchlist ?? false,
          userRating: response.payload.letterboxd?.userRating ?? null,
          matchPercent: response.payload.letterboxd?.matchPercent ?? null,
          becauseYouLikeCount: response.payload.letterboxd?.becauseYouLike?.length ?? 0
        }
      });

      overlayManager.update(response.payload);

      if (DEBUG) {
        const lb = response.payload.letterboxd;
        if (!lb || (!lb.inWatchlist && lb.userRating === null)) {
          const keyForLookup = buildLetterboxdKey(extracted.rawTitle, extracted.year ?? undefined);
          chrome.storage.local.get([STORAGE_KEYS.LETTERBOXD_INDEX]).then((data) => {
            if (!data[STORAGE_KEYS.LETTERBOXD_INDEX]) {
              log("LB_MATCH_NOT_FOUND", { reason: "no-index", key: keyForLookup });
            } else if (!extracted.year) {
              log("LB_MATCH_NOT_FOUND", { reason: "missing-year", key: keyForLookup });
            } else {
              log("LB_MATCH_NOT_FOUND", { reason: "no-key", key: keyForLookup });
            }
          });
        }
      }
    })
    .catch((err) => {
      log("Title resolve failed", { requestId, err });
    });
};

const scheduleResolve = (reason: string) => {
  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    attemptResolve(reason);
  }, OBSERVER_DEBOUNCE_MS);
};

const observeTitleChanges = () => {
  const observer = new MutationObserver(() => {
    try {
      scheduleResolve("mutation");
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

  document.addEventListener(
    "pointerover",
    () => {
      try {
        scheduleResolve("pointer");
      } catch (error) {
        log("Pointer observer failed", { error });
      }
    },
    true
  );
  document.addEventListener(
    "focusin",
    () => {
      try {
        scheduleResolve("focus");
      } catch (error) {
        log("Focus observer failed", { error });
      }
    },
    true
  );

  if (watchdogTimer) window.clearInterval(watchdogTimer);
  watchdogTimer = window.setInterval(() => {
    if (!overlayEnabled) return;
    updatePlaybackState();
    if (playbackActive) return;
    if (!overlayManager.isMounted()) {
      attemptResolve("watchdog");
    }
  }, WATCHDOG_INTERVAL_MS);

  scheduleResolve("init");
};

const toggleOverlay = async () => {
  const state = await getStorage();
  const next = !(state[STORAGE_KEYS.OVERLAY_ENABLED] ?? true);
  await setStorage({ [STORAGE_KEYS.OVERLAY_ENABLED]: next });
  overlayEnabled = next;
  if (!next) {
    overlayManager.unmount();
    setBadgeVisible(false);
  } else {
    setBadgeForState();
    scheduleResolve("toggle");
  }
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

const bindRuntimeMessages = () => {
  chrome.runtime.onMessage.addListener(
    (message: LetterboxdIndexUpdatedAckMessage | LetterboxdIndexUpdatedMessage) => {
    if (message?.type === "LB_INDEX_UPDATED") {
      log("LB_INDEX_UPDATED");
      scheduleResolve("lb-index-updated");
      return;
    }
    if (message?.type === "LB_INDEX_UPDATED_ACK") {
      log("LB_INDEX_UPDATED_ACK", message.payload);
      scheduleResolve("lb-index-updated");
    }
  });
};

const setDebugHook = () => {
  const win = getNxlWindow();
  win.__nxlDebug = {
    getLbIndex: async () => chrome.storage.local.get(STORAGE_KEYS.LETTERBOXD_INDEX),
    lastOverlayData: () => lastResolvedPayload,
    forceResolve: () => attemptResolve("force")
  };
};

export const initNetflixObserver = async () => {
  const win = getNxlWindow();
  if (win.__nxlBooted) return;
  win.__nxlBooted = true;

  const state = await getStorage();
  overlayEnabled = state[STORAGE_KEYS.OVERLAY_ENABLED] ?? true;

  updatePlaybackState();
  if (overlayEnabled && !playbackActive) {
    setBadgeVisible(true);
    log("BADGE_SHOWN");
    log("BROWSE_MODE_DETECTED");
  }

  observeTitleChanges();
  bindRuntimeMessages();
  setDebugHook();
  window.addEventListener("keydown", handleKeydown);
};
