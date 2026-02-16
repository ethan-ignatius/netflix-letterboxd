import { log, warn } from "./logger";
import { STORAGE_KEYS } from "./constants";
import type { LetterboxdIndex, LetterboxdIndexLegacy, LetterboxdStats } from "./types";

export interface StorageState {
  [STORAGE_KEYS.OVERLAY_ENABLED]?: boolean;
  [STORAGE_KEYS.TMDB_API_KEY]?: string;
  [STORAGE_KEYS.TMDB_CACHE]?: Record<string, unknown>;
  [STORAGE_KEYS.TMDB_FEATURE_CACHE]?: Record<string, unknown>;
  [STORAGE_KEYS.MATCH_PROFILE]?: Record<string, unknown>;
  [STORAGE_KEYS.LETTERBOXD_INDEX]?: LetterboxdIndex | LetterboxdIndexLegacy;
  [STORAGE_KEYS.LETTERBOXD_STATS]?: LetterboxdStats;
  [STORAGE_KEYS.LAST_IMPORT_AT]?: string;
}

export const getStorage = async (): Promise<StorageState> => {
  log("Loading storage state");
  return chrome.storage.local.get([
    STORAGE_KEYS.OVERLAY_ENABLED,
    STORAGE_KEYS.TMDB_API_KEY,
    STORAGE_KEYS.TMDB_CACHE,
    STORAGE_KEYS.TMDB_FEATURE_CACHE,
    STORAGE_KEYS.MATCH_PROFILE,
    STORAGE_KEYS.LETTERBOXD_INDEX,
    STORAGE_KEYS.LETTERBOXD_STATS,
    STORAGE_KEYS.LAST_IMPORT_AT
  ]) as Promise<StorageState>;
};

export const setStorage = async (state: StorageState): Promise<void> => {
  log("Saving storage state", state);
  await chrome.storage.local.set(state);
};

export const clearStorage = async (): Promise<void> => {
  warn("Clearing storage state");
  await chrome.storage.local.clear();
};

export const getLetterboxdIndex = async (): Promise<LetterboxdIndex | null> => {
  const data = await chrome.storage.local.get([STORAGE_KEYS.LETTERBOXD_INDEX]);
  const raw = data[STORAGE_KEYS.LETTERBOXD_INDEX] as
    | LetterboxdIndex
    | LetterboxdIndexLegacy
    | undefined;
  if (!raw) return null;

  if ("ratingsByKey" in raw && "watchlistKeys" in raw) {
    return raw as LetterboxdIndex;
  }

  const legacy = raw as LetterboxdIndexLegacy;
  const ratingsByKey: Record<string, number> = {};
  const watchlistKeys: Record<string, true> = {};
  Object.entries(legacy).forEach(([key, entry]) => {
    if (entry.r !== undefined) ratingsByKey[key] = entry.r;
    if (entry.w === 1) watchlistKeys[key] = true;
  });
  return {
    ratingsByKey,
    watchlistKeys,
    updatedAt: Date.now()
  };
};

export const setLetterboxdIndex = async (index: LetterboxdIndex): Promise<void> => {
  await chrome.storage.local.set({ [STORAGE_KEYS.LETTERBOXD_INDEX]: index });
};
