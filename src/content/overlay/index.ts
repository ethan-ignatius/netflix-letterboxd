export interface OverlayData {
  titleLine: string;
  metadataLine?: string;
  genresLine?: string;
  communityRating?: number;
  ratingCount?: number;
  inWatchlist?: boolean;
  userRating?: number;
  matchScore?: number;
  matchExplanation?: string;
  debug?: {
    titleText?: string;
    year?: number;
    netflixTitleId?: string;
    href?: string;
    tmdbId?: number;
    tmdbVoteAverage?: number;
    tmdbVoteCount?: number;
    inWatchlist?: boolean;
    userRating?: number;
    matchScore?: number;
    matchExplanation?: string;
  };
}

const OVERLAY_ID = "nxlb-overlay-panel";
const SAFE_OFFSET = { x: 16, y: 12 };
const positionOverrides = new WeakMap<Element, string>();

const ensureContainerPosition = (container: Element) => {
  const computed = window.getComputedStyle(container);
  if (computed.position !== "static") return;

  if (!positionOverrides.has(container)) {
    positionOverrides.set(container, container instanceof HTMLElement ? container.style.position : "");
  }

  if (container instanceof HTMLElement) {
    container.style.position = "relative";
    container.dataset.nxlbPositioned = "true";
  }
};

const restoreContainerPosition = (container: Element | null) => {
  if (!container || !(container instanceof HTMLElement)) return;
  if (!container.dataset.nxlbPositioned) return;

  const previous = positionOverrides.get(container) ?? "";
  container.style.position = previous;
  delete container.dataset.nxlbPositioned;
  positionOverrides.delete(container);
};

