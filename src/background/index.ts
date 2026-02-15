import { log } from "../shared/log";
import type { ExtensionMessage, ResolveTitleMessage, TitleResolvedMessage } from "../shared/types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TMDB_FEATURE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PROFILE_TTL_MS = 24 * 60 * 60 * 1000;
const TMDB_KEY_STORAGE = "tmdbApiKey";
const TMDB_CACHE_STORAGE = "tmdbCache";
const TMDB_FEATURE_STORAGE = "tmdbFeatureCache";
const MATCH_PROFILE_STORAGE = "matchProfile";

type TmdbCacheEntry = {
  storedAt: number;
  data: TitleResolvedMessage["payload"];
};

type TmdbCacheState = Record<string, TmdbCacheEntry>;

type TmdbFeature = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title?: string;
  releaseYear?: number;
  genres: string[];
};

type TmdbFeatureCacheEntry = {
  storedAt: number;
  data: TmdbFeature;
};

type TmdbFeatureCacheState = Record<string, TmdbFeatureCacheEntry>;

type MatchProfile = {
  storedAt: number;
  lastImportAt?: string;
  meanRating: number;
  genreStats: Record<string, { avg: number; count: number; strength: number }>;
  decadeStats: Record<string, { avg: number; count: number; strength: number }>;
};

