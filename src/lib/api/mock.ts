import { catalog, categories, insightsStats, products as productDetails, topSelling } from '../mockData'
import { nowIso, orderId, paymentId, round2, sessionId } from './ids'
import type { Repository } from './repository'
import type { DashboardSummary, InsightsRange, OrderRecord, ProductRecord, SessionRecord } from './types'

/**
 * The prototype's own data, shaped as PayBasket records. With no API configured
 * the app looks exactly as it did before integration — and a sale still runs
 * end to end, against in-memory state that lives as long as the tab.
 */

const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? 'General'

/** Deterministic so `/product/:id` links stay stable across reloads. */
const mockProductId = (id: string) => `PROD-${id.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`

function seedProducts(): ProductRecord[] {
  return catalog.map((item) => {
    const detail = productDetails.find((p) => p.id === item.id)
    return {
      product_id: mockProductId(item.id),
      name: item.name,
      brand: detail?.brand ?? item.name.split(' ')[0],
      category: detail?.category ?? categoryLabel(item.categoryId),
      pack_size: item.packSize,
      image: null,
      purchase_price: detail?.purchasePrice ?? round2(item.price * 0.78),
      selling_price: item.price,
      current_stock: item.stockLeft,
      minimum_stock: detail?.minStock ?? Math.max(1, Math.round(item.stockLeft * 0.2)),
      supplier: detail?.supplier ?? 'Local Distributor',
      created_at: '2026-09-12T04:30:00.000Z',
      updated_at: '2026-09-12T04:30:00.000Z',
    }
  })
}

const state = {
  products: seedProducts(),
  sessions: [] as SessionRecord[],
  orders: new Map<string, OrderRecord>(),
}

const clone = <T>(value: T): T => structuredClone(value)

const delay = <T>(value: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), 120))

/** "₹5,420" → 5420 — the mock dashboard figures are authored as display strings. */
const figure = (id: string) => Number((insightsStats.find((s) => s.id === id)?.value ?? '0').replace(/[^\d.]/g, ''))

/** "12%" → 12 */
const delta = (id: string) => Number((insightsStats.find((s) => s.id === id)?.delta ?? '0').replace(/[^\d.]/g, ''))

function summary(): DashboardSummary {
  const lowStockCount = state.products.filter((p) => p.current_stock <= (p.minimum_stock ?? 0)).length
  return {
    revenue: figure('total-sales'),
    profit: figure('est-profit'),
    orders: figure('customers'),
    customers: figure('customers'),
    itemsSold: figure('items-sold'),
    lowStockCount,
    trend: {
      revenue: delta('total-sales'),
      profit: delta('est-profit'),
      customers: delta('customers'),
      itemsSold: delta('items-sold'),
    },
    topSelling: topSelling.map((t) => ({
      productId: mockProductId(catalog.find((c) => c.name === t.name)?.id ?? t.name),
      name: t.name,
      units: t.units,
    })),
  }
}

const SCALE: Record<InsightsRange, number> = { today: 1, week: 6.4, month: 26 }

export const mockRepository: Repository = {
  listProducts: () => delay(clone(state.products)),

  getProduct: (productId) => delay(clone(state.products.find((p) => p.product_id === productId) ?? null)),

  async saveProduct(record) {
    const next = { ...record, updated_at: nowIso(), created_at: record.created_at ?? nowIso() }
    const idx = state.products.findIndex((p) => p.product_id === record.product_id)
    if (idx >= 0) state.products[idx] = next
    else state.products.unshift(next)
    return delay(clone(next))
  },

  listSales: () => delay([]),
  listSessions: () => delay(clone(state.sessions)),
  listApprovals: () => delay([]),

  async openSession() {
    const record: SessionRecord = { session_id: sessionId(), session_status: 'active', session_start_time: nowIso() }
    state.sessions.push(record)
    return delay(clone(record))
  },

  async createOrder({ sessionId: session, items }) {
    const record: OrderRecord = {
      order_id: orderId(),
      session_id: session,
      items,
      total_amount: round2(items.reduce((sum, i) => sum + i.line_total, 0)),
      status: 'WAITING_FOR_PAYMENT',
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    state.orders.set(record.order_id, record)
    return delay(clone(record))
  },

  getOrder: (id) => delay(clone(state.orders.get(id) ?? null)),

  async recordPayment({ orderId: id, amount, reference }) {
    const order = state.orders.get(id)
    if (order) state.orders.set(id, { ...order, status: 'PAYMENT_RECEIVED', updated_at: nowIso() })
    return delay({
      payment_id: paymentId(),
      order_id: id,
      amount: round2(amount),
      payment_status: 'completed' as const,
      transaction_reference: reference,
      timestamp: nowIso(),
    })
  },

  async completeOrder(id) {
    const order = state.orders.get(id)
    if (!order) throw new Error(`Order ${id} not found.`)

    for (const item of order.items) {
      const product = state.products.find((p) => p.product_id === item.product_id)
      if (product) product.current_stock = Math.max(0, product.current_stock - item.quantity)
    }

    const completed: OrderRecord = { ...order, status: 'COMPLETED', updated_at: nowIso() }
    state.orders.set(id, completed)
    return delay(clone(completed))
  },

  getDashboard: () => delay(summary()),

  async getInsights(range) {
    const base = summary()
    const scale = SCALE[range] ?? 1
    return delay({
      ...base,
      revenue: Math.round(base.revenue * scale),
      profit: Math.round(base.profit * scale),
      orders: Math.round(base.orders * scale),
      customers: Math.round(base.customers * scale),
      itemsSold: Math.round(base.itemsSold * scale),
      topSelling: base.topSelling.map((t) => ({ ...t, units: Math.round(t.units * scale) })),
    })
  },
}
