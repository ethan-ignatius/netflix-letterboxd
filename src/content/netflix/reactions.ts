import type { ReactionEvent, ReactionType, ReactionTimeline } from "../../shared/types";
import { detectActiveTitleContext } from "./selectors";

const REACTION_KEYS: Record<string, ReactionType> = {
  KeyL: "laugh",
  KeyS: "sad",
  KeyA: "angry",
  KeyB: "bored",
  KeyH: "shock", // "huh" / surprise
  KeyN: "neutral",
  KeyM: "smile"
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
  if (!window.location.pathname.includes("/watch/")) return;

  window.addEventListener(
    "keydown",
    (evt) => {
      if (evt.repeat) return;
      const type = REACTION_KEYS[evt.code];
      if (!type) return;

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

