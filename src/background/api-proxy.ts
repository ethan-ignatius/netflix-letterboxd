/**
 * When PROXY_BASE_URL is set, the extension uses this backend so users don't need TMDb or AWS keys.
 */
import { log } from "../shared/logger";
import { PROXY_BASE_URL } from "../shared/constants";
import type { ExtractedTitleInfo, ResolveTitleMessage } from "../shared/types";
import { resolveTitleWithTmdb } from "./tmdb";
import { searchPersonAndCharacter, getProfileImageUrl } from "./tmdb/person";
import { getAwsCredentials, recognizeCelebrities as rekognitionRecognize } from "./rekognition";

type ResolvedTitle = Awaited<ReturnType<typeof resolveTitleWithTmdb>>;
type PersonResult = Awaited<ReturnType<typeof searchPersonAndCharacter>>;
type RekognitionCeleb = { name: string; matchConfidence?: number };

type ResolveTitleInput = ExtractedTitleInfo | ResolveTitleMessage["payload"];

function toExtractedInfo(payload: ResolveTitleInput): ExtractedTitleInfo {
  if ("rawTitle" in payload) return payload;
  const rawTitle = payload.titleText ?? "Unknown title";
  return {
    rawTitle,
    normalizedTitle: rawTitle,
    year: payload.year ?? null,
    isSeries: undefined,
    netflixId: payload.netflixTitleId ?? null,
    href: payload.href ?? null
  };
}

export async function resolveTitle(payload: ResolveTitleInput): Promise<ResolvedTitle> {
  const info = toExtractedInfo(payload);
  if (PROXY_BASE_URL) {
    try {
      const res = await fetch(`${PROXY_BASE_URL}/api/resolve-title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawTitle: info.rawTitle,
          normalizedTitle: info.normalizedTitle,
          year: info.year ?? undefined,
          isSeries: info.isSeries,
          netflixId: info.netflixId ?? undefined,
          href: info.href ?? undefined
        })
      });
      if (!res.ok) throw new Error(`Proxy ${res.status}`);
      const data = await res.json();
      return {
        title: data.title ?? info.rawTitle,
        tmdbId: data.tmdbId,
        tmdbVoteAverage: data.tmdbVoteAverage,
        tmdbVoteCount: data.tmdbVoteCount,
        posterPath: data.posterPath,
        releaseYear: data.releaseYear,
        tmdbMediaType: data.tmdbMediaType ?? "movie",
        tmdbGenres: data.tmdbGenres ?? []
      };
    } catch (e) {
      log("Proxy resolve-title failed", e);
      return { title: info.rawTitle ?? "Unknown title" };
    }
  }
  return resolveTitleWithTmdb(info);
}

export async function getPersonCharacter(
  personName: string,
  tmdbTitleId: number,
  mediaType: "movie" | "tv"
): Promise<{ name: string; character?: string | null; photoUrl?: string | null } | null> {
  if (PROXY_BASE_URL) {
    try {
      const res = await fetch(`${PROXY_BASE_URL}/api/person`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personName, tmdbTitleId, mediaType })
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data) return null;
      return {
        name: data.name,
        character: data.character ?? null,
        photoUrl: data.profilePath ? `https://image.tmdb.org/t/p/w200${data.profilePath}` : null
      };
    } catch (e) {
      log("Proxy person failed", e);
      return null;
    }
  }
  const person = await searchPersonAndCharacter(personName, tmdbTitleId, mediaType);
  if (!person) return null;
  return {
    name: person.name,
    character: person.character ?? null,
    photoUrl: getProfileImageUrl(person.profilePath)
  };
}

function uint8ArrayToBase64(bytes: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(new Blob([bytes]));
  });
}

export async function recognizeCelebrities(imageBytes: Uint8Array): Promise<RekognitionCeleb[]> {
  if (PROXY_BASE_URL) {
    try {
      const base64 = await uint8ArrayToBase64(imageBytes);
      const res = await fetch(`${PROXY_BASE_URL}/api/recognize-celebrities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 })
      });
      if (!res.ok) throw new Error(`Proxy ${res.status}`);
      const data = await res.json();
      return data.celebrities ?? [];
    } catch (e) {
      log("Proxy recognize-celebrities failed", e);
      return [];
    }
  }
  const creds = await getAwsCredentials();
  if (!creds) return [];
  return rekognitionRecognize(imageBytes, creds);
}
