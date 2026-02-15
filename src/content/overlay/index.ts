export interface OverlayData {
  titleLine: string;
}

const OVERLAY_ID = "nxlb-overlay-panel";
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
  host.style.top = "12px";
  host.style.right = "12px";
  host.style.zIndex = "2147483647";

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      font-family: "Space Grotesk", sans-serif;
      pointer-events: none;
    }
    .panel {
      min-width: 220px;
      max-width: 280px;
      background: rgba(16, 16, 16, 0.92);
      color: #f5f0ea;
      border-radius: 12px;
      padding: 12px 14px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
      display: grid;
      gap: 8px;
    }
    .title {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.01em;
    }
    .meta {
      font-size: 12px;
      opacity: 0.7;
    }
    .badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .badge {
      font-size: 11px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
    }
  `;

  const panel = document.createElement("div");
  panel.className = "panel";

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = data.titleLine;

  const communityRating = document.createElement("div");
  communityRating.className = "meta";
  communityRating.textContent = "Community rating: —";

  const ratingCount = document.createElement("div");
  ratingCount.className = "meta";
  ratingCount.textContent = "Rating count: —";

  const match = document.createElement("div");
  match.className = "meta";
  match.textContent = "Your match: —";

  const badges = document.createElement("div");
  badges.className = "badges";

  const watchlistBadge = document.createElement("div");
  watchlistBadge.className = "badge";
  watchlistBadge.textContent = "On Watchlist";

  const ratingBadge = document.createElement("div");
  ratingBadge.className = "badge";
  ratingBadge.textContent = "You rated ★★★★";

  badges.appendChild(watchlistBadge);
  badges.appendChild(ratingBadge);

  panel.appendChild(title);
  panel.appendChild(communityRating);
  panel.appendChild(ratingCount);
  panel.appendChild(match);
  panel.appendChild(badges);

  shadow.appendChild(style);
  shadow.appendChild(panel);

  return host;
};

let currentContainer: Element | null = null;
let currentHost: HTMLDivElement | null = null;

export const updateOverlay = (container: Element | null, data: OverlayData | null) => {
  if (!container || !data) {
    if (currentHost) currentHost.remove();
    restoreContainerPosition(currentContainer);
    currentContainer = null;
    currentHost = null;
    return;
  }

  if (currentContainer !== container) {
    if (currentHost) currentHost.remove();
    restoreContainerPosition(currentContainer);
    currentContainer = container;
    currentHost = buildOverlay(data);
    ensureContainerPosition(container);
    container.appendChild(currentHost);
    return;
  }

  const titleEl = currentHost?.shadowRoot?.querySelector(".title");
  if (titleEl) {
    titleEl.textContent = data.titleLine;
  }
};
