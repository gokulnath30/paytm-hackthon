import type { DashboardSummary, InsightsRange, ProductRecord, SaleRecord, SessionRecord } from './types'
import { round2 } from './ids'

/**
 * Realtime Database has no WHERE and can't compare two fields server-side, so
 * every rollup is computed here from whole collections. Correct at kirana
 * volumes — worth revisiting once a collection runs to tens of thousands of rows.
 */

const DAYS: Record<InsightsRange, number> = { today: 1, week: 7, month: 30 }

/**
 * The window as ISO-8601 UTC strings, so bounds compare directly against stored
 * timestamps — plus the equal-length window before it, which is what the trend
 * chips measure against.
 *
 * The boundary is local midnight, not the UTC one: in IST those are five and a
 * half hours apart, and a shopkeeper's "today" starts when the shutter goes up.
 */
export function windowBounds(range: InsightsRange, now = new Date()): { from: string; previousFrom: string } {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (DAYS[range] - 1))

  const previous = new Date(start)
  previous.setDate(previous.getDate() - DAYS[range])

  return { from: start.toISOString(), previousFrom: previous.toISOString() }
}

const within = (timestamp: string | null | undefined, from: string, until?: string) =>
  Boolean(timestamp) && timestamp! >= from && (until === undefined || timestamp! < until)

/** Percent change, left undefined when there is no baseline to divide by. */
const change = (current: number, previous: number) =>
  previous > 0 ? Math.round(((current - previous) / previous) * 100) : undefined

export function lowStockOf(products: ProductRecord[]): ProductRecord[] {
  return products.filter((p) => p.current_stock <= (p.minimum_stock ?? Math.max(1, Math.round(p.current_stock * 0.2))))
}

export function summarise(
  range: InsightsRange,
  data: { sales: SaleRecord[]; products: ProductRecord[]; sessions: SessionRecord[] },
): DashboardSummary {
  const { from, previousFrom } = windowBounds(range)
  const sales = data.sales.filter((s) => within(s.timestamp, from))
  const before = data.sales.filter((s) => within(s.timestamp, previousFrom, from))

  const units = new Map<string, number>()
  for (const sale of sales) units.set(sale.product_id, (units.get(sale.product_id) ?? 0) + sale.quantity)

  const nameOf = (productId: string) =>
    data.products.find((p) => p.product_id === productId)?.name ?? productId

  const revenueOf = (rows: SaleRecord[]) =>
    round2(rows.reduce((total, s) => total + (s.revenue ?? s.selling_price * s.quantity), 0))
  const profitOf = (rows: SaleRecord[]) =>
    round2(rows.reduce((total, s) => total + (s.profit ?? (s.selling_price - s.purchase_price) * s.quantity), 0))
  const unitsOf = (rows: SaleRecord[]) => rows.reduce((total, s) => total + s.quantity, 0)

  const revenue = revenueOf(sales)
  const profit = profitOf(sales)
  const itemsSold = unitsOf(sales)
  const customers = data.sessions.filter((s) => within(s.session_start_time, from)).length
  const customersBefore = data.sessions.filter((s) => within(s.session_start_time, previousFrom, from)).length

  return {
    revenue,
    profit,
    orders: new Set(sales.map((s) => s.order_id).filter(Boolean)).size,
    customers,
    itemsSold,
    lowStockCount: lowStockOf(data.products).length,
    topSelling: [...units.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([productId, count]) => ({ productId, name: nameOf(productId), units: count })),
    trend: {
      revenue: change(revenue, revenueOf(before)),
      profit: change(profit, profitOf(before)),
      customers: change(customers, customersBefore),
      itemsSold: change(itemsSold, unitsOf(before)),
    },
  }
}
