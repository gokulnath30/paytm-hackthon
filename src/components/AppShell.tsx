import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BackIcon, HomeIcon, BoxIcon, CartIcon, ChartIcon, MoreIcon } from './icons'
import { Wordmark } from './Brand'

const NAV_ITEMS = [
  { to: '/home', label: 'Home', Icon: HomeIcon },
  { to: '/inventory', label: 'Products', Icon: BoxIcon },
  { to: '/chat/sales', label: 'Sales', Icon: CartIcon },
  { to: '/insights', label: 'Insights', Icon: ChartIcon },
  { to: '/assistants', label: 'More', Icon: MoreIcon },
]

type Width = 'narrow' | 'wide'

const WIDTH_CLASS: Record<Width, string> = {
  narrow: 'max-w-2xl',
  wide: 'max-w-5xl',
}

interface AppShellProps {
  children: ReactNode
  /** Omit for screens whose header is fully custom (chat, dashboard). */
  title?: string
  subtitle?: string
  header?: ReactNode
  headerRight?: ReactNode
  footer?: ReactNode
  showBack?: boolean
  onBack?: () => void
  showNav?: boolean
  width?: Width
  /** Content area padding — off for edge-to-edge screens like chat threads. */
  padded?: boolean
}

export function AppShell({
  children,
  title,
  subtitle,
  header,
  headerRight,
  footer,
  showBack = true,
  onBack,
  showNav = true,
  width = 'narrow',
  padded = true,
}: AppShellProps) {
  const navigate = useNavigate()
  const widthClass = WIDTH_CLASS[width]

  return (
    <div className="flex min-h-dvh bg-canvas">
      {showNav && <NavRail />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="safe-top sticky top-0 z-20 border-b border-hairline bg-surface/95 backdrop-blur">
          <div className={`mx-auto flex w-full items-center gap-2 px-4 py-2.5 sm:px-6 ${widthClass}`}>
            {showBack && (
              <button
                type="button"
                onClick={() => (onBack ? onBack() : navigate(-1))}
                className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas"
                aria-label="Go back"
              >
                <BackIcon />
              </button>
            )}

            {header ?? (
              <div className="min-w-0 flex-1">
                {title && <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>}
                {subtitle && <p className="truncate text-xs text-ink-faint">{subtitle}</p>}
              </div>
            )}

            {headerRight}
          </div>
        </header>

        <main className="flex-1">
          <div className={`mx-auto w-full ${widthClass} ${padded ? 'px-4 py-5 sm:px-6 sm:py-6' : ''}`}>{children}</div>
        </main>

        {footer && (
          <div className="sticky bottom-0 z-10 border-t border-hairline bg-surface/95 backdrop-blur">
            <div className={`mx-auto w-full px-4 py-3 sm:px-6 ${widthClass}`}>{footer}</div>
          </div>
        )}

        {showNav && <BottomTabs />}
      </div>
    </div>
  )
}

/** Persistent left rail from tablet width up — replaces the bottom tab bar. */
function NavRail() {
  return (
    <nav
      aria-label="Main"
      className="safe-top hidden shrink-0 flex-col gap-1 border-r border-hairline bg-surface px-3 py-4 md:flex md:w-56"
    >
      <div className="mb-5 px-2">
        <Wordmark size="sm" />
      </div>

      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition-colors ${
              isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-soft hover:bg-canvas'
            }`
          }
        >
          <Icon width={20} height={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

/** Tab bar on phones only. */
function BottomTabs() {
  return (
    <nav
      aria-label="Main"
      className="safe-bottom sticky bottom-0 z-20 flex border-t border-hairline bg-surface/95 backdrop-blur md:hidden"
    >
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 text-2xs font-medium transition-colors ${
              isActive ? 'text-brand-600' : 'text-ink-faint'
            }`
          }
        >
          <Icon width={20} height={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
