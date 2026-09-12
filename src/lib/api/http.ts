/** Shared fetch plumbing: one error type, one timeout, one JSON path. */

export class ApiError extends Error {
  status: number
  body: string

  constructor(message: string, status = 0, body = '') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

const TIMEOUT_MS = 15_000

export async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, {
      ...init,
      headers: { Accept: 'application/json', ...init.headers },
      signal: init.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (cause) {
    const reason = cause instanceof DOMException && cause.name === 'TimeoutError' ? 'timed out' : 'could not be reached'
    throw new ApiError(`The server ${reason}. Check your connection and try again.`)
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    // Firebase answers errors as { "error": "Permission denied" }.
    let detail = body.slice(0, 200)
    try {
      const parsed = JSON.parse(body) as { error?: string }
      if (parsed.error) detail = parsed.error
    } catch {
      /* not JSON — keep the raw snippet */
    }
    throw new ApiError(`Request failed (${res.status}): ${detail}`, res.status, body)
  }

  if (res.status === 204) return null as T
  return (await res.json()) as T
}

export const jsonBody = (value: unknown): RequestInit => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(value),
})

/**
 * Realtime Database returns a collection as an object keyed by id, and a proxy
 * may well return a plain array. Accept either, and treat a missing path as
 * empty — in RTDB a read of nothing is `null` with HTTP 200, not a 404.
 */
export function toList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value.filter(Boolean) as T[]
  if (value && typeof value === 'object') return Object.values(value as Record<string, T>).filter(Boolean)
  return []
}
