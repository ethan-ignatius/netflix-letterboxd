import type { ReactionTimeline } from "../../shared/types";
import { requestReactionTimeline } from "../netflix/reactions";
import { log } from "../../shared/logger";

const TIMELINE_HOST_ID = "nxlb-reaction-timeline";
const EMOTION_PANEL_ID = "nxlb-emotion-panel";

const createTimelineHost = (): HTMLDivElement => {
  const host = document.createElement("div");
  host.id = TIMELINE_HOST_ID;
  host.style.position = "absolute";
  host.style.left = "0";
  host.style.right = "0";
  host.style.bottom = "0";
  host.style.height = "4px";
  host.style.pointerEvents = "none";

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .bar {
      display: flex;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .segment {
      flex: 1 1 auto;
      height: 100%;
      background: rgba(255, 255, 255, 0.0);
      transition: background-color 120ms ease, opacity 120ms ease;
    }
  `;
  const bar = document.createElement("div");
  bar.className = "bar";
  bar.dataset.field = "segments";
  shadow.appendChild(style);
  shadow.appendChild(bar);
  return host;
};

const createEmotionPanelHost = (): HTMLDivElement => {
  const host = document.createElement("div");
  host.id = EMOTION_PANEL_ID;
  host.style.position = "absolute";
  host.style.right = "16px";
  host.style.bottom = "60px";
  host.style.width = "220px";
  host.style.height = "160px";
  host.style.zIndex = "2147483646";

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    .panel {
      background: rgba(0, 0, 0, 0.88);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      padding: 10px 12px;
      color: #f5f5f5;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-rows: auto 1fr;
      gap: 6px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: rgba(255,255,255,0.85);
    }
    .axes {
      position: relative;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(255,255,255,0.06), transparent);
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.12);
      overflow: hidden;
    }
    .axes::before,
    .axes::after {
      content: "";
      position: absolute;
      background: rgba(255,255,255,0.18);
    }
    .axes::before {
      left: 50%;
      top: 0;
      bottom: 0;
      width: 1px;
    }
    .axes::after {
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
    }
    .point {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #46d369;
      box-shadow: 0 0 8px rgba(70,211,105,0.8);
      transform: translate(-50%, -50%);
    }
  `;

  const panel = document.createElement("div");
  panel.className = "panel";

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `<span>Emotional map</span><span style="opacity:0.7">valence × arousal</span>`;

  const axes = document.createElement("div");
  axes.className = "axes";
  axes.dataset.field = "axes";

  const point = document.createElement("div");
  point.className = "point";
  point.dataset.field = "pointer";
  point.style.left = "50%";
  point.style.top = "50%";

  axes.appendChild(point);
  panel.appendChild(header);
  panel.appendChild(axes);
  shadow.appendChild(style);
  shadow.appendChild(panel);
  return host;
};

const mapValenceToColor = (valence: number, intensity: number): string => {
  // Simple mapping: negative = reddish, neutral = blue/gray, positive = green.
  const v = Math.max(-1, Math.min(1, valence));
  const t = (v + 1) / 2; // 0..1
  const green = 120;
  const red = 0;
  const hue = red * (1 - t) + green * t;
  const alpha = Math.max(0.1, Math.min(0.8, intensity));
  return `hsla(${hue}, 70%, 55%, ${alpha})`;
};

export const mountEmotionTimeline = async (
  root: HTMLElement
): Promise<ReactionTimeline | null> => {
  const scrubber = root.querySelector<HTMLElement>("[data-uia*='scrubber'], [role='slider']");
  if (!scrubber) {
    log("EMOTION_TIMELINE_NO_SCRUBBER");
    return null;
  }

  if (!scrubber.style.position || scrubber.style.position === "static") {
    scrubber.style.position = "relative";
  }

  let host = scrubber.querySelector<HTMLDivElement>(`#${TIMELINE_HOST_ID}`);
  if (!host) {
    host = createTimelineHost();
    scrubber.appendChild(host);
  }

  const video = document.querySelector<HTMLVideoElement>("video");
  const match = window.location.pathname.match(/\/watch\/(\d+)/);
  const netflixId = match?.[1] ?? null;
  if (!video || !netflixId) return null;

  const durationSec = video.duration || 0;
  if (!durationSec || !Number.isFinite(durationSec)) return null;

  const timeline = await requestReactionTimeline(netflixId, durationSec);
  if (!timeline) return null;

  const bar = host.shadowRoot?.querySelector<HTMLDivElement>("[data-field='segments']");
  if (!bar) return timeline;
  bar.innerHTML = "";

  const total = timeline.buckets.length || 1;
  timeline.buckets.forEach((bucket) => {
    const seg = document.createElement("div");
    seg.className = "segment";
    const color =
      bucket.count > 0
        ? mapValenceToColor(bucket.meanValence, bucket.intensity)
        : "rgba(255,255,255,0.0)";
    seg.style.backgroundColor = color;
    seg.style.opacity = bucket.count > 0 ? "1" : "0.0";
    seg.style.flexBasis = `${100 / total}%`;
    bar.appendChild(seg);
  });
  return timeline;
};

export const mountEmotionPanel = (root: HTMLElement): HTMLDivElement | null => {
  const container =
    document.querySelector<HTMLElement>("[data-uia*='video-player']") ??
    document.body;
  if (!container) return null;

  let host = container.querySelector<HTMLDivElement>(`#${EMOTION_PANEL_ID}`);
  if (!host) {
    host = createEmotionPanelHost();
    container.appendChild(host);
  }
  return host;
};

export const updateEmotionPointer = (host: HTMLDivElement | null, timeline: ReactionTimeline) => {
  if (!host) return;
  const video = document.querySelector<HTMLVideoElement>("video");
  if (!video || !Number.isFinite(video.currentTime)) return;
  const t = video.currentTime;
  const bucketSize = timeline.bucketSizeSec;
  const index = Math.min(
    timeline.buckets.length - 1,
    Math.max(0, Math.floor(t / bucketSize))
  );
  const bucket = timeline.buckets[index];
  const pointer = host.shadowRoot?.querySelector<HTMLDivElement>("[data-field='pointer']");
  const axes = host.shadowRoot?.querySelector<HTMLDivElement>("[data-field='axes']");
  if (!pointer || !axes) return;

  const rect = axes.getBoundingClientRect();
  const v = Math.max(-1, Math.min(1, bucket.meanValence || 0));
  const a = Math.max(0, Math.min(1, bucket.meanArousal || 0));
  const x = ((v + 1) / 2) * rect.width;
  const y = (1 - a) * rect.height;

  pointer.style.left = `${(x / rect.width) * 100}%`;
  pointer.style.top = `${(y / rect.height) * 100}%`;
};

