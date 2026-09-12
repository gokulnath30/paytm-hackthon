import type { ComponentType, ReactNode, SVGProps } from 'react'
import { RobotIcon, TrendUpIcon } from './icons'

/**
 * Product thumbnail. Stands in for the photo the API will supply later —
 * swap the emoji for an <img src={product.imageUrl}> at integration time.
 */
export function Thumb({ emoji, size = 'md' }: { emoji: string; size?: 'sm' | 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-20 w-20 text-3xl' : size === 'md' ? 'h-12 w-12 text-xl' : 'h-10 w-10 text-lg'
  return (
    <span
      className={`flex ${box} shrink-0 items-center justify-center rounded-xl border border-hairline bg-canvas`}
      aria-hidden="true"
    >
      {emoji}
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

/** Big figure tile with an optional upward trend chip. */
export function StatTile({
  label,
  value,
  delta,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string
  value: string
  delta?: string
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
        <p className="nums mt-0.5 flex items-center gap-1 text-xs font-medium text-leaf-600">
          <TrendUpIcon width={13} height={13} />
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
