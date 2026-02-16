import { log } from "../../shared/logger";
import { STORAGE_KEYS } from "../../shared/constants";
import { buildTmdbCacheKey, normalizeTitle } from "../../shared/normalize";
import type { ResolveTitleMessage, TitleResolvedMessage } from "../../shared/types";

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

const pickBestMatch = (
  results: TmdbSearchResult[],
  titleText?: string,
  year?: number
) => {
  if (!results.length) return null;
  const normalized = normalizeTitle(titleText);

  const exactTitleAndYear = results.find((item) => {
    const resultTitle = normalizeTitle(item.title ?? item.name);
    const releaseDate = item.release_date ?? item.first_air_date;
    const releaseYear = releaseDate ? Number(releaseDate.slice(0, 4)) : undefined;
    return resultTitle === normalized && year && releaseYear === year;
  });
  if (exactTitleAndYear) return exactTitleAndYear;

  const exactTitle = results.find((item) => normalizeTitle(item.title ?? item.name) === normalized);
  if (exactTitle) return exactTitle;

  return results[0];
};

const fetchJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDb request failed: ${response.status}`);
  }
  return response.json();
};

type ResolvedTitle = TitleResolvedMessage["payload"] & { tmdbGenres?: string[] };

export const resolveTitleWithTmdb = async (
  payload: ResolveTitleMessage["payload"]
): Promise<ResolvedTitle> => {
  const apiKey = await getTmdbApiKey();
  if (!apiKey || !payload.titleText) {
    log("TMDb resolve skipped (missing api key or title)", { hasKey: !!apiKey, payload });
    return { title: payload.titleText ?? "Unknown title" };
  }

  const cacheKey = buildTmdbCacheKey(payload.titleText, payload.year);
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

  const params = new URLSearchParams({
    api_key: apiKey,
    query: payload.titleText
  });

  const searchUrl = `${TMDB_BASE_URL}/search/multi?${params.toString()}`;
  log("TMDb search", { searchUrl });
  const searchData = await fetchJson(searchUrl);
  const filtered = (searchData?.results ?? []).filter(
    (item: TmdbSearchResult) => item.media_type === "movie" || item.media_type === "tv"
  );
  const match = pickBestMatch(filtered, payload.titleText, payload.year);

  if (!match?.id) {
    log("TMDb no match", { titleText: payload.titleText });
    return { title: payload.titleText };
  }

  const mediaType: "movie" | "tv" = match.media_type === "tv" ? "tv" : "movie";
  const detailsUrl = `${TMDB_BASE_URL}/${mediaType}/${match.id}?api_key=${apiKey}`;
  log("TMDb details", { detailsUrl, mediaType });
  const details = await fetchJson(detailsUrl);

  const releaseDate =
    mediaType === "tv"
      ? details.first_air_date ?? match.first_air_date
      : details.release_date ?? match.release_date;
  const releaseYear = releaseDate ? Number(releaseDate.slice(0, 4)) : undefined;

  const resolved: ResolvedTitle = {
    title: (details.title ?? details.name) ?? payload.titleText ?? "Unknown title",
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
  const match = pickBestMatch(searchData?.results ?? [], titleText, year);
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
