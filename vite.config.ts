import { defineConfig, loadEnv } from "vite";
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
        "popup/index": resolve(__dirname, "src/popup/index.html"),
        "offscreen/offscreen": resolve(__dirname, "src/offscreen/offscreen.html")
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
  const env = loadEnv(mode, process.cwd(), "");

  if (mode === "content") return contentConfig;
  return {
    ...appConfig,
    define: {
      "import.meta.env.VITE_PROXY_BASE_URL": JSON.stringify(env.VITE_PROXY_BASE_URL ?? "")
    }
  };
});
