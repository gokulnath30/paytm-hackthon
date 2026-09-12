import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Button, Thumb } from '../components/ui'
import { DotsIcon, FilterIcon, PlusIcon, SearchIcon } from '../components/icons'
import { inventoryFilters, products } from '../lib/mockData'

export default function Inventory() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const visible = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.trim().toLowerCase())
    const matchesFilter =
      filter === 'all' ||
      (filter === 'in-stock' && p.state === 'in-stock') ||
      (filter === 'low' && p.state === 'low') ||
      (filter === 'out' && p.state === 'out')
    return matchesQuery && matchesFilter
  })

  return (
    <AppShell
      title="Inventory"
      showBack={false}
      width="wide"
      footer={
        <Button icon={PlusIcon} className="w-full" onClick={() => navigate('/add-product')}>
          Add New Product
        </Button>
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-hairline bg-surface px-3.5 focus-within:border-brand-400">
          <SearchIcon width={18} height={18} className="shrink-0 text-ink-faint" />
          <span className="sr-only">Search products</span>
          <input
            id="inventory-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
          />
        </label>
        <button
          type="button"
          aria-label="Filter products"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-hairline bg-surface text-ink-soft transition-colors hover:bg-canvas"
        >
          <FilterIcon width={18} height={18} />
        </button>
      </div>

      <div className="-mx-4 mb-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2">
          {inventoryFilters.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-hairline bg-surface text-ink-soft hover:border-brand-300'
                }`}
              >
                {f.label}
                {f.count !== null && <span className="nums"> ({f.count})</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-2.5 lg:grid-cols-2">
        {visible.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-hairline bg-surface p-3 transition-colors hover:border-brand-200"
          >
            <button
              type="button"
              onClick={() => navigate(`/product/${p.id}`)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <Thumb emoji={p.thumb} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-medium text-ink">{p.name}</span>
                <span className="block text-sm text-ink-soft">{p.packSize}</span>
              </span>
              <span className="shrink-0 text-right">
                <span
                  className={`nums block rounded-full px-2 py-0.5 text-sm font-semibold ${
                    p.state === 'low' ? 'bg-bad-bg text-bad' : 'text-ink'
                  }`}
                >
                  {p.stock}
                </span>
                {p.state !== 'low' && <span className="nums block text-sm text-ink-soft">₹{p.sellingPrice}</span>}
              </span>
            </button>
            <button
              type="button"
              aria-label={`Options for ${p.name}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-canvas"
            >
              <DotsIcon width={18} height={18} />
            </button>
          </div>
        ))}

        {visible.length === 0 && (
          <p className="rounded-xl border border-dashed border-hairline py-10 text-center text-base text-ink-faint">
            No products match that search.
          </p>
        )}
      </div>
    </AppShell>
  )
}
