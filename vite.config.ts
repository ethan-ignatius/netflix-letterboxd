import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        "content/index": resolve(__dirname, "src/content/index.ts"),
        "background/index": resolve(__dirname, "src/background/index.ts"),
        "popup/index": resolve(__dirname, "src/popup/index.html")
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  }
});
