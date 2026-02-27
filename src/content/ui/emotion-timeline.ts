import type { ReactionBucket, ReactionTimeline, ReactionType } from "../../shared/types";
import { requestReactionTimeline } from "../netflix/reactions";
import { log } from "../../shared/logger";

const TIMELINE_HOST_ID = "nxlb-reaction-timeline";
const GRAPH_MAX_HEIGHT = 40; // px – max graph height like YouTube's "most replayed"

// --- Emoji map for tooltips ---

const REACTION_EMOJI: Record<ReactionType, string> = {
  laugh: "\u{1F602}",
  smile: "\u{1F60A}",
  shock: "\u{1F631}",
  sad: "\u{1F622}",
  angry: "\u{1F621}",
  scared: "\u{1F628}",
  bored: "\u{1F634}",
  neutral: "\u{1F642}"
};

// --- Emotion color groups ---

const POSITIVE_TYPES: ReactionType[] = ["laugh", "smile", "shock"];
const ANGRY_TYPES: ReactionType[] = ["angry", "scared"];
const SAD_TYPES: ReactionType[] = ["sad", "bored"];

// Base colors: [R, G, B]
const COLOR_GREEN: [number, number, number] = [76, 217, 100];
const COLOR_RED: [number, number, number] = [255, 69, 58];
const COLOR_BLUE: [number, number, number] = [90, 130, 230];

type EmotionWeights = { green: number; red: number; blue: number };
type GraphPoint = { x: number; y: number; color: string; bucket: ReactionBucket };

// --- Color computation ---

const computeEmotionWeights = (bucket: ReactionBucket): EmotionWeights => {
  if (bucket.count === 0) return { green: 0, red: 0, blue: 0 };

  const greenCount = POSITIVE_TYPES.reduce((s, t) => s + bucket.reactions[t], 0);
  const redCount = ANGRY_TYPES.reduce((s, t) => s + bucket.reactions[t], 0);
  const blueCount = SAD_TYPES.reduce((s, t) => s + bucket.reactions[t], 0);
  const colorTotal = greenCount + redCount + blueCount;

  if (colorTotal === 0) return { green: 0.33, red: 0.33, blue: 0.33 };

  return {
    green: greenCount / colorTotal,
    red: redCount / colorTotal,
    blue: blueCount / colorTotal
  };
};

