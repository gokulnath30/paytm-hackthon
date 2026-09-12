import { useNavigate } from 'react-router-dom'
import { BackIcon } from './icons'

interface AppHeaderProps {
  title: string
  onBack?: () => void
  showBack?: boolean
  right?: React.ReactNode
  tone?: 'light' | 'dark'
}

export function AppHeader({ title, onBack, showBack = true, right, tone = 'light' }: AppHeaderProps) {
  const navigate = useNavigate()
  const isDark = tone === 'dark'
  return (
    <header
      className={`safe-top sticky top-0 z-10 flex items-center gap-3 px-4 py-3 ${
        isDark ? 'bg-brand-800 text-white' : 'border-b border-slate-200 bg-white/90 backdrop-blur text-slate-900'
      }`}
    >
      {showBack ? (
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate(-1))}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
          }`}
          aria-label="Back"
        >
          <BackIcon />
        </button>
      ) : (
        <div className="w-9" />
      )}
      <h1 className="flex-1 truncate text-[17px] font-semibold">{title}</h1>
      {right}
    </header>
  )
}
