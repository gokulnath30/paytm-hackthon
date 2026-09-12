import { apiBase } from './config'
import { jsonBody, request, toList } from './http'
import type { Repository } from './repository'
import type {
  ApprovalRecord,
  DashboardSummary,
  InsightsRange,
  OrderRecord,
  PaymentRecord,
  ProductRecord,
  SaleRecord,
  SessionRecord,
} from './types'

/**
 * The transport the Integration Guide recommends: a thin backend of your own
 * that holds FIREBASE_DB_SECRET and the agent key, and is where you enforce who
 * may do what. The endpoint list it expects is in the README.
 */

const url = (segment: string) => `${apiBase}${segment}`

export const backendRepository: Repository = {
  async listProducts() {
    return toList<ProductRecord>(await request(url('/api/products')))
  },

  async getProduct(productId) {
    return (await request<ProductRecord | null>(url(`/api/products/${encodeURIComponent(productId)}`))) ?? null
  },

  async saveProduct(record) {
    return request<ProductRecord>(url(`/api/products/${encodeURIComponent(record.product_id)}`), {
      method: 'PUT',
      ...jsonBody(record),
    })
  },

  async listSales() {
    return toList<SaleRecord>(await request(url('/api/sales')))
  },

  async listSessions() {
    return toList<SessionRecord>(await request(url('/api/sessions')))
  },

  async listApprovals() {
    return toList<ApprovalRecord>(await request(url('/api/approvals?status=pending')))
  },

  openSession() {
    return request<SessionRecord>(url('/api/sessions'), { method: 'POST', ...jsonBody({}) })
  },

  createOrder({ sessionId, items }) {
    return request<OrderRecord>(url('/api/orders'), {
      method: 'POST',
      ...jsonBody({ session_id: sessionId, items }),
    })
  },

  async getOrder(orderId) {
    const record = await request<OrderRecord | null>(url(`/api/orders/${encodeURIComponent(orderId)}`))
    return record ? { ...record, items: toList(record.items) } : null
  },

  recordPayment({ orderId, amount, reference }) {
    return request<PaymentRecord>(url('/api/payments'), {
      method: 'POST',
      ...jsonBody({ order_id: orderId, amount, transaction_reference: reference }),
    })
  },

  completeOrder(orderId) {
    return request<OrderRecord>(url(`/api/orders/${encodeURIComponent(orderId)}/complete`), {
      method: 'POST',
      ...jsonBody({}),
    })
  },

  getDashboard() {
    return request<DashboardSummary>(url('/api/dashboard/today'))
  },

  getInsights(range: InsightsRange) {
    return request<DashboardSummary>(url(`/api/insights?range=${range}`))
  },
}
