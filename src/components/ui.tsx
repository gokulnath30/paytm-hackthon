import type { ComponentType, ReactNode, SVGProps } from 'react'
import { AlertIcon, RefreshIcon, RobotIcon, TrendUpIcon } from './icons'

/**
 * Product thumbnail. `image` is optional in the PayBasket schema and usually
 * null, so the emoji stands in until a photo URL arrives — pass `src` and it
 * renders the photo instead.
 */
export function Thumb({ emoji, src, size = 'md' }: { emoji: string; src?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-20 w-20 text-3xl' : size === 'md' ? 'h-12 w-12 text-xl' : 'h-10 w-10 text-lg'
  return (
    <span
      className={`flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hairline bg-canvas`}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" /> : emoji}
    </span>
  )
}

/** Circular avatar for the two AI agents. */
export function AgentAvatar({ tone, size = 'md' }: { tone: 'brand' | 'leaf'; size?: 'sm' | 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-14 w-14' : size === 'md' ? 'h-10 w-10' : 'h-9 w-9'
  const icon = size === 'lg' ? 28 : size === 'md' ? 21 : 19
  const color = tone === 'brand' ? 'bg-brand-100 text-brand-600' : 'bg-leaf-100 text-leaf-600'
  return (
    <span className={`flex ${box} shrink-0 items-center justify-center rounded-full ${color}`}>
      <RobotIcon width={icon} height={icon} />
    </span>
  )
}

/** Big figure tile with an optional trend chip. */
export function StatTile({
  label,
  value,
  delta,
  trend = 'up',
  icon: Icon,
  tone = 'neutral',
}: {
  label: string
  value: string
  delta?: string
  trend?: 'up' | 'down'
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  tone?: 'neutral' | 'bad'
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-3.5">
      <div className="flex items-center gap-2">
        {Icon && (
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              tone === 'bad' ? 'bg-bad-bg text-bad' : 'bg-brand-50 text-brand-600'
            }`}
          >
            <Icon width={16} height={16} />
          </span>
        )}
        <p className="min-w-0 truncate text-xs text-ink-soft">{label}</p>
      </div>
      <p className="nums mt-1.5 text-xl font-bold text-ink">{value}</p>
      {delta && (
        <p
          className={`nums mt-0.5 flex items-center gap-1 text-xs font-medium ${
            trend === 'down' ? 'text-bad' : 'text-leaf-600'
          }`}
        >
          <TrendUpIcon width={13} height={13} className={trend === 'down' ? 'scale-y-[-1]' : undefined} />
          {delta}
        </p>
      )}
    </div>
  )
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'bad' | 'brand' }) {
  const styles = {
    neutral: 'bg-canvas text-ink-soft',
    good: 'bg-leaf-50 text-leaf-600',
    bad: 'bg-bad-bg text-bad',
    brand: 'bg-brand-50 text-brand-600',
  }[tone]
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>{children}</span>
}

/** Primary / secondary action button, full-width by default on phones. */
export function Button({
  children,
  onClick,
  variant = 'primary',
  icon: Icon,
  type = 'button',
  disabled,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  const styles = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    secondary: 'border border-hairline bg-surface text-ink hover:bg-canvas',
    danger: 'border border-bad/30 bg-surface text-bad hover:bg-bad-bg',
  }[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors active:scale-[0.99] disabled:opacity-40 ${styles} ${className}`}
    >
      {Icon && <Icon width={18} height={18} />}
      {children}
    </button>
  )
}

export function SectionHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-ink">{children}</h2>
      {action}
    </div>
  )
}

/* ---------- async states ----------
 * Every screen that reads the API shows the same three faces: a placeholder
 * while it loads, a retryable message when the call fails, and the content. */

/** Grey placeholder block, sized by the caller. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`block animate-pulse rounded-xl bg-hairline/70 ${className}`} aria-hidden="true" />
}

export function LoadingBlock({ label = 'Loading…', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-2.5">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-bad/20 bg-bad-bg px-4 py-4 sm:flex-row sm:items-center"
    >
      <AlertIcon width={20} height={20} className="shrink-0 text-bad" />
      <p className="min-w-0 flex-1 text-base text-bad">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-bad px-3.5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <RefreshIcon width={14} height={14} />
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-hairline py-10 text-center text-base text-ink-faint">
      {children}
    </p>
  )
}
