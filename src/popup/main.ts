import { getStorage } from "../shared/storage";
import { log } from "../shared/log";

const overlayToggle = document.getElementById("overlayToggle") as HTMLInputElement | null;
const tmdbKeyInput = document.getElementById("tmdbKey") as HTMLInputElement | null;
const saveKeyButton = document.getElementById("saveKey") as HTMLButtonElement | null;
const clearCacheButton = document.getElementById("clearCache") as HTMLButtonElement | null;
const keyStatus = document.getElementById("keyStatus") as HTMLDivElement | null;
const zipStatus = document.getElementById("zipStatus") as HTMLDivElement | null;
const uploadZip = document.getElementById("uploadZip") as HTMLButtonElement | null;

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
    zipStatus.textContent = state.letterboxdExport
      ? `Loaded ${state.letterboxdExport.films.length} films.`
      : "No export loaded.";
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
  log("Upload ZIP clicked");
});

renderPopup().catch((err) => {
  log("Popup render failed", err);
});
