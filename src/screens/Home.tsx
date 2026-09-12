import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { BottomNav } from '../components/BottomNav'
import { ChatBubble } from '../components/ChatBubble'
import { QuickAction } from '../components/QuickAction'
import { VoiceButton } from '../components/VoiceButton'
import { MenuIcon, BoxIcon, CartIcon, ChartIcon, SparkleIcon } from '../components/icons'
import { addChatMessage, getChatMessages } from '../lib/store'
import { answerAssistantQuery } from '../lib/assistant'
import { useVoiceInput, speak } from '../lib/speech'
import { useLang } from '../lib/langContext'
import type { ChatMessage } from '../lib/types'

export default function Home() {
  const navigate = useNavigate()
  const { lang, label, cycleLang } = useLang()
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatMessages())
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { supported, listening, transcript, start, stop } = useVoiceInput({
    lang,
    onFinalResult: (text) => handleUtterance(text),
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, transcript])

  function pushMessage(role: ChatMessage['role'], text: string) {
    const msg = addChatMessage(role, text)
    setMessages((prev) => [...prev, msg])
    return msg
  }

  function handleUtterance(text: string) {
    if (!text.trim()) return
    pushMessage('user', text)

    const lower = text.toLowerCase()
    if (/add (a |new )?product/.test(lower)) {
      navigate('/add-product')
      return
    }
    if (/(create|new|start) (a )?bill/.test(lower)) {
      navigate('/bill/new')
      return
    }
    if (/insight|dashboard|recommend/.test(lower)) {
      navigate('/insights')
      return
    }

    const reply = answerAssistantQuery(text)
    const assistantMsg = pushMessage('assistant', reply)
    speak(assistantMsg.text, lang)
  }

  function submitTyped() {
    if (!input.trim()) return
    handleUtterance(input)
    setInput('')
  }

  function askExample(question: string) {
    handleUtterance(question)
  }

  return (
    <Screen>
      <header className="safe-top sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100" aria-label="Menu">
          <MenuIcon />
        </button>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">
          <SparkleIcon width={18} height={18} />
        </span>
        <h1 className="flex-1 text-[17px] font-semibold text-slate-900">Kirana AI</h1>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Online
        </span>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-5">
          <p className="text-[22px] font-semibold text-slate-900">Namaste! 👋</p>
          <p className="mt-1 text-[14px] text-slate-500">
            I&apos;m your AI store assistant. You can speak or type to manage your store.
          </p>
        </div>

        {messages.length > 0 && (
          <div className="mb-5 space-y-2.5">
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
            {listening && transcript && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-100 px-4 py-2.5 text-[15px] italic text-brand-700">
                  {transcript}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2.5">
          <QuickAction icon={BoxIcon} label="Add new product" hint="eg. Das Maggi, bees rupay" onClick={() => navigate('/add-product')} />
          <QuickAction icon={CartIcon} label="Create a bill" hint="eg. 2 Maggi, 1 Parle-G" onClick={() => navigate('/bill/new')} />
          <QuickAction icon={BoxIcon} label="Show inventory" hint="eg. Maggi kitna bacha hai?" onClick={() => askExample('Maggi kitna bacha hai?')} />
          <QuickAction icon={ChartIcon} label="Show insights" hint="eg. Kya order karna hai?" onClick={() => navigate('/insights')} />
        </div>
      </div>

      <div className="safe-bottom border-t border-slate-200 bg-white px-4 pb-4 pt-3">
        <div className="mb-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitTyped()}
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-[14px] outline-none focus:border-brand-400"
          />
          <button
            type="button"
            onClick={submitTyped}
            className="rounded-full bg-brand-500 px-4 py-2.5 text-[13px] font-medium text-white active:scale-95"
          >
            Send
          </button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <VoiceButton listening={listening} onClick={() => (listening ? stop() : start())} disabled={!supported} />
          <button type="button" onClick={cycleLang} className="text-[12px] text-slate-400">
            {supported ? `Tap to speak (${label})` : 'Voice not supported — type instead'}
          </button>
        </div>
      </div>

      <BottomNav />
    </Screen>
  )
}
