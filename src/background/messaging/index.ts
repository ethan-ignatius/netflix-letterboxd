import { log } from "../../shared/logger";
import { STORAGE_KEYS } from "../../shared/constants";
import type {
  ExtensionRuntimeMessage,
  LetterboxdIndexUpdatedAckMessage,
  LetterboxdIndexUpdatedMessage,
  OverlayDataResolvedMessage,
  ResolveOverlayDataMessage,
  ResolveTitleMessage,
  TitleResolvedMessage
} from "../../shared/types";
import { resolveTitleWithTmdb } from "../tmdb";
import { buildMatchProfile, computeMatchScore, resolveLetterboxdEntry } from "../letterboxd";

export const registerMessageHandlers = () => {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionRuntimeMessage, sender, sendResponse) => {
      log("Background received message", { message, sender });

      if (message.type === "LB_INDEX_UPDATED") {
        const updated = message as LetterboxdIndexUpdatedMessage;
        void updated;
        void (async () => {
          await chrome.storage.local.remove([STORAGE_KEYS.MATCH_PROFILE]);
          log("LB_INDEX_UPDATED");
          const ack: LetterboxdIndexUpdatedAckMessage = {
            type: "LB_INDEX_UPDATED_ACK",
            payload: { updatedAt: Date.now() }
          };
          try {
            chrome.runtime.sendMessage(ack).catch(() => undefined);
          } catch {
            // noop
          }
          sendResponse(ack);
        })();
        return true;
      }

      if (message.type === "RESOLVE_OVERLAY_DATA") {
        const { requestId, payload } = message as ResolveOverlayDataMessage;

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

            const response: OverlayDataResolvedMessage = {
              type: "OVERLAY_DATA_RESOLVED",
              requestId,
              payload: {
                title: resolved.title ?? payload.titleText ?? "Unknown title",
                year: resolved.releaseYear ?? payload.year ?? null,
                tmdb: {
                  id: resolved.tmdbId ?? null,
                  voteAverage: resolved.tmdbVoteAverage ?? null,
                  voteCount: resolved.tmdbVoteCount ?? null
                },
                letterboxd: {
                  inWatchlist: lbData.inWatchlist ?? false,
                  userRating: lbData.userRating ?? null,
                  matchPercent: matchData.matchPercent ?? null,
                  becauseYouLike: matchData.becauseYouLike ?? []
                }
              }
            };
            sendResponse(response);
          } catch (error) {
            log("Overlay resolve failed", { error });
            const response: OverlayDataResolvedMessage = {
              type: "OVERLAY_DATA_RESOLVED",
              requestId,
              payload: {
                title: payload.titleText ?? "Unknown title",
                year: payload.year ?? null,
                tmdb: {
                  id: null,
                  voteAverage: null,
                  voteCount: null
                },
                letterboxd: {
                  inWatchlist: false,
                  userRating: null,
                  matchPercent: null,
                  becauseYouLike: []
                }
              }
            };
            sendResponse(response);
          }
        })();

        return true;
      }

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
            void tmdbGenres;
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
};
