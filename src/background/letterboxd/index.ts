import { log } from "../../shared/logger";
import { STORAGE_KEYS } from "../../shared/constants";
import {
  buildLegacyLetterboxdKey,
  buildLetterboxdKey,
  parseLetterboxdKey
} from "../../shared/normalize";
import type { LetterboxdIndex, ResolveOverlayDataMessage, ResolveTitleMessage } from "../../shared/types";
import { getLetterboxdIndex as loadLetterboxdIndex } from "../../shared/storage";
import {
  getTmdbApiKey,
  getTmdbFeatures,
  getTmdbCacheSnapshot,
  searchTmdbId
} from "../tmdb";

const PROFILE_TTL_MS = 24 * 60 * 60 * 1000;

type MatchProfile = {
  storedAt: number;
  lastImportAt?: string;
  meanRating: number;
  genreStats: Record<string, { avg: number; count: number; strength: number }>;
  decadeStats: Record<string, { avg: number; count: number; strength: number }>;
};

const getLetterboxdIndex = async (): Promise<LetterboxdIndex | null> => {
  return loadLetterboxdIndex();
};

const getLetterboxdStats = async (): Promise<{ importedAt?: string } | null> => {
  const data = await chrome.storage.local.get([STORAGE_KEYS.LETTERBOXD_STATS]);
  return (data[STORAGE_KEYS.LETTERBOXD_STATS] as { importedAt?: string } | undefined) ?? null;
};

const getMatchProfileCache = async (): Promise<MatchProfile | null> => {
  const data = await chrome.storage.local.get([STORAGE_KEYS.MATCH_PROFILE]);
  return (data[STORAGE_KEYS.MATCH_PROFILE] as MatchProfile | undefined) ?? null;
};

const setMatchProfileCache = async (profile: MatchProfile) => {
  await chrome.storage.local.set({ [STORAGE_KEYS.MATCH_PROFILE]: profile });
};

export const resolveLetterboxdEntry = async (
  payload: ResolveTitleMessage["payload"] | ResolveOverlayDataMessage["payload"],
  resolvedTitle?: string,
  resolvedYear?: number
) => {
  const index = await getLetterboxdIndex();
  if (!index) {
    log("LB_INDEX_LOADED", { found: false });
    return {};
  }
  log("LB_INDEX_LOADED", {
    found: true,
    updatedAt: index.updatedAt,
    ratingsCount: Object.keys(index.ratingsByKey).length,
    watchlistCount: Object.keys(index.watchlistKeys).length
  });
  const keys = [
    buildLetterboxdKey(payload.titleText, payload.year),
    buildLetterboxdKey(resolvedTitle, resolvedYear),
    buildLetterboxdKey(payload.titleText, undefined),
    buildLetterboxdKey(resolvedTitle, undefined)
  ].filter((key) => key);
  const legacyKeys = [
    buildLegacyLetterboxdKey(payload.titleText, payload.year),
    buildLegacyLetterboxdKey(resolvedTitle, resolvedYear),
    buildLegacyLetterboxdKey(payload.titleText, undefined),
    buildLegacyLetterboxdKey(resolvedTitle, undefined)
  ].filter((key) => key);
  const attemptedKeys = Array.from(new Set([...keys, ...legacyKeys]));
  log("LB_MATCH_KEYS", { attemptedKeys });

  for (const key of attemptedKeys) {
    if (index.watchlistKeys[key] || index.ratingsByKey[key] !== undefined) {
      log("LB_MATCH_FOUND", { key });
      return {
        inWatchlist: index.watchlistKeys[key] === true,
        userRating: index.ratingsByKey[key]
      };
    }
  }

  log("LB_MATCH_NOT_FOUND", { attemptedKeys, title: resolvedTitle ?? payload.titleText });
  return {};
};

