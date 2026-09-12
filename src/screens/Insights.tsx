import { useState } from 'react'
import { Screen } from '../components/Screen'
import { AppHeader } from '../components/AppHeader'
import { BottomNav } from '../components/BottomNav'
import { AlertIcon, BulbIcon } from '../components/icons'
import { getLowStock, getTopSellers, restockProduct } from '../lib/store'

const RANK_MEDALS = ['🥇', '🥈', '🥉']

export default function Insights() {
  const [lowStock, setLowStock] = useState(() => getLowStock(5))
  const [ordered, setOrdered] = useState<Record<string, boolean>>({})
  const topSellers = getTopSellers(7, 5)

  function orderNow(productId: string) {
    restockProduct(productId, 12)
    setOrdered((prev) => ({ ...prev, [productId]: true }))
    setTimeout(() => setLowStock(getLowStock(5)), 900)
  }

  const recommendation =
    lowStock.length > 0
      ? `Based on recent sales, you should order 10–12 packs of ${lowStock[0].name} by tomorrow.`
      : 'Stock levels look healthy — no urgent reorders needed right now.'

  return (
    <Screen>
      <AppHeader
        title="Insights"
        showBack={false}
        right={<span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-500">7 days</span>}
      />

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {lowStock.length > 0 && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-rose-600">
              <AlertIcon width={18} height={18} />
              Low Stock Alert
            </p>
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-[11px] font-semibold text-rose-500">
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-slate-900">{p.name}</p>
                    <p className="text-[12px] text-rose-500">{p.stock} left</p>
                  </div>
                  <button
                    type="button"
                    disabled={ordered[p.id]}
                    onClick={() => orderNow(p.id)}
                    className="shrink-0 rounded-full bg-rose-500 px-3.5 py-1.5 text-[12px] font-semibold text-white transition-opacity disabled:opacity-50"
                  >
                    {ordered[p.id] ? 'Ordered ✓' : 'Order Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-5">
          <p className="mb-3 text-[14px] font-semibold text-slate-700">Top Selling Products</p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {topSellers.length === 0 && <p className="px-4 py-6 text-center text-[13px] text-slate-400">No sales yet this week.</p>}
            {topSellers.map((item, idx) => (
              <div
                key={item.productId}
                className={`flex items-center gap-3 px-4 py-3 ${idx !== topSellers.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <span className="w-6 shrink-0 text-center text-[15px]">{RANK_MEDALS[idx] ?? idx + 1}</span>
                <span className="flex-1 truncate text-[14px] font-medium text-slate-900">{item.name}</span>
                <span className="text-[13px] text-slate-500">{item.qty} sold</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
          <p className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-brand-700">
            <BulbIcon width={18} height={18} />
            AI Recommendation
          </p>
          <p className="text-[13px] leading-relaxed text-brand-700">{recommendation}</p>
        </div>
      </div>

      <BottomNav />
    </Screen>
  )
}
