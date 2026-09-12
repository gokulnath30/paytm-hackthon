import { useState } from 'react'
import { AgentAvatar } from './ui'
import { CloseIcon, MicIcon, RobotIcon, SendIcon } from './icons'
import { salesSession } from '../lib/mockData'

const WAVE_BARS = [8, 16, 24, 14, 28, 18, 10, 22, 30, 16, 12, 26, 14, 20]

interface Turn {
  id: string
  from: 'customer' | 'agent'
  text: string
}

const OPENING_TURNS: Turn[] = [
  { id: 't1', from: 'customer', text: salesSession.customerLine },
  { id: 't2', from: 'agent', text: salesSession.agentLine },
]

/**
 * Floating Sales & Billing AI. Collapsed it's a launcher in the bottom-right;
 * opened it carries the conversation plus the voice affordance, so the counter
 * catalog stays the primary surface and the agent is one tap away.
 */
export function AiChatDock() {
  const [open, setOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [draft, setDraft] = useState('')
  const [turns, setTurns] = useState<Turn[]>(OPENING_TURNS)

  function send() {
    if (!draft.trim()) return
    setTurns((prev) => [...prev, { id: `t${prev.length + 1}`, from: 'customer', text: draft.trim() }])
    setDraft('')
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Sales & Billing AI"
        /* clears the phone action bar (72px) + tab bar (52px) */
        className="fixed bottom-[8.5rem] right-4 z-30 flex items-center gap-2.5 rounded-full bg-leaf-500 py-3 pl-3 pr-4 text-white shadow-lg shadow-leaf-700/25 transition-transform active:scale-95 lg:bottom-6 lg:right-6"
      >
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <RobotIcon width={19} height={19} />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-leaf-500" />
        </span>
        <span className="text-sm font-semibold">Ask AI</span>
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close AI panel"
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
      />

      <aside
        aria-label="Sales and Billing AI"
        className="fixed inset-x-0 bottom-0 z-40 flex max-h-[85dvh] flex-col rounded-t-2xl border border-hairline bg-surface shadow-2xl lg:inset-x-auto lg:bottom-6 lg:right-6 lg:max-h-[32rem] lg:w-96 lg:rounded-2xl"
      >
        <header className="flex shrink-0 items-center gap-2.5 border-b border-hairline px-4 py-3">
          <AgentAvatar tone="leaf" size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-ink">Sales &amp; Billing AI</p>
            <p className="flex items-center gap-1.5 text-xs font-medium text-leaf-600">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" />
              Online
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {turns.map((t) =>
            t.from === 'customer' ? (
              <div key={t.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-canvas px-3.5 py-2.5 text-base text-ink">
                  {t.text}
                </p>
              </div>
            ) : (
              <div key={t.id} className="flex items-start gap-2">
                <AgentAvatar tone="leaf" size="sm" />
                <p className="max-w-[85%] rounded-2xl rounded-bl-md border border-hairline bg-surface px-3.5 py-2.5 text-base text-ink">
                  {t.text}
                </p>
              </div>
            ),
          )}

          {listening && (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-leaf-50 py-4">
              <div className="flex h-8 items-center gap-1" aria-hidden="true">
                {WAVE_BARS.map((h, i) => (
                  <span
                    key={i}
                    className="animate-wave w-1 rounded-full bg-leaf-500"
                    style={{ height: `${h}px`, animationDelay: `${i * 0.07}s` }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-leaf-700">Listening…</p>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-hairline px-3 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setListening((v) => !v)}
              aria-pressed={listening}
              aria-label={listening ? 'Stop listening' : 'Speak to the assistant'}
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                listening ? 'animate-mic-pulse bg-bad text-white' : 'bg-leaf-50 text-leaf-600 hover:bg-leaf-100'
              }`}
            >
              <MicIcon width={19} height={19} />
            </button>
            <input
              id="ai-dock-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type or speak your message..."
              aria-label="Type or speak your message"
              className="h-11 min-w-0 flex-1 rounded-xl border border-hairline bg-canvas px-3.5 text-base text-ink outline-none placeholder:text-ink-faint focus:border-leaf-500"
            />
            <button
              type="button"
              onClick={send}
              disabled={!draft.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf-500 text-white transition-opacity hover:bg-leaf-600 disabled:opacity-40"
            >
              <SendIcon width={18} height={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
