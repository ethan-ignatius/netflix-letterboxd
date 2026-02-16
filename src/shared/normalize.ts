export const normalizeTitle = (title?: string): string => {
  if (!title) return "";
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
};

export const buildTmdbCacheKey = (title?: string, year?: number): string => {
  const normalized = normalizeTitle(title);
  return year ? `${normalized} (${year})` : normalized;
};

export const buildLetterboxdKey = (title?: string, year?: number): string => {
  const normalized = normalizeTitle(title);
  return year ? `${normalized}|${year}` : normalized;
};

export const parseLetterboxdKey = (key: string): { title: string; year?: number } => {
  const parts = key.split("|");
  if (parts.length === 2) {
    const year = Number(parts[1]);
    return { title: parts[0], year: Number.isNaN(year) ? undefined : year };
  }
  return { title: key };
};
