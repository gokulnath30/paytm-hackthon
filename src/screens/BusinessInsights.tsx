import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { StatTile, Thumb } from '../components/ui'
import { AlertIcon, ChevronDownIcon } from '../components/icons'
import { insightsRanges, insightsStats, insightsTabs, lowStockAlert, topSelling } from '../lib/mockData'

export default function BusinessInsights() {
  const navigate = useNavigate()
  const [range, setRange] = useState(insightsRanges[0])
  const [tab, setTab] = useState(insightsTabs[0])

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
            onChange={(e) => setRange(e.target.value)}
            className="appearance-none rounded-full border border-hairline bg-surface py-2 pl-3.5 pr-8 text-sm font-medium text-ink-soft outline-none focus:border-brand-400"
          >
            {insightsRanges.map((r) => (
              <option key={r}>{r}</option>
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

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {insightsStats.map((s) => (
          <StatTile key={s.id} label={s.label} value={s.value} delta={s.delta} />
        ))}
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

        <div className="rounded-xl border border-hairline bg-surface px-4">
          {topSelling.map((p) => (
            <div key={p.rank} className="flex items-center gap-3 border-b border-hairline py-3 last:border-0">
              <span className="nums w-4 shrink-0 text-sm font-semibold text-ink-faint">{p.rank}</span>
              <Thumb emoji={p.thumb} size="sm" />
              <p className="min-w-0 flex-1 text-base font-medium leading-snug text-ink">{p.name}</p>
              <p className="nums shrink-0 text-sm text-ink-soft">{p.units} units</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3 rounded-xl border border-bad/20 bg-bad-bg px-4 py-3.5">
        <AlertIcon width={20} height={20} className="shrink-0 text-bad" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-bad">{lowStockAlert.title}</p>
          <p className="truncate text-sm text-bad/80">{lowStockAlert.body}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="shrink-0 rounded-full bg-bad px-3.5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          View
        </button>
      </div>
    </AppShell>
  )
}
