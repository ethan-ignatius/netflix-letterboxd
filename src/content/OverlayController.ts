import { log, DEBUG } from "../shared/logger";
import { STORAGE_KEYS } from "../shared/constants";
import { getStorage } from "../shared/storage";
import type {
  LetterboxdIndexUpdatedAckMessage,
  LetterboxdIndexUpdatedMessage,
  OverlayData,
  OverlayDataResolvedMessage,
  ResolveOverlayDataMessage
} from "../shared/types";
import {
  detectActiveTitleContext,
  extractDisplayTitle,
  findExpandedRoot,
  findPreviewElement,
  findControlsRow,
  hasMetadataSection,
  normalizeNetflixTitle,
  EXPANDED_CONTAINER_SELECTOR
} from "./netflix/selectors";
import { createOverlayManager } from "./ui/overlay";
import { setBadgeVisible } from "./ui/badge";

export type ExtractedTitleInfo = {
  titleText: string;
  netflixTitleId?: string;
  year?: number;
  href?: string;
};

export type Settings = {
  overlayEnabled: boolean;
};

type JawboneDetection = {
  cardEl: HTMLElement;
  extracted: ExtractedTitleInfo;
  strategy: string;
};

const OBSERVER_DEBOUNCE_MS = 200;
const WATCHDOG_INTERVAL_MS = 2000;
const HERO_WIDTH_THRESHOLD = 0.85;
const HERO_HEIGHT_THRESHOLD = 0.6;

type NxlWindow = Window & {
  __nxlBooted?: boolean;
  __nxlDebug?: {
    getLbIndex: () => Promise<Record<string, unknown>>;
    lastOverlayData: () => OverlayData | null;
    forceResolve: () => void;
  };
};

const getNxlWindow = () => window as NxlWindow;

export class OverlayController {
  private overlayManager = createOverlayManager();
  private currentCard: HTMLElement | null = null;
  private currentExtracted: ExtractedTitleInfo | null = null;
  private currentRequestId = "";
  private overlayEnabled = true;
  private playbackActive = false;
  private debounceTimer?: number;
  private watchdogTimer?: number;
  private lastData: OverlayData | null = null;
  private observer?: MutationObserver;

  init(): void {
    const win = getNxlWindow();
    if (win.__nxlBooted) return;
    win.__nxlBooted = true;

    void this.loadSettings();
    this.bindRuntimeMessages();
    this.bindStorageListener();
    this.bindPlaybackListeners();
    this.bindPointerFallback();
    this.startObserver();
    this.startWatchdog();
    this.setDebugHook();
  }

  onActiveCardChange(cardEl: HTMLElement, extracted: ExtractedTitleInfo): void {
    const prev = this.currentExtracted;
    if (
      this.currentCard === cardEl &&
      prev &&
      prev.titleText === extracted.titleText &&
      prev.netflixTitleId === extracted.netflixTitleId
    ) {
      return;
    }

    if (prev) {
      log("ACTIVE_CARD_CHANGED", {
        from: { title: prev.titleText, id: prev.netflixTitleId },
        to: { title: extracted.titleText, id: extracted.netflixTitleId }
      });
    }

    this.currentCard = cardEl;
    this.currentExtracted = extracted;

    this.overlayManager.mount(cardEl);
    this.overlayManager.update(this.buildBlankOverlayData(extracted));
    this.sendOverlayRequest(extracted);
  }

  onSettingsChange(settings: Settings): void {
    this.overlayEnabled = settings.overlayEnabled;
    if (!this.overlayEnabled) {
      this.overlayManager.unmount();
      setBadgeVisible(false);
      return;
    }

    this.updatePlaybackState();
    if (!this.playbackActive) {
      setBadgeVisible(true);
      log("BADGE_SHOWN");
      log("BROWSE_MODE_DETECTED");
      if (this.currentExtracted && this.currentCard) {
        this.overlayManager.mount(this.currentCard);
        this.sendOverlayRequest(this.currentExtracted);
      }
    }
  }

  onDataResolved(data: OverlayData): void {
    this.lastData = data;
    this.overlayManager.update(data);
  }

  forceRefresh(): void {
    if (!this.currentExtracted || !this.currentCard) return;
    this.sendOverlayRequest(this.currentExtracted);
  }

  private async loadSettings(): Promise<void> {
    const state = await getStorage();
    const enabled = state[STORAGE_KEYS.OVERLAY_ENABLED] ?? true;
    this.onSettingsChange({ overlayEnabled: enabled });
  }

