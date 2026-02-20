import { log } from "../../shared/logger";
import { STORAGE_KEYS } from "../../shared/constants";
import { buildTmdbCacheKey, normalizeTitle } from "../../shared/normalize";
import type { ExtractedTitleInfo, ResolveTitleMessage, TitleResolvedMessage } from "../../shared/types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TMDB_FEATURE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type TmdbFeature = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title?: string;
  releaseYear?: number;
  genres: string[];
};

type TmdbCacheEntry = {
  storedAt: number;
  data: TitleResolvedMessage["payload"];
};

type TmdbCacheState = Record<string, TmdbCacheEntry>;

type TmdbFeatureCacheEntry = {
  storedAt: number;
  data: TmdbFeature;
};

type TmdbFeatureCacheState = Record<string, TmdbFeatureCacheEntry>;

const getTmdbCache = async (): Promise<TmdbCacheState> => {
  const data = await chrome.storage.local.get([STORAGE_KEYS.TMDB_CACHE]);
  return (data[STORAGE_KEYS.TMDB_CACHE] as TmdbCacheState | undefined) ?? {};
};

const setTmdbCache = async (cache: TmdbCacheState) => {
  await chrome.storage.local.set({ [STORAGE_KEYS.TMDB_CACHE]: cache });
};

const getFeatureCache = async (): Promise<TmdbFeatureCacheState> => {
  const data = await chrome.storage.local.get([STORAGE_KEYS.TMDB_FEATURE_CACHE]);
  return (data[STORAGE_KEYS.TMDB_FEATURE_CACHE] as TmdbFeatureCacheState | undefined) ?? {};
};

const setFeatureCache = async (cache: TmdbFeatureCacheState) => {
  await chrome.storage.local.set({ [STORAGE_KEYS.TMDB_FEATURE_CACHE]: cache });
};

export const getTmdbApiKey = async (): Promise<string | null> => {
  const data = await chrome.storage.local.get([STORAGE_KEYS.TMDB_API_KEY]);
  const key = data[STORAGE_KEYS.TMDB_API_KEY] as string | undefined;
  return key?.trim() ? key.trim() : null;
};

type TmdbSearchResult = {
  id?: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
};

const getTitleSimilarity = (a: string, b: string) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.8;
  const aTokens = new Set(a.split(" ").filter(Boolean));
  const bTokens = new Set(b.split(" ").filter(Boolean));
  if (!aTokens.size || !bTokens.size) return 0;
  let overlap = 0;
  aTokens.forEach((token) => {
    if (bTokens.has(token)) overlap += 1;
  });
  const union = new Set([...aTokens, ...bTokens]).size;
  return union ? overlap / union : 0;
};

const scoreCandidate = (
  info: ExtractedTitleInfo,
  candidate: TmdbSearchResult,
  mediaType: "movie" | "tv"
) => {
  const candidateTitle = candidate.title ?? candidate.name ?? "";
  const normalizedCandidate = normalizeTitle(candidateTitle);
  const normalizedQuery = info.normalizedTitle || normalizeTitle(info.rawTitle);
  const similarity = getTitleSimilarity(normalizedQuery, normalizedCandidate);
  let score = similarity * 100;

  const releaseDate = candidate.release_date ?? candidate.first_air_date;
  const candidateYear = releaseDate ? Number(releaseDate.slice(0, 4)) : undefined;
  if (info.year && candidateYear) {
    const diff = Math.abs(info.year - candidateYear);
    if (diff === 0) score += 20;
    else if (diff === 1) score += 8;
    else score -= Math.min(20, diff * 4);
  }

  if (info.isSeries === true) score += mediaType === "tv" ? 10 : -10;
  if (info.isSeries === false) score += mediaType === "movie" ? 10 : -10;

  return { score, candidateTitle, candidateYear };
};

const pickBestMatch = (
  info: ExtractedTitleInfo,
  results: TmdbSearchResult[],
  mediaType: "movie" | "tv"
) => {
  if (!results.length) return null;
  let best: { result: TmdbSearchResult; score: number } | null = null;
  results.forEach((result) => {
    if (!result.id) return;
    const { score } = scoreCandidate(info, result, mediaType);
    if (!best || score > best.score) {
      best = { result, score };
    }
  });
  if (!best || best.score < 50) return null;
  return best.result;
};

const fetchJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDb request failed: ${response.status}`);
  }
  return response.json();
};

type ResolvedTitle = TitleResolvedMessage["payload"] & { tmdbGenres?: string[] };

type TmdbResolveInput = ExtractedTitleInfo | ResolveTitleMessage["payload"];

const coerceExtractedInfo = (payload: TmdbResolveInput): ExtractedTitleInfo => {
  if ("rawTitle" in payload) return payload;
  const rawTitle = payload.titleText ?? "Unknown title";
  return {
    rawTitle,
    normalizedTitle: normalizeTitle(rawTitle),
    year: payload.year ?? null,
    isSeries: undefined,
    netflixId: payload.netflixTitleId ?? null,
    href: payload.href ?? null
  };
};

const pickBestFromMulti = (info: ExtractedTitleInfo, results: TmdbSearchResult[]) => {
  let best: { result: TmdbSearchResult; mediaType: "movie" | "tv"; score: number } | null = null;
  results.forEach((result) => {
    const mediaType = result.media_type === "tv" ? "tv" : result.media_type === "movie" ? "movie" : null;
    if (!mediaType || !result.id) return;
    const { score } = scoreCandidate(info, result, mediaType);
    if (!best || score > best.score) best = { result, mediaType, score };
  });
  if (!best || best.score < 50) return null;
  return best;
};

export const resolveTitleWithTmdb = async (
  payload: TmdbResolveInput
): Promise<ResolvedTitle> => {
  const apiKey = await getTmdbApiKey();
  const info = coerceExtractedInfo(payload);
  if (!apiKey || !info.rawTitle) {
    log("TMDb resolve skipped (missing api key or title)", { hasKey: !!apiKey, info });
    return { title: info.rawTitle ?? "Unknown title" };
  }

  const cacheKey = buildTmdbCacheKey(info.rawTitle, info.year ?? undefined);
  const cache = await getTmdbCache();
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.storedAt < TMDB_CACHE_TTL_MS) {
    log("TMDb cache hit", { cacheKey });
    const mediaType = cached.data.tmdbMediaType ?? "movie";
    if (cached.data.tmdbId) {
      const features = await getTmdbFeatures(apiKey, cached.data.tmdbId, mediaType);
      return {
        ...cached.data,
        tmdbGenres: features?.genres ?? []
      };
    }
    return cached.data;
  }

  const query = info.rawTitle;
  const year = info.year ?? undefined;
  const mediaGuess = info.isSeries === true ? "tv" : info.isSeries === false ? "movie" : "multi";
  log("TMDB_SEARCH_REQUEST", { query, year, mediaType: mediaGuess });

  let match: TmdbSearchResult | null = null;
  let mediaType: "movie" | "tv" | null = null;

  if (mediaGuess === "tv") {
    const params = new URLSearchParams({
      api_key: apiKey,
      query,
      ...(year ? { first_air_date_year: String(year) } : {})
    });
    const searchUrl = `${TMDB_BASE_URL}/search/tv?${params.toString()}`;
    const searchData = await fetchJson(searchUrl);
    match = pickBestMatch(info, searchData?.results ?? [], "tv");
    mediaType = match ? "tv" : null;
  } else if (mediaGuess === "movie") {
    const params = new URLSearchParams({
      api_key: apiKey,
      query,
      ...(year ? { year: String(year) } : {})
    });
    const searchUrl = `${TMDB_BASE_URL}/search/movie?${params.toString()}`;
    const searchData = await fetchJson(searchUrl);
    match = pickBestMatch(info, searchData?.results ?? [], "movie");
    mediaType = match ? "movie" : null;
  }

  if (!match) {
    const params = new URLSearchParams({
      api_key: apiKey,
      query
    });
    const searchUrl = `${TMDB_BASE_URL}/search/multi?${params.toString()}`;
    const searchData = await fetchJson(searchUrl);
    const filtered = (searchData?.results ?? []).filter(
      (item: TmdbSearchResult) => item.media_type === "movie" || item.media_type === "tv"
    );
    const best = pickBestFromMulti(info, filtered);
    if (best) {
      match = best.result;
      mediaType = best.mediaType;
    }
  }

  if (!match?.id || !mediaType) {
    log("TMDB_NO_MATCH", { titleText: info.rawTitle, year, mediaType: mediaGuess });
    return { title: info.rawTitle };
  }

  const detailsUrl = `${TMDB_BASE_URL}/${mediaType}/${match.id}?api_key=${apiKey}`;
  log("TMDB_SEARCH_CHOSEN", {
    title: match.title ?? match.name,
    year: match.release_date ?? match.first_air_date,
    mediaType
  });
  const details = await fetchJson(detailsUrl);

  const releaseDate =
    mediaType === "tv"
      ? details.first_air_date ?? match.first_air_date
      : details.release_date ?? match.release_date;
  const releaseYear = releaseDate ? Number(releaseDate.slice(0, 4)) : undefined;

  const resolved: ResolvedTitle = {
    title: (details.title ?? details.name) ?? info.rawTitle ?? "Unknown title",
    tmdbId: details.id,
    tmdbVoteAverage: details.vote_average,
    tmdbVoteCount: details.vote_count,
    posterPath: details.poster_path ?? undefined,
    releaseYear: Number.isNaN(releaseYear) ? undefined : releaseYear,
    tmdbMediaType: mediaType,
    tmdbGenres: Array.isArray(details.genres)
      ? details.genres.map((genre: { name: string }) => genre.name.toLowerCase())
      : []
  };

  const { tmdbGenres, ...cachePayload } = resolved;
  void tmdbGenres;
  cache[cacheKey] = { storedAt: Date.now(), data: cachePayload };
  await setTmdbCache(cache);
  log("TMDb cached result", { cacheKey, tmdbId: resolved.tmdbId });

  return resolved;
};

export const getTmdbFeatures = async (
  apiKey: string,
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<TmdbFeature | null> => {
  const cache = await getFeatureCache();
  const cacheKey = `${mediaType}:${tmdbId}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.storedAt < TMDB_FEATURE_TTL_MS) {
    return cached.data;
  }

  const detailsUrl = `${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${apiKey}`;
  const details = await fetchJson(detailsUrl);
  const releaseDate = mediaType === "tv" ? details.first_air_date : details.release_date;
  const releaseYear = releaseDate ? Number(releaseDate.slice(0, 4)) : undefined;
  const features: TmdbFeature = {
    tmdbId,
    mediaType,
    title: details.title ?? details.name,
    releaseYear: Number.isNaN(releaseYear) ? undefined : releaseYear,
    genres: Array.isArray(details.genres)
      ? details.genres.map((genre: { name: string }) => genre.name.toLowerCase())
      : []
  };

  cache[cacheKey] = { storedAt: Date.now(), data: features };
  await setFeatureCache(cache);
  return features;
};

