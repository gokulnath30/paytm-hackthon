/**
 * Where the app gets its data. Three modes, resolved once at load from Vite env
 * vars (see `.env.example`):
 *
 *   proxy  — VITE_API_BASE is set. Calls your backend, which holds the Firebase
 *            secret. This is the shape the Integration Guide recommends.
 *   direct — VITE_FIREBASE_DB_URL is set. Talks to the Realtime Database REST
 *            API straight from the browser. Demo only: the database is locked,
 *            so it needs VITE_FIREBASE_DB_SECRET, and anything in the bundle is
 *            readable by anyone who opens it.
 *   mock   — neither is set. The prototype runs on `mockData.ts`, exactly as it
 *            did before the API existed.
 */

export type DataMode = 'proxy' | 'direct' | 'mock'

const env = import.meta.env

const trimSlash = (value: string) => value.replace(/\/+$/, '')

export const apiBase = env.VITE_API_BASE ? trimSlash(env.VITE_API_BASE) : ''
export const firebaseUrl = env.VITE_FIREBASE_DB_URL ? trimSlash(env.VITE_FIREBASE_DB_URL) : ''
export const firebaseSecret = env.VITE_FIREBASE_DB_SECRET ?? ''

/** Full trigger URL from the Phinite Deploy screen, when calling the agent directly. */
export const agentChatUrl = env.VITE_AGENT_CHAT_URL ?? ''
export const agentApiKey = env.VITE_AGENT_API_KEY ?? ''

export const storeName = env.VITE_STORE_NAME ?? 'Sharma Kirana Store'

export const dataMode: DataMode = apiBase ? 'proxy' : firebaseUrl ? 'direct' : 'mock'

export const isLive = dataMode !== 'mock'

/** The agent is reachable either through the proxy or via its own trigger URL. */
export const agentEnabled = Boolean(apiBase || agentChatUrl)

if (import.meta.env.DEV && dataMode === 'direct' && firebaseSecret) {
  // One loud line, once: a database secret in a browser bundle is a root
  // password anybody can read out of the network tab.
  console.warn(
    '[PayBasket] Running in direct Firebase mode with VITE_FIREBASE_DB_SECRET in the bundle. ' +
      'Fine for a local demo, never for a deployed build — put the secret behind a backend and set VITE_API_BASE instead.',
  )
}
