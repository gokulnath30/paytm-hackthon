import type { ChatMessage } from '../lib/types'

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug shadow-sm ${
          isUser ? 'rounded-br-sm bg-brand-500 text-white' : 'rounded-bl-sm bg-white text-slate-800 border border-slate-200'
        }`}
      >
        {message.text}
      </div>
    </div>
  )
}
