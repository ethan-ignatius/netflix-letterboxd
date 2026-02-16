import { defineConfig } from "vite";
import { resolve } from "node:path";

const rootDir = "src";

const contentConfig = {
  root: rootDir,
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, "src/content/index.ts"),
      output: {
        format: "iife",
        entryFileNames: "content/index.js",
        inlineDynamicImports: true
      }
    }
  }
};

const appConfig = {
  root: rootDir,
  build: {
    outDir: "../dist",
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        "background/index": resolve(__dirname, "src/background/index.ts"),
        "popup/index": resolve(__dirname, "src/popup/index.html")
      },
      output: {
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "assets/[name]-[hash].js"
      }
    }
  }
};

export default defineConfig(({ mode }) => {
  if (mode === "content") return contentConfig;
  return appConfig;
});
