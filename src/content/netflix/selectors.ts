import { normalizeTitle } from "../../shared/normalize";
import type { ExtractedTitleInfo } from "../../shared/types";

export interface ActiveTitleCandidate {
  netflixTitleId?: string;
  titleText?: string;
  year?: number;
  href?: string;
  source: string;
}

const TITLE_ANCHOR_SELECTOR = "a[href^='/title/']";

const CONTAINER_SELECTORS = [
  "[role='dialog']",
  "[aria-modal='true']",
  "[aria-expanded='true']",
  "[data-uia*='jawbone']",
  "[class*='jawbone']",
  "[data-uia*='preview']",
  "[data-uia*='billboard']",
  "[data-uia*='hero']",
  "[data-uia*='details']"
];

export const EXPANDED_CONTAINER_SELECTOR = CONTAINER_SELECTORS.join(",");

const TITLE_TEXT_SELECTORS = [
  "h1",
  "h2",
  "h3",
  "[data-uia*='title']",
  "[class*='title']",
  "[class*='fallback']",
  "[class*='preview'] [class*='header']"
];

const PREVIEW_SELECTORS = [
  "video",
  "img",
  "[data-uia*='preview'] video",
  "[data-uia*='preview'] img",
  "[class*='preview'] video",
  "[class*='preview'] img",
  "[data-uia*='player'] video",
  "[data-uia*='hero'] img"
];

const CONTROLS_SELECTORS = [
  "[data-uia*='controls']",
  "[class*='controls']",
  "[class*='control']",
  "[role='toolbar']"
];

const EPISODE_TITLE_PATTERN =
  /(S\d+\s*:?\s*E\d+|Season\s*\d+\s*Episode\s*\d+|Episode\s*\d+|\bE\d+\b)/i;
const EPISODE_TIME_PATTERN = /(\b\d+\s*(m|min|minutes)\b|\b\d+\s*of\s*\d+\s*(m|min|minutes)\b)/i;
const METADATA_TEXT_PATTERN =
  /\b(tv-[a-z0-9]+|pg-?13|pg|tv-ma|tv-y|tv-g|nr|nc-17|hd|uhd|4k|seasons?|season|episode|volume|part\s+\d+)\b/i;

const METADATA_SELECTORS = [
  "[data-uia*='maturity-rating']",
  "[data-uia*='season']",
  "[data-uia*='resolution']",
  "[data-uia*='hd']",
  "[class*='maturity']",
  "[class*='season']",
  "[class*='quality']"
];

const GENRE_SELECTORS = [
  "[data-uia*='genre']",
  "a[href*='/genre/']",
  "[class*='genre']"
];

const METADATA_CONTAINER_SELECTORS = [
  ...METADATA_SELECTORS,
  ...GENRE_SELECTORS,
  "[data-uia*='metadata']",
  "[class*='metadata']",
  "[class*='meta']",
  "[class*='maturity']",
  "[class*='season']",
  "[class*='genre']",
  "[class*='tag']",
  "[class*='info']"
];

const HEADER_CONTAINER_SELECTORS = [
  "header",
  "nav",
  "[data-uia*='header']",
  "[data-uia*='row-title']",
  "[class*='rowHeader']",
  "[class*='row-title']"
];

const TITLE_LIKE_SELECTORS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "[data-uia*='title']",
  "[class*='title']",
  "[class*='headline']",
  "[class*='header']",
  "[class*='name']"
];

const NAV_BANNED_PATTERN =
  /(browse|home|my list|popular|your next watch|explore all|movies & shows|movies and shows|new & popular)/i;

const isVisible = (el: Element): boolean => {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  const style = window.getComputedStyle(el as HTMLElement);
  if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") {
    return false;
  }
  const inViewport =
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= window.innerHeight &&
    rect.left <= window.innerWidth;
  return inViewport;
};

const normalizeText = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const text = value.replace(/\s+/g, " ").trim();
  return text.length ? text : undefined;
};

const parseTitleIdFromHref = (href?: string | null): string | undefined => {
  if (!href) return undefined;
  const match = href.match(/\/title\/(\d+)/);
  return match?.[1];
};

const parseYearFromText = (text?: string): number | undefined => {
  if (!text) return undefined;
  const match = text.match(/(19\d{2}|20\d{2})/);
  if (!match) return undefined;
  const year = Number(match[1]);
  if (Number.isNaN(year)) return undefined;
  return year;
};

