export interface OverlayData {
  titleLine: string;
  metadataLine?: string;
  genresLine?: string;
  communityRating?: number;
  ratingCount?: number;
  matchScore?: number;
  matchExplanation?: string;
}

const TOP_SECTION_ID = "nxlb-top-section";

const buildTopSection = (data: OverlayData): HTMLDivElement => {
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
    }
    .nxl-top-section {
      background: rgba(0, 0, 0, 0.85);
      color: #f5f5f5;
      padding: 20px;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: grid;
      gap: 10px;
      box-sizing: border-box;
    }
    .nxl-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .nxl-title {
      font-size: 30px;
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: 0.01em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 70%;
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
      display: inline-flex;
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
      border-radius: 999px;
      display: inline-block;
    }
    .nxl-dot.green { background: #00c46a; }
    .nxl-dot.orange { background: #f2b34c; }
    .nxl-dot.blue { background: #4aa8ff; }
    .nxl-body {
      display: grid;
      gap: 8px;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
      max-height: 220px;
      overflow: auto;
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
  `;

  const section = document.createElement("div");
  section.className = "nxl-top-section";

  const header = document.createElement("div");
  header.className = "nxl-header";

  const titleBlock = document.createElement("div");

  const title = document.createElement("div");
  title.className = "nxl-title";
  title.textContent = data.titleLine;

  const meta = document.createElement("div");
  meta.className = "nxl-meta";
  meta.dataset.field = "metadata";

  const genres = document.createElement("div");
  genres.className = "nxl-genres";
  genres.dataset.field = "genres";

  titleBlock.appendChild(title);
  titleBlock.appendChild(meta);
  titleBlock.appendChild(genres);

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

  header.appendChild(titleBlock);
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
  because.textContent = "Because you like —";

  body.appendChild(communityRating);
  body.appendChild(match);
  body.appendChild(because);

  section.appendChild(header);
  section.appendChild(body);

  shadow.appendChild(style);
  shadow.appendChild(section);

  return host;
};

let currentRoot: HTMLElement | null = null;
let currentHost: HTMLDivElement | null = null;

const formatRatingCount = (value?: number) => {
  if (value === undefined) return "";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
};

const applyTopSectionData = (data: OverlayData) => {
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
};

export const injectTopSection = (expandedRoot: HTMLElement, data: OverlayData): boolean => {
  const isNewRoot = currentRoot !== expandedRoot;
  if (isNewRoot) {
    if (currentHost) currentHost.remove();
    currentRoot = expandedRoot;
    currentHost = buildTopSection(data);
    expandedRoot.insertBefore(currentHost, expandedRoot.firstChild);
  }

  applyTopSectionData(data);
  return isNewRoot;
};

export const removeTopSection = () => {
  if (currentHost) currentHost.remove();
  currentRoot = null;
  currentHost = null;
};
