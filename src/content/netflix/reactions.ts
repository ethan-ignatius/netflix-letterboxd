import type { ReactionEvent, ReactionType } from "../../shared/types";
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

const ensureHelpPanel = () => {
  if (helpPanelHost && helpPanelHost.isConnected) return;
  const container = getPlayerContainer();
  if (!container) return;
  const host = document.createElement("div");
  host.style.position = "absolute";
  host.style.right = "16px";
  host.style.bottom = "80px";
  host.style.zIndex = "2147483646";
  host.style.pointerEvents = "none";

  const panel = document.createElement("div");
  panel.style.pointerEvents = "auto";
  panel.style.background = "rgba(0,0,0,0.88)";
  panel.style.borderRadius = "12px";
  panel.style.border = "1px solid rgba(255,255,255,0.18)";
  panel.style.padding = "10px 12px";
  panel.style.fontFamily =
    '"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
  panel.style.fontSize = "11px";
  panel.style.color = "rgba(255,255,255,0.9)";
  panel.style.boxShadow = "0 8px 24px rgba(0,0,0,0.5)";

  const title = document.createElement("div");
  title.textContent = "Reactions (press while watching)";
  title.style.fontWeight = "600";
  title.style.marginBottom = "6px";

  const list = document.createElement("div");
  list.style.display = "grid";
  list.style.gridTemplateColumns = "auto 1fr";
  list.style.rowGap = "4px";
  list.style.columnGap = "6px";

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
    const keyEl = document.createElement("div");
    keyEl.textContent = `${emoji}  ${keyLabel}`;
    keyEl.style.whiteSpace = "nowrap";
    const label = document.createElement("div");
    label.textContent = type;
    label.style.textTransform = "capitalize";
    label.style.opacity = "0.75";
    list.appendChild(keyEl);
    list.appendChild(label);
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
    video.addEventListener("pause", () => {
      setHelpPanelVisible(true);
      void mountEmotionTimeline();
    });
    video.addEventListener("play", () => {
      setHelpPanelVisible(false);
      hideEmotionTimeline();
    });
  };

  // Initial attach if we're already on a watch page.
  if (isWatchPage()) {
    const video = getMainVideo();
    if (video) attachToVideo(video);
  }

  // Observe DOM for route changes and new video elements (SPA navigation).
  const observer = new MutationObserver(() => {
    if (!isWatchPage()) return;
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

