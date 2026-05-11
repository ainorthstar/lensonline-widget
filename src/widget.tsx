/**
 * LensOnline chat widget — assistant-ui based.
 *
 * For the Framer test phase the widget uses a LocalRuntime with canned
 * responses, so no backend is required to see the UI live. When the
 * production ADK agent runtime is deployed, swap useLocalRuntime for
 * the real ADK runtime adapter — the rest of the component stays the
 * same.
 */

import {
  AssistantRuntimeProvider,
  type ChatModelAdapter,
  useLocalRuntime,
} from "@assistant-ui/react";
import { Thread } from "@assistant-ui/react-ui";
import { useState } from "react";
// Use the CSS that ships with react-ui itself — it defines the --aui-* vars
// on :root that the Thread component depends on. The standalone
// @assistant-ui/styles package is a newer (tailwind-4) design system and is
// not compatible with react-ui@0.2.1's Thread.
import "@assistant-ui/react-ui/styles/index.css";
import "@assistant-ui/react-ui/styles/modal.css";

const MOCK_RESPONSES = [
  "Hi! Ich bin der LensOnline-assistent. Ich kann dir bei bestellungen, produkt-empfehlungen und kontakt zu unserem optiker-team helfen. Was kann ich für dich tun?",
  "Klar, das schaue ich gerne nach. Hast du deine bestellnummer oder die e-mail, mit der du bestellt hast?",
  "Das hängt davon ab, welche kontaktlinsen du aktuell trägst. Trägst du tageslinsen, oder monats-/zwei-wochen-linsen?",
  "Note: this is a demo widget showing the LensOnline customer chat. When connected to the real backend, responses come from our deployed AI agent.",
];

/**
 * Mock chat-model adapter — returns canned responses round-robin so the
 * widget feels interactive on the Framer demo page without a backend.
 */
const mockAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    const turn = messages.filter((m) => m.role === "user").length;
    const text = MOCK_RESPONSES[(turn - 1) % MOCK_RESPONSES.length] ?? "...";

    // Simulate a small thinking delay + word-by-word streaming
    await new Promise((r) => setTimeout(r, 500));
    if (abortSignal.aborted) return;

    const words = text.split(" ");
    let current = "";
    for (const word of words) {
      current += (current ? " " : "") + word;
      await new Promise((r) => setTimeout(r, 35));
      if (abortSignal.aborted) return;
      yield {
        content: [{ type: "text" as const, text: current }],
      };
    }
  },
};

function ChatPanel({ onClose }: { onClose: () => void }) {
  const runtime = useLocalRuntime(mockAdapter);

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
