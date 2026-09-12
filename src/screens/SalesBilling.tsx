import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { AiChatDock } from '../components/AiChatDock'
import { Pill } from '../components/ui'
import {
  CartIcon,
  CheckIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  ReceiptIcon,
  SearchIcon,
  TrashIcon,
} from '../components/icons'
import { catalog, categories, initialCart, salesSession } from '../lib/mockData'
import type { CartItem, CatalogItem } from '../lib/mockData'

export default function SalesBilling() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartItem[]>(initialCart)
  const [categoryId, setCategoryId] = useState('all')
  const [query, setQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)

  // A search spans the whole catalog: filtering it by the selected category
  // means typing a product name that sits in another one returns nothing.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) return catalog.filter((item) => item.name.toLowerCase().includes(q))
    return catalog.filter((item) => categoryId === 'all' || item.categoryId === categoryId)
  }, [categoryId, query])

  const qtyOf = (id: string) => cart.find((c) => c.productId === id)?.qty ?? 0
  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0)

  function addItem(item: CatalogItem) {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.productId === item.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
        return next
      }
      return [
        ...prev,
        { productId: item.id, name: item.name, packSize: item.packSize, thumb: item.thumb, unitPrice: item.price, qty: 1 },
      ]
    })
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0),
    )
  }

  return (
    <>
      <AppShell
        width="full"
        padded={false}
        showBack={false}
        header={
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-ink">Sales &amp; Billing</h1>
            <Pill tone="brand">{salesSession.customer}</Pill>
          </div>
        }
        headerRight={
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart, ${itemCount} items`}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas lg:hidden"
          >
            <CartIcon width={21} height={21} />
            {itemCount > 0 && (
              <span className="nums absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-2xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        }
        footer={
          <div className="flex items-center gap-3 lg:hidden">
            <button type="button" onClick={() => setCartOpen(true)} className="min-w-0 flex-1 text-left">
              <p className="nums text-xs text-ink-faint">
                {itemCount} item{itemCount === 1 ? '' : 's'}
              </p>
              <p className="nums text-xl font-bold leading-tight text-ink">₹{total}</p>
            </button>
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => navigate('/payment')}
              className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-brand-500 px-5 text-base font-semibold text-white transition-opacity active:scale-[0.99] disabled:opacity-40"
            >
              <ReceiptIcon width={18} height={18} />
              Generate Bill
            </button>
          </div>
        }
      >
        <div className="flex h-full overflow-hidden">
          <CategoryRail selected={categoryId} onSelect={setCategoryId} />

          <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 px-4 pt-4 sm:px-5">
              <label className="flex h-11 items-center gap-2.5 rounded-xl border border-hairline bg-surface px-3.5 focus-within:border-brand-400">
                <SearchIcon width={18} height={18} className="shrink-0 text-ink-faint" />
                <span className="sr-only">Search products</span>
                <input
                  id="pos-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search product"
                  className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="shrink-0 text-ink-faint hover:text-ink-soft"
                  >
                    <CloseIcon width={16} height={16} />
                  </button>
                )}
              </label>

              <div className="mb-3 mt-3 flex items-baseline justify-between gap-3">
                <h2 className="text-base font-semibold text-ink">
                  {query ? 'Search results' : 'Explore Products'}
                </h2>
                <p className="nums shrink-0 text-xs text-ink-faint">
                  Showing {visible.length} item{visible.length === 1 ? '' : 's'}
                  {query && ' · all categories'}
                </p>
              </div>

              {/* Category chips replace the rail on phones */}
              <div className="-mx-4 mb-3 overflow-x-auto px-4 md:hidden">
                <div className="flex w-max gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                        categoryId === c.id
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-hairline bg-surface text-ink-soft'
                      }`}
                    >
                      <span aria-hidden="true">{c.thumb}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 sm:px-5">
              {visible.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {visible.map((item) => (
                    <ProductCard key={item.id} item={item} qty={qtyOf(item.id)} onAdd={() => addItem(item)} onChange={changeQty} />
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-hairline py-12 text-center text-base text-ink-faint">
                  No products match “{query}”.
                </p>
              )}
            </div>
          </section>

          {/* Cart lives inline from large screens up, as a sheet below that */}
          <CartPanel
            cart={cart}
            total={total}
            itemCount={itemCount}
            onChangeQty={changeQty}
            onClear={() => setCart([])}
            onGenerate={() => navigate('/payment')}
            className="hidden w-80 shrink-0 lg:flex"
          />
        </div>
      </AppShell>

      {cartOpen && (
        <>
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80dvh] flex-col rounded-t-2xl bg-surface shadow-2xl lg:hidden">
            <div className="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-3">
              <h2 className="text-base font-semibold text-ink">Current Cart</h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-canvas"
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <CartPanel
              cart={cart}
              total={total}
              itemCount={itemCount}
              onChangeQty={changeQty}
              onClear={() => setCart([])}
              onGenerate={() => navigate('/payment')}
              className="flex min-h-0 flex-1"
              bare
            />
          </div>
        </>
      )}

      <AiChatDock
        agentName="Sales & Billing AI"
        tone="leaf"
        launcherLabel="Ask AI"
        openingTurns={[
          { id: 't1', from: 'user', text: salesSession.customerLine },
          { id: 't2', from: 'agent', text: salesSession.agentLine },
        ]}
      />
    </>
  )
}

