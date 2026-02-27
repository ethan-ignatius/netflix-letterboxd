export const DEBUG = true;

/** When set (at build time via VITE_PROXY_BASE_URL), extension uses backend proxy; users need no TMDb/AWS keys. */
export const PROXY_BASE_URL = import.meta.env.VITE_PROXY_BASE_URL || "";

/** Storage keys. Never store or ship AWS/TMDb secrets in source — only in chrome.storage (user-set). */
export const STORAGE_KEYS = {
  OVERLAY_ENABLED: "overlayEnabled",
  TMDB_API_KEY: "tmdbApiKey",
  TMDB_CACHE: "tmdbCache",
  TMDB_FEATURE_CACHE: "tmdbFeatureCache",
  MATCH_PROFILE: "matchProfile",
  LETTERBOXD_INDEX: "lb_index_v1",
  LETTERBOXD_STATS: "lb_stats_v1",
  LAST_IMPORT_AT: "lastImportAt",
  XRAY_ENABLED: "xrayEnabled",
  AWS_ACCESS_KEY_ID: "awsAccessKeyId",
  AWS_SECRET_ACCESS_KEY: "awsSecretAccessKey",
  AWS_REGION: "awsRegion"
} as const;

// Reaction timeline defaults
export const REACTION_BUCKET_SIZE_SEC = 10;

export const XRAY_CACHE_DB_NAME = "nxl_xray_cache";
export const XRAY_CACHE_DB_VERSION = 1;
export const XRAY_CACHE_STORE = "frames";
export const XRAY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const XRAY_DEBOUNCE_MS = 500;
export const REKOGNITION_REGION = "us-east-1";
export const REKOGNITION_MAX_FACES = 20;
export const CAPTURE_MAX_WIDTH = 1280;
export const CAPTURE_MAX_HEIGHT = 720;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
