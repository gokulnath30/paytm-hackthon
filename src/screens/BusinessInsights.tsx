import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EmptyState, ErrorState, Skeleton, StatTile, Thumb } from '../components/ui'
import { AlertIcon, ChevronDownIcon } from '../components/icons'
import { insightsTabs } from '../lib/mockData'
import { getSummary } from '../lib/api'
import type { InsightsRange } from '../lib/api'
import { thumbFor } from '../lib/api/map'
import { count, direction, inr, percent } from '../lib/format'
import { useResource } from '../lib/useResource'

/** The chip the shopkeeper taps, and the window it means. */
const RANGES: Array<{ id: InsightsRange; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
]

export default function BusinessInsights() {
  const navigate = useNavigate()
  const [range, setRange] = useState<InsightsRange>('today')
  const [tab, setTab] = useState(insightsTabs[0])

  const summary = useResource(() => getSummary(range), [range])
  const data = summary.data

  return (
    <AppShell
      title="Business Insights"
      width="wide"
      headerRight={
        <label className="relative flex shrink-0 items-center">
          <span className="sr-only">Date range</span>
          <select
            id="insights-range"
            value={range}
            onChange={(e) => setRange(e.target.value as InsightsRange)}
            className="appearance-none rounded-full border border-hairline bg-surface py-2 pl-3.5 pr-8 text-sm font-medium text-ink-soft outline-none focus:border-brand-400"
          >
            {RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            width={15}
            height={15}
            className="pointer-events-none absolute right-3 text-ink-faint"
          />
        </label>
      }
    >
      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2">
          {insightsTabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                tab === t
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-hairline bg-surface text-ink-soft hover:border-brand-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {summary.error && (
        <div className="mb-5">
          <ErrorState message={summary.error} onRetry={summary.reload} />
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {data ? (
          <>
            <StatTile
              label="Total Sales"
              value={inr(data.revenue)}
              delta={percent(data.trend?.revenue)}
              trend={direction(data.trend?.revenue)}
            />
            <StatTile
              label="Est. Profit"
              value={inr(data.profit)}
              delta={percent(data.trend?.profit)}
              trend={direction(data.trend?.profit)}
            />
            <StatTile
              label="Customers"
              value={count(data.customers)}
              delta={percent(data.trend?.customers)}
              trend={direction(data.trend?.customers)}
            />
            <StatTile
              label="Items Sold"
              value={count(data.itemsSold)}
              delta={percent(data.trend?.itemsSold)}
              trend={direction(data.trend?.itemsSold)}
            />
          </>
        ) : (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[5.5rem] w-full" />)
        )}
      </div>

      <section className="mb-5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">Top Selling Products</h2>
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="shrink-0 text-sm font-semibold text-brand-600 hover:underline"
          >
            View All
          </button>
        </div>

        {data && data.topSelling.length === 0 ? (
          <EmptyState>No sales recorded in this period yet.</EmptyState>
        ) : (
          <div className="rounded-xl border border-hairline bg-surface px-4">
            {(data?.topSelling ?? []).map((p, i) => (
              <button
                key={p.productId}
                type="button"
                onClick={() => navigate(`/product/${p.productId}`)}
                className="flex w-full items-center gap-3 border-b border-hairline py-3 text-left last:border-0"
              >
                <span className="nums w-4 shrink-0 text-sm font-semibold text-ink-faint">{i + 1}</span>
                <Thumb emoji={thumbFor(p.name)} size="sm" />
                <p className="min-w-0 flex-1 text-base font-medium leading-snug text-ink">{p.name}</p>
                <p className="nums shrink-0 text-sm text-ink-soft">{p.units} units</p>
              </button>
            ))}
            {!data && <Skeleton className="my-3 h-12 w-full" />}
          </div>
        )}
      </section>

      {data && data.lowStockCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-bad/20 bg-bad-bg px-4 py-3.5">
          <AlertIcon width={20} height={20} className="shrink-0 text-bad" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-bad">Low Stock Alert</p>
            <p className="truncate text-sm text-bad/80">
              {data.lowStockCount} product{data.lowStockCount === 1 ? ' is' : 's are'} running low.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="shrink-0 rounded-full bg-bad px-3.5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            View
          </button>
        </div>
      )}
    </AppShell>
  )
}
