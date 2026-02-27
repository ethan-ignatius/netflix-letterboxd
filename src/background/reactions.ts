import { REACTION_BUCKET_SIZE_SEC } from "../shared/constants";
import type {
  EmotionalPathPoint,
  ReactionBucket,
  ReactionEvent,
  ReactionTimeline,
  ReactionType
} from "../shared/types";
import { log } from "../shared/logger";

type EmotionVector = { valence: number; arousal: number };

const REACTION_EMOTION_MAP: Record<ReactionType, EmotionVector> = {
  laugh: { valence: 0.9, arousal: 0.8 },
  smile: { valence: 0.7, arousal: 0.5 },
  shock: { valence: 0.2, arousal: 0.9 },
  sad: { valence: -0.7, arousal: 0.5 },
  angry: { valence: -0.8, arousal: 0.8 },
  scared: { valence: -0.6, arousal: 0.9 },
  bored: { valence: -0.3, arousal: 0.2 },
  neutral: { valence: 0.0, arousal: 0.3 }
};

const REACTION_STORAGE_KEY_PREFIX = "reactions:";

const getStorageKeyForTitle = (netflixId: string, profileId?: string | null) => {
  const suffix = profileId ? `:${profileId}` : "";
  return `${REACTION_STORAGE_KEY_PREFIX}${netflixId}${suffix}`;
};

export const storeReactionEvent = async (event: ReactionEvent) => {
  const key = getStorageKeyForTitle(event.netflixId, event.profileId);
  const data = await chrome.storage.local.get([key]);
  const existing = (data[key] as ReactionEvent[] | undefined) ?? [];
  const next = [...existing, event];
  await chrome.storage.local.set({ [key]: next });
  log("REACTION_STORED", { key, count: next.length });
};

export const getReactionEvents = async (
  netflixId: string,
  profileId?: string | null
): Promise<ReactionEvent[]> => {
  const key = getStorageKeyForTitle(netflixId, profileId);
  const data = await chrome.storage.local.get([key]);
  return (data[key] as ReactionEvent[] | undefined) ?? [];
};

export const buildReactionTimeline = (
  events: ReactionEvent[],
  durationSec: number,
  bucketSizeSec: number = REACTION_BUCKET_SIZE_SEC
): ReactionTimeline => {
  if (durationSec <= 0) {
    return {
      netflixId: events[0]?.netflixId ?? "",
      durationSec: 0,
      bucketSizeSec,
      buckets: []
    };
  }

  const bucketCount = Math.max(1, Math.ceil(durationSec / bucketSizeSec));
  const buckets: ReactionBucket[] = [];

  for (let i = 0; i < bucketCount; i += 1) {
    const startSec = i * bucketSizeSec;
    const endSec = Math.min(durationSec, startSec + bucketSizeSec);
    const reactions: Record<ReactionType, number> = {
      laugh: 0,
      smile: 0,
      shock: 0,
      sad: 0,
      angry: 0,
      scared: 0,
      bored: 0,
      neutral: 0
    };

    buckets.push({
      startSec,
      endSec,
      count: 0,
      reactions,
      meanValence: 0,
      meanArousal: 0,
      intensity: 0
    });
  }

  events.forEach((event) => {
    if (event.timestampSec < 0 || event.timestampSec >= durationSec) return;
    const index = Math.min(
      buckets.length - 1,
      Math.floor(event.timestampSec / bucketSizeSec)
    );
    const bucket = buckets[index];
    bucket.count += 1;
    bucket.reactions[event.type] += 1;
    const { valence, arousal } = REACTION_EMOTION_MAP[event.type];
    bucket.meanValence += valence;
    bucket.meanArousal += arousal;
  });

  buckets.forEach((bucket) => {
    if (bucket.count === 0) {
      bucket.meanValence = 0;
      bucket.meanArousal = 0;
      bucket.intensity = 0;
      return;
    }
    bucket.meanValence /= bucket.count;
    bucket.meanArousal /= bucket.count;
    const magnitude = Math.sqrt(
      bucket.meanValence * bucket.meanValence +
        bucket.meanArousal * bucket.meanArousal
    );
    bucket.intensity = magnitude * Math.log(1 + bucket.count);
  });

  return {
    netflixId: events[0]?.netflixId ?? "",
    durationSec,
    bucketSizeSec,
    buckets
  };
};

export const buildEmotionalPath = (timeline: ReactionTimeline): EmotionalPathPoint[] =>
  timeline.buckets.map((bucket) => {
    const timeSec = (bucket.startSec + bucket.endSec) / 2;
    return {
      timeSec,
      valence: bucket.meanValence,
      arousal: bucket.meanArousal,
      intensity: bucket.intensity
    };
  });

