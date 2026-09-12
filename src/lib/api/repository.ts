import type {
  ApprovalRecord,
  DashboardSummary,
  InsightsRange,
  OrderItemRecord,
  OrderRecord,
  PaymentRecord,
  ProductRecord,
  SaleRecord,
  SessionRecord,
} from './types'

/**
 * One interface, three implementations (backend proxy, direct Firebase, mock).
 * Everything above this line — screens, hooks, analytics — is written against
 * the interface and never learns which transport it got.
 */
export interface Repository {
  listProducts(): Promise<ProductRecord[]>
  getProduct(productId: string): Promise<ProductRecord | null>
  saveProduct(record: ProductRecord): Promise<ProductRecord>

  listSales(): Promise<SaleRecord[]>
  listSessions(): Promise<SessionRecord[]>
  listApprovals(): Promise<ApprovalRecord[]>

  openSession(): Promise<SessionRecord>
  createOrder(input: { sessionId: string; items: OrderItemRecord[] }): Promise<OrderRecord>
  getOrder(orderId: string): Promise<OrderRecord | null>
  recordPayment(input: { orderId: string; amount: number; reference?: string }): Promise<PaymentRecord>

  /**
   * Step 06 of the lifecycle: stock cut, sale rows written, order COMPLETED.
   * Owned by the assistant once the graph is deployed — the proxy forwards to
   * it, and the other transports stand in for it so the demo can finish a sale.
   */
  completeOrder(orderId: string): Promise<OrderRecord>

  /** Optional server-side rollups. Derived client-side when absent. */
  getDashboard?(): Promise<DashboardSummary>
  getInsights?(range: InsightsRange): Promise<DashboardSummary>
}