const normalizeTitle = (title?: string): string => {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

const buildCacheKey = (title?: string, year?: number): string => {
  const normalized = normalizeTitle(title);
  return year ? `${normalized} (${year})` : normalized;
};

const buildLetterboxdKey = (title?: string, year?: number): string => {
  const normalized = normalizeTitle(title);
  return year ? `${normalized}|${year}` : normalized;
};

const getLetterboxdIndex = async (): Promise<Record<string, { r?: number; w?: 1 }>> => {
  const data = await chrome.storage.local.get(["letterboxdIndex"]);
  return (data.letterboxdIndex as Record<string, { r?: number; w?: 1 }> | undefined) ?? {};
};

const getLetterboxdStats = async (): Promise<{ importedAt?: string } | null> => {
  const data = await chrome.storage.local.get(["letterboxdStats"]);
  return (data.letterboxdStats as { importedAt?: string } | undefined) ?? null;
};

const getTmdbCache = async (): Promise<TmdbCacheState> => {
  const data = await chrome.storage.local.get([TMDB_CACHE_STORAGE]);
  return (data[TMDB_CACHE_STORAGE] as TmdbCacheState | undefined) ?? {};
};

const setTmdbCache = async (cache: TmdbCacheState) => {
  await chrome.storage.local.set({ [TMDB_CACHE_STORAGE]: cache });
};

const getFeatureCache = async (): Promise<TmdbFeatureCacheState> => {
  const data = await chrome.storage.local.get([TMDB_FEATURE_STORAGE]);
  return (data[TMDB_FEATURE_STORAGE] as TmdbFeatureCacheState | undefined) ?? {};
};

const setFeatureCache = async (cache: TmdbFeatureCacheState) => {
  await chrome.storage.local.set({ [TMDB_FEATURE_STORAGE]: cache });
};

const getMatchProfileCache = async (): Promise<MatchProfile | null> => {
  const data = await chrome.storage.local.get([MATCH_PROFILE_STORAGE]);
  return (data[MATCH_PROFILE_STORAGE] as MatchProfile | undefined) ?? null;
};

const setMatchProfileCache = async (profile: MatchProfile) => {
  await chrome.storage.local.set({ [MATCH_PROFILE_STORAGE]: profile });
};

const getTmdbApiKey = async (): Promise<string | null> => {
  const data = await chrome.storage.local.get([TMDB_KEY_STORAGE]);
  const key = data[TMDB_KEY_STORAGE] as string | undefined;
  return key?.trim() ? key.trim() : null;
};

const pickBestMatch = (results: any[], titleText?: string, year?: number) => {
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

const resolveTitleWithTmdb = async (payload: ResolveTitleMessage["payload"]): Promise<ResolvedTitle> => {
  const apiKey = await getTmdbApiKey();
  if (!apiKey || !payload.titleText) {
    log("TMDb resolve skipped (missing api key or title)", { hasKey: !!apiKey, payload });
    return { title: payload.titleText ?? "Unknown title" };
  }

  const cacheKey = buildCacheKey(payload.titleText, payload.year);
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
    (item: { media_type?: string }) => item.media_type === "movie" || item.media_type === "tv"
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
    mediaType === "tv" ? details.first_air_date ?? match.first_air_date : details.release_date ?? match.release_date;
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
  cache[cacheKey] = { storedAt: Date.now(), data: cachePayload };
  await setTmdbCache(cache);
  log("TMDb cached result", { cacheKey, tmdbId: resolved.tmdbId });

  return resolved;
};

const parseIndexKey = (key: string): { title: string; year?: number } => {
  const parts = key.split("|");
  if (parts.length === 2) {
    const year = Number(parts[1]);
    return { title: parts[0], year: Number.isNaN(year) ? undefined : year };
  }
  return { title: key };
};

const getTmdbFeatures = async (
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

const searchTmdbId = async (
  apiKey: string,
  titleText: string,
  year?: number,
  cache?: TmdbCacheState
): Promise<{ tmdbId: number; title?: string; releaseYear?: number; mediaType: "movie" } | null> => {
  if (cache) {
    const key = buildCacheKey(titleText, year);
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

const buildMatchProfile = async (): Promise<MatchProfile | null> => {
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
  const tmdbCache = await getTmdbCache();
  const entries = Object.entries(index).filter(([, entry]) => entry.r !== undefined);
  if (!entries.length) return null;

  let ratingSum = 0;
  let ratingCount = 0;
  const genreTotals: Record<string, { sum: number; count: number }> = {};
  const decadeTotals: Record<string, { sum: number; count: number }> = {};

  const maxEntries = 300;
  for (const [key, entry] of entries.slice(0, maxEntries)) {
    const rating = entry.r;
    if (rating === undefined) continue;
    ratingSum += rating;
    ratingCount += 1;

    const { title, year } = parseIndexKey(key);
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

const computeMatchScore = (
  profile: MatchProfile | null,
  candidateGenres: string[]
): { matchScore?: number; matchExplanation?: string } => {
  if (!profile || !candidateGenres.length) return {};

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

  if (totalWeight === 0) return {};
  const normalized = weightedSum / totalWeight;
  const score = Math.round(Math.max(0, Math.min(100, 50 + normalized * 20)));

  const topGenres = positives
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 2)
    .map((entry) => entry.genre);
  const explanation =
    topGenres.length > 0
      ? `Because you like ${topGenres.join(", ")}`
      : undefined;

  return { matchScore: score, matchExplanation: explanation };
};

const resolveLetterboxdEntry = async (
  payload: ResolveTitleMessage["payload"],
  resolvedTitle?: string,
  resolvedYear?: number
) => {
  const index = await getLetterboxdIndex();
  const keys = [
    buildLetterboxdKey(payload.titleText, payload.year),
    buildLetterboxdKey(resolvedTitle, resolvedYear),
    buildLetterboxdKey(payload.titleText, undefined),
    buildLetterboxdKey(resolvedTitle, undefined)
  ].filter((key) => key);

  for (const key of keys) {
    const entry = index[key];
    if (entry) {
      return {
        inWatchlist: entry.w === 1,
        userRating: entry.r
      };
    }
  }

  return {};
};

chrome.runtime.onInstalled.addListener((details) => {
  log("Extension installed", details);
});

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    log("Background received message", { message, sender });

    if (message.type === "RESOLVE_TITLE") {
      const { requestId, payload } = message as ResolveTitleMessage;

      void (async () => {
        try {
          const resolved = await resolveTitleWithTmdb(payload);
          const lbData = await resolveLetterboxdEntry(
            payload,
            resolved.title,
            resolved.releaseYear ?? payload.year
          );
          const profile = await buildMatchProfile();
          const matchData = computeMatchScore(profile, resolved.tmdbGenres ?? []);
          const { tmdbGenres, ...resolvedPayload } = resolved;
          const response: TitleResolvedMessage = {
            type: "TITLE_RESOLVED",
            requestId,
            payload: {
              ...resolvedPayload,
              ...lbData,
              ...matchData
            }
          };
          sendResponse(response);
        } catch (error) {
          log("TMDb resolve failed", { error });
          const lbData = await resolveLetterboxdEntry(
            payload,
            payload.titleText ?? "Unknown title",
            payload.year
          );
          sendResponse({
            type: "TITLE_RESOLVED",
            requestId,
            payload: {
              title: payload.titleText ?? "Unknown title",
              ...lbData
            }
          } satisfies TitleResolvedMessage);
        }
      })();

      return true;
    }

    return false;
  }
);
