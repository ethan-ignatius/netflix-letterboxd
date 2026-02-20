export const DEBUG = true;

export const STORAGE_KEYS = {
  OVERLAY_ENABLED: "overlayEnabled",
  TMDB_API_KEY: "tmdbApiKey",
  TMDB_CACHE: "tmdbCache",
  TMDB_FEATURE_CACHE: "tmdbFeatureCache",
  MATCH_PROFILE: "matchProfile",
  LETTERBOXD_INDEX: "lb_index_v1",
  LETTERBOXD_STATS: "lb_stats_v1",
  LAST_IMPORT_AT: "lastImportAt"
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
