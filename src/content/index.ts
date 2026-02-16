import { log } from "../shared/logger";
import { initNetflixObserver } from "./netflix/observer";

const init = async () => {
  await initNetflixObserver();
};

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      init().catch((err) => log("Init failed", err));
    },
    { once: true }
  );
} else {
  init().catch((err) => log("Init failed", err));
}