/** Vertical category rail with thumbnails, tablet and up. */
function CategoryRail({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <nav
      aria-label="Categories"
      className="hidden w-24 shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-hairline bg-surface px-2 py-4 md:flex"
    >
      {categories.map((c) => {
        const active = selected === c.id
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            aria-pressed={active}
            className={`flex flex-col items-center gap-1 rounded-xl border px-1.5 py-2.5 transition-colors ${
              active ? 'border-brand-500 bg-brand-50' : 'border-transparent hover:bg-canvas'
            }`}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-lg border text-xl ${
                active ? 'border-brand-200 bg-surface' : 'border-hairline bg-canvas'
              }`}
              aria-hidden="true"
            >
              {c.thumb}
            </span>
            <span
              className={`text-center text-2xs font-medium leading-tight ${active ? 'text-brand-600' : 'text-ink-soft'}`}
            >
              {c.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

/** Image-led product tile. One tap adds; tapping again steps the quantity. */
function ProductCard({
  item,
  qty,
  onAdd,
  onChange,
}: {
  item: CatalogItem
  qty: number
  onAdd: () => void
  onChange: (id: string, delta: number) => void
}) {
  const inCart = qty > 0
  const low = item.stockLeft <= 5

  return (
    <div
      className={`flex flex-col rounded-xl border bg-surface p-2.5 transition-colors ${
        inCart ? 'border-brand-400 ring-1 ring-brand-200' : 'border-hairline'
      }`}
    >
      <button
        type="button"
        onClick={onAdd}
        className="flex flex-1 flex-col items-center gap-2 text-center"
        aria-label={`Add ${item.name}`}
      >
        <span className="relative flex aspect-square w-full items-center justify-center rounded-lg bg-canvas text-4xl">
          <span aria-hidden="true">{item.thumb}</span>
          {inCart && (
            <span className="nums absolute right-1 top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-500 px-1 text-xs font-bold text-white">
              {qty}
            </span>
          )}
        </span>

        <span className="w-full">
          {/* Full name, never clamped — a half-shown product name is unusable at the till */}
          <span className="block text-sm font-medium leading-snug text-ink">{item.name}</span>
          <span className="mt-0.5 block text-2xs text-ink-faint">{item.packSize}</span>
        </span>

        <span className="flex w-full items-baseline justify-center gap-1.5">
          <span className="nums text-base font-bold text-ink">₹{item.price}</span>
          {item.mrp && item.mrp > item.price && (
            <span className="nums text-xs text-ink-faint line-through">₹{item.mrp}</span>
          )}
        </span>

        {low && <span className="nums text-2xs font-medium text-bad">Only {item.stockLeft} left</span>}
      </button>

      {inCart ? (
        <div className="mt-2 flex items-center justify-between gap-1 rounded-lg bg-brand-50 p-1">
          <button
            type="button"
            onClick={() => onChange(item.id, -1)}
            aria-label={`Remove one ${item.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-surface text-brand-600"
          >
            <MinusIcon width={15} height={15} />
          </button>
          <span className="nums text-base font-bold text-brand-700">{qty}</span>
          <button
            type="button"
            onClick={() => onChange(item.id, 1)}
            aria-label={`Add one ${item.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-surface text-brand-600"
          >
            <PlusIcon width={15} height={15} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-lg border border-brand-200 bg-brand-50 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-100"
        >
          <PlusIcon width={15} height={15} />
          ADD
        </button>
      )}
    </div>
  )
}

function CartPanel({
  cart,
  total,
  itemCount,
  onChangeQty,
  onClear,
  onGenerate,
  className = '',
  bare = false,
}: {
  cart: CartItem[]
  total: number
  itemCount: number
  onChangeQty: (id: string, delta: number) => void
  onClear: () => void
  onGenerate: () => void
  className?: string
  bare?: boolean
}) {
  return (
    <aside className={`flex-col overflow-hidden bg-surface ${bare ? '' : 'border-l border-hairline'} ${className}`}>
      {!bare && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-hairline px-4 py-3">
          <h2 className="text-base font-semibold text-ink">Current Cart</h2>
          <span className="nums text-sm text-ink-faint">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-3">
        {cart.length > 0 ? (
          cart.map((item) => (
            <div key={item.productId} className="flex items-center gap-2.5 border-b border-hairline py-2.5 last:border-0">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline bg-canvas text-lg"
                aria-hidden="true"
              >
                {item.thumb}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-ink">{item.name}</p>
                <p className="nums text-xs text-ink-faint">₹{item.unitPrice} each</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChangeQty(item.productId, -1)}
                  aria-label={`Remove one ${item.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline text-ink-soft"
                >
                  <MinusIcon width={13} height={13} />
                </button>
                <span className="nums w-5 text-center text-sm font-semibold text-ink">{item.qty}</span>
                <button
                  type="button"
                  onClick={() => onChangeQty(item.productId, 1)}
                  aria-label={`Add one ${item.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline text-ink-soft"
                >
                  <PlusIcon width={13} height={13} />
                </button>
              </div>
              <span className="nums w-12 shrink-0 text-right text-sm font-semibold text-ink">
                ₹{item.unitPrice * item.qty}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <CartIcon width={26} height={26} className="text-ink-faint" />
            <p className="text-base font-medium text-ink-soft">Cart is empty</p>
            <p className="max-w-[14rem] text-sm text-ink-faint">Tap a product to add it, or ask the AI to build the bill.</p>
          </div>
        )}
      </div>

      <div className="safe-bottom shrink-0 space-y-2.5 border-t border-hairline px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-ink">Total</span>
          <span className="nums text-xl font-bold text-ink">₹{total}</span>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={cart.length === 0}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-base font-semibold text-white transition-opacity disabled:opacity-40"
        >
          <CheckIcon width={18} height={18} />
          Generate Bill
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={cart.length === 0}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-hairline text-sm font-medium text-ink-soft transition-colors hover:bg-canvas disabled:opacity-40"
        >
          <TrashIcon width={15} height={15} />
          Clear Cart
        </button>
      </div>
    </aside>
  )
}
