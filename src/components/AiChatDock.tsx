import { useEffect, useRef, useState } from 'react'
import { AgentAvatar } from './ui'
import { CheckIcon, CloseIcon, MicIcon, RobotIcon, SendIcon } from './icons'

const WAVE_BARS = [8, 16, 24, 14, 28, 18, 10, 22, 30, 16, 12, 26, 14, 20]

export interface Turn {
  id: string
  from: 'user' | 'agent'
  text: string
  bullets?: string[]
  /** Renders the bubble as a problem rather than an answer. */
  failed?: boolean
}

export interface AgentTurn {
  text: string
  bullets?: string[]
}

interface AiChatDockProps {
  agentName: string
  tone: 'brand' | 'leaf'
  launcherLabel: string
  openingTurns: Turn[]
  /**
   * Sends the message to the assistant and resolves with its reply. Without it
   * the dock just echoes what was typed, which is how the scripted demo runs.
   */
  onSend?: (message: string) => Promise<AgentTurn>
  placeholder?: string
  /** Optional bridge from the conversation into the screen behind it. */
  action?: { label: string; onClick: () => void }
  tip?: string
  /** Set when the screen keeps an action bar at every width, so the launcher clears it. */
  aboveFooter?: boolean
}

/**
 * Floating assistant. Collapsed it's a launcher in the bottom-right; opened it
 * carries the conversation plus the voice affordance, so the screen behind it
 * stays the primary surface and the agent is one tap away.
 */
