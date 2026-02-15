import { log } from "../shared/log";
import type { ExtensionMessage, ResolveTitleMessage, TitleResolvedMessage } from "../shared/types";

chrome.runtime.onInstalled.addListener((details) => {
  log("Extension installed", details);
});

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    log("Background received message", { message, sender });

    if (message.type === "RESOLVE_TITLE") {
      const { requestId, payload } = message as ResolveTitleMessage;
      const title = payload.titleText ?? "Unknown title";

      const response: TitleResolvedMessage = {
        type: "TITLE_RESOLVED",
        requestId,
        payload: {
          title
        }
      };

      sendResponse(response);
      return true;
    }

    return false;
  }
);
