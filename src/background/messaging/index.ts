import { log } from "../../shared/logger";
import type { ExtensionMessage, ResolveTitleMessage, TitleResolvedMessage } from "../../shared/types";
import { resolveTitleWithTmdb } from "../tmdb";
import { buildMatchProfile, computeMatchScore, resolveLetterboxdEntry } from "../letterboxd";

export const registerMessageHandlers = () => {
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
