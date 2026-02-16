import { log } from "../shared/logger";
import { registerMessageHandlers } from "./messaging";

chrome.runtime.onInstalled.addListener((details) => {
  log("Extension installed", details);
});

registerMessageHandlers();