export const searchTmdbId = async (
  apiKey: string,
  titleText: string,
  year?: number,
  cache?: TmdbCacheState
): Promise<{ tmdbId: number; title?: string; releaseYear?: number; mediaType: "movie" } | null> => {
  if (cache) {
    const key = buildTmdbCacheKey(titleText, year);
    const cached = cache[key];
    if (cached?.data?.tmdbId) {
      return {
        tmdbId: cached.data.tmdbId,
        title: cached.data.title,
        releaseYear: cached.data.releaseYear,
        mediaType: "movie"
      };
    }
  }
  const params = new URLSearchParams({
    api_key: apiKey,
    query: titleText
  });
  if (year) params.set("year", String(year));
  const searchUrl = `${TMDB_BASE_URL}/search/movie?${params.toString()}`;
  const searchData = await fetchJson(searchUrl);
  const info: ExtractedTitleInfo = {
    rawTitle: titleText,
    normalizedTitle: normalizeTitle(titleText),
    year: year ?? null,
    isSeries: false,
    netflixId: null,
    href: null
  };
  const match = pickBestMatch(info, searchData?.results ?? [], "movie");
  if (!match?.id) return null;
  const releaseYear = match.release_date ? Number(match.release_date.slice(0, 4)) : undefined;
  return {
    tmdbId: match.id,
    title: match.title,
    releaseYear: Number.isNaN(releaseYear) ? undefined : releaseYear,
    mediaType: "movie"
  };
};

export const getTmdbCacheSnapshot = async (): Promise<TmdbCacheState> => getTmdbCache();
