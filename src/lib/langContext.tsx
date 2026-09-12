import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { VoiceLang } from './types'

const LANG_KEY = 'kirana.lang.v1'

const LANG_LABELS: Record<VoiceLang, string> = {
  'en-IN': 'English',
  'hi-IN': 'Hindi',
  'ta-IN': 'Tamil',
}

const LANG_CYCLE: VoiceLang[] = ['en-IN', 'hi-IN', 'ta-IN']

interface LangContextValue {
  lang: VoiceLang
  label: string
  cycleLang: () => void
  setLang: (lang: VoiceLang) => void
}

const LangContext = createContext<LangContextValue | null>(null)

function readStoredLang(): VoiceLang {
  if (typeof window === 'undefined') return 'en-IN'
  const stored = window.localStorage.getItem(LANG_KEY)
  return (LANG_CYCLE as string[]).includes(stored ?? '') ? (stored as VoiceLang) : 'en-IN'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<VoiceLang>(readStoredLang)

  const setLang = useCallback((next: VoiceLang) => {
    setLangState(next)
    window.localStorage.setItem(LANG_KEY, next)
  }, [])

  const cycleLang = useCallback(() => {
    setLangState((current) => {
      const idx = LANG_CYCLE.indexOf(current)
      const next = LANG_CYCLE[(idx + 1) % LANG_CYCLE.length]
      window.localStorage.setItem(LANG_KEY, next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ lang, label: LANG_LABELS[lang], cycleLang, setLang }), [lang, cycleLang, setLang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
