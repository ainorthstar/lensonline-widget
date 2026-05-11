import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IIFE single-file bundle for embedding via <script src>.
// CSS is inlined into the JS so a single file = a single script tag.
export default defineConfig({
  plugins: [react()],
  // IIFE bundles don't get vite's automatic process.env.NODE_ENV replacement.
  // React + assistant-ui reference process.env.NODE_ENV at module top, so
  // without these defines the bundle throws "process is not defined" before
  // the mount IIFE runs. globalThis covers libraries that reference `global`.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": "{}",
    global: "globalThis",
  },
  build: {
    lib: {
      entry: "src/mount.tsx",
      name: "LensOnlineWidget",
      formats: ["iife"],
      fileName: () => "widget.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "widget.[ext]",
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false,
    sourcemap: false,
    minify: "esbuild",
  },
});
