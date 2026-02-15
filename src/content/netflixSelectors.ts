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
        return {
          candidate: {
          ...candidate,
          titleText,
          year: parseYearFromText(titleText)
          },
          container
        };
      }
    }

    const titleText = extractTitleTextNear(container);
    if (titleText) {
      return {
        candidate: {
          titleText,
          year: parseYearFromText(titleText),
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
    return {
      candidate: {
        ...candidate,
        year: parseYearFromText(candidate.titleText)
      },
      container: fallbackAnchor.closest(CONTAINER_SELECTORS.join(",")) ?? fallbackAnchor.parentElement
    };
  }

  return { candidate: null, container: null };
};

export const detectActiveTitle = (): ActiveTitleCandidate | null => {
  return detectActiveTitleContext().candidate;
};