const blendEmotionColor = (weights: EmotionWeights, alpha: number): string => {
  const r = Math.round(
    weights.green * COLOR_GREEN[0] + weights.red * COLOR_RED[0] + weights.blue * COLOR_BLUE[0]
  );
  const g = Math.round(
    weights.green * COLOR_GREEN[1] + weights.red * COLOR_RED[1] + weights.blue * COLOR_BLUE[1]
  );
  const b = Math.round(
    weights.green * COLOR_GREEN[2] + weights.red * COLOR_RED[2] + weights.blue * COLOR_BLUE[2]
  );
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0.2, Math.min(0.85, alpha))})`;
};

// --- Catmull-Rom spline → cubic Bezier conversion ---

type Pt = [number, number];

const catmullRomToBezier = (
  p0: Pt, p1: Pt, p2: Pt, p3: Pt, tension = 6
): { cp1: Pt; cp2: Pt } => ({
  cp1: [p1[0] + (p2[0] - p0[0]) / tension, p1[1] + (p2[1] - p0[1]) / tension],
  cp2: [p2[0] - (p3[0] - p1[0]) / tension, p2[1] - (p3[1] - p1[1]) / tension]
});

// --- Graph point building ---

const buildGraphPoints = (
  buckets: ReactionBucket[],
  canvasW: number,
  maxIntensity: number
): GraphPoint[] => {
  const bucketW = canvasW / buckets.length;
  return buckets.map((bucket, i) => {
    const x = (i + 0.5) * bucketW;
    const norm = maxIntensity > 0 ? bucket.intensity / maxIntensity : 0;
    const y = bucket.count > 0 ? norm * GRAPH_MAX_HEIGHT : 0;
    const weights = computeEmotionWeights(bucket);
    const color = blendEmotionColor(weights, norm);
    return { x, y, color, bucket };
  });
};

// --- Canvas drawing ---

const buildHorizontalGradient = (
  ctx: CanvasRenderingContext2D,
  points: GraphPoint[],
  canvasW: number
): CanvasGradient => {
  const grad = ctx.createLinearGradient(0, 0, canvasW, 0);
  for (const pt of points) {
    const stop = Math.max(0, Math.min(1, pt.x / canvasW));
    grad.addColorStop(stop, pt.color);
  }
  return grad;
};

const traceCurvePath = (
  ctx: CanvasRenderingContext2D,
  points: GraphPoint[],
  h: number
) => {
  const toY = (py: number) => h - py;

  ctx.moveTo(points[0].x, toY(points[0].y));

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const { cp1, cp2 } = catmullRomToBezier(
      [p0.x, toY(p0.y)],
      [p1.x, toY(p1.y)],
      [p2.x, toY(p2.y)],
      [p3.x, toY(p3.y)]
    );

    ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], p2.x, toY(p2.y));
  }
};

const drawGraph = (
  ctx: CanvasRenderingContext2D,
  points: GraphPoint[],
  w: number,
  h: number
) => {
  ctx.clearRect(0, 0, w, h);
  if (points.length === 0) return;

  // --- Filled area under the curve ---
  ctx.beginPath();
  ctx.moveTo(0, h); // bottom-left
  ctx.lineTo(points[0].x, h); // move to first point's x at bottom
  traceCurvePath(ctx, points, h);
  ctx.lineTo(points[points.length - 1].x, h); // back down to bottom
  ctx.lineTo(0, h); // close
  ctx.closePath();

  ctx.fillStyle = buildHorizontalGradient(ctx, points, w);
  ctx.fill();

  // --- Thin stroke on the top edge for definition ---
  ctx.beginPath();
  traceCurvePath(ctx, points, h);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
};

// --- Tooltip text ---

const buildTooltipText = (bucket: ReactionBucket): string => {
  if (bucket.count === 0) return "";
  const sorted = (Object.entries(bucket.reactions) as [ReactionType, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return "";
  return sorted.map(([type, count]) => `${REACTION_EMOJI[type]} ${count}`).join("  ");
};

// --- Hover interaction (shared mutable state pattern) ---

type HoverState = {
  points: GraphPoint[];
  ctx: CanvasRenderingContext2D;
  logicalW: number;
  logicalH: number;
};

let hoverState: HoverState | null = null;

const bindHoverListeners = (canvas: HTMLCanvasElement, tooltip: HTMLDivElement) => {
  // Only bind once per canvas element (tracked via data attribute)
  if (canvas.dataset.hoverBound === "1") return;
  canvas.dataset.hoverBound = "1";

  let lastIndex = -1;

  canvas.addEventListener("mousemove", (e) => {
    if (!hoverState) return;
    const { points, ctx, logicalW, logicalH } = hoverState;
    if (points.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const bucketW = logicalW / points.length;
    const index = Math.min(points.length - 1, Math.max(0, Math.floor(mouseX / bucketW)));

    if (index === lastIndex) return;
    lastIndex = index;

    const pt = points[index];
    const text = buildTooltipText(pt.bucket);

    if (!text) {
      tooltip.style.display = "none";
      drawGraph(ctx, points, logicalW, logicalH);
      return;
    }

    tooltip.textContent = text;
    tooltip.style.display = "block";
    tooltip.style.left = `${pt.x}px`;

    // Redraw with vertical highlight line
    drawGraph(ctx, points, logicalW, logicalH);
    ctx.beginPath();
    ctx.moveTo(pt.x, 0);
    ctx.lineTo(pt.x, logicalH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  canvas.addEventListener("mouseleave", () => {
    if (!hoverState) return;
    const { points, ctx, logicalW, logicalH } = hoverState;
    tooltip.style.display = "none";
    lastIndex = -1;
    drawGraph(ctx, points, logicalW, logicalH);
  });
};

// --- DOM structure ---

/** Locate Netflix's scrubber / progress bar so we can align pixel-perfectly. */
const findScrubberBar = (): HTMLElement | null => {
  const selectors = [
    "[data-uia='timeline']",
    "[class*='scrubber']",
    "[role='slider'][aria-label]",
    "[class*='Slider']",
    "[class*='progress-bar']",
    "[class*='PlayerTimeline']"
  ];
  for (const sel of selectors) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.width > 100) return el;
    }
  }
  return null;
};

/** Check if Netflix is currently playing an ad. */
const isAdPlaying = (): boolean =>
  !!document.querySelector(
    "[data-uia*='ad-break'], [data-uia*='interstitial'], [class*='AdBreak'], [class*='interstitial']"
  );

const createTimelineHost = (): HTMLDivElement => {
  const host = document.createElement("div");
  host.id = TIMELINE_HOST_ID;
  host.style.position = "fixed";
  host.style.zIndex = "2147483645";
  host.style.pointerEvents = "auto";
  host.style.height = `${GRAPH_MAX_HEIGHT}px`;

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: auto;
    }
    .graph-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .graph-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 0;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.92);
      color: #f5f5f5;
      font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
      display: none;
    }
  `;

  const container = document.createElement("div");
  container.className = "graph-container";
  container.dataset.field = "graph";

  const canvas = document.createElement("canvas");
  canvas.className = "graph-canvas";

  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";

  container.appendChild(canvas);
  container.appendChild(tooltip);
  shadow.appendChild(style);
  shadow.appendChild(container);
  return host;
};

