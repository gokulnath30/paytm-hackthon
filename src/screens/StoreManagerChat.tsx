import { useEffect, useRef, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { AgentAvatar, Thumb } from '../components/ui'
import { CheckCircleIcon, DotsIcon, MicIcon, SendIcon } from '../components/icons'
import { storeManagerThread } from '../lib/mockData'
import type { ChatMessage } from '../lib/mockData'
import { sendChat } from '../lib/api'

export default function StoreManagerChat() {
  const [draft, setDraft] = useState('')
  const [thread, setThread] = useState<ChatMessage[]>(storeManagerThread)
  const [pending, setPending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [thread, pending])

  async function send() {
    const message = draft.trim()
    if (!message || pending) return

    const stamp = Date.now()
    setThread((prev) => [...prev, { id: `u${stamp}`, from: 'user', text: message }])
    setDraft('')
    setPending(true)

    try {
      const reply = await sendChat({ message, role: 'owner' })
      setThread((prev) => [...prev, { id: `a${stamp}`, from: 'agent', text: reply.text, bullets: reply.bullets }])
    } catch (error) {
      setThread((prev) => [
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

  return (
    <AppShell
      width="narrow"
      header={
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <AgentAvatar tone="brand" size="sm" />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-ink">Store Manager AI</p>
            <p className="flex items-center gap-1.5 text-xs font-medium text-leaf-600">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" />
              Online
            </p>
          </div>
        </div>
      }
      headerRight={
        <button
          type="button"
          aria-label="Conversation options"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas"
        >
          <DotsIcon width={20} height={20} />
        </button>
      }
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Speak your message"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100"
          >
            <MicIcon width={20} height={20} />
          </button>
          <input
            id="store-manager-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void send()
            }}
            placeholder="Type or speak your message..."
            aria-label="Type or speak your message"
            className="h-12 min-w-0 flex-1 rounded-xl border border-hairline bg-canvas px-4 text-base text-ink outline-none placeholder:text-ink-faint focus:border-brand-400"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!draft.trim() || pending}
            aria-label="Send message"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-40"
          >
            <SendIcon width={19} height={19} />
          </button>
        </div>
      }
    >
      <div className="space-y-3.5">
        {thread.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}

        {pending && (
          <div className="flex items-start gap-2.5" role="status" aria-live="polite">
            <AgentAvatar tone="brand" size="sm" />
            <span className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-hairline bg-surface px-4 py-4">
              <span className="sr-only">Store Manager AI is replying</span>
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
      </div>
    </AppShell>
  )
}

function Message({ msg }: { msg: ChatMessage }) {
  const isUser = msg.from === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-canvas px-4 py-3 text-base text-ink sm:max-w-[75%]">
          {msg.text}
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2.5">
      <AgentAvatar tone="brand" size="sm" />
      <div className="min-w-0 max-w-[85%] space-y-2.5 sm:max-w-[75%]">
        {msg.text && (
          <div
            className={`rounded-2xl rounded-bl-md border px-4 py-3 ${
              msg.failed ? 'border-bad/20 bg-bad-bg' : 'border-hairline bg-surface'
            }`}
          >
            <p className={`whitespace-pre-line text-base ${msg.failed ? 'text-bad' : 'text-ink'}`}>{msg.text}</p>

            {msg.bullets && (
              <ul className="mt-2 space-y-1">
                {msg.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-base text-ink-soft">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {msg.productCard && (
          <div className="rounded-2xl border border-hairline bg-surface p-3">
            <div className="flex items-start gap-3">
              <Thumb emoji={msg.productCard.thumb} />
              <div className="min-w-0">
                <p className="text-base font-semibold text-ink">{msg.productCard.name}</p>
                <p className="text-sm text-ink-soft">{msg.productCard.packSize}</p>
                <dl className="mt-1 space-y-0.5 text-sm text-ink-soft">
                  <div className="flex gap-1.5">
                    <dt>Brand:</dt>
                    <dd className="font-medium text-ink">{msg.productCard.brand}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt>Category:</dt>
                    <dd className="font-medium text-ink">{msg.productCard.category}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-hairline pt-2.5">
              <span className="flex items-center gap-1.5 text-sm font-medium text-leaf-600">
                <CheckCircleIcon width={16} height={16} />
                {msg.productCard.status}
              </span>
              <span className="nums shrink-0 text-xs text-ink-faint">{msg.productCard.time}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