export const buildMatchProfile = async (): Promise<MatchProfile | null> => {
  const apiKey = await getTmdbApiKey();
  if (!apiKey) return null;

  const stats = await getLetterboxdStats();
  const cached = await getMatchProfileCache();
  if (
    cached &&
    Date.now() - cached.storedAt < PROFILE_TTL_MS &&
    cached.lastImportAt &&
    stats?.importedAt &&
    cached.lastImportAt === stats.importedAt
  ) {
    return cached;
  }

  const index = await getLetterboxdIndex();
  if (!index) return null;
  const tmdbCache = await getTmdbCacheSnapshot();
  const entries = Object.entries(index.ratingsByKey);
  if (!entries.length) return null;

  let ratingSum = 0;
  let ratingCount = 0;
  const genreTotals: Record<string, { sum: number; count: number }> = {};
  const decadeTotals: Record<string, { sum: number; count: number }> = {};

  const maxEntries = 300;
  for (const [key, rating] of entries.slice(0, maxEntries)) {
    ratingSum += rating;
    ratingCount += 1;

    const { title, year } = parseLetterboxdKey(key);
    if (!title) continue;

    const searchResult = await searchTmdbId(apiKey, title, year, tmdbCache);
    if (!searchResult) continue;

    const features = await getTmdbFeatures(apiKey, searchResult.tmdbId, searchResult.mediaType);
    if (!features) continue;

    const releaseYear = features.releaseYear ?? searchResult.releaseYear ?? year;
    const decade = releaseYear ? `${Math.floor(releaseYear / 10) * 10}s` : undefined;

    features.genres.forEach((genre) => {
      if (!genreTotals[genre]) genreTotals[genre] = { sum: 0, count: 0 };
      genreTotals[genre].sum += rating;
      genreTotals[genre].count += 1;
    });

    if (decade) {
      if (!decadeTotals[decade]) decadeTotals[decade] = { sum: 0, count: 0 };
      decadeTotals[decade].sum += rating;
      decadeTotals[decade].count += 1;
    }
  }

  const meanRating = ratingCount ? ratingSum / ratingCount : 0;
  const genreStats: MatchProfile["genreStats"] = {};
  const decadeStats: MatchProfile["decadeStats"] = {};

  Object.entries(genreTotals).forEach(([genre, { sum, count }]) => {
    const avg = sum / count;
    genreStats[genre] = {
      avg,
      count,
      strength: avg - meanRating
    };
  });

  Object.entries(decadeTotals).forEach(([decade, { sum, count }]) => {
    const avg = sum / count;
    decadeStats[decade] = {
      avg,
      count,
      strength: avg - meanRating
    };
  });

  const profile: MatchProfile = {
    storedAt: Date.now(),
    lastImportAt: stats?.importedAt,
    meanRating,
    genreStats,
    decadeStats
  };

  await setMatchProfileCache(profile);
  return profile;
};

export const computeMatchScore = (
  profile: MatchProfile | null,
  candidateGenres: string[]
): { matchPercent: number | null; becauseYouLike: string[] } => {
  if (!profile || !candidateGenres.length) return { matchPercent: null, becauseYouLike: [] };

  let weightedSum = 0;
  let totalWeight = 0;
  const positives: { genre: string; strength: number }[] = [];

  candidateGenres.forEach((genre) => {
    const normalized = genre.toLowerCase();
    const stats = profile.genreStats[normalized];
    if (!stats) return;
    const confidence = Math.min(1, stats.count / 5);
    const strength = stats.strength;
    weightedSum += strength * confidence;
    totalWeight += confidence;
    if (strength > 0) {
      positives.push({ genre: normalized, strength });
    }
  });

  if (totalWeight === 0) return { matchPercent: null, becauseYouLike: [] };
  const normalized = weightedSum / totalWeight;
  const score = Math.round(Math.max(0, Math.min(100, 50 + normalized * 20)));

  const topGenres = positives
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 2)
    .map((entry) => entry.genre.replace(/\b\w/g, (letter) => letter.toUpperCase()));

  return { matchPercent: score, becauseYouLike: topGenres };
};
