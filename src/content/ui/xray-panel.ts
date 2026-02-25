import type { XraySceneActor } from "../../shared/types";

const PANEL_ID = "nxl-xray-panel";

function buildPanel(): HTMLElement {
  const host = document.createElement("div");
  host.id = PANEL_ID;
  host.style.cssText = `
    position: fixed;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    width: 280px;
    max-height: 70vh;
    overflow-y: auto;
    z-index: 2147483646;
    pointer-events: auto;
    font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  `;

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host, .panel {
      all: initial;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    .panel {
      background: rgba(0, 0, 0, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      color: #f5f5f5;
    }
    .panel-title {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 12px;
      letter-spacing: 0.02em;
    }
    .actor-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .actor-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .actor-card:last-child {
      border-bottom: none;
    }
    .actor-photo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      background: rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }
    .actor-info {
      flex: 1;
      min-width: 0;
    }
    .actor-name {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }
    .actor-character {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.65);
      margin-top: 2px;
    }
    .actor-confidence {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.45);
      margin-top: 2px;
    }
    .state-message {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      padding: 12px 0;
      text-align: center;
    }
    .state-loading {
      color: rgba(255, 255, 255, 0.5);
    }
  `;

  const panel = document.createElement("div");
  panel.className = "panel";
  panel.innerHTML = '<div class="panel-title">In this scene</div><div class="actor-list" data-list></div>';

  shadow.appendChild(style);
  shadow.appendChild(panel);
  return host;
}

let panelEl: HTMLElement | null = null;

function ensurePanel(): HTMLElement {
  if (!panelEl || !panelEl.isConnected) {
    panelEl = buildPanel();
    document.documentElement.appendChild(panelEl);
  }
  return panelEl;
}

function getListEl(): HTMLElement | null {
  const host = ensurePanel();
  return host.shadowRoot?.querySelector("[data-list]") ?? null;
}

export function showXrayPanel(actors: XraySceneActor[]): void {
  const list = getListEl();
  if (!list) return;
  list.innerHTML = "";
  list.classList.remove("state-loading");

  if (actors.length === 0) {
    list.innerHTML = '<div class="state-message">No faces visible in this frame</div>';
    return;
  }

  for (const actor of actors) {
    const card = document.createElement("div");
    card.className = "actor-card";
    const img = document.createElement("img");
    img.className = "actor-photo";
    img.alt = actor.name;
    if (actor.photoUrl) {
      img.src = actor.photoUrl;
      img.onerror = () => { img.style.display = "none"; };
    } else {
      img.style.display = "none";
    }
    const info = document.createElement("div");
    info.className = "actor-info";
    const nameEl = document.createElement("div");
    nameEl.className = "actor-name";
    nameEl.textContent = actor.name;
    info.appendChild(nameEl);
    if (actor.character) {
      const charEl = document.createElement("div");
      charEl.className = "actor-character";
      charEl.textContent = actor.character;
      info.appendChild(charEl);
    }
    if (actor.confidence > 0 && actor.confidence < 1) {
      const confEl = document.createElement("div");
      confEl.className = "actor-confidence";
      confEl.textContent = `${Math.round(actor.confidence * 100)}% match`;
      info.appendChild(confEl);
    }
    card.appendChild(img);
    card.appendChild(info);
    list.appendChild(card);
  }
}

export function showXrayLoading(): void {
  const list = getListEl();
  if (!list) return;
  list.innerHTML = '<div class="state-message state-loading">Identifying actors…</div>';
}

export function showXrayError(message: string): void {
  const list = getListEl();
  if (!list) return;
  list.innerHTML = `<div class="state-message">${escapeHtml(message)}</div>`;
}

export function hideXrayPanel(): void {
  const el = document.getElementById(PANEL_ID);
  if (el) el.remove();
  panelEl = null;
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
