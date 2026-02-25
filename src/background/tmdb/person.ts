import { log } from "../../shared/logger";
import { getTmdbApiKey } from "./index";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w200";
const RATE_LIMIT_MS = 300;
let lastRequestAt = 0;
const queue: Array<() => void> = [];

const rateLimitedFetch = async (url: string): Promise<Response> => {
  const now = Date.now();
  const wait = Math.max(0, lastRequestAt + RATE_LIMIT_MS - now);
  if (wait > 0) {
    await new Promise<void>((resolve) => {
      queue.push(resolve);
      setTimeout(() => {
        const i = queue.indexOf(resolve);
        if (i !== -1) queue.splice(i, 1);
        resolve();
      }, wait);
    });
  }
  lastRequestAt = Date.now();
  return fetch(url);
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await rateLimitedFetch(url);
  if (!response.ok) throw new Error(`TMDB request failed: ${response.status}`);
  return response.json();
};

export type TmdbPersonResult = {
  personId: number;
  name: string;
  profilePath?: string | null;
  character?: string | null;
};

/**
 * Search TMDB for a person by name; then find their character in the given title (movie or TV).
 */
export const searchPersonAndCharacter = async (
  personName: string,
  tmdbTitleId: number,
  mediaType: "movie" | "tv"
): Promise<TmdbPersonResult | null> => {
  const apiKey = await getTmdbApiKey();
  if (!apiKey?.trim()) return null;

  const searchParams = new URLSearchParams({
    api_key: apiKey,
    query: personName
  });
  const searchUrl = `${TMDB_BASE_URL}/search/person?${searchParams.toString()}`;
  let searchData: { results?: Array<{ id: number; name?: string; profile_path?: string | null }> };
  try {
    searchData = await fetchJson(searchUrl);
  } catch (e) {
    log("TMDB person search failed", { personName, error: e });
    return null;
  }

  const results = searchData?.results ?? [];
  if (!results.length) return null;

  const best = results[0];
  const personId = best.id;
  const name = best.name ?? personName;
  const profilePath = best.profile_path ?? null;

  const creditsUrl = `${TMDB_BASE_URL}/person/${personId}/combined_credits?api_key=${apiKey}`;
  let credits: {
    cast?: Array<{
      id: number;
      character?: string | null;
      title?: string;
      name?: string;
    }>;
  };
  try {
    credits = await fetchJson(creditsUrl);
  } catch (e) {
    log("TMDB combined_credits failed", { personId, error: e });
    return { personId, name, profilePath, character: null };
  }

  const cast = credits?.cast ?? [];
  const entry = cast.find(
    (c) => c.id === tmdbTitleId
  );
  const character = entry?.character ?? null;

  return {
    personId,
    name,
    profilePath,
    character
  };
};

export const getProfileImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}${path}`;
};
