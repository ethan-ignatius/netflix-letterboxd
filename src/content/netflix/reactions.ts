import type { ReactionEvent, ReactionTimeline, ReactionType } from "../../shared/types";
import { mountEmotionTimeline, hideEmotionTimeline } from "../ui/emotion-timeline";
import { detectActiveTitleContext } from "./selectors";

const REACTION_KEYS: Record<string, ReactionType> = {
  KeyL: "laugh",
  KeyS: "sad",
  KeyA: "angry",
  KeyB: "bored",
  KeyH: "shock", // "huh" / surprise
  KeyN: "neutral",
  KeyJ: "smile" // J for joy — avoids M which is Netflix mute toggle
};

const REACTION_EMOJI: Record<ReactionType, string> = {
  laugh: "😂",
  smile: "😊",
  shock: "😱",
  sad: "😢",
  angry: "😡",
  scared: "😨",
  bored: "😴",
  neutral: "🙂"
};

const getMainVideo = (): HTMLVideoElement | null => {
  const videos = document.querySelectorAll<HTMLVideoElement>("video");
  for (let i = 0; i < videos.length; i += 1) {
    const v = videos[i];
    const r = v.getBoundingClientRect();
    if (r.width >= window.innerWidth * 0.5 && r.height >= window.innerHeight * 0.5) return v;
  }
  return videos[0] ?? null;
};

