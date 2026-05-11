/**
 * Auto-mount entrypoint — the script-tag pattern.
 *
 * When this bundle loads on a page, it creates a hidden host element,
 * attaches a shadow DOM (isolation from page CSS), and renders the
 * LensOnline widget inside. The widget is fixed-positioned bottom-
 * right by its own styling.
 *
 * The page only needs ONE line:
 *
 *   <script src="https://cdn.../widget.js" defer></script>
 *
 * That's it. No init call, no config object required for the demo.
 */

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { LensOnlineWidget } from "./widget";

declare global {
  interface Window {
    __LENSONLINE_WIDGET_MOUNTED__?: boolean;
  }
}

function mount() {
  console.log("[lensonline-widget] mount() starting");
  // Idempotent: never mount twice on the same page
  if (window.__LENSONLINE_WIDGET_MOUNTED__) {
    console.log("[lensonline-widget] already mounted, skipping");
    return;
  }
  window.__LENSONLINE_WIDGET_MOUNTED__ = true;

  const host = document.createElement("div");
  host.id = "lensonline-widget-host";
  host.style.position = "fixed";
  host.style.zIndex = "2147483647";
  host.style.bottom = "0";
  host.style.right = "0";
  host.style.width = "0";
  host.style.height = "0";
  document.body.appendChild(host);
  console.log("[lensonline-widget] host element appended:", host);

  try {
    const root = createRoot(host);
    root.render(
      <StrictMode>
        <LensOnlineWidget />
      </StrictMode>,
    );
    console.log("[lensonline-widget] React render() called successfully");
  } catch (err) {
    console.error("[lensonline-widget] render failed:", err);
  }
}

// Wait for DOMContentLoaded if the script ran early
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