  private sendOverlayRequest(extracted: ExtractedTitleInfo): void {
    if (!this.overlayEnabled) return;
    this.updatePlaybackState();
    if (this.playbackActive) return;

    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.currentRequestId = requestId;

    const message: ResolveOverlayDataMessage = {
      type: "RESOLVE_OVERLAY_DATA",
      requestId,
      extracted
    };

    log("OVERLAY_REQUEST_SENT", { titleText: extracted.titleText, id: extracted.netflixTitleId });

    chrome.runtime
      .sendMessage(message)
      .then((response: OverlayDataResolvedMessage) => {
        if (!response || response.type !== "OVERLAY_DATA_RESOLVED") return;
        if (response.requestId !== this.currentRequestId) {
          log("OVERLAY_RESPONSE_IGNORED_STALE", { requestId: response.requestId });
          return;
        }
        log("OVERLAY_RESPONSE_RECEIVED", {
          tmdb: response.payload.tmdb,
          letterboxd: response.payload.letterboxd
        });
        this.onDataResolved(response.payload);

        if (response.error === "TMDB_KEY_MISSING") {
          log("TMDB_KEY_MISSING");
        }
      })
      .catch((err) => {
        log("Overlay resolve failed", { err });
      });
  }

  private buildBlankOverlayData(extracted: ExtractedTitleInfo): OverlayData {
    return {
      title: extracted.titleText,
      year: extracted.year ?? null,
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
    };
  }

  private startObserver(): void {
    if (this.observer) this.observer.disconnect();

    this.observer = new MutationObserver(() => {
      this.debounceDetect("mutation");
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "aria-expanded", "aria-hidden"]
    });