const createReactionId = (): string =>
  `rx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const getPlayerContainer = (): HTMLElement | null =>
  (document.querySelector<HTMLElement>(
    ".watch-video--player-view, [data-uia*='video-player'], [class*='VideoPlayer']"
  ) ?? document.body);

const spawnFloatingEmoji = (type: ReactionType) => {
  const container = getPlayerContainer();
  if (!container) return;
  const emoji = REACTION_EMOJI[type];
  if (!emoji) return;

  const el = document.createElement("div");
  el.textContent = emoji;
  el.style.position = "absolute";
  el.style.zIndex = "2147483647";
  el.style.pointerEvents = "none";
  el.style.fontSize = "26px";
  el.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.6))";

  const rect = container.getBoundingClientRect();
  const relX = 0.3 + Math.random() * 0.4; // 30–70% width
  const relY = 0.6 + Math.random() * 0.15; // near bottom
  el.style.left = `${rect.width * relX}px`;
  el.style.top = `${rect.height * relY}px`;
  el.style.transform = "translate(-50%, 0)";
  el.style.opacity = "1";
  el.style.transition = "transform 700ms ease-out, opacity 700ms ease-out";

  container.appendChild(el);

  requestAnimationFrame(() => {
    el.style.transform = "translate(-50%, -60px)";
    el.style.opacity = "0";
  });

  window.setTimeout(() => {
    el.remove();
  }, 800);
};

let helpPanelHost: HTMLDivElement | null = null;
let hoverHideTimer: number | null = null;
let hoverSettleMountTimer: number | null = null;
let lastTimelineMountAt = 0;
let hoverContainer: HTMLElement | null = null;
let hoverGlobalBound = false;

const TIMELINE_HOST_ID = "nxlb-reaction-timeline";
const HOVER_HIDE_DELAY_MS = 1700;
const QUICK_HIDE_DELAY_MS = 320;
const MOUNT_THROTTLE_MS = 260;
const MOUNT_SETTLE_DELAY_MS = 120;

const ensureHelpPanel = () => {
  if (helpPanelHost && helpPanelHost.isConnected) return;
  const container = getPlayerContainer();
  if (!container) return;
  const host = document.createElement("div");
  host.style.position = "absolute";
  host.style.right = "20px";
  host.style.top = "50%";
  host.style.bottom = "auto";
  host.style.transform = "translateY(-50%)";
  host.style.zIndex = "2147483646";
  host.style.pointerEvents = "none";

  const panel = document.createElement("div");
  panel.style.pointerEvents = "none";
  panel.style.background = "transparent";
  panel.style.border = "none";
  panel.style.padding = "0";
  panel.style.fontFamily =
    '"Netflix Sans", "Netflix Sans Icon", "Helvetica Neue", Helvetica, Arial, sans-serif';
  panel.style.fontSize = "11px";
  panel.style.color = "rgba(255,255,255,0.9)";
  panel.style.textShadow = "0 2px 8px rgba(0,0,0,0.8)";
  panel.style.maxWidth = "300px";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.alignItems = "center";

  const title = document.createElement("div");
  title.textContent = "Press while watching!";
  title.style.fontWeight = "700";
  title.style.fontSize = "16px";
  title.style.marginBottom = "10px";
  title.style.letterSpacing = "0.25px";
  title.style.textAlign = "center";

  const list = document.createElement("div");
  list.style.display = "flex";
  list.style.flexDirection = "column";
  list.style.alignItems = "center";
  list.style.gap = "10px";

  const keyPairs: Array<[string, ReactionType]> = [
    ["L", "laugh"],
    ["J", "smile"],
    ["H", "shock"],
    ["S", "sad"],
    ["A", "angry"],
    ["B", "bored"],
    ["N", "neutral"]
  ];

  keyPairs.forEach(([keyLabel, type]) => {
    const emoji = REACTION_EMOJI[type];
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "center";
    row.style.gap = "8px";
    row.style.whiteSpace = "nowrap";

    const emojiEl = document.createElement("span");
    emojiEl.textContent = emoji;
    emojiEl.style.fontSize = "18px";
    emojiEl.style.lineHeight = "1";

    const keyEl = document.createElement("span");
    keyEl.textContent = `Press ${keyLabel}`;
    keyEl.style.fontWeight = "700";
    keyEl.style.fontSize = "13px";
    keyEl.style.letterSpacing = "0.25px";

    const label = document.createElement("span");
    label.textContent = type;
    label.style.textTransform = "capitalize";
    label.style.fontSize = "13px";
    label.style.opacity = "0.92";

    row.appendChild(emojiEl);
    row.appendChild(keyEl);
    row.appendChild(label);
    list.appendChild(row);
  });

  panel.appendChild(title);
  panel.appendChild(list);
  host.appendChild(panel);
  host.style.display = "none";
  container.appendChild(host);
  helpPanelHost = host;
};

const setHelpPanelVisible = (visible: boolean) => {
  if (!helpPanelHost) return;
  helpPanelHost.style.display = visible ? "block" : "none";
};

const isWatchPage = (): boolean => window.location.pathname.includes("/watch/");

const clearOverlayTimers = () => {
  if (hoverHideTimer !== null) {
    window.clearTimeout(hoverHideTimer);
    hoverHideTimer = null;
  }
  if (hoverSettleMountTimer !== null) {
    window.clearTimeout(hoverSettleMountTimer);
    hoverSettleMountTimer = null;
  }
};

const scheduleHoverHide = (delayMs = HOVER_HIDE_DELAY_MS, clearSettleMount = false) => {
  if (hoverHideTimer !== null) {
    window.clearTimeout(hoverHideTimer);
  }
  if (clearSettleMount && hoverSettleMountTimer !== null) {
    window.clearTimeout(hoverSettleMountTimer);
    hoverSettleMountTimer = null;
  }
  hoverHideTimer = window.setTimeout(() => {
    const activeVideo = getMainVideo();
    if (!activeVideo || activeVideo.paused || activeVideo.ended) return;
    setHelpPanelVisible(false);
    hideEmotionTimeline();
  }, delayMs);
};

const isTimelineHostTarget = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof Node)) return false;
  if (target instanceof HTMLElement && target.id === TIMELINE_HOST_ID) return true;
  if (target instanceof Element && target.closest(`#${TIMELINE_HOST_ID}`)) return true;
  const root = target.getRootNode?.();
  return root instanceof ShadowRoot &&
    root.host instanceof HTMLElement &&
    root.host.id === TIMELINE_HOST_ID;
};

const requestTimelineMount = (force = false) => {
  const now = Date.now();
  if (!force && now - lastTimelineMountAt < MOUNT_THROTTLE_MS) return;
  lastTimelineMountAt = now;
  void mountEmotionTimeline();
};

const showHoverTimeline = () => {
  if (!isWatchPage()) return;
  const video = getMainVideo();
  if (!video || video.paused || video.ended) return;

  ensureHelpPanel();
  setHelpPanelVisible(true);
  requestTimelineMount();

  if (hoverSettleMountTimer !== null) window.clearTimeout(hoverSettleMountTimer);
  hoverSettleMountTimer = window.setTimeout(() => {
    const activeVideo = getMainVideo();
    if (!activeVideo || activeVideo.paused || activeVideo.ended || !isWatchPage()) return;
    requestTimelineMount(true);
  }, MOUNT_SETTLE_DELAY_MS);

  scheduleHoverHide(HOVER_HIDE_DELAY_MS);
};

