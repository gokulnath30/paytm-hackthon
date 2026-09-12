import { useCallback, useEffect, useRef, useState } from 'react'

export interface Resource<T> {
  data: T | null
  error: string | null
  loading: boolean
  reload: () => void
  /** Replace the loaded value without a round trip, e.g. after a local edit. */
  set: (value: T) => void
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong loading this screen.'

/**
 * Load-once-per-dependency-change fetch state. A stale response never lands:
 * each run carries a token, and only the newest one is allowed to set state.
 */
export function useResource<T>(load: () => Promise<T>, deps: unknown[] = []): Resource<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)

  const latest = useRef(0)
  const loadRef = useRef(load)

  // Declared before the fetch effect so the ref is already current when it runs:
  // the loader is re-read on every render, but only re-run when `deps` change.
  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    const token = ++latest.current
    let cancelled = false

    setLoading(true)
    loadRef
      .current()
      .then((value) => {
        if (cancelled || token !== latest.current) return
        setData(value)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (cancelled || token !== latest.current) return
        setError(message(cause))
      })
      .finally(() => {
        if (!cancelled && token === latest.current) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  return { data, error, loading, reload, set: setData }
}

/** Runs `tick` on an interval while `enabled`. Used to watch an order for payment. */
export function usePoll(tick: () => void, intervalMs: number, enabled = true): void {
  const tickRef = useRef(tick)

  useEffect(() => {
    tickRef.current = tick
  })

  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => tickRef.current(), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, enabled])
}