export const normalizeNetflixTitle = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  let value = raw;
  value = value.replace(/^\s*S\d+\s*:?\s*E\d+\s*/i, "");
  value = value.replace(/"[^"]*"/g, (match) => {
    const inner = match.replace(/"/g, "");
    return EPISODE_TITLE_PATTERN.test(inner) ? "" : match;
  });
  value = value.replace(/Episode\s*\d+/gi, "");
  value = value.replace(/\bE\d+\b/gi, "");
  value = value.replace(EPISODE_TIME_PATTERN, "");
  value = value.replace(/\s+of\s+\d+\s*(m|min|minutes)?/gi, "");
  value = value.replace(/\s+/g, " ").trim();
  return value.length ? value : undefined;
};

const extractFromAnchor = (anchor: HTMLAnchorElement, source: string): ActiveTitleCandidate => {
  const href = anchor.getAttribute("href") || undefined;
  const netflixTitleId = parseTitleIdFromHref(href);
  const titleText = normalizeText(anchor.getAttribute("aria-label") || anchor.textContent);
  return { netflixTitleId, titleText, href, source };
};

const extractTitleTextNear = (container: Element): string | undefined => {
  for (const selector of TITLE_TEXT_SELECTORS) {
    const el = container.querySelector(selector);
    if (el && isVisible(el)) {
      const text = normalizeText(el.textContent);
      if (text) return text;
    }
  }
  return undefined;
};

export const getRawTitleText = (container?: Element | null): string | undefined => {
  if (!container) return undefined;
  return extractTitleTextNear(container);
};

const findPrimaryTitle = (container?: Element | null): string | undefined => {
  if (!container) return undefined;
  for (const selector of TITLE_TEXT_SELECTORS) {
    const nodes = Array.from(container.querySelectorAll(selector));
    for (const node of nodes) {
      if (!isVisible(node)) continue;
      const text = normalizeText(node.textContent);
      if (!text) continue;
      if (EPISODE_TITLE_PATTERN.test(text) || EPISODE_TIME_PATTERN.test(text)) continue;
      const normalized = normalizeNetflixTitle(text);
      if (normalized) return normalized;
    }
  }
  return undefined;
};

export const findOverlayAnchor = (container?: Element | null): Element | null => {
  if (container) {
    const anchor = findBestAnchorIn(container);
    if (anchor && isVisible(anchor)) return anchor;
    for (const selector of TITLE_TEXT_SELECTORS) {
      const el = container.querySelector(selector);
      if (el && isVisible(el)) return el;
    }
  }

  const pageAnchor = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(TITLE_ANCHOR_SELECTOR)
  ).find(isVisible);
  if (pageAnchor) return pageAnchor;

  const pageTitle = Array.from(document.querySelectorAll(TITLE_TEXT_SELECTORS.join(","))).find(
    isVisible
  );
  return pageTitle ?? null;
};

export const findPreviewElement = (container?: Element | null): Element | null => {
  if (!container) return null;
  const candidates: Element[] = [];
  PREVIEW_SELECTORS.forEach((selector) => {
    container.querySelectorAll(selector).forEach((el) => {
      if (isVisible(el)) candidates.push(el);
    });
  });
  if (!candidates.length) return null;
  return candidates.reduce((best, current) => {
    const bestRect = best.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    const bestArea = bestRect.width * bestRect.height;
    const currentArea = currentRect.width * currentRect.height;
    return currentArea > bestArea ? current : best;
  });
};

export const findControlsRow = (root?: Element | null): HTMLElement | null => {
  if (!root) return null;
  const candidates: HTMLElement[] = [];
  CONTROLS_SELECTORS.forEach((selector) => {
    root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      if (!isVisible(el)) return;
      candidates.push(el);
    });
  });
  const unique = Array.from(new Set(candidates));
  const scored = unique
    .map((el) => {
      const buttons = el.querySelectorAll("button, [role='button']").length;
      const rect = el.getBoundingClientRect();
      const score = buttons * 10 + rect.width;
      return { el, score, top: rect.top };
    })
    .filter((entry) => entry.score > 0);
  scored.sort((a, b) => b.score - a.score || b.top - a.top);
  return scored[0]?.el ?? null;
};

export const hasMetadataSection = (root?: Element | null): boolean => {
  if (!root) return false;
  const selectors = [...METADATA_SELECTORS, ...GENRE_SELECTORS].join(",");
  const nodes = Array.from(root.querySelectorAll(selectors));
  return nodes.some((node) => isVisible(node));
};

