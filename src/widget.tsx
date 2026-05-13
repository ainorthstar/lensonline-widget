/**
 * LensOnline chat widget — assistant-ui front, Sunshine Conversations transport.
 *
 * Architecture (Option C):
 *   [this widget on framer/lensonline.be]
 *      ↑↓ via Smooch.js (Sunshine Web SDK in headless mode)
 *   [Zendesk Sunshine Conversations]
 *      ↑↓ webhook ↔ POST reply
 *   [lensonline-chat-bridge on Cloud Run]
 *      ↑↓ A2A REST
 *   [Vertex AI Agent Runtime — the bot]
 *
 * Sunshine's switchboard routes user messages to the bot by default, and to
 * Zendesk Agent Workspace (a human on the CS team) when the bot calls
 * passControl. The customer never knows whether they're talking to the bot
 * or a person — same widget, same conversation, transparent handoff.
 */

import {
  AssistantRuntimeProvider,
  type AppendMessage,
  type ThreadMessageLike,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { Thread } from "@assistant-ui/react-ui";
import Smooch from "smooch";
import { useCallback, useEffect, useRef, useState } from "react";
import "@assistant-ui/react-ui/styles/index.css";
import "@assistant-ui/react-ui/styles/modal.css";

// Sunshine "Web Messenger" integration id — customer-facing channel for
// lensonline.be. The widget connects here; Sunshine fans messages out to
// whatever integration is currently active in the switchboard (bot or human).
const SUNSHINE_INTEGRATION_ID = "6a0441e958061fe426bca46c";

type SmoochMessage = {
  _id?: string;
  type?: string;
  text?: string;
  author?: { type?: "user" | "business"; displayName?: string };
  received?: number;
  source?: { type?: string };
};

function smoochToAui(msg: SmoochMessage): ThreadMessageLike {
  const isUser = msg.author?.type === "user";
  return {
    role: isUser ? "user" : "assistant",
    content: [{ type: "text", text: msg.text ?? "" }],
  };
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ThreadMessageLike[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const initStartedRef = useRef(false);

  // Initialize Smooch once
  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    Smooch.init({
      integrationId: SUNSHINE_INTEGRATION_ID,
      embedded: true, // headless mode — Smooch handles state + transport, we render
    })
      .then(() => {
        // Hydrate with any existing conversation history
        const existing = Smooch.getConversations?.()?.[0]?.messages ?? [];
        if (existing.length > 0) {
          setMessages(existing.map(smoochToAui));
        }
      })
      .catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.error("[lensonline-widget] Smooch.init failed:", err);
      });

    // Wire up incoming-message listener
    const onMessageReceived = (msg: SmoochMessage) => {
      // Skip echoes of our own user messages (they're added optimistically below)
      if (msg.source?.type === "web" && msg.author?.type === "user") return;
      setMessages((prev) => [...prev, smoochToAui(msg)]);
      if (msg.author?.type === "business") setIsRunning(false);
    };
    Smooch.on("message:received", onMessageReceived);

    return () => {
      try {
        Smooch.off("message:received", onMessageReceived);
      } catch {
        /* fine */
      }
    };
  }, []);

  const onNew = useCallback(async (message: AppendMessage) => {
    if (message.content.length !== 1 || message.content[0]?.type !== "text") {
      throw new Error("only text content supported");
    }
    const text = message.content[0].text;
    // Optimistically render the user's message immediately
    setMessages((prev) => [
      ...prev,
      { role: "user", content: [{ type: "text", text }] },
    ]);
    setIsRunning(true);
    try {
      await Smooch.sendMessage({ type: "text", text });
    } catch (err) {
      setIsRunning(false);
      // eslint-disable-next-line no-console
      console.error("[lensonline-widget] sendMessage failed:", err);
    }
  }, []);

  const runtime = useExternalStoreRuntime({
    isRunning,
    messages,
    onNew,
    convertMessage: (m) => m,
  });

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
