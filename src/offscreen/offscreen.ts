/**
 * Offscreen document for X-Ray: captures tab stream, runs face detection, returns face crops.
 * Communicates with background via chrome.runtime.connect.
 */

const CAPTURE_MAX_WIDTH = 1280;
const CAPTURE_MAX_HEIGHT = 720;
const FACE_MIN_CONFIDENCE = 0.5;
const MODEL_BASE_CDN = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model";

let modelsLoaded = false;
let video: HTMLVideoElement | null = null;
let canvas: HTMLCanvasElement | null = null;

function getModelsBase(): string {
  try {
    return chrome?.runtime?.getURL?.("models/") ?? MODEL_BASE_CDN;
  } catch {
    return MODEL_BASE_CDN;
  }
}

async function loadModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  // X-Ray temporarily disabled: mark models as loaded without importing anything.
  modelsLoaded = true;
  return true;
}

function createVideoAndCanvas(): void {
  if (video && canvas) return;
  video = document.createElement("video");
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.width = CAPTURE_MAX_WIDTH;
  video.height = CAPTURE_MAX_HEIGHT;
  canvas = document.createElement("canvas");
  canvas.width = CAPTURE_MAX_WIDTH;
  canvas.height = CAPTURE_MAX_HEIGHT;
}

async function captureFrameFromStream(stream: MediaStream): Promise<ImageData | null> {
  createVideoAndCanvas();
  if (!video || !canvas) return null;
  video.srcObject = stream;
  try {
    await video.play();
  } catch {
    return null;
  }
  await new Promise<void>((resolve, reject) => {
    const onLoaded = () => {
      video?.removeEventListener("loadeddata", onLoaded);
      video?.removeEventListener("error", onError);
      resolve();
    };
    const onError = () => {
      video?.removeEventListener("loadeddata", onLoaded);
      video?.removeEventListener("error", onError);
      reject(new Error("Video load error"));
    };
    video.addEventListener("loadeddata", onLoaded, { once: true });
    video.addEventListener("error", onError, { once: true });
    setTimeout(() => resolve(), 500);
  });

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const w = Math.min(video.videoWidth, CAPTURE_MAX_WIDTH);
  const h = Math.min(video.videoHeight, CAPTURE_MAX_HEIGHT);
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(video, 0, 0, w, h);
  try {
    return ctx.getImageData(0, 0, w, h);
  } catch {
    return null;
  }
}

async function captureFrameFromStreamId(streamId: string): Promise<ImageData | null> {
  createVideoAndCanvas();
  if (!video) return null;
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId
      } as unknown as MediaTrackConstraints
    }
  });
  try {
    return await captureFrameFromStream(stream);
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}

type FaceCrop = { base64: string; box: { x: number; y: number; width: number; height: number } };

async function detectAndCropFaces(
  source: HTMLCanvasElement | HTMLVideoElement
): Promise<FaceCrop[]> {
  // X-Ray temporarily disabled: skip detection.
  void source;
  return [];
}

async function processStreamId(streamId: string): Promise<{ faces: FaceCrop[]; error?: string }> {
  const loaded = await loadModels();
  if (!loaded) {
    return { faces: [], error: "Models failed to load" };
  }

  let imageData: ImageData | null = null;
  try {
    imageData = await captureFrameFromStreamId(streamId);
  } catch (e) {
    return { faces: [], error: (e as Error).message };
  }

  if (!imageData || !canvas) return { faces: [], error: "No frame" };

  const ctx = canvas.getContext("2d");
  if (!ctx) return { faces: [] };
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  const faces = await detectAndCropFaces(canvas);
  return { faces };
}

function main(): void {
  const port = chrome.runtime.connect({ name: "xray-offscreen" });

  port.onMessage.addListener(
    async (msg: { type: string; streamId?: string }) => {
      if (msg.type !== "PROCESS_STREAM_ID" || !msg.streamId) return;
      try {
        const result = await processStreamId(msg.streamId);
        port.postMessage({ type: "FRAME_PROCESSED", ...result });
      } catch (e) {
        port.postMessage({
          type: "FRAME_PROCESSED",
          faces: [],
          error: (e as Error).message
        });
      }
    }
  );

  port.onDisconnect.addListener(() => {
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    }
  });
}

main();
