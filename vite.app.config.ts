import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "src",
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
});
