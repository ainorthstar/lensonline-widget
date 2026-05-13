// Minimal ambient typings for smooch (Sunshine Web SDK headless mode).
// Covers only the methods we actually use. The official package ships no
// types — full surface is documented at
// https://docs.smooch.io/javascript-sdk/

declare module "smooch" {
  type SmoochMessageAuthor = {
    type?: "user" | "business";
    displayName?: string;
  };
  type SmoochMessage = {
    _id?: string;
    type?: string;
    text?: string;
    author?: SmoochMessageAuthor;
    received?: number;
    source?: { type?: string };
  };
  type SmoochConversation = {
    _id?: string;
    messages?: SmoochMessage[];
  };

  type InitOptions = {
    integrationId: string;
    embedded?: boolean;
    customText?: Record<string, string>;
    customColors?: Record<string, string>;
    locale?: string;
    delegate?: unknown;
  };

  function init(options: InitOptions): Promise<void>;
  // Event handler signature varies per event; SmoochMessage covers the
  // message:* events we actually subscribe to. Cast at the call site if
  // a different shape is needed.
  type AnyHandler = (...args: any[]) => void;
  function on(event: string, handler: AnyHandler): void;
  function off(event: string, handler: AnyHandler): void;
  function sendMessage(
    message: { type: "text"; text: string },
  ): Promise<unknown>;
  function getConversations(): SmoochConversation[] | undefined;
  function destroy(): void;

  const _default: {
    init: typeof init;
    on: typeof on;
    off: typeof off;
    sendMessage: typeof sendMessage;
    getConversations: typeof getConversations;
    destroy: typeof destroy;
  };
  export default _default;
}
