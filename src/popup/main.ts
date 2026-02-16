import { getStorage } from "../shared/storage";
import { log } from "../shared/logger";
import { STORAGE_KEYS } from "../shared/constants";
import { buildLetterboxdKey } from "../shared/normalize";
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
const zipError = document.getElementById("zipError") as HTMLDivElement | null;
const zipSuccess = document.getElementById("zipSuccess") as HTMLDivElement | null;
const clearLetterboxd = document.getElementById("clearLetterboxd") as HTMLButtonElement | null;
const helpZip = document.getElementById("helpZip") as HTMLButtonElement | null;

let listenersBound = false;
let isHelpOpen = false;
let helpModalEl: HTMLDivElement | null = null;
let lastFocusedEl: HTMLElement | null = null;

const HELP_URL = "https://letterboxd.com/settings/data/";

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

    const key = buildLetterboxdKey(title, year);
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
    const key = buildLetterboxdKey(title, year);
    if (!index[key]) index[key] = {};
    index[key].w = 1;
    count += 1;
  });

  return count;
};

const resetBanners = () => {
  if (zipError) {
    zipError.hidden = true;
    zipError.textContent = "";
  }
  if (zipSuccess) {
    zipSuccess.hidden = true;
    zipSuccess.textContent = "";
  }
};

const showError = (message: string) => {
  if (!zipError) return;
  zipError.textContent = message;
  zipError.hidden = false;
};

const showSuccess = (message: string) => {
  if (!zipSuccess) return;
  zipSuccess.textContent = message;
  zipSuccess.hidden = false;
};

const closeHelpModal = () => {
  log("HELP_MODAL_CLOSE", { before: isHelpOpen });
  isHelpOpen = false;
  if (helpModalEl) {
    helpModalEl.remove();
    helpModalEl = null;
  }
  document.body.style.overflow = "";
  if (lastFocusedEl) lastFocusedEl.focus();
  log("HELP_MODAL_CLOSE", { after: isHelpOpen });
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isHelpOpen) {
    closeHelpModal();
  }
};

const openHelpModal = () => {
  if (isHelpOpen) return;
  isHelpOpen = true;
  lastFocusedEl = document.activeElement as HTMLElement | null;

  if (helpModalEl) {
    helpModalEl.remove();
  }

  const modal = document.createElement("div");
  modal.className = "modal";

  const card = document.createElement("div");
  card.className = "modal-card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.addEventListener("click", (event) => event.stopPropagation());

  const header = document.createElement("div");
  header.className = "modal-header";

  const title = document.createElement("div");
  title.className = "modal-title";
  title.textContent = "How to get your Letterboxd export ZIP";

  const closeBtn = document.createElement("button");
  closeBtn.className = "link-button";
  closeBtn.type = "button";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", closeHelpModal);

  header.appendChild(title);
  header.appendChild(closeBtn);

  const steps = document.createElement("ol");
  steps.className = "modal-steps";
  [
    "Open Letterboxd and sign in",
    "Go to Settings",
    "Click Data",
    "Export your data",
    "Download the ZIP and upload it here (do not unzip)"
  ].forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    steps.appendChild(li);
  });

  const linkRow = document.createElement("div");
  linkRow.className = "modal-link";

  const code = document.createElement("code");
  code.textContent = HELP_URL;

  const copyBtn = document.createElement("button");
  copyBtn.className = "button secondary";
  copyBtn.type = "button";
  copyBtn.textContent = "Copy link";
  copyBtn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(HELP_URL);
    showSuccess("Copied export link to clipboard.");
  });

  linkRow.appendChild(code);
  linkRow.appendChild(copyBtn);

  const footer = document.createElement("div");
  footer.className = "modal-footer";

  const gotIt = document.createElement("button");
  gotIt.className = "button";
  gotIt.type = "button";
  gotIt.textContent = "Got it";
  gotIt.addEventListener("click", closeHelpModal);

  footer.appendChild(gotIt);

  card.appendChild(header);
  card.appendChild(steps);
  card.appendChild(linkRow);
  card.appendChild(footer);

  modal.appendChild(card);
  modal.addEventListener("click", closeHelpModal);

  document.body.appendChild(modal);
  helpModalEl = modal;
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    closeBtn.focus();
  });

  log("HELP_MODAL_OPEN");
};

