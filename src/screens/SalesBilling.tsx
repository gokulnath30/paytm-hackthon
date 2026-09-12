import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { AgentAvatar, Button, Pill, Thumb } from '../components/ui'
import { CloseIcon, DotsIcon, MinusIcon, PlusIcon, ReceiptIcon, TrashIcon, UsersIcon } from '../components/icons'
import { initialCart, salesSession } from '../lib/mockData'
import type { CartItem } from '../lib/mockData'

export default function SalesBilling() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartItem[]>(initialCart)

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0),
    )
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  return (
    <AppShell
      width="wide"
      showBack={false}
      header={
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <AgentAvatar tone="leaf" size="sm" />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-ink">Sales &amp; Billing AI</p>
            <p className="flex items-center gap-1.5 text-xs font-medium text-leaf-600">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" />
              Online
            </p>
          </div>
        </div>
      }
      headerRight={
        <button
          type="button"
          aria-label="Conversation options"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas"
        >
          <DotsIcon width={20} height={20} />
        </button>
      }
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-ink">Total</span>
            <span className="nums text-xl font-bold text-ink">₹{total}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button icon={ReceiptIcon} onClick={() => navigate('/payment')} disabled={cart.length === 0}>
              Generate Bill
            </Button>
            <Button variant="secondary" icon={TrashIcon} onClick={() => setCart([])}>
              Clear Cart
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-base font-semibold text-ink">{salesSession.customer}</h2>
            <Pill tone="brand">{salesSession.badge}</Pill>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bad-bg text-bad">
                <UsersIcon width={18} height={18} />
              </span>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium text-ink-faint">Customer</p>
                <p className="rounded-2xl rounded-bl-md border border-hairline bg-surface px-4 py-2.5 text-base text-ink">
                  {salesSession.customerLine}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <AgentAvatar tone="leaf" size="sm" />
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium text-ink-faint">AI</p>
                <p className="rounded-2xl rounded-bl-md border border-hairline bg-surface px-4 py-2.5 text-base text-ink">
                  {salesSession.agentLine}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Current Cart</h2>
            <button
              type="button"
              className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
            >
              Add Item
            </button>
          </div>

          {cart.length > 0 ? (
            <div className="rounded-xl border border-hairline bg-surface px-3">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-hairline py-3 last:border-0"
                >
                  <Thumb emoji={item.thumb} size="sm" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-ink">{item.name}</p>
                    <p className="text-sm text-ink-soft">{item.packSize}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-bad-bg hover:text-bad sm:order-last"
                  >
                    <CloseIcon width={15} height={15} />
                  </button>

                  {/* Wraps to its own line on phones, stays inline from small tablets up */}
                  <div className="flex w-full items-center justify-between gap-2 pl-[3.25rem] sm:w-auto sm:justify-end sm:pl-0">
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => changeQty(item.productId, -1)}
                        aria-label={`Remove one ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-ink-soft transition-colors hover:bg-canvas"
                      >
                        <MinusIcon width={14} height={14} />
                      </button>
                      <span className="nums w-6 text-center text-base font-semibold text-ink">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.productId, 1)}
                        aria-label={`Add one ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-ink-soft transition-colors hover:bg-canvas"
                      >
                        <PlusIcon width={14} height={14} />
                      </button>
                    </div>

                    <div className="w-16 shrink-0 text-right">
                      <p className="nums text-base font-semibold text-ink">₹{item.unitPrice * item.qty}</p>
                      <p className="nums text-xs text-ink-faint">₹{item.unitPrice} each</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-hairline py-10 text-center text-base text-ink-faint">
              Cart is empty.
            </p>
          )}
        </section>
      </div>
    </AppShell>
  )
}
