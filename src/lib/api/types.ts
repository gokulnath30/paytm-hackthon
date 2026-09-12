/**
 * The seven PayBasket collections, typed exactly as they are stored in the
 * Firebase Realtime Database — snake_case keys, ISO-8601 UTC timestamps.
 *
 * Source: PayBasket Integration Guide (rev 12 Sep 2026). Keep these names in
 * step with the database; the UI-facing shapes live in `../mockData.ts` and the
 * translation between the two is in `map.ts`.
 */

export interface ProductRecord {
  product_id: string
  name: string
  purchase_price: number
  selling_price: number
  current_stock: number
  minimum_stock?: number | null
  brand?: string | null
  category?: string | null
  pack_size?: string | null
  /** Absolute URL, safe for an <img> src. Often null. */
  image?: string | null
  supplier?: string | null
  created_at?: string | null
  updated_at?: string | null
}

/** Append-only audit trail. `quantity` is signed: positive adds, negative removes. */
export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'damage' | 'expiry' | 'return' | 'waste'

export interface MovementRecord {
  movement_id: string
  product_id: string
  type: MovementType
  quantity: number
  reason: string
  /** Order or payment id. Omit the key entirely rather than sending "". */
  reference_id?: string
  timestamp?: string | null
}

export type SessionStatus = 'active' | 'completed' | 'cancelled'

export interface SessionRecord {
  session_id: string
  session_status: SessionStatus
  session_start_time?: string | null
}

/** The normal path runs 01→06; the exception states break out of it. */
export type OrderStatus =
  | 'NEW'
  | 'CART_CREATED'
  | 'WAITING_FOR_PAYMENT'
  | 'PAYMENT_RECEIVED'
  | 'RECONCILED'
  | 'COMPLETED'
  | 'NEEDS_CLARIFICATION'
  | 'PAYMENT_MISMATCH'
  | 'UNMATCHED_PAYMENT'
  | 'NEEDS_OWNER_APPROVAL'
  | 'CANCELLED'
  | 'REFUNDED'

export interface OrderItemRecord {
  product_id: string
  name: string
  quantity: number
  selling_price: number
  line_total: number
}

export interface OrderRecord {
  order_id: string
  session_id: string
  items: OrderItemRecord[]
  total_amount: number
  status: OrderStatus
  created_at?: string | null
  updated_at?: string | null
}

export type PaymentStatus = 'pending' | 'completed' | 'failed'

export interface PaymentRecord {
  payment_id: string
  /** null means unmatched — a payment arrived with no order to attach it to. */
  order_id: string | null
  amount: number
  payment_status: PaymentStatus
  transaction_reference?: string
  timestamp?: string | null
}

export interface SaleRecord {
  sale_id: string
  order_id: string | null
  product_id: string
  quantity: number
  selling_price: number
  purchase_price: number
  revenue: number
  profit: number
  timestamp?: string | null
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalRecord {
  approval_id: string
  order_id: string | null
  /** Human-readable — render verbatim. */
  reason: string
  status: ApprovalStatus
  approved_by?: string
  timestamp?: string | null
}

/* ---------- derived shapes the screens ask for ---------- */

export interface DashboardSummary {
  revenue: number
  profit: number
  /** Distinct orders that reached COMPLETED in the window. */
  orders: number
  /** Customer sessions opened in the window. */
  customers: number
  itemsSold: number
  lowStockCount: number
  topSelling: Array<{ productId: string; name: string; units: number }>
  /** Percent change against the previous window of the same length, when there is one to compare with. */
  trend?: Partial<Record<'revenue' | 'profit' | 'customers' | 'itemsSold', number>>
}

export type InsightsRange = 'today' | 'week' | 'month'

/** What the assistant sends back for one chat turn. */
export interface AgentReply {
  text: string
  bullets?: string[]
  /** Present when the turn produced or advanced an order. */
  orderId?: string
  sessionId?: string
}

export interface ChatRequest {
  message: string
  sessionId: string
  role: 'owner' | 'customer'
}
