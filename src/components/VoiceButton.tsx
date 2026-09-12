import { MicIcon } from './icons'

interface VoiceButtonProps {
  listening: boolean
  onClick: () => void
  size?: 'md' | 'lg'
  disabled?: boolean
}

export function VoiceButton({ listening, onClick, size = 'lg', disabled }: VoiceButtonProps) {
  const dimension = size === 'lg' ? 'h-16 w-16' : 'h-11 w-11'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={listening}
      aria-label={listening ? 'Stop listening' : 'Tap to speak'}
      className={`relative flex ${dimension} items-center justify-center rounded-full text-white shadow-lg shadow-brand-600/30 transition-transform active:scale-95 disabled:opacity-40 ${
        listening ? 'bg-red-500' : 'bg-brand-500'
      }`}
    >
      {listening && <span className="absolute inset-0 rounded-full animate-mic-pulse" />}
      <MicIcon width={size === 'lg' ? 26 : 18} height={size === 'lg' ? 26 : 18} />
    </button>
  )
}
