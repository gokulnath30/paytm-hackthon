import { agentApiKey, agentChatUrl, apiBase } from './config'
import { ApiError, jsonBody, request } from './http'
import type { AgentReply, ChatRequest } from './types'

/**
 * Talking to the Phinite graph. Preferred route is your backend's /api/chat,
 * which keeps the API key server-side; the direct trigger URL is there for a
 * local demo before that backend exists.
 *
 * The trigger path comes off the Deploy screen after a Build — a graph with no
 * published build has no chat URL, which is why this can be unconfigured.
 */

export const chatAvailable = Boolean(apiBase || agentChatUrl)

/** Providers differ on where they put the answer; take the first thing that reads like one. */
function readReply(payload: unknown): AgentReply {
  if (typeof payload === 'string') return { text: payload }
  if (!payload || typeof payload !== 'object') return { text: '' }

  const body = payload as Record<string, unknown>
  const nested = (body.data ?? body.result ?? body.output) as Record<string, unknown> | undefined
  const source = typeof nested === 'object' && nested !== null ? { ...nested, ...body } : body

  const text = [source.reply, source.text, source.message, source.answer, source.response].find(
    (value) => typeof value === 'string' && value.trim() !== '',
  )

  const bullets = Array.isArray(source.bullets)
    ? (source.bullets.filter((b) => typeof b === 'string') as string[])
    : undefined

  return {
    text: (text as string) ?? 'The assistant replied with nothing I could read.',
    bullets: bullets?.length ? bullets : undefined,
    orderId: typeof source.order_id === 'string' ? source.order_id : undefined,
    sessionId: typeof source.session_id === 'string' ? source.session_id : undefined,
  }
}

export async function sendChat({ message, sessionId, role }: ChatRequest): Promise<AgentReply> {
  if (apiBase) {
    const payload = await request<unknown>(`${apiBase}/api/chat`, {
      method: 'POST',
      ...jsonBody({ message, session_id: sessionId, role }),
    })
    return readReply(payload)
  }

  if (agentChatUrl) {
    const payload = await request<unknown>(agentChatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(agentApiKey ? { Authorization: `Bearer ${agentApiKey}` } : {}),
      },
      body: JSON.stringify({
        event: 'chat.message',
        data: { message, session_id: sessionId, role },
      }),
    })
    return readReply(payload)
  }

  throw new ApiError(
    'The assistant is not connected yet. Deploy the graph, then set VITE_AGENT_CHAT_URL (or point VITE_API_BASE at a backend that proxies /api/chat).',
  )
}