export const findExpandedRoot = (): HTMLElement | null => {
  const candidates = collectJawboneCandidates();
  const maxWidth = window.innerWidth * 0.85;
  const maxHeight = window.innerHeight * 0.6;
  for (const candidate of candidates) {
    const rect = candidate.getBoundingClientRect();
    if (rect.width > maxWidth || rect.height > maxHeight) continue;
    const preview = findPreviewElement(candidate);
    const controls = findControlsRow(candidate);
    const metadata = hasMetadataSection(candidate);
    if (preview && controls && metadata) {
      return candidate as HTMLElement;
    }
  }
  return null;
};

const isInMetadataRegion = (el: Element) =>
  Boolean(el.closest(METADATA_CONTAINER_SELECTORS.join(",")));

const isInHeaderRegion = (el: Element) =>
  Boolean(el.closest(HEADER_CONTAINER_SELECTORS.join(",")));

const isBannedTitleText = (text: string) => {
  if (NAV_BANNED_PATTERN.test(text)) return true;
  if (METADATA_TEXT_PATTERN.test(text)) return true;
  return (
    EPISODE_TITLE_PATTERN.test(text) ||
    EPISODE_TIME_PATTERN.test(text) ||
    /\b\d+\s*of\s*\d+\s*(m|min|minutes)?\b/i.test(text) ||
    /\b\d+\s*(m|min|minutes)\b/i.test(text)
  );
};

const isInProgressRegion = (el: Element, controlsTop?: number) => {
  if (el.closest('[role="progressbar"], [data-uia*="progress"], [class*="progress"]')) {
    return true;
  }
  if (controlsTop !== undefined) {
    const rect = el.getBoundingClientRect();
    return rect.bottom >= controlsTop - 8;
  }
  return false;
};

export const extractDisplayTitle = (expandedRoot: HTMLElement): {
  title: string | null;
  chosen?: Element;
  rejectedCount: number;
} => {
  const rootRect = expandedRoot.getBoundingClientRect();
  const controls = findControlsRow(expandedRoot);
  const controlsTop = controls ? controls.getBoundingClientRect().top : undefined;
  const candidates = Array.from(expandedRoot.querySelectorAll(TITLE_LIKE_SELECTORS.join(",")));
  let best: { el: Element; score: number; text: string } | undefined;
  let rejectedCount = 0;
  const episodeNodes: Element[] = [];

  candidates.forEach((el) => {
    if (!isVisible(el)) {
      rejectedCount += 1;
      return;
    }
    if (isInProgressRegion(el, controlsTop)) {
      rejectedCount += 1;
      return;
    }
    const text = normalizeText(el.textContent);
    if (!text || text.length < 2 || text.length > 80) {
      rejectedCount += 1;
      return;
    }
    if (isBannedTitleText(text)) {
      episodeNodes.push(el);
      rejectedCount += 1;
      return;
    }

    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el as HTMLElement);
    const fontSize = parseFloat(style.fontSize) || 14;
    const fontWeightRaw = style.fontWeight === "bold" ? 700 : Number(style.fontWeight);
    const fontWeight = Number.isNaN(fontWeightRaw) ? 400 : fontWeightRaw;
    const dx = rect.left - rootRect.left;
    const dy = rect.top - rootRect.top;
    const dist = Math.hypot(dx, dy);
    const regionPenalty =
      isInMetadataRegion(el) || isInHeaderRegion(el) ? 120 : 0;
    const score = fontSize * 10 + fontWeight / 10 + Math.max(0, 300 - dist) - regionPenalty;
    if (!best || score > best.score) {
      best = { el, score, text };
    }
  });

  if (best) {
    const normalized = normalizeNetflixTitle(best.text);
    return { title: normalized ?? best.text, chosen: best.el, rejectedCount };
  }

  for (const episodeNode of episodeNodes) {
    let current: Element | null = episodeNode.parentElement;
    let depth = 0;
    while (current && depth < 4) {
      const siblingCandidates = Array.from(
        current.querySelectorAll(TITLE_LIKE_SELECTORS.join(","))
      ).filter((el) => el !== episodeNode);
      for (const sibling of siblingCandidates) {
        if (!isVisible(sibling)) continue;
        if (isInProgressRegion(sibling, controlsTop)) continue;
        const text = normalizeText(sibling.textContent);
        if (!text || text.length < 2 || text.length > 80) continue;
        if (isBannedTitleText(text)) continue;
        return {
          title: normalizeNetflixTitle(text) ?? text,
          chosen: sibling,
          rejectedCount
        };
      }
      current = current.parentElement;
      depth += 1;
    }
  }

  const anchor = expandedRoot.querySelector("a[href^='/title/']");
  if (anchor) {
    const heading = anchor.querySelector(TITLE_LIKE_SELECTORS.join(","));
    const directText = normalizeText(heading?.textContent || anchor.textContent);
    if (directText && !isBannedTitleText(directText)) {
      return {
        title: normalizeNetflixTitle(directText) ?? directText,
        chosen: heading ?? anchor,
        rejectedCount
      };
    }

    let current: Element | null = anchor.parentElement;
    let depth = 0;
    while (current && depth < 4) {
      const nearby = Array.from(current.querySelectorAll(TITLE_LIKE_SELECTORS.join(",")));
      for (const node of nearby) {
        if (!isVisible(node)) continue;
        if (isInProgressRegion(node, controlsTop)) continue;
        const text = normalizeText(node.textContent);
        if (!text || text.length < 2 || text.length > 80) continue;
        if (isBannedTitleText(text)) continue;
        return {
          title: normalizeNetflixTitle(text) ?? text,
          chosen: node,
          rejectedCount
        };
      }
      current = current.parentElement;
      depth += 1;
    }
  }

  return { title: null, rejectedCount };
};