// --- State ---

let timelineHost: HTMLDivElement | null = null;

/** Hide the timeline graph (call when video plays or navigates away). */
export const hideEmotionTimeline = () => {
  if (timelineHost) {
    timelineHost.style.display = "none";
  }
};

export const mountEmotionTimeline = async (): Promise<ReactionTimeline | null> => {
  if (!window.location.pathname.includes("/watch/")) return null;
  if (isAdPlaying()) return null;

  const scrubber = findScrubberBar();
  if (!scrubber) {
    log("EMOTION_TIMELINE_NO_SCRUBBER");
    return null;
  }

  const scrubberRect = scrubber.getBoundingClientRect();

  if (!timelineHost || !timelineHost.isConnected) {
    timelineHost = createTimelineHost();
    document.body.appendChild(timelineHost);
  }

  // Re-align every call (scrubber position changes when controls show/hide)
  timelineHost.style.left = `${scrubberRect.left}px`;
  timelineHost.style.width = `${scrubberRect.width}px`;
  timelineHost.style.top = `${scrubberRect.top - GRAPH_MAX_HEIGHT}px`;
  timelineHost.style.height = `${GRAPH_MAX_HEIGHT}px`;
  timelineHost.style.display = "block";

  const video = document.querySelector<HTMLVideoElement>("video");
  const match = window.location.pathname.match(/\/watch\/(\d+)/);
  const netflixId = match?.[1] ?? null;
  if (!video || !netflixId) return null;

  const durationSec = video.duration || 0;
  if (!durationSec || !Number.isFinite(durationSec)) return null;

  const timeline = await requestReactionTimeline(netflixId, durationSec);
  if (!timeline) return null;

  const graphContainer = timelineHost.shadowRoot?.querySelector<HTMLDivElement>(
    "[data-field='graph']"
  );
  if (!graphContainer) return timeline;

  const canvas = graphContainer.querySelector<HTMLCanvasElement>(".graph-canvas");
  const tooltip = graphContainer.querySelector<HTMLDivElement>(".tooltip");
  if (!canvas || !tooltip) return timeline;

  // Size canvas for HiDPI
  const logicalW = scrubberRect.width;
  const logicalH = GRAPH_MAX_HEIGHT;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = logicalW * dpr;
  canvas.height = logicalH * dpr;
  canvas.style.width = `${logicalW}px`;
  canvas.style.height = `${logicalH}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return timeline;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Build data points
  const maxIntensity = timeline.buckets.reduce((max, b) => Math.max(max, b.intensity), 0);
  const points = buildGraphPoints(timeline.buckets, logicalW, maxIntensity);

  // Draw the line graph
  drawGraph(ctx, points, logicalW, logicalH);

  // Update shared hover state (listeners read from this on each event)
  hoverState = { points, ctx, logicalW, logicalH };

  // Bind hover listeners (only attaches once per canvas element)
  bindHoverListeners(canvas, tooltip);

  return timeline;
};
