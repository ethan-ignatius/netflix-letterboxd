export interface OverlayData {
  communityRating?: number;
  ratingCount?: number;
  matchScore?: number;
  matchExplanation?: string;
  inWatchlist?: boolean;
  userRating?: number;
}

const TOP_SECTION_ID = "nxlb-top-section";

const buildTopSection = (): HTMLDivElement => {
  const host = document.createElement("div");
  host.id = TOP_SECTION_ID;
  host.style.display = "block";
  host.style.width = "100%";
  host.style.pointerEvents = "none";

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      pointer-events: none;
      display: block;
      width: 100%;
      box-sizing: border-box;
      opacity: 0;
      transform: translateY(-8px);
      transition: opacity 180ms cubic-bezier(0.2, 0, 0, 1),
        transform 180ms cubic-bezier(0.2, 0, 0, 1);
      will-change: opacity, transform;
    }
    :host(.nxl-visible) {
      opacity: 1;
      transform: translateY(0);
    }
    .nxl-top-section {
      background: rgba(0, 0, 0, 0.82);
      color: #f5f5f5;
      padding: 16px 20px;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: grid;
      gap: 8px;
      box-sizing: border-box;
    }
    .nxl-header {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;
    }
    .nxl-branding {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
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
      border-radius: 999px;
      display: inline-block;
    }
    .nxl-dot.green { background: #00c46a; }
    .nxl-dot.orange { background: #f2b34c; }
    .nxl-dot.blue { background: #4aa8ff; }
    .nxl-body {
      display: grid;
      gap: 6px;
      font-size: 15px;
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
    }
    .nxl-because {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }
    .nxl-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
    }
    .nxl-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.06);
    }
  `;

  const section = document.createElement("div");
  section.className = "nxl-top-section";

  const header = document.createElement("div");
  header.className = "nxl-header";

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

  header.appendChild(branding);

  const body = document.createElement("div");
  body.className = "nxl-body";

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
  because.textContent = "Because you like: —";

  const badges = document.createElement("div");
  badges.className = "nxl-badges";
  badges.dataset.field = "badges";

  body.appendChild(communityRating);
  body.appendChild(match);
  body.appendChild(because);
  body.appendChild(badges);

  section.appendChild(header);
  section.appendChild(body);

  shadow.appendChild(style);
  shadow.appendChild(section);

  return host;
};

const formatRatingCount = (value?: number) => {
  if (value === undefined) return "";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
};

const renderStars = (rating: number) => {
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const half = clamped % 1 >= 0.5;
  return "★".repeat(full) + (half ? "½" : "");
};

const applyTopSectionData = (host: HTMLDivElement, data: OverlayData) => {
  const communityEl = host.shadowRoot?.querySelector(
    "[data-field='communityRating']"
  ) as HTMLDivElement | null;
  if (communityEl) {
    if (data.communityRating !== undefined) {
      const count = formatRatingCount(data.ratingCount);
      communityEl.innerHTML = `
        Community rating:
        <span class="nxl-star">★</span>
        ${data.communityRating.toFixed(1)}${
        count ? ` <span class="nxl-meta">${count} ratings</span>` : ""
      }
      `;
    } else {
      communityEl.textContent = "Community rating: —";
    }
  }

  const matchEl = host.shadowRoot?.querySelector("[data-field='match']") as
    | HTMLDivElement
    | null;
  if (matchEl) {
    if (data.matchScore !== undefined) {
      matchEl.innerHTML = `Your match: <span class="nxl-match-value">${data.matchScore}%</span>`;
    } else {
      matchEl.textContent = "Your match: —";
    }
  }

  const becauseEl = host.shadowRoot?.querySelector("[data-field='because']") as
    | HTMLDivElement
    | null;
  if (becauseEl) {
    becauseEl.textContent = data.matchExplanation
      ? `Because you like: ${data.matchExplanation.replace(/^Because you like\s*/i, "")}`
      : "Because you like: —";
  }

  const badgesEl = host.shadowRoot?.querySelector("[data-field='badges']") as
    | HTMLDivElement
    | null;
  if (badgesEl) {
    badgesEl.innerHTML = "";
    if (data.inWatchlist) {
      const badge = document.createElement("span");
      badge.className = "nxl-badge";
      badge.textContent = "On watchlist";
      badgesEl.appendChild(badge);
    }
    if (data.userRating !== undefined) {
      const badge = document.createElement("span");
      badge.className = "nxl-badge";
      badge.textContent = `You rated ${renderStars(data.userRating)}`;
      badgesEl.appendChild(badge);
    }
    if (!data.inWatchlist && data.userRating === undefined) {
      const badge = document.createElement("span");
      badge.className = "nxl-badge";
      badge.textContent = "Letterboxd: —";
      badgesEl.appendChild(badge);
    }
  }
};

export const createOverlayManager = () => {
  let currentRoot: HTMLElement | null = null;
  let host: HTMLDivElement | null = null;
  let lastData: OverlayData = {};

  const ensureHost = () => {
    if (!host) host = buildTopSection();
  };

  const mount = (expandedRoot: HTMLElement) => {
    ensureHost();
    if (!host) return;
    if (currentRoot !== expandedRoot) {
      host.remove();
      expandedRoot.insertBefore(host, expandedRoot.firstChild);
      currentRoot = expandedRoot;
      requestAnimationFrame(() => {
        host?.classList.add("nxl-visible");
      });
    }
  };

  const update = (data: OverlayData) => {
    lastData = { ...lastData, ...data };
    if (host) applyTopSectionData(host, lastData);
  };

  const unmount = () => {
    if (host) host.remove();
    currentRoot = null;
  };

  const renderLast = () => {
    if (host) applyTopSectionData(host, lastData);
  };

  return {
    mount,
    update,
    unmount,
    renderLast,
    getLastData: () => lastData,
    getCurrentRoot: () => currentRoot,
    isMounted: () => Boolean(host && host.isConnected)
  };
};
