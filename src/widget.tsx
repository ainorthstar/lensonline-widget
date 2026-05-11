/**
 * LensOnline chat widget — assistant-ui based.
 *
 * Talks to the deployed LensOnline bot via the lensonline-chat-proxy on
 * Cloud Run, which forwards to the Vertex AI Agent Runtime A2A endpoint.
 * The proxy adds the Google OAuth bearer token and enforces an origin
 * allow-list + rate limit, so the browser never sees credentials.
 */

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useA2ARuntime } from "@assistant-ui/react-a2a";
import { Thread } from "@assistant-ui/react-ui";
import { useState } from "react";
import "@assistant-ui/react-ui/styles/index.css";
import "@assistant-ui/react-ui/styles/modal.css";

const PROXY_BASE_URL =
  "https://lensonline-chat-proxy-4739299408.europe-west1.run.app/a2a";

function ChatPanel({ onClose }: { onClose: () => void }) {
  const runtime = useA2ARuntime({ baseUrl: PROXY_BASE_URL });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div
        style={{
          position: "fixed",
          bottom: "96px",
          right: "24px",
          width: "min(380px, calc(100vw - 32px))",
          height: "min(600px, calc(100vh - 140px))",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.18)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          zIndex: 2147483646,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#0066cc",
            color: "white",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: "15px" }}>
              LensOnline assistent
            </div>
            <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "2px" }}>
              Trained by our opticians
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chat"
            style={{
              background: "transparent",
              border: 0,
              color: "white",
              cursor: "pointer",
              padding: "4px",
              fontSize: "20px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        {/* assistant-ui Thread */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}

function FloatingBubble({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open LensOnline chat"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "#0066cc",
        color: "white",
        border: 0,
        cursor: "pointer",
        boxShadow: "0 6px 20px rgba(0, 102, 204, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        zIndex: 2147483647,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

export function LensOnlineWidget() {
  const [open, setOpen] = useState(false);

  return open ? (
    <ChatPanel onClose={() => setOpen(false)} />
  ) : (
    <FloatingBubble onClick={() => setOpen(true)} />
  );
}