const buildOverlay = (data: OverlayData): HTMLDivElement => {
  const host = document.createElement("div");
  host.id = OVERLAY_ID;
  host.style.position = "absolute";
  host.style.inset = "0";
  host.style.zIndex = "2147483647";

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      pointer-events: none;
      --preview-top-px: 240px;
      --preview-bottom-px: 420px;
      --controls-height: 64px;
    }
    .nxl-card {
      position: absolute;
      inset: 0;
      color: #f5f5f5;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      animation: nxlFadeIn 150ms ease-out;
    }
    .nxl-shade {
      position: absolute;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(8px);
    }
    .nxl-shade.top {
      top: 0;
      height: var(--preview-top-px);
    }
    .nxl-shade.bottom {
      top: var(--preview-bottom-px);
      bottom: 0;
    }
    .nxl-content {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-rows: auto auto auto auto 1fr auto;
      gap: 12px;
      padding: 20px;
      height: 100%;
      box-sizing: border-box;
    }
    .nxl-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .nxl-title-section {
      flex: 1;
      min-width: 0;
      max-width: 70%;
    }
    .nxl-title {
      font-size: 30px;
      font-weight: 700;
      letter-spacing: 0.01em;
      line-height: 1.1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .nxl-meta {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.75);
      margin-top: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .nxl-genres {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .nxl-branding {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .nxl-dots {
      display: inline-flex;
      gap: 4px;
      align-items: center;
    }
    .nxl-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .nxl-dot.green { background: #00c46a; }
    .nxl-dot.orange { background: #f2b34c; }
    .nxl-dot.blue { background: #4aa8ff; }
    .nxl-divider {
      height: 1px;
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
    }
    .nxl-metadata {
      display: grid;
      gap: 8px;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
    }
    .nxl-rating {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nxl-star {
      color: #e3b341;
      font-size: 16px;
    }
    .nxl-match {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .nxl-match-value {
      color: #46d369;
      font-weight: 700;
      font-size: 20px;
      animation: nxlPop 200ms ease-out;
    }
    .nxl-because {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }
    .nxl-preview {
      min-height: 180px;
    }
    .nxl-controls {
      min-height: var(--controls-height);
    }
    .debug {
      margin-top: 4px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px;
      opacity: 0.7;
      display: none;
      white-space: pre-wrap;
    }
    .safe .nxl-shade {
      backdrop-filter: blur(4px);
    }
    @keyframes nxlFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes nxlPop {
      0% { transform: scale(0.96); }
      100% { transform: scale(1); }
    }
  `;

  const panel = document.createElement("div");
  panel.className = "nxl-card";

  const shadeTop = document.createElement("div");
  shadeTop.className = "nxl-shade top";

  const shadeBottom = document.createElement("div");
  shadeBottom.className = "nxl-shade bottom";

  const content = document.createElement("div");
  content.className = "nxl-content";

  const top = document.createElement("div");
  top.className = "nxl-top";

  const titleSection = document.createElement("div");
  titleSection.className = "nxl-title-section";

  const title = document.createElement("div");
  title.className = "nxl-title";
  title.textContent = data.titleLine;

  const metaLine = document.createElement("div");
  metaLine.className = "nxl-meta";
  metaLine.dataset.field = "metadata";
  metaLine.textContent = data.metadataLine ?? "TV-14 • 2 Seasons • HD";

  const genresLine = document.createElement("div");
  genresLine.className = "nxl-genres";
  genresLine.dataset.field = "genres";
  genresLine.textContent = data.genresLine ?? "Genres";

  titleSection.appendChild(title);
  titleSection.appendChild(metaLine);
  titleSection.appendChild(genresLine);

  const branding = document.createElement("div");
  branding.className = "nxl-branding";
  branding.innerHTML = `
    Powered by
    <span class="nxl-dots">
      <span class="nxl-dot green"></span>
      <span class="nxl-dot orange"></span>
      <span class="nxl-dot blue"></span>
    </span>
    Letterboxd
  `;

  top.appendChild(titleSection);
  top.appendChild(branding);

  const divider = document.createElement("div");
  divider.className = "nxl-divider";

  const metadata = document.createElement("div");
  metadata.className = "nxl-metadata";

  const communityRating = document.createElement("div");
  communityRating.className = "nxl-rating";
  communityRating.dataset.field = "communityRating";
  communityRating.textContent = "Community rating: —";

  const match = document.createElement("div");
  match.className = "nxl-match";
  match.dataset.field = "match";
  match.textContent = "Your match: —";

  const because = document.createElement("div");
  because.className = "nxl-because";
  because.dataset.field = "because";
  because.textContent = "Because you like —";

  metadata.appendChild(communityRating);
  metadata.appendChild(match);
  metadata.appendChild(because);

  const preview = document.createElement("div");
  preview.className = "nxl-preview";
  preview.dataset.field = "preview";

  const controls = document.createElement("div");
  controls.className = "nxl-controls";
  controls.dataset.field = "controls";

  content.appendChild(top);
  content.appendChild(divider);
  content.appendChild(metadata);
  content.appendChild(preview);
  content.appendChild(controls);

  const debug = document.createElement("div");
  debug.className = "debug";
  debug.dataset.field = "debug";
  content.appendChild(debug);

  panel.appendChild(shadeTop);
  panel.appendChild(shadeBottom);
  panel.appendChild(content);

  shadow.appendChild(style);
  shadow.appendChild(panel);

  return host;
};

let currentContainer: Element | null = null;
let currentHost: HTMLDivElement | null = null;
let currentAnchor: Element | null = null;

const applySafePosition = (host: HTMLDivElement, anchor: Element | null) => {
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  host.style.position = "fixed";
  host.style.top = `${Math.max(8, rect.top - SAFE_OFFSET.y)}px`;
  host.style.left = `${Math.max(8, rect.left)}px`;
  host.style.right = "auto";
  host.style.width = `${Math.max(280, rect.width)}px`;
  host.style.height = `${Math.max(220, rect.height)}px`;
};

const formatRatingCount = (value?: number) => {
  if (value === undefined) return "";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
};

const applyOverlayData = (data: OverlayData) => {
  const titleEl = currentHost?.shadowRoot?.querySelector(".nxl-title");
  if (titleEl) titleEl.textContent = data.titleLine;

  const communityEl = currentHost?.shadowRoot?.querySelector(
    "[data-field='communityRating']"
  ) as HTMLDivElement | null;
  if (communityEl) {
    if (data.communityRating !== undefined) {
      const count = formatRatingCount(data.ratingCount);
      communityEl.innerHTML = `
        Community rating:
        <span class="nxl-star">★</span>
        ${data.communityRating.toFixed(1)}${count ? ` <span class="nxl-meta">${count} ratings</span>` : ""}
      `;
    } else {
      communityEl.textContent = "Community rating: —";
    }
  }

  const matchEl = currentHost?.shadowRoot?.querySelector(
    "[data-field='match']"
  ) as HTMLDivElement | null;
  if (matchEl) {
    if (data.matchScore !== undefined) {
      matchEl.innerHTML = `Your match: <span class="nxl-match-value">${data.matchScore}%</span>`;
    } else {
      matchEl.textContent = "Your match: —";
    }
  }

  const becauseEl = currentHost?.shadowRoot?.querySelector(
    "[data-field='because']"
  ) as HTMLDivElement | null;
  if (becauseEl) {
    becauseEl.textContent = data.matchExplanation ?? "Because you like —";
  }

  const metaEl = currentHost?.shadowRoot?.querySelector(
    "[data-field='metadata']"
  ) as HTMLDivElement | null;
  if (metaEl) {
    if (data.metadataLine) {
      metaEl.style.display = "block";
      metaEl.textContent = data.metadataLine;
    } else {
      metaEl.style.display = "none";
      metaEl.textContent = "";
    }
  }

  const genresEl = currentHost?.shadowRoot?.querySelector(
    "[data-field='genres']"
  ) as HTMLDivElement | null;
  if (genresEl) {
    if (data.genresLine) {
      genresEl.style.display = "block";
      genresEl.textContent = data.genresLine;
    } else {
      genresEl.style.display = "none";
      genresEl.textContent = "";
    }
  }

  const debugEl = currentHost?.shadowRoot?.querySelector(
    "[data-field='debug']"
  ) as HTMLDivElement | null;
  if (debugEl) {
    if (data.debug) {
      debugEl.style.display = "block";
      debugEl.textContent = JSON.stringify(data.debug, null, 2);
    } else {
      debugEl.style.display = "none";
      debugEl.textContent = "";
    }
  }
};

export const updateOverlay = (
  container: Element | null,
  data: OverlayData | null,
  anchor: Element | null = null,
  safeMode = false,
  previewRegion?: {
    top: number;
    bottom: number;
    containerHeight: number;
    previewHeight: number;
    controlsHeight: number;
  }
) => {
  if (!data || (!container && !anchor)) {
    if (currentHost) currentHost.remove();
    restoreContainerPosition(currentContainer);
    currentContainer = null;
    currentHost = null;
    currentAnchor = null;
    return;
  }

  if (currentContainer !== container || currentAnchor !== anchor) {
    if (currentHost) currentHost.remove();
    restoreContainerPosition(currentContainer);
    currentContainer = container;
    currentAnchor = anchor;
    currentHost = buildOverlay(data);

    if (container) {
      ensureContainerPosition(container);
      container.appendChild(currentHost);
      if (previewRegion) {
        const topPx = Math.max(160, previewRegion.top - 8);
        const bottomPx = Math.max(
          topPx + Math.max(120, previewRegion.previewHeight),
          previewRegion.bottom + 8
        );
        currentHost.style.setProperty("--preview-top-px", `${topPx}px`);
        currentHost.style.setProperty("--preview-bottom-px", `${bottomPx}px`);
        currentHost.style.setProperty("--controls-height", `${previewRegion.controlsHeight}px`);
      }
      if (safeMode) applySafePosition(currentHost, anchor ?? container);
    } else if (anchor) {
      document.documentElement.appendChild(currentHost);
      applySafePosition(currentHost, anchor);
    }

    const panel = currentHost.shadowRoot?.querySelector(".nxl-card");
    if (panel) {
      panel.classList.toggle("safe", safeMode);
    }

    applyOverlayData(data);
    return;
  }

  if (previewRegion && currentHost) {
    const topPx = Math.max(160, previewRegion.top - 8);
    const bottomPx = Math.max(
      topPx + Math.max(120, previewRegion.previewHeight),
      previewRegion.bottom + 8
    );
    currentHost.style.setProperty("--preview-top-px", `${topPx}px`);
    currentHost.style.setProperty("--preview-bottom-px", `${bottomPx}px`);
    currentHost.style.setProperty("--controls-height", `${previewRegion.controlsHeight}px`);
  }

  const panel = currentHost?.shadowRoot?.querySelector(".nxl-card");
  if (panel) {
    panel.classList.toggle("safe", safeMode);
  }

  applyOverlayData(data);
};
