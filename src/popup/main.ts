import { getStorage } from "../shared/storage";
import { log } from "../shared/log";
import { unzipSync, strFromU8 } from "fflate";
import type { LetterboxdIndex, LetterboxdStats } from "../shared/types";

const overlayToggle = document.getElementById("overlayToggle") as HTMLInputElement | null;
const tmdbKeyInput = document.getElementById("tmdbKey") as HTMLInputElement | null;
const saveKeyButton = document.getElementById("saveKey") as HTMLButtonElement | null;
const clearCacheButton = document.getElementById("clearCache") as HTMLButtonElement | null;
const keyStatus = document.getElementById("keyStatus") as HTMLDivElement | null;
const zipStatus = document.getElementById("zipStatus") as HTMLDivElement | null;
const zipMeta = document.getElementById("zipMeta") as HTMLDivElement | null;
const uploadZip = document.getElementById("uploadZip") as HTMLButtonElement | null;
const zipInput = document.getElementById("zipInput") as HTMLInputElement | null;

const normalizeTitle = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const buildKey = (title: string, year?: number) => {
  const normalized = normalizeTitle(title);
  return year ? `${normalized}|${year}` : normalized;
};

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      current.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      current.push(field);
      if (current.some((value) => value.trim().length > 0)) {
        rows.push(current);
      }
      current = [];
      field = "";
      continue;
    }

    field += char;
  }

  current.push(field);
  if (current.some((value) => value.trim().length > 0)) {
    rows.push(current);
  }

  return rows;
};

const headerIndex = (headers: string[]) => {
  const index: Record<string, number> = {};
  headers.forEach((header, idx) => {
    index[header.toLowerCase().trim()] = idx;
  });
  return index;
};

const getField = (row: string[], idx: number | undefined) => {
  if (idx === undefined) return "";
  return row[idx]?.trim() ?? "";
};

const parseYear = (value: string) => {
  const year = Number(value);
  if (Number.isNaN(year)) return undefined;
  return year;
};

const parseRatings = (csv: string, index: LetterboxdIndex) => {
  const rows = parseCsv(csv);
  if (!rows.length) return 0;
  const headers = headerIndex(rows[0]);
  const nameIdx = headers.name ?? headers.title;
  const yearIdx = headers.year;
  const ratingIdx = headers.rating;
  let count = 0;

  rows.slice(1).forEach((row) => {
    const title = getField(row, nameIdx);
    if (!title) return;
    const year = parseYear(getField(row, yearIdx));
    const ratingValue = parseFloat(getField(row, ratingIdx));
    if (Number.isNaN(ratingValue)) return;

    const key = buildKey(title, year);
    if (!index[key]) index[key] = {};
    index[key].r = ratingValue;
    count += 1;
  });

  return count;
};

const parseWatchlist = (csv: string, index: LetterboxdIndex) => {
  const rows = parseCsv(csv);
  if (!rows.length) return 0;
  const headers = headerIndex(rows[0]);
  const nameIdx = headers.name ?? headers.title;
  const yearIdx = headers.year;
  let count = 0;

  rows.slice(1).forEach((row) => {
    const title = getField(row, nameIdx);
    if (!title) return;
    const year = parseYear(getField(row, yearIdx));
    const key = buildKey(title, year);
    if (!index[key]) index[key] = {};
    index[key].w = 1;
    count += 1;
  });

  return count;
};

const renderPopup = async () => {
  const state = await getStorage();

  if (overlayToggle) {
    overlayToggle.checked = state.overlayEnabled ?? true;
  }

  if (tmdbKeyInput) {
    tmdbKeyInput.value = state.tmdbApiKey ?? "";
  }

  if (keyStatus) {
    keyStatus.textContent = state.tmdbApiKey ? "Key saved." : "Not set.";
  }

  if (zipStatus) {
    if (state.letterboxdStats) {
      zipStatus.textContent = `${state.letterboxdStats.ratingsCount} ratings · ${state.letterboxdStats.watchlistCount} watchlist`;
    } else {
      zipStatus.textContent = "No export loaded.";
    }
  }

  if (zipMeta) {
    zipMeta.textContent = state.letterboxdStats
      ? `Last imported: ${state.letterboxdStats.importedAt}`
      : "Last imported: —";
  }
};

overlayToggle?.addEventListener("change", async () => {
  const enabled = overlayToggle.checked;
  await chrome.storage.local.set({ overlayEnabled: enabled });
  log("Overlay toggle updated", { enabled });
});

saveKeyButton?.addEventListener("click", async () => {
  const value = tmdbKeyInput?.value.trim();
  if (!value) {
    await chrome.storage.local.remove("tmdbApiKey");
    if (keyStatus) keyStatus.textContent = "Not set.";
    log("TMDb key cleared");
    return;
  }

  await chrome.storage.local.set({ tmdbApiKey: value });
  if (keyStatus) keyStatus.textContent = "Key saved.";
  log("TMDb key saved");
});

clearCacheButton?.addEventListener("click", async () => {
  await chrome.storage.local.remove("tmdbCache");
  log("TMDb cache cleared");
});

uploadZip?.addEventListener("click", () => {
  zipInput?.click();
});

zipInput?.addEventListener("change", async () => {
  const file = zipInput.files?.[0];
  if (!file) return;

  try {
    const buffer = await file.arrayBuffer();
    const zip = unzipSync(new Uint8Array(buffer));

    const ratingsFile = Object.keys(zip).find((name) => /ratings\\.csv$/i.test(name));
    const watchlistFile = Object.keys(zip).find((name) => /watchlist\\.csv$/i.test(name));

    const index: LetterboxdIndex = {};
    let ratingsCount = 0;
    let watchlistCount = 0;

    if (ratingsFile) {
      const csv = strFromU8(zip[ratingsFile]);
      ratingsCount = parseRatings(csv, index);
    }

    if (watchlistFile) {
      const csv = strFromU8(zip[watchlistFile]);
      watchlistCount = parseWatchlist(csv, index);
    }

    const stats: LetterboxdStats = {
      importedAt: new Date().toLocaleString(),
      ratingsCount,
      watchlistCount
    };

    await chrome.storage.local.set({
      letterboxdIndex: index,
      letterboxdStats: stats,
      lastImportAt: stats.importedAt
    });

    log("Letterboxd ZIP imported", { ratingsCount, watchlistCount });
    await renderPopup();
  } catch (err) {
    log("Letterboxd ZIP import failed", err);
  } finally {
    if (zipInput) zipInput.value = "";
  }
});

renderPopup().catch((err) => {
  log("Popup render failed", err);
});