const extractMetadataInfo = (root: HTMLElement): { year?: number; isSeries?: boolean } => {
  const nodes = Array.from(root.querySelectorAll(METADATA_CONTAINER_SELECTORS.join(",")));
  const texts = nodes
    .map((node) => normalizeText(node.textContent))
    .filter(Boolean) as string[];

  if (!texts.length) {
    const controls = findControlsRow(root);
    const next = controls?.nextElementSibling as HTMLElement | null;
    const nextText = normalizeText(next?.textContent);
    if (nextText) texts.push(nextText);
  }

  const combined = texts.join(" ");
  const year = parseYearFromText(combined);
  const hasSeasons = /\bseasons?\b/i.test(combined);
  const hasRuntime = /\b\d+\s*(m|min|minutes)\b/i.test(combined) || /\b\d+\s*h\b/i.test(combined);

  let isSeries: boolean | undefined = undefined;
  if (hasSeasons) isSeries = true;
  else if (hasRuntime) isSeries = false;

  return { year, isSeries };
};

const extractTitleFromAnchor = (anchor: HTMLAnchorElement): string | undefined => {
  const candidates: Array<string | null | undefined> = [
    anchor.getAttribute("aria-label"),
    anchor.getAttribute("title"),
    (anchor.querySelector("img[alt]") as HTMLImageElement | null)?.alt,
    (anchor.querySelector("[aria-label]") as HTMLElement | null)?.getAttribute("aria-label"),
    anchor.textContent
  ];
  for (const candidate of candidates) {
    const text = normalizeText(candidate);
    if (!text) continue;
    if (isBannedTitleText(text)) continue;
    return text;
  }
  return undefined;
};

export const findActiveJawbone = (): {
  jawboneEl: HTMLElement | null;
  extracted: ExtractedTitleInfo | null;
  rejectedCount?: number;
  chosenTitleElement?: Element;
} => {
  const candidates = collectJawboneCandidates();
  const maxWidth = window.innerWidth * 0.85;
  const maxHeight = window.innerHeight * 0.6;

  for (const candidate of candidates) {
    const rect = candidate.getBoundingClientRect();
    if (rect.width > maxWidth || rect.height > maxHeight) continue;
    const preview = findPreviewElement(candidate);
    const controls = findControlsRow(candidate);
    const metadata = hasMetadataSection(candidate);
    if (!preview || !controls) continue;

    const anchor = candidate.querySelector<HTMLAnchorElement>("a[href^='/title/']");
    if (!anchor) continue;

    const display = extractDisplayTitle(candidate as HTMLElement);
    let title = display.title ?? null;
    if (!title && anchor) {
      const anchorTitle = extractTitleFromAnchor(anchor);
      if (anchorTitle) title = normalizeNetflixTitle(anchorTitle) ?? anchorTitle;
    }
    if (!title && !metadata) continue;
    if (!title && metadata) {
      const fallbackTitle = getRawTitleText(candidate);
      if (fallbackTitle && !isBannedTitleText(fallbackTitle)) {
        title = normalizeNetflixTitle(fallbackTitle) ?? fallbackTitle;
      }
    }
    if (!title) continue;

    const href = anchor?.getAttribute("href") ?? null;
    const netflixId = parseTitleIdFromHref(href) ?? null;
    const { year, isSeries } = extractMetadataInfo(candidate as HTMLElement);
    const normalizedTitle = normalizeTitle(title);
    if (!normalizedTitle) continue;

    const extracted: ExtractedTitleInfo = {
      rawTitle: title,
      normalizedTitle,
      year: year ?? null,
      isSeries,
      netflixId,
      href
    };

    return {
      jawboneEl: candidate as HTMLElement,
      extracted,
      rejectedCount: display.rejectedCount,
      chosenTitleElement: display.chosen
    };
  }

  return { jawboneEl: null, extracted: null };
};

