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
  "[data-uia*='preview']",
  "[data-uia*='billboard']",
  "[data-uia*='hero']",
  "[data-uia*='details']"
];

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

const EPISODE_TITLE_PATTERN = /(S\\d+\\s*:?\\s*E\\d+|Episode\\s*\\d+|\\bE\\d+\\b)/i;

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

const collectVisibleText = (container: Element, selectors: string[]): string[] => {
  const values: string[] = [];
  selectors.forEach((selector) => {
    container.querySelectorAll(selector).forEach((el) => {
      if (!isVisible(el)) return;
      const text = normalizeText(el.textContent);
      if (!text) return;
      values.push(text);
    });
  });
  return values;
};

const isMetadataCandidate = (value: string) => {
  const lower = value.toLowerCase();
  if (lower.includes("episode")) return false;
  if (lower.includes("min")) return false;
  if (lower.includes("season") || lower.includes("hd") || lower.includes("tv-")) return true;
  return true;
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

const findPrimaryTitle = (container?: Element | null): string | undefined => {
  if (!container) return undefined;
  for (const selector of TITLE_TEXT_SELECTORS) {
    const nodes = Array.from(container.querySelectorAll(selector));
    for (const node of nodes) {
      if (!isVisible(node)) continue;
      const text = normalizeText(node.textContent);
      if (!text) continue;
      if (EPISODE_TITLE_PATTERN.test(text)) continue;
      return text;
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

export const extractMetadataLine = (container?: Element | null): string | undefined => {
  if (!container) return undefined;
  const values = collectVisibleText(container, METADATA_SELECTORS)
    .map((value) => value.replace(/\s+/g, " ").trim())
    .filter((value) => value.length > 0)
    .filter(isMetadataCandidate)
    .filter((value) => value.length <= 24);
  const unique = Array.from(new Set(values));
  if (!unique.length) return undefined;
  return unique.slice(0, 3).join(" • ");
};

export const extractGenresLine = (container?: Element | null): string | undefined => {
  if (!container) return undefined;
  const values = collectVisibleText(container, GENRE_SELECTORS)
    .map((value) => value.replace(/\s+/g, " ").trim())
    .filter((value) => value.length > 0)
    .filter((value) => value.length <= 24)
    .filter((value) => !/episode|min/i.test(value));
  const unique = Array.from(new Set(values));
  if (!unique.length) return undefined;
  return unique.slice(0, 3).join(" • ");
};

export const resolveTitleText = (
  container?: Element | null,
  fallback?: string
): string | undefined => {
  const cleanFallback = fallback ? fallback.replace(EPISODE_TITLE_PATTERN, "").trim() : undefined;
  if (cleanFallback && !EPISODE_TITLE_PATTERN.test(cleanFallback)) {
    return cleanFallback;
  }

  const primary = findPrimaryTitle(container);
  if (primary) return primary;

  if (fallback) return fallback;
  return undefined;
};

export const findOverlayContainer = (
  container?: Element | null,
  preview?: Element | null
): Element | null => {
  const candidates = new Set<Element>();
  const collect = (start?: Element | null) => {
    let current: Element | null | undefined = start;
    let depth = 0;
    while (current && depth < 7) {
      candidates.add(current);
      current = current.parentElement;
      depth += 1;
    }
  };
  collect(container);
  collect(preview);

  let best: Element | null = null;
  let bestArea = 0;
  candidates.forEach((el) => {
    if (!isVisible(el)) return;
    const rect = el.getBoundingClientRect();
    const area = rect.width * rect.height;
    if (area > bestArea && rect.width > 240 && rect.height > 180) {
      best = el;
      bestArea = area;
    }
  });

  return best ?? container ?? preview ?? null;
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
  return visible.length > 0 ? visible : nodes;
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

export const detectActiveTitle = (): ActiveTitleCandidate | null => {
  return detectActiveTitleContext().candidate;
};
