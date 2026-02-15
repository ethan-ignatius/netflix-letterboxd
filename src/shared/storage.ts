import { log, warn } from "./log";
import type { LetterboxdExport } from "./types";

export interface StorageState {
  letterboxdExport?: LetterboxdExport;
  lastImportAt?: string;
  overlayEnabled?: boolean;
  tmdbApiKey?: string;
  tmdbCache?: Record<string, unknown>;
}

export const getStorage = async (): Promise<StorageState> => {
  log("Loading storage state");
  return chrome.storage.local.get([
    "letterboxdExport",
    "lastImportAt",
    "overlayEnabled",
    "tmdbApiKey",
    "tmdbCache"
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
