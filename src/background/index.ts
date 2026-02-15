import { log } from "../shared/log";

chrome.runtime.onInstalled.addListener((details) => {
  log("Extension installed", details);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log("Background received message", { message, sender });
  sendResponse({ ok: true });
  return true;
});
