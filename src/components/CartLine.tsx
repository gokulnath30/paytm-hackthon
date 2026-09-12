import type { CartItem } from '../lib/types'
import { formatRupees } from '../lib/format'
import { MinusIcon, PlusIcon } from './icons'

interface CartLineProps {
  item: CartItem
  onIncrement: () => void
  onDecrement: () => void
}

export function CartLine({ item, onIncrement, onDecrement }: CartLineProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[11px] font-semibold text-brand-600">
        {item.name.slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-slate-900">{item.name}</p>
        <p className="text-[13px] text-slate-500">{formatRupees(item.price)} each</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 active:scale-95"
          aria-label={`Remove one ${item.name}`}
        >
          <MinusIcon width={14} height={14} />
        </button>
        <span className="w-5 text-center text-[15px] font-semibold text-slate-900">{item.qty}</span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 active:scale-95"
          aria-label={`Add one ${item.name}`}
        >
          <PlusIcon width={14} height={14} />
        </button>
      </div>
      <span className="w-14 shrink-0 text-right text-[15px] font-semibold text-slate-900">
        {formatRupees(item.price * item.qty)}
      </span>
    </div>
  )
}
