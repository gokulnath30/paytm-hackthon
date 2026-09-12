/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Base URL of your backend proxy, e.g. https://api.example.com. Preferred. */
  readonly VITE_API_BASE?: string
  /** Realtime Database host. Demo only — see README. */
  readonly VITE_FIREBASE_DB_URL?: string
  /** Database secret. Never set this for a deployed build. */
  readonly VITE_FIREBASE_DB_SECRET?: string
  /** Full trigger URL from the Phinite Deploy screen. */
  readonly VITE_AGENT_CHAT_URL?: string
  readonly VITE_AGENT_API_KEY?: string
  readonly VITE_STORE_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
