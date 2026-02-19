import { log } from "../shared/logger";
import { OverlayController } from "./OverlayController";

const controller = new OverlayController();

const init = async () => {
  controller.init();
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
