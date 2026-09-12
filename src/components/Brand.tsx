import { CartIcon } from './icons'

/** PayBasket wordmark. `size` controls the lockup; the cart mark is optional. */
export function Wordmark({ size = 'md', mark = true }: { size?: 'sm' | 'md' | 'lg'; mark?: boolean }) {
  const text = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-xl' : 'text-lg'
  const box = size === 'lg' ? 'h-14 w-14' : size === 'md' ? 'h-9 w-9' : 'h-8 w-8'
  const icon = size === 'lg' ? 30 : size === 'md' ? 20 : 18

  return (
    <span className="flex items-center gap-2">
      {mark && (
        <span className={`flex ${box} shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white`}>
          <CartIcon width={icon} height={icon} />
        </span>
      )}
      <span className={`${text} font-bold tracking-tight text-brand-900`}>
        Pay<span className="text-brand-500">Basket</span>
      </span>
    </span>
  )
}

/** "Powered by Phinite × Paytm" credit line. */
export function PoweredBy({ className = '' }: { className?: string }) {
  return (
    <p className={`flex flex-wrap items-center justify-center gap-1.5 text-xs text-ink-faint ${className}`}>
      Powered by
      <span className="font-semibold text-ink">Phinite</span>
      <span aria-hidden="true">×</span>
      <span className="font-semibold text-brand-600">Paytm</span>
    </p>
  )
}
