export const normalizeTitle = (title?: string): string => {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9']+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const makeKey = (title?: string, year?: number): string => {
  const normalized = normalizeTitle(title);
  const suffix = year ? String(year) : "";
  return `${normalized}-${suffix}`;
};

export const buildTmdbCacheKey = (title?: string, year?: number): string => {
  const normalized = normalizeTitle(title);
  return year ? `${normalized} (${year})` : normalized;
};

export const buildLetterboxdKey = (title?: string, year?: number): string => {
  return makeKey(title, year);
};

export const parseLetterboxdKey = (key: string): { title: string; year?: number } => {
  const parts = key.split("-");
  if (parts.length >= 2) {
    const maybeYear = parts[parts.length - 1];
    if (maybeYear === "") {
      return { title: parts.slice(0, -1).join("-") };
    }
    const year = Number(maybeYear);
    if (!Number.isNaN(year) && maybeYear.length === 4) {
      return { title: parts.slice(0, -1).join("-"), year };
    }
  }
  return { title: key };
};

export const buildLegacyLetterboxdKey = (title?: string, year?: number): string => {
  const normalized = normalizeTitle(title);
  return year ? `${normalized}|${year}` : normalized;
};

export const parseLegacyLetterboxdKey = (key: string): { title: string; year?: number } => {
  const parts = key.split("|");
  if (parts.length === 2) {
    const year = Number(parts[1]);
    return { title: parts[0], year: Number.isNaN(year) ? undefined : year };
  }
  return { title: key };
};