export function AiChatDock({
  agentName,
  tone,
  launcherLabel,
  openingTurns,
  onSend,
  placeholder = 'Type or speak your message...',
  action,
  tip,
  aboveFooter = false,
}: AiChatDockProps) {
  const [open, setOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [draft, setDraft] = useState('')
  const [turns, setTurns] = useState<Turn[]>(openingTurns)
  const [pending, setPending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // The thread opens on its latest message rather than its oldest
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' })
  }, [open, turns, listening, pending])

  const accent = tone === 'leaf' ? 'bg-leaf-500' : 'bg-brand-500'
  const accentHover = tone === 'leaf' ? 'hover:bg-leaf-600' : 'hover:bg-brand-600'
  const accentSoft = tone === 'leaf' ? 'bg-leaf-50 text-leaf-600 hover:bg-leaf-100' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
  const accentRing = tone === 'leaf' ? 'ring-leaf-500' : 'ring-brand-500'
  const accentShadow = tone === 'leaf' ? 'shadow-leaf-700/25' : 'shadow-brand-700/25'
  const accentBorder = tone === 'leaf' ? 'focus:border-leaf-500' : 'focus:border-brand-500'
  const accentPanel = tone === 'leaf' ? 'bg-leaf-50 text-leaf-700' : 'bg-brand-50 text-brand-700'
  const accentBar = tone === 'leaf' ? 'bg-leaf-500' : 'bg-brand-500'

  async function send() {
    const message = draft.trim()
    if (!message || pending) return

    const stamp = Date.now()
    setTurns((prev) => [...prev, { id: `u${stamp}`, from: 'user', text: message }])
    setDraft('')

    if (!onSend) return

    setPending(true)
    try {
      const reply = await onSend(message)
      setTurns((prev) => [...prev, { id: `a${stamp}`, from: 'agent', text: reply.text, bullets: reply.bullets }])
    } catch (error) {
      setTurns((prev) => [
        ...prev,
        {
          id: `e${stamp}`,
          from: 'agent',
          failed: true,
          text: error instanceof Error ? error.message : 'The assistant could not be reached.',
        },
      ])
    } finally {
      setPending(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open ${agentName}`}
        /* Below 640 it clears the action bar (72px) + tab bar (52px); from 640 the
           rail replaces the tab bar so only the action bar remains; at 1024 the
           Sales action bar goes away entirely while Add Product keeps its own. */
        className={`fixed bottom-[8.5rem] right-4 z-30 flex items-center gap-2.5 rounded-full py-3 pl-3 pr-4 text-white shadow-lg transition-transform active:scale-95 sm:bottom-24 lg:right-6 ${
          aboveFooter ? 'lg:bottom-24' : 'lg:bottom-6'
        } ${accent} ${accentShadow}`}
      >
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <RobotIcon width={19} height={19} />
          <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ${accentRing}`} />
        </span>
        <span className="text-sm font-semibold">{launcherLabel}</span>
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close assistant"
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
      />

      <aside
        aria-label={agentName}
        className="fixed inset-x-0 bottom-0 z-40 flex max-h-[85dvh] flex-col rounded-t-2xl border border-hairline bg-surface shadow-2xl lg:inset-x-auto lg:bottom-6 lg:right-6 lg:max-h-[32rem] lg:w-96 lg:rounded-2xl"
      >
        <header className="flex shrink-0 items-center gap-2.5 border-b border-hairline px-4 py-3">
          <AgentAvatar tone={tone} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-ink">{agentName}</p>
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
            t.from === 'user' ? (
              <div key={t.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-canvas px-3.5 py-2.5 text-base text-ink">
                  {t.text}
                </p>
              </div>
            ) : (
              <div key={t.id} className="flex items-start gap-2">
                <AgentAvatar tone={tone} size="sm" />
                <div
                  className={`max-w-[85%] rounded-2xl rounded-bl-md border px-3.5 py-2.5 ${
                    t.failed ? 'border-bad/20 bg-bad-bg' : 'border-hairline bg-surface'
                  }`}
                >
                  <p className={`whitespace-pre-line text-base ${t.failed ? 'text-bad' : 'text-ink'}`}>{t.text}</p>
                  {t.bullets && (
                    <ul className="mt-1.5 space-y-1">
                      {t.bullets.map((b) => (
                        <li key={b} className="nums flex items-start gap-2 text-base text-ink-soft">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ),
          )}
          {pending && (
            <div className="flex items-start gap-2" role="status" aria-live="polite">
              <AgentAvatar tone={tone} size="sm" />
              <span className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-hairline bg-surface px-3.5 py-3.5">
                <span className="sr-only">{agentName} is replying</span>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="animate-wave h-1.5 w-1.5 rounded-full bg-ink-faint"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          )}

          <div ref={endRef} />

          {action && (
            <div className="flex justify-start pl-10">
              <button
                type="button"
                onClick={action.onClick}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${accentSoft}`}
              >
                <CheckIcon width={15} height={15} />
                {action.label}
              </button>
            </div>
          )}

          {listening && (
            <div className={`flex flex-col items-center gap-2 rounded-xl py-4 ${accentPanel}`}>
              <div className="flex h-8 items-center gap-1" aria-hidden="true">
                {WAVE_BARS.map((h, i) => (
                  <span
                    key={i}
                    className={`animate-wave w-1 rounded-full ${accentBar}`}
                    style={{ height: `${h}px`, animationDelay: `${i * 0.07}s` }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium">Listening…</p>
            </div>
          )}

          {tip && !listening && (
            <p className="rounded-xl bg-canvas px-3.5 py-2.5 text-sm text-ink-soft">
              <span className="font-medium text-ink">Tip: </span>
              {tip}
            </p>
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
                listening ? 'animate-mic-pulse bg-bad text-white' : accentSoft
              }`}
            >
              <MicIcon width={19} height={19} />
            </button>
            <input
              id="ai-dock-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void send()
              }}
              placeholder={placeholder}
              aria-label={placeholder}
              className={`h-11 min-w-0 flex-1 rounded-xl border border-hairline bg-canvas px-3.5 text-base text-ink outline-none placeholder:text-ink-faint ${accentBorder}`}
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={!draft.trim() || pending}
              aria-label="Send message"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40 ${accent} ${accentHover}`}
            >
              <SendIcon width={18} height={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