    this.debounceDetect("init");
  }

  private debounceDetect(reason: string): void {
    if (this.debounceTimer) window.clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => {
      this.detectActiveCard(reason);
    }, OBSERVER_DEBOUNCE_MS);
  }

  private detectActiveCard(reason: string): void {
    if (!this.overlayEnabled) return;
    this.updatePlaybackState();
    if (this.playbackActive) return;

    if (DEBUG) log("OVERLAY_MOUNT_ATTEMPT", { reason });
    const detection = this.findActiveJawbone();
    if (!detection) return;

    if (DEBUG) {
      log("ACTIVE_CARD_DETECTED", {
        title: detection.extracted.titleText,
        id: detection.extracted.netflixTitleId,
        strategy: detection.strategy
      });
    }

    this.onActiveCardChange(detection.cardEl, detection.extracted);
  }

  private startWatchdog(): void {
    if (this.watchdogTimer) window.clearInterval(this.watchdogTimer);
    this.watchdogTimer = window.setInterval(() => {
      if (!this.overlayEnabled) return;
      this.updatePlaybackState();
      if (this.playbackActive) return;
      if (!this.overlayManager.isMounted()) {
        this.detectActiveCard("watchdog");
      }
    }, WATCHDOG_INTERVAL_MS);
  }

  private bindPointerFallback(): void {
    document.addEventListener(
      "pointerover",
      () => {
        this.debounceDetect("pointer");
      },
      true
    );
    document.addEventListener(
      "focusin",
      () => {
        this.debounceDetect("focus");
      },
      true
    );
  }

  private bindRuntimeMessages(): void {
    chrome.runtime.onMessage.addListener(
      (message: LetterboxdIndexUpdatedAckMessage | LetterboxdIndexUpdatedMessage) => {
        if (message?.type === "LB_INDEX_UPDATED") {
          log("LB_INDEX_UPDATED");
          this.forceRefresh();
          return;
        }
        if (message?.type === "LB_INDEX_UPDATED_ACK") {
          log("LB_INDEX_UPDATED_ACK", message.payload);
          this.forceRefresh();
        }
      }
    );
  }

  private bindStorageListener(): void {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[STORAGE_KEYS.OVERLAY_ENABLED]) {
        const next = changes[STORAGE_KEYS.OVERLAY_ENABLED].newValue;
        this.onSettingsChange({ overlayEnabled: next ?? true });
      }
    });
  }

  private bindPlaybackListeners(): void {
    window.addEventListener("visibilitychange", () => this.updatePlaybackState());
    window.addEventListener("popstate", () => this.updatePlaybackState());
    window.addEventListener("hashchange", () => this.updatePlaybackState());
  }

  private updatePlaybackState(): void {
    const next = this.detectPlaybackActive();
    if (next === this.playbackActive) return;
    this.playbackActive = next;

    if (this.playbackActive) {
      setBadgeVisible(false);
      log("BADGE_HIDDEN_PLAYBACK");
      this.overlayManager.unmount();
    } else if (this.overlayEnabled) {
      setBadgeVisible(true);
      log("BADGE_SHOWN");
      log("BROWSE_MODE_DETECTED");
    }
  }

  private detectPlaybackActive(): boolean {
    if (window.location.pathname.includes("/watch/")) return true;

    const videos = Array.from(document.querySelectorAll("video"));
    const playing = videos.some((video) => {
      if (video.paused || video.ended) return false;
      const rect = video.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const widthRatio = rect.width / window.innerWidth;
      const heightRatio = rect.height / window.innerHeight;
      return widthRatio > 0.85 || heightRatio > 0.6;
    });
    if (playing) return true;

    const playerContainer = document.querySelector(
      "[data-uia*='video-player'], [class*='VideoPlayer'], [class*='watch-video'], [data-uia*='player']"
    );
    return Boolean(playerContainer && videos.length > 0);
  }

  private findActiveJawbone(): JawboneDetection | null {
    const candidates: Array<{ root: HTMLElement; strategy: string }> = [];

    const expanded = findExpandedRoot();
    if (expanded) candidates.push({ root: expanded, strategy: "expanded-root" });

    const detected = detectActiveTitleContext();
    if (detected.container instanceof HTMLElement) {
      candidates.push({ root: detected.container, strategy: "detect-active" });
    }

    const hovered = this.findHoveredJawbone();
    if (hovered) candidates.push({ root: hovered, strategy: "hovered" });

    for (const candidate of candidates) {
      if (!this.isJawbone(candidate.root)) continue;
      const extracted = this.extractTitleInfo(candidate.root, detected.candidate ?? null);
      if (!extracted) continue;
      return { cardEl: candidate.root, extracted, strategy: candidate.strategy };
    }

    return null;
  }

  private extractTitleInfo(
    root: HTMLElement,
    fallback: ReturnType<typeof detectActiveTitleContext>["candidate"] | null
  ): ExtractedTitleInfo | null {
    const display = extractDisplayTitle(root);
    const titleText = display.title ?? fallback?.titleText;
    if (!titleText) return null;

    const anchor = root.querySelector("a[href^='/title/']") as HTMLAnchorElement | null;
    const href = anchor?.getAttribute("href") ?? fallback?.href;
    const match = href?.match(/\/title\/(\d+)/);
    const netflixTitleId = match?.[1] ?? fallback?.netflixTitleId;
    const normalized = normalizeNetflixTitle(titleText) ?? titleText;
    const year = this.parseYearFromText(normalized) ?? fallback?.year;

    return {
      titleText: normalized,
      netflixTitleId,
      year,
      href
    };
  }

  private parseYearFromText(text?: string) {
    if (!text) return undefined;
    const match = text.match(/(19\d{2}|20\d{2})/);
    if (!match) return undefined;
    const year = Number(match[1]);
    return Number.isNaN(year) ? undefined : year;
  }

  private isJawbone(root: HTMLElement): boolean {
    if (this.isHeroSized(root)) return false;
    const preview = findPreviewElement(root);
    if (!preview) return false;
    const controls = findControlsRow(root);
    if (!controls) return false;
    if (!hasMetadataSection(root)) return false;
    return true;
  }

  private isHeroSized(el: Element): boolean {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    return (
      rect.width > window.innerWidth * HERO_WIDTH_THRESHOLD ||
      rect.height > window.innerHeight * HERO_HEIGHT_THRESHOLD
    );
  }

  private findHoveredJawbone(): HTMLElement | null {
    const hovered = Array.from(document.querySelectorAll(":hover"));
    if (!hovered.length) return null;
    const candidates = hovered
      .map((el) => (el as Element).closest(EXPANDED_CONTAINER_SELECTOR) ?? (el as Element))
      .filter(Boolean) as Element[];
    let best: HTMLElement | null = null;
    let bestArea = 0;
    candidates.forEach((candidate) => {
      const rect = candidate.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const area = rect.width * rect.height;
      if (area > bestArea) {
        bestArea = area;
        best = candidate as HTMLElement;
      }
    });
    return best;
  }

  private setDebugHook(): void {
    const win = getNxlWindow();
    win.__nxlDebug = {
      getLbIndex: async () => chrome.storage.local.get("lb_index_v1"),
      lastOverlayData: () => this.lastData,
      forceResolve: () => this.forceRefresh()
    };
  }
}
