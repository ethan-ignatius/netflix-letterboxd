import { log, warn } from "./logger";
import { STORAGE_KEYS } from "./constants";
import type { LetterboxdIndex, LetterboxdStats } from "./types";

export interface StorageState {
  [STORAGE_KEYS.OVERLAY_ENABLED]?: boolean;
  [STORAGE_KEYS.TMDB_API_KEY]?: string;
  [STORAGE_KEYS.TMDB_CACHE]?: Record<string, unknown>;
  [STORAGE_KEYS.TMDB_FEATURE_CACHE]?: Record<string, unknown>;
  [STORAGE_KEYS.MATCH_PROFILE]?: Record<string, unknown>;
  [STORAGE_KEYS.LETTERBOXD_INDEX]?: LetterboxdIndex;
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