const renderPopup = async () => {
  const state = await getStorage();

  if (overlayToggle) {
    overlayToggle.checked = state[STORAGE_KEYS.OVERLAY_ENABLED] ?? true;
  }

  if (tmdbKeyInput) {
    tmdbKeyInput.value = state[STORAGE_KEYS.TMDB_API_KEY] ?? "";
  }

  if (keyStatus) {
    keyStatus.textContent = state[STORAGE_KEYS.TMDB_API_KEY] ? "Key saved." : "Not set.";
  }

  const stats = state[STORAGE_KEYS.LETTERBOXD_STATS];
  if (zipStatus) {
    if (stats) {
      zipStatus.textContent = `${stats.ratingsCount} ratings • ${stats.watchlistCount} watchlist`;
    } else {
      zipStatus.textContent = "No Letterboxd data imported yet.";
    }
  }

  if (zipMeta) {
    zipMeta.textContent = stats
      ? `Last imported: ${stats.importedAt}`
      : "Import your export ZIP to enable watchlist + rating badges and match %.";
  }
};

const bindListeners = () => {
  if (listenersBound) return;
  listenersBound = true;

  overlayToggle?.addEventListener("change", async () => {
    const enabled = overlayToggle.checked;
    await chrome.storage.local.set({ [STORAGE_KEYS.OVERLAY_ENABLED]: enabled });
    log("Overlay toggle updated", { enabled });
  });

  saveKeyButton?.addEventListener("click", async () => {
    const value = tmdbKeyInput?.value.trim();
    if (!value) {
      await chrome.storage.local.remove(STORAGE_KEYS.TMDB_API_KEY);
      if (keyStatus) keyStatus.textContent = "Not set.";
      log("TMDb key cleared");
      return;
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.TMDB_API_KEY]: value });
    if (keyStatus) keyStatus.textContent = "Key saved.";
    log("TMDb key saved");
  });

  clearCacheButton?.addEventListener("click", async () => {
    await chrome.storage.local.remove(STORAGE_KEYS.TMDB_CACHE);
    log("TMDb cache cleared");
  });

  uploadZip?.addEventListener("click", () => {
    zipInput?.click();
  });

  helpZip?.addEventListener("click", openHelpModal);

  window.addEventListener("keydown", handleEscape);

  zipInput?.addEventListener("change", async () => {
    const file = zipInput.files?.[0];
    if (!file) return;

    try {
      resetBanners();
      const buffer = await file.arrayBuffer();
      const zip = unzipSync(new Uint8Array(buffer));

      const entries = Object.keys(zip).filter(
        (name) => !name.startsWith("__MACOSX") && !/\/\./.test(name)
      );
      log("ZIP entries", entries);

      const ratingsFile = entries.find((name) => /ratings\.csv$/i.test(name));
      const watchlistFile = entries.find((name) => /watchlist\.csv$/i.test(name));
      log("Detected ratings.csv", ratingsFile);
      log("Detected watchlist.csv", watchlistFile);

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

      log("Parsed counts", { ratingsCount, watchlistCount });

      if (!ratingsFile || !watchlistFile) {
        showError(
          "Couldn’t find ratings.csv/watchlist.csv in this ZIP. Make sure you uploaded the official Letterboxd export ZIP (don’t unzip it)."
        );
        return;
      }

      if ((ratingsFile && ratingsCount === 0) || (watchlistFile && watchlistCount === 0)) {
        showError(
          "Found the file but parsed 0 rows. Please re-export from Letterboxd and try again."
        );
        return;
      }

      const stats: LetterboxdStats = {
        importedAt: new Date().toLocaleString(),
        ratingsCount,
        watchlistCount
      };

      await chrome.storage.local.set({
        [STORAGE_KEYS.LETTERBOXD_INDEX]: index,
        [STORAGE_KEYS.LETTERBOXD_STATS]: stats,
        [STORAGE_KEYS.LAST_IMPORT_AT]: stats.importedAt
      });

      log("Letterboxd ZIP imported", { ratingsCount, watchlistCount });
      showSuccess(`Imported ${ratingsCount} ratings and ${watchlistCount} watchlist items.`);
      await renderPopup();
    } catch (err) {
      log("Letterboxd ZIP import failed", err);
      showError("Import failed. Please re-export from Letterboxd and try again.");
    } finally {
      if (zipInput) zipInput.value = "";
    }
  });

  clearLetterboxd?.addEventListener("click", async () => {
    await chrome.storage.local.remove([
      STORAGE_KEYS.LETTERBOXD_INDEX,
      STORAGE_KEYS.LETTERBOXD_STATS,
      STORAGE_KEYS.LAST_IMPORT_AT
    ]);
    resetBanners();
    showSuccess("Cleared Letterboxd data.");
    await renderPopup();
  });
};

bindListeners();
renderPopup().catch((err) => {
  log("Popup render failed", err);
});
