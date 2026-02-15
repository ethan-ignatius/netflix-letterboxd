import { log } from "../shared/log";
import type { ExtensionMessage, ResolveTitleMessage, TitleResolvedMessage } from "../shared/types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TMDB_KEY_STORAGE = "tmdbApiKey";
const TMDB_CACHE_STORAGE = "tmdbCache";

type TmdbCacheEntry = {
  storedAt: number;
  data: TitleResolvedMessage["payload"];
};

type TmdbCacheState = Record<string, TmdbCacheEntry>;

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

const getTmdbCache = async (): Promise<TmdbCacheState> => {
  const data = await chrome.storage.local.get([TMDB_CACHE_STORAGE]);
  return (data[TMDB_CACHE_STORAGE] as TmdbCacheState | undefined) ?? {};
};

const setTmdbCache = async (cache: TmdbCacheState) => {
  await chrome.storage.local.set({ [TMDB_CACHE_STORAGE]: cache });
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
    const resultTitle = normalizeTitle(item.title);
    const releaseYear = item.release_date ? Number(item.release_date.slice(0, 4)) : undefined;
    return resultTitle === normalized && year && releaseYear === year;
  });
  if (exactTitleAndYear) return exactTitleAndYear;

  const exactTitle = results.find((item) => normalizeTitle(item.title) === normalized);
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

const resolveTitleWithTmdb = async (payload: ResolveTitleMessage["payload"]) => {
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
    return cached.data;
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    query: payload.titleText
  });
  if (payload.year) params.set("year", String(payload.year));

  const searchUrl = `${TMDB_BASE_URL}/search/movie?${params.toString()}`;
  log("TMDb search", { searchUrl });
  const searchData = await fetchJson(searchUrl);
  const match = pickBestMatch(searchData?.results ?? [], payload.titleText, payload.year);

  if (!match?.id) {
    log("TMDb no match", { titleText: payload.titleText });
    return { title: payload.titleText };
  }

  const detailsUrl = `${TMDB_BASE_URL}/movie/${match.id}?api_key=${apiKey}`;
  log("TMDb details", { detailsUrl });
  const details = await fetchJson(detailsUrl);

  const releaseYear = details.release_date ? Number(details.release_date.slice(0, 4)) : undefined;

  const resolved = {
    title: details.title ?? payload.titleText ?? "Unknown title",
    tmdbId: details.id,
    tmdbVoteAverage: details.vote_average,
    tmdbVoteCount: details.vote_count,
    posterPath: details.poster_path ?? undefined,
    releaseYear: Number.isNaN(releaseYear) ? undefined : releaseYear
  };

  cache[cacheKey] = { storedAt: Date.now(), data: resolved };
  await setTmdbCache(cache);
  log("TMDb cached result", { cacheKey, tmdbId: resolved.tmdbId });

  return resolved;
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
          const response: TitleResolvedMessage = {
            type: "TITLE_RESOLVED",
            requestId,
            payload: resolved
          };
          sendResponse(response);
        } catch (error) {
          log("TMDb resolve failed", { error });
          sendResponse({
            type: "TITLE_RESOLVED",
            requestId,
            payload: { title: payload.titleText ?? "Unknown title" }
          } satisfies TitleResolvedMessage);
        }
      })();

      return true;
    }

    return false;
  }
);
