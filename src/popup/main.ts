import { getStorage, clearStorage } from "../shared/storage";
import { log } from "../shared/log";

const statusEl = document.getElementById("status") as HTMLDivElement | null;
const clearButton = document.getElementById("clear") as HTMLButtonElement | null;

const renderStatus = async () => {
  if (!statusEl) return;

  const state = await getStorage();
  if (!state.letterboxdExport) {
    statusEl.textContent = "No Letterboxd export loaded.";
    return;
  }

  statusEl.textContent = `Loaded ${state.letterboxdExport.films.length} films.`;
};

clearButton?.addEventListener("click", async () => {
  await clearStorage();
  await renderStatus();
  log("Export cleared via popup");
});

renderStatus().catch((err) => {
  if (statusEl) statusEl.textContent = "Failed to read storage.";
  log("Popup render failed", err);
});
