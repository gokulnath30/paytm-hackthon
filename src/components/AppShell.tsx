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

type Width = 'narrow' | 'wide' | 'full'

const WIDTH_CLASS: Record<Width, string> = {
  narrow: 'max-w-2xl',
  wide: 'max-w-5xl',
  // Counter-facing screens use the whole display rather than a centred column
  full: 'max-w-none',
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
    // Fixed-height app frame: the header, footer and nav stay pinned to the
    // viewport and only the content pane scrolls. On a landscape tablet a
    // page-scrolled layout leaves the action bar stranded mid-screen.
    <div className="app-frame flex overflow-hidden bg-canvas">
      {showNav && <NavRail />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="safe-top z-20 shrink-0 border-b border-hairline bg-surface">
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

        {/* min-h-0 lets this flex child actually scroll instead of growing the frame.
            Unpadded screens manage their own panes, so they get a definite height
            to size against (h-full) and main itself stops scrolling. */}
        <main className={`min-h-0 flex-1 ${padded ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          <div
            className={`mx-auto w-full ${widthClass} ${padded ? 'px-4 py-5 sm:px-6 sm:py-6' : 'h-full'}`}
          >
            {children}
          </div>
        </main>

        {footer && (
          <div className="z-10 shrink-0 border-t border-hairline bg-surface">
            <div className={`mx-auto w-full px-4 py-3 sm:px-6 ${widthClass}`}>{footer}</div>
          </div>
        )}

        {showNav && <BottomTabs />}
      </div>
    </div>
  )
}

/**
 * Left rail from 640px up. Between 640 and 1024 it is icon-only, so a tablet in
 * a split or freeform window keeps the tablet layout instead of dropping to the
 * phone one — that window is commonly ~600-820px wide.
 */
function NavRail() {
  return (
    <nav
      aria-label="Main"
      className="safe-top hidden shrink-0 flex-col gap-1 border-r border-hairline bg-surface py-4 sm:flex sm:w-[4.5rem] sm:items-center sm:px-2 lg:w-56 lg:items-stretch lg:px-3"
    >
      <div className="mb-5 flex justify-center lg:justify-start lg:px-2">
        <span className="lg:hidden">
          <Wordmark size="sm" mark text={false} />
        </span>
        <span className="hidden lg:inline">
          <Wordmark size="sm" />
        </span>
      </div>

      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          className={({ isActive }) =>
            `flex items-center rounded-xl text-base font-medium transition-colors sm:h-12 sm:w-12 sm:justify-center lg:h-auto lg:w-auto lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 ${
              isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-soft hover:bg-canvas'
            }`
          }
        >
          <Icon width={21} height={21} />
          <span className="hidden lg:inline">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

/** Tab bar below 640px, where a rail would crowd the content. */
function BottomTabs() {
  return (
    <nav
      aria-label="Main"
      className="safe-bottom sticky bottom-0 z-20 flex border-t border-hairline bg-surface/95 backdrop-blur sm:hidden"
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
