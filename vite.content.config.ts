import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "src",
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
});
