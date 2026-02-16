import { DEBUG } from "./constants";

export { DEBUG };

export const log = (...args: unknown[]) => {
  if (!DEBUG) return;
  console.log("[Netflix+Letterboxd]", ...args);
};

export const warn = (...args: unknown[]) => {
  if (!DEBUG) return;
  console.warn("[Netflix+Letterboxd]", ...args);
};

export const error = (...args: unknown[]) => {
  if (!DEBUG) return;
  console.error("[Netflix+Letterboxd]", ...args);
};
