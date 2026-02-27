import { log } from "../../shared/logger";
import { STORAGE_KEYS, XRAY_DEBOUNCE_MS } from "../../shared/constants";
import type { AnalyzeFramePayload } from "../../shared/types";
// X-Ray UI temporarily disabled; keep types and wiring but no-op the panel.
import {
  showXrayPanel,
  showXrayLoading,
  showXrayError,
  hideXrayPanel
} from "../ui/xray-panel";
import { detectActiveTitleContext } from "./selectors";

const PLAYER_SELECTOR = ".watch-video--player-view, [data-uia*='video-player'], [class*='VideoPlayer']";
let debounceTimer: number | undefined;
let lastPauseAt = 0;
let xrayEnabled = true;

function getNetflixTitleIdFromPage(): string | undefined {
  const match = window.location.pathname.match(/\/watch\/(\d+)/);
  return match?.[1];
}

function getCurrentTitleFromWatchPage(): { titleText?: string; year?: number } {
  const { candidate, container } = detectActiveTitleContext();
  if (candidate?.titleText) {
    return {
      titleText: candidate.titleText,
      year: candidate.year ?? undefined
    };
  }
  const titleEl = document.querySelector(
    "[data-uia='video-title'], .title-title, [class*='title']"
  );
  const titleText = titleEl?.textContent?.trim();
  const yearEl = document.querySelector("[class*='year'], [data-uia*='year']");
  const yearMatch = yearEl?.textContent?.match(/(19\d{2}|20\d{2})/);
  return {
    titleText: titleText ?? undefined,
    year: yearMatch ? Number(yearMatch[1]) : undefined
  };
}

function requestAnalyzeFrame(): void {
  if (!xrayEnabled) return;

  const netflixTitleId = getNetflixTitleIdFromPage();
  if (!netflixTitleId) {
    log("X-Ray: no title ID on watch page");
    showXrayError("Could not detect title");
    return;
  }

  const { titleText, year } = getCurrentTitleFromWatchPage();
  const payload = {
    tabId: 0,
    netflixTitleId,
    titleText,
    year,
    timestamp: Math.floor(Date.now() / 1000)
  };

  chrome.runtime.sendMessage(
    { type: "ANALYZE_FRAME", requestId: `xray_${Date.now()}`, payload },
    (response) => {
      // For now, we silently ignore responses and avoid showing the X-Ray UI.
      void response;
    }
  );
}

function getMainVideo(): HTMLVideoElement | null {
  const videos = document.querySelectorAll<HTMLVideoElement>("video");
  for (let i = 0; i < videos.length; i += 1) {
    const v = videos[i];
    const r = v.getBoundingClientRect();
    if (r.width >= window.innerWidth * 0.5 && r.height >= window.innerHeight * 0.5) return v;
  }
  return videos[0] ?? null;
}

function onPause(): void {
  const now = Date.now();
  if (now - lastPauseAt < XRAY_DEBOUNCE_MS) return;
  lastPauseAt = now;

  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    debounceTimer = undefined;
    showXrayLoading();
    requestAnalyzeFrame();
  }, XRAY_DEBOUNCE_MS);
}

function onPlay(): void {
  if (debounceTimer) {
    window.clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  hideXrayPanel();
}

function observeVideo(video: HTMLVideoElement): void {
  video.addEventListener("pause", onPause);
  video.addEventListener("play", onPlay);
}

function isWatchPage(): boolean {
  return window.location.pathname.includes("/watch/");
}

export async function initXrayWatch(): Promise<void> {
  const state = await chrome.storage.local.get([STORAGE_KEYS.XRAY_ENABLED]);
  xrayEnabled = state[STORAGE_KEYS.XRAY_ENABLED] !== false;

  if (!isWatchPage()) return;

  const video = getMainVideo();
  if (video) {
    observeVideo(video);
    if (video.paused) onPause();
  }

  const observer = new MutationObserver(() => {
    if (!isWatchPage()) return;
    const v = getMainVideo();
    if (v && !v.dataset.nxlObserved) {
      v.dataset.nxlObserved = "1";
      observeVideo(v);
      if (v.paused) onPause();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
