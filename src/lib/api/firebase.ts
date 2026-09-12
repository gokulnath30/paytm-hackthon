import { firebaseSecret, firebaseUrl } from './config'
import { ApiError, jsonBody, request, toList } from './http'
import { movementId, nowIso, orderId, paymentId, round2, saleId, sessionId } from './ids'
import type { Repository } from './repository'
import type {
  ApprovalRecord,
  MovementRecord,
  OrderItemRecord,
  OrderRecord,
  PaymentRecord,
  ProductRecord,
  SaleRecord,
  SessionRecord,
} from './types'

/**
 * Realtime Database REST transport — every path ends in `.json` and carries the
 * database secret as `?auth=`. Demo only; see config.ts for why.
 */

const path = (segment: string) =>
  `${firebaseUrl}/${segment}.json${firebaseSecret ? `?auth=${encodeURIComponent(firebaseSecret)}` : ''}`

const read = <T>(segment: string) => request<T | null>(path(segment))
const put = <T>(segment: string, value: T) => request<T>(path(segment), { method: 'PUT', ...jsonBody(value) })
const patch = <T extends object>(segment: string, value: T) =>
  request<T>(path(segment), { method: 'PATCH', ...jsonBody(value) })

/** Writing null deletes the key, so drop empties instead of sending them. */
function compact<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== '')) as T
}

async function fetchProduct(productId: string): Promise<ProductRecord | null> {
  return (await read<ProductRecord>(`products/${productId}`)) ?? null
}

async function fetchOrder(id: string): Promise<OrderRecord | null> {
  const record = await read<OrderRecord>(`orders/${id}`)
  // Firebase drops empty arrays, so an order read back can arrive without items.
  return record ? { ...record, items: toList<OrderItemRecord>(record.items) } : null
}

export const firebaseRepository: Repository = {
  async listProducts() {
    return toList<ProductRecord>(await read<Record<string, ProductRecord>>('products'))
  },

  getProduct(productId) {
    return fetchProduct(productId)
  },

  async saveProduct(record) {
    const body = compact({ ...record, created_at: record.created_at ?? nowIso(), updated_at: nowIso() })
    await put(`products/${record.product_id}`, body)
    return body
  },

  async listSales() {
    return toList<SaleRecord>(await read<Record<string, SaleRecord>>('sales'))
  },

  async listSessions() {
    return toList<SessionRecord>(await read<Record<string, SessionRecord>>('customer_sessions'))
  },

  async listApprovals() {
    return toList<ApprovalRecord>(await read<Record<string, ApprovalRecord>>('approvals'))
  },

  async openSession() {
    const record: SessionRecord = {
      session_id: sessionId(),
      session_status: 'active',
      session_start_time: nowIso(),
    }
    await put(`customer_sessions/${record.session_id}`, record)
    return record
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
    await put(`orders/${record.order_id}`, record)
    return record
  },

  getOrder(id) {
    return fetchOrder(id)
  },

  async recordPayment({ orderId: id, amount, reference }) {
    const record: PaymentRecord = compact({
      payment_id: paymentId(),
      order_id: id,
      amount: round2(amount),
      payment_status: 'completed',
      transaction_reference: reference,
      timestamp: nowIso(),
    })
    await put(`payments/${record.payment_id}`, record)
    await patch(`orders/${id}`, { status: 'PAYMENT_RECEIVED', updated_at: nowIso() })
    return record
  },

  async completeOrder(id) {
    const order = await fetchOrder(id)
    if (!order) throw new ApiError(`Order ${id} not found.`, 404)
    if (order.status === 'COMPLETED') return order

    await patch(`orders/${id}`, { status: 'RECONCILED', updated_at: nowIso() })

    // Stock is not auto-derived: the movement, the sale row and the stock cut
    // are three separate writes, and a caller that skips one leaves the ledger
    // drifting. Guide § Inventory movements.
    for (const item of order.items) {
      const product = await fetchProduct(item.product_id)
      const purchasePrice = product?.purchase_price ?? 0
      const sale: SaleRecord = {
        sale_id: saleId(),
        order_id: order.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        selling_price: item.selling_price,
        purchase_price: purchasePrice,
        revenue: round2(item.selling_price * item.quantity),
        profit: round2((item.selling_price - purchasePrice) * item.quantity),
        timestamp: nowIso(),
      }
      await put(`sales/${sale.sale_id}`, sale)

      const movement: MovementRecord = compact({
        movement_id: movementId(),
        product_id: item.product_id,
        type: 'sale',
        quantity: -item.quantity,
        reason: `Sold on order ${order.order_id}`,
        reference_id: order.order_id,
        timestamp: nowIso(),
      })
      await put(`inventory_movements/${movement.movement_id}`, movement)

      if (product) {
        await patch(`products/${item.product_id}`, {
          current_stock: Math.max(0, product.current_stock - item.quantity),
          updated_at: nowIso(),
        })
      }
    }

    const completed: OrderRecord = { ...order, status: 'COMPLETED', updated_at: nowIso() }
    await patch(`orders/${id}`, { status: 'COMPLETED', updated_at: completed.updated_at })
    return completed
  },
}
