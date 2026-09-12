import type { CartItem, CatalogItem, Category, Product } from '../mockData'
import { summarise } from './analytics'
import { backendRepository } from './backend'
import { dataMode } from './config'
import { firebaseRepository } from './firebase'
import { ApiError } from './http'
import { productIdFor } from './ids'
import { toCart, toCatalogItem, toCategories, toOrderItems, toProduct, toProductRecord } from './map'
import { mockRepository } from './mock'
import type { Repository } from './repository'
import type { AgentReply, ApprovalRecord, DashboardSummary, InsightsRange, OrderRecord } from './types'
import { sendChat as sendToAgent } from './agent'

/**
 * The only module the screens import. Everything below it — transports,
 * mapping, rollups — is an implementation detail, which is what lets the same
 * components run on mock data, a backend proxy, or Firebase directly.
 */

const repo: Repository =
  dataMode === 'proxy' ? backendRepository : dataMode === 'direct' ? firebaseRepository : mockRepository

export { ApiError } from './http'
export { agentEnabled, dataMode, isLive, storeName } from './config'
export type { DashboardSummary, InsightsRange, OrderRecord } from './types'

/* ---------- catalogue ---------- */

export async function getProducts(): Promise<Product[]> {
  const records = await repo.listProducts()
  return records.map(toProduct).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getProduct(productId: string): Promise<Product | null> {
  const record = await repo.getProduct(productId)
  return record ? toProduct(record) : null
}

export async function getCatalog(): Promise<{ items: CatalogItem[]; categories: Category[] }> {
  const records = await repo.listProducts()
  return {
    items: records.map(toCatalogItem).sort((a, b) => a.name.localeCompare(b.name)),
    categories: toCategories(records),
  }
}

/** Counts for the Inventory filter chips, from the rows actually loaded. */
export function filterCounts(products: Product[]) {
  const count = (state: Product['state']) => products.filter((p) => p.state === state).length
  return [
    { id: 'all', label: 'All', count: products.length },
    { id: 'in-stock', label: 'In Stock', count: count('in-stock') },
    { id: 'low', label: 'Low Stock', count: count('low') },
    { id: 'out', label: 'Out of Stock', count: count('out') },
  ]
}

export async function addProduct(draft: {
  name: string
  brand?: string
  category?: string
  packSize?: string
  purchasePrice: number
  sellingPrice: number
  stock: number
  minStock?: number
  supplier?: string
}): Promise<Product> {
  const existing = await repo.listProducts()
  const record = toProductRecord({ ...draft, productId: productIdFor(draft.name, existing.map((p) => p.product_id)) })
  return toProduct(await repo.saveProduct(record))
}

/* ---------- rollups ---------- */

export async function getSummary(range: InsightsRange = 'today'): Promise<DashboardSummary> {
  try {
    if (range === 'today' && repo.getDashboard) return await repo.getDashboard()
    if (range !== 'today' && repo.getInsights) return await repo.getInsights(range)
  } catch (error) {
    // A backend that hasn't built the rollup endpoints yet still has the raw
    // collections — fall through and do the arithmetic here.
    if (!(error instanceof ApiError && error.status === 404)) throw error
  }

  const [sales, products, sessions] = await Promise.all([
    repo.listSales(),
    repo.listProducts(),
    repo.listSessions(),
  ])
  return summarise(range, { sales, products, sessions })
}

export function getApprovals(): Promise<ApprovalRecord[]> {
  return repo.listApprovals()
}

/* ---------- the counter ----------
 * One customer, one session id, every order in that visit tagged with it —
 * which is what keeps two shoppers from sharing a basket. */

const SESSION_KEY = 'paybasket.session'

export async function currentSessionId(): Promise<string> {
  const stored = sessionStorage.getItem(SESSION_KEY)
  if (stored) return stored

  const session = await repo.openSession()
  sessionStorage.setItem(SESSION_KEY, session.session_id)
  return session.session_id
}

/** Call when a sale finishes: the next customer gets their own basket. */
export function endSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export async function createBill(cart: CartItem[]): Promise<OrderRecord> {
  if (cart.length === 0) throw new ApiError('Add at least one item before generating a bill.')
  return repo.createOrder({ sessionId: await currentSessionId(), items: toOrderItems(cart) })
}

export function getOrder(orderId: string): Promise<OrderRecord | null> {
  return repo.getOrder(orderId)
}

export const orderToCart = toCart

/**
 * Records the money and runs step 06 — stock cut, sale rows, order COMPLETED.
 * Against a deployed graph the assistant owns that step and the proxy simply
 * forwards; the local transports stand in for it.
 */
export async function confirmPayment(order: OrderRecord, reference?: string): Promise<OrderRecord> {
  await repo.recordPayment({ orderId: order.order_id, amount: order.total_amount, reference })
  return repo.completeOrder(order.order_id)
}

export { chatAvailable } from './agent'

/**
 * One turn of conversation. The session id is attached here rather than by the
 * caller, so every message in a visit carries the same one and the agent keeps
 * the basket straight.
 */
export async function sendChat(input: { message: string; role: 'owner' | 'customer' }): Promise<AgentReply> {
  return sendToAgent({ ...input, sessionId: await currentSessionId() })
}