export const resolveTitleText = (
  container?: Element | null,
  fallback?: string
): string | undefined => {
  const primary = findPrimaryTitle(container);
  if (primary) return primary;

  const normalizedFallback = normalizeNetflixTitle(fallback);
  if (normalizedFallback && !EPISODE_TITLE_PATTERN.test(normalizedFallback)) {
    return normalizedFallback;
  }

  if (fallback) return normalizeNetflixTitle(fallback) ?? fallback;
  return undefined;
};


const findBestAnchorIn = (container: Element): HTMLAnchorElement | undefined => {
  const anchors = Array.from(container.querySelectorAll<HTMLAnchorElement>(TITLE_ANCHOR_SELECTOR));
  const visible = anchors.filter(isVisible);
  if (visible.length > 0) return visible[0];
  return anchors[0];
};

const findExpandedContainers = (): Element[] => {
  const selectors = CONTAINER_SELECTORS.join(",");
  const nodes = Array.from(document.querySelectorAll(selectors));
  const visible = nodes.filter(isVisible);
  const maxWidth = window.innerWidth * 0.85;
  const maxHeight = window.innerHeight * 0.6;
  const filtered = visible.filter((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    if (rect.width < 240 || rect.height < 180) return false;
    if (rect.width > maxWidth || rect.height > maxHeight) return false;
    return true;
  });
  if (filtered.length > 0) {
    return filtered.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return rb.width * rb.height - ra.width * ra.height;
    });
  }
  return visible.length > 0 ? visible : nodes;
};

const collectJawboneCandidates = (): Element[] => {
  const candidates = findExpandedContainers();
  if (candidates.length) return candidates;

  const controls = Array.from(document.querySelectorAll(CONTROLS_SELECTORS.join(",")));
  const maxWidth = window.innerWidth * 0.85;
  const maxHeight = window.innerHeight * 0.6;
  const roots = new Set<Element>();

  controls.forEach((control) => {
    let current: Element | null = control;
    let depth = 0;
    while (current && depth < 6) {
      if (current instanceof HTMLElement) {
        const rect = current.getBoundingClientRect();
        if (
          rect.width >= 240 &&
          rect.height >= 180 &&
          rect.width <= maxWidth &&
          rect.height <= maxHeight
        ) {
          const preview = findPreviewElement(current);
          if (preview) {
            roots.add(current);
            break;
          }
        }
      }
      current = current.parentElement;
      depth += 1;
    }
  });

  return Array.from(roots);
};

export const detectActiveTitleContext = (): {
  candidate: ActiveTitleCandidate | null;
  container: Element | null;
} => {
  const containers = findExpandedContainers();

  for (const container of containers) {
    const anchor = findBestAnchorIn(container);
    if (anchor) {
      const candidate = extractFromAnchor(anchor, "container-anchor");
      if (candidate.netflixTitleId || candidate.titleText) {
        const titleText = candidate.titleText ?? extractTitleTextNear(container);
        const resolvedTitle = resolveTitleText(container, titleText ?? candidate.titleText);
        return {
          candidate: {
            ...candidate,
            titleText: resolvedTitle,
            year: parseYearFromText(resolvedTitle ?? titleText)
          },
          container
        };
      }
    }

    const titleText = extractTitleTextNear(container);
    if (titleText) {
      const resolvedTitle = resolveTitleText(container, titleText);
      return {
        candidate: {
          titleText: resolvedTitle ?? titleText,
          year: parseYearFromText(resolvedTitle ?? titleText),
          source: "container-text"
        },
        container
      };
    }
  }

  const fallbackAnchor = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(TITLE_ANCHOR_SELECTOR)
  ).find(isVisible);
  if (fallbackAnchor) {
    const candidate = extractFromAnchor(fallbackAnchor, "page-anchor");
    const resolvedTitle = resolveTitleText(
      fallbackAnchor.closest(CONTAINER_SELECTORS.join(",")) ?? fallbackAnchor.parentElement,
      candidate.titleText
    );
    return {
      candidate: {
        ...candidate,
        titleText: resolvedTitle ?? candidate.titleText,
        year: parseYearFromText(resolvedTitle ?? candidate.titleText)
      },
      container: fallbackAnchor.closest(CONTAINER_SELECTORS.join(",")) ?? fallbackAnchor.parentElement
    };
  }

  return { candidate: null, container: null };
};

// Intentionally no default export.