const hideHoverTimeline = (evt?: MouseEvent) => {
  const video = getMainVideo();
  if (!video || video.paused || video.ended) return;
  if (evt?.relatedTarget && isTimelineHostTarget(evt.relatedTarget)) {
    scheduleHoverHide(HOVER_HIDE_DELAY_MS);
    return;
  }
  scheduleHoverHide(QUICK_HIDE_DELAY_MS, true);
};

const bindHoverReveal = () => {
  const container = getPlayerContainer();
  if (!container || container === hoverContainer) return;
  hoverContainer = container;
  container.addEventListener("mousemove", showHoverTimeline, { passive: true });
  container.addEventListener("mouseenter", showHoverTimeline, { passive: true });
  container.addEventListener("mouseleave", (evt) => hideHoverTimeline(evt));

  if (hoverGlobalBound) return;
  hoverGlobalBound = true;
  document.addEventListener(
    "mousemove",
    (evt) => {
      if (!isWatchPage()) return;
      const overTimeline = evt.composedPath().some(
        (node) => node instanceof HTMLElement && node.id === TIMELINE_HOST_ID
      );
      if (overTimeline) showHoverTimeline();
    },
    { passive: true }
  );
};

const getActiveTitleId = (): string | null => {
  const match = window.location.pathname.match(/\/watch\/(\d+)/);
  if (match?.[1]) return match[1];
  const { candidate } = detectActiveTitleContext();
  return candidate?.netflixTitleId ?? null;
};

const getProfileId = (): string | null => {
  // For now, no per-profile separation; can be extended later.
  return null;
};

const sendReactionEvent = (event: ReactionEvent) => {
  chrome.runtime.sendMessage({ type: "STORE_REACTION_EVENT", payload: event }).catch(() => {});
};

export const initReactionCapture = () => {
  const attachToVideo = (video: HTMLVideoElement) => {
    if (video.dataset.nxlReactionsObserved === "1") return;
    video.dataset.nxlReactionsObserved = "1";

    if (!isWatchPage()) return;

    ensureHelpPanel();
    bindHoverReveal();
    video.addEventListener("pause", () => {
      clearOverlayTimers();
      setHelpPanelVisible(true);
      requestTimelineMount(true);
    });
    video.addEventListener("play", () => {
      clearOverlayTimers();
      setHelpPanelVisible(false);
      hideEmotionTimeline();
    });
  };

  // Initial attach if we're already on a watch page.
  if (isWatchPage()) {
    ensureHelpPanel();
    bindHoverReveal();
    const video = getMainVideo();
    if (video) attachToVideo(video);
  }

  // Observe DOM for route changes and new video elements (SPA navigation).
  const observer = new MutationObserver(() => {
    if (!isWatchPage()) return;
    ensureHelpPanel();
    bindHoverReveal();
    const video = getMainVideo();
    if (video) attachToVideo(video);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener(
    "keydown",
    (evt) => {
      if (evt.repeat) return;
      const type = REACTION_KEYS[evt.code];
      if (!type) return;

      // Prevent Netflix from handling the same key (e.g. mute, subtitles)
      evt.stopPropagation();
      evt.preventDefault();

      const video = getMainVideo();
      if (!video) return;

      const netflixId = getActiveTitleId();
      if (!netflixId) return;

      const timestampSec = video.currentTime;
      const event: ReactionEvent = {
        id: createReactionId(),
        netflixId,
        profileId: getProfileId(),
        season: null,
        episode: null,
        timestampSec,
        createdAt: Date.now(),
        type
      };

      sendReactionEvent(event);
      spawnFloatingEmoji(type);
    },
    true
  );
};

export const requestReactionTimeline = async (
  netflixId: string,
  durationSec: number
): Promise<ReactionTimeline | null> => {
  try {
    const response = (await chrome.runtime.sendMessage({
      type: "GET_REACTION_TIMELINE",
      payload: { netflixId, durationSec }
    })) as ReactionTimeline;
    return response ?? null;
  } catch {
    return null;
  }
};
